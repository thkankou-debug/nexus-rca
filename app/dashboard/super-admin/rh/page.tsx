import Link from "next/link";
import {
  Briefcase,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  FolderOpen,
  Library,
  BarChart3,
  Network,
  FileText,
  ArrowUpRight,
  Plus,
  Plane,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";

export const metadata = {
  title: "RH — Centre de pilotage entreprise | Super Admin",
};

export const dynamic = "force-dynamic";

const BASE = "/dashboard/super-admin/rh";

function formatFcfa(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
  const y = Math.round(m / 12);
  return `il y a ${y} an${y > 1 ? "s" : ""}`;
}

const DOT_GRID: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

interface EmployeeLite {
  id: string;
  statut: string;
  salaire_base: number | string | null;
  date_embauche: string | null;
  profile_id: string | null;
}

interface PayslipHistoryRow {
  id: string;
  payslip_id: string;
  action: string;
  performed_by: string | null;
  note: string | null;
  created_at: string;
}

interface NoteRow {
  id: string;
  employee_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
}

interface CompanyDocRow {
  id: string;
  name: string;
  type: string;
  uploaded_by: string | null;
  created_at: string;
}

interface HrDocRow {
  id: string;
  employee_id: string;
  nom: string;
  uploaded_by: string | null;
  created_at: string;
}

export default async function RhOverviewPage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartISO = monthStart.toISOString();

  const [
    employeesRes,
    payslipsPendingRes,
    payslipsValidatedMonthRes,
    payslipsTotalRes,
    hrDocsCountRes,
    contratsRes,
    companyDocsCountRes,
    historyRes,
    notesRes,
    companyDocsRecentRes,
    hrDocsRecentRes,
    profilesRes,
    employeesNamedRes,
    leavesPendingRes,
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("id, statut, salaire_base, date_embauche, profile_id"),
    supabase
      .from("payslips")
      .select("id, statut", { count: "exact", head: true })
      .eq("statut", "en_attente_validation"),
    supabase
      .from("payslips")
      .select("id", { count: "exact", head: true })
      .eq("statut", "validee")
      .gte("validated_at", monthStartISO),
    supabase
      .from("payslips")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("hr_documents")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("hr_documents")
      .select("employee_id")
      .eq("type", "contrat"),
    supabase
      .from("company_documents")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("payslip_validation_history")
      .select("id, payslip_id, action, performed_by, note, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("employee_notes")
      .select("id, employee_id, content, created_at, created_by")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("company_documents")
      .select("id, name, type, uploaded_by, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("hr_documents")
      .select("id, employee_id, nom, uploaded_by, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("id, nom, prenom, email"),
    supabase
      .from("employees")
      .select("id, nom_complet"),
    supabase
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("statut", "en_attente"),
  ]);

  const employees = (employeesRes.data ?? []) as EmployeeLite[];
  const actifs = employees.filter((e) => e.statut === "actif");
  const totalEmployees = employees.length;
  const effectifActif = actifs.length;
  const masseSalariale = actifs.reduce(
    (s, e) => s + Number(e.salaire_base ?? 0),
    0
  );

  // Ancienneté moyenne (années)
  const ancArr = actifs
    .map((e) => {
      if (!e.date_embauche) return null;
      const d = new Date(e.date_embauche);
      if (Number.isNaN(d.getTime())) return null;
      return (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    })
    .filter((v): v is number => v !== null);
  const ancienneteMoyenne =
    ancArr.length > 0
      ? ancArr.reduce((s, v) => s + v, 0) / ancArr.length
      : null;

  const nbFichesEnAttente = payslipsPendingRes.count ?? 0;
  const nbFichesValideesMois = payslipsValidatedMonthRes.count ?? 0;
  const nbFichesTotal = payslipsTotalRes.count ?? 0;
  const nbHrDocs = hrDocsCountRes.count ?? 0;
  const nbCompanyDocs = companyDocsCountRes.count ?? 0;
  const nbCongesEnAttente = leavesPendingRes.count ?? 0;

  // Employés sans contrat
  const contratsRows = (contratsRes.data ?? []) as { employee_id: string }[];
  const empAvecContrat = new Set(contratsRows.map((r) => r.employee_id));
  const nbSansContrat = actifs.filter((e) => !empAvecContrat.has(e.id)).length;
  const nbSansProfile = actifs.filter((e) => !e.profile_id).length;

  const profilesById = new Map<
    string,
    { nom: string; prenom: string | null; email: string }
  >();
  for (const p of (profilesRes.data ?? []) as Array<{
    id: string;
    nom: string;
    prenom: string | null;
    email: string;
  }>) {
    profilesById.set(p.id, { nom: p.nom, prenom: p.prenom, email: p.email });
  }

  const employeesById = new Map<string, string>();
  for (const e of (employeesNamedRes.data ?? []) as Array<{
    id: string;
    nom_complet: string;
  }>) {
    employeesById.set(e.id, e.nom_complet);
  }

  // ---- Activité récente (fusion + tri) -----------------------------------
  type Activity = {
    key: string;
    icon: LucideIcon;
    label: string;
    detail: string;
    date: string;
    accent: "orange" | "emerald" | "rose" | "navy" | "amber";
    initials: string;
  };

  const activity: Activity[] = [];

  for (const h of (historyRes.data ?? []) as PayslipHistoryRow[]) {
    const author = h.performed_by ? profilesById.get(h.performed_by) : null;
    const initials = author
      ? ((author.prenom?.[0] ?? "") + (author.nom?.[0] ?? "")).toUpperCase() ||
        (author.email?.[0] ?? "?").toUpperCase()
      : "?";
    let label = "Action paie";
    let accent: Activity["accent"] = "navy";
    let icon: LucideIcon = Wallet;
    if (h.action === "created") {
      label = "Fiche de paie créée";
      accent = "navy";
      icon = Plus;
    } else if (h.action === "submitted") {
      label = "Fiche soumise pour validation";
      accent = "amber";
      icon = Clock;
    } else if (h.action === "validated") {
      label = "Fiche validée";
      accent = "emerald";
      icon = CheckCircle2;
    } else if (h.action === "rejected") {
      label = "Fiche refusée";
      accent = "rose";
      icon = AlertTriangle;
    } else if (h.action === "edited") {
      label = "Fiche modifiée";
      accent = "navy";
      icon = FileText;
    }
    activity.push({
      key: `h-${h.id}`,
      icon,
      label,
      detail: author
        ? `Par ${author.prenom ?? ""} ${author.nom}`.trim()
        : "Système",
      date: h.created_at,
      accent,
      initials: initials || "?",
    });
  }

  for (const n of (notesRes.data ?? []) as NoteRow[]) {
    const author = n.created_by ? profilesById.get(n.created_by) : null;
    const empName = employeesById.get(n.employee_id) ?? "Employé";
    const initials = author
      ? ((author.prenom?.[0] ?? "") + (author.nom?.[0] ?? "")).toUpperCase() ||
        (author.email?.[0] ?? "?").toUpperCase()
      : "?";
    activity.push({
      key: `n-${n.id}`,
      icon: FileText,
      label: `Note · ${empName}`,
      detail:
        n.content.length > 80 ? `${n.content.slice(0, 80)}…` : n.content,
      date: n.created_at,
      accent: "navy",
      initials: initials || "?",
    });
  }

  for (const d of (companyDocsRecentRes.data ?? []) as CompanyDocRow[]) {
    const author = d.uploaded_by ? profilesById.get(d.uploaded_by) : null;
    const initials = author
      ? ((author.prenom?.[0] ?? "") + (author.nom?.[0] ?? "")).toUpperCase() ||
        (author.email?.[0] ?? "?").toUpperCase()
      : "?";
    activity.push({
      key: `c-${d.id}`,
      icon: Library,
      label: `Doc entreprise · ${d.name}`,
      detail: author
        ? `Par ${author.prenom ?? ""} ${author.nom}`.trim()
        : "Téléversé",
      date: d.created_at,
      accent: "orange",
      initials: initials || "?",
    });
  }

  for (const d of (hrDocsRecentRes.data ?? []) as HrDocRow[]) {
    const author = d.uploaded_by ? profilesById.get(d.uploaded_by) : null;
    const empName = employeesById.get(d.employee_id) ?? "—";
    const initials = author
      ? ((author.prenom?.[0] ?? "") + (author.nom?.[0] ?? "")).toUpperCase() ||
        (author.email?.[0] ?? "?").toUpperCase()
      : "?";
    activity.push({
      key: `hd-${d.id}`,
      icon: FolderOpen,
      label: `Doc RH · ${d.nom}`,
      detail: `Pour ${empName}`,
      date: d.created_at,
      accent: "navy",
      initials: initials || "?",
    });
  }

  activity.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const activityFeed = activity.slice(0, 8);

  const ancienneteValue =
    ancienneteMoyenne === null
      ? "—"
      : `${ancienneteMoyenne.toFixed(1)} an${ancienneteMoyenne >= 2 ? "s" : ""}`;

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      {/* HERO RH NAVY */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-10 shadow-lg sm:px-9 sm:py-12 lg:px-12 lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={DOT_GRID}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
        />

        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md sm:h-14 sm:w-14">
              <Briefcase className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
                Ressources humaines
              </span>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Centre de pilotage entreprise
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Effectif, masse salariale, paie, documents, statistiques —
                un seul tableau pour piloter l&apos;équipe Nexus RCA.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroStat
              label="Effectif actif"
              value={formatNumber(effectifActif)}
              accent="white"
            />
            <HeroStat
              label="Masse salariale / mois"
              value={formatFcfa(masseSalariale)}
              accent="orange"
            />
            <HeroStat
              label="Fiches en attente"
              value={formatNumber(nbFichesEnAttente)}
              accent={nbFichesEnAttente > 0 ? "amber" : "white"}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5 sm:gap-3">
            <HeroChip
              href={`${BASE}/employes/nouveau`}
              icon={Plus}
              label="Nouvel employé"
            />
            <HeroChip
              href={`${BASE}/paie/nouvelle`}
              icon={Plus}
              label="Nouvelle fiche de paie"
            />
            <HeroChip
              href={`${BASE}/paie/a-valider`}
              icon={Clock}
              label="Fiches à valider"
            />
            <HeroChip
              href={`${BASE}/conges`}
              icon={Plane}
              label="Congés"
            />
            <HeroChip
              href={`${BASE}/calendrier`}
              icon={CalendarDays}
              label="Calendrier RH"
            />
            <HeroChip
              href={`${BASE}/statistiques`}
              icon={BarChart3}
              label="Statistiques RH"
            />
          </div>
        </div>
      </section>

      {/* INDICATEURS CLÉS */}
      <section className="mb-10">
        <SectionEyebrow>Indicateurs clés</SectionEyebrow>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Effectif actif"
            value={formatNumber(effectifActif)}
            sub={`${formatNumber(totalEmployees)} au total`}
            icon={Users}
            accent="from-nexus-blue-700 to-nexus-blue-900"
          />
          <KpiCard
            label="Masse salariale / mois"
            value={formatFcfa(masseSalariale)}
            sub="Somme des salaires de base actifs"
            icon={TrendingUp}
            accent="from-emerald-500 to-emerald-700"
          />
          <KpiCard
            label="Ancienneté moyenne"
            value={ancienneteValue}
            sub="Sur effectif actif"
            icon={Clock}
            accent="from-nexus-orange-400 to-nexus-orange-600"
          />
          <KpiCard
            label="Fiches validées ce mois"
            value={formatNumber(nbFichesValideesMois)}
            sub="Bulletins clôturés"
            icon={CheckCircle2}
            accent="from-purple-500 to-purple-700"
          />
        </div>
      </section>

      {/* À TRAITER */}
      <section className="mb-10">
        <SectionEyebrow>À traiter</SectionEyebrow>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AlertItem
            href={`${BASE}/paie/a-valider`}
            icon={Clock}
            label="Fiches en attente de validation"
            count={nbFichesEnAttente}
            tone={nbFichesEnAttente > 0 ? "warning" : "ok"}
            cta={nbFichesEnAttente > 0 ? "Ouvrir →" : "Tout est validé"}
          />
          <AlertItem
            href={`${BASE}/conges`}
            icon={Plane}
            label="Demandes de congés en attente"
            count={nbCongesEnAttente}
            tone={nbCongesEnAttente > 0 ? "warning" : "ok"}
            cta={nbCongesEnAttente > 0 ? "Traiter →" : "Tout est traité"}
          />
          <AlertItem
            href={`${BASE}/documents`}
            icon={FileText}
            label="Employés sans contrat uploadé"
            count={nbSansContrat}
            tone={nbSansContrat > 0 ? "danger" : "ok"}
            cta={nbSansContrat > 0 ? "Voir documents RH →" : "Tous documentés"}
          />
          <AlertItem
            href={`${BASE}/employes`}
            icon={Users}
            label="Employés sans compte lié"
            count={nbSansProfile}
            tone={nbSansProfile > 0 ? "warning" : "ok"}
            cta={nbSansProfile > 0 ? "Voir employés →" : "Tous reliés"}
          />
        </div>
      </section>

      {/* MODULES */}
      <section className="mb-10">
        <SectionEyebrow>Modules</SectionEyebrow>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ModuleCard
            href={`${BASE}/annuaire`}
            icon={Network}
            label="Annuaire"
            count={effectifActif}
            countLabel="actifs"
          />
          <ModuleCard
            href={`${BASE}/employes`}
            icon={Users}
            label="Employés"
            count={totalEmployees}
            countLabel="fiches"
          />
          <ModuleCard
            href={`${BASE}/paie`}
            icon={Wallet}
            label="Fiches de paie"
            count={nbFichesTotal}
            countLabel="bulletins"
          />
          <ModuleCard
            href={`${BASE}/documents`}
            icon={FolderOpen}
            label="Documents employés"
            count={nbHrDocs}
            countLabel="fichiers"
          />
          <ModuleCard
            href={`${BASE}/documents-entreprise`}
            icon={Library}
            label="Documents entreprise"
            count={nbCompanyDocs}
            countLabel="documents"
          />
          <ModuleCard
            href={`${BASE}/conges`}
            icon={Plane}
            label="Congés"
            count={nbCongesEnAttente}
            countLabel="en attente"
          />
          <ModuleCard
            href={`${BASE}/calendrier`}
            icon={CalendarDays}
            label="Calendrier RH"
            count={null}
            countLabel="vue agrégée"
          />
          <ModuleCard
            href={`${BASE}/statistiques`}
            icon={BarChart3}
            label="Statistiques"
            count={null}
            countLabel="analytics"
          />
        </div>
      </section>

      {/* ACTIVITÉ RÉCENTE */}
      <section>
        <SectionEyebrow>Activité récente</SectionEyebrow>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm ring-1 ring-slate-100/80">
          {activityFeed.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Aucune activité enregistrée pour le moment.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activityFeed.map((a) => {
                const Icon = a.icon;
                const accentTone: Record<Activity["accent"], string> = {
                  orange: "bg-nexus-orange-100 text-nexus-orange-700",
                  emerald: "bg-emerald-100 text-emerald-700",
                  rose: "bg-rose-100 text-rose-700",
                  navy: "bg-nexus-blue-100 text-nexus-blue-800",
                  amber: "bg-amber-100 text-amber-800",
                };
                return (
                  <li key={a.key} className="flex items-start gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-blue-900 text-xs font-bold text-white shadow-sm">
                      {a.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${accentTone[a.accent]}`}
                        >
                          <Icon className="h-3 w-3" />
                          {a.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatRelative(a.date)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-700">
                        {a.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

// ─── HELPERS UI ──────────────────────────────────────────────────────────

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </p>
  );
}

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
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

function HeroChip({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
    >
      <Icon className="h-3.5 w-3.5 text-nexus-orange-300 transition group-hover:text-nexus-orange-200 sm:h-4 sm:w-4" />
      {label}
    </Link>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
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
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function AlertItem({
  href,
  icon: Icon,
  label,
  count,
  tone,
  cta,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  count: number;
  tone: "ok" | "warning" | "danger";
  cta: string;
}) {
  const styles =
    tone === "danger"
      ? "border-rose-200 bg-rose-50/60 hover:border-rose-300"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/60 hover:border-amber-300"
        : "border-slate-200 bg-white hover:border-emerald-200";
  const iconWrap =
    tone === "danger"
      ? "bg-rose-100 text-rose-700"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";
  const valueClass =
    tone === "danger"
      ? "text-rose-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-emerald-700";
  return (
    <Link
      href={href}
      className={`group block rounded-3xl border p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg ${styles}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrap}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-nexus-orange-600" />
      </div>
      <p className="mt-3 text-sm font-semibold text-nexus-blue-950">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={`font-display text-3xl font-bold tabular-nums ${valueClass}`}>
          {count}
        </p>
        <p className="text-xs font-semibold text-slate-500">{cta}</p>
      </div>
    </Link>
  );
}

function ModuleCard({
  href,
  icon: Icon,
  label,
  count,
  countLabel,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  count: number | null;
  countLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-nexus-orange-200 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-sm transition group-hover:from-nexus-orange-500 group-hover:to-nexus-orange-700">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 font-display text-base font-bold text-nexus-blue-950">
        {label}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {count === null ? "Analytics" : `${formatNumber(count)} ${countLabel}`}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 group-hover:underline">
        Ouvrir <ArrowUpRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
