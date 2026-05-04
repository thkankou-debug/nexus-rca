import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Globe,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Check,
  Calendar,
  MessageCircle,
  FileText,
  Search,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Smartphone,
  Workflow,
  TrendingUp,
  Eye,
  Cpu,
} from "lucide-react";
import { whatsappLink, cn } from "@/lib/utils";

export const metadata = {
  title: "Digital & développement d'activité | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour la digitalisation de votre activité. Sites web, WhatsApp Business, formulaires, automatisation. Trois packs en FCFA, devis transparent.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous avez une activité existante (commerce, service, association) et voulez gagner en visibilité et crédibilité",
    "Vous êtes prêt(e) à fournir vos contenus (textes, photos, logo) ou à accepter notre cadrage pour les produire",
    "Vous comprenez qu'un site n'est pas une fin en soi, mais un outil au service d'objectifs business",
  ],
  non: [
    "Vous voulez un site « parce qu'il faut en avoir un » sans réflexion sur l'usage et l'audience",
    "Vous attendez des résultats marketing immédiats — visibilité Google et acquisition demandent du temps et des contenus réguliers",
    "Vous cherchez le moins cher du marché, sans considérer la qualité et la durabilité du livrable",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (activité, présence existante, pack envisagé, objectifs) ou prenez rendez-vous. Nous comprenons votre projet réel.",
  },
  {
    num: "02",
    icon: Search,
    title: "Cadrage & devis fixe",
    description:
      "Un conseiller Nexus vous reçoit, étudie votre activité et propose un devis avec périmètre exact, livrables, calendrier et pack adapté. Aucun engagement avant validation.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Production structurée",
    description:
      "Conception, design, développement, configuration WhatsApp/e-mail, optimisation. Points d'étape réguliers, validations à chaque jalon, pas de surprise à la livraison.",
  },
  {
    num: "04",
    icon: TrendingUp,
    title: "Mise en ligne & autonomie",
    description:
      "Mise en production, formation à l'auto-gestion (mises à jour simples), accompagnement initial post-lancement. Vous repartez maître de votre outil.",
  },
];

interface PackType {
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  packSlug: string;
}

const PACKS: PackType[] = [
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

const STATS = [
  { value: "3 packs", label: "En FCFA, transparents" },
  { value: "Devis", label: "Fixe avant production" },
  { value: "Formation", label: "À l'auto-gestion incluse" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function DigitalisationPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO INSTITUTIONNEL ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <LayoutGrid className="h-3.5 w-3.5" />
                Service digitalisation
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                pour digitaliser votre activité.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous étudions votre activité avant de proposer un pack. Si
                votre projet correspond à nos critères, nous le construisons
                proprement — site web, WhatsApp Business, formulaires,
                automatisation — et vous formons à l'auto-gestion.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/digitalisation/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre mon projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=digitalisation"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Devis fixe · Tarifs en FCFA · Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Digitalisation."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  contactez-nous sur WhatsApp
                </a>
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-display-sm text-nexus-orange-400">
                    {s.value}
                  </div>
                  <div className="mt-1 text-overline text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. POUR QUI CE SERVICE EST CONÇU ────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Sélectivité</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pour qui ce service est conçu
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous n'acceptons pas tous les projets. Cette transparence fait
                partie de notre engagement professionnel — un site mal pensé
                vaut moins que pas de site.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-emerald-200/60 bg-emerald-50/40 p-7 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    Ce service s'adresse aux personnes
                  </h3>
                </div>
                <ul className="space-y-3">
                  {POUR_QUI.oui.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    Ce service ne s'adresse pas aux personnes
                  </h3>
                </div>
                <ul className="space-y-3">
                  {POUR_QUI.non.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. NOTRE MÉTHODOLOGIE ───────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre méthodologie</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Un parcours en quatre étapes documentées
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                De la soumission jusqu'à votre autonomie sur l'outil, chaque
                étape est cadrée et tracée.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {METHODOLOGIE.map((etape) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.num}
                    className="group flex items-start gap-5 rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 font-display text-xl font-bold text-nexus-blue-700 transition group-hover:from-brand-subtle group-hover:to-orange-50 group-hover:text-brand dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      {etape.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-brand" />
                        <h3 className="font-display text-headline text-ink">
                          {etape.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-body-sm text-ink-muted">
                        {etape.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-overline text-brand">
                    Démarrer la démarche
                  </p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    Soumettez votre projet de digitalisation.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Étude initiale gratuite. Devis fixe communiqué après cadrage.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/digitalisation/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre mon projet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=digitalisation"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-surface-sunken"
                  >
                    <Calendar className="h-4 w-4" />
                    Prendre rendez-vous
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LES 3 PACKS ───────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Nos offres</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Trois packs, trois niveaux d'ambition
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Tarifs indicatifs en FCFA. Le devis final est cadré selon
                votre activité, votre secteur et vos objectifs réels.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
                      <p className="text-overline text-ink-muted">
                        Tarif indicatif
                      </p>
                      <p
                        className={cn(
                          "mt-1 font-display text-headline sm:text-display-sm",
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
                      href={`/services/digitalisation/demarrer?pack=${pack.packSlug}`}
                      className={cn(
                        "group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-body-sm font-semibold transition",
                        highlighted
                          ? "bg-brand text-white shadow-elev-3 hover:bg-brand-hover hover:shadow-glow-orange"
                          : "border-2 border-nexus-blue-900 bg-surface-elevated text-ink hover:bg-nexus-blue-900 hover:text-white dark:border-line dark:hover:bg-brand dark:hover:border-brand"
                      )}
                    >
                      Soumettre avec ce pack
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. CE QUE NOUS FAISONS RÉELLEMENT ─────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Périmètre du service</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Sites, WhatsApp, formulaires, automatisation
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Quatre familles d'interventions, articulées autour d'un seul
                objectif : rendre votre activité visible, crédible et
                outillée.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Globe,
                  title: "Site web",
                  text: "Vitrine, e-commerce simple, sur-mesure. Hébergement et nom de domaine inclus.",
                },
                {
                  icon: Smartphone,
                  title: "WhatsApp Business",
                  text: "Catalogue, réponses automatiques, intégration au site, formation à l'usage.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Formulaires & e-mail",
                  text: "Formulaires de contact ou prospection, intégration e-mail, capture de leads.",
                },
                {
                  icon: Workflow,
                  title: "Automatisation simple",
                  text: "Réponses auto, agenda, paiement en ligne, tableau de bord client (pack Premium).",
                },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {it.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {it.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. POURQUOI SE DIGITALISER ───────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">L'effet attendu</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quatre effets concrets sur votre activité
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Un site bien pensé, un WhatsApp Business bien configuré et
                des formulaires bien intégrés produisent ces effets — pas
                magiquement, mais de façon mesurable.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: Eye,
                  title: "Être visible quand on vous cherche",
                  text: "Apparaître sur Google, sur les réseaux, là où vos prospects regardent en priorité.",
                },
                {
                  icon: ShieldCheck,
                  title: "Inspirer confiance dès le 1er contact",
                  text: "Un site propre + un numéro WhatsApp Business = crédibilité immédiate.",
                },
                {
                  icon: TrendingUp,
                  title: "Capter des demandes qualifiées",
                  text: "Formulaires bien pensés qui filtrent les demandes et facilitent le suivi.",
                },
                {
                  icon: Cpu,
                  title: "Gagner du temps au quotidien",
                  text: "Réponses automatiques, agenda partagé, archivage des demandes.",
                },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {it.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {it.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT DE TRANSPARENCE ────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Engagement</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Un site n'achète pas le succès commercial
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous fabriquons un outil performant. Le développement
                commercial dépend ensuite de la qualité de votre offre, de
                vos contenus et de votre régularité.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Garantir un nombre de clients ou un chiffre d'affaires",
                    "Promettre une 1ère page Google immédiate sans contenus",
                    "Maintenir le site à jour à votre place sans contrat de suivi",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-brand/40 bg-brand-subtle/40 p-7">
                <p className="text-overline text-nexus-orange-700 dark:text-brand">
                  Ce que nous garantissons
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Un site propre, mobile-friendly, conforme au pack choisi",
                    "Un devis fixe avec périmètre, livrables et calendrier annoncés",
                    "Une formation à l'auto-gestion incluse à chaque pack",
                    "Un accompagnement post-lancement pour démarrer sereinement",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CADRE TARIFAIRE ──────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cadre tarifaire</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Une transparence économique complète
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Tarifs en FCFA, devis fixe, frais récurrents annoncés à
                part.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Cadrage initial
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit. Périmètre, pack et calendrier validés avant toute
                  production.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Devis fixe
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Tarif annoncé selon pack et adaptations. Aucune
                  facturation surprise en cours de production.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Frais récurrents
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Hébergement, nom de domaine, services tiers : annoncés à
                  part avec leur tarif annuel exact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CTA FINAL FORMEL ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-nexus-orange-300">
                Lancer votre projet digital
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Soumettez votre projet pour un cadrage gratuit.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Un conseiller revient vers vous avec un pack adapté, un
                périmètre précis et un calendrier de livraison réaliste.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Cadrage
                  <br />
                  <span className="text-white">Gratuit</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Devis
                  <br />
                  <span className="text-white">Fixe FCFA</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Formation
                  <br />
                  <span className="text-white">Incluse</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/digitalisation/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre mon projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=digitalisation"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-8 text-caption text-white/70">
                Une question avant de commencer ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur la digitalisation de mon activité."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contactez-nous sur WhatsApp
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
