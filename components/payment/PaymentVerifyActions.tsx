"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentVerifyActionsProps {
  reference: string;
  statut: string;
}

export function PaymentVerifyActions({
  reference,
  statut,
}: PaymentVerifyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState<"verify" | "cancel" | null>(null);
  const [notesStaff, setNotesStaff] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const callApi = async (
    endpoint: "verify" | "cancel",
    payload: Record<string, unknown> = {}
  ) => {
    setLoading(endpoint);
    setError("");

    try {
      const res = await fetch(
        `/api/payment-links/${reference}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur");
        setLoading(null);
        return;
      }

      setShowConfirm(null);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(null);
    }
  };

  // Statut final → pas d'actions
  if (statut === "verifie" || statut === "annule" || statut === "expire") {
    return null;
  }

  const canVerify = statut === "paiement_declare";

  return (
    <div className="flex flex-col gap-2 lg:max-w-xs">
      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* MODAL CONFIRMATION VERIFY */}
      {showConfirm === "verify" && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            Confirmer encaissement
          </p>
          <p className="mt-1 text-xs text-green-900">
            ⚠️ Vous certifiez avoir bien reçu ce montant. Un reçu PDF sera généré et envoyé.
          </p>
          <textarea
            value={notesStaff}
            onChange={(e) => setNotesStaff(e.target.value)}
            placeholder="Notes (optionnel)"
            rows={2}
            className="mt-2 w-full rounded-lg border border-green-200 bg-white p-2 text-xs"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => callApi("verify", { notes_staff: notesStaff })}
              disabled={loading === "verify"}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-green-700 disabled:opacity-50"
            >
              {loading === "verify" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmer
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(null)}
              disabled={loading === "verify"}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION CANCEL */}
      {showConfirm === "cancel" && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-red-700">
            Annuler ce lien
          </p>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Raison (optionnel)"
            className="mt-2 w-full rounded-lg border border-red-200 bg-white p-2 text-xs"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => callApi("cancel", { reason: cancelReason })}
              disabled={loading === "cancel"}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-red-700 disabled:opacity-50"
            >
              {loading === "cancel" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Annulation...
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Confirmer annulation
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(null)}
              disabled={loading === "cancel"}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {/* BOUTONS PRINCIPAUX */}
      {!showConfirm && (
        <div className="flex flex-wrap gap-1.5">
          {canVerify && (
            <button
              type="button"
              onClick={() => setShowConfirm("verify")}
              className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              Confirmer encaissement
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowConfirm("cancel")}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <XCircle className="h-3 w-3" />
            Annuler le lien
          </button>
        </div>
      )}
    </div>
  );
}
