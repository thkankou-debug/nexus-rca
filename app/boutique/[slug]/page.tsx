import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AddToCartButton } from "@/components/boutique/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import {
  BOUTIQUE_SELECT,
  formatXaf,
  KIND_LABEL,
  mapOffre,
} from "@/lib/boutique";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `${params.slug} | Boutique Nexus RCA` };
}

export default async function BoutiqueFichePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select(BOUTIQUE_SELECT)
    .eq("slug", params.slug)
    .eq("status", "actif")
    .eq("visibilite_publique", true)
    .maybeSingle();

  if (error) {
    console.error("[BOUTIQUE] fiche error:", error.message);
  }
  if (!data) notFound();

  const offre = mapOffre(data as Parameters<typeof mapOffre>[0]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-ivory">
        <section className="bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pb-12 pt-28 text-white sm:pt-32">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Catalogue
            </Link>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              {offre.categorie} · {KIND_LABEL[offre.kind]}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
              {offre.nom}
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {offre.description ? (
              <p className="text-base leading-relaxed text-slate-700">{offre.description}</p>
            ) : (
              <p className="text-slate-500">Le détail de cette offre sera précisé par l’agence.</p>
            )}
            {offre.delai_indicatif && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-brand" />
                Délai indicatif : {offre.delai_indicatif}
              </p>
            )}

            <div className="mt-8 border-t border-slate-100 pt-6">
              {offre.kind === "achetable" && offre.tarif_montant != null ? (
                <>
                  <p className="font-display text-3xl font-bold text-nexus-blue-950">
                    {formatXaf(offre.tarif_montant, offre.devise)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Prix vérifié à la transmission. Aucun encaissement en ligne.
                  </p>
                  <div className="mt-5">
                    <AddToCartButton slug={offre.slug} nom={offre.nom} size="lg" />
                  </div>
                </>
              ) : offre.kind === "devis" ? (
                <>
                  <p className="font-semibold text-nexus-blue-950">Tarif sur devis</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Cette offre n’entre pas dans le panier. Déposez une demande : l’agence établit
                    un devis dans le circuit existant.
                  </p>
                  <div className="mt-5">
                    <Button href={`/demande/complet?service=${encodeURIComponent(offre.slug)}`}>
                      Demander un devis
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-nexus-blue-950">Prise de contact</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Écrivez-nous : un conseiller Nexus vous répond.
                  </p>
                  <div className="mt-5">
                    <Button href="/contact">Nous contacter</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
