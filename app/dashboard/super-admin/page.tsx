import Link from "next/link";
import {
  Wallet,
  Users,
  FileText,
  CalendarCheck,
  Send,
  Receipt,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  UserCircle,
  Trophy,
  Plus,
  PieChart,
  ArrowUpRight,
  Activity,
  Zap,
  ArrowDownRight,
  CircleDollarSign,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { Sparkline } from "@/components/ui/Sparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// ─── DEMO DATA ─────────────────────────────────────────────────────────────
// Génère une série temporelle plausible terminant sur `current`.
// TODO: remplacer par des queries Supabase groupées par jour
//       (ex: payments WHERE date_paiement >= now() - interval '7 days'
//        GROUP BY date_trunc('day', date_paiement))
function fakeTrend(
  current: number,
  direction: "up" | "down" | "flat",
  seed: number,
  points = 7
): number[] {
  if (current <= 0) return Array(points).fill(0);
  const dirFactor =
    direction === "up" ? 0.55 : direction === "down" ? 1.4 : 1;
  const start = current * dirFactor;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const base = start + (current - start) * t;
    const noise =
      (Math.sin(seed + i * 1.7) + Math.sin(seed * 2.3 + i * 0.9)) *
      (current * 0.08);
    out.push(Math.max(0, base + noise));
  }
  out[points - 1] = current;
  return out;
}

function trendDelta(series: number[]): number {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return last > 0 ? 100 : 0;
  return ((last - first) / first) * 100;
}

export const metadata = {
  title: "Centre de pilotage | Super Admin",
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  } catch {
    return "—";
  }
}

export default async function SuperAdminDashboard() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const monthStart = new Date(today);
  monthStart.setDate(1);
  const monthStartISO = monthStart.toISOString();

  // ============================================================
  // CHARGEMENT EN PARALLELE
  // ============================================================
  const [
    paymentsTodayRes,
    paymentsMonthRes,
    paymentsAllRes,
    quickSalesTodayRes,
    quickSalesMonthRes,
    expensesPendingRes,
    expensesValidatedMonthRes,
    demandesNouvellesRes,
    demandesEnCoursRes,
    demandesUrgentesRes,
    appointmentsTodayRes,
    transfertsPendingRes,
    clientsCountRes,
    teamCountRes,
    lastActivePaymentRes,
    transfertsToValidateRes,
    paiementsPartielsRes,
  ] = await Promise.all([
    // Paiements aujourd hui
    supabase
      .from("payments")
      .select("montant_recu, montant_total")
      .gte("date_paiement", todayISO),
    // Paiements ce mois
    supabase
      .from("payments")
      .select("montant_recu, montant_total")
      .gte("date_paiement", monthStartISO),
    // Tous les paiements (pour montant restant)
    supabase
      .from("payments")
      .select("montant_recu, montant_total, statut"),
    // Ventes caisse aujourd hui
    supabase
      .from("quick_sales")
      .select("montant_total")
      .gte("date_paiement", todayISO),
    // Ventes caisse ce mois
    supabase
      .from("quick_sales")
      .select("montant_total")
      .gte("date_paiement", monthStartISO),
    // Depenses en attente
    supabase
      .from("expenses")
      .select("montant")
      .eq("statut", "en_attente"),
    // Depenses validees ce mois
    supabase
      .from("expenses")
      .select("montant")
      .eq("statut", "valide")
      .gte("date_depense", monthStartISO),
    // Demandes nouvelles
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .eq("statut", "nouvelle"),
    // Demandes en cours
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .in("statut", ["en_cours", "en_traitement"]),
    // Demandes urgentes (avec une priorité haute si la colonne existe)
    supabase
      .from("demandes")
      .select("id, objet, service, statut, created_at")
      .in("statut", ["nouvelle", "en_cours"])
      .order("created_at", { ascending: false })
      .limit(5),
    // RDV aujourd hui
    supabase
      .from("appointments")
      .select("id, nom, prenom, service, date_heure")
      .gte("date_heure", todayISO)
      .lt(
        "date_heure",
        new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      )
      .order("date_heure"),
    // Transferts en attente de validation
    supabase
      .from("transferts")
      .select("id", { count: "exact", head: true })
      .eq("statut", "en_attente"),
    // Nombre de clients (CRM)
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true }),
    // Nombre d employes
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["agent", "admin", "super_admin"])
      .eq("actif", true),
    // Derniere activite paiement
    supabase
      .from("payments")
      .select("created_at, agent_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    // Transferts a valider (details pour bloc alertes)
    supabase
      .from("transferts")
      .select("id, reference, expediteur_nom, beneficiaire_nom, montant_envoye, devise, created_at")
      .eq("statut", "en_attente")
      .order("created_at", { ascending: false })
      .limit(3),
    // Paiements partiels
    supabase
      .from("payments")
      .select("id, reference, client_nom, montant_total, montant_recu, devise")
      .eq("statut", "partiel")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  // ============================================================
  // CALCULS FINANCIERS
  // ============================================================
  const paiementsToday = (paymentsTodayRes.data || []).reduce(
    (s, p) => s + Number(p.montant_recu || 0),
    0
  );
  const caisseToday = (quickSalesTodayRes.data || []).reduce(
    (s, p) => s + Number(p.montant_total || 0),
    0
  );
  const totalToday = paiementsToday + caisseToday;

  const paiementsMonth = (paymentsMonthRes.data || []).reduce(
    (s, p) => s + Number(p.montant_recu || 0),
    0
  );
  const caisseMonth = (quickSalesMonthRes.data || []).reduce(
    (s, p) => s + Number(p.montant_total || 0),
    0
  );
  const totalMonth = paiementsMonth + caisseMonth;

  const allPayments = paymentsAllRes.data || [];
  const totalAttendu = allPayments.reduce(
    (s, p) => s + Number(p.montant_total || 0),
    0
  );
  const totalRecu = allPayments.reduce(
    (s, p) => s + Number(p.montant_recu || 0),
    0
  );
  const restantAEncaisser = Math.max(0, totalAttendu - totalRecu);

  const depensesEnAttente = (expensesPendingRes.data || []).reduce(
    (s, e) => s + Number(e.montant || 0),
    0
  );
  const nbDepensesEnAttente = (expensesPendingRes.data || []).length;

  const depensesMonth = (expensesValidatedMonthRes.data || []).reduce(
    (s, e) => s + Number(e.montant || 0),
    0
  );

  const soldeNet = totalMonth - depensesMonth;

  // Compteurs
  const nbDemandesNouvelles = demandesNouvellesRes.count ?? 0;
  const nbDemandesEnCours = demandesEnCoursRes.count ?? 0;
  const nbTransfertsPending = transfertsPendingRes.count ?? 0;
  const nbClients = clientsCountRes.count ?? 0;
  const nbEmployes = teamCountRes.count ?? 0;
  const nbRdvToday = (appointmentsTodayRes.data || []).length;

  const totalAlertes =
    nbDepensesEnAttente +
    nbTransfertsPending +
    nbDemandesNouvelles +
    (paiementsPartielsRes.data || []).length;

  // Derniere activite
  const derniereActivite = lastActivePaymentRes.data?.created_at;

  const initials = (
    (profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "")
  ).toUpperCase();
  const todayLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const heroSubtitle = derniereActivite
    ? `${todayLabel} · Dernière activité ${formatRelativeTime(derniereActivite)}`
    : todayLabel;

  return (
    <DashboardShell profile={profile}>
      {/* ======================================================== */}
      {/* HERO PREMIUM */}
      {/* ======================================================== */}
      <DashboardHero
        initials={initials}
        roleLabel="Centre de pilotage"
        title={`Bonjour ${profile.prenom || profile.nom}`}
        subtitle={heroSubtitle}
        stats={[
          {
            label: "Encaissé aujourd'hui",
            value: formatMoney(totalToday),
            accent: "white",
          },
          {
            label: "Encaissé ce mois",
            value: formatMoney(totalMonth),
            accent: "orange",
          },
          {
            label: "Solde net du mois",
            value: formatMoney(soldeNet),
            accent: soldeNet >= 0 ? "emerald" : "rose",
          },
        ]}
        rightSlot={
          totalAlertes > 0 ? (
            <Link
              href="#alertes"
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur transition hover:bg-amber-500/25"
            >
              <AlertTriangle className="h-4 w-4" />
              {totalAlertes} à traiter
            </Link>
          ) : undefined
        }
      />


      {/* ======================================================== */}
      {/* ACTIONS RAPIDES */}
      {/* ======================================================== */}
      <DashboardQuickActions
        title="Actions rapides"
        actions={[
          {
            href: "/dashboard/super-admin/clients",
            icon: UserCircle,
            label: "Nouveau client",
            color: "blue",
          },
          {
            href: "/dashboard/super-admin/equipe/nouveau",
            icon: Briefcase,
            label: "Créer employé",
            color: "indigo",
          },
          {
            href: "/dashboard/super-admin/paiements",
            icon: Wallet,
            label: "Enregistrer paiement",
            color: "emerald",
          },
          {
            href: "/dashboard/super-admin/caisse",
            icon: ShoppingCart,
            label: "Caisse rapide",
            color: "orange",
          },
          {
            href: "/dashboard/super-admin/transferts",
            icon: Send,
            label: "Voir transferts",
            color: "purple",
            badge: nbTransfertsPending > 0 ? nbTransfertsPending : undefined,
          },
          {
            href: "/dashboard/super-admin/depenses",
            icon: Receipt,
            label: "Valider dépenses",
            color: "amber",
            badge: nbDepensesEnAttente > 0 ? nbDepensesEnAttente : undefined,
          },
        ]}
      />

      {/* ======================================================== */}
      {/* VUE FINANCIERE */}
      {/* ======================================================== */}
      <Section
        title="Vue financière"
        icon={CircleDollarSign}
        color="text-emerald-600"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const t1 = fakeTrend(totalToday, "up", 1);
            const t2 = fakeTrend(totalMonth, "up", 2);
            const t3 = fakeTrend(restantAEncaisser, "down", 3);
            const t4 = fakeTrend(depensesEnAttente, "flat", 4);
            return (
              <>
                <FinanceCard
                  label="Encaissé aujourd'hui"
                  value={formatMoney(totalToday)}
                  sub={`${formatMoney(paiementsToday)} paie. + ${formatMoney(caisseToday)} caisse`}
                  icon={Wallet}
                  accent="green"
                  trend={t1}
                  delta={trendDelta(t1)}
                  href="/dashboard/super-admin/paiements"
                />
                <FinanceCard
                  label="Encaissé ce mois"
                  value={formatMoney(totalMonth)}
                  sub={`Solde net : ${formatMoney(soldeNet)}`}
                  icon={TrendingUp}
                  accent="emerald"
                  trend={t2}
                  delta={trendDelta(t2)}
                  href="/dashboard/super-admin/finances"
                />
                <FinanceCard
                  label="Restant à encaisser"
                  value={formatMoney(restantAEncaisser)}
                  sub="Paiements partiels & non payés"
                  icon={Clock}
                  accent="orange"
                  trend={t3}
                  delta={trendDelta(t3)}
                  href="/dashboard/super-admin/paiements"
                />
                <FinanceCard
                  label="Dépenses en attente"
                  value={formatMoney(depensesEnAttente)}
                  sub={`${nbDepensesEnAttente} dépense${nbDepensesEnAttente > 1 ? "s" : ""} à valider`}
                  icon={Receipt}
                  accent="amber"
                  trend={t4}
                  delta={trendDelta(t4)}
                  href="/dashboard/super-admin/depenses"
                />
              </>
            );
          })()}
        </div>
      </Section>

      {/* ======================================================== */}
      {/* ACTIVITE OPERATIONNELLE */}
      {/* ======================================================== */}
      <Section
        title="Activité opérationnelle"
        icon={Activity}
        color="text-purple-600"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OpCard
            label="Demandes nouvelles"
            value={nbDemandesNouvelles}
            icon={FileText}
            href="/dashboard/super-admin/demandes"
            urgent={nbDemandesNouvelles > 5}
            trend={fakeTrend(nbDemandesNouvelles, "up", 5)}
          />
          <OpCard
            label="Demandes en cours"
            value={nbDemandesEnCours}
            icon={FileText}
            href="/dashboard/super-admin/demandes"
            trend={fakeTrend(nbDemandesEnCours, "up", 6)}
          />
          <OpCard
            label="RDV aujourd'hui"
            value={nbRdvToday}
            icon={CalendarCheck}
            href="/dashboard/super-admin/rendez-vous"
            trend={fakeTrend(nbRdvToday, "flat", 7)}
          />
          <OpCard
            label="Transferts à valider"
            value={nbTransfertsPending}
            icon={Send}
            href="/dashboard/super-admin/transferts"
            urgent={nbTransfertsPending > 0}
            trend={fakeTrend(nbTransfertsPending, "down", 8)}
          />
        </div>
      </Section>

      {/* ======================================================== */}
      {/* EQUIPE NEXUS */}
      {/* ======================================================== */}
      <Section title="Équipe Nexus" icon={Briefcase} color="text-nexus-blue-700">
        <div className="grid gap-4 lg:grid-cols-3">
          <Link
            href="/dashboard/super-admin/clients"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-50/60"
          >
            <div className="flex items-center justify-between">
              <UserCircle className="h-6 w-6 text-blue-600" />
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-nexus-blue-950" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-nexus-blue-950">
              {nbClients}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Clients dans le CRM
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Fiches business actives
            </p>
          </Link>

          <Link
            href="/dashboard/super-admin/equipe"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-50/60"
          >
            <div className="flex items-center justify-between">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-nexus-blue-950" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-nexus-blue-950">
              {nbEmployes}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Employés Nexus
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Agents, admins, super-admins actifs
            </p>
          </Link>

          <Link
            href="/dashboard/super-admin/stats-agents"
            className="group rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm transition-colors hover:bg-slate-50/60"
          >
            <div className="flex items-center justify-between">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <ArrowUpRight className="h-4 w-4 text-yellow-600 transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
              Voir performances
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Classement, scores, exports
            </p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-900">
              <Zap className="h-3 w-3" />
              Recommandé chaque lundi
            </p>
          </Link>
        </div>
      </Section>

      {/* ======================================================== */}
      {/* A TRAITER MAINTENANT */}
      {/* ======================================================== */}
      {totalAlertes > 0 && (
        <div id="alertes" className="mb-6 scroll-mt-6">
          <Section
            title="À traiter maintenant"
            icon={ShieldAlert}
            color="text-amber-600"
          >
            <div className="space-y-2">
              {/* Transferts a valider */}
              {(transfertsToValidateRes.data || []).map((t) => (
                <AlertRow
                  key={t.id}
                  icon={Send}
                  iconColor="text-purple-600"
                  iconBg="bg-purple-100"
                  title={`Transfert ${t.expediteur_nom} → ${t.beneficiaire_nom}`}
                  subtitle={`${formatMoney(Number(t.montant_envoye), t.devise)} · ${formatRelativeTime(t.created_at)}`}
                  badge="À valider"
                  badgeColor="bg-purple-100 text-purple-700"
                  href="/dashboard/super-admin/transferts"
                />
              ))}

              {/* Depenses en attente */}
              {nbDepensesEnAttente > 0 && (
                <AlertRow
                  icon={Receipt}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-100"
                  title={`${nbDepensesEnAttente} dépense${nbDepensesEnAttente > 1 ? "s" : ""} en attente de validation`}
                  subtitle={`Montant total : ${formatMoney(depensesEnAttente)}`}
                  badge="À valider"
                  badgeColor="bg-amber-100 text-amber-700"
                  href="/dashboard/super-admin/depenses"
                />
              )}

              {/* Paiements partiels */}
              {(paiementsPartielsRes.data || []).map((p) => {
                const restant =
                  Number(p.montant_total) - Number(p.montant_recu);
                return (
                  <AlertRow
                    key={p.id}
                    icon={Wallet}
                    iconColor="text-orange-600"
                    iconBg="bg-orange-100"
                    title={`Paiement partiel : ${p.client_nom}`}
                    subtitle={`Restant : ${formatMoney(restant, p.devise)} sur ${formatMoney(Number(p.montant_total), p.devise)}`}
                    badge="Partiel"
                    badgeColor="bg-orange-100 text-orange-700"
                    href="/dashboard/super-admin/paiements"
                  />
                );
              })}

              {/* Demandes nouvelles */}
              {nbDemandesNouvelles > 0 && (
                <AlertRow
                  icon={FileText}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-100"
                  title={`${nbDemandesNouvelles} demande${nbDemandesNouvelles > 1 ? "s" : ""} non traitée${nbDemandesNouvelles > 1 ? "s" : ""}`}
                  subtitle="À assigner ou traiter par un agent"
                  badge="Nouvelles"
                  badgeColor="bg-blue-100 text-blue-700"
                  href="/dashboard/super-admin/demandes"
                />
              )}
            </div>
          </Section>
        </div>
      )}

      {/* ======================================================== */}
      {/* RDV DU JOUR */}
      {/* ======================================================== */}
      {nbRdvToday > 0 && (
        <Section
          title="Rendez-vous du jour"
          icon={CalendarCheck}
          color="text-blue-600"
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {(appointmentsTodayRes.data || []).map((rdv) => {
                const time = new Date(rdv.date_heure).toLocaleTimeString(
                  "fr-FR",
                  { hour: "2-digit", minute: "2-digit" }
                );
                return (
                  <div
                    key={rdv.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-100 font-mono text-xs font-bold text-blue-700">
                      {time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-nexus-blue-950">
                        {rdv.prenom} {rdv.nom}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {rdv.service}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-200 p-3 text-center">
              <Link
                href="/dashboard/super-admin/rendez-vous"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-nexus-blue-950"
              >
                Voir tous les rendez-vous
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* ======================================================== */}
      {/* DERNIERES DEMANDES */}
      {/* ======================================================== */}
      {(demandesUrgentesRes.data || []).length > 0 && (
        <Section
          title="Dernières demandes reçues"
          icon={FileText}
          color="text-purple-600"
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {(demandesUrgentesRes.data || []).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-nexus-blue-950">
                      {d.objet || d.service}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {d.service} · {formatRelativeTime(d.created_at)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      d.statut === "nouvelle"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {d.statut}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 p-3 text-center">
              <Link
                href="/dashboard/super-admin/demandes"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-nexus-blue-950"
              >
                Voir toutes les demandes
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* ======================================================== */}
      {/* SI RIEN A TRAITER */}
      {/* ======================================================== */}
      {totalAlertes === 0 && (
        <div className="mb-6">
          <EmptyState
            icon={CheckCircle2}
            tone="success"
            title="Tout est sous contrôle"
            description="Aucune alerte. Pas de transfert à valider, pas de dépense en attente, pas de demande non traitée."
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* FOOTER NAVIGATION COMPLETE */}
      {/* ======================================================== */}
      <Section title="Toutes les sections" icon={PieChart} color="text-slate-600">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NavLink href="/dashboard/super-admin/finances" icon={PieChart} label="Finances" />
          <NavLink href="/dashboard/super-admin/paiements" icon={Wallet} label="Paiements" />
          <NavLink href="/dashboard/super-admin/caisse" icon={ShoppingCart} label="Caisse" />
          <NavLink href="/dashboard/super-admin/transferts" icon={Send} label="Transferts" />
          <NavLink href="/dashboard/super-admin/depenses" icon={Receipt} label="Dépenses" />
          <NavLink href="/dashboard/super-admin/clients" icon={UserCircle} label="Clients (CRM)" />
          <NavLink href="/dashboard/super-admin/comptes-clients" icon={Users} label="Comptes clients" />
          <NavLink href="/dashboard/super-admin/equipe" icon={Briefcase} label="Équipe Nexus" />
        </div>
      </Section>
    </DashboardShell>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function Section({
  title,
  icon: Icon,
  color,
  subtitle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Couleur Tailwind du texte (ex: "text-emerald-600") — utilisée pour
   *  déterminer l'accent du badge gradient. */
  color: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  // Mappe la couleur de texte vers un gradient (orange = accent par défaut)
  const accent = color.includes("emerald") || color.includes("green")
    ? "from-emerald-500 to-emerald-700"
    : color.includes("rose") || color.includes("red")
      ? "from-rose-500 to-rose-700"
      : color.includes("amber") || color.includes("yellow")
        ? "from-amber-500 to-amber-700"
        : color.includes("purple")
          ? "from-purple-500 to-purple-700"
          : color.includes("blue")
            ? "from-blue-500 to-blue-700"
            : color.includes("slate")
              ? "from-slate-500 to-slate-700"
              : "from-nexus-orange-500 to-nexus-orange-700";

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            accent
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-nexus-blue-950 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function FinanceCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
  delta,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "green" | "emerald" | "orange" | "amber";
  trend?: number[];
  delta?: number;
  href: string;
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    emerald: "from-teal-400 to-emerald-600",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    amber: "from-amber-400 to-amber-600",
  };
  const sparkColorMap = {
    green: "text-emerald-500",
    emerald: "text-teal-500",
    orange: "text-nexus-orange-500",
    amber: "text-amber-500",
  };

  const showSpark = trend && trend.length >= 2;
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const deltaUp = showDelta && delta! > 0;
  const deltaDown = showDelta && delta! < 0;

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate font-display text-xl font-bold text-nexus-blue-950">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow",
            colorMap[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {(showSpark || showDelta) && (
        <div className="mt-3 flex items-center gap-2">
          {showDelta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                deltaUp && "bg-emerald-100 text-emerald-700",
                deltaDown && "bg-rose-100 text-rose-700",
                !deltaUp &&
                  !deltaDown &&
                  "bg-slate-100 text-slate-600"
              )}
            >
              {deltaUp && <ArrowUpRight className="h-3 w-3" />}
              {deltaDown && <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta!).toFixed(1)}%
            </span>
          )}
          {showSpark && (
            <div className={cn("min-w-0 flex-1", sparkColorMap[accent])}>
              <Sparkline data={trend!} height={22} />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

function OpCard({
  label,
  value,
  icon: Icon,
  href,
  urgent,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  urgent?: boolean;
  trend?: number[];
}) {
  const showSpark = trend && trend.length >= 2;
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60",
        urgent ? "border-red-300 bg-red-50" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between">
        <Icon
          className={cn(
            "h-5 w-5",
            urgent ? "text-red-600" : "text-slate-400"
          )}
        />
        {urgent && (
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
        )}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-2xl font-bold tabular-nums",
          urgent ? "text-red-700" : "text-nexus-blue-950"
        )}
      >
        {value}
      </p>
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      {showSpark ? (
        <div
          className={cn(
            "mt-2 -mb-1",
            urgent ? "text-red-500" : "text-nexus-blue-500"
          )}
        >
          <Sparkline data={trend!} height={20} />
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition group-hover:text-nexus-blue-950">
          Voir →
        </div>
      )}
    </Link>
  );
}

function AlertRow({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  badge,
  badgeColor,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:bg-slate-50/60"
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          iconBg
        )}
      >
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-nexus-blue-950">
          {title}
        </p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
          badgeColor
        )}
      >
        {badge}
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-nexus-orange-300/60 hover:bg-slate-50/60"
    >
      <Icon className="h-4 w-4 text-slate-500 transition group-hover:text-nexus-blue-950" />
      <span className="text-xs font-semibold text-slate-700 group-hover:text-nexus-blue-950">
        {label}
      </span>
    </Link>
  );
}
