"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Save,
  PenLine,
  ArrowRight,
  Target,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import type {
  PerformanceReview,
  PerformanceReviewStatut,
  ReviewObjective,
  SelfAssessment,
  ManagerAssessment,
} from "@/types";
import { formatDateTimeShort, formatDateShort } from "./format";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface EmployeeFull {
  id: string;
  nom_complet: string;
  poste: string | null;
  departement: string | null;
  email: string;
  type_contrat: string | null;
  date_embauche: string | null;
  telephone: string | null;
}

interface PeriodLite {
  id: string;
  year: number;
  label: string;
  start_date: string;
  end_date: string;
  statut: string;
}

interface ReviewFull extends PerformanceReview {
  employees: EmployeeFull | null;
  review_periods: PeriodLite | null;
}

interface Props {
  reviewId: string;
  /** mode "admin" : édition complète. mode "self" : restreint à l'auto-éval + signature employé. */
  mode: "admin" | "self";
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

const RATING_LABELS: Record<number, string> = {
  1: "Insuffisant",
  2: "À améliorer",
  3: "Satisfaisant",
  4: "Bon",
  5: "Excellent",
};

const STEPS: {
  key: PerformanceReviewStatut;
  label: string;
  icon: typeof Briefcase;
}[] = [
  { key: "programme", label: "Programmé", icon: Calendar },
  { key: "auto_eval", label: "Auto-éval", icon: PenLine },
  { key: "manager_review", label: "Manager", icon: Users },
  { key: "meeting", label: "Entretien", icon: Briefcase },
  { key: "signe", label: "Signé", icon: CheckCircle2 },
];

const STEP_ORDER: Record<PerformanceReviewStatut, number> = {
  programme: 0,
  auto_eval: 1,
  manager_review: 2,
  meeting: 3,
  signe: 4,
  annule: -1,
};

// ─── HELPERS ───────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// ─── COMPOSANT ─────────────────────────────────────────────────────────

export function ReviewDetailView({ reviewId, mode }: Props) {
  const [review, setReview] = useState<ReviewFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Form states
  const [self, setSelf] = useState<SelfAssessment>({});
  const [mgr, setMgr] = useState<ManagerAssessment>({});
  const [objectives, setObjectives] = useState<ReviewObjective[]>([]);
  const [formationPlan, setFormationPlan] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [notesFinales, setNotesFinales] = useState("");

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rh/performance-reviews/${reviewId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      const r = json.review as ReviewFull;
      setReview(r);
      setSelf(r.self_assessment ?? {});
      setMgr(r.manager_assessment ?? {});
      setObjectives(Array.isArray(r.objectives) ? r.objectives : []);
      setFormationPlan(r.formation_plan ?? "");
      // datetime-local format : "YYYY-MM-DDTHH:mm"
      if (r.meeting_date) {
        const d = new Date(r.meeting_date);
        if (!Number.isNaN(d.getTime())) {
          const pad = (n: number) => String(n).padStart(2, "0");
          setMeetingDate(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          );
        }
      }
      setMeetingNotes(r.meeting_notes ?? "");
      setNotesFinales(r.notes_finales ?? "");
    } catch (e) {
      console.error("[REVIEW_DETAIL] fetch", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const patch = async (
    key: string,
    body: Record<string, unknown>,
    successMsg?: string
  ) => {
    setSaving(key);
    try {
      const res = await fetch(`/api/rh/performance-reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      await fetchReview();
      if (successMsg) {
        // Léger feedback
        console.log("[REVIEW_DETAIL]", successMsg);
      }
    } catch (e) {
      console.error("[REVIEW_DETAIL] patch", e);
      alert((e as Error).message);
    } finally {
      setSaving(null);
    }
  };

  const sign = async (role: "employee" | "manager") => {
    setSaving(`sign-${role}`);
    try {
      const res = await fetch(`/api/rh/performance-reviews/${reviewId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      await fetchReview();
    } catch (e) {
      console.error("[REVIEW_DETAIL] sign", e);
      alert((e as Error).message);
    } finally {
      setSaving(null);
    }
  };

  const stepIndex = useMemo(() => {
    if (!review) return -1;
    return STEP_ORDER[review.statut] ?? -1;
  }, [review]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>{error ?? "Review introuvable"}</p>
      </div>
    );
  }

  const emp = review.employees;
  const period = review.review_periods;
  const initials = getInitials(emp?.nom_complet ?? "?");
  const isAdmin = mode === "admin";
  const isSelf = mode === "self";
  const bothSigned = !!review.signed_employee_at && !!review.signed_manager_at;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-8 shadow-lg sm:px-9 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-base font-bold text-white shadow-md">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              {period?.label ?? "Évaluation"} · {period?.year ?? ""}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {emp?.nom_complet ?? "Employé inconnu"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {emp?.poste ?? "—"}
              {emp?.departement ? ` · ${emp.departement}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${STATUS_STYLES[review.statut]}`}
              >
                {STATUS_LABELS[review.statut]}
              </span>
              {bothSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Évaluation finalisée
                </span>
              )}
            </div>
          </div>
        </div>

        {/* STEPPER */}
        <Stepper currentIndex={stepIndex} />
      </section>

      {/* CTA Démarrer auto-éval (statut programme + admin) */}
      {isAdmin && review.statut === "programme" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
          <p className="text-sm text-slate-600">
            La review est programmée. Démarrez l&apos;auto-évaluation pour permettre à
            l&apos;employé (ou à vous-même) de remplir son bilan.
          </p>
          <button
            type="button"
            onClick={() =>
              patch("start-auto", { statut: "auto_eval" }, "Auto-éval démarrée")
            }
            disabled={saving === "start-auto"}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving === "start-auto" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Démarrer l&apos;auto-évaluation
          </button>
        </div>
      )}

      {/* SECTION AUTO-ÉVAL */}
      {(isAdmin || isSelf) && stepIndex >= STEP_ORDER.auto_eval && (
        <SectionCard
          icon={PenLine}
          eyebrow="Étape 1"
          title="Auto-évaluation"
          subtitle={
            review.self_assessment_submitted_at
              ? `Soumise le ${formatDateTimeShort(review.self_assessment_submitted_at)}`
              : "À compléter par l'employé"
          }
        >
          <SelfAssessmentForm
            value={self}
            onChange={setSelf}
            disabled={isSelf && stepIndex > STEP_ORDER.auto_eval}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                patch(
                  "self-save",
                  { self_assessment: self },
                  "Auto-éval enregistrée"
                )
              }
              disabled={saving === "self-save" || (isSelf && stepIndex > STEP_ORDER.auto_eval)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:text-nexus-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "self-save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
            {review.statut === "auto_eval" && (
              <button
                type="button"
                onClick={() =>
                  patch(
                    "self-submit",
                    { self_assessment: self, statut: "manager_review" },
                    "Auto-éval soumise"
                  )
                }
                disabled={saving === "self-submit"}
                className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving === "self-submit" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Soumettre l&apos;auto-évaluation
              </button>
            )}
          </div>
        </SectionCard>
      )}

      {/* SECTION MANAGER (admin only — confidentiel) */}
      {isAdmin && stepIndex >= STEP_ORDER.manager_review && (
        <SectionCard
          icon={Users}
          eyebrow="Étape 2"
          title="Évaluation manager"
          subtitle={
            review.manager_assessment_submitted_at
              ? `Soumise le ${formatDateTimeShort(review.manager_assessment_submitted_at)}`
              : "À compléter par le manager"
          }
          confidential
        >
          <ManagerAssessmentForm value={mgr} onChange={setMgr} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                patch(
                  "mgr-save",
                  { manager_assessment: mgr },
                  "Évaluation enregistrée"
                )
              }
              disabled={saving === "mgr-save"}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:text-nexus-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "mgr-save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
            {review.statut === "manager_review" && (
              <button
                type="button"
                onClick={() =>
                  patch(
                    "mgr-submit",
                    { manager_assessment: mgr, statut: "meeting" },
                    "Manager review soumise"
                  )
                }
                disabled={saving === "mgr-submit"}
                className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving === "mgr-submit" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Soumettre
              </button>
            )}
          </div>
        </SectionCard>
      )}

      {/* SECTION OBJECTIFS N+1 + FORMATION (admin only) */}
      {isAdmin && stepIndex >= STEP_ORDER.manager_review && (
        <SectionCard
          icon={Target}
          eyebrow="Étape 3"
          title="Objectifs N+1 et plan de formation"
          subtitle="Définissez les objectifs et le développement pour la prochaine période."
        >
          <ObjectivesEditor value={objectives} onChange={setObjectives} />
          <div className="mt-5">
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <GraduationCap className="h-3.5 w-3.5" />
              Plan de formation
            </label>
            <textarea
              value={formationPlan}
              onChange={(e) => setFormationPlan(e.target.value)}
              rows={4}
              placeholder="Formations, certifications, mentorat..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                patch(
                  "obj-save",
                  { objectives, formation_plan: formationPlan },
                  "Objectifs enregistrés"
                )
              }
              disabled={saving === "obj-save"}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "obj-save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
          </div>
        </SectionCard>
      )}

      {/* SECTION ENTRETIEN (admin) */}
      {isAdmin && stepIndex >= STEP_ORDER.meeting && (
        <SectionCard
          icon={Briefcase}
          eyebrow="Étape 4"
          title="Entretien"
          subtitle="Date, notes et bilan final de l'entretien."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Date du RDV
              </label>
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Notes d&apos;entretien
            </label>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Notes finales
            </label>
            <textarea
              value={notesFinales}
              onChange={(e) => setNotesFinales(e.target.value)}
              rows={3}
              placeholder="Bilan global, message de clôture..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                patch(
                  "meeting-save",
                  {
                    meeting_date: meetingDate
                      ? new Date(meetingDate).toISOString()
                      : null,
                    meeting_notes: meetingNotes,
                    notes_finales: notesFinales,
                  },
                  "Entretien enregistré"
                )
              }
              disabled={saving === "meeting-save"}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "meeting-save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer entretien
            </button>
          </div>
        </SectionCard>
      )}

      {/* SECTION SIGNATURES */}
      {stepIndex >= STEP_ORDER.meeting && (
        <SectionCard
          icon={CheckCircle2}
          eyebrow="Étape 5"
          title="Signatures"
          subtitle="Validation finale par l'employé et le manager."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SignatureBox
              label="Employé"
              signedAt={review.signed_employee_at}
              canSign={!review.signed_employee_at && (isSelf || isAdmin)}
              onSign={() => sign("employee")}
              busy={saving === "sign-employee"}
            />
            <SignatureBox
              label="Manager"
              signedAt={review.signed_manager_at}
              canSign={!review.signed_manager_at && isAdmin}
              onSign={() => sign("manager")}
              busy={saving === "sign-manager"}
            />
          </div>
          {bothSigned && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              Évaluation finalisée et signée par les deux parties.
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

// ─── STEPPER ──────────────────────────────────────────────────────────

function Stepper({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="relative mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = currentIndex > i;
        const active = currentIndex === i;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ring-1 ${
                done
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
                  : active
                    ? "border-nexus-orange-400 bg-nexus-orange-500/15 text-nexus-orange-300 ring-nexus-orange-400/30"
                    : "border-white/10 bg-white/[0.03] text-slate-400 ring-white/5"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span
              className={`hidden text-xs font-semibold sm:inline ${
                done
                  ? "text-emerald-300"
                  : active
                    ? "text-nexus-orange-300"
                    : "text-slate-400"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="hidden h-px w-6 bg-white/10 sm:inline-block" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SECTION CARD ─────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  confidential,
  children,
}: {
  icon: typeof Briefcase;
  eyebrow: string;
  title: string;
  subtitle?: string;
  confidential?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-nexus-blue-50 text-nexus-blue-800 ring-1 ring-nexus-blue-100">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {eyebrow}
            </p>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {confidential && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
            Confidentiel
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

// ─── SELF ASSESSMENT FORM ─────────────────────────────────────────────

export function SelfAssessmentForm({
  value,
  onChange,
  disabled,
}: {
  value: SelfAssessment;
  onChange: (v: SelfAssessment) => void;
  disabled?: boolean;
}) {
  const v = value ?? {};
  const objectivesReview = Array.isArray(v.objectives_review)
    ? v.objectives_review
    : [];

  const update = (patch: Partial<SelfAssessment>) => {
    onChange({ ...v, ...patch });
  };

  return (
    <div className="space-y-4">
      <FieldTextarea
        label="Réalisations principales"
        value={v.realizations ?? ""}
        onChange={(s) => update({ realizations: s })}
        rows={4}
        disabled={disabled}
        placeholder="Vos succès et résultats marquants sur la période…"
      />
      <FieldTextarea
        label="Difficultés rencontrées"
        value={v.challenges ?? ""}
        onChange={(s) => update({ challenges: s })}
        rows={3}
        disabled={disabled}
        placeholder="Obstacles, points d'amélioration identifiés…"
      />
      <FieldTextarea
        label="Compétences développées"
        value={v.skills_developed ?? ""}
        onChange={(s) => update({ skills_developed: s })}
        rows={3}
        disabled={disabled}
        placeholder="Compétences acquises ou consolidées…"
      />
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Auto-notation
        </label>
        <RatingPicker
          value={v.self_rating}
          onChange={(n) => update({ self_rating: n })}
          disabled={disabled}
        />
      </div>

      {/* Bilan objectifs */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Bilan objectifs précédents
          </label>
          {!disabled && (
            <button
              type="button"
              onClick={() =>
                update({
                  objectives_review: [
                    ...objectivesReview,
                    { objective: "", achievement: 0, comment: "" },
                  ],
                })
              }
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <Plus className="h-3 w-3" />
              Ajouter
            </button>
          )}
        </div>
        <div className="mt-2 space-y-3">
          {objectivesReview.length === 0 && (
            <p className="text-xs text-slate-400">Aucun objectif à bilanter.</p>
          )}
          {objectivesReview.map((o, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
                <input
                  type="text"
                  value={o.objective ?? ""}
                  onChange={(e) => {
                    const arr = [...objectivesReview];
                    arr[idx] = { ...arr[idx], objective: e.target.value };
                    update({ objectives_review: arr });
                  }}
                  placeholder="Objectif"
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200 disabled:bg-slate-100"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Number.isFinite(o.achievement) ? o.achievement : 0}
                    onChange={(e) => {
                      const arr = [...objectivesReview];
                      arr[idx] = {
                        ...arr[idx],
                        achievement: Number(e.target.value),
                      };
                      update({ objectives_review: arr });
                    }}
                    disabled={disabled}
                    className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200 disabled:bg-slate-100"
                  />
                  <span className="text-xs text-slate-500">%</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => {
                        const arr = objectivesReview.filter((_, i) => i !== idx);
                        update({ objectives_review: arr });
                      }}
                      aria-label="Supprimer"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={o.comment ?? ""}
                onChange={(e) => {
                  const arr = [...objectivesReview];
                  arr[idx] = { ...arr[idx], comment: e.target.value };
                  update({ objectives_review: arr });
                }}
                placeholder="Commentaire…"
                rows={2}
                disabled={disabled}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200 disabled:bg-slate-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MANAGER ASSESSMENT FORM ──────────────────────────────────────────

function ManagerAssessmentForm({
  value,
  onChange,
}: {
  value: ManagerAssessment;
  onChange: (v: ManagerAssessment) => void;
}) {
  const v = value ?? {};
  const update = (patch: Partial<ManagerAssessment>) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-4">
      <FieldTextarea
        label="Forces"
        value={v.strengths ?? ""}
        onChange={(s) => update({ strengths: s })}
        rows={3}
        placeholder="Points forts observés…"
      />
      <FieldTextarea
        label="Axes d'amélioration"
        value={v.areas_to_improve ?? ""}
        onChange={(s) => update({ areas_to_improve: s })}
        rows={3}
        placeholder="Points à travailler…"
      />
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Note globale
        </label>
        <RatingPicker
          value={v.overall_rating}
          onChange={(n) => update({ overall_rating: n })}
        />
      </div>
      <FieldTextarea
        label="Recommandation salariale (confidentiel)"
        value={v.salary_recommendation ?? ""}
        onChange={(s) => update({ salary_recommendation: s })}
        rows={2}
        placeholder="Augmentation, prime, etc."
      />
      <FieldTextarea
        label="Commentaires généraux"
        value={v.comments ?? ""}
        onChange={(s) => update({ comments: s })}
        rows={3}
      />
    </div>
  );
}

// ─── OBJECTIVES EDITOR ─────────────────────────────────────────────────

function ObjectivesEditor({
  value,
  onChange,
}: {
  value: ReviewObjective[];
  onChange: (v: ReviewObjective[]) => void;
}) {
  const add = () =>
    onChange([
      ...value,
      { objective: "", target: "", deadline: "", weight: 0 },
    ]);
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<ReviewObjective>) => {
    const arr = [...value];
    arr[idx] = { ...arr[idx], ...patch };
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Objectifs
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <Plus className="h-3 w-3" />
          Ajouter un objectif
        </button>
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-slate-400">Aucun objectif défini.</p>
      ) : (
        value.map((o, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={o.objective}
                onChange={(e) => update(idx, { objective: e.target.value })}
                placeholder="Objectif"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
              <input
                type="text"
                value={o.target ?? ""}
                onChange={(e) => update(idx, { target: e.target.value })}
                placeholder="Cible mesurable"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
              <input
                type="date"
                value={o.deadline ?? ""}
                onChange={(e) => update(idx, { deadline: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Number.isFinite(o.weight) ? o.weight : 0}
                  onChange={(e) => update(idx, { weight: Number(e.target.value) })}
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
                <span className="text-xs text-slate-500">% poids</span>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label="Supprimer"
                className="self-center rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── RATING PICKER ─────────────────────────────────────────────────────

export function RatingPicker({
  value,
  onChange,
  disabled,
}: {
  value?: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => !disabled && onChange(n)}
            disabled={disabled}
            className={`inline-flex flex-col items-start gap-0.5 rounded-2xl border px-3 py-2 text-left transition ${
              active
                ? "border-nexus-orange-400 bg-nexus-orange-50 text-nexus-orange-700 ring-2 ring-nexus-orange-200"
                : "border-slate-200 bg-white text-slate-700 hover:border-nexus-orange-300"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="font-display text-base font-bold tabular-nums">{n}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {RATING_LABELS[n]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── FIELD TEXTAREA ────────────────────────────────────────────────────

function FieldTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200 disabled:bg-slate-100"
      />
    </div>
  );
}

// ─── SIGNATURE BOX ─────────────────────────────────────────────────────

function SignatureBox({
  label,
  signedAt,
  canSign,
  onSign,
  busy,
}: {
  label: string;
  signedAt: string | null;
  canSign: boolean;
  onSign: () => void;
  busy: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        signedAt
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      {signedAt ? (
        <div className="mt-2 flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-display text-sm font-bold text-emerald-800">
              Signé
            </p>
            <p className="text-xs text-emerald-700">
              le {formatDateTimeShort(signedAt)}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            En attente
          </p>
          {canSign && (
            <button
              type="button"
              onClick={onSign}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PenLine className="h-4 w-4" />
              )}
              Signer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// formatDateShort imported but kept in case future use
void formatDateShort;
void Award;
