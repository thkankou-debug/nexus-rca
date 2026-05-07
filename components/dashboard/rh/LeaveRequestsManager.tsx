"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plane,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  AlertTriangle,
  Loader2,
  X,
  CalendarDays,
} from "lucide-react";
import type { LeaveRequestStatut } from "@/types";
import { formatDateShort } from "@/components/dashboard/rh/format";

// ─── TYPES ─────────────────────────────────────────────────────────────
interface EmployeeLite {
  id: string;
  nom_complet: string;
  poste: string | null;
  departement: string | null;
  email: string | null;
}

interface LeaveTypeLite {
  id: string;
  code: string;
  label: string;
  color_hex: string;
  paid: boolean;
}

interface LeaveRequestRow {
  id: string;
  employee_id: string;
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
  employees: EmployeeLite | null;
  leave_types: LeaveTypeLite | null;
}

interface Props {
  /** Rôle qui consulte la page (admin et super_admin ont les mêmes droits ici) */
  role: "super_admin" | "admin";
}

// ─── HELPERS ───────────────────────────────────────────────────────────
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.round(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j < 30) return `il y a ${j} j`;
  const m = Math.round(j / 30);
  if (m < 12) return `il y a ${m} mois`;
  return `il y a ${Math.round(m / 12)} an${m >= 24 ? "s" : ""}`;
}

function formatDays(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(1).replace(".", ",");
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────
export function LeaveRequestsManager({ role: _role }: Props) {
  const [requests, setRequests] = useState<LeaveRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | LeaveRequestStatut>("all");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<LeaveRequestRow | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rh/leave-requests", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Erreur de chargement");
      } else {
        setRequests(json.requests ?? []);
      }
    } catch (e) {
      console.error("[LEAVES_MANAGER] fetch", e);
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Stats top : en_attente, validées ce mois, refusées ce mois, jours pris ce mois
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    let pending = 0;
    let validatedMonth = 0;
    let rejectedMonth = 0;
    let daysTakenMonth = 0;
    for (const r of requests) {
      if (r.statut === "en_attente") pending += 1;
      if (r.reviewed_at) {
        const rd = new Date(r.reviewed_at);
        if (rd >= monthStart && rd < monthEnd) {
          if (r.statut === "valide") validatedMonth += 1;
          if (r.statut === "refuse") rejectedMonth += 1;
        }
      }
      if (r.statut === "valide") {
        const sd = new Date(r.start_date);
        if (sd >= monthStart && sd < monthEnd) {
          daysTakenMonth += Number(r.total_days) || 0;
        }
      }
    }
    return { pending, validatedMonth, rejectedMonth, daysTakenMonth };
  }, [requests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (filter !== "all" && r.statut !== filter) return false;
      if (q) {
        const name = (r.employees?.nom_complet ?? "").toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [requests, filter, search]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/rh/leave-requests/${id}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error ?? "Erreur de validation");
      } else {
        await fetchRequests();
      }
    } catch (e) {
      console.error("[LEAVES_MANAGER] approve", e);
      alert("Erreur de validation");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string, note: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/rh/leave-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_notes: note }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error ?? "Erreur de refus");
      } else {
        setRejectModal(null);
        await fetchRequests();
      }
    } catch (e) {
      console.error("[LEAVES_MANAGER] reject", e);
      alert("Erreur de refus");
    } finally {
      setActionId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<LeaveRequestStatut, number> = {
      en_attente: 0,
      valide: 0,
      refuse: 0,
      annule: 0,
    };
    for (const r of requests) c[r.statut] = (c[r.statut] ?? 0) + 1;
    return c;
  }, [requests]);

  return (
    <div className="space-y-8">
      {/* HERO COMPACT */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-8 shadow-lg sm:px-9 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
            <Plane className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              Gestion des congés
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Demandes de congés
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Validez, refusez et supervisez les absences de l&apos;équipe.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat label="En attente" value={stats.pending} accent="amber" />
          <HeroStat
            label="Validées ce mois"
            value={stats.validatedMonth}
            accent="white"
          />
          <HeroStat
            label="Refusées ce mois"
            value={stats.rejectedMonth}
            accent="white"
          />
          <HeroStat
            label="Jours pris ce mois"
            value={formatDays(stats.daysTakenMonth)}
            accent="orange"
          />
        </div>
      </section>

      {/* FILTRES + SEARCH */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Toutes"
            count={requests.length}
          />
          <FilterChip
            active={filter === "en_attente"}
            onClick={() => setFilter("en_attente")}
            label="En attente"
            count={counts.en_attente}
            tone="amber"
          />
          <FilterChip
            active={filter === "valide"}
            onClick={() => setFilter("valide")}
            label="Validées"
            count={counts.valide}
          />
          <FilterChip
            active={filter === "refuse"}
            onClick={() => setFilter("refuse")}
            label="Refusées"
            count={counts.refuse}
          />
          <FilterChip
            active={filter === "annule"}
            onClick={() => setFilter("annule")}
            label="Annulées"
            count={counts.annule}
          />
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un employé…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-nexus-blue-950 shadow-sm placeholder:text-slate-400 focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
          />
        </div>
      </section>

      {/* LISTE */}
      <section>
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
              Aucune demande
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Aucune demande ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                onApprove={() => handleApprove(r.id)}
                onReject={() => setRejectModal(r)}
                actionId={actionId}
              />
            ))}
          </div>
        )}
      </section>

      {/* MODAL REFUS */}
      {rejectModal && (
        <RejectModal
          request={rejectModal}
          onClose={() => setRejectModal(null)}
          onSubmit={(note) => handleReject(rejectModal.id, note)}
          loading={actionId === rejectModal.id}
        />
      )}
    </div>
  );
}

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "white" | "orange" | "amber";
}) {
  const valueClass =
    accent === "orange"
      ? "text-nexus-orange-300"
      : accent === "amber"
        ? "text-amber-300"
        : "text-white";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1.5 font-display text-xl font-bold tabular-nums sm:text-2xl ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "amber";
}) {
  const base = active
    ? "bg-nexus-blue-950 text-white border-nexus-blue-950"
    : "bg-white text-slate-700 border-slate-200 hover:border-nexus-orange-300 hover:text-nexus-orange-700";
  const badgeTone =
    tone === "amber"
      ? active
        ? "bg-amber-300 text-amber-900"
        : "bg-amber-100 text-amber-800"
      : active
        ? "bg-white/15 text-white"
        : "bg-slate-100 text-slate-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${base}`}
    >
      {label}
      <span
        className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${badgeTone}`}
      >
        {count}
      </span>
    </button>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
  actionId,
}: {
  request: LeaveRequestRow;
  onApprove: () => void;
  onReject: () => void;
  actionId: string | null;
}) {
  const r = request;
  const employee = r.employees;
  const type = r.leave_types;
  const initials = getInitials(employee?.nom_complet ?? "?");
  const isPending = r.statut === "en_attente";
  const isValidated = r.statut === "valide";
  const isRejected = r.statut === "refuse";
  const busy = actionId === r.id;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-nexus-blue-950">
              {employee?.nom_complet ?? "Employé inconnu"}
            </p>
            <p className="text-xs text-slate-500">
              {employee?.poste ?? "—"}
              {employee?.departement ? ` · ${employee.departement}` : ""}
            </p>
          </div>
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

      {/* BODY */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Type
          </p>
          <span
            className="mt-1.5 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${type?.color_hex ?? "#0C1C40"}22`,
              color: type?.color_hex ?? "#0C1C40",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: type?.color_hex ?? "#0C1C40" }}
            />
            {type?.label ?? "—"}
            {type && !type.paid ? " · sans solde" : ""}
          </span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Période
          </p>
          <p className="mt-1.5 text-sm text-nexus-blue-950">
            <span className="font-semibold">
              du {formatDateShort(r.start_date)}
            </span>{" "}
            <span className="text-slate-400">→</span>{" "}
            <span className="font-semibold">
              {formatDateShort(r.end_date)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatDays(r.total_days)} jour{r.total_days > 1 ? "s" : ""}
            {r.half_day_start ? " · début demi-journée" : ""}
            {r.half_day_end ? " · fin demi-journée" : ""}
          </p>
        </div>
      </div>

      {r.reason && (
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Raison
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-700">{r.reason}</p>
        </div>
      )}

      {isValidated && r.review_notes && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
          <span className="font-bold uppercase tracking-wider">Note :</span>{" "}
          {r.review_notes}
        </div>
      )}
      {isRejected && r.review_notes && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900">
          <span className="font-bold uppercase tracking-wider">Motif :</span>{" "}
          {r.review_notes}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Demandé {formatRelative(r.requested_at)}
          {r.reviewed_at ? ` · décidé ${formatRelative(r.reviewed_at)}` : ""}
        </p>
        {isPending && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReject}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Refuser
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-nexus-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Valider
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function RejectModal({
  request,
  onClose,
  onSubmit,
  loading,
}: {
  request: LeaveRequestRow;
  onClose: () => void;
  onSubmit: (note: string) => void;
  loading: boolean;
}) {
  const [note, setNote] = useState("");
  const tooShort = note.trim().length < 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">
              Refuser la demande
            </p>
            <p className="mt-1 font-display text-base font-bold text-nexus-blue-950">
              {request.employees?.nom_complet ?? "Employé"}
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
        <div className="px-6 py-5">
          <label className="block text-sm font-semibold text-nexus-blue-950">
            Motif du refus <span className="text-rose-600">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Minimum 5 caractères. Le message sera visible par l&apos;employé.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Ex: Période de forte activité, merci de proposer une autre date."
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={tooShort || loading}
            onClick={() => onSubmit(note.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}
