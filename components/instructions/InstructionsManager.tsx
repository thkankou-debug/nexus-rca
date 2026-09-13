"use client";

// ============================================================================
// INSTRUCTIONS (§10) — consignes descendantes avec accusés individuels et
// remontées d'avancement. Deux volets : « Reçues » (accuser, avancer,
// signaler un blocage) et « Émises » (suivi par destinataire, clôture).
// Quatre objets distincts (§10.1) : ceci n'est ni un message, ni une note,
// ni une tâche — c'est une décision à prendre en charge puis exécuter.
// ============================================================================

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  Megaphone,
  Plus,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export interface InstructionCore {
  id: string;
  reference: string;
  subject: string;
  body: string;
  priority: string;
  due_date: string | null;
  requires_ack: boolean;
  status: string;
  created_at: string;
}

export interface ReceivedInstruction {
  id: string; // recipient row id
  is_lead: boolean;
  acked_at: string | null;
  status: string;
  status_note: string | null;
  instructions: InstructionCore & {
    author_role: string;
    profiles: { nom: string; prenom: string | null } | null;
  };
}

export interface SentInstruction extends InstructionCore {
  closed_at: string | null;
  close_note: string | null;
  instruction_recipients: {
    id: string;
    recipient_id: string;
    is_lead: boolean;
    acked_at: string | null;
    status: string;
    status_note: string | null;
    profiles: { nom: string; prenom: string | null } | null;
  }[];
}

export interface StaffOption {
  id: string;
  nom: string;
  prenom: string | null;
  role: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  critique: "Critique",
};

const RECIPIENT_STATUS_LABELS: Record<string, string> = {
  recue: "Reçue",
  prise_en_charge: "Prise en charge",
  en_cours: "En cours",
  bloquee: "Bloquée",
  soumise: "Soumise au contrôle",
  terminee: "Terminée",
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function personName(p: { nom: string; prenom: string | null } | null): string {
  return p ? [p.prenom, p.nom].filter(Boolean).join(" ") : "—";
}

export function InstructionsManager({
  received,
  sent,
  canCreate,
  staff,
}: {
  received: ReceivedInstruction[];
  sent: SentInstruction[];
  canCreate: boolean;
  staff: StaffOption[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"recues" | "emises">(received.length > 0 || !canCreate ? "recues" : "emises");
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{
    title: string;
    placeholder: string;
    required: boolean;
    onConfirm: (note: string) => Promise<void>;
  } | null>(null);
  const [noteValue, setNoteValue] = useState("");

  async function call(url: string, body: unknown, okMsg: string) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      toast.error(json.error || "Échec de l'opération");
      return false;
    }
    toast.success(okMsg);
    router.refresh();
    return true;
  }

  async function ack(instructionId: string) {
    setBusy(instructionId);
    try {
      await call(`/api/instructions/${instructionId}/ack`, {}, "Réception accusée — prise en charge");
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(instructionId: string, status: string, note?: string) {
    setBusy(instructionId);
    try {
      await call(`/api/instructions/${instructionId}/status`, { status, note }, "Avancement transmis");
    } finally {
      setBusy(null);
    }
  }

  const openCount = useMemo(
    () => received.filter((r) => r.instructions.status === "envoyee" && r.status !== "terminee").length,
    [received]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-line">
          {(
            [
              ["recues", `Reçues (${openCount} actives)`],
              ["emises", `Émises (${sent.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-body-sm font-semibold transition-colors",
                tab === key ? "border-brand text-ink" : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Nouvelle instruction
          </button>
        )}
      </div>

      {tab === "recues" ? (
        received.length === 0 ? (
          <div className="rounded-sm border border-dashed border-line px-6 py-12 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
            <p className="mt-3 text-body-sm text-ink-muted">Aucune instruction reçue.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {received.map((r) => {
              const ins = r.instructions;
              const active = ins.status === "envoyee";
              const late = active && ins.due_date && ins.due_date < new Date().toISOString().split("T")[0];
              return (
                <li key={r.id} className="rounded-sm border border-line bg-surface-elevated p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-ink">
                        {ins.subject}
                        {r.is_lead && (
                          <span className="ml-2 rounded-sm border border-line px-1.5 py-0.5 text-caption font-semibold text-ink-muted">
                            Responsable principal
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-caption text-ink-muted">
                        {[
                          ins.reference,
                          `de ${personName(ins.profiles)} (${ins.author_role})`,
                          `priorité ${PRIORITY_LABELS[ins.priority] || ins.priority}`,
                          ins.due_date ? `échéance ${formatDate(ins.due_date)}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-sm border px-2 py-0.5 text-caption font-semibold",
                        late
                          ? "border-status-failure text-status-failure"
                          : r.status === "bloquee"
                          ? "border-status-waiting text-ink"
                          : "border-line text-ink-muted"
                      )}
                    >
                      {!active ? (ins.status === "cloturee" ? "Clôturée" : "Annulée") : RECIPIENT_STATUS_LABELS[r.status] || r.status}
                      {late && " · en retard"}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-body-sm text-ink">{ins.body}</p>
                  {r.status_note && (
                    <p className="mt-2 rounded-sm bg-surface-sunken px-3 py-2 text-caption text-ink-muted">
                      Ma dernière note : {r.status_note}
                    </p>
                  )}
                  {active && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                      {ins.requires_ack && !r.acked_at ? (
                        <button
                          type="button"
                          disabled={busy === ins.id}
                          onClick={() => ack(ins.id)}
                          className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-caption font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
                        >
                          {busy === ins.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Accuser réception
                        </button>
                      ) : (
                        <>
                          {r.status !== "en_cours" && r.status !== "terminee" && (
                            <ActionBtn label="Démarrer" onClick={() => setStatus(ins.id, "en_cours")} busy={busy === ins.id} />
                          )}
                          <ActionBtn
                            label="Signaler un blocage"
                            onClick={() => {
                              setNoteValue("");
                              setNoteModal({
                                title: "Signaler un blocage",
                                placeholder: "Cause, impact, action tentée, décision attendue…",
                                required: true,
                                onConfirm: async (note) => {
                                  await setStatus(ins.id, "bloquee", note);
                                },
                              });
                            }}
                            busy={busy === ins.id}
                          />
                          <ActionBtn
                            label="Soumettre au contrôle"
                            onClick={() => {
                              setNoteValue("");
                              setNoteModal({
                                title: "Soumettre au contrôle",
                                placeholder: "Preuve / compte-rendu de l'exécution (optionnel)…",
                                required: false,
                                onConfirm: async (note) => {
                                  await setStatus(ins.id, "soumise", note || undefined);
                                },
                              });
                            }}
                            busy={busy === ins.id}
                          />
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      ) : sent.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line px-6 py-12 text-center">
          <Send className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
          <p className="mt-3 text-body-sm text-ink-muted">
            {canCreate ? "Aucune instruction émise — utilisez « Nouvelle instruction »." : "Aucune instruction émise."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sent.map((ins) => {
            const active = ins.status === "envoyee";
            return (
              <li key={ins.id} className="rounded-sm border border-line bg-surface-elevated p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-ink">{ins.subject}</p>
                    <p className="mt-0.5 text-caption text-ink-muted">
                      {[
                        ins.reference,
                        `priorité ${PRIORITY_LABELS[ins.priority] || ins.priority}`,
                        ins.due_date ? `échéance ${formatDate(ins.due_date)}` : null,
                        formatDate(ins.created_at),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                    {ins.status === "envoyee" ? "En cours" : ins.status === "cloturee" ? "Clôturée" : "Annulée"}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                  {ins.instruction_recipients.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-body-sm text-ink">
                        {personName(r.profiles)}
                        {r.is_lead && <span className="ml-1.5 text-caption text-ink-muted">(responsable)</span>}
                      </span>
                      <span className="flex items-center gap-2 text-caption text-ink-muted">
                        {r.acked_at ? `accusé le ${formatDate(r.acked_at)}` : "sans accusé"}
                        <span
                          className={cn(
                            "rounded-sm border px-1.5 py-0.5 font-semibold",
                            r.status === "bloquee" ? "border-status-waiting text-ink" : "border-line"
                          )}
                        >
                          {RECIPIENT_STATUS_LABELS[r.status] || r.status}
                        </span>
                      </span>
                      {r.status_note && (
                        <span className="w-full text-caption text-ink-muted">↳ {r.status_note}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {active && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                    <ActionBtn
                      label="Clôturer (exécution vérifiée)"
                      onClick={() => {
                        setNoteValue("");
                        setNoteModal({
                          title: "Clôturer l'instruction",
                          placeholder: "Décision de clôture (optionnel)…",
                          required: false,
                          onConfirm: async (note) => {
                            setBusy(ins.id);
                            try {
                              await call(
                                `/api/instructions/${ins.id}/close`,
                                { decision: "cloturee", note: note || undefined },
                                "Instruction clôturée"
                              );
                            } finally {
                              setBusy(null);
                            }
                          },
                        });
                      }}
                      busy={busy === ins.id}
                    />
                    <ActionBtn
                      label="Annuler"
                      onClick={() => {
                        setNoteValue("");
                        setNoteModal({
                          title: "Annuler l'instruction",
                          placeholder: "Motif d'annulation (obligatoire)…",
                          required: true,
                          onConfirm: async (note) => {
                            setBusy(ins.id);
                            try {
                              await call(
                                `/api/instructions/${ins.id}/close`,
                                { decision: "annulee", note },
                                "Instruction annulée"
                              );
                            } finally {
                              setBusy(null);
                            }
                          },
                        });
                      }}
                      busy={busy === ins.id}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <CreateInstructionModal staff={staff} onClose={() => setShowCreate(false)} onDone={() => {
          setShowCreate(false);
          router.refresh();
        }} />
      )}

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setNoteModal(null)}>
          <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-title font-bold text-ink">{noteModal.title}</h3>
              <button type="button" onClick={() => setNoteModal(null)} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              rows={3}
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder={noteModal.placeholder}
              className={cn(inputClass, "mt-4")}
              autoFocus
            />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setNoteModal(null)} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
                Annuler
              </button>
              <button
                type="button"
                disabled={noteModal.required && !noteValue.trim()}
                onClick={async () => {
                  const modal = noteModal;
                  setNoteModal(null);
                  await modal.onConfirm(noteValue.trim());
                }}
                className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, busy }: { label: string; onClick: () => void; busy: boolean }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
    >
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {label}
    </button>
  );
}

function CreateInstructionModal({
  staff,
  onClose,
  onDone,
}: {
  staff: StaffOption[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normale");
  const [dueDate, setDueDate] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [lead, setLead] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleRecipient(id: string) {
    setRecipients((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    if (lead === id) setLead("");
  }

  async function submit() {
    if (!subject.trim() || !body.trim() || recipients.length === 0) {
      toast.error("Sujet, contenu et au moins un destinataire requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          priority,
          due_date: dueDate || null,
          recipient_ids: recipients,
          lead_id: lead || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'émission");
        return;
      }
      toast.success(`Instruction ${json.instruction.reference} émise — destinataires notifiés`);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-sm border border-line bg-surface-elevated p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Nouvelle instruction</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-caption text-ink-muted">
          <CircleAlert className="h-3.5 w-3.5" aria-hidden />
          Une instruction est une décision à exécuter — chaque destinataire accuse réception individuellement.
        </p>

        <label className="mt-4 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Sujet *</span>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={cn(inputClass, "mt-1")} />
        </label>
        <label className="mt-3 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Contenu *</span>
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={cn(inputClass, "mt-1")} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Priorité</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={cn(inputClass, "mt-1")}>
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Échéance</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
        </div>

        <div className="mt-4">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
            Destinataires * ({recipients.length})
          </span>
          <ul className="mt-1 max-h-44 divide-y divide-line overflow-y-auto rounded-sm border border-line">
            {staff.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-surface-sunken">
                  <input
                    type="checkbox"
                    checked={recipients.includes(s.id)}
                    onChange={() => toggleRecipient(s.id)}
                    className="h-4 w-4 accent-[rgb(var(--brand))]"
                  />
                  <span className="flex-1 text-body-sm text-ink">{[s.prenom, s.nom].filter(Boolean).join(" ")}</span>
                  <span className="text-caption text-ink-muted">{s.role}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        {recipients.length > 1 && (
          <label className="mt-3 block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Responsable principal (optionnel)
            </span>
            <select value={lead} onChange={(e) => setLead(e.target.value)} className={cn(inputClass, "mt-1")}>
              <option value="">Aucun</option>
              {staff
                .filter((s) => recipients.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {[s.prenom, s.nom].filter(Boolean).join(" ")}
                  </option>
                ))}
            </select>
          </label>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Émettre l&rsquo;instruction
          </button>
        </div>
      </div>
    </div>
  );
}
