"use client";

// ============================================================================
// ESPACE PARTENAIRE (§5.10) — navigation simplifiée (§4.1) : uniquement les
// dossiers EXPRESSÉMENT partagés, champs limités (jamais les notes internes,
// les marges ni les autres dossiers). Actions : accuser réception, avis,
// décision, demande de complément — chaque dépôt notifie le responsable
// interne et ne clôt jamais le dossier NEXUS.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FolderOpen, Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export interface SharedDossier {
  id: string;
  reference: string | null;
  service: string;
  statut: string;
  nom_complet: string;
  created_at: string;
  shared_at: string;
}

export interface PartnerReturn {
  id: string;
  demande_id: string;
  type: string;
  content: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  accuse: "Accusé de réception",
  avis: "Avis",
  decision: "Décision",
  complement_demande: "Demande de complément",
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export function PartenaireEspace({
  dossiers,
  retours,
}: {
  dossiers: SharedDossier[];
  retours: PartnerReturn[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<{ dossier: SharedDossier; type: string } | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyAck, setBusyAck] = useState<string | null>(null);

  const retoursByDossier = new Map<string, PartnerReturn[]>();
  for (const r of retours) {
    const arr = retoursByDossier.get(r.demande_id) || [];
    arr.push(r);
    retoursByDossier.set(r.demande_id, arr);
  }

  async function deposer(demandeId: string, type: string, text: string) {
    const res = await fetch("/api/partenaire/retours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demande_id: demandeId, type, content: text }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec du dépôt");
      return false;
    }
    toast.success("Retour transmis au responsable NEXUS");
    router.refresh();
    return true;
  }

  if (dossiers.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line px-6 py-12 text-center">
        <FolderOpen className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
        <p className="mt-3 text-body-sm text-ink-muted">
          Aucun dossier ne vous est partagé actuellement.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {dossiers.map((d) => {
          const mesRetours = retoursByDossier.get(d.id) || [];
          const dejaAccuse = mesRetours.some((r) => r.type === "accuse");
          return (
            <li key={d.id} className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-ink">
                    {d.nom_complet}
                    <span className="font-normal text-ink-muted"> · {d.service}</span>
                  </p>
                  <p className="mt-0.5 text-caption text-ink-muted">
                    {[d.reference, `partagé le ${formatDate(d.shared_at)}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                  {d.statut}
                </span>
              </div>

              {mesRetours.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                  {mesRetours.slice(0, 4).map((r) => (
                    <li key={r.id} className="text-caption text-ink-muted">
                      <span className="font-semibold text-ink">{TYPE_LABELS[r.type] || r.type}</span> ·{" "}
                      {formatDate(r.created_at)} — {r.content}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                {!dejaAccuse && (
                  <button
                    type="button"
                    disabled={busyAck === d.id}
                    onClick={async () => {
                      setBusyAck(d.id);
                      try {
                        await deposer(d.id, "accuse", "Réception du dossier partagé confirmée.");
                      } finally {
                        setBusyAck(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-caption font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
                  >
                    {busyAck === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Accuser réception
                  </button>
                )}
                {(["avis", "decision", "complement_demande"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setContent("");
                      setModal({ dossier: d, type: t });
                    }}
                    className="rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong"
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-title font-bold text-ink">{TYPE_LABELS[modal.type]}</h3>
              <button type="button" onClick={() => setModal(null)} className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-caption text-ink-muted">
              {modal.dossier.reference || modal.dossier.nom_complet} — transmis au responsable NEXUS,
              qui vérifie avant toute décision interne.
            </p>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(inputClass, "mt-4")}
              autoFocus
            />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModal(null)} className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong">
                Annuler
              </button>
              <button
                type="button"
                disabled={saving || !content.trim()}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const ok = await deposer(modal.dossier.id, modal.type, content.trim());
                    if (ok) setModal(null);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Transmettre
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
