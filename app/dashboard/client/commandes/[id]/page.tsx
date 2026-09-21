import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { COMMANDE_STATUS_LABEL, formatXaf } from "@/lib/boutique";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientCommandeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile([
    "client",
    "agent",
    "admin",
    "super_admin",
    "accueil_caisse",
    "dg",
    "daf",
  ]);
  const supabase = createClient();

  const { data: commande, error } = await supabase
    .from("boutique_commandes")
    .select(
      "id, reference, status, total_xaf, devise, notes_client, devis_id, facture_id, payment_id, created_at, client_id"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("[BOUTIQUE] detail:", error.message);
  }
  if (!commande) notFound();
  if (commande.client_id !== profile.id && !["agent", "admin", "super_admin", "accueil_caisse", "dg", "daf"].includes(profile.role)) {
    notFound();
  }

  const { data: lignes } = await supabase
    .from("boutique_commande_lignes")
    .select("id, titre, slug, prix_unitaire_xaf, quantite, montant_xaf")
    .eq("commande_id", commande.id)
    .order("ordre", { ascending: true });

  const st = COMMANDE_STATUS_LABEL[commande.status] || COMMANDE_STATUS_LABEL.transmise;

  return (
    <DashboardShell profile={profile}>
      <Link
        href="/dashboard/client/commandes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Mes commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-blue-950 text-brand">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-slate-500">{commande.reference}</p>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              Commande
            </h1>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold uppercase",
            st.className
          )}
        >
          {st.label}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {(lignes || []).map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-nexus-blue-950">{l.titre}</p>
                <p className="text-xs text-slate-500">
                  {l.quantite} × {formatXaf(Number(l.prix_unitaire_xaf))}
                </p>
              </div>
              <p className="font-bold text-nexus-blue-950">
                {formatXaf(Number(l.montant_xaf))}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-slate-200 bg-surface-ivory px-4 py-4">
          <span className="text-sm font-semibold text-slate-600">Total</span>
          <span className="font-display text-xl font-bold text-nexus-blue-950">
            {formatXaf(Number(commande.total_xaf), commande.devise)}
          </span>
        </div>
      </div>

      {commande.notes_client && (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Note : {commande.notes_client}
        </p>
      )}

      <p className="mt-4 text-sm text-slate-500">
        Paiement : cette commande n’est pas un encaissement. Un conseiller Nexus la rattache
        ensuite au circuit caisse, devis ou facture existant.
        {commande.devis_id || commande.facture_id || commande.payment_id
          ? " Un document financier est déjà lié."
          : " Aucun devis, facture ou paiement lié pour l’instant."}
      </p>
    </DashboardShell>
  );
}
