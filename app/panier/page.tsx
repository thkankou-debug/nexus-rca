import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { CartView } from "@/components/boutique/CartView";
import { createClient } from "@/lib/supabase/server";
import { BOUTIQUE_SELECT, mapOffre, type BoutiqueOffre } from "@/lib/boutique";

export const metadata = {
  title: "Panier | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function PanierPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("services")
    .select(BOUTIQUE_SELECT)
    .eq("status", "actif")
    .eq("visibilite_publique", true);

  const offres: BoutiqueOffre[] = (data || []).map((row) =>
    mapOffre(row as Parameters<typeof mapOffre>[0])
  );

  return (
    <>
      <Navbar />
      <main className="bg-surface-ivory">
        <section className="bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pb-10 pt-28 text-white sm:pt-32">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Boutique
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Panier</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300">
              Les prix seront revérifiés à la transmission. La commande reste non payée.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <CartView offres={offres} isAuthenticated={Boolean(user)} />
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
