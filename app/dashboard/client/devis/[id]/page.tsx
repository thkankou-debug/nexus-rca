import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { DevisAcceptButton } from "@/components/demande-detail/DevisAcceptButton";
import { cn } from "@/lib/utils";

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

export default async function ClientDevisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  // RLS ("Client can read own devis"/"...devis_lignes", migration 069)
  // restreint déjà un rôle client à son propre devis. Un devis en
  // "brouillon" (jamais transmis) reste invisible même pour son titulaire.
  const { data: devis, error } = await supabase
    .from("devis")
    .select(
      "id, reference, status, amount, currency, valid_until, sent_at, accepted_at, created_at, devis_lignes(id, description, quantity, unit_price, amount, ordre)"
    )
    .eq("id", params.id)
    .neq("status", "brouillon")
    .single();

  if (error || !devis) {
    notFound();
  }

  const d = devis as unknown as {
    id: string;
    reference: string;
    status: string;
    amount: number;
    currency: string;
    valid_until: string | null;
    sent_at: string | null;
    accepted_at: string | null;
    created_at: string;
    devis_lignes: { id: string; description: string; quantity: number; unit_price: number; amount: number; ordre: number }[];
  };

  const statusInfo = STATUS_LABELS[d.status] || STATUS_LABELS.brouillon;
  const lignes = [...d.devis_lignes].sort((a, b) => a.ordre - b.ordre);
  const canAccept = profile.role === "client" && d.status === "envoye";

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/client/devis" label="Retour à mes devis" />

      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-400">
              <FileText className="h-3 w-3" />
              Devis
            </div>
            <h1 className="mt-3 font-mono text-2xl font-bold text-white sm:text-3xl">
              {d.reference}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Transmis le {formatDate(d.sent_at || d.created_at)}
              {d.valid_until && ` · Valable jusqu'au ${formatDate(d.valid_until)}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase",
                statusInfo.color
              )}
            >
              {statusInfo.label}
            </span>
            <a
              href={`/api/devis/${d.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </a>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <h2 className="font-display text-base font-bold text-nexus-blue-950">
                Prestations
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {lignes.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-nexus-blue-950">{l.description}</p>
                    <p className="text-xs text-slate-500">
                      {l.quantity} × {formatMoney(l.unit_price, d.currency)}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-sm font-bold text-nexus-blue-950">
                    {formatMoney(l.amount, d.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Montant total
              </p>
              <p className="font-display text-xl font-bold text-nexus-blue-950">
                {formatMoney(d.amount, d.currency)}
              </p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            {canAccept && <DevisAcceptButton devisId={d.id} />}
            {d.status === "accepte" && d.accepted_at && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Devis accepté le {formatDate(d.accepted_at)}.
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
