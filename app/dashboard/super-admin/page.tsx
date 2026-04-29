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
import { cn } from "@/lib/utils";

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

  return (
    <DashboardShell profile={profile}>
      {/* ======================================================== */}
      {/* HEADER */}
      {/* ======================================================== */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
            Centre de pilotage
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-nexus-blue-950">
            Bonjour {profile.prenom || profile.nom} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {today.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {derniereActivite && (
              <>
                {" · "}
                <span className="text-xs">
                  Dernière activité {formatRelativeTime(derniereActivite)}
                </span>
              </>
            )}
          </p>
        </div>

        {totalAlertes > 0 && (
          <Link
            href="#alertes"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
          >
            <AlertTriangle className="h-4 w-4" />
            {totalAlertes} chose{totalAlertes > 1 ? "s" : ""} à traiter
          </Link>
        )}
      </div>

      {/* ======================================================== */}
      {/* ACTIONS RAPIDES */}
      {/* ======================================================== */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Actions rapides
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <QuickAction
            icon={UserCircle}
            label="Nouveau client"
            href="/dashboard/super-admin/clients"
            color="blue"
          />
          <QuickAction
            icon={Briefcase}
            label="Créer employé"
            href="/dashboard/super-admin/equipe/nouveau"
            color="indigo"
          />
          <QuickAction
            icon={Wallet}
            label="Enregistrer paiement"
            href="/dashboard/super-admin/paiements"
            color="green"
          />
          <QuickAction
            icon={ShoppingCart}
            label="Caisse rapide"
            href="/dashboard/super-admin/caisse"
            color="orange"
          />
          <QuickAction
            icon={Send}
            label="Voir transferts"
            href="/dashboard/super-admin/transferts"
            color="purple"
            badge={nbTransfertsPending > 0 ? nbTransfertsPending : undefined}
          />
          <QuickAction
            icon={Receipt}
            label="Valider dépenses"
            href="/dashboard/super-admin/depenses"
            color="amber"
            badge={nbDepensesEnAttente > 0 ? nbDepensesEnAttente : undefined}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* VUE FINANCIERE */}
      {/* ======================================================== */}
      <Section
        title="Vue financière"
        icon={CircleDollarSign}
        color="text-emerald-600"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceCard
            label="Encaissé aujourd'hui"
            value={formatMoney(totalToday)}
            sub={`${formatMoney(paiementsToday)} paie. + ${formatMoney(caisseToday)} caisse`}
            icon={Wallet}
            accent="green"
            trend="up"
            href="/dashboard/super-admin/paiements"
          />
          <FinanceCard
            label="Encaissé ce mois"
            value={formatMoney(totalMonth)}
            sub={`Solde net : ${formatMoney(soldeNet)}`}
            icon={TrendingUp}
            accent="emerald"
            href="/dashboard/super-admin/finances"
          />
          <FinanceCard
            label="Restant à encaisser"
            value={formatMoney(restantAEncaisser)}
            sub="Paiements partiels & non payés"
            icon={Clock}
            accent="orange"
            href="/dashboard/super-admin/paiements"
          />
          <FinanceCard
            label="Dépenses en attente"
            value={formatMoney(depensesEnAttente)}
            sub={`${nbDepensesEnAttente} dépense${nbDepensesEnAttente > 1 ? "s" : ""} à valider`}
            icon={Receipt}
            accent="amber"
            href="/dashboard/super-admin/depenses"
          />
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
          />
          <OpCard
            label="Demandes en cours"
            value={nbDemandesEnCours}
            icon={FileText}
            href="/dashboard/super-admin/demandes"
          />
          <OpCard
            label="RDV aujourd'hui"
            value={nbRdvToday}
            icon={CalendarCheck}
            href="/dashboard/super-admin/rendez-vous"
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

      {/* ======================================================== */}
      {/* EQUIPE NEXUS */}
      {/* ======================================================== */}
      <Section title="Équipe Nexus" icon={Briefcase} color="text-nexus-blue-700">
        <div className="grid gap-4 lg:grid-cols-3">
          <Link
            href="/dashboard/super-admin/clients"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
            className="group rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
        <div className="mb-6 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
            Tout est sous contrôle 🎉
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Aucune alerte. Pas de transfert à valider, pas de dépense en attente,
            pas de demande non traitée.
          </p>
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
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
  color,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  color: "blue" | "indigo" | "green" | "orange" | "purple" | "amber";
  badge?: number;
}) {
  const colorMap = {
    blue: "from-blue-500 to-blue-700",
    indigo: "from-indigo-500 to-indigo-700",
    green: "from-emerald-500 to-emerald-700",
    orange: "from-nexus-orange-500 to-nexus-orange-700",
    purple: "from-purple-500 to-purple-700",
    amber: "from-amber-500 to-amber-700",
  };
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {badge && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow",
          colorMap[color]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-semibold leading-tight text-slate-700">
        {label}
      </span>
    </Link>
  );
}

function FinanceCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "green" | "emerald" | "orange" | "amber";
  trend?: "up" | "down";
  href: string;
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    emerald: "from-teal-400 to-emerald-600",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    amber: "from-amber-400 to-amber-600",
  };
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition group-hover:text-nexus-blue-950">
        {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
        {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
        Voir détails →
      </div>
    </Link>
  );
}

function OpCard({
  label,
  value,
  icon: Icon,
  href,
  urgent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        urgent
          ? "border-red-300 bg-red-50"
          : "border-slate-200"
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
          "mt-2 font-display text-2xl font-bold",
          urgent ? "text-red-700" : "text-nexus-blue-950"
        )}
      >
        {value}
      </p>
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition group-hover:text-nexus-blue-950">
        Voir →
      </div>
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
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-nexus-blue-200 hover:shadow-md"
    >
      <Icon className="h-4 w-4 text-slate-500 transition group-hover:text-nexus-blue-950" />
      <span className="text-xs font-semibold text-slate-700 group-hover:text-nexus-blue-950">
        {label}
      </span>
    </Link>
  );
}
