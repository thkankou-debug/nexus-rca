"use client";

// ============================================================================
// AGENDA DE L'ÉQUIPE — Espace Accueil & caisse (demande Thierry 12/09/2026,
// maquette « espace acceui et caisse.png »). La réceptionniste voit les
// rendez-vous et disponibilités de toute l'équipe (détails limités à
// l'organisation — jamais les notes internes), recherche un créneau par
// date et collaborateur, crée un RDV attribué, le reprogramme ; les
// conflits sont signalés par le serveur (409) et le collaborateur est
// notifié par e-mail.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

// Créneaux affichés : journée d'agence, pas d'une heure.
const HEURES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// Types autorisés par la contrainte base appointments_service_type_check.
const SERVICE_TYPES: { value: string; label: string }[] = [
  { value: "visa", label: "Visa & e-Visa" },
  { value: "bourse", label: "Bourse d'études" },
  { value: "tcf", label: "TCF" },
  { value: "billet", label: "Billet d'avion" },
  { value: "hotel", label: "Hôtel" },
  { value: "transfert", label: "Transfert d'argent" },
  { value: "consultation_generale", label: "Consultation générale" },
  { value: "autre", label: "Autre" },
];

const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.value, s.label])
);

interface AgendaRdv {
  id: string;
  reference: string | null;
  client_nom: string;
  client_telephone: string | null;
  agent_id: string | null;
  service_type: string;
  rdv_date: string;
  rdv_heure: string;
  duree_minutes: number;
  statut: string;
}

interface AgendaAgent {
  id: string;
  nom: string | null;
  prenom: string | null;
}

function agentName(a: AgendaAgent): string {
  return [a.prenom, a.nom].filter(Boolean).join(" ") || "Agent";
}

function todayBangui(): string {
  return new Date().toLocaleDateString("fr-CA", { timeZone: "Africa/Bangui" });
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export function AgendaEquipe() {
  const [date, setDate] = useState(todayBangui());
  const [agents, setAgents] = useState<AgendaAgent[]>([]);
  const [rdvs, setRdvs] = useState<AgendaRdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreAgent, setFiltreAgent] = useState("");
  const [creation, setCreation] = useState<{ agentId?: string; heure?: string } | null>(null);
  const [reprog, setReprog] = useState<AgendaRdv | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accueil/agenda?debut=${date}&fin=${date}`);
      const json = await res.json();
      if (json.success) {
        setAgents(json.agents);
        setRdvs(json.rdvs);
      } else {
        toast.error(json.error || "Agenda indisponible");
      }
    } catch {
      toast.error("Réseau indisponible — réessayez");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const agentsAffiches = filtreAgent ? agents.filter((a) => a.id === filtreAgent) : agents;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDate(shiftDate(date, -1))}
            className="rounded-sm border border-line p-2 text-ink hover:border-line-strong"
            aria-label="Jour précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={cn(inputClass, "w-44")} />
          <button
            type="button"
            onClick={() => setDate(shiftDate(date, 1))}
            className="rounded-sm border border-line p-2 text-ink hover:border-line-strong"
            aria-label="Jour suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDate(todayBangui())}
            className="whitespace-nowrap rounded-sm border border-line px-3 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            Aujourd&rsquo;hui
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={filtreAgent} onChange={(e) => setFiltreAgent(e.target.value)} className={cn(inputClass, "w-52")}>
            <option value="">Toute l&rsquo;équipe</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {agentName(a)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreation({})}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Créer un rendez-vous
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-sm border border-line bg-surface-elevated py-16">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line px-4 py-10 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
          <p className="mt-2 text-body-sm text-ink-muted">Aucun collaborateur actif à afficher.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-line bg-surface-elevated">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                <th className="sticky left-0 bg-surface-elevated px-3 py-2.5">Collaborateur</th>
                {HEURES.map((h) => (
                  <th key={h} className="px-2 py-2.5 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {agentsAffiches.map((a) => (
                <tr key={a.id}>
                  <td className="sticky left-0 bg-surface-elevated px-3 py-2 text-body-sm font-semibold text-ink">
                    {agentName(a)}
                  </td>
                  {HEURES.map((h) => {
                    const occupants = rdvs.filter(
                      (r) => r.agent_id === a.id && r.rdv_heure.slice(0, 2) === h.slice(0, 2)
                    );
                    return (
                      <td key={h} className="px-1 py-1 align-top">
                        {occupants.length > 0 ? (
                          occupants.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setReprog(r)}
                              title={`${r.rdv_heure} · ${r.client_nom} · ${SERVICE_LABELS[r.service_type] || r.service_type} — cliquer pour reprogrammer`}
                              className="mb-1 block w-full rounded-sm border border-line-strong bg-surface-sunken px-1.5 py-1 text-left text-caption font-semibold text-ink hover:border-ink"
                            >
                              {r.rdv_heure} {r.client_nom.split(" ")[0]}
                              <span className="block truncate font-normal text-ink-muted">
                                {SERVICE_LABELS[r.service_type] || r.service_type}
                              </span>
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCreation({ agentId: a.id, heure: h })}
                            className="block h-9 w-full rounded-sm border border-dashed border-line text-caption text-ink-subtle hover:border-line-strong hover:text-ink-muted"
                            title={`Créneau libre — attribuer un RDV à ${agentName(a)} à ${h}`}
                          >
                            libre
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-caption text-ink-subtle">
        Les cases affichent le nécessaire à l&rsquo;organisation (heure, client, service) — les notes des
        dossiers restent confidentielles. Un créneau « libre » se clique pour attribuer un rendez-vous ;
        un rendez-vous se clique pour le reprogrammer. Les conflits sont refusés par le serveur.
      </p>

      {creation && (
        <RdvModal
          agents={agents}
          initial={{ date, heure: creation.heure, agentId: creation.agentId }}
          onClose={() => setCreation(null)}
          onDone={async () => {
            setCreation(null);
            await load();
          }}
        />
      )}
      {reprog && (
        <ReprogrammerModal
          rdv={reprog}
          agents={agents}
          onClose={() => setReprog(null)}
          onDone={async () => {
            setReprog(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function RdvModal({
  agents,
  initial,
  onClose,
  onDone,
}: {
  agents: AgendaAgent[];
  initial: { date: string; heure?: string; agentId?: string };
  onClose: () => void;
  onDone: () => void;
}) {
  const [clientNom, setClientNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState(initial.date);
  const [heure, setHeure] = useState(initial.heure || "09:00");
  const [agentId, setAgentId] = useState(initial.agentId || "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (clientNom.trim().length < 2) {
      toast.error("Nom du client requis");
      return;
    }
    if (!service.trim()) {
      toast.error("Service requis");
      return;
    }
    if (!agentId) {
      toast.error("Choisissez le collaborateur");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_nom: clientNom.trim(),
          client_telephone: telephone.trim() || undefined,
          service_type: service.trim(),
          rdv_date: date,
          rdv_heure: heure,
          agent_id: agentId,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la création");
        return;
      }
      toast.success("Rendez-vous créé — le collaborateur est notifié");
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Créer un rendez-vous</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Client *</span>
            <input type="text" value={clientNom} onChange={(e) => setClientNom(e.target.value)} className={cn(inputClass, "mt-1")} autoFocus />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Téléphone</span>
            <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Service *</span>
            <select value={service} onChange={(e) => setService(e.target.value)} className={cn(inputClass, "mt-1")}>
              <option value="">Choisir le service…</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Date *</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Heure *</span>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Attribué à *</span>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={cn(inputClass, "mt-1")}>
              <option value="">Choisir le collaborateur…</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {agentName(a)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "…" : "Créer et notifier"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReprogrammerModal({
  rdv,
  agents,
  onClose,
  onDone,
}: {
  rdv: AgendaRdv;
  agents: AgendaAgent[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState(rdv.rdv_date);
  const [heure, setHeure] = useState(rdv.rdv_heure);
  const [agentId, setAgentId] = useState(rdv.agent_id || "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/accueil/agenda/${rdv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rdv_date: date, rdv_heure: heure, agent_id: agentId || undefined }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la reprogrammation");
        return;
      }
      toast.success("Rendez-vous reprogrammé — collaborateur notifié");
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Reprogrammer</h3>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          {rdv.client_nom} · {SERVICE_LABELS[rdv.service_type] || rdv.service_type}
          {rdv.reference && <span className="font-mono"> · {rdv.reference}</span>}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Heure</span>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={cn(inputClass, "mt-1")} />
          </label>
          <label className="col-span-2 block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Attribué à</span>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={cn(inputClass, "mt-1")}>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {agentName(a)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "…" : "Reprogrammer et notifier"}
          </button>
        </div>
      </div>
    </div>
  );
}
