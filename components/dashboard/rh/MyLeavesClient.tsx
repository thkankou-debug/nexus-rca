"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plane,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  X,
  Upload,
} from "lucide-react";
import type { LeaveRequestStatut, LeaveType } from "@/types";
import { formatDateShort } from "@/components/dashboard/rh/format";

// ─── TYPES ────────────────────────────────────────────────────────────
interface LeaveBalanceRow {
  id: string;
  employee_id: string;
  year: number;
  leave_type_id: string;
  acquired_days: number;
  used_days: number;
  leave_types: {
    id: string;
    code: string;
    label: string;
    max_days_year: number;
    color_hex: string;
    paid: boolean;
  } | null;
}

interface MyLeaveRequest {
  id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  half_day_start: boolean;
  half_day_end: boolean;
  reason: string | null;
  doc_url: string | null;
  statut: LeaveRequestStatut;
  requested_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  leave_types: { label: string; color_hex: string } | null;
}

interface Props {
  employeeId: string;
  employeeName: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────
const STATUS_LABEL: Record<LeaveRequestStatut, string> = {
  en_attente: "En attente",
  valide: "Validée",
  refuse: "Refusée",
  annule: "Annulée",
};

const STATUS_BADGE: Record<LeaveRequestStatut, string> = {
  en_attente: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  valide: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  refuse: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
  annule: "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
};

function formatDays(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(1).replace(".", ",");
}

function calcTotal(
  start: string,
  end: string,
  hs: boolean,
  he: boolean
): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  const days = Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
  let total = days;
  if (hs) total -= 0.5;
  if (he) total -= 0.5;
  return Math.max(0, total);
}

// ─── COMPOSANT ────────────────────────────────────────────────────────
export function MyLeavesClient({ employeeId, employeeName }: Props) {
  const [balances, setBalances] = useState<LeaveBalanceRow[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<MyLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const year = new Date().getFullYear();

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balRes, typesRes, reqsRes] = await Promise.all([
        fetch(`/api/rh/leave-balances/${employeeId}?year=${year}`, {
          cache: "no-store",
        }),
        fetch(`/api/rh/leave-types`, { cache: "no-store" }),
        fetch(`/api/rh/leave-requests?employee_id=${employeeId}`, {
          cache: "no-store",
        }),
      ]);
      const balJson = await balRes.json();
      const typesJson = await typesRes.json();
      const reqsJson = await reqsRes.json();

      if (balJson.success) setBalances(balJson.balances ?? []);
      if (typesJson.success) setTypes(typesJson.types ?? typesJson.leave_types ?? []);
      if (reqsJson.success) setRequests(reqsJson.requests ?? []);

      if (!balJson.success || !typesJson.success || !reqsJson.success) {
        setError(
          balJson.error ?? typesJson.error ?? reqsJson.error ?? "Erreur de chargement"
        );
      }
    } catch (e) {
      console.error("[MES_CONGES] load", e);
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette demande de congé ?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/rh/leave-requests/${id}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error ?? "Erreur d'annulation");
      } else {
        await loadAll();
      }
    } catch (e) {
      console.error("[MES_CONGES] cancel", e);
      alert("Erreur d'annulation");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-8 shadow-lg sm:px-9 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
              <Plane className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
                Mes congés
              </span>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {employeeName}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Soldes, demandes en cours et historique {year}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* SOLDES */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Mes soldes {year}
            </p>
            {balances.length === 0 ? (
              <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                Aucun solde de congés enregistré pour cette année.
              </div>
            ) : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {balances.map((b) => (
                  <BalanceCard key={b.id} balance={b} />
                ))}
              </div>
            )}
          </section>

          {/* MES DEMANDES */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Mes demandes
            </p>
            {requests.length === 0 ? (
              <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                Aucune demande pour le moment.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {requests.map((r) => (
                  <MyRequestCard
                    key={r.id}
                    request={r}
                    onCancel={() => handleCancel(r.id)}
                    busy={actionId === r.id}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {showForm && (
        <LeaveRequestForm
          employeeId={employeeId}
          types={types}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await loadAll();
          }}
        />
      )}
    </div>
  );
}

// ─── BALANCE CARD ─────────────────────────────────────────────────────
function BalanceCard({ balance }: { balance: LeaveBalanceRow }) {
  const t = balance.leave_types;
  const acq = Number(balance.acquired_days) || 0;
  const used = Number(balance.used_days) || 0;
  const remaining = Math.max(0, acq - used);
  const ratio = acq > 0 ? Math.min(100, Math.round((used / acq) * 100)) : 0;
  const color = t?.color_hex ?? "#0C1C40";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {t?.label ?? "Type"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t?.paid === false ? "Sans solde" : `Plafond ${t?.max_days_year ?? "—"} j/an`}
          </p>
        </div>
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <p
          className="font-display text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {formatDays(remaining)}
        </p>
        <p className="text-xs text-slate-500">jours restants</p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${ratio}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 tabular-nums">
        {formatDays(used)} pris / {formatDays(acq)} acquis
      </p>
    </div>
  );
}

// ─── MY REQUEST CARD ──────────────────────────────────────────────────
function MyRequestCard({
  request,
  onCancel,
  busy,
}: {
  request: MyLeaveRequest;
  onCancel: () => void;
  busy: boolean;
}) {
  const r = request;
  const color = r.leave_types?.color_hex ?? "#0C1C40";
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {r.leave_types?.label ?? "Congé"}
          </span>
          <p className="mt-2 text-sm text-nexus-blue-950">
            <span className="font-semibold">
              du {formatDateShort(r.start_date)}
            </span>{" "}
            <span className="text-slate-400">→</span>{" "}
            <span className="font-semibold">
              {formatDateShort(r.end_date)}
            </span>
            <span className="text-slate-500">
              {" "}· {formatDays(r.total_days)} j
            </span>
          </p>
          {r.reason && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {r.reason}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_BADGE[r.statut]}`}
        >
          {r.statut === "en_attente" && <Clock className="h-3 w-3" />}
          {r.statut === "valide" && <CheckCircle2 className="h-3 w-3" />}
          {r.statut === "refuse" && <XCircle className="h-3 w-3" />}
          {r.statut === "annule" && <Ban className="h-3 w-3" />}
          {STATUS_LABEL[r.statut]}
        </span>
      </div>

      {r.statut === "valide" && r.review_notes && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
          <span className="font-bold uppercase tracking-wider">Note :</span>{" "}
          {r.review_notes}
        </div>
      )}
      {r.statut === "refuse" && r.review_notes && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900">
          <span className="font-bold uppercase tracking-wider">Motif :</span>{" "}
          {r.review_notes}
        </div>
      )}

      {r.statut === "en_attente" && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}
            Annuler la demande
          </button>
        </div>
      )}
    </article>
  );
}

// ─── FORMULAIRE ───────────────────────────────────────────────────────
function LeaveRequestForm({
  employeeId,
  types,
  onClose,
  onCreated,
}: {
  employeeId: string;
  types: LeaveType[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [typeId, setTypeId] = useState<string>(
    types.find((t) => t.active)?.id ?? types[0]?.id ?? ""
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfStart, setHalfStart] = useState(false);
  const [halfEnd, setHalfEnd] = useState(false);
  const [reason, setReason] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedType = useMemo(
    () => types.find((t) => t.id === typeId) ?? null,
    [types, typeId]
  );
  const requiresDoc = selectedType?.requires_doc ?? false;
  const total = useMemo(
    () => calcTotal(startDate, endDate, halfStart, halfEnd),
    [startDate, endDate, halfStart, halfEnd]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!typeId) return setFormError("Choisissez un type de congé.");
    if (!startDate || !endDate)
      return setFormError("Renseignez les dates de début et fin.");
    if (new Date(endDate) < new Date(startDate))
      return setFormError("Date de fin antérieure à la date de début.");
    if (requiresDoc && !docFile)
      return setFormError("Un justificatif est requis pour ce type de congé.");
    if (selectedType && !selectedType.paid && !reason.trim())
      return setFormError("Une raison est requise pour ce type de congé.");

    setSubmitting(true);
    try {
      // NOTE Phase B : on envoie doc_url=nom du fichier si fourni.
      // L'upload Storage est géré par /api/rh/leave-requests côté serveur
      // (Phase B+ : on pourra remplacer par un vrai uploader Storage signé).
      const body = {
        employee_id: employeeId,
        leave_type_id: typeId,
        start_date: startDate,
        end_date: endDate,
        half_day_start: halfStart,
        half_day_end: halfEnd,
        reason: reason.trim() || undefined,
        doc_url: docFile ? docFile.name : undefined,
      };

      const res = await fetch("/api/rh/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error ?? "Erreur lors de la création");
      } else {
        onCreated();
      }
    } catch (e) {
      console.error("[MES_CONGES] submit", e);
      setFormError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
              Nouvelle demande
            </p>
            <p className="mt-1 font-display text-base font-bold text-nexus-blue-950">
              Demande de congés
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div>
            <label className="block text-sm font-semibold text-nexus-blue-950">
              Type de congé
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id} disabled={!t.active}>
                  {t.label}
                  {!t.paid ? " (sans solde)" : ""}
                  {t.requires_doc ? " · justificatif requis" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-nexus-blue-950">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-nexus-blue-950">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={halfStart}
                onChange={(e) => setHalfStart(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-nexus-orange-500 focus:ring-nexus-orange-200"
              />
              Demi-journée début
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={halfEnd}
                onChange={(e) => setHalfEnd(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-nexus-orange-500 focus:ring-nexus-orange-200"
              />
              Demi-journée fin
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-nexus-blue-950">
              {formatDays(total)} jour{total > 1 ? "s" : ""}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-nexus-blue-950">
              Raison{" "}
              {selectedType && !selectedType.paid && (
                <span className="text-rose-600">*</span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Précisez le motif de la demande…"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm placeholder:text-slate-400 focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>

          {requiresDoc && (
            <div>
              <label className="block text-sm font-semibold text-nexus-blue-950">
                Justificatif <span className="text-rose-600">*</span>
              </label>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-3 py-3">
                <Upload className="h-5 w-5 text-nexus-orange-500" />
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-nexus-blue-950 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </div>
              {docFile && (
                <p className="mt-1 text-xs text-slate-500">
                  Fichier sélectionné : {docFile.name}
                </p>
              )}
            </div>
          )}

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
