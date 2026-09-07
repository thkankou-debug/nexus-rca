import Image from "next/image";
import Link from "next/link";
import { Handshake, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { createClient } from "@/lib/supabase/server";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nos partenaires | Nexus RCA — Bangui",
  description:
    "Les partenaires de Nexus RCA qui contribuent à la structuration de vos projets de mobilité, d'études et d'affaires.",
};

interface PartenaireRow {
  id: string;
  nom: string;
  logo_url: string | null;
  site_url: string | null;
  description: string | null;
  ordre_affichage: number;
}

async function getPartenaires(): Promise<PartenaireRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("partenaires")
      .select("id, nom, logo_url, site_url, description, ordre_affichage")
      .eq("is_verified", true)
      .eq("is_published", true)
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("[PARTENAIRES_PAGE] chargement:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[PARTENAIRES_PAGE] exception:", err);
    return [];
  }
}

export default async function PartenairesPage() {
  const partenaires = await getPartenaires();

  return (
    <>
      <Navbar />
      <main>
        <PublicHero
          eyebrow="Ressources"
          titleStart="Nos "
          accentWord="partenaires"
          subtitle="Les organisations avec lesquelles Nexus RCA collabore pour structurer vos projets."
        />

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            {partenaires.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-nexus-blue-900">
                  <Handshake className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
                  Nos partenariats seront présentés ici prochainement
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Nexus RCA développe activement son réseau de partenaires.
                  Contactez-nous pour en savoir plus sur nos collaborations
                  actuelles.
                </p>
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'aimerais en savoir plus sur vos partenaires."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover"
                >
                  <MessageCircle className="h-4 w-4" />
                  Nous écrire sur WhatsApp
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {partenaires.map((p) => {
                  const cardClass =
                    "flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md";
                  const content = p.logo_url ? (
                    <div className="relative h-12 w-full">
                      <Image
                        src={p.logo_url}
                        alt={p.nom}
                        fill
                        className="object-contain"
                        sizes="200px"
                      />
                    </div>
                  ) : (
                    <span className="font-display text-sm font-bold text-nexus-blue-950">
                      {p.nom}
                    </span>
                  );

                  if (p.site_url) {
                    return (
                      <Link
                        key={p.id}
                        href={p.site_url}
                        target="_blank"
                        rel="noreferrer"
                        className={cardClass}
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <div key={p.id} className={cardClass}>
                      {content}
                    </div>
                  );
                })}
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
