import Link from "next/link";
import {
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mes paiements - NEXUS CONNECT",
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
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
  const lower = (statut || "").toLowerCase();
  if (lower === "paye" || lower === "payé" || lower === "complete") {
    return {
      label: "Payé",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    };
  }
  if (lower === "partiel") {
    return {
      label: "Partiel",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: Clock,
    };
  }
  if (lower === "en_attente" || lower === "attente") {
    return {
      label: "En attente",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
    };
  }
  if (lower === "annule" || lower === "annulé") {
    return {
      label: "Annulé",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
    };
  }
  return {
    label: statut || "—",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: AlertCircle,
  };
}

export default async function ClientPaiementsPage() {
  const profile = await requireProfile([
    "client",
    "agent",
    "admin",
    "super_admin",
  ]);
  const supabase = createClient();

  const userEmail = (profile.email || "").toLowerCase().trim();

  const { data: paiementsData } = await supabase
    .from("payments")
    .select("*")
    .eq("client_email", userEmail)
    .order("date_paiement", { ascending: false });

  const paiements = paiementsData || [];

  // Calculs globaux
  const totalDu = paiements.reduce((s, p) => s + Number(p.montant_total || 0), 0);
  const totalPaye = paiements.reduce((s, p) => s + Number(p.montant_recu || 0), 0);
  const totalRestant = Math.max(0, totalDu - totalPaye);

  // Groupement par devise
  const byDevise = paiements.reduce<
    Record<string, { du: number; paye: number; restant: number; count: number }>
  >((acc, p) => {
    const dev = p.devise || "XAF";
    if (!acc[dev]) acc[dev] = { du: 0, paye: 0, restant: 0, count: 0 };
    acc[dev].du += Number(p.montant_total || 0);
    acc[dev].paye += Number(p.montant_recu || 0);
    acc[dev].restant += Math.max(
      0,
      Number(p.montant_total || 0) - Number(p.montant_recu || 0)
    );
    acc[dev].count += 1;
    return acc;
  }, {});

  const partiels = paiements.filter((p) => p.statut === "partiel");

  return (
    <DashboardShell profile={profile}>
      {/* Bouton retour */}
      <Link
        href="/dashboard/client"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes paiements
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Historique complet de vos paiements et reçus.
          </p>
        </div>
      </div>

      {/* RÉSUMÉ FINANCIER */}
      {paiements.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Total dû</p>
            <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
              {formatMoney(totalDu)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {paiements.length} paiement{paiements.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-xs font-medium text-green-700">Total payé</p>
            <p className="mt-1 font-display text-2xl font-bold text-green-700">
              {formatMoney(totalPaye)}
            </p>
            <p className="mt-0.5 text-xs text-green-600">Reçus disponibles</p>
          </div>
          <div
            className={cn(
              "rounded-2xl border p-5 shadow-sm",
              totalRestant > 0
                ? "border-nexus-orange-200 bg-nexus-orange-50"
                : "border-slate-200 bg-white"
            )}
          >
            <p
              className={cn(
                "text-xs font-medium",
                totalRestant > 0 ? "text-nexus-orange-700" : "text-slate-500"
              )}
            >
              Reste à régler
            </p>
            <p
              className={cn(
                "mt-1 font-display text-2xl font-bold",
                totalRestant > 0 ? "text-nexus-orange-700" : "text-slate-700"
              )}
            >
              {formatMoney(totalRestant)}
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs",
                totalRestant > 0 ? "text-nexus-orange-600" : "text-slate-500"
              )}
            >
              {partiels.length > 0
                ? `${partiels.length} paiement${partiels.length > 1 ? "s" : ""} partiel${partiels.length > 1 ? "s" : ""}`
                : "Tous vos paiements sont à jour"}
            </p>
          </div>
        </div>
      )}

      {/* RÉPARTITION PAR DEVISE (si plusieurs) */}
      {Object.keys(byDevise).length > 1 && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-nexus-orange-600" />
            <h2 className="font-display text-base font-bold text-nexus-blue-950">
              Répartition par devise
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(byDevise).map(([devise, stats]) => (
              <div
                key={devise}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {devise} · {stats.count} paiement{stats.count > 1 ? "s" : ""}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-slate-500">Dû</p>
                    <p className="text-sm font-bold text-slate-700">
                      {formatMoney(stats.du, devise)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600">Payé</p>
                    <p className="text-sm font-bold text-green-700">
                      {formatMoney(stats.paye, devise)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-nexus-orange-600">Restant</p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        stats.restant > 0
                          ? "text-nexus-orange-700"
                          : "text-green-700"
                      )}
                    >
                      {formatMoney(stats.restant, devise)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTE DES PAIEMENTS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-display text-base font-bold text-nexus-blue-950">
            Historique complet ({paiements.length})
          </h2>
        </div>

        {paiements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Wallet className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mt-4 font-semibold text-nexus-blue-950">
              Aucun paiement enregistré
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Vos paiements apparaîtront ici dès qu'ils seront enregistrés par
              votre agent.
            </p>
            <Link
              href="/dashboard/client/demandes"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-blue-900"
            >
              Voir mes dossiers
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paiements.map((p) => {
              const status = getStatusInfo(p.statut || "");
              const StatusIcon = status.icon;
              const restant =
                Number(p.montant_total || 0) - Number(p.montant_recu || 0);

              return (
                <div key={p.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-nexus-blue-950">
                          {p.service || "Paiement"}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                            status.color
                          )}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Référence : <span className="font-mono">{p.reference}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(p.date_paiement)}
                        {p.mode_paiement && ` · ${p.mode_paiement}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-nexus-blue-950">
                        {formatMoney(Number(p.montant_recu || 0), p.devise || "XAF")}
                      </p>
                      {Number(p.montant_total) > Number(p.montant_recu) && (
                        <p className="text-xs text-slate-500">
                          sur {formatMoney(Number(p.montant_total), p.devise || "XAF")}
                        </p>
                      )}
                      {restant > 0 && (
                        <p className="mt-1 inline-block rounded-full bg-nexus-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-orange-700">
                          Reste : {formatMoney(restant, p.devise || "XAF")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
