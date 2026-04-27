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
  AlertCircle,
  Info,
  Edit3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  type Client,
  type ClientType,
  CLIENT_TYPE_LABELS,
} from "@/components/dashboard/ClientForm";
import type { Payment, PaymentStatus } from "@/components/dashboard/PaymentForm";
import type { Demande } from "@/types";

const TYPE_ICONS: Record<ClientType, typeof User> = {
  particulier: User,
  entreprise: Building2,
  institution: Landmark,
};

const TYPE_COLORS: Record<ClientType, string> = {
  particulier: "from-blue-500 to-indigo-700",
  entreprise: "from-purple-500 to-purple-700",
  institution: "from-emerald-500 to-emerald-700",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  non_paye: "Non payé",
  partiel: "Partiel",
  paye: "Payé",
  rembourse: "Remboursé",
  annule: "Annulé",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  non_paye: "bg-red-100 text-red-700",
  partiel: "bg-amber-100 text-amber-700",
  paye: "bg-green-100 text-green-700",
  rembourse: "bg-slate-100 text-slate-700",
  annule: "bg-slate-100 text-slate-500",
};

function formatMoney(amount: number, currency = "XAF"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
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

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // 1. Récupérer le client
  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!clientData) notFound();
  const client = clientData as Client;

  // 2. Récupérer les paiements liés (par email ou téléphone)
  // En attendant la SESSION 5 (liaison directe), on matche par email/téléphone
  let paymentsData: Payment[] = [];
  const orFilters: string[] = [];
  if (client.email) orFilters.push(`client_email.eq.${client.email}`);
  if (client.telephone) orFilters.push(`client_telephone.eq.${client.telephone}`);

  if (orFilters.length > 0) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .or(orFilters.join(","))
      .order("created_at", { ascending: false });
    paymentsData = (data || []) as Payment[];
  }

  // 3. Récupérer les demandes liées (par email)
  let demandesData: Demande[] = [];
  if (client.email) {
    const { data } = await supabase
      .from("demandes")
      .select("*")
      .eq("email", client.email)
      .order("created_at", { ascending: false });
    demandesData = (data || []) as Demande[];
  }

  // 4. Calculer les stats
  const totalFacture = paymentsData.reduce(
    (sum, p) => sum + Number(p.montant_total),
    0
  );
  const totalEncaisse = paymentsData.reduce(
    (sum, p) => sum + Number(p.montant_recu),
    0
  );
  const totalRestant = totalFacture - totalEncaisse;
  const nbDossiers = demandesData.length;
  const nbPaiements = paymentsData.length;

  const Icon = TYPE_ICONS[client.type];
  const displayName = getDisplayName(client);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/clients"
        label="Retour aux clients"
      />

      {/* ============================================================ */}
      {/* HEADER FICHE CLIENT */}
      {/* ============================================================ */}
      <div className="mb-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${TYPE_COLORS[client.type]} text-white shadow-lg`}
            >
              <Icon className="h-10 w-10" />
            </div>

            {/* Identité */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-nexus-blue-700">
                  {client.reference}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {CLIENT_TYPE_LABELS[client.type]}
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

              {/* Coordonnées */}
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

            {/* Bouton retour à la liste pour modifier */}
            <Link
              href="/dashboard/super-admin/clients"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-nexus-blue-200 bg-nexus-blue-50 px-4 py-2 text-sm font-semibold text-nexus-blue-700 hover:bg-nexus-blue-100"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </Link>
          </div>

          {/* Notes internes */}
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

      {/* ============================================================ */}
      {/* INFO LIAISON (en attendant la SESSION 5) */}
      {/* ============================================================ */}
      {(client.email || client.telephone) && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <strong>Liaison automatique :</strong> les paiements et dossiers
            ci-dessous sont identifiés en cherchant l'email ou le téléphone du
            client dans les enregistrements existants. Une liaison directe par
            ID arrivera dans la prochaine mise à jour.
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STATS RAPIDES */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* HISTORIQUE PAIEMENTS */}
      {/* ============================================================ */}
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
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PAYMENT_STATUS_COLORS[payment.statut]}`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.statut]}
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

      {/* ============================================================ */}
      {/* HISTORIQUE DOSSIERS / DEMANDES */}
      {/* ============================================================ */}
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
