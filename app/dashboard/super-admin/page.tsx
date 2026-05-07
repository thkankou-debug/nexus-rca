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
  PieChart,
  ArrowUpRight,
  Activity,
  ArrowDownRight,
  CircleDollarSign,
  ShieldAlert,
  ClipboardCheck,
  FolderOpen,
  Globe,
  ShieldCheck,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { Sparkline } from "@/components/ui/Sparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  bucketByDay,
  cumulativeSeries,
  isoDaysAgo,
  sumSeries,
  trendDelta,
} from "@/lib/dashboard/trends";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Centre de pilotage | Super Admin",
};

export const dynamic = "force-dynamic";

// ─── Format ─────────────────────────────────────────────────────────────────
// Pas de toLocaleString fr-FR ici (insère espace insécable étroit qui pose
// problème dans certains contextes). Format manuel avec espace standard.
function formatMoney(amount: number, currency = "FCFA"): string {
  const intPart = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart} ${currency}`;
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

// ============================================================================
// PAGE
// ============================================================================
export default async function SuperAdminDashboard() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const monthStart = new Date(today);
  monthStart.setDate(1);
  const monthStartISO = monthStart.toISOString();

  // Fenêtre 7 jours glissants pour les vraies trends.
  const sevenDaysAgoISO = isoDaysAgo(6);

  // ============================================================
  // CHARGEMENT EN PARALLÈLE (Promise.all)
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
    // ─── 7 jours pour trends réelles ───────────────────────────
    payments7dRes,
    quickSales7dRes,
    demandes7dRes,
    appointments7dRes,
    expenses7dRes,
    // ─── RH (nouveau) ──────────────────────────────────────────
    employeesActifsRes,
    payslipsPendingRes,
    payslipsPendingDetailsRes,
    payslipsValidatedMonthRes,
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("montant_recu, montant_total")
      .gte("date_paiement", todayISO),
    supabase
      .from("payments")
      .select("montant_recu, montant_total")
      .gte("date_paiement", monthStartISO),
    supabase.from("payments").select("montant_recu, montant_total, statut"),
    supabase
      .from("quick_sales")
      .select("montant_total")
      .gte("date_paiement", todayISO),
    supabase
      .from("quick_sales")
      .select("montant_total")
      .gte("date_paiement", monthStartISO),
    supabase.from("expenses").select("montant").eq("statut", "en_attente"),
    supabase
      .from("expenses")
      .select("montant")
      .eq("statut", "valide")
      .gte("date_depense", monthStartISO),
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .eq("statut", "nouvelle"),
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .in("statut", ["en_cours", "en_traitement"]),
    supabase
      .from("demandes")
      .select("id, objet, service, statut, created_at")
      .in("statut", ["nouvelle", "en_cours"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("appointments")
      .select("id, nom, prenom, service, date_heure")
      .gte("date_heure", todayISO)
      .lt(
        "date_heure",
        new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      )
      .order("date_heure"),
    supabase
      .from("transferts")
      .select("id", { count: "exact", head: true })
      .eq("statut", "en_attente"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["agent", "admin", "super_admin"])
      .eq("actif", true),
    supabase
      .from("payments")
      .select("created_at, agent_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("transferts")
      .select(
        "id, reference, expediteur_nom, beneficiaire_nom, montant_envoye, devise, created_at"
      )
      .eq("statut", "en_attente")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("payments")
      .select("id, reference, client_nom, montant_total, montant_recu, devise")
      .eq("statut", "partiel")
      .order("created_at", { ascending: false })
      .limit(3),
    // 7 jours
    supabase
      .from("payments")
      .select("date_paiement, montant_recu")
      .gte("date_paiement", sevenDaysAgoISO),
    supabase
      .from("quick_sales")
      .select("date_paiement, montant_total")
      .gte("date_paiement", sevenDaysAgoISO),
    supabase
      .from("demandes")
      .select("created_at")
      .gte("created_at", sevenDaysAgoISO),
    supabase
      .from("appointments")
      .select("date_heure")
      .gte("date_heure", sevenDaysAgoISO),
    supabase
      .from("expenses")
      .select("date_depense, montant")
      .eq("statut", "valide")
      .gte("date_depense", sevenDaysAgoISO),
    // RH
    supabase
      .from("employees")
      .select("id, salaire_base", { count: "exact" })
      .eq("statut", "actif"),
    supabase
      .from("payslips")
      .select("id", { count: "exact", head: true })
      .eq("statut", "en_attente_validation"),
    supabase
      .from("payslips")
      .select(
        "id, reference, mois_libelle, salaire_net, employee_id, employees(nom_complet, poste)"
      )
      .eq("statut", "en_attente_validation")
      .order("submitted_at", { ascending: false })
      .limit(3),
    supabase
      .from("payslips")
      .select("id", { count: "exact", head: true })
      .eq("statut", "validee")
      .gte("validated_at", monthStartISO),
  ]);

  // ============================================================
  // CALCULS
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

  // RH
  const nbEmployeesActifs = employeesActifsRes.count ?? 0;
  const masseSalariale = (employeesActifsRes.data || []).reduce(
    (s, e) => s + Number(e.salaire_base || 0),
    0
  );
  const nbPayslipsPending = payslipsPendingRes.count ?? 0;
  const nbPayslipsValidatedMonth = payslipsValidatedMonthRes.count ?? 0;

  const totalAlertes =
    nbDepensesEnAttente +
    nbTransfertsPending +
    nbDemandesNouvelles +
    (paiementsPartielsRes.data || []).length +
    nbPayslipsPending;

  const derniereActivite = lastActivePaymentRes.data?.created_at;

  // ============================================================
  // TRENDS RÉELS (7 derniers jours, oldest → newest)
  // ============================================================
  const paymentsByDay = bucketByDay(
    payments7dRes.data || [],
    "date_paiement",
    "montant_recu"
  );
  const caisseByDay = bucketByDay(
    quickSales7dRes.data || [],
    "date_paiement",
    "montant_total"
  );
  const encaisseByDay = sumSeries(paymentsByDay, caisseByDay);
  const encaisseCumulMonth = cumulativeSeries(encaisseByDay);
  const expensesByDay = bucketByDay(
    expenses7dRes.data || [],
    "date_depense",
    "montant"
  );
  const demandesByDay = bucketByDay(demandes7dRes.data || [], "created_at");
  const appointmentsByDay = bucketByDay(
    appointments7dRes.data || [],
    "date_heure"
  );
  // Restant à encaisser : on n'a pas d'historique facile, on garde une série
  // plate pour ne pas tromper l'œil.
  const restantByDay = new Array(7).fill(restantAEncaisser);

  // ============================================================
  // RENDU
  // ============================================================
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
      {/* ────────────────────────────────────────────────────── */}
      {/* 1. HERO                                                */}
      {/* ────────────────────────────────────────────────────── */}
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

      {/* ────────────────────────────────────────────────────── */}
      {/* 2. ACTIONS RAPIDES                                     */}
      {/* ────────────────────────────────────────────────────── */}
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
            href: "/dashboard/super-admin/rh/employes/nouveau",
            icon: Briefcase,
            label: "Créer employé",
            color: "indigo",
          },
          {
            href: "/dashboard/super-admin/rh/paie/nouvelle",
            icon: Wallet,
            label: "Nouvelle fiche paie",
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

      {/* ────────────────────────────────────────────────────── */}
      {/* 3. À TRAITER — alertes en haut (command center)        */}
      {/* ────────────────────────────────────────────────────── */}
      {totalAlertes > 0 ? (
        <Section
          id="alertes"
          eyebrow="Priorité"
          title="À traiter maintenant"
          icon={ShieldAlert}
          accent="amber"
          subtitle={`${totalAlertes} élément${totalAlertes > 1 ? "s" : ""} en attente d'action`}
        >
          <div className="space-y-2">
            {/* Fiches de paie à valider (NEW) */}
            {(payslipsPendingDetailsRes.data || []).map((p) => {
              const emp =
                (p.employees as
                  | { nom_complet?: string; poste?: string }
                  | { nom_complet?: string; poste?: string }[]
                  | null) ?? null;
              const empSingle = Array.isArray(emp) ? emp[0] : emp;
              return (
                <AlertRow
                  key={p.id}
                  icon={ClipboardCheck}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-50"
                  title={`Fiche de paie : ${empSingle?.nom_complet ?? "—"}`}
                  subtitle={`${p.mois_libelle} · ${formatMoney(Number(p.salaire_net))} net`}
                  badge="À valider"
                  badgeColor="bg-emerald-100 text-emerald-700"
                  href={`/dashboard/super-admin/rh/paie/${p.id}`}
                />
              );
            })}
            {nbPayslipsPending > 3 && (
              <AlertRow
                icon={ClipboardCheck}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
                title={`+ ${nbPayslipsPending - 3} autre${nbPayslipsPending - 3 > 1 ? "s" : ""} fiche${nbPayslipsPending - 3 > 1 ? "s" : ""} en attente`}
                subtitle="Voir toutes les fiches à valider"
                badge="Voir tout"
                badgeColor="bg-emerald-100 text-emerald-700"
                href="/dashboard/super-admin/rh/paie/a-valider"
              />
            )}

            {/* Transferts à valider */}
            {(transfertsToValidateRes.data || []).map((t) => (
              <AlertRow
                key={t.id}
                icon={Send}
                iconColor="text-purple-600"
                iconBg="bg-purple-50"
                title={`Transfert ${t.expediteur_nom} → ${t.beneficiaire_nom}`}
                subtitle={`${formatMoney(Number(t.montant_envoye), t.devise)} · ${formatRelativeTime(t.created_at)}`}
                badge="À valider"
                badgeColor="bg-purple-100 text-purple-700"
                href="/dashboard/super-admin/transferts"
              />
            ))}

            {/* Dépenses en attente */}
            {nbDepensesEnAttente > 0 && (
              <AlertRow
                icon={Receipt}
                iconColor="text-amber-600"
                iconBg="bg-amber-50"
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
                  iconBg="bg-orange-50"
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
                iconBg="bg-blue-50"
                title={`${nbDemandesNouvelles} demande${nbDemandesNouvelles > 1 ? "s" : ""} non traitée${nbDemandesNouvelles > 1 ? "s" : ""}`}
                subtitle="À assigner ou traiter par un agent"
                badge="Nouvelles"
                badgeColor="bg-blue-100 text-blue-700"
                href="/dashboard/super-admin/demandes"
              />
            )}
          </div>
        </Section>
      ) : (
        <Section
          eyebrow="Priorité"
          title="Tout est sous contrôle"
          icon={CheckCircle2}
          accent="emerald"
        >
          <EmptyState
            icon={CheckCircle2}
            tone="success"
            title="Aucune alerte"
            description="Pas de transfert à valider, pas de dépense en attente, pas de fiche de paie à examiner."
          />
        </Section>
      )}

      {/* ────────────────────────────────────────────────────── */}
      {/* 4. VUE FINANCIÈRE                                      */}
      {/* ────────────────────────────────────────────────────── */}
      <Section
        eyebrow="Pilotage financier"
        title="Vue financière"
        icon={CircleDollarSign}
        accent="emerald"
        subtitle="Encaissements, restants et dépenses — 7 derniers jours"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Encaissé aujourd'hui"
            value={formatMoney(totalToday)}
            sub={`${formatMoney(paiementsToday)} paie. + ${formatMoney(caisseToday)} caisse`}
            icon={Wallet}
            accent="green"
            trend={encaisseByDay}
            delta={trendDelta(encaisseByDay)}
            href="/dashboard/super-admin/paiements"
          />
          <MetricCard
            label="Encaissé ce mois"
            value={formatMoney(totalMonth)}
            sub={`Solde net : ${formatMoney(soldeNet)}`}
            icon={TrendingUp}
            accent="emerald"
            trend={encaisseCumulMonth}
            delta={trendDelta(encaisseCumulMonth)}
            href="/dashboard/super-admin/finances"
            highlight
          />
          <MetricCard
            label="Restant à encaisser"
            value={formatMoney(restantAEncaisser)}
            sub="Paiements partiels & non payés"
            icon={Clock}
            accent="orange"
            trend={restantByDay}
            href="/dashboard/super-admin/paiements"
          />
          <MetricCard
            label="Dépenses validées 7j"
            value={formatMoney(expensesByDay.reduce((s, v) => s + v, 0))}
            sub={`${nbDepensesEnAttente} en attente · ${formatMoney(depensesEnAttente)}`}
            icon={Receipt}
            accent="amber"
            trend={expensesByDay}
            delta={trendDelta(expensesByDay)}
            href="/dashboard/super-admin/depenses"
          />
        </div>
      </Section>

      {/* ────────────────────────────────────────────────────── */}
      {/* 5. ACTIVITÉ OPÉRATIONNELLE                             */}
      {/* ────────────────────────────────────────────────────── */}
      <Section
        eyebrow="Opérations"
        title="Activité opérationnelle"
        icon={Activity}
        accent="purple"
        subtitle="Demandes, rendez-vous et transferts"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OpCard
            label="Demandes nouvelles"
            value={nbDemandesNouvelles}
            icon={FileText}
            href="/dashboard/super-admin/demandes"
            urgent={nbDemandesNouvelles > 5}
            trend={demandesByDay}
          />
          <OpCard
            label="Demandes en cours"
            value={nbDemandesEnCours}
            icon={FileText}
            href="/dashboard/super-admin/demandes"
            trend={demandesByDay}
          />
          <OpCard
            label="RDV aujourd'hui"
            value={nbRdvToday}
            icon={CalendarCheck}
            href="/dashboard/super-admin/rdv"
            trend={appointmentsByDay}
          />
          <OpCard
            label="Transferts à valider"
            value={nbTransfertsPending}
            icon={Send}
            href="/dashboard/super-admin/transferts"
            urgent={nbTransfertsPending > 0}
          />
        </div>
      </Section>

      {/* ────────────────────────────────────────────────────── */}
      {/* 6. TALENT & RH                                         */}
      {/* ────────────────────────────────────────────────────── */}
      <Section
        eyebrow="Capital humain"
        title="Talent & RH"
        icon={Briefcase}
        accent="blue"
        subtitle="Clients CRM, employés, masse salariale et workflow paie"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RhStatCard
            label="Clients CRM"
            value={String(nbClients)}
            sub="Fiches business actives"
            icon={UserCircle}
            href="/dashboard/super-admin/clients"
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <RhStatCard
            label="Employés actifs"
            value={String(nbEmployeesActifs)}
            sub={`${nbEmployes} comptes app · masse ${formatMoney(masseSalariale)}/mois`}
            icon={Users}
            href="/dashboard/super-admin/rh/employes"
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <RhStatCard
            label="Fiches paie à valider"
            value={String(nbPayslipsPending)}
            sub={
              nbPayslipsPending > 0
                ? "Action requise — workflow validation"
                : "Aucune fiche en attente"
            }
            icon={ClipboardCheck}
            href="/dashboard/super-admin/rh/paie/a-valider"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            urgent={nbPayslipsPending > 0}
          />
          <RhStatCard
            label="Performances équipe"
            value={`${nbPayslipsValidatedMonth}`}
            sub={`Fiches validées ce mois · classement agents`}
            icon={Trophy}
            href="/dashboard/super-admin/stats-agents"
            iconColor="text-yellow-600"
            iconBg="bg-yellow-50"
            highlight
          />
        </div>
      </Section>

      {/* ────────────────────────────────────────────────────── */}
      {/* 7. PROCHAINS ÉVÉNEMENTS — RDV + Demandes côte à côte   */}
      {/* ────────────────────────────────────────────────────── */}
      {(nbRdvToday > 0 || (demandesUrgentesRes.data || []).length > 0) && (
        <Section
          eyebrow="Agenda du jour"
          title="Prochains événements"
          icon={CalendarCheck}
          accent="blue"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {/* RDV du jour */}
            <EventList
              title="Rendez-vous aujourd'hui"
              icon={CalendarCheck}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              empty="Aucun rendez-vous prévu"
              footerHref="/dashboard/super-admin/rdv"
              footerLabel="Voir tous les rendez-vous"
            >
              {(appointmentsTodayRes.data || []).map((rdv) => {
                const time = new Date(rdv.date_heure).toLocaleTimeString(
                  "fr-FR",
                  { hour: "2-digit", minute: "2-digit" }
                );
                return (
                  <li
                    key={rdv.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 font-mono text-xs font-bold text-blue-700">
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
                  </li>
                );
              })}
            </EventList>

            {/* Dernières demandes */}
            <EventList
              title="Dernières demandes reçues"
              icon={FileText}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              empty="Aucune nouvelle demande"
              footerHref="/dashboard/super-admin/demandes"
              footerLabel="Voir toutes les demandes"
            >
              {(demandesUrgentesRes.data || []).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
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
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      d.statut === "nouvelle"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {d.statut}
                  </span>
                </li>
              ))}
            </EventList>
          </div>
        </Section>
      )}

      {/* ────────────────────────────────────────────────────── */}
      {/* 8. RACCOURCIS NAVIGATION                               */}
      {/* ────────────────────────────────────────────────────── */}
      <Section
        eyebrow="Navigation"
        title="Raccourcis"
        icon={PieChart}
        accent="slate"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <NavLink href="/dashboard/super-admin/finances" icon={PieChart} label="Finances" />
          <NavLink href="/dashboard/super-admin/paiements" icon={Wallet} label="Paiements" />
          <NavLink href="/dashboard/super-admin/caisse" icon={ShoppingCart} label="Caisse" />
          <NavLink href="/dashboard/super-admin/transferts" icon={Send} label="Transferts" />
          <NavLink href="/dashboard/super-admin/depenses" icon={Receipt} label="Dépenses" />
          <NavLink href="/dashboard/super-admin/clients" icon={UserCircle} label="Clients (CRM)" />
          <NavLink href="/dashboard/super-admin/comptes-clients" icon={Users} label="Comptes clients" />
          <NavLink href="/dashboard/super-admin/equipe" icon={Briefcase} label="Équipe Nexus" />
          <NavLink href="/dashboard/super-admin/rh/employes" icon={Users} label="RH — Employés" />
          <NavLink href="/dashboard/super-admin/rh/paie" icon={Wallet} label="RH — Fiches paie" />
          <NavLink href="/dashboard/super-admin/rh/documents" icon={FolderOpen} label="RH — Documents" />
          <NavLink href="/dashboard/super-admin/i18n" icon={Globe} label="Multi-langue" />
          <NavLink href="/dashboard/super-admin/audit-log" icon={ShieldCheck} label="Audit log" />
          <NavLink href="/dashboard/super-admin/parametres" icon={Settings} label="Paramètres" />
        </div>
      </Section>
    </DashboardShell>
  );
}

// ============================================================================
// SOUS-COMPOSANTS premium tech
// ============================================================================

type SectionAccent =
  | "emerald"
  | "amber"
  | "purple"
  | "blue"
  | "slate"
  | "orange";

function Section({
  id,
  eyebrow,
  title,
  icon: Icon,
  accent = "orange",
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  icon: LucideIcon;
  accent?: SectionAccent;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const gradient: Record<SectionAccent, string> = {
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
    purple: "from-purple-500 to-purple-700",
    blue: "from-blue-500 to-blue-700",
    slate: "from-slate-500 to-slate-700",
    orange: "from-nexus-orange-500 to-nexus-orange-700",
  };

  const eyebrowColor: Record<SectionAccent, string> = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
    slate: "text-slate-500",
    orange: "text-nexus-orange-600",
  };

  return (
    <section id={id} className="mb-6 scroll-mt-6 sm:mb-8">
      <div className="mb-4 flex items-start gap-3 sm:mb-5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm sm:h-10 sm:w-10",
            gradient[accent]
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.18em]",
                eyebrowColor[accent]
              )}
            >
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

// ─── Card métrique financière (avec sparkline + delta) ─────────────────────
function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
  delta,
  href,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent: "green" | "emerald" | "orange" | "amber";
  trend?: number[];
  delta?: number;
  href: string;
  highlight?: boolean;
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

  const showSpark = trend && trend.length >= 2 && trend.some((v) => v > 0);
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const deltaUp = showDelta && delta! > 0;
  const deltaDown = showDelta && delta! < 0;

  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/40 hover:shadow-lg",
        highlight
          ? "border-nexus-orange-200 bg-gradient-to-br from-white via-white to-nexus-orange-50/40"
          : "border-slate-200"
      )}
    >
      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/10 blur-2xl transition-opacity duration-500 group-hover:bg-nexus-orange-500/20"
        />
      )}
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 truncate font-display text-xl font-bold tabular-nums sm:text-2xl",
              highlight
                ? "bg-gradient-to-r from-nexus-orange-600 to-nexus-orange-800 bg-clip-text text-transparent"
                : "text-nexus-blue-950"
            )}
          >
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{sub}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow",
            colorMap[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {(showSpark || showDelta) && (
        <div className="relative mt-3 flex items-center gap-2">
          {showDelta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                deltaUp && "bg-emerald-100 text-emerald-700",
                deltaDown && "bg-rose-100 text-rose-700",
                !deltaUp && !deltaDown && "bg-slate-100 text-slate-600"
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

// ─── Card opérationnelle compacte ──────────────────────────────────────────
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
  icon: LucideIcon;
  href: string;
  urgent?: boolean;
  trend?: number[];
}) {
  const showSpark = trend && trend.length >= 2 && trend.some((v) => v > 0);
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border bg-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        urgent
          ? "border-rose-300 bg-rose-50/60"
          : "border-slate-200 hover:border-nexus-orange-300/40"
      )}
    >
      <div className="flex items-start justify-between">
        <Icon
          className={cn(
            "h-5 w-5",
            urgent ? "text-rose-600" : "text-slate-400"
          )}
        />
        {urgent && (
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-rose-500" />
        )}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-2xl font-bold tabular-nums",
          urgent ? "text-rose-700" : "text-nexus-blue-950"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      {showSpark ? (
        <div
          className={cn(
            "mt-2 -mb-1",
            urgent ? "text-rose-500" : "text-nexus-blue-500"
          )}
        >
          <Sparkline data={trend!} height={20} />
        </div>
      ) : (
        <p className="mt-1 text-[10px] font-semibold text-slate-400 transition group-hover:text-nexus-blue-950">
          Voir →
        </p>
      )}
    </Link>
  );
}

// ─── Card RH / Talent ──────────────────────────────────────────────────────
function RhStatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  iconColor,
  iconBg,
  urgent,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
  iconBg: string;
  urgent?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border bg-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        urgent
          ? "border-emerald-300 bg-emerald-50/60"
          : highlight
            ? "border-yellow-300 bg-gradient-to-br from-yellow-50/60 via-white to-white"
            : "border-slate-200 hover:border-nexus-orange-300/40"
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            iconBg
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-nexus-blue-950" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums text-nexus-blue-950">
        {value}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">{sub}</p>
    </Link>
  );
}

// ─── Liste d'événements (RDV / demandes) ───────────────────────────────────
function EventList({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  empty,
  footerHref,
  footerLabel,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  empty: string;
  footerHref: string;
  footerLabel: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            iconBg
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </div>
        <p className="text-sm font-semibold text-nexus-blue-950">{title}</p>
      </div>
      {hasItems ? (
        <ul className="divide-y divide-slate-100 text-sm">{children}</ul>
      ) : (
        <p className="p-6 text-center text-xs text-slate-400">{empty}</p>
      )}
      <div className="border-t border-slate-100 p-3 text-center">
        <Link
          href={footerHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-nexus-blue-950"
        >
          {footerLabel}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Ligne d'alerte ────────────────────────────────────────────────────────
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
  icon: LucideIcon;
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
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 ring-1 ring-slate-100/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/40 hover:shadow-md"
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
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
      <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
    </Link>
  );
}

// ─── Lien navigation rapide ────────────────────────────────────────────────
function NavLink({
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
      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-sm"
    >
      <Icon className="h-4 w-4 text-slate-500 transition group-hover:text-nexus-blue-950" />
      <span className="truncate text-xs font-semibold text-slate-700 group-hover:text-nexus-blue-950">
        {label}
      </span>
    </Link>
  );
}
