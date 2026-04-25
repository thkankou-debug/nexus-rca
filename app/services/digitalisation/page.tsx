import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import {
  Eye,
  TrendingUp,
  ShieldCheck,
  Workflow,
  Globe,
  LayoutGrid,
  Zap,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Digital et developpement d activite | Nexus RCA",
  description:
    "Digitalisation, visibilite en ligne et structuration de votre activite. Sites web, WhatsApp Business, formulaires et automatisation par Nexus RCA.",
};

const POURQUOI = [
  {
    icon: Eye,
    title: "Etre visible sur internet",
    description:
      "Apparaissez la ou vos clients vous cherchent. Site, reseaux sociaux, moteurs de recherche.",
  },
  {
    icon: TrendingUp,
    title: "Attirer des clients",
    description:
      "Transformez vos visiteurs en clients grace a une presence digitale claire et engageante.",
  },
  {
    icon: ShieldCheck,
    title: "Renforcer son image professionnelle",
    description:
      "Inspirez confiance des le premier contact avec une identite digitale credible.",
  },
  {
    icon: Workflow,
    title: "Structurer son activite",
    description:
      "Centralisez vos demandes, automatisez les taches repetitives, gagnez du temps.",
  },
];

const CE_QUE_NOUS_FAISONS = [
  "Creation de sites web professionnels (vitrine, e-commerce, sur-mesure)",
  "Mise en place de WhatsApp Business (catalogue, reponses automatiques)",
  "Formulaires clients optimises pour generer des leads qualifies",
  "Structuration de la presence digitale (Google, reseaux sociaux, fiche entreprise)",
  "Optimisation de la visibilite (SEO de base, contenus, photos pro)",
  "Integration email, agenda, paiement en ligne selon votre activite",
  "Branding visuel coherent (logo, palette, typographie)",
  "Formation et accompagnement pour gerer vous-meme votre digital",
];

interface Pack {
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  /** Slug pour pre-remplir le formulaire complet */
  packSlug: string;
}

const PACKS: Pack[] = [
  {
    name: "Essentiel",
    tagline: "Demarrer une presence digitale credible",
    price: "150 000 - 250 000 FCFA",
    icon: Globe,
    packSlug: "essentiel",
    features: [
      "Site web simple (1 a 3 pages)",
      "WhatsApp Business configure",
      "Mise en ligne et hebergement",
      "Configuration de base (logo, couleurs)",
      "Formulaire de contact simple",
    ],
  },
  {
    name: "Pro",
    tagline: "Une vraie image professionnelle",
    price: "300 000 - 600 000 FCFA",
    icon: LayoutGrid,
    highlighted: true,
    packSlug: "pro",
    features: [
      "Site web professionnel multi-pages",
      "Formulaire client avance",
      "Integration WhatsApp + Email",
      "Design et branding simple sur-mesure",
      "Optimisation mobile et vitesse",
      "Pages services detaillees",
    ],
  },
  {
    name: "Premium",
    tagline: "Une plateforme complete pour developper",
    price: "700 000 - 1 500 000 FCFA+",
    icon: Sparkles,
    packSlug: "premium",
    features: [
      "Site web complet + strategie digitale",
      "Tunnel client (capture, suivi, conversion)",
      "Automatisation WhatsApp et email",
      "Optimisation SEO avancee",
      "Accompagnement strategique",
      "Tableau de bord client",
      "Formation et support",
    ],
  },
];

/**
 * Construit l URL vers le formulaire complet avec contexte du pack
 */
function buildPackFormUrl(pack: Pack): string {
  const context = `Pack ${pack.name} - Digitalisation et developpement d activite. Tarif indicatif : ${pack.price}.`;
  const params = new URLSearchParams({
    service: "digitalisation",
    pack: pack.packSlug,
    ia_context: context,
  });
  return `/demande/complet?${params.toString()}`;
}

export default function DigitalisationPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Digital et developpement d activite"
          title="Digitalisation et presence en ligne"
          subtitle="Developpez votre visibilite, structurez votre activite et attirez des clients grace a des solutions digitales professionnelles."
          image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Digitalisation et presence en ligne"
          ctaLabel="Lancer mon projet digital"
          whatsappMessage="Bonjour Nexus, je souhaite digitaliser mon activite."
        />

        {/* SECTION 2 — POURQUOI CE SERVICE */}
        <ServiceSection
          variant="muted"
          eyebrow="Pourquoi se digitaliser"
          title="Le digital change la donne pour votre activite"
          description="Quatre raisons concretes pour lesquelles nos clients passent au digital avec Nexus RCA."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {POURQUOI.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ServiceSection>

        {/* SECTION 3 — CE QUE NOUS FAISONS */}
        <ServiceSection
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Un accompagnement complet pour donner a votre activite la presence digitale qu elle merite."
        >
          <ServiceChecklist items={CE_QUE_NOUS_FAISONS} />
        </ServiceSection>

        {/* SECTION 4 — NOS OFFRES (PACKS) */}
        <ServiceSection
          variant="muted"
          eyebrow="Nos offres"
          title="Choisissez le pack adapte a votre ambition"
          description="Trois formules claires, transparentes et evolutives."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {PACKS.map((pack) => {
              const Icon = pack.icon;
              return (
                <div
                  key={pack.name}
                  className={
                    pack.highlighted
                      ? "relative flex flex-col rounded-3xl border-2 border-nexus-orange-500 bg-white p-8 shadow-2xl shadow-nexus-orange-500/10"
                      : "flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md"
                  }
                >
                  {pack.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-nexus-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      Recommande
                    </div>
                  )}

                  <div
                    className={
                      pack.highlighted
                        ? "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg"
                        : "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700"
                    }
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-nexus-blue-950">
                    {pack.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{pack.tagline}</p>

                  <div className="mt-5 border-y border-slate-200 py-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      A partir de
                    </p>
                    <p
                      className={
                        pack.highlighted
                          ? "mt-1 font-display text-xl font-bold text-nexus-orange-600 sm:text-2xl"
                          : "mt-1 font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl"
                      }
                    >
                      {pack.price}
                    </p>
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {pack.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Check
                          className={
                            pack.highlighted
                              ? "mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600"
                              : "mt-0.5 h-4 w-4 shrink-0 text-nexus-blue-600"
                          }
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={buildPackFormUrl(pack)}
                    className={
                      pack.highlighted
                        ? "group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:shadow-xl"
                        : "group mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-nexus-blue-900 bg-white px-5 py-3 text-sm font-semibold text-nexus-blue-900 transition hover:bg-nexus-blue-900 hover:text-white"
                    }
                  >
                    Choisir ce pack
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Devis personnalise selon votre activite, votre secteur et vos objectifs.
          </p>
        </ServiceSection>

        {/* SECTION 5 — MESSAGE DIFFERENCIANT */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-nexus-blue-200 bg-gradient-to-br from-nexus-blue-50 via-white to-nexus-orange-50 p-8 shadow-sm sm:p-12">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-nexus-blue-500/10 blur-2xl" />

              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                  <Zap className="h-6 w-6" />
                </div>

                <p className="font-display text-2xl font-bold leading-snug text-nexus-blue-950 sm:text-3xl md:text-4xl">
                  Nous ne faisons pas que des sites web.
                </p>
                <p className="mt-3 text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Nous vous aidons a etre{" "}
                  <span className="font-semibold text-nexus-blue-950">
                    visibles
                  </span>
                  ,{" "}
                  <span className="font-semibold text-nexus-blue-950">
                    credibles
                  </span>{" "}
                  et a developper votre activite grace au digital.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — CTA FINAL */}
        <ServiceCTA
          title="Pret a digitaliser votre activite ?"
          subtitle="Parlez-nous de votre projet. Nous revenons avec une proposition claire et adaptee."
          ctaLabel="Demarrer maintenant"
          ctaHref="/demande/complet?service=digitalisation"
          whatsappMessage="Bonjour Nexus, je veux digitaliser mon activite, j aimerais en discuter."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
