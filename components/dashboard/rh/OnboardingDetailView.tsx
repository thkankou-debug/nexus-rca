"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Tag,
  ListChecks,
  TimerReset,
  CalendarClock,
} from "lucide-react";
import type {
  OnboardingTask,
  OnboardingTaskCategory,
} from "@/types";
import { ONBOARDING_CATEGORY_LABELS } from "@/types";
import { formatDateShort, formatDateTimeShort } from "./format";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface EmployeeLite {
  id: string;
  nom_complet: string;
  poste: string | null;
  departement: string | null;
  type_contrat: string | null;
  date_embauche: string;
  email: string | null;
  telephone: string | null;
}

interface OnboardingFull {
  id: string;
  employee_id: string;
  template_id: string | null;
  started_at: string;
  completed_at: string | null;
  completion_pct: number;
  notes: string | null;
  employees: EmployeeLite | null;
  onboarding_templates: { id: string; name: string; description: string | null } | null;
}

interface Props {
  employeeId: string;
  basePath: string;
  canReset: boolean;
}

// ─── CATEGORY STYLES ──────────────────────────────────────────────────

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

// ─── HELPERS ──────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function isDueDateOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────

export function OnboardingDetailView({ employeeId, basePath, canReset }: Props) {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<OnboardingFull | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rh/onboarding/${employeeId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur de chargement");
      setOnboarding(json.onboarding);
      setTasks(json.tasks ?? []);
    } catch (e) {
      console.error("[ONBOARDING_DETAIL] fetch", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleToggle = async (task: OnboardingTask) => {
    setBusyId(task.id);
    try {
      const res = await fetch(`/api/rh/onboarding-tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed_at }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      // Re-fetch pour récupérer completion_pct mis à jour
      await fetchData();
    } catch (e) {
      console.error("[ONBOARDING_DETAIL] toggle", e);
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleNotesBlur = async (task: OnboardingTask, value: string) => {
    if ((task.notes ?? "") === value) return;
    try {
      const res = await fetch(`/api/rh/onboarding-tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      // Mise à jour locale
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, notes: value } : t))
      );
    } catch (e) {
      console.error("[ONBOARDING_DETAIL] notes", e);
      alert((e as Error).message);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch(`/api/rh/onboarding/${employeeId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      router.push(`${basePath}/onboarding`);
    } catch (e) {
      console.error("[ONBOARDING_DETAIL] reset", e);
      alert((e as Error).message);
      setResetting(false);
    }
  };

  // Stats par categorie
  const tasksByCategory = useMemo(() => {
    const map = new Map<OnboardingTaskCategory, OnboardingTask[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const t of tasks) {
      const cat = (t.category as OnboardingTaskCategory) ?? "autre";
      const arr = map.get(cat) ?? [];
      arr.push(t);
      map.set(cat, arr);
    }
    // Sort tasks par ordre
    for (const [cat, arr] of map) {
      arr.sort((a, b) => a.task_order - b.task_order);
      map.set(cat, arr);
    }
    return map;
  }, [tasks]);

  const categoryStats = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => {
      const arr = tasksByCategory.get(cat) ?? [];
      const completed = arr.filter((t) => t.completed_at).length;
      return { cat, total: arr.length, completed };
    }).filter((s) => s.total > 0);
  }, [tasksByCategory]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => isDueDateOverdue(t.due_date, !!t.completed_at));
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => !t.completed_at && t.due_date)
      .sort((a, b) => {
        const da = new Date(a.due_date as string).getTime();
        const db = new Date(b.due_date as string).getTime();
        return da - db;
      })
      .slice(0, 5);
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            Aucun onboarding pour cet employé. Démarrez-en un depuis la liste
            des onboardings.
          </p>
        </div>
      </div>
    );
  }

  const emp = onboarding.employees;
  const initials = getInitials(emp?.nom_complet ?? "?");
  const pct = Math.round(onboarding.completion_pct ?? 0);
  const done = !!onboarding.completed_at || pct >= 100;

  return (
    <div className="space-y-6">
      {/* HEADER EMPLOYE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-lg font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-nexus-blue-950">
                {emp?.nom_complet ?? "Employé"}
              </h2>
              <p className="text-sm text-slate-600">
                {emp?.poste ?? "—"}
                {emp?.departement ? ` · ${emp.departement}` : ""}
              </p>
              {emp?.type_contrat && (
                <span className="mt-1.5 inline-flex items-center rounded-full bg-nexus-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-blue-800 ring-1 ring-nexus-blue-200">
                  {emp.type_contrat}
                </span>
              )}
            </div>
          </div>

          {canReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              <TimerReset className="h-4 w-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* HERO PROGRESSION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-7 shadow-lg sm:px-9 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              <Rocket className="h-3 w-3" />
              Parcours d&apos;intégration
            </span>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="font-display text-5xl font-bold tabular-nums text-white sm:text-6xl">
                {pct}%
              </p>
              <p className="text-sm text-slate-300">
                {tasks.filter((t) => t.completed_at).length} sur {tasks.length}{" "}
                tasks complétées
              </p>
            </div>
            <div className="mt-4 h-3 w-full max-w-xl overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  done ? "bg-emerald-400" : "bg-nexus-orange-500"
                }`}
                style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
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
              {onboarding.onboarding_templates?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Template : {onboarding.onboarding_templates.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID : tasks + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* TASKS BY CATEGORY */}
        <div className="space-y-6">
          {categoryStats.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm ring-1 ring-slate-100/80">
              <ListChecks className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
                Aucune task
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Cet onboarding n&apos;a pas de tasks définies.
              </p>
            </div>
          ) : (
            categoryStats.map(({ cat }) => {
              const arr = tasksByCategory.get(cat) ?? [];
              if (arr.length === 0) return null;
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
                    {arr.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        busy={busyId === task.id}
                        canEdit
                        onToggle={() => handleToggle(task)}
                        onNotesBlur={(value) => handleNotesBlur(task, value)}
                      />
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4">
          {/* Récapitulatif catégories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
            <h3 className="mb-3 font-display text-sm font-bold text-nexus-blue-950">
              Récapitulatif catégories
            </h3>
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-500">Aucune catégorie</p>
            ) : (
              <ul className="space-y-2.5">
                {categoryStats.map(({ cat, total, completed }) => {
                  const catPct =
                    total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <li key={cat}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-700">
                          {ONBOARDING_CATEGORY_LABELS[cat]}
                        </span>
                        <span className="font-bold tabular-nums text-nexus-blue-950">
                          {completed}/{total}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-nexus-orange-500 transition-all"
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Tasks en retard */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-nexus-blue-950">
                Tasks en retard
              </h3>
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ring-1 ${
                  overdueTasks.length > 0
                    ? "bg-rose-100 text-rose-700 ring-rose-200"
                    : "bg-emerald-100 text-emerald-700 ring-emerald-200"
                }`}
              >
                {overdueTasks.length}
              </span>
            </div>
            {overdueTasks.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Aucune task en retard. Bravo.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {overdueTasks.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className="rounded-lg bg-rose-50 px-3 py-2 text-xs ring-1 ring-rose-100"
                  >
                    <p className="font-semibold text-rose-900">{t.label}</p>
                    <p className="text-[10px] text-rose-700">
                      Échéance : {formatDateShort(t.due_date)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Prochaines deadlines */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-nexus-blue-950">
              <CalendarClock className="h-4 w-4 text-nexus-orange-500" />
              Prochaines deadlines
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500">Aucune deadline à venir.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingDeadlines.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-xs ring-1 ring-slate-100"
                  >
                    <p className="truncate font-semibold text-nexus-blue-950">
                      {t.label}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatDateShort(t.due_date)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* MODAL CONFIRM RESET */}
      {confirmReset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-blue-950/60 p-4 backdrop-blur-sm"
          onClick={() => !resetting && setConfirmReset(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Réinitialiser cet onboarding ?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Toutes les tasks et leur progression seront supprimées. Cette
                  action est irréversible.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TASK ITEM (utilisable read-only et editable) ─────────────────────

export function TaskItem({
  task,
  busy,
  canEdit,
  onToggle,
  onNotesBlur,
}: {
  task: OnboardingTask;
  busy: boolean;
  canEdit: boolean;
  onToggle?: () => void;
  onNotesBlur?: (value: string) => void;
}) {
  const [notesDraft, setNotesDraft] = useState(task.notes ?? "");
  const completed = !!task.completed_at;
  const overdue = isDueDateOverdue(task.due_date, completed);

  useEffect(() => {
    setNotesDraft(task.notes ?? "");
  }, [task.notes]);

  return (
    <li
      className={`rounded-2xl border p-4 transition ${
        completed
          ? "border-emerald-200 bg-emerald-50/40"
          : overdue
            ? "border-rose-200 bg-rose-50/30"
            : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={canEdit ? onToggle : undefined}
          disabled={!canEdit || busy}
          aria-label={completed ? "Marquer comme non complétée" : "Marquer comme complétée"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
            completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 bg-white hover:border-nexus-orange-400"
          } ${!canEdit ? "cursor-default opacity-80" : ""} ${busy ? "opacity-50" : ""}`}
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : completed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`text-sm font-semibold ${
                completed
                  ? "text-emerald-800 line-through decoration-emerald-400"
                  : "text-nexus-blue-950"
              }`}
            >
              {task.label}
            </p>
            {task.mandatory && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 ring-1 ring-rose-200">
                Obligatoire
              </span>
            )}
            {task.due_date && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                  overdue
                    ? "bg-rose-100 text-rose-700 ring-rose-200"
                    : "bg-slate-100 text-slate-600 ring-slate-200"
                }`}
              >
                <Calendar className="h-2.5 w-2.5" />
                {formatDateShort(task.due_date)}
              </span>
            )}
          </div>
          {task.description && (
            <p className="mt-1.5 text-xs text-slate-600">{task.description}</p>
          )}
          {completed && task.completed_at && (
            <p className="mt-1.5 text-[11px] text-emerald-700">
              <CheckCircle2 className="mr-1 inline h-3 w-3" />
              Complétée le {formatDateTimeShort(task.completed_at)}
            </p>
          )}
          {canEdit && onNotesBlur && (
            <input
              type="text"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => onNotesBlur(notesDraft)}
              placeholder="Ajouter une note (optionnel)…"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-nexus-blue-950 shadow-sm placeholder:text-slate-400 focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          )}
          {!canEdit && task.notes && (
            <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 ring-1 ring-slate-100">
              <Clock className="mr-1 inline h-3 w-3" />
              {task.notes}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
