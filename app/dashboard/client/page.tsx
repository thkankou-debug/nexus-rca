import Link from "next/link";
import {
  Sparkles,
  FolderOpen,
  Wallet,
  FileText,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Download,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AgentContactCard } from "@/components/dashboard/AgentContactCard";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "NEXUS CONNECT - Mon espace",
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusInfo(statut: string): {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  const lower = statut?.toLowerCase() || "";
  if (lower.includes("nouvelle"))
    return {
      label: "Nouvelle",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Sparkles,
    };
  if (lower.includes("cours") || lower.includes("traitement"))
    return {
      label: "En cours",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: Clock,
    };
  if (lower.includes("traite") || lower.includes("complete") || lower.includes("termin"))
    return {
      label: "Terminée",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    };
  if (lower.includes("annul") || lower.includes("rejet"))
    return {
      label: "Annulée",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: AlertCircle,
    };
  return {
    label: statut || "—",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: FileText,
  };
}

export default async function ClientDashboard() {
  const profile = await requireProfile(["client"]);
  const supabase = createClient();

  // ============================================================
  // CHARGEMENT DES DONNEES
  // ============================================================
  const [demandesRes, paiementsRes, rdvRes] = await Promise.all([
    // Demandes du client
    supabase
      .from("demandes")
      .select("id, objet, service, statut, created_at, assigne_a")
      .eq("client_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    // Paiements liés au client
    supabase
      .from("payments")
      .select(
        "id, reference, service, montant_total, montant_recu, devise, statut, date_paiement, mode_paiement"
      )
      .or(`client_email.eq.${profile.email},client_record_id.in.(${profile.id})`)
      .order("date_paiement", { ascending: false })
      .limit(20),
    // RDV
    supabase
      .from("appointments")
      .select("id, service, date_heure, statut")
      .or(`email.eq.${profile.email},user_id.eq.${profile.id}`)
      .order("date_heure", { ascending: false })
      .limit(5),
  ]);

  const demandes = demandesRes.data || [];
  const paiements = paiementsRes.data || [];
  const rdvs = rdvRes.data || [];

  // Trouver l agent du dossier le plus recent qui a un agent assigne
  const dossierAvecAgent = demandes.find((d) => d.assigne_a);
  let agentInfo = null;
  if (dossierAvecAgent?.assigne_a) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, telephone, poste")
      .eq("id", dossierAvecAgent.assigne_a)
      .single();
    agentInfo = agentData;
  }

  // ============================================================
  // CALCULS FINANCES
  // ============================================================
  const totalPaye = paiements.reduce(
    (s, p) => s + Number(p.montant_recu || 0),
    0
  );
  const totalDu = paiements.reduce(
    (s, p) => s + Number(p.montant_total || 0),
    0
  );
  const totalRestant = Math.max(0, totalDu - totalPaye);

  const partiels = paiements.filter((p) => p.statut === "partiel");
  const dossiersEnCours = demandes.filter(
    (d) =>
      !d.statut?.toLowerCase().includes("traite") &&
      !d.statut?.toLowerCase().includes("complet") &&
      !d.statut?.toLowerCase().includes("annul")
  ).length;

  const clientName = [profile.prenom, profile.nom].filter(Boolean).join(" ");
  const firstName = profile.prenom || profile.nom?.split(" ")[0] || "";

  return (
    <DashboardShell profile={profile}>
      {/* ======================================================== */}
      {/* HEADER NEXUS CONNECT */}
      {/* ======================================================== */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 sm:p-8">
        <div className="relative">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-nexus-orange-400 backdrop-blur">
              <Sparkles className="h-3 w-3" />
              NEXUS CONNECT
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Bonjour {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Bienvenue dans votre espace personnel Nexus.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* APERÇU RAPIDE - 3 CARTES */}
      {/* ======================================================== */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <QuickStat
          icon={FolderOpen}
          label="Dossiers en cours"
          value={dossiersEnCours.toString()}
          sub={`${demandes.length} au total`}
          accent="orange"
        />
        <QuickStat
          icon={Wallet}
          label="Total payé"
          value={formatMoney(totalPaye)}
          sub={
            totalRestant > 0
              ? `Reste : ${formatMoney(totalRestant)}`
              : "Tous vos paiements à jour"
          }
          accent="blue"
        />
        <QuickStat
          icon={FileText}
          label="Documents disponibles"
          value={paiements
            .filter((p) => p.statut === "paye" || p.statut === "partiel")
            .length.toString()}
          sub="Reçus téléchargeables"
          accent="orange"
        />
      </div>

      {/* ======================================================== */}
      {/* GRILLE PRINCIPALE - 2 colonnes */}
      {/* ======================================================== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* COLONNE GAUCHE (2/3) - Dossiers + Paiements + Documents */}
        <div className="space-y-6 lg:col-span-2">
          {/* MES DOSSIERS */}
          <Section
            title="Mes dossiers en cours"
            icon={FolderOpen}
            href="/dashboard/client/demandes"
            seeAll="Voir tous mes dossiers"
            count={demandes.length}
          >
            {demandes.length === 0 ? (
              <EmptyState
                title="Aucun dossier pour le moment"
                description="Lancez votre première demande de service avec Nexus."
                action={{
                  label: "Faire une demande",
                  href: "/services",
                }}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {demandes.slice(0, 5).map((d) => {
                  const status = getStatusInfo(d.statut || "");
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-nexus-blue-950">
                          {d.objet || d.service || "Demande"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {d.service} · {formatDate(d.created_at)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                          status.color
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* MES FINANCES */}
          <Section
            title="Mes finances"
            icon={Wallet}
            href="/dashboard/client/demandes"
            seeAll="Voir le détail"
            count={paiements.length}
          >
            {paiements.length === 0 ? (
              <EmptyState
                title="Aucun paiement enregistré"
                description="Les paiements de vos services apparaîtront ici."
              />
            ) : (
              <>
                {/* Resume financier */}
                <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-4 sm:grid-cols-3">
                  <FinanceBlock
                    label="Total dû"
                    value={formatMoney(totalDu)}
                    color="text-slate-700"
                  />
                  <FinanceBlock
                    label="Payé"
                    value={formatMoney(totalPaye)}
                    color="text-green-600"
                  />
                  <FinanceBlock
                    label="Restant"
                    value={formatMoney(totalRestant)}
                    color={
                      totalRestant > 0
                        ? "text-nexus-orange-600"
                        : "text-green-600"
                    }
                  />
                </div>

                {partiels.length > 0 && (
                  <div className="border-b border-slate-100 bg-amber-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      ⚠️ {partiels.length} paiement
                      {partiels.length > 1 ? "s" : ""} partiel
                      {partiels.length > 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 text-xs text-amber-900">
                      Vous avez des montants restant à régler. Contactez votre agent pour faire le complément.
                    </p>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {paiements.slice(0, 5).map((p) => {
                    const restant =
                      Number(p.montant_total) - Number(p.montant_recu);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nexus-blue-50 text-nexus-blue-700">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-nexus-blue-950">
                            {p.service}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.reference} · {formatDate(p.date_paiement)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-nexus-blue-950">
                            {formatMoney(Number(p.montant_recu), p.devise)}
                          </p>
                          {restant > 0 && (
                            <p className="text-[10px] font-semibold text-nexus-orange-600">
                              Reste : {formatMoney(restant, p.devise)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Section>

          {/* MES DOCUMENTS */}
          <Section
            title="Mes documents"
            icon={FileText}
            count={paiements.filter((p) => p.statut !== "annule").length}
          >
            {paiements.length === 0 ? (
              <EmptyState
                title="Aucun document disponible"
                description="Vos reçus et factures apparaîtront ici après vos paiements."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {paiements
                  .filter((p) => p.statut !== "annule")
                  .slice(0, 5)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-nexus-blue-950">
                          Reçu de paiement
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.service} · {p.reference}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/client/demandes`}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="h-3 w-3" />
                        Voir
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </Section>
        </div>

        {/* COLONNE DROITE (1/3) - Agent + RDV */}
        <div className="space-y-6">
          {/* MON AGENT DEDIE */}
          <AgentContactCard agent={agentInfo} clientName={clientName} />

          {/* RDV À VENIR */}
          {rdvs.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 p-4">
                <Calendar className="h-5 w-5 text-nexus-orange-600" />
                <h3 className="font-display text-base font-bold text-nexus-blue-950">
                  Mes rendez-vous
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {rdvs.slice(0, 3).map((rdv) => (
                  <div key={rdv.id} className="p-3">
                    <p className="text-sm font-semibold text-nexus-blue-950">
                      {rdv.service}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(rdv.date_heure).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-3">
                <Link
                  href="/dashboard/client/rdv"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-nexus-blue-950"
                >
                  Voir tous mes rendez-vous
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* CTA Nouvelle demande */}
          <Link
            href="/services"
            className="block rounded-2xl border-2 border-dashed border-nexus-orange-300 bg-nexus-orange-50 p-5 text-center transition hover:-translate-y-0.5 hover:bg-nexus-orange-100 hover:shadow-md"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-orange-500 text-white shadow-lg">
              <Plus className="h-6 w-6" />
            </div>
            <p className="mt-3 font-display text-base font-bold text-nexus-blue-950">
              Nouvelle demande
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Découvrez nos services et lancez une nouvelle démarche.
            </p>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function QuickStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent: "orange" | "blue";
}) {
  const colorMap = {
    orange: "from-nexus-orange-500 to-nexus-orange-700",
    blue: "from-nexus-blue-700 to-nexus-blue-900",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  href,
  seeAll,
  count,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  seeAll?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-nexus-orange-600" />
          <h2 className="font-display text-base font-bold text-nexus-blue-950">
            {title}
          </h2>
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {count}
            </span>
          )}
        </div>
        {href && seeAll && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-nexus-blue-950"
          >
            {seeAll}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="p-8 text-center">
      <p className="font-semibold text-nexus-blue-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-nexus-orange-600"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function FinanceBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={cn("mt-0.5 font-display text-base font-bold", color)}>
        {value}
      </p>
    </div>
  );
}
