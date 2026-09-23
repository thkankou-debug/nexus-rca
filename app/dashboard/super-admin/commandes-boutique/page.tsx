import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { COMMANDE_STATUS_LABEL, formatXaf } from "@/lib/boutique";
import { cn } from "@/lib/utils";

export const metadata = { title: "Commandes boutique — Nexus RCA" };
export const dynamic = "force-dynamic";

export default async function StaffCommandesBoutiquePage() {
  await requireProfile([
    "admin",
    "super_admin",
    "agent",
    "accueil_caisse",
    "dg",
    "daf",
  ]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boutique_commandes")
    .select("id, reference, status, total_xaf, devise, created_at, client_id, is_test")
    .eq("is_test", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[BOUTIQUE] staff list:", error.message);
  }
  const commandes = data || [];

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-blue-950 text-brand">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Commandes boutique
          </h1>
          <p className="text-sm text-slate-500">
            Demandes transmises par les clients. Hors chiffre d’affaires tant qu’un encaissement
            réel n’est pas saisi dans la caisse, un devis ou une facture.
          </p>
        </div>
      </div>

      {commandes.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Aucune commande transmise"
          description="Les commandes du catalogue public apparaîtront ici."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => {
                const st = COMMANDE_STATUS_LABEL[c.status] || COMMANDE_STATUS_LABEL.transmise;
                return (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono font-bold text-nexus-blue-950">
                      <Link
                        href={`/dashboard/client/commandes/${c.id}`}
                        className="hover:underline"
                      >
                        {c.reference}
                      </Link>
                      {c.is_test ? (
                        <span className="ml-2 text-[10px] uppercase text-slate-400">test</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(c.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                          st.className
                        )}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatXaf(Number(c.total_xaf), c.devise)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
