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
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Digital & développement d'activité | Nexus RCA — Bangui",
  description:
    "Sites web, WhatsApp Business, formulaires et automatisation pour entrepreneurs et commerçants à Bangui. 3 packs en FCFA — Essentiel, Pro, Premium.",
};

const POURQUOI = [
  {
    icon: Eye,
    title: "Être visible sur internet",
    description:
      "Apparaissez là où vos clients vous cherchent : site, réseaux sociaux, moteurs de recherche.",
  },
  {
    icon: TrendingUp,
    title: "Attirer des clients",
    description:
      "Transformez vos visiteurs en clients grâce à une présence digitale claire et engageante.",
  },
  {
    icon: ShieldCheck,
    title: "Renforcer son image professionnelle",
    description:
      "Inspirez confiance dès le premier contact avec une identité digitale crédible.",
  },
  {
    icon: Workflow,
    title: "Structurer son activité",
    description:
      "Centralisez vos demandes, automatisez les tâches répétitives, gagnez du temps.",
  },
];

const CE_QUE_NOUS_FAISONS = [
  "Création de sites web professionnels (vitrine, e-commerce, sur-mesure)",
  "Mise en place de WhatsApp Business (catalogue, réponses automatiques)",
  "Formulaires clients optimisés pour générer des leads qualifiés",
  "Structuration de la présence digitale (Google, réseaux sociaux, fiche entreprise)",
  "Optimisation de la visibilité (SEO de base, contenus, photos pro)",
  "Intégration e-mail, agenda, paiement en ligne selon votre activité",
  "Branding visuel cohérent (logo, palette, typographie)",
  "Formation et accompagnement pour gérer vous-même votre digital",
];

interface Pack {
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  packSlug: string;
}

const PACKS: Pack[] = [
  {
    name: "Essentiel",
    tagline: "Démarrer une présence digitale crédible",
    price: "150 000 - 250 000 FCFA",
    icon: Globe,
    packSlug: "essentiel",
    features: [
      "Site web simple (1 à 3 pages)",
      "WhatsApp Business configuré",
      "Mise en ligne et hébergement",
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
      "Formulaire client avancé",
      "Intégration WhatsApp + e-mail",
      "Design et branding sur-mesure simple",
      "Optimisation mobile et vitesse",
      "Pages services détaillées",
    ],
  },
  {
    name: "Premium",
    tagline: "Une plateforme complète pour développer",
    price: "700 000 - 1 500 000 FCFA+",
    icon: Sparkles,
    packSlug: "premium",
    features: [
      "Site web complet + stratégie digitale",
      "Tunnel client (capture, suivi, conversion)",
      "Automatisation WhatsApp et e-mail",
      "Optimisation SEO avancée",
      "Accompagnement stratégique",
      "Tableau de bord client",
      "Formation et support",
    ],
  },
];

function buildPackFormUrl(pack: Pack): string {
  const context = `Pack ${pack.name} — Digitalisation et développement d'activité. Tarif indicatif : ${pack.price}.`;
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
          badge="Digital & développement d'activité"
          title="Donnez à votre activité la présence digitale qu'elle mérite."
          subtitle="Sites web, WhatsApp Business, formulaires et automatisation. Pour les commerçants, entrepreneurs et associations à Bangui qui veulent passer du bricolage à une vraie image professionnelle."
          image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Écran de site web professionnel"
          ctaLabel="Lancer mon projet digital"
          whatsappMessage="Bonjour Nexus, je souhaite digitaliser mon activité."
        />

        {/* POURQUOI ────────────────────────────────────────────── */}
        <ServiceSection
          variant="muted"
          eyebrow="Pourquoi se digitaliser"
          title="Le digital change la donne pour votre activité"
          description="Quatre raisons concrètes pour lesquelles nos clients passent au digital avec Nexus RCA."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {POURQUOI.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-brand-subtle group-hover:to-orange-50 group-hover:text-brand dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ServiceSection>

        {/* CE QUE NOUS FAISONS ────────────────────────────────── */}
        <ServiceSection
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Un accompagnement complet pour donner à votre activité la présence digitale qu'elle mérite."
        >
          <ServiceChecklist items={CE_QUE_NOUS_FAISONS} />
        </ServiceSection>

        {/* PACKS ──────────────────────────────────────────────── */}
        <ServiceSection
          variant="muted"
          eyebrow="Nos offres"
          title="Choisissez le pack adapté à votre ambition"
          description="Trois formules claires, transparentes, en FCFA. Devis personnalisé selon votre activité."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {PACKS.map((pack) => {
              const Icon = pack.icon;
              const highlighted = pack.highlighted;
              return (
                <div
                  key={pack.name}
                  className={cn(
                    "relative flex flex-col rounded-3xl p-8 transition",
                    highlighted
                      ? "border-2 border-brand bg-gradient-to-br from-brand-subtle/60 to-surface-elevated shadow-elev-4"
                      : "border border-line bg-surface-elevated shadow-elev-2 hover:shadow-elev-3"
                  )}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-overline text-white shadow-elev-2">
                      Recommandé
                    </div>
                  )}

                  <div
                    className={cn(
                      "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-elev-2",
                      highlighted
                        ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white"
                        : "bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300"
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="font-display text-display-sm text-ink">
                    {pack.name}
                  </h3>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    {pack.tagline}
                  </p>

                  <div className="mt-5 border-y border-line py-4">
                    <p className="text-overline text-ink-muted">À partir de</p>
                    <p
                      className={cn(
                        "mt-1 font-display text-display-sm sm:text-display-md",
                        highlighted ? "text-brand" : "text-ink"
                      )}
                    >
                      {pack.price}
                    </p>
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {pack.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-body-sm text-ink"
                      >
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            highlighted
                              ? "text-brand"
                              : "text-nexus-blue-600 dark:text-blue-400"
                          )}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={buildPackFormUrl(pack)}
                    className={cn(
                      "group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-body-sm font-semibold transition",
                      highlighted
                        ? "bg-brand text-white shadow-elev-3 hover:bg-brand-hover hover:shadow-glow-orange"
                        : "border-2 border-nexus-blue-900 bg-surface-elevated text-ink hover:bg-nexus-blue-900 hover:text-white dark:border-line dark:hover:bg-brand dark:hover:border-brand"
                    )}
                  >
                    Choisir ce pack
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-body-sm text-ink-muted">
            Devis personnalisé selon votre activité, votre secteur et vos
            objectifs.
          </p>
        </ServiceSection>

        {/* MESSAGE DIFFÉRENCIANT ─────────────────────────────── */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-nexus-blue-50 via-surface-elevated to-orange-50 p-8 shadow-elev-2 dark:from-blue-500/5 dark:to-orange-500/5 sm:p-12">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-nexus-blue-500/10 blur-2xl" />

              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <Zap className="h-6 w-6" />
                </div>

                <p className="font-display text-display-sm text-ink sm:text-display-md">
                  Nous ne faisons pas que des sites web.
                </p>
                <p className="mt-3 text-body-lg text-ink-muted">
                  Nous vous aidons à être{" "}
                  <span className="font-semibold text-ink">visible</span>,{" "}
                  <span className="font-semibold text-ink">crédible</span> et à
                  développer votre activité grâce au digital.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA ──────────────────────────────────────────────── */}
        <ServiceCTA
          title="Prêt à digitaliser votre activité ?"
          subtitle="Parlez-nous de votre projet. Nous revenons avec une proposition claire et adaptée."
          ctaLabel="Démarrer maintenant"
          ctaHref="/demande/complet?service=digitalisation"
          whatsappMessage="Bonjour Nexus, je veux digitaliser mon activité, j'aimerais en discuter."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
