import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  Building2,
  Landmark,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit3,
  CalendarCheck,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ClientMergeAction } from "@/components/dashboard/ClientMergeAction";
import type { Demande } from "@/types";

// ============================================================================
// TYPES (autonome - pas d'import externe)
// ============================================================================
type ClientType = "particulier" | "entreprise" | "institution";

interface Client {
  id: string;
  reference: string | null;
  type: ClientType;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  numero_identification: string | null;
  email: string | null;
  telephone: string | null;
  telephone_2: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  profile_id: string | null;
  notes: string | null;
  actif: boolean;
  merged_into_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

type PaymentStatus =
  | "non_paye"
  | "partiel"
  | "paye"
  | "rembourse"
  | "annule";

interface Payment {
  id: string;
  reference: string | null;
  client_email: string | null;
  client_telephone: string | null;
  service: string;
  montant_total: number;
  montant_recu: number;
  devise: string;
  date_paiement: string;
  statut: PaymentStatus;
  status: string;
}

// ============================================================================
// CONSTANTES (defensives - pas de undefined possible)
// ============================================================================
function getTypeLabel(type: ClientType | string): string {
  const labels: Record<string, string> = {
    particulier: "Particulier",
    entreprise: "Entreprise",
    institution: "Institution",
  };
  return labels[type] || "Client";
}

function getTypeIcon(type: ClientType | string) {
  if (type === "entreprise") return Building2;
  if (type === "institution") return Landmark;
  return User;
}

function getTypeColor(type: ClientType | string): string {
  if (type === "entreprise") return "from-purple-500 to-purple-700";
  if (type === "institution") return "from-emerald-500 to-emerald-700";
  return "from-blue-500 to-indigo-700";
}

// P6-0 : accepte les valeurs canoniques (D1) en plus des heritees, avec repli.
function getPaymentStatusLabel(status: PaymentStatus | string): string {
  const labels: Record<string, string> = {
    non_paye: "Non payé",
    partiel: "Partiel",
    paye: "Payé",
    rembourse: "Remboursé",
    annule: "Annulé",
    pending: "Non payé",
    partial: "Partiel",
    paid: "Payé",
    refunded: "Remboursé",
    voided: "Annulé",
  };
  return labels[status] || status;
}

function getPaymentStatusColor(status: PaymentStatus | string): string {
  const colors: Record<string, string> = {
    non_paye: "bg-red-100 text-red-700",
    partiel: "bg-amber-100 text-amber-700",
    paye: "bg-green-100 text-green-700",
    rembourse: "bg-slate-100 text-slate-700",
    annule: "bg-slate-100 text-slate-500",
    pending: "bg-red-100 text-red-700",
    partial: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    refunded: "bg-slate-100 text-slate-700",
    voided: "bg-slate-100 text-slate-500",
  };
  return colors[status] || "bg-slate-100 text-slate-700";
}

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
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

function getDisplayName(client: Client): string {
  if (client.type === "particulier") {
    return [client.prenom, client.nom].filter(Boolean).join(" ") || client.nom;
  }
  return client.nom;
}

export const metadata = {
  title: "Fiche client | Super Admin",
};

export const dynamic = "force-dynamic";

// ============================================================================
// PAGE
// ============================================================================
export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!clientData) notFound();
  const client = clientData as Client;

  // A6 lot 1 : liaison directe par client_record_id (P3) — remplace le
  // rapprochement par email/téléphone. "Une liaison directe par ID arrivera
  // dans la prochaine mise à jour" (commentaire laissé dans ce fichier avant
  // A6) : c'est fait.
  const { data: paymentsRows } = await supabase
    .from("payments")
    .select("*")
    .eq("client_record_id", client.id)
    .order("created_at", { ascending: false });
  const paymentsData = (paymentsRows || []) as Payment[];

  const { data: demandesRows } = await supabase
    .from("demandes")
    .select("*")
    .eq("client_record_id", client.id)
    .order("created_at", { ascending: false });
  const demandesData = (demandesRows || []) as Demande[];

  // Rendez-vous : appointments.client_id référence profiles.id, pas
  // clients.id — nécessite client.profile_id (peuplé par le trigger P3
  // uniquement pour les clients ayant un compte).
  let rdvData: Array<{
    id: string;
    reference: string | null;
    rdv_date: string;
    rdv_heure: string;
    statut: string;
    service_type: string | null;
  }> = [];
  if (client.profile_id) {
    const { data } = await supabase
      .from("appointments")
      .select("id, reference, rdv_date, rdv_heure, statut, service_type")
      .eq("client_id", client.profile_id)
      .order("rdv_date", { ascending: false });
    rdvData = data || [];
  }

  // Communications récentes : messages des dossiers du client, tous
  // regroupés (demande_messages est par dossier, pas par client).
  const demandeIds = demandesData.map((d) => d.id);
  let messagesData: Array<{
    id: string;
    demande_id: string;
    author_name: string;
    content: string;
    created_at: string;
  }> = [];
  if (demandeIds.length > 0) {
    const { data } = await supabase
      .from("demande_messages")
      .select("id, demande_id, author_name, content, created_at")
      .in("demande_id", demandeIds)
      .order("created_at", { ascending: false })
      .limit(10);
    messagesData = data || [];
  }

  // A6 lot 3 : détection de doublons (email/téléphone), fusion toujours
  // proposée à un humain — jamais automatique (voir docs/AUDIT_CRM.md).
  let survivorInfo: { id: string; nom: string; prenom: string | null } | null = null;
  let duplicateCandidates: Client[] = [];
  if (client.merged_into_id) {
    const { data } = await supabase
      .from("clients")
      .select("id, nom, prenom")
      .eq("id", client.merged_into_id)
      .single();
    survivorInfo = data;
  } else {
    const orParts: string[] = [];
    if (client.email) orParts.push(`email.ilike.${client.email}`);
    if (client.telephone) orParts.push(`telephone.eq.${client.telephone}`);
    if (orParts.length > 0) {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .neq("id", client.id)
        .is("merged_into_id", null)
        .or(orParts.join(","));
      duplicateCandidates = (data || []) as Client[];
    }
  }

  const totalFacture = paymentsData.reduce(
    (sum, p) => sum + Number(p.montant_total || 0),
    0
  );
  const totalEncaisse = paymentsData.reduce(
    (sum, p) => sum + Number(p.montant_recu || 0),
    0
  );
  const totalRestant = totalFacture - totalEncaisse;
  const nbDossiers = demandesData.length;
  const nbPaiements = paymentsData.length;

  const Icon = getTypeIcon(client.type);
  const displayName = getDisplayName(client);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/clients"
        label="Retour aux clients"
      />

      {/* HEADER */}
      <div className="mb-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${getTypeColor(client.type)} text-white shadow-lg`}
            >
              <Icon className="h-10 w-10" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-nexus-blue-700">
                  {client.reference}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {getTypeLabel(client.type)}
                </span>
                {!client.actif && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    Inactif
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950">
                {displayName}
              </h1>
              {client.raison_sociale && (
                <p className="mt-1 text-sm text-slate-600">
                  {client.raison_sociale}
                </p>
              )}
              {client.numero_identification && (
                <p className="mt-1 text-xs text-slate-500">
                  N° {client.numero_identification}
                </p>
              )}

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {client.email && (
                  <ContactRow
                    icon={Mail}
                    label="Email"
                    value={client.email}
                    href={`mailto:${client.email}`}
                  />
                )}
                {client.telephone && (
                  <ContactRow
                    icon={Phone}
                    label="Téléphone"
                    value={client.telephone}
                    href={`tel:${client.telephone}`}
                  />
                )}
                {client.telephone_2 && (
                  <ContactRow
                    icon={Phone}
                    label="WhatsApp / 2nd"
                    value={client.telephone_2}
                    href={`tel:${client.telephone_2}`}
                  />
                )}
                {(client.adresse || client.ville) && (
                  <ContactRow
                    icon={MapPin}
                    label="Adresse"
                    value={[client.adresse, client.ville, client.pays]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Client depuis le {formatDate(client.created_at)}
              </p>
            </div>

            <Link
              href="/dashboard/super-admin/clients"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-nexus-blue-200 bg-nexus-blue-50 px-4 py-2 text-sm font-semibold text-nexus-blue-700 hover:bg-nexus-blue-100"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </Link>
          </div>

          {client.notes && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                Notes internes
              </p>
              <p className="whitespace-pre-line text-sm text-amber-900">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {survivorInfo && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            Cette fiche a été fusionnée dans{" "}
            <Link
              href={`/dashboard/super-admin/clients/${survivorInfo.id}`}
              className="underline hover:text-amber-700"
            >
              {[survivorInfo.prenom, survivorInfo.nom].filter(Boolean).join(" ") || survivorInfo.nom}
            </Link>
            . Les données restent visibles ci-dessous à titre d&apos;historique.
          </p>
        </div>
      )}

      {duplicateCandidates.length > 0 && (
        <div className="mb-8">
          <ClientMergeAction survivorId={client.id} candidates={duplicateCandidates} />
        </div>
      )}

      {/* STATS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          icon={FileText}
          label="Dossiers"
          value={nbDossiers.toString()}
          accent="blue"
        />
        <StatBlock
          icon={Wallet}
          label="Paiements"
          value={nbPaiements.toString()}
          accent="orange"
        />
        <StatBlock
          icon={CheckCircle2}
          label="Total encaissé"
          value={formatMoney(totalEncaisse)}
          accent="green"
        />
        <StatBlock
          icon={Clock}
          label="Restant à encaisser"
          value={formatMoney(totalRestant)}
          accent={totalRestant > 0 ? "red" : "green"}
        />
      </div>

      {/* HISTORIQUE PAIEMENTS */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-nexus-orange-600" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Historique des paiements
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {nbPaiements}
            </span>
          </div>
          <Link
            href="/dashboard/super-admin/paiements"
            className="inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
          >
            Voir tous
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {paymentsData.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Aucun paiement enregistré pour ce client.
            </p>
            <Link
              href="/dashboard/super-admin/paiements"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
            >
              Enregistrer un paiement
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paymentsData.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-nexus-blue-700">
                      {payment.reference}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusColor(payment.status)}`}
                    >
                      {getPaymentStatusLabel(payment.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-nexus-blue-950">
                    {payment.service}
                  </p>
                  <p className="text-xs text-slate-500">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {formatDate(payment.date_paiement)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-nexus-blue-950">
                    {formatMoney(
                      Number(payment.montant_recu),
                      payment.devise
                    )}
                  </p>
                  {Number(payment.montant_recu) <
                    Number(payment.montant_total) && (
                    <p className="text-xs text-slate-500">
                      sur{" "}
                      {formatMoney(
                        Number(payment.montant_total),
                        payment.devise
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HISTORIQUE DOSSIERS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nexus-blue-700" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Dossiers & demandes
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {nbDossiers}
            </span>
          </div>
          <Link
            href="/dashboard/super-admin/demandes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-nexus-blue-700 hover:text-nexus-blue-900"
          >
            Voir tous
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {demandesData.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Aucun dossier enregistré pour ce client.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {demandesData.map((demande) => (
              <Link
                key={demande.id}
                href={`/dashboard/super-admin/demandes/${demande.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      {demande.statut}
                    </span>
                    {demande.urgence && demande.urgence !== "normale" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {demande.urgence}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-nexus-blue-950">
                    {demande.objet || demande.service}
                  </p>
                  <p className="text-xs text-slate-500">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {formatDate(demande.created_at)} · {demande.service}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* RENDEZ-VOUS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-nexus-blue-700" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Rendez-vous
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {rdvData.length}
            </span>
          </div>
          <Link
            href="/dashboard/super-admin/rdv"
            className="inline-flex items-center gap-1 text-xs font-semibold text-nexus-blue-700 hover:text-nexus-blue-900"
          >
            Voir tous
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {rdvData.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Aucun rendez-vous enregistré pour ce client.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rdvData.map((rdv) => (
              <div key={rdv.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      {rdv.statut}
                    </span>
                    {rdv.service_type && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {rdv.service_type}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-nexus-blue-950">
                    {rdv.reference || `RDV-${rdv.id.slice(0, 8).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {formatDate(rdv.rdv_date)} · {rdv.rdv_heure}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMMUNICATIONS RECENTES */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-nexus-blue-700" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Communications récentes
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {messagesData.length}
            </span>
          </div>
        </div>

        {messagesData.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Aucun message échangé sur les dossiers de ce client.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messagesData.map((message) => (
              <Link
                key={message.id}
                href={`/dashboard/super-admin/demandes/${message.demande_id}`}
                className="flex items-start gap-3 p-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-nexus-blue-950">
                      {message.author_name}
                    </p>
                    <p className="shrink-0 text-xs text-slate-400">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {message.content}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "blue" | "orange" | "green" | "red";
}) {
  const colorMap = {
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    green: "from-emerald-400 to-emerald-600",
    red: "from-red-500 to-red-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate font-display text-xl font-bold text-nexus-blue-950">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[accent]} text-white shadow-lg`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
