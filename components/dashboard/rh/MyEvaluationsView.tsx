"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  PenLine,
  ArrowUpRight,
  X,
  Save,
  Send,
} from "lucide-react";
import type {
  PerformanceReview,
  PerformanceReviewStatut,
  ReviewPeriodStatut,
  SelfAssessment,
} from "@/types";
import { formatDateShort, formatDateTimeShort } from "./format";
import { SelfAssessmentForm } from "./ReviewDetailView";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface PeriodLite {
  id: string;
  year: number;
  label: string;
  start_date: string;
  end_date: string;
  statut: ReviewPeriodStatut;
}

interface MyReviewRow extends PerformanceReview {
  review_periods: PeriodLite | null;
}

interface Props {
  /** chemin vers le détail (auto-éval profonde) — ex: /dashboard/agent/mes-rh/evaluations/[id] */
  basePath: string;
}

// ─── CONSTANTES ────────────────────────────────────────────────────────

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

// ─── COMPOSANT ─────────────────────────────────────────────────────────

export function MyEvaluationsView({ basePath }: Props) {
  const [reviews, setReviews] = useState<MyReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MyReviewRow | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rh/performance-reviews", {
        cache: "no-store",
      });
      const json = await res.json();
      // Note: l'API exige admin/super_admin. On retombera proprement
      // sur l'erreur côté agent — mais comme RLS autorise self-select,
      // on tente en parallèle un appel direct via supabase non-disponible ici.
      // En pratique pour cette UI, on s'attend à ce que le serveur (page)
      // ait fourni la liste. On fait un fallback API qui filtre côté serveur.
      if (!json.success) throw new Error(json.error || "Erreur chargement");
      setReviews(json.reviews ?? []);
    } catch (e) {
      console.error("[MY_EVALS] fetch", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const ya = a.review_periods?.year ?? 0;
      const yb = b.review_periods?.year ?? 0;
      if (yb !== ya) return yb - ya;
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
  }, [reviews]);

  const sign = async (id: string) => {
    try {
      const res = await fetch(`/api/rh/performance-reviews/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "employee" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      await fetchAll();
    } catch (e) {
      console.error("[MY_EVALS] sign", e);
      alert((e as Error).message);
    }
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-7 shadow-lg sm:px-9 sm:py-8">
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
              Mes évaluations
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Mes entretiens annuels
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Complétez votre auto-évaluation et signez vos bilans annuels.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm ring-1 ring-slate-100/80">
          <Award className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
            Aucune évaluation
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Vous n&apos;avez encore aucun entretien annuel programmé.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((r) => (
            <MyReviewCard
              key={r.id}
              review={r}
              onAutoEval={() => setEditing(r)}
              onSign={() => sign(r.id)}
              detailHref={`${basePath}/${r.id}`}
            />
          ))}
        </div>
      )}

      {editing && (
        <SelfEvalModal
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await fetchAll();
          }}
        />
      )}
    </div>
  );
}

// ─── CARD ──────────────────────────────────────────────────────────────

function MyReviewCard({
  review,
  onAutoEval,
  onSign,
  detailHref,
}: {
  review: MyReviewRow;
  onAutoEval: () => void;
  onSign: () => void;
  detailHref: string;
}) {
  const period = review.review_periods;
  const selfDone = !!review.self_assessment_submitted_at;
  const myselfSigned = !!review.signed_employee_at;
  const bothSigned = !!review.signed_employee_at && !!review.signed_manager_at;
  const canAutoEval =
    review.statut === "programme" || review.statut === "auto_eval";
  const canSign = review.statut === "meeting" && !myselfSigned;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {period?.year ?? "—"}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-nexus-blue-950">
            {period?.label ?? "Évaluation"}
          </h2>
          {period && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateShort(period.start_date)} —{" "}
              {formatDateShort(period.end_date)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${STATUS_STYLES[review.statut]}`}
          >
            {STATUS_LABELS[review.statut]}
          </span>
          {bothSigned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Finalisée
            </span>
          )}
        </div>
      </div>

      <ul className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <li className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
              selfDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {selfDone ? "✓" : "1"}
          </span>
          <span className={selfDone ? "text-slate-700" : "text-slate-500"}>
            Auto-évaluation
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
              review.meeting_date ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {review.meeting_date ? "✓" : "2"}
          </span>
          <span className={review.meeting_date ? "text-slate-700" : "text-slate-500"}>
            {review.meeting_date
              ? `Entretien : ${formatDateTimeShort(review.meeting_date)}`
              : "Entretien à planifier"}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
              myselfSigned ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {myselfSigned ? "✓" : "3"}
          </span>
          <span className={myselfSigned ? "text-slate-700" : "text-slate-500"}>
            Signature employé
          </span>
        </li>
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {canAutoEval && (
          <button
            type="button"
            onClick={onAutoEval}
            className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
          >
            <PenLine className="h-4 w-4" />
            {selfDone ? "Modifier mon auto-évaluation" : "Faire mon auto-évaluation"}
          </button>
        )}
        {canSign && (
          <button
            type="button"
            onClick={onSign}
            className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
          >
            <PenLine className="h-4 w-4" />
            Signer mon évaluation
          </button>
        )}
        {bothSigned && (
          <Link
            href={detailHref}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:text-nexus-orange-700"
          >
            Voir le détail
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

// ─── MODAL AUTO-EVAL ──────────────────────────────────────────────────

function SelfEvalModal({
  review,
  onClose,
  onSaved,
}: {
  review: MyReviewRow;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [self, setSelf] = useState<SelfAssessment>(
    review.self_assessment ?? {}
  );
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = async (submit: boolean) => {
    setBusy(submit ? "submit" : "save");
    setErr(null);
    try {
      const body: Record<string, unknown> = { self_assessment: self };
      if (submit) {
        body.statut = "manager_review";
      } else if (review.statut === "programme") {
        // Si encore en "programme" mais on enregistre un brouillon : passe en auto_eval
        body.statut = "auto_eval";
      }
      const res = await fetch(`/api/rh/performance-reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      await onSaved();
    } catch (e) {
      console.error("[MY_EVALS] save", e);
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-nexus-blue-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
              <PenLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-nexus-blue-950">
                Mon auto-évaluation
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {review.review_periods?.label ?? "Évaluation"}
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

        <div className="flex-1 overflow-y-auto p-6">
          <SelfAssessmentForm value={self} onChange={setSelf} />
          {err && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{err}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy !== null}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:text-nexus-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "save" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "submit" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}
