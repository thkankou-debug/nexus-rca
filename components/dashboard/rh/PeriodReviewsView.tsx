"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowUpRight,
  Users,
  XCircle,
} from "lucide-react";
import type {
  PerformanceReview,
  PerformanceReviewStatut,
  ReviewPeriod,
  ReviewPeriodStatut,
} from "@/types";
import { formatDateShort, formatDateTimeShort } from "./format";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface EmployeeLite {
  id: string;
  nom_complet: string;
  poste: string | null;
  departement: string | null;
  email: string;
}

interface ReviewRow extends PerformanceReview {
  employees: EmployeeLite | null;
  review_periods?: { id: string; year: number; label: string; statut: ReviewPeriodStatut } | null;
}

interface Props {
  basePath: string; // ex: /dashboard/super-admin/rh
  periodId: string;
}

// ─── STATUS COLOR MAP ─────────────────────────────────────────────────

const STATUS_STYLES: Record<PerformanceReviewStatut, string> = {
  programme: "bg-slate-100 text-slate-700 ring-slate-200",
  auto_eval: "bg-blue-100 text-blue-700 ring-blue-200",
  manager_review: "bg-amber-100 text-amber-700 ring-amber-200",
  meeting: "bg-purple-100 text-purple-700 ring-purple-200",
  signe: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  annule: "bg-rose-100 text-rose-700 ring-rose-200",
};

const STATUS_LABELS: Record<PerformanceReviewStatut, string> = {
  programme: "Programmée",
  auto_eval: "Auto-évaluation",
  manager_review: "Revue manager",
  meeting: "Entretien",
  signe: "Signée",
  annule: "Annulée",
};

const PERIOD_STATUS_STYLES: Record<ReviewPeriodStatut, string> = {
  planifie: "bg-amber-100 text-amber-700 ring-amber-200",
  en_cours: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  termine: "bg-blue-100 text-blue-700 ring-blue-200",
  archive: "bg-slate-100 text-slate-700 ring-slate-200",
};

const PERIOD_STATUS_LABELS: Record<ReviewPeriodStatut, string> = {
  planifie: "Planifiée",
  en_cours: "En cours",
  termine: "Terminée",
  archive: "Archivée",
};

type Filter = "all" | PerformanceReviewStatut;

// ─── HELPERS ───────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// ─── COMPOSANT ─────────────────────────────────────────────────────────

export function PeriodReviewsView({ basePath, periodId }: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState<ReviewPeriod | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/rh/review-periods", { cache: "no-store" }),
        fetch(`/api/rh/performance-reviews?period_id=${encodeURIComponent(periodId)}`, {
          cache: "no-store",
        }),
      ]);
      const pJson = await pRes.json();
      const rJson = await rRes.json();
      if (!pJson.success) throw new Error(pJson.error || "Erreur périodes");
      if (!rJson.success) throw new Error(rJson.error || "Erreur reviews");
      const found = (pJson.periods ?? []).find((p: ReviewPeriod) => p.id === periodId);
      setPeriod(found ?? null);
      setReviews(rJson.reviews ?? []);
    } catch (e) {
      console.error("[PERIOD_VIEW] fetch", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [periodId]);

  const stats = useMemo(() => {
    const c: Record<PerformanceReviewStatut, number> = {
      programme: 0,
      auto_eval: 0,
      manager_review: 0,
      meeting: 0,
      signe: 0,
      annule: 0,
    };
    for (const r of reviews) c[r.statut] += 1;
    return c;
  }, [reviews]);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.statut === filter);
  }, [reviews, filter]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-8 shadow-lg sm:px-9 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
            <Award className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              Période · {period?.year ?? "—"}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {period?.label ?? "Chargement…"}
            </h1>
            {period?.description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                {period.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
              {period && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${PERIOD_STATUS_STYLES[period.statut]}`}
                >
                  {PERIOD_STATUS_LABELS[period.statut]}
                </span>
              )}
              {period && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateShort(period.start_date)} — {formatDateShort(period.end_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <HeroStat label="Total" value={reviews.length} />
          <HeroStat label="Programmées" value={stats.programme} />
          <HeroStat label="Auto-éval" value={stats.auto_eval} accent="blue" />
          <HeroStat label="Manager" value={stats.manager_review} accent="amber" />
          <HeroStat label="Entretien" value={stats.meeting} accent="purple" />
          <HeroStat label="Signées" value={stats.signe} accent="emerald" />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* FILTRES */}
      <section className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="Toutes"
          count={reviews.length}
        />
        {(
          [
            "programme",
            "auto_eval",
            "manager_review",
            "meeting",
            "signe",
            "annule",
          ] as PerformanceReviewStatut[]
        ).map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={STATUS_LABELS[s]}
            count={stats[s]}
          />
        ))}
      </section>

      {/* LISTE */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-nexus-orange-500" />
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Reviews ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm ring-1 ring-slate-100/80">
            <Award className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
              Aucune review
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Aucune évaluation ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onOpen={() => router.push(`${basePath}/evaluations/review/${r.id}`)}
              />
            ))}
          </div>
        )}
      </section>
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
  accent?: "white" | "blue" | "amber" | "purple" | "emerald";
}) {
  const valueClass =
    accent === "blue"
      ? "text-blue-300"
      : accent === "amber"
        ? "text-amber-300"
        : accent === "purple"
          ? "text-purple-300"
          : accent === "emerald"
            ? "text-emerald-300"
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  const base = active
    ? "bg-nexus-blue-950 text-white border-nexus-blue-950"
    : "bg-white text-slate-700 border-slate-200 hover:border-nexus-orange-300 hover:text-nexus-orange-700";
  const badgeTone = active
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

function ReviewCard({
  review,
  onOpen,
}: {
  review: ReviewRow;
  onOpen: () => void;
}) {
  const emp = review.employees;
  const initials = getInitials(emp?.nom_complet ?? "?");
  const selfDone = !!review.self_assessment_submitted_at;
  const managerDone = !!review.manager_assessment_submitted_at;
  const bothSigned = !!review.signed_employee_at && !!review.signed_manager_at;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-nexus-blue-950">
              {emp?.nom_complet ?? "Employé inconnu"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {emp?.poste ?? "—"}
              {emp?.departement ? ` · ${emp.departement}` : ""}
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-nexus-blue-950" />
      </div>

      {/* STATUS */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${STATUS_STYLES[review.statut]}`}
        >
          {STATUS_LABELS[review.statut]}
        </span>
        {bothSigned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Signé
          </span>
        )}
      </div>

      {/* SUB INFOS */}
      <ul className="mt-4 space-y-1.5 text-xs">
        <li className="flex items-center gap-2">
          {selfDone ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-slate-300" />
          )}
          <span className={selfDone ? "text-slate-700" : "text-slate-400"}>
            Auto-évaluation {selfDone ? "soumise" : "en attente"}
          </span>
        </li>
        <li className="flex items-center gap-2">
          {managerDone ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-slate-300" />
          )}
          <span className={managerDone ? "text-slate-700" : "text-slate-400"}>
            Évaluation manager {managerDone ? "soumise" : "en attente"}
          </span>
        </li>
        <li className="flex items-center gap-2 text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {review.meeting_date
            ? `Entretien : ${formatDateTimeShort(review.meeting_date)}`
            : "Entretien non planifié"}
        </li>
      </ul>
    </button>
  );
}
