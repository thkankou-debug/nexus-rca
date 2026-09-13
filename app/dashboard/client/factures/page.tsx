import Link from "next/link";
import { ArrowLeft, Receipt, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mes factures - NEXUS CONNECT",
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "En préparation", color: "bg-slate-100 text-slate-600 border-slate-200" },
  validee: { label: "À régler", color: "bg-blue-100 text-blue-700 border-blue-200" },
  payee: { label: "Payée", color: "bg-green-100 text-green-700 border-green-200" },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-700 border-red-200" },
};

export default async function ClientFacturesPage() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: facturesData } = clientRecord
    ? await supabase
        .from("factures")
        .select("id, reference, status, amount, currency, due_date, created_at")
        .eq("client_record_id", clientRecord.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const factures = (facturesData || []).filter((f) => f.status !== "brouillon");

  return (
    <DashboardShell profile={profile}>
      <Link
        href="/dashboard/client"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Receipt className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes factures
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Consultez et téléchargez vos factures.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {factures.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mt-4 font-semibold text-nexus-blue-950">
              Aucune facture pour le moment
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Vos factures apparaîtront ici dès qu&apos;elles seront émises.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {factures.map((f) => {
              const statusInfo = STATUS_LABELS[f.status] || STATUS_LABELS.brouillon;
              return (
                <Link
                  key={f.id}
                  href={`/dashboard/client/factures/${f.id}`}
                  className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50 sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-nexus-blue-950">{f.reference}</h3>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Émise le {formatDate(f.created_at)}
                      {f.due_date && ` · Échéance ${formatDate(f.due_date)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="font-display text-lg font-bold text-nexus-blue-950">
                      {formatMoney(Number(f.amount), f.currency)}
                    </p>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
