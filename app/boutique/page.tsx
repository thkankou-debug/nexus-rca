import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ProductCard } from "@/components/boutique/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { BOUTIQUE_SELECT, mapOffre, type BoutiqueOffre } from "@/lib/boutique";
import { ShoppingBag } from "lucide-react";
import type { CSSProperties } from "react";

export const metadata = {
  title: "Boutique | Nexus RCA — Bangui",
  description:
    "Catalogue Nexus RCA : prestations à tarif fixe, demandes de devis et prises de contact. Commande transmise à l’agence, sans paiement en ligne.",
};

export const dynamic = "force-dynamic";

const DOT_GRID_DARK: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export default async function BoutiquePage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select(BOUTIQUE_SELECT)
    .eq("status", "actif")
    .eq("visibilite_publique", true)
    .order("ordre_affichage", { ascending: true });

  if (error) {
    console.error("[BOUTIQUE] list error:", error.message);
  }

  const offres: BoutiqueOffre[] = (data || []).map((row) =>
    mapOffre(row as Parameters<typeof mapOffre>[0])
  );

  const categories = Array.from(new Set(offres.map((o) => o.categorie)));

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pb-16 pt-28 text-white sm:pb-20 sm:pt-32 lg:pt-40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[36rem] w-[36rem] rounded-full bg-brand/15 blur-[120px]"
          />
          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-brand backdrop-blur-md">
              Boutique Nexus
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Prestations{" "}
              <span className="bg-brand bg-clip-text text-transparent">Nexus</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Offres publiées par l’agence. Le panier transmet une commande à Nexus — aucun
              paiement en ligne à cette étape.
            </p>
          </div>
        </section>

        <section className="bg-surface-ivory py-14">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            {offres.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                tone="brand"
                title="Aucune offre publiée pour le moment"
                description="Dès qu’une prestation est rendue publique dans Services et tarifs, elle apparaît ici."
              />
            ) : (
              <div className="space-y-12">
                {categories.map((cat) => (
                  <div key={cat}>
                    <h2 className="mb-5 font-display text-2xl font-bold text-nexus-blue-950">
                      {cat}
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {offres
                        .filter((o) => o.categorie === cat)
                        .map((o) => (
                          <ProductCard key={o.id} offre={o} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
