import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PaymentVerifyActions } from "@/components/payment/PaymentVerifyActions";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Paiements en attente - Nexus",
};

export const dynamic = "force-dynamic";

const METHOD_LABELS: Record<string, string> = {
  orange_money: "Orange Money",
  mtn_money: "MTN Money",
  express_union: "Express Union",
  virement: "Virement",
  especes: "Espèces",
  stripe_card: "Carte bancaire",
};

const METHOD_COLORS: Record<string, string> = {
  orange_money: "bg-orange-100 text-orange-700 border-orange-200",
  mtn_money: "bg-yellow-100 text-yellow-700 border-yellow-200",
  express_union: "bg-red-100 text-red-700 border-red-200",
  virement: "bg-blue-100 text-blue-700 border-blue-200",
  especes: "bg-green-100 text-green-700 border-green-200",
  stripe_card: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return dateStr;
  }
}

function getStatusInfo(statut: string) {
  switch (statut) {
    case "en_attente":
      return { label: "Lien envoyé", color: "bg-slate-100 text-slate-700 border-slate-200" };
    case "en_cours":
      return { label: "Client en cours", color: "bg-blue-100 text-blue-700 border-blue-200" };
    case "paiement_declare":
      return { label: "À vérifier", color: "bg-amber-100 text-amber-700 border-amber-200" };
    case "verifie":
      return { label: "Vérifié", color: "bg-green-100 text-green-700 border-green-200" };
    case "expire":
      return { label: "Expiré", color: "bg-slate-100 text-slate-700 border-slate-200" };
    case "annule":
      return { label: "Annulé", color: "bg-red-100 text-red-700 border-red-200" };
    default:
      return { label: statut, color: "bg-slate-100 text-slate-700 border-slate-200" };
  }
}

export default async function PaiementsEnAttentePage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  // Tous les liens de paiement, ordonnés par récence
  const { data: paymentLinks } = await supabase
    .from("payment_links")
    .select("*")
    .order("created_at", { ascending: false });

  const all = paymentLinks || [];
  const aVerifier = all.filter((p) => p.statut === "paiement_declare");
  const enAttenteClient = all.filter((p) => p.statut === "en_attente" || p.statut === "en_cours");
  const verifies = all.filter((p) => p.statut === "verifie");
  const annules = all.filter((p) => p.statut === "annule" || p.statut === "expire");

  const totalVerifie = verifies.reduce((sum, p) => {
    if (p.devise === "XAF") return sum + p.montant;
    return sum;
  }, 0);

  return (
    <DashboardShell profile={profile}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              Paiements en attente
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Vérifiez les paiements déclarés par les clients.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/super-admin/paiements/nouveau-lien"
          className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600"
        >
          <Wallet className="h-4 w-4" />
          Générer un nouveau lien
        </Link>
      </div>

      {/* STATS */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={AlertCircle}
          label="À vérifier maintenant"
          value={aVerifier.length.toString()}
          accent="amber"
          urgent={aVerifier.length > 0}
        />
        <StatCard
          icon={Clock}
          label="En attente client"
          value={enAttenteClient.length.toString()}
          accent="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Vérifiés"
          value={verifies.length.toString()}
          accent="green"
        />
        <StatCard
          icon={Wallet}
          label="Total reçu (XAF)"
          value={formatMoney(totalVerifie, "XAF")}
          accent="orange"
          isMoney
        />
      </div>

      {/* SECTION : À VÉRIFIER (priorité) */}
      {aVerifier.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-amber-700">
            <AlertCircle className="h-5 w-5" />
            À vérifier maintenant ({aVerifier.length})
          </h2>
          <div className="space-y-3">
            {aVerifier.map((p) => (
              <PaymentRow key={p.id} payment={p} canVerify />
            ))}
          </div>
        </div>
      )}

      {/* EN ATTENTE CLIENT */}
      {enAttenteClient.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-bold text-nexus-blue-950">
            Liens envoyés en attente ({enAttenteClient.length})
          </h2>
          <div className="space-y-3">
            {enAttenteClient.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </div>
        </div>
      )}

      {/* HISTORIQUE VÉRIFIÉS */}
      {verifies.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-700">
            Vérifiés récents ({verifies.length})
          </h2>
          <div className="space-y-3">
            {verifies.slice(0, 10).map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </div>
        </div>
      )}

      {/* HISTORIQUE ANNULÉS */}
      {annules.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-slate-500">
            Annulés / Expirés ({annules.length})
          </h2>
          <div className="space-y-3">
            {annules.slice(0, 5).map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {all.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">
            Aucun lien de paiement créé pour le moment.
          </p>
          <Link
            href="/dashboard/super-admin/paiements/nouveau-lien"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600"
          >
            <Wallet className="h-4 w-4" />
            Créer le premier lien
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}

// ============================================================================
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  isMoney = false,
  urgent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "blue" | "amber" | "green" | "orange";
  isMoney?: boolean;
  urgent?: boolean;
}) {
  const colorMap = {
    blue: "from-nexus-blue-700 to-nexus-blue-900",
    amber: "from-amber-500 to-amber-700",
    green: "from-green-500 to-green-700",
    orange: "from-nexus-orange-500 to-nexus-orange-700",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm",
        urgent ? "border-amber-300 ring-2 ring-amber-200" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p
            className={cn(
              "mt-1 font-display font-bold text-nexus-blue-950",
              isMoney ? "text-xl" : "text-2xl"
            )}
          >
            {value}
          </p>
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

function PaymentRow({
  payment,
  canVerify = false,
}: {
  payment: {
    id: string;
    reference: string;
    client_nom: string;
    client_email: string;
    client_telephone: string | null;
    service: string;
    description: string | null;
    montant: number;
    devise: string;
    statut: string;
    methode_choisie: string | null;
    numero_transaction: string | null;
    notes_client: string | null;
    notes_staff: string | null;
    created_at: string;
    paid_declared_at: string | null;
    verified_at: string | null;
  };
  canVerify?: boolean;
}) {
  const status = getStatusInfo(payment.statut);
  const methodLabel = payment.methode_choisie
    ? METHOD_LABELS[payment.methode_choisie] || payment.methode_choisie
    : null;
  const methodColor = payment.methode_choisie
    ? METHOD_COLORS[payment.methode_choisie] || "bg-slate-100 text-slate-700"
    : "";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
        canVerify ? "border-amber-200" : "border-slate-200"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-nexus-blue-950">
              {formatMoney(payment.montant, payment.devise)}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                status.color
              )}
            >
              {status.label}
            </span>
            {methodLabel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                  methodColor
                )}
              >
                {methodLabel}
              </span>
            )}
            <span className="font-mono text-[10px] text-slate-400">
              {payment.reference}
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-nexus-blue-950">
            {payment.service}
          </p>
          {payment.description && (
            <p className="text-xs text-slate-600">{payment.description}</p>
          )}

          <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            <p className="text-slate-700">
              <strong>{payment.client_nom}</strong>
            </p>
            <p className="text-slate-600">{payment.client_email}</p>
          </div>

          {payment.client_telephone && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <a
                href={`tel:${payment.client_telephone.replace(/\s+/g, "").replace(/\+/g, "")}`}
                className="hover:text-nexus-blue-950"
              >
                {payment.client_telephone}
              </a>
            </p>
          )}

          {payment.numero_transaction && (
            <div className="mt-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                ⚠️ N° transaction à vérifier
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-amber-900">
                {payment.numero_transaction}
              </p>
            </div>
          )}

          {payment.notes_client && (
            <div className="mt-2 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Note client
              </p>
              <p className="mt-1 text-sm text-slate-700">{payment.notes_client}</p>
            </div>
          )}

          {payment.notes_staff && (
            <div className="mt-2 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Notes internes
              </p>
              <p className="mt-1 text-sm text-blue-900 whitespace-pre-line">{payment.notes_staff}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Créé : {formatDateTime(payment.created_at)}</span>
            {payment.paid_declared_at && (
              <span>Déclaré : {formatDateTime(payment.paid_declared_at)}</span>
            )}
            {payment.verified_at && (
              <span>Vérifié : {formatDateTime(payment.verified_at)}</span>
            )}
          </div>
        </div>

        <PaymentVerifyActions
          reference={payment.reference}
          statut={payment.statut}
        />
      </div>
    </div>
  );
}
