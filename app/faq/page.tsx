import { HelpCircle, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { createClient } from "@/lib/supabase/server";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ | Nexus RCA — Bangui",
  description:
    "Réponses aux questions fréquentes sur les services Nexus RCA : visa, études, financement, digitalisation et démarches administratives.",
};

interface FaqRow {
  id: string;
  question: string;
  reponse: string;
  categorie: string | null;
  ordre_affichage: number;
}

async function getFaqs(): Promise<FaqRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("faq")
      .select("id, question, reponse, categorie, ordre_affichage")
      .eq("status", "actif")
      .order("categorie", { ascending: true, nullsFirst: false })
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("[FAQ_PAGE] chargement:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[FAQ_PAGE] exception:", err);
    return [];
  }
}

function groupByCategorie(faqs: FaqRow[]): Map<string, FaqRow[]> {
  const groups = new Map<string, FaqRow[]>();
  for (const faq of faqs) {
    const key = faq.categorie?.trim() || "Général";
    const list = groups.get(key) || [];
    list.push(faq);
    groups.set(key, list);
  }
  return groups;
}

export default async function FaqPage() {
  const faqs = await getFaqs();
  const groups = groupByCategorie(faqs);

  return (
    <>
      <Navbar />
      <main>
        <PublicHero
          eyebrow="Ressources"
          titleStart="Questions "
          accentWord="fréquentes"
          subtitle="Les réponses aux questions les plus posées par nos clients avant de démarrer un dossier."
        />

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 lg:px-8">
            {faqs.length === 0 ? (
              <EmptyResource
                title="La FAQ est en cours de publication"
                description="Nos équipes préparent les réponses aux questions les plus fréquentes. En attendant, contactez-nous directement — nous répondons sous 24 h."
              />
            ) : (
              <div className="space-y-10">
                {Array.from(groups.entries()).map(([categorie, items]) => (
                  <div key={categorie}>
                    <h2 className="font-display text-xl font-bold text-nexus-blue-950">
                      {categorie}
                    </h2>
                    <div className="mt-4 space-y-3">
                      {items.map((faq) => (
                        <details
                          key={faq.id}
                          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md"
                        >
                          <summary className="cursor-pointer list-none font-semibold text-nexus-blue-950 marker:content-none">
                            {faq.question}
                          </summary>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            {faq.reponse}
                          </p>
                        </details>
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

function EmptyResource({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-nexus-blue-900">
        <HelpCircle className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {description}
      </p>
      <a
        href={whatsappLink("Bonjour Nexus, j'ai une question.")}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover"
      >
        <MessageCircle className="h-4 w-4" />
        Nous écrire sur WhatsApp
      </a>
    </div>
  );
}
