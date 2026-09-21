import Link from "next/link";
import { ArrowLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { COMMANDE_STATUS_LABEL, formatXaf } from "@/lib/boutique";
import { cn } from "@/lib/utils";

export const metadata = { title: "Mes commandes - NEXUS CONNECT" };
export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ClientCommandesPage() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boutique_commandes")
    .select("id, reference, status, total_xaf, devise, created_at")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[BOUTIQUE] client list:", error.message);
  }
  const commandes = data || [];

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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-blue-950 text-brand">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes commandes
          </h1>
          <p className="text-sm text-slate-500">
            Commandes boutique transmises à Nexus. Non payées tant qu’un encaissement n’est pas
            enregistré.
          </p>
        </div>
      </div>

      {commandes.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          tone="brand"
          title="Aucune commande"
          description="Le catalogue public affiche les offres publiées par l’agence."
          action={
            <Button href="/boutique" size="sm">
              Ouvrir la boutique
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {commandes.map((c) => {
            const st = COMMANDE_STATUS_LABEL[c.status] || COMMANDE_STATUS_LABEL.transmise;
            return (
              <Link
                key={c.id}
                href={`/dashboard/client/commandes/${c.id}`}
                className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold text-nexus-blue-950">
                    {c.reference}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(c.created_at)}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase",
                    st.className
                  )}
                >
                  {st.label}
                </span>
                <p className="text-sm font-bold text-nexus-blue-950">
                  {formatXaf(Number(c.total_xaf), c.devise)}
                </p>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
