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
  Phone,
  Mail,
  MessageCircle,
  UserCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  CATEGORIE_META,
  getCategorieFromService,
  isCategorieDossier,
} from "@/lib/demande-categories";

export const metadata = {
  title: "NEXUS CONNECT - Mon espace",
};

export const dynamic = "force-dynamic";

const DEFAULT_WHATSAPP = "23673269692";
const DEFAULT_PHONE = "+236 73 26 96 92";
const DEFAULT_EMAIL = "contact@nexusrca.com";

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

function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, "").replace(/\+/g, "");
}

function getStatusInfo(statut: string): {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  const lower = (statut || "").toLowerCase().trim();
  if (lower === "nouveau" || lower === "nouvelle" || lower.startsWith("nouv")) {
    return { label: "Nouveau", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Sparkles };
  }
  if (lower.includes("cours") || lower.includes("traitement")) {
    return { label: "En cours", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock };
  }
  if (lower.includes("traite") || lower.includes("complet") || lower.includes("termin")) {
    return { label: "Terminé", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
  }
  if (lower.includes("annul") || lower.includes("rejet")) {
    return { label: "Annulé", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle };
  }
  return { label: statut || "—", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText };
}

function isDossierEnCours(statut: string): boolean {
  const lower = (statut || "").toLowerCase().trim();
  if (lower.includes("traite")) return false;
  if (lower.includes("complet")) return false;
  if (lower.includes("termin")) return false;
  if (lower.includes("annul")) return false;
  if (lower.includes("rejet")) return false;
  if (lower === "fini" || lower === "ferme") return false;
  return true;
}

export default async function ClientDashboard() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  const userEmail = (profile.email || "").toLowerCase().trim();

  const { data: demandesData } = await supabase
    .from("demandes")
    .select("*")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  const demandes = demandesData || [];

  // Compteurs documents requis (en_attente) par dossier
  const demandeIds = demandes.map((d) => d.id);
  let docsRequiredByDemande = new Map<string, number>();
  let agentsByDemande = new Map<
    string,
    { id: string; nom: string | null; prenom: string | null }
  >();
  if (demandeIds.length > 0) {
    const { data: docReqs } = await supabase
      .from("demande_documents_requests")
      .select("demande_id, statut")
      .in("demande_id", demandeIds)
      .eq("statut", "en_attente");
    (docReqs || []).forEach((r) => {
      const did = (r as { demande_id: string }).demande_id;
      docsRequiredByDemande.set(did, (docsRequiredByDemande.get(did) || 0) + 1);
    });

    const agentIds = Array.from(
      new Set(
        demandes
          .map((d) => (d as Record<string, unknown>).agent_id as string | null)
          .filter((v): v is string => Boolean(v))
      )
    );
    if (agentIds.length > 0) {
      const { data: agentRows } = await supabase
        .from("profiles")
        .select("id, nom, prenom")
        .in("id", agentIds);
      (agentRows || []).forEach((a) => {
        const aa = a as { id: string; nom: string | null; prenom: string | null };
        agentsByDemande.set(aa.id, aa);
      });
    }
  }

  const { data: paiementsData } = await supabase
    .from("payments")
    .select(
      "id, reference, service, montant_total, montant_recu, devise, statut, date_paiement, client_email"
    )
    .eq("client_email", userEmail)
    .order("date_paiement", { ascending: false })
    .limit(20);

  const paiements = paiementsData || [];

  const { data: rdvsData } = await supabase
    .from("appointments")
    .select("id, service, rdv_date, rdv_heure, statut, email")
    .eq("email", userEmail)
    .order("rdv_date", { ascending: false })
    .limit(5);

  const rdvs = rdvsData || [];

  const dossierAvecAgent = demandes.find(
    (d) => (d as Record<string, unknown>).agent_id
  );
  type AgentInfo = {
    prenom?: string | null;
    nom?: string | null;
    email?: string | null;
    telephone?: string | null;
    poste?: string | null;
  };
  let agentInfo: AgentInfo | null = null;
  const agentIdFromDossier = (dossierAvecAgent as Record<string, unknown> | undefined)
    ?.agent_id as string | undefined;
  if (agentIdFromDossier) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("prenom, nom, email, telephone, poste")
      .eq("id", agentIdFromDossier)
      .single();
    agentInfo = (agentData as AgentInfo | null) || null;
  }

  const totalPaye = paiements.reduce((s, p) => s + Number(p.montant_recu || 0), 0);
  const totalDu = paiements.reduce((s, p) => s + Number(p.montant_total || 0), 0);
  const totalRestant = Math.max(0, totalDu - totalPaye);
  const partiels = paiements.filter((p) => p.statut === "partiel");

  const dossiersEnCours = demandes.filter((d) => isDossierEnCours(d.statut || "")).length;
  const dossiersTermines = demandes.filter((d) => {
    const lower = (d.statut || "").toLowerCase();
    return lower.includes("traite") || lower.includes("complet") || lower.includes("termin");
  }).length;

  const firstName =
    profile.prenom || profile.nom?.split(" ")[0] || profile.email?.split("@")[0] || "";

  const hasAgent = agentInfo && (agentInfo.prenom || agentInfo.nom);
  const agentFullName = hasAgent
    ? [agentInfo?.prenom, agentInfo?.nom].filter(Boolean).join(" ")
    : "L'équipe Nexus";
  const agentInitials = hasAgent
    ? ((agentInfo?.prenom?.[0] || "") + (agentInfo?.nom?.[0] || "")).toUpperCase()
    : "NX";
  const agentPhoneRaw = agentInfo?.telephone || DEFAULT_PHONE;
  const agentPhoneClean = cleanPhone(agentPhoneRaw);
  const agentWhatsApp = agentInfo?.telephone ? cleanPhone(agentInfo.telephone) : DEFAULT_WHATSAPP;
  const agentPhoneDisplay = agentInfo?.telephone || DEFAULT_PHONE;
  const agentEmail = agentInfo?.email || DEFAULT_EMAIL;
  const greetingFirstName = firstName || "un client Nexus";
  const whatsappMessage = encodeURIComponent(
    `Bonjour ${agentFullName}, je suis ${greetingFirstName} et je souhaite vous contacter au sujet de mon dossier.`
  );

  return (
    <DashboardShell profile={profile}>
      {/* HEADER */}
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

      {/* APERÇU - 3 CARTES CLIQUABLES */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <ClickableStat
          icon={FolderOpen}
          label="Dossiers en cours"
          value={dossiersEnCours.toString()}
          sub={demandes.length === 0 ? "Aucun dossier" : `${demandes.length} au total`}
          accent="orange"
          href="/dashboard/client/demandes?status=en_cours"
        />
        <ClickableStat
          icon={Wallet}
          label="Total payé"
          value={formatMoney(totalPaye)}
          sub={
            totalRestant > 0
              ? `Reste : ${formatMoney(totalRestant)}`
              : paiements.length === 0
                ? "Aucun paiement"
                : "Tous vos paiements à jour"
          }
          accent="blue"
          href="/dashboard/client/paiements"
        />
        <ClickableStat
          icon={CheckCircle2}
          label="Dossiers terminés"
          value={dossiersTermines.toString()}
          sub={
            dossiersTermines > 0
              ? "Bravo, dossiers traités !"
              : "Vos dossiers traités s'afficheront ici"
          }
          accent="orange"
          href="/dashboard/client/demandes?status=complete"
        />
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="grid gap-6 lg:grid-cols-3">
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
                icon={FolderOpen}
                variant="embedded"
                title="Aucun dossier pour le moment"
                description="Lancez votre première demande de service avec Nexus."
                action={
                  <Link
                    href="/demande/complet"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-body-sm font-semibold text-white shadow-elev-2 hover:bg-brand-hover"
                  >
                    Faire une demande
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {demandes.slice(0, 5).map((d) => {
                  const status = getStatusInfo(d.statut || "");
                  const StatusIcon = status.icon;
                  const dRecord = d as Record<string, unknown>;
                  const ref =
                    (dRecord.reference as string) ||
                    `NX-${(d.id as string).slice(0, 8).toUpperCase()}`;
                  const catRaw = (dRecord.categorie_dossier as string) || "";
                  const cat = isCategorieDossier(catRaw)
                    ? catRaw
                    : getCategorieFromService(d.service);
                  const meta = CATEGORIE_META[cat];
                  const Icon = meta.icon;
                  const step = (dRecord.current_step as number) || 1;
                  const docsReq = docsRequiredByDemande.get(d.id) || 0;
                  const aId = (dRecord.agent_id as string) || null;
                  const ag = aId ? agentsByDemande.get(aId) : null;
                  const agName = ag
                    ? [ag.prenom, ag.nom].filter(Boolean).join(" ").trim()
                    : null;

                  return (
                    <Link
                      key={d.id}
                      href={`/dashboard/client/demandes/${d.id}`}
                      className="block p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            meta.iconBg
                          )}
                        >
                          <Icon className={cn("h-5 w-5", meta.iconColor)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-nexus-blue-950">
                              {d.objet || d.service || "Dossier"}
                            </p>
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
                          <p className="font-mono text-[11px] text-nexus-orange-600">
                            {ref}
                          </p>
                          <p className="text-xs text-slate-500">
                            {meta.shortLabel} · {formatDate(d.created_at)}
                          </p>
                          {/* Mini progress bar X/6 */}
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-semibold tabular-nums">
                              Étape {step}/6
                            </span>
                            <span className="h-1 w-24 overflow-hidden rounded-full bg-slate-100">
                              <span
                                className="block h-full bg-nexus-orange-500"
                                style={{
                                  width: `${Math.min(100, (step / 6) * 100)}%`,
                                }}
                              />
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                            {agName ? (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <UserCircle className="h-3 w-3 text-nexus-blue-700" />
                                Conseiller : {agName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">
                                Conseiller : en cours d&rsquo;attribution
                              </span>
                            )}
                            {docsReq > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-100 px-2 py-0.5 font-semibold text-nexus-orange-700">
                                <AlertCircle className="h-3 w-3" />
                                {docsReq} document{docsReq > 1 ? "s" : ""} à fournir
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>

          {/* MES FINANCES */}
          <Section
            title="Mes finances"
            icon={Wallet}
            href="/dashboard/client/paiements"
            seeAll="Voir le détail"
            count={paiements.length}
          >
            {paiements.length === 0 ? (
              <EmptyState
                icon={Wallet}
                variant="embedded"
                title="Aucun paiement enregistré"
                description="Les paiements de vos services apparaîtront ici."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-4 sm:grid-cols-3">
                  <FinanceBlock label="Total dû" value={formatMoney(totalDu)} color="text-slate-700" />
                  <FinanceBlock label="Payé" value={formatMoney(totalPaye)} color="text-green-600" />
                  <FinanceBlock
                    label="Restant"
                    value={formatMoney(totalRestant)}
                    color={totalRestant > 0 ? "text-nexus-orange-600" : "text-green-600"}
                  />
                </div>
                {partiels.length > 0 && (
                  <div className="border-b border-slate-100 bg-amber-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      ⚠️ {partiels.length} paiement{partiels.length > 1 ? "s" : ""} partiel
                      {partiels.length > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <div className="divide-y divide-slate-100">
                  {paiements.slice(0, 5).map((p) => {
                    const restant = Number(p.montant_total) - Number(p.montant_recu);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-4">
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
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-800 p-6">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-nexus-orange-500/20 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 font-display text-xl font-bold text-white shadow-lg">
                  {agentInitials || <UserCircle className="h-8 w-8" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-400">
                    {hasAgent ? "Votre agent dédié" : "Nous sommes là pour vous"}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">
                    {agentFullName}
                  </h3>
                  {agentInfo?.poste && (
                    <p className="mt-0.5 text-xs text-slate-300">{agentInfo.poste}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4">
              <a
                href={`https://wa.me/${agentWhatsApp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3 transition hover:bg-green-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white shadow">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-green-900">WhatsApp</span>
                  <span className="block text-xs text-green-700">Réponse rapide</span>
                </span>
              </a>

              <a
                href={`tel:${agentPhoneClean}`}
                className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 transition hover:bg-blue-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-blue-900">Appel direct</span>
                  <span className="block text-xs text-blue-700">{agentPhoneDisplay}</span>
                </span>
              </a>

              <a
                href={`mailto:${agentEmail}?subject=Question concernant mon dossier Nexus`}
                className="flex items-center gap-3 rounded-xl border border-nexus-orange-200 bg-nexus-orange-50 p-3 transition hover:bg-nexus-orange-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500 text-white shadow">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-nexus-orange-900">Email</span>
                  <span className="block text-xs text-nexus-orange-700">Pour le détail</span>
                </span>
              </a>
            </div>
          </div>

          {rdvs.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 p-4">
                <Calendar className="h-5 w-5 text-nexus-orange-600" />
                <h3 className="font-display text-base font-bold text-nexus-blue-950">
                  Mes rendez-vous
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {rdvs.slice(0, 3).map((rdv) => {
                  const r = rdv as Record<string, unknown>;
                  const date = r.rdv_date as string | undefined;
                  const heure = r.rdv_heure as string | undefined;
                  return (
                    <div key={r.id as string} className="p-3">
                      <p className="text-sm font-semibold text-nexus-blue-950">
                        {(r.service as string) || "Rendez-vous"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {date ? formatDate(date) : ""}
                        {heure && ` · ${heure}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Link
            href="/demande/complet"
            className="block rounded-2xl border-2 border-dashed border-nexus-orange-300 bg-nexus-orange-50 p-5 text-center transition hover:bg-nexus-orange-100"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-orange-500 text-white shadow-lg">
              <Plus className="h-6 w-6" />
            </span>
            <span className="mt-3 block font-display text-base font-bold text-nexus-blue-950">
              Nouvelle demande
            </span>
            <span className="mt-1 block text-xs text-slate-600">
              Lancez une nouvelle démarche avec Nexus.
            </span>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

// ============================================================================
// CARTE STATISTIQUE CLIQUABLE - UN SEUL <Link>, contenu = <span>/<div> seulement
// ============================================================================
function ClickableStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent: "orange" | "blue";
  href: string;
}) {
  const colorMap = {
    orange: "from-nexus-orange-500 to-nexus-orange-700",
    blue: "from-nexus-blue-700 to-nexus-blue-900",
  };
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-nexus-orange-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-slate-500">{label}</span>
          <span className="mt-1 block truncate font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {value}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">{sub}</span>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105",
            colorMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition group-hover:text-nexus-orange-600">
        Voir le détail
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
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
          <h2 className="font-display text-base font-bold text-nexus-blue-950">{title}</h2>
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
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("mt-0.5 font-display text-base font-bold", color)}>{value}</p>
    </div>
  );
}
