import {
  Rocket,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { TaskItem } from "@/components/dashboard/rh/OnboardingDetailView";
import { formatDateShort } from "@/components/dashboard/rh/format";
import type {
  Employee,
  OnboardingTask,
  OnboardingTaskCategory,
} from "@/types";
import { ONBOARDING_CATEGORY_LABELS } from "@/types";

export const metadata = {
  title: "Mon onboarding | Agent",
};

export const dynamic = "force-dynamic";

const CATEGORY_STYLES: Record<OnboardingTaskCategory, string> = {
  contrat: "bg-blue-100 text-blue-700 ring-blue-200",
  equipement: "bg-purple-100 text-purple-700 ring-purple-200",
  formation: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  admin: "bg-amber-100 text-amber-700 ring-amber-200",
  rh: "bg-rose-100 text-rose-700 ring-rose-200",
  integration: "bg-sky-100 text-sky-700 ring-sky-200",
  autre: "bg-slate-100 text-slate-700 ring-slate-200",
};

const CATEGORY_ORDER: OnboardingTaskCategory[] = [
  "contrat",
  "admin",
  "rh",
  "equipement",
  "formation",
  "integration",
  "autre",
];

export default async function MyOnboardingPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!employee) {
    return (
      <DashboardShell profile={profile}>
        <BackButton
          fallbackHref="/dashboard/agent/mes-rh"
          label="Retour à mon espace RH"
        />
        <EmptyHero />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
            <p>
              Aucun profil employé associé à votre compte. Contactez votre
              administrateur.
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const emp = employee as Employee;

  // Fetch onboarding (RLS self-select autorisé)
  const { data: onboarding } = await supabase
    .from("employee_onboarding")
    .select(
      "*, onboarding_templates(id, name, description)"
    )
    .eq("employee_id", emp.id)
    .maybeSingle();

  if (!onboarding) {
    return (
      <DashboardShell profile={profile}>
        <BackButton
          fallbackHref="/dashboard/agent/mes-rh"
          label="Retour à mon espace RH"
        />
        <EmptyHero />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm ring-1 ring-slate-100/80">
          <Rocket className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
            Aucun onboarding démarré
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Aucun parcours d&apos;intégration n&apos;a encore été démarré pour
            vous. Contactez votre administrateur.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const { data: tasksData } = await supabase
    .from("onboarding_tasks")
    .select("*")
    .eq("employee_onboarding_id", onboarding.id)
    .order("task_order");

  const tasks = (tasksData ?? []) as OnboardingTask[];

  const pct = Math.round(
    (onboarding as { completion_pct?: number }).completion_pct ?? 0
  );
  const done = !!onboarding.completed_at || pct >= 100;
  const tasksDone = tasks.filter((t) => t.completed_at).length;

  // Group by category
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    tasks: tasks.filter((t) => (t.category as OnboardingTaskCategory) === cat),
  })).filter((g) => g.tasks.length > 0);

  const tplName = (onboarding as { onboarding_templates?: { name: string } | null })
    .onboarding_templates?.name;

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent/mes-rh"
        label="Retour à mon espace RH"
      />

      {/* HERO */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-7 shadow-lg sm:px-9 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
            <Rocket className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              Mon onboarding
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Mon parcours d&apos;intégration
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Suivez l&apos;avancement de votre intégration. Les tasks sont
              validées par votre administrateur.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="font-display text-5xl font-bold tabular-nums text-white sm:text-6xl">
                {pct}%
              </p>
              <p className="text-sm text-slate-300">
                {tasksDone} sur {tasks.length} tasks complétées
              </p>
            </div>
            <div className="mt-3 h-3 w-full max-w-xl overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  done ? "bg-emerald-400" : "bg-nexus-orange-500"
                }`}
                style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Démarré le {formatDateShort(onboarding.started_at)}
              </span>
              {onboarding.completed_at && (
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complété le {formatDateShort(onboarding.completed_at)}
                </span>
              )}
              {tplName && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Template : {tplName}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* INFO BANDEAU READ-ONLY */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Clock className="h-4 w-4 shrink-0 text-sky-700" />
        <p>
          Affichage en lecture seule. La validation des tasks est effectuée par
          votre administrateur RH.
        </p>
      </div>

      {/* TASKS */}
      <div className="space-y-6">
        {groups.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Aucune task pour l&apos;instant.
          </div>
        ) : (
          groups.map(({ cat, tasks: arr }) => {
            const completed = arr.filter((t) => t.completed_at).length;
            return (
              <section
                key={cat}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${CATEGORY_STYLES[cat]}`}
                  >
                    {ONBOARDING_CATEGORY_LABELS[cat]}
                  </span>
                  <p className="text-xs font-semibold text-slate-500">
                    {completed} / {arr.length}
                  </p>
                </div>
                <ul className="space-y-3">
                  {arr.map((t) => (
                    <TaskItem
                      key={t.id}
                      task={t}
                      busy={false}
                      canEdit={false}
                    />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}

function EmptyHero() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
        <Rocket className="h-6 w-6" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
          Mon parcours d&apos;intégration
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Suivez l&apos;avancement de votre onboarding.
        </p>
      </div>
    </div>
  );
}
