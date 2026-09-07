import { Globe2, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { createClient } from "@/lib/supabase/server";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pays & destinations | Nexus RCA — Bangui",
  description:
    "Les pays et destinations couverts par l'accompagnement Nexus RCA pour vos projets de mobilité, d'études et d'affaires.",
};

interface PaysRow {
  id: string;
  nom: string;
  code_iso: string | null;
  continent: string | null;
  ordre_affichage: number;
}

async function getPaysDestinations(): Promise<PaysRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pays_destinations")
      .select("id, nom, code_iso, continent, ordre_affichage")
      .eq("status", "actif")
      .order("continent", { ascending: true, nullsFirst: false })
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("[PAYS_DESTINATIONS_PAGE] chargement:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[PAYS_DESTINATIONS_PAGE] exception:", err);
    return [];
  }
}

function groupByContinent(pays: PaysRow[]): Map<string, PaysRow[]> {
  const groups = new Map<string, PaysRow[]>();
  for (const p of pays) {
    const key = p.continent?.trim() || "Autres";
    const list = groups.get(key) || [];
    list.push(p);
    groups.set(key, list);
  }
  return groups;
}

export default async function PaysDestinationsPage() {
  const pays = await getPaysDestinations();
  const groups = groupByContinent(pays);

  return (
    <>
      <Navbar />
      <main>
        <PublicHero
          eyebrow="Ressources"
          titleStart="Pays & "
          accentWord="destinations"
          subtitle="Les destinations pour lesquelles Nexus RCA accompagne vos démarches de mobilité, d'études ou d'affaires."
        />

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            {pays.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-nexus-blue-900">
                  <Globe2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
                  La liste des destinations est en cours de publication
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Nexus RCA accompagne déjà des dossiers vers de nombreux
                  pays. Contactez-nous pour vérifier la faisabilité de votre
                  projet, quelle que soit la destination visée.
                </p>
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'aimerais des informations sur une destination."
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
              <div className="space-y-10">
                {Array.from(groups.entries()).map(([continent, items]) => (
                  <div key={continent}>
                    <h2 className="font-display text-xl font-bold text-nexus-blue-950">
                      {continent}
                    </h2>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-nexus-blue-950 shadow-sm"
                        >
                          {p.nom}
                          {p.code_iso && (
                            <span className="ml-1.5 text-xs font-medium text-slate-400">
                              {p.code_iso}
                            </span>
                          )}
                        </div>
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
