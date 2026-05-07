"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListChecks,
  ArrowUpRight,
  Sparkles,
  X,
  Users,
  Calendar,
} from "lucide-react";
import type {
  OnboardingTemplate,
  OnboardingTaskTemplate,
} from "@/types";
import { formatDateShort } from "./format";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface EmployeeLite {
  id: string;
  nom_complet: string;
  poste: string | null;
  departement: string | null;
  type_contrat: string | null;
  date_embauche: string;
  statut?: string;
}

interface OnboardingRow {
  id: string;
  employee_id: string;
  template_id: string | null;
  started_at: string;
  completed_at: string | null;
  completion_pct: number;
  notes: string | null;
  employees: EmployeeLite | null;
  onboarding_templates: { name: string } | null;
}

interface Props {
  basePath: string;
  canStart: boolean;
}

type Filter = "all" | "in_progress" | "completed";

// ─── HELPERS ───────────────────────────────────────────────────────────

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

function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "0";
  return Math.round(n).toString();
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────

export function OnboardingDashboard({ basePath, canStart }: Props) {
  const router = useRouter();
  const [onboardings, setOnboardings] = useState<OnboardingRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [startModalEmp, setStartModalEmp] = useState<EmployeeLite | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [obRes, empRes, tplRes] = await Promise.all([
        fetch("/api/rh/onboarding", { cache: "no-store" }),
        fetch("/api/rh/employees", { cache: "no-store" }),
        fetch("/api/rh/onboarding-templates", { cache: "no-store" }),
      ]);
      const obJson = await obRes.json();
      const empJson = await empRes.json();
      const tplJson = await tplRes.json();
      if (!obJson.success) throw new Error(obJson.error || "Erreur onboardings");
      if (!empJson.success) throw new Error(empJson.error || "Erreur employees");
      if (!tplJson.success) throw new Error(tplJson.error || "Erreur templates");
      setOnboardings(obJson.onboardings ?? []);
      setEmployees(empJson.employees ?? []);
      setTemplates(tplJson.templates ?? []);
    } catch (e) {
      console.error("[ONBOARDING_DASH] fetch", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Stats top
  const stats = useMemo(() => {
    const inProgress = onboardings.filter(
      (o) => !o.completed_at && (o.completion_pct ?? 0) < 100
    ).length;
    const completed = onboardings.filter(
      (o) => o.completed_at || (o.completion_pct ?? 0) >= 100
    ).length;
    const overdue = onboardings.filter((o) => {
      if (o.completed_at) return false;
      const started = new Date(o.started_at).getTime();
      // En retard si plus de 30 jours et pas complete
      return Date.now() - started > 30 * 24 * 3600 * 1000;
    }).length;
    return {
      inProgress,
      completed,
      overdue,
      totalTemplates: templates.length,
    };
  }, [onboardings, templates]);

  const employeesWithoutOnboarding = useMemo(() => {
    const active = employees.filter((e) => !e.statut || e.statut === "actif");
    const withOb = new Set(onboardings.map((o) => o.employee_id));
    return active.filter((e) => !withOb.has(e.id));
  }, [employees, onboardings]);

  const filteredOnboardings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return onboardings.filter((o) => {
      if (filter === "in_progress") {
        if (o.completed_at || (o.completion_pct ?? 0) >= 100) return false;
      }
      if (filter === "completed") {
        if (!o.completed_at && (o.completion_pct ?? 0) < 100) return false;
      }
      if (q) {
        const name = (o.employees?.nom_complet ?? "").toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [onboardings, filter, search]);

  const handleStart = async (employeeId: string, templateId: string) => {
    try {
      const res = await fetch(`/api/rh/onboarding/${employeeId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      router.push(`${basePath}/onboarding/${employeeId}`);
    } catch (e) {
      console.error("[ONBOARDING_DASH] start", e);
      alert((e as Error).message);
    }
  };

  const counts = useMemo(() => {
    let inProg = 0;
    let done = 0;
    for (const o of onboardings) {
      if (o.completed_at || (o.completion_pct ?? 0) >= 100) done += 1;
      else inProg += 1;
    }
    return { inProg, done };
  }, [onboardings]);

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
            <Rocket className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              Onboarding
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Intégration des nouveaux employés
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Suivez l&apos;avancement des parcours d&apos;intégration et lancez
              de nouveaux onboardings depuis un template.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat label="En cours" value={stats.inProgress} accent="white" />
          <HeroStat label="À 100%" value={stats.completed} accent="orange" />
          <HeroStat label="En retard" value={stats.overdue} accent="amber" />
          <HeroStat
            label="Templates"
            value={stats.totalTemplates}
            accent="white"
          />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* FILTRES + SEARCH */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Tous"
            count={onboardings.length}
          />
          <FilterChip
            active={filter === "in_progress"}
            onClick={() => setFilter("in_progress")}
            label="En cours"
            count={counts.inProg}
            tone="orange"
          />
          <FilterChip
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
            label="Terminés"
            count={counts.done}
            tone="emerald"
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

      {/* ONBOARDINGS ACTIFS */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-nexus-orange-500" />
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Onboardings actifs ({filteredOnboardings.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
          </div>
        ) : filteredOnboardings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm ring-1 ring-slate-100/80">
            <ListChecks className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
              Aucun onboarding
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Aucun parcours ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredOnboardings.map((o) => (
              <OnboardingCard
                key={o.id}
                onboarding={o}
                href={`${basePath}/onboarding/${o.employee_id}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* EMPLOYÉS SANS ONBOARDING */}
      {canStart && employeesWithoutOnboarding.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-nexus-orange-500" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Employés sans onboarding ({employeesWithoutOnboarding.length})
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {employeesWithoutOnboarding.map((e) => (
              <NoOnboardingCard
                key={e.id}
                employee={e}
                onStart={() => setStartModalEmp(e)}
              />
            ))}
          </div>
        </section>
      )}

      {/* MODAL DEMARRAGE */}
      {startModalEmp && (
        <StartModal
          employee={startModalEmp}
          templates={templates}
          onClose={() => setStartModalEmp(null)}
          onStart={(tplId) => handleStart(startModalEmp.id, tplId)}
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
  tone?: "orange" | "emerald";
}) {
  const base = active
    ? "bg-nexus-blue-950 text-white border-nexus-blue-950"
    : "bg-white text-slate-700 border-slate-200 hover:border-nexus-orange-300 hover:text-nexus-orange-700";
  const badgeTone =
    tone === "orange"
      ? active
        ? "bg-nexus-orange-300 text-nexus-orange-900"
        : "bg-nexus-orange-100 text-nexus-orange-700"
      : tone === "emerald"
        ? active
          ? "bg-emerald-300 text-emerald-900"
          : "bg-emerald-100 text-emerald-700"
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

function OnboardingCard({
  onboarding,
  href,
}: {
  onboarding: OnboardingRow;
  href: string;
}) {
  const o = onboarding;
  const emp = o.employees;
  const initials = getInitials(emp?.nom_complet ?? "?");
  const pct = Math.round(o.completion_pct ?? 0);
  const done = !!o.completed_at || pct >= 100;
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
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

      {/* BADGES */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {emp?.type_contrat && (
          <span className="inline-flex items-center rounded-full bg-nexus-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-blue-800 ring-1 ring-nexus-blue-200">
            {emp.type_contrat}
          </span>
        )}
        {o.onboarding_templates?.name && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {o.onboarding_templates.name}
          </span>
        )}
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Terminé
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-orange-700 ring-1 ring-nexus-orange-200">
            <Clock className="h-2.5 w-2.5" />
            En cours
          </span>
        )}
      </div>

      {/* PROGRESS */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs text-slate-500">Progression</p>
          <p className="font-display text-lg font-bold tabular-nums text-nexus-blue-950">
            {formatPct(pct)}%
          </p>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              done ? "bg-emerald-500" : "bg-nexus-orange-500"
            }`}
            style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Démarré {formatRelative(o.started_at)}
        </span>
      </div>
    </button>
  );
}

function NoOnboardingCard({
  employee,
  onStart,
}: {
  employee: EmployeeLite;
  onStart: () => void;
}) {
  const initials = getInitials(employee.nom_complet);
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:border-nexus-orange-300">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-nexus-blue-950">
            {employee.nom_complet}
          </p>
          <p className="truncate text-xs text-slate-500">
            {employee.poste ?? "—"}
            {employee.departement ? ` · ${employee.departement}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Embauché le {formatDateShort(employee.date_embauche)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
      >
        <Sparkles className="h-4 w-4" />
        Démarrer l&apos;onboarding
      </button>
    </div>
  );
}

function StartModal({
  employee,
  templates,
  onClose,
  onStart,
}: {
  employee: EmployeeLite;
  templates: OnboardingTemplate[];
  onClose: () => void;
  onStart: (templateId: string) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    // Pre-sélection : template avec type_contrat correspondant
    const match = templates.find(
      (t) =>
        t.type_contrat &&
        employee.type_contrat &&
        t.type_contrat.toLowerCase() === employee.type_contrat.toLowerCase()
    );
    return match?.id ?? templates[0]?.id ?? null;
  });
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await onStart(selectedId);
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
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-nexus-blue-950">
                Démarrer l&apos;onboarding
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Pour <span className="font-semibold">{employee.nom_complet}</span>
                {employee.type_contrat ? ` · ${employee.type_contrat}` : ""}
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

        <div className="max-h-[60vh] overflow-y-auto p-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Sélectionnez un template
          </p>
          {templates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Aucun template disponible.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((t) => {
                const active = selectedId === t.id;
                const tasks =
                  (t.default_tasks as OnboardingTaskTemplate[]) ?? [];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-nexus-orange-400 bg-nexus-orange-50/60 ring-2 ring-nexus-orange-200"
                        : "border-slate-200 bg-white hover:border-nexus-orange-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-base font-bold text-nexus-blue-950">
                        {t.name}
                      </p>
                      {t.type_contrat && (
                        <span className="inline-flex items-center rounded-full bg-nexus-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-blue-800 ring-1 ring-nexus-blue-200">
                          {t.type_contrat}
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="mt-1.5 text-xs text-slate-600">
                        {t.description}
                      </p>
                    )}
                    <p className="mt-3 text-[11px] font-semibold text-slate-500">
                      {tasks.length} task{tasks.length > 1 ? "s" : ""}
                    </p>
                  </button>
                );
              })}
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
            type="button"
            onClick={handleConfirm}
            disabled={submitting || !selectedId}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Démarrer
          </button>
        </div>
      </div>
    </div>
  );
}
