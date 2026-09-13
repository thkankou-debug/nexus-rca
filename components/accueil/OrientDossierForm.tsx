"use client";

// ============================================================================
// OUVRIR ET ORIENTER UN DOSSIER — fiche client de réception (maquette
// POS ECRAN 3). La réception ouvre et oriente (dossier.create +
// dossier.orient), elle ne traite pas : affectation selon les habilitations
// et les règles du service, statut jamais modifié ici.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function OrientDossierForm({
  clientRecordId,
  services,
  agents,
}: {
  clientRecordId: string;
  services: { id: string; nom: string }[];
  agents: { id: string; nom: string; prenom: string | null }[];
}) {
  const router = useRouter();
  const [service, setService] = useState("");
  const [agent, setAgent] = useState("");
  const [motif, setMotif] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!service || !motif.trim()) {
      toast.error("Service destinataire et motif requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_record_id: clientRecordId,
          service,
          motif: motif.trim(),
          agent_id: agent || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture du dossier");
        return;
      }
      toast.success(`Dossier ${json.dossier.reference || ""} ouvert et transmis`);
      setService("");
      setAgent("");
      setMotif("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
          Service demandé
        </span>
        <select value={service} onChange={(e) => setService(e.target.value)} className={cn(inputClass, "mt-1")}>
          <option value="">Sélectionner un service</option>
          {services.map((s) => (
            <option key={s.id} value={s.nom}>
              {s.nom}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
          Motif de la demande
        </span>
        <textarea
          rows={2}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Saisir le motif de la demande…"
          className={cn(inputClass, "mt-1")}
        />
      </label>
      <label className="block">
        <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
          Agent proposé (optionnel)
        </span>
        <select value={agent} onChange={(e) => setAgent(e.target.value)} className={cn(inputClass, "mt-1")}>
          <option value="">Sélectionner un agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {[a.prenom, a.nom].filter(Boolean).join(" ")}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-line px-4 py-2.5 text-body-sm font-semibold text-ink hover:border-line-strong disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Créer et transmettre
      </button>
      <p className="text-caption text-ink-muted">
        Affectation selon les habilitations et les règles du service.
      </p>
    </div>
  );
}
