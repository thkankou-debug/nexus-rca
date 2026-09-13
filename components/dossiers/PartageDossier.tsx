"use client";

// ============================================================================
// PARTAGE PARTENAIRE — fiche dossier staff (cahier §12, lot G5, 13/09/2026)
// Admin/super-admin partagent le dossier avec un compte partenaire actif et
// révoquent le partage (fermeture immédiate page/API/dépôts — mécanique
// 086). Chaque action est auditée et notifiée au partenaire.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Handshake, Loader2, X } from "lucide-react";

interface Partage {
  id: string;
  partenaire_id: string;
  created_at: string;
  profiles: { nom: string | null; prenom: string | null; email: string | null } | null;
}

interface PartenaireCompte {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
}

function nomDe(p: { nom: string | null; prenom: string | null; email: string | null } | null): string {
  if (!p) return "Partenaire";
  return [p.prenom, p.nom].filter(Boolean).join(" ") || p.email || "Partenaire";
}

export function PartageDossier({ demandeId }: { demandeId: string }) {
  const [partages, setPartages] = useState<Partage[]>([]);
  const [comptes, setComptes] = useState<PartenaireCompte[]>([]);
  const [choix, setChoix] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/demandes/${demandeId}/partages`);
    const json = await res.json().catch(() => ({}));
    if (json.success) {
      setPartages(json.partages);
      setComptes(json.partenaires);
    }
    setLoaded(true);
  }, [demandeId]);

  useEffect(() => {
    load();
  }, [load]);

  async function partager() {
    if (!choix) {
      toast.error("Choisissez un compte partenaire");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/partages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partenaire_id: choix }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec du partage");
        return;
      }
      toast.success("Dossier partagé — partenaire notifié");
      setChoix("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function revoquer(partenaireId: string) {
    if (!confirm("Révoquer ce partage ? L'accès du partenaire se ferme immédiatement.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/partages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partenaire_id: partenaireId }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la révocation");
        return;
      }
      toast.success("Partage révoqué");
      await load();
    } finally {
      setBusy(false);
    }
  }

  const dejaPartage = new Set(partages.map((p) => p.partenaire_id));
  const disponibles = comptes.filter((c) => !dejaPartage.has(c.id));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Handshake className="h-4 w-4 text-slate-500" aria-hidden />
        <p className="text-sm font-semibold text-nexus-blue-950">Partage partenaire</p>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Le partenaire voit le dossier partagé et dépose ses retours ; la révocation ferme
        immédiatement son accès. Chaque action est tracée.
      </p>
      {!loaded ? (
        <Loader2 className="mt-3 h-4 w-4 animate-spin text-slate-400" />
      ) : (
        <>
          {partages.length > 0 && (
            <ul className="mt-3 space-y-2">
              {partages.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-nexus-blue-950">{nomDe(p.profiles)}</p>
                    <p className="text-xs text-slate-500">
                      Partagé le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => revoquer(p.partenaire_id)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    Révoquer
                  </button>
                </li>
              ))}
            </ul>
          )}
          {disponibles.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={choix}
                onChange={(e) => setChoix(e.target.value)}
                className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none"
              >
                <option value="">Choisir un compte partenaire…</option>
                {disponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {nomDe(c)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || !choix}
                onClick={partager}
                className="whitespace-nowrap rounded-xl bg-nexus-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-blue-900 disabled:opacity-50"
              >
                Partager
              </button>
            </div>
          ) : (
            partages.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                Aucun compte partenaire actif — créez-en un dans Utilisateurs.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
