"use client";

// ============================================================================
// COMPOSANT — CaisseSessionsManager
// P6, lot Caisse + Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md,
// §3.3/§4.3, 10/09/2026). Chaîne à deux temps : la titulaire de la session
// (agent/accueil_caisse) SOUMET son rapprochement (statut -> "a_cloturer",
// route /submit) ; seule une personne avec la permission 'caisse.close'
// (super_admin/daf, séparation des tâches §P2) VALIDE et clôture ensuite
// (route /close). Une session "ouverte" ne peut plus être clôturée
// directement — corrige une régression où l'ancien bouton unique
// "Clôturer ma session" appelait /close sans passer par /submit.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Lock, LockOpen, PlusCircle, Wallet, AlertTriangle, FileSpreadsheet, X, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv-export";

type SessionStatus = "ouverte" | "a_cloturer" | "cloturee";

export interface CaisseSessionListItem {
  id: string;
  agent_id: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  expected_balance: number | null;
  actual_balance: number | null;
  discrepancy: number | null;
  status: SessionStatus;
  notes: string | null;
  profiles: { nom: string; prenom: string | null } | null;
}

function formatMoney(amount: number | null): string {
  if (amount === null) return "—";
  return `${Math.round(amount).toLocaleString("fr-FR")} XAF`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

export function CaisseSessionsManager({
  initialSessions,
  currentUserId,
  canClose = false,
}: {
  initialSessions: CaisseSessionListItem[];
  currentUserId: string;
  canClose?: boolean;
}) {
  const [sessions, setSessions] = useState<CaisseSessionListItem[]>(initialSessions);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [reconcileTarget, setReconcileTarget] = useState<{ session: CaisseSessionListItem; mode: "submit" | "close" } | null>(
    null
  );

  const ownOpenSession = useMemo(
    () => sessions.find((s) => s.agent_id === currentUserId && s.status === "ouverte"),
    [sessions, currentUserId]
  );
  const ownPendingSession = useMemo(
    () => sessions.find((s) => s.agent_id === currentUserId && s.status === "a_cloturer"),
    [sessions, currentUserId]
  );
  const pendingValidation = useMemo(
    () => (canClose ? sessions.filter((s) => s.status === "a_cloturer") : []),
    [sessions, canClose]
  );

  async function reload() {
    const res = await fetch("/api/caisse-sessions");
    const json = await res.json();
    if (json.success) setSessions(json.sessions);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {ownOpenSession ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <LockOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Session ouverte</p>
                <p className="font-display text-lg font-bold text-nexus-blue-950">
                  Depuis {formatDateTime(ownOpenSession.opened_at)} · Fonds initial {formatMoney(ownOpenSession.opening_balance)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReconcileTarget({ session: ownOpenSession, mode: "submit" })}
              className="inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-blue-900"
            >
              <ClipboardCheck className="h-4 w-4" />
              Soumettre le rapprochement
            </button>
          </div>
        ) : ownPendingSession ? (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Rapprochement soumis</p>
              <p className="font-display text-lg font-bold text-nexus-blue-950">
                En attente de validation par le DAF / l&apos;admin
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-600">Aucune session de caisse ouverte pour toi actuellement.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOpenForm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
            >
              <PlusCircle className="h-4 w-4" />
              Ouvrir une session
            </button>
          </div>
        )}
      </div>

      {canClose && pendingValidation.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800">
            {pendingValidation.length} session{pendingValidation.length > 1 ? "s" : ""} en attente de validation
          </p>
          <div className="mt-3 space-y-2">
            {pendingValidation.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-nexus-blue-950">
                    {s.profiles ? `${s.profiles.prenom || ""} ${s.profiles.nom}`.trim() : "Agent"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Théorique {formatMoney(s.expected_balance)} · Compté {formatMoney(s.actual_balance)}
                    {s.discrepancy !== null && Math.abs(s.discrepancy) > 0 && ` · Écart ${formatMoney(s.discrepancy)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReconcileTarget({ session: s, mode: "close" })}
                  className="inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-nexus-blue-900"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Valider et clôturer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `Sessions_caisse_${new Date().toISOString().split("T")[0]}.csv`,
                ["Agent", "Statut", "Ouverte le", "Cloturee le", "Fonds initial", "Solde theorique", "Solde reel", "Ecart"],
                sessions.map((s) => [
                  s.profiles ? `${s.profiles.prenom || ""} ${s.profiles.nom}`.trim() : "",
                  s.status === "ouverte" ? "Ouverte" : s.status === "a_cloturer" ? "A valider" : "Cloturee",
                  formatDateTime(s.opened_at),
                  formatDateTime(s.closed_at),
                  String(s.opening_balance),
                  s.expected_balance !== null ? String(s.expected_balance) : "",
                  s.actual_balance !== null ? String(s.actual_balance) : "",
                  s.discrepancy !== null ? String(s.discrepancy) : "",
                ])
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucune session de caisse enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}

      {showOpenForm && (
        <OpenSessionModal
          onClose={() => setShowOpenForm(false)}
          onOpened={async () => {
            setShowOpenForm(false);
            await reload();
            toast.success("Session ouverte");
          }}
        />
      )}

      {reconcileTarget && (
        <ReconcileSessionModal
          session={reconcileTarget.session}
          mode={reconcileTarget.mode}
          onClose={() => setReconcileTarget(null)}
          onDone={async () => {
            const wasClose = reconcileTarget.mode === "close";
            setReconcileTarget(null);
            await reload();
            toast.success(wasClose ? "Session clôturée" : "Rapprochement soumis");
          }}
        />
      )}
    </div>
  );
}

function SessionCard({ session }: { session: CaisseSessionListItem }) {
  const statusLabel =
    session.status === "ouverte" ? "Ouverte" : session.status === "a_cloturer" ? "À valider" : "Clôturée";
  const statusClass =
    session.status === "ouverte"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : session.status === "a_cloturer"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  const discrepancy = session.discrepancy;
  const hasDiscrepancy = discrepancy !== null && Math.abs(discrepancy) > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusClass)}>
                {statusLabel}
              </span>
              {session.profiles && (
                <span className="text-sm font-semibold text-nexus-blue-950">
                  {session.profiles.prenom || ""} {session.profiles.nom}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Ouverte le {formatDateTime(session.opened_at)}
              {session.closed_at && ` · Clôturée le ${formatDateTime(session.closed_at)}`}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <Metric label="Fonds initial" value={formatMoney(session.opening_balance)} />
          <Metric label="Solde théorique" value={formatMoney(session.expected_balance)} />
          <Metric label="Solde réel" value={formatMoney(session.actual_balance)} />
          <Metric
            label="Écart"
            value={session.discrepancy === null ? "—" : formatMoney(session.discrepancy)}
            accent={hasDiscrepancy ? "warning" : undefined}
          />
        </div>

        {hasDiscrepancy && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Écart détecté à la clôture
          </div>
        )}

        {session.notes && <p className="mt-3 text-sm text-slate-600">{session.notes}</p>}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: "warning" }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("mt-1 font-display text-base font-bold", accent === "warning" ? "text-amber-600" : "text-nexus-blue-950")}>
        {value}
      </p>
    </div>
  );
}

function OpenSessionModal({ onClose, onOpened }: { onClose: () => void; onOpened: () => void }) {
  const [openingBalance, setOpeningBalance] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      toast.error("Le fonds initial doit être un nombre positif");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/caisse-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opening_balance: openingBalance }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture");
        return;
      }
      onOpened();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">Ouvrir une session de caisse</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fonds initial (XAF)</label>
          <input
            type="number"
            min={0}
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-full bg-nexus-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-nexus-orange-600 disabled:opacity-50"
          >
            {saving ? "Ouverture..." : "Ouvrir la session"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReconcileSessionModal({
  session,
  mode,
  onClose,
  onDone,
}: {
  session: CaisseSessionListItem;
  mode: "submit" | "close";
  onClose: () => void;
  onDone: () => void;
}) {
  const isClose = mode === "close";
  const [liveExpected, setLiveExpected] = useState<number | null>(isClose ? session.expected_balance : null);
  const [loading, setLoading] = useState(!isClose);
  const [actualBalance, setActualBalance] = useState(isClose ? session.actual_balance ?? 0 : 0);
  const [notes, setNotes] = useState(isClose ? session.notes || "" : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isClose) return; // deja soumis par la caissiere, pas de recalcul live
    (async () => {
      const res = await fetch(`/api/caisse-sessions/${session.id}`);
      const json = await res.json();
      if (json.success) setLiveExpected(json.live_expected_balance);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (!Number.isFinite(actualBalance) || actualBalance < 0) {
      toast.error("Le solde réel doit être un nombre positif");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/caisse-sessions/${session.id}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual_balance: actualBalance, notes: notes || undefined }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || (isClose ? "Échec de la clôture" : "Échec de la soumission"));
        return;
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">
            {isClose ? "Valider et clôturer la session" : "Soumettre le rapprochement"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isClose && session.profiles && (
          <p className="mt-2 text-sm text-slate-600">
            Session de {session.profiles.prenom || ""} {session.profiles.nom}
          </p>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Solde théorique {isClose ? "(soumis)" : "(calculé)"}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-nexus-blue-950">
            {loading ? "Calcul..." : formatMoney(liveExpected)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Fonds initial + ventes en espèces depuis l&apos;ouverture</p>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Solde réel compté (XAF)</label>
          <input
            type="number"
            min={0}
            value={actualBalance}
            onChange={(e) => setActualBalance(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isClose ? "Note de validation (optionnel)" : "Notes (optionnel)"}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            placeholder="Explication d'un écart éventuel..."
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-full bg-nexus-blue-950 px-5 py-2 text-sm font-semibold text-white hover:bg-nexus-blue-900 disabled:opacity-50"
          >
            {saving ? "Envoi..." : isClose ? "Valider et clôturer" : "Soumettre"}
          </button>
        </div>
      </div>
    </div>
  );
}
