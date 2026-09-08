"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

export function DevisAcceptButton({ devisId }: { devisId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/devis/${devisId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Acceptation impossible");
      }
      toast.success("Devis accepté");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="rounded-2xl border-2 border-nexus-orange-300 bg-nexus-orange-50 p-4">
        <p className="text-sm font-semibold text-nexus-orange-900">
          Confirmer l&apos;acceptation de ce devis ?
        </p>
        <p className="mt-1 text-xs text-nexus-orange-700">
          Cette action est définitive et engage votre accord sur les montants et prestations indiqués.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAccept}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-nexus-orange-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirmer l&apos;acceptation
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-nexus-orange-600"
    >
      <CheckCircle2 className="h-4 w-4" />
      Accepter ce devis
    </button>
  );
}
