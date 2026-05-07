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
  Plus,
  X,
  Rocket,
  Sparkles,
} from "lucide-react";
import type { ReviewPeriod, ReviewPeriodStatut, PerformanceReviewStatut } from "@/types";
import { formatDateShort } from "./format";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface PerformanceReviewLite {
  id: string;
  employee_id: string;
  period_id: string;
  statut: PerformanceReviewStatut;
  signed_employee_at: string | null;
  signed_manager_at: string | null;
}

interface Props {
  basePath: string; // ex: /dashboard/super-admin/rh
  canCreate: boolean; // super_admin only pour créer une période
  canLaunch: boolean; // super_admin only pour lancer la campagne
}

type Filter = "all" | ReviewPeriodStatut;

// ─── CONSTANTES STATUS ─────────────────────────────────────────────────

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

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────

export function EvaluationsDashboard({ basePath, canCreate, canLaunch }: Props) {
  const router = useRouter();
  const [periods, setPeriods] = useState<ReviewPeriod[]>([]);
  const [reviews, setReviews] = useState<PerformanceReviewLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/rh/review-periods", { cache: "no-store" }),
        fetch("/api/rh/performance-reviews", { cache: "no-store" }),
      ]);
      const pJson = await pRes.json();
      const rJson = await rRes.json();
      if (!pJson.success) throw new Error(pJson.error || "Erreur périodes");
      if (!rJson.success) throw new Error(rJson.error || "Erreur reviews");
      setPeriods(pJson.periods ?? []);
      setReviews(rJson.reviews ?? []);
    } catch (e) {
      console.error("[EVAL_DASH] fetch", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Stats globales
  const stats = useMemo(() => {
    const periodsActive = periods.filter((p) => p.statut === "en_cours").length;
    const pendingReviews = reviews.filter(
      (r) => !["signe", "annule"].includes(r.statut)
    ).length;
    const signedReviews = reviews.filter((r) => r.statut === "signe").length;
    return {
      periodsActive,
      pendingReviews,
      signedReviews,
      total: reviews.length,
    };
  }, [periods, reviews]);

  const reviewsByPeriod = useMemo(() => {
    const map = new Map<string, PerformanceReviewLite[]>();
    for (const r of reviews) {
      const arr = map.get(r.period_id) ?? [];
      arr.push(r);
      map.set(r.period_id, arr);
    }
    return map;
  }, [reviews]);

  const filteredPeriods = useMemo(() => {
    if (filter === "all") return periods;
    return periods.filter((p) => p.statut === filter);
  }, [periods, filter]);

  const handleLaunch = async (periodId: string) => {
    if (
      !confirm(
        "Lancer la campagne d'évaluation ? Une review sera créée pour chaque employé actif."
      )
    ) {
      return;
    }
    setLaunchingId(periodId);
    try {
      const res = await fetch(`/api/rh/review-periods/${periodId}/launch`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      await fetchAll();
      alert(
        json.created > 0
          ? `${json.created} évaluation(s) créée(s).`
          : (json.message ?? "Campagne lancée.")
      );
    } catch (e) {
      console.error("[EVAL_DASH] launch", e);
      alert((e as Error).message);
    } finally {
      setLaunchingId(null);
    }
  };

  // Counts pour chips
  const counts = useMemo(() => {
    const c: Record<ReviewPeriodStatut, number> = {
      planifie: 0,
      en_cours: 0,
      termine: 0,
      archive: 0,
    };
    for (const p of periods) c[p.statut] += 1;
    return c;
  }, [periods]);

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
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              Évaluations de performance
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Entretiens annuels
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Pilotez les campagnes d&apos;évaluation, suivez l&apos;avancée des
              auto-évaluations et signez les bilans annuels.
            </p>
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="hidden shrink-0 items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Nouvelle période
            </button>
          )}
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat label="Périodes en cours" value={stats.periodsActive} accent="orange" />
          <HeroStat label="Reviews en attente" value={stats.pendingReviews} accent="amber" />
          <HeroStat label="Reviews signées" value={stats.signedReviews} accent="emerald" />
          <HeroStat label="Total reviews" value={stats.total} accent="white" />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* FILTRES + CTA mobile */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Toutes"
            count={periods.length}
          />
          <FilterChip
            active={filter === "planifie"}
            onClick={() => setFilter("planifie")}
            label="Planifiées"
            count={counts.planifie}
            tone="amber"
          />
          <FilterChip
            active={filter === "en_cours"}
            onClick={() => setFilter("en_cours")}
            label="En cours"
            count={counts.en_cours}
            tone="emerald"
          />
          <FilterChip
            active={filter === "termine"}
            onClick={() => setFilter("termine")}
            label="Terminées"
            count={counts.termine}
            tone="blue"
          />
          <FilterChip
            active={filter === "archive"}
            onClick={() => setFilter("archive")}
            label="Archivées"
            count={counts.archive}
            tone="slate"
          />
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 sm:hidden"
          >
            <Plus className="h-4 w-4" />
            Nouvelle période
          </button>
        )}
      </section>

      {/* PÉRIODES */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-nexus-orange-500" />
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Périodes d&apos;évaluation ({filteredPeriods.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
          </div>
        ) : filteredPeriods.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm ring-1 ring-slate-100/80">
            <Award className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
              Aucune période
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {canCreate
                ? "Créez votre première période d'évaluation pour démarrer la campagne."
                : "Aucune campagne d'évaluation en cours."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPeriods.map((p) => (
              <PeriodCard
                key={p.id}
                period={p}
                reviewCount={reviewsByPeriod.get(p.id)?.length ?? 0}
                signedCount={
                  reviewsByPeriod.get(p.id)?.filter((r) => r.statut === "signe")
                    .length ?? 0
                }
                onOpen={() => router.push(`${basePath}/evaluations/${p.id}`)}
                onLaunch={canLaunch ? () => handleLaunch(p.id) : undefined}
                launching={launchingId === p.id}
              />
            ))}
          </div>
        )}
      </section>

      {createOpen && canCreate && (
        <CreatePeriodModal
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await fetchAll();
          }}
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
  accent: "white" | "orange" | "amber" | "emerald";
}) {
  const valueClass =
    accent === "orange"
      ? "text-nexus-orange-300"
      : accent === "amber"
        ? "text-amber-300"
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
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "amber" | "emerald" | "blue" | "slate";
}) {
  const base = active
    ? "bg-nexus-blue-950 text-white border-nexus-blue-950"
    : "bg-white text-slate-700 border-slate-200 hover:border-nexus-orange-300 hover:text-nexus-orange-700";
  const TONE_BADGE: Record<string, { active: string; idle: string }> = {
    amber: { active: "bg-amber-300 text-amber-900", idle: "bg-amber-100 text-amber-700" },
    emerald: {
      active: "bg-emerald-300 text-emerald-900",
      idle: "bg-emerald-100 text-emerald-700",
    },
    blue: { active: "bg-blue-300 text-blue-900", idle: "bg-blue-100 text-blue-700" },
    slate: { active: "bg-slate-300 text-slate-900", idle: "bg-slate-100 text-slate-700" },
  };
  const badgeTone = tone
    ? active
      ? TONE_BADGE[tone].active
      : TONE_BADGE[tone].idle
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

function PeriodCard({
  period,
  reviewCount,
  signedCount,
  onOpen,
  onLaunch,
  launching,
}: {
  period: ReviewPeriod;
  reviewCount: number;
  signedCount: number;
  onOpen: () => void;
  onLaunch?: () => void;
  launching: boolean;
}) {
  const pct = reviewCount > 0 ? Math.round((signedCount / reviewCount) * 100) : 0;
  const canShowLaunch = onLaunch && period.statut === "planifie";
  return (
    <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {period.year}
            </p>
            <p className="mt-1 font-display text-base font-bold text-nexus-blue-950">
              {period.label}
            </p>
            {period.description && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {period.description}
              </p>
            )}
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-nexus-blue-950" />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${PERIOD_STATUS_STYLES[period.statut]}`}
          >
            {PERIOD_STATUS_LABELS[period.statut]}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {reviewCount} review{reviewCount > 1 ? "s" : ""}
          </span>
        </div>

        {reviewCount > 0 && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-slate-500">Signées</p>
              <p className="font-display text-base font-bold tabular-nums text-nexus-blue-950">
                {signedCount}/{reviewCount}
              </p>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <Calendar className="h-3 w-3" />
          {formatDateShort(period.start_date)} — {formatDateShort(period.end_date)}
        </div>
      </button>

      {canShowLaunch && (
        <button
          type="button"
          onClick={onLaunch}
          disabled={launching}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {launching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          Lancer la campagne
        </button>
      )}
      {period.statut === "en_cours" && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Campagne en cours
        </div>
      )}
      {period.statut === "termine" && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
          <Clock className="h-3.5 w-3.5" />
          Campagne terminée
        </div>
      )}
    </div>
  );
}

function CreatePeriodModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [label, setLabel] = useState<string>(`Évaluation annuelle ${currentYear}`);
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(`${currentYear}-12-01`);
  const [endDate, setEndDate] = useState<string>(`${currentYear}-12-31`);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/rh/review-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          label,
          description: description || undefined,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      await onCreated();
    } catch (e2) {
      console.error("[EVAL_DASH] create", e2);
      setErr((e2 as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-blue-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-nexus-blue-950">
                Nouvelle période
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Définissez la fenêtre de la campagne d&apos;évaluation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-nexus-blue-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Année
              </label>
              <input
                type="number"
                min={2020}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Libellé
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              placeholder="Optionnel — contexte / consignes"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Date début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Date fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
          </div>

          {err && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{err}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Créer la période
          </button>
        </div>
      </form>
    </div>
  );
}
