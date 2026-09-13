import Link from "next/link";
import { ArrowLeft, FileText, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mes devis - NEXUS CONNECT",
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
  envoye: { label: "À examiner", color: "bg-blue-100 text-blue-700 border-blue-200" },
  accepte: { label: "Accepté", color: "bg-green-100 text-green-700 border-green-200" },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200" },
  expire: { label: "Expiré", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default async function ClientDevisPage() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  // Le client ne voit que ses propres devis : RLS ("Client can read own
  // devis", migration 069) + jointure explicite ici, défense en profondeur.
  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: devisData } = clientRecord
    ? await supabase
        .from("devis")
        .select("id, reference, status, amount, currency, valid_until, created_at, sent_at")
        .eq("client_record_id", clientRecord.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const devisList = devisData || [];
  // Un devis en brouillon n'a pas encore été transmis au client — on ne
  // l'affiche pas ici (même s'il passait par erreur la RLS un jour).
  const visibles = devisList.filter((d) => d.status !== "brouillon");

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
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes devis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Consultez et acceptez les devis proposés par votre conseiller.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {visibles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mt-4 font-semibold text-nexus-blue-950">
              Aucun devis pour le moment
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Vos devis apparaîtront ici dès qu&apos;un conseiller vous en aura transmis un.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibles.map((d) => {
              const statusInfo = STATUS_LABELS[d.status] || STATUS_LABELS.brouillon;
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/client/devis/${d.id}`}
                  className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50 sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-nexus-blue-950">{d.reference}</h3>
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
                      Transmis le {formatDate(d.sent_at || d.created_at)}
                      {d.valid_until && ` · Valable jusqu'au ${formatDate(d.valid_until)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="font-display text-lg font-bold text-nexus-blue-950">
                      {formatMoney(Number(d.amount), d.currency)}
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
