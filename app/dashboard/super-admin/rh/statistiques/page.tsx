import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/BackButton";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  Cake,
  FileBadge2,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";

export const metadata = {
  title: "RH — Statistiques | Super Admin",
};

export const dynamic = "force-dynamic";

function formatFcfa(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const FRENCH_MONTHS_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

interface EmployeeRow {
  id: string;
  statut: string;
  salaire_base: number | string | null;
  date_embauche: string | null;
  date_naissance: string | null;
  departement: string;
  type_contrat: string | null;
}

interface PayslipRow {
  id: string;
  statut: string;
  validated_at: string | null;
  created_at: string;
}

const AGE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "18-24", min: 18, max: 24 },
  { label: "25-34", min: 25, max: 34 },
  { label: "35-44", min: 35, max: 44 },
  { label: "45-54", min: 45, max: 54 },
  { label: "55+", min: 55, max: 200 },
];

// Palette stable pour les segments de donut
const DONUT_PALETTE = [
  "#0C1C40", // navy
  "#FF6600", // orange
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#f43f5e", // rose
];

const DEPT_PALETTE = [
  "from-nexus-blue-700 to-nexus-blue-900",
  "from-nexus-orange-500 to-nexus-orange-700",
  "from-emerald-500 to-emerald-700",
  "from-purple-500 to-purple-700",
  "from-amber-500 to-amber-600",
  "from-sky-500 to-sky-700",
  "from-rose-500 to-rose-700",
];

export default async function StatistiquesRhPage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const [employeesRes, payslipsRes] = await Promise.all([
    supabase
      .from("employees")
      .select(
        "id, statut, salaire_base, date_embauche, date_naissance, departement, type_contrat"
      ),
    supabase
      .from("payslips")
      .select("id, statut, validated_at, created_at"),
  ]);

  const employees = (employeesRes.data ?? []) as EmployeeRow[];
  const payslips = (payslipsRes.data ?? []) as PayslipRow[];
  const actifs = employees.filter((e) => e.statut === "actif");

  // KPI
  const effectifActif = actifs.length;
  const masseSalariale = actifs.reduce(
    (s, e) => s + Number(e.salaire_base ?? 0),
    0
  );
  const ancArr = actifs
    .map((e) => {
      if (!e.date_embauche) return null;
      const d = new Date(e.date_embauche);
      if (Number.isNaN(d.getTime())) return null;
      return (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    })
    .filter((v): v is number => v !== null);
  const ancMoy =
    ancArr.length > 0 ? ancArr.reduce((s, v) => s + v, 0) / ancArr.length : null;
  const ancLabel =
    ancMoy === null
      ? "—"
      : `${ancMoy.toFixed(1)} an${ancMoy >= 2 ? "s" : ""}`;
  const validees = payslips.filter((p) => p.statut === "validee").length;

  // Pyramide d'âge
  const ageBuckets = AGE_BUCKETS.map((b) => ({ ...b, count: 0 }));
  for (const e of actifs) {
    if (!e.date_naissance) continue;
    const d = new Date(e.date_naissance);
    if (Number.isNaN(d.getTime())) continue;
    const age = Math.floor(
      (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const b = ageBuckets.find((x) => age >= x.min && age <= x.max);
    if (b) b.count += 1;
  }
  const maxAgeBucket = Math.max(1, ...ageBuckets.map((b) => b.count));
  const totalAvecDateNaissance = ageBuckets.reduce((s, b) => s + b.count, 0);

  // Répartition département
  const deptMap = new Map<string, number>();
  for (const e of actifs) {
    const k = e.departement || "—";
    deptMap.set(k, (deptMap.get(k) ?? 0) + 1);
  }
  const deptList = Array.from(deptMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const totalDept = deptList.reduce((s, d) => s + d.count, 0) || 1;

  // Type de contrats
  const contratMap = new Map<string, number>();
  for (const e of actifs) {
    const k = e.type_contrat || "Non défini";
    contratMap.set(k, (contratMap.get(k) ?? 0) + 1);
  }
  const contratList = Array.from(contratMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const totalContrats = contratList.reduce((s, c) => s + c.count, 0) || 1;

  // Activité paie 12 mois
  const now = new Date();
  const monthsBuckets: { key: string; label: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: FRENCH_MONTHS_SHORT[d.getMonth()],
      count: 0,
    });
  }
  for (const p of payslips) {
    if (p.statut !== "validee" || !p.validated_at) continue;
    const d = new Date(p.validated_at);
    if (Number.isNaN(d.getTime())) continue;
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    const b = monthsBuckets.find((x) => x.key === k);
    if (b) b.count += 1;
  }
  const trendData = monthsBuckets.map((b) => b.count);
  const maxMonth = Math.max(1, ...trendData);

  return (
    <>
      <BackButton fallbackHref="/dashboard/super-admin/rh" label="Retour RH" />

      {/* Hero compact */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Statistiques
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Statistiques RH
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Vue analytique sur l&apos;effectif, la masse salariale, les
          départements et l&apos;activité paie.
        </p>
      </div>

      {/* KPI top */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Effectif actif"
          value={formatNumber(effectifActif)}
          icon={Users}
          accent="from-nexus-blue-700 to-nexus-blue-900"
        />
        <Kpi
          label="Masse salariale / mois"
          value={formatFcfa(masseSalariale)}
          icon={TrendingUp}
          accent="from-emerald-500 to-emerald-700"
        />
        <Kpi
          label="Ancienneté moyenne"
          value={ancLabel}
          icon={Clock}
          accent="from-nexus-orange-400 to-nexus-orange-600"
        />
        <Kpi
          label="Fiches paie validées"
          value={formatNumber(validees)}
          icon={CheckCircle2}
          accent="from-purple-500 to-purple-700"
        />
      </section>

      {/* Répartition département */}
      <section className="mb-10">
        <SectionHeader
          icon={Building2}
          eyebrow="Répartition"
          title="Effectif par département"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deptList.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100/80">
              Aucune donnée.
            </div>
          ) : (
            deptList.map((d, i) => {
              const pct = (d.count / totalDept) * 100;
              const grad = DEPT_PALETTE[i % DEPT_PALETTE.length];
              return (
                <div
                  key={d.label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm font-bold text-nexus-blue-950">
                      {d.label}
                    </p>
                    <span className="font-display text-lg font-bold tabular-nums text-nexus-blue-950">
                      {d.count}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500 tabular-nums">
                    {pct.toFixed(1)}% de l&apos;effectif
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Pyramide d'âge */}
      <section className="mb-10">
        <SectionHeader
          icon={Cake}
          eyebrow="Démographie"
          title="Pyramide d'âge"
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
          {totalAvecDateNaissance === 0 ? (
            <p className="text-sm text-slate-500">
              Aucune date de naissance renseignée pour les employés actifs.
            </p>
          ) : (
            <ul className="space-y-3">
              {ageBuckets.map((b) => {
                const pct = (b.count / maxAgeBucket) * 100;
                return (
                  <li key={b.label} className="flex items-center gap-4">
                    <span className="w-16 shrink-0 text-xs font-semibold text-slate-600">
                      {b.label}
                    </span>
                    <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-slate-100">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-display text-sm font-bold tabular-nums text-nexus-blue-950">
                      {b.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Type de contrats — donut */}
      <section className="mb-10">
        <SectionHeader
          icon={FileBadge2}
          eyebrow="Contrats"
          title="Répartition par type de contrat"
        />
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 lg:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <DonutChart
              data={contratList.map((c, i) => ({
                value: c.count,
                color: DONUT_PALETTE[i % DONUT_PALETTE.length],
                label: c.label,
              }))}
              total={totalContrats}
            />
          </div>
          <ul className="space-y-2.5">
            {contratList.length === 0 ? (
              <li className="text-sm text-slate-500">Aucune donnée.</li>
            ) : (
              contratList.map((c, i) => {
                const pct = (c.count / totalContrats) * 100;
                return (
                  <li
                    key={c.label}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          DONUT_PALETTE[i % DONUT_PALETTE.length],
                      }}
                    />
                    <span className="flex-1 text-sm font-semibold text-nexus-blue-950">
                      {c.label}
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums text-nexus-blue-950">
                      {c.count}
                    </span>
                    <span className="w-14 text-right text-xs text-slate-500 tabular-nums">
                      {pct.toFixed(1)}%
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      {/* Activité paie 12 mois */}
      <section>
        <SectionHeader
          icon={BarChart3}
          eyebrow="Activité paie"
          title="Fiches validées sur 12 mois"
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
          {trendData.every((v) => v === 0) ? (
            <p className="text-sm text-slate-500">
              Aucune fiche validée sur les 12 derniers mois.
            </p>
          ) : (
            <>
              <div className="text-nexus-orange-500">
                <Sparkline
                  data={trendData}
                  height={120}
                  strokeWidth={2.5}
                  showDot
                />
              </div>
              <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-12">
                {monthsBuckets.map((b) => {
                  const h = (b.count / maxMonth) * 100;
                  return (
                    <div
                      key={b.key}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="relative flex h-16 w-full items-end justify-center rounded-lg bg-slate-50">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-nexus-blue-900 to-nexus-blue-700 transition-all"
                          style={{ height: `${Math.max(4, h)}%` }}
                        />
                      </div>
                      <span className="font-display text-[11px] font-bold tabular-nums text-nexus-blue-950">
                        {b.count}
                      </span>
                      <span className="text-[10px] uppercase text-slate-500">
                        {b.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums text-nexus-blue-950 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

// ─── Donut SVG inline (pas de bibliothèque) ────────────────────────────────
function DonutChart({
  data,
  total,
}: {
  data: { value: number; color: string; label: string }[];
  total: number;
}) {
  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
      </svg>
    );
  }

  let offset = 0;
  const segments = data.map((d) => {
    const length = (d.value / total) * circumference;
    const seg = {
      color: d.color,
      length,
      offset: -offset,
    };
    offset += length;
    return seg;
  });

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.length} ${circumference - s.length}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold tabular-nums text-nexus-blue-950">
          {total}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Total
        </span>
      </div>
    </div>
  );
}
