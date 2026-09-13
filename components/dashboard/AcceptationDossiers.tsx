"use client";

// ============================================================================
// ACCEPTATION D'AFFECTATION (cahier §7.3, lot G1 — 12/09/2026)
// L'agent voit les dossiers qui viennent de lui être affectés et les
// ACCEPTE ou les REFUSE (motif obligatoire, admins notifiés pour
// réaffectation). Le silence est escaladé par le cron quotidien. Le bloc
// disparaît quand il n'y a rien à traiter.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Inbox, XCircle } from "lucide-react";

export interface AffectationEnAttente {
  id: string;
  reference: string | null;
  nom_complet: string;
  service: string;
  created_at: string;
}

export function AcceptationDossiers({ dossiers }: { dossiers: AffectationEnAttente[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [items, setItems] = useState(dossiers);

  if (items.length === 0) return null;

  async function repondre(id: string, action: "accepter" | "refuser") {
    let motif: string | undefined;
    if (action === "refuser") {
      const saisie = prompt("Motif du refus (obligatoire) — la direction le verra pour réaffecter :");
      if (saisie === null) return;
      if (saisie.trim().length < 3) {
        toast.error("Motif obligatoire (3 caractères minimum)");
        return;
      }
      motif = saisie.trim();
    }
    setBusy(id);
    try {
      const res = await fetch(`/api/demandes/${id}/acceptation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, motif }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec — réessayez");
        return;
      }
      toast.success(
        action === "accepter" ? "Dossier accepté — il est à vous" : "Refus transmis à la direction"
      );
      setItems((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2">
        <Inbox className="h-5 w-5 text-amber-700" aria-hidden />
        <p className="font-display text-base font-bold text-nexus-blue-950">
          {items.length} dossier{items.length > 1 ? "s" : ""} en attente de votre acceptation
        </p>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Acceptez pour confirmer la prise en charge, ou refusez avec un motif — la direction
        réaffectera. Sans réponse sous 24 h, la direction est alertée automatiquement.
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-nexus-blue-950">
                {d.nom_complet}
                {d.reference && (
                  <span className="ml-2 font-mono text-xs text-slate-500">{d.reference}</span>
                )}
              </p>
              <p className="text-xs text-slate-500">{d.service}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy === d.id}
                onClick={() => repondre(d.id, "accepter")}
                className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-nexus-blue-900 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Accepter
              </button>
              <button
                type="button"
                disabled={busy === d.id}
                onClick={() => repondre(d.id, "refuser")}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Refuser
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
