"use client";

// ============================================================================
// FILE D'ACCUEIL (§7.3, maquette ACCEUIL « Accueil des clients ») —
// enregistrer une arrivée, prendre en charge, orienter ou clore. Aucune
// estimation d'attente affichée : ni méthode ni données pour la calculer
// (règle §7.3). L'orientation renvoie vers la fiche client de réception
// (ouverture + orientation du dossier y vivent déjà).
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { DoorOpen, Loader2, Plus, UserCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export interface VisitRow {
  id: string;
  visitor_name: string;
  motif: string;
  status: string;
  arrived_at: string;
  client_record_id: string | null;
}

function formatTime(d: string): string {
  try {
    return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return d;
  }
}

export function FileAccueil({ visits }: { visits: VisitRow[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [motif, setMotif] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addArrival() {
    if (!name.trim() || !motif.trim()) {
      toast.error("Nom du visiteur et motif requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/visites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_name: name.trim(), motif: motif.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'enregistrement");
        return;
      }
      toast.success("Arrivée enregistrée");
      setName("");
      setMotif("");
      setShowAdd(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, action: "prendre" | "partie") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/accueil/visites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec");
        return;
      }
      toast.success(action === "prendre" ? "Visiteur pris en charge" : "Départ enregistré");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-sm border border-line bg-surface-elevated p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-title text-ink">File d&rsquo;accueil</h2>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong"
        >
          {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAdd ? "Fermer" : "Enregistrer une arrivée"}
        </button>
      </div>

      {showAdd && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-sm border border-line bg-surface p-3">
          <label className="min-w-[160px] flex-1">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Visiteur *</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={cn(inputClass, "mt-1")} autoFocus />
          </label>
          <label className="min-w-[200px] flex-[2]">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Motif de visite *</span>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : dépôt de passeport, renseignement visa…"
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={addArrival}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      )}

      {visits.length === 0 ? (
        <p className="mt-3 text-body-sm text-ink-muted">
          Aucun visiteur en attente — les arrivées enregistrées apparaîtront ici.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {visits.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-ink">
                  {v.visitor_name}
                  <span className="font-normal text-ink-muted"> · {v.motif}</span>
                </p>
                <p className="text-caption text-ink-muted">
                  Arrivé à {formatTime(v.arrived_at)} ·{" "}
                  {v.status === "en_attente" ? "en attente" : "pris en charge"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {v.status === "en_attente" ? (
                  <button
                    type="button"
                    disabled={busyId === v.id}
                    onClick={() => patch(v.id, "prendre")}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                  >
                    {busyId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                    Prendre en charge
                  </button>
                ) : (
                  <>
                    <Link
                      href={
                        v.client_record_id
                          ? `/dashboard/accueil/clients/${v.client_record_id}?visite=${v.id}`
                          : `/dashboard/accueil/clients?visite=${v.id}`
                      }
                      className="rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong"
                    >
                      Orienter
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => patch(v.id, "partie")}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink-muted hover:border-line-strong disabled:opacity-50"
                      title="Le visiteur est reparti sans suite"
                    >
                      <DoorOpen className="h-3.5 w-3.5" />
                      Parti
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
