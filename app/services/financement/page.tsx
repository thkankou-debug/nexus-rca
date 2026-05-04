import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import {
  Handshake,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  Rocket,
  Compass,
  GraduationCap,
  Store,
  HandCoins,
} from "lucide-react";

export const metadata = {
  title: "Incubateur & financement en partenariat | Nexus RCA",
  description:
    "Nexus RCA accompagne, incube et cofinance des projets sérieux en République Centrafricaine. Modèle gagnant-gagnant — pas un prêt, un partenariat. Étude gratuite, réponse sous 7 jours.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const APPROCHE_POINTS = [
  {
    icon: ShieldCheck,
    title: "Projets sérieux",
    description:
      "Une vision claire, un porteur engagé, des bases que nous construisons ensemble.",
  },
  {
    icon: Layers,
    title: "Projets structurés",
    description:
      "Une idée organisée, un plan d'action réaliste, un modèle économique cohérent.",
  },
  {
    icon: Target,
    title: "Personnes engagées",
    description:
      "Des porteurs déterminés, prêts à s'investir sur la durée.",
  },
];

const ENGAGEMENTS = [
  {
    emoji: "🤝",
    title: "Nous nous impliquons",
    description:
      "Pas seulement de l'argent : du temps, de l'expertise, des contacts.",
  },
  {
    emoji: "⚖️",
    title: "Nous partageons le risque",
    description: "Notre réussite est liée à la vôtre. Nous avançons ensemble.",
  },
  {
    emoji: "🚀",
    title: "Nous accompagnons la réussite",
    description: "Du démarrage à la croissance, nous restons à vos côtés.",
  },
];

const OFFRES = [
  {
    icon: Compass,
    number: "01",
    title: "Accompagnement stratégique",
    description:
      "Nous structurons votre projet, validons sa faisabilité et bâtissons un plan d'action concret.",
    points: [
      "Structuration complète du projet",
      "Étude de faisabilité approfondie",
      "Plan d'action étape par étape",
      "Suivi personnalisé sur la durée",
    ],
  },
  {
    icon: Rocket,
    number: "02",
    title: "Incubation",
    description:
      "Nous accompagnons le porteur dans la mise en place opérationnelle.",
    points: [
      "Encadrement du porteur",
      "Aide à l'organisation et à la gestion",
      "Bases solides du business",
      "Conseils stratégiques continus",
    ],
  },
  {
    icon: HandCoins,
    number: "03",
    title: "Financement en partenariat",
    description:
      "Nous investissons aux côtés du porteur, dans une logique de collaboration et de partage des résultats.",
    points: [
      "Cofinancement adapté au projet",
      "Partenariat clair et transparent",
      "Partage des résultats équitable",
      "Pas de dette qui écrase",
    ],
    highlighted: true,
  },
];

const QUI_PEUT_POSTULER = [
  {
    icon: GraduationCap,
    title: "Jeunes entrepreneurs",
    description:
      "Vous avez une idée et l'envie d'entreprendre. Nous vous aidons à la transformer en projet viable.",
  },
  {
    icon: Store,
    title: "Commerçants",
    description:
      "Vous voulez développer votre activité, l'agrandir ou la moderniser. Nous structurons sa croissance.",
  },
  {
    icon: Briefcase,
    title: "Porteurs de projets",
    description:
      "Vous portez un projet structuré avec une vision claire. Nous l'évaluons sérieusement.",
  },
  {
    icon: Lightbulb,
    title: "Personnes motivées",
    description:
      "Vous avez la détermination et la rigueur nécessaires. Nous valorisons l'engagement avant tout.",
  },
];

const SELECTION_CRITERES = [
  "Le projet est réaliste et économiquement viable",
  "Le porteur est sérieux, motivé et engagé",
  "La structure et le modèle sont cohérents",
  "Le potentiel de croissance est clairement identifié",
];

const STATS = [
  { value: "0 FCFA", label: "Étude initiale" },
  { value: "7 jours", label: "Réponse" },
  { value: "100 %", label: "Confidentiel" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function FinancementPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <Handshake className="h-3.5 w-3.5" />
                Incubateur & Financement
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                Donnez vie à votre projet à{" "}
                <span className="text-gradient-orange">Bangui</span>, avec un
                vrai{" "}
                <span className="text-gradient-orange">partenaire</span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous incubons, accompagnons et cofinançons des projets sérieux
                en République Centrafricaine. Pas un prêt avec dette : un
                partenariat avec partage des résultats.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=financement"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  Soumettre mon projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#approche"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Découvrir notre approche
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Étude gratuite · Réponse sous 7 jours · 100 % confidentiel
              </p>
            </div>

            {/* Stats strip */}
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

        {/* LE CONSTAT ─────────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Le constat</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Lancer un projet en RCA reste un défi
              </h2>
            </div>

            <div className="mt-12 space-y-6 text-body text-ink-muted sm:text-body-lg">
              <p>
                Créer un projet en République Centrafricaine reste difficile :{" "}
                <strong className="text-ink">manque de financement</strong>,{" "}
                <strong className="text-ink">manque d'accompagnement</strong>,{" "}
                <strong className="text-ink">manque de structure</strong>.
              </p>

              <p>
                Trop de talents et de projets prometteurs n'arrivent jamais à
                voir le jour, faute d'un partenaire capable de soutenir leur
                développement avec sérieux.
              </p>

              <div className="my-10 rounded-3xl border-l-4 border-brand bg-brand-subtle/40 px-6 py-6 shadow-elev-1 sm:px-8 sm:py-8">
                <p className="font-display text-headline text-ink sm:text-display-sm">
                  Nexus RCA fait le choix d'agir concrètement.
                </p>
                <p className="mt-3 text-body text-ink-muted">
                  Notre programme ne se limite pas à donner des conseils. Nous{" "}
                  <strong className="text-ink">accompagnons</strong>,{" "}
                  <strong className="text-ink">structurons</strong> et{" "}
                  <strong className="text-ink">cofinançons</strong> des projets
                  à fort potentiel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NOTRE APPROCHE ─────────────────────────────────────────── */}
        <section id="approche" className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre approche</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Nous ne finançons pas au hasard
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Chaque projet retenu fait l'objet d'une étude approfondie. Nous
                investissons notre temps et nos ressources uniquement dans des
                projets capables de réussir.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {APPROCHE_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="group rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-brand-subtle group-hover:to-orange-50 group-hover:text-brand dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 3 piliers d'engagement */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {ENGAGEMENTS.map((e) => (
                <EngagementCard key={e.title} {...e} />
              ))}
            </div>
          </div>
        </section>

        {/* CE QUE NOUS OFFRONS ─────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Ce que nous offrons</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Trois volets, un programme complet
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Un accompagnement structuré qui couvre toutes les dimensions de
                votre projet, de la stratégie au financement.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {OFFRES.map((offre) => {
                const Icon = offre.icon;
                const highlighted = offre.highlighted;
                return (
                  <div
                    key={offre.number}
                    className={
                      highlighted
                        ? "relative flex flex-col rounded-3xl border-2 border-brand bg-gradient-to-br from-brand-subtle/60 to-surface-elevated p-8 shadow-elev-4"
                        : "flex flex-col rounded-3xl border border-line bg-surface-elevated p-8 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                    }
                  >
                    {highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-overline text-white shadow-elev-2">
                        Cœur du programme
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div
                        className={
                          highlighted
                            ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2"
                            : "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300"
                        }
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <div
                        className={
                          highlighted
                            ? "font-display text-display-sm text-brand"
                            : "font-display text-display-sm text-ink-subtle"
                        }
                      >
                        {offre.number}
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-headline text-ink">
                      {offre.title}
                    </h3>
                    <p className="mt-3 text-body-sm text-ink-muted">
                      {offre.description}
                    </p>

                    <ul className="mt-5 flex-1 space-y-2.5 border-t border-line pt-5">
                      {offre.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-body-sm text-ink"
                        >
                          <CheckCircle2
                            className={
                              highlighted
                                ? "mt-0.5 h-4 w-4 shrink-0 text-brand"
                                : "mt-0.5 h-4 w-4 shrink-0 text-nexus-blue-600 dark:text-blue-400"
                            }
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MODÈLE ─ PAS UN PRÊT CLASSIQUE ──────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-nexus-orange-400">
                Comment ça marche
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Un partenariat,{" "}
                <span className="text-nexus-orange-400">pas un prêt</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-body-lg text-slate-300">
                Notre modèle repose sur la collaboration et le partage des
                résultats. Pas de dette qui écrase, pas de charge financière
                lourde dès le départ.
              </p>
            </div>

            {/* Comparaison ne fait PAS / fait */}
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-overline text-rose-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ce que nous ne faisons pas
                </div>
                <ul className="space-y-3 text-body-sm text-slate-300">
                  <ListItemCross>Nous ne sommes pas une banque</ListItemCross>
                  <ListItemCross>
                    Nous ne prêtons pas d'argent à rembourser avec intérêts
                  </ListItemCross>
                  <ListItemCross>
                    Nous n'imposons pas de dette lourde dès le démarrage
                  </ListItemCross>
                  <ListItemCross>
                    Nous ne demandons pas de garanties bancaires classiques
                  </ListItemCross>
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-nexus-orange-500/40 bg-nexus-orange-500/10 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-500/20 px-3 py-1 text-overline text-nexus-orange-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ce que nous faisons
                </div>
                <ul className="space-y-3 text-body-sm text-white">
                  <ListItemCheck>
                    Nous investissons dans votre projet
                  </ListItemCheck>
                  <ListItemCheck>
                    Nous devenons partenaire de votre développement
                  </ListItemCheck>
                  <ListItemCheck>
                    Nous partageons les résultats selon un accord clair
                  </ListItemCheck>
                  <ListItemCheck>
                    Nous accompagnons la croissance sur le long terme
                  </ListItemCheck>
                </ul>
              </div>
            </div>

            {/* 3 avantages */}
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <ModelAdvantage
                title="Pas de charge écrasante"
                description="Vous démarrez sans le poids d'une dette à rembourser dès le premier jour."
              />
              <ModelAdvantage
                title="Relation gagnant-gagnant"
                description="Notre intérêt est aligné avec le vôtre : la réussite du projet."
              />
              <ModelAdvantage
                title="Croissance accompagnée"
                description="Un partenaire engagé sur la durée, pas un simple financeur de passage."
              />
            </div>
          </div>
        </section>

        {/* QUI PEUT POSTULER ────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Qui peut postuler</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce programme est fait pour vous si…
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {QUI_PEUT_POSTULER.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-headline text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-body-sm text-ink-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CRITÈRES DE SÉLECTION ───────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-brand-subtle/40 via-surface-elevated to-nexus-blue-50/40 p-8 shadow-elev-3 dark:from-brand/10 dark:via-surface-elevated dark:to-blue-500/5 sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-brand">
                    Sélection rigoureuse
                  </p>
                  <h2 className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    Tous les projets ne sont pas retenus
                  </h2>
                  <p className="mt-4 text-body text-ink-muted sm:text-body-lg">
                    Notre engagement implique une sélection rigoureuse. Chaque
                    dossier est étudié sérieusement, et seuls les projets
                    correspondant à nos critères sont retenus.
                  </p>

                  <div className="mt-6 rounded-2xl border border-line bg-surface-elevated p-5">
                    <p className="mb-3 text-overline text-ink-muted">
                      Critères de sélection
                    </p>
                    <ul className="space-y-3">
                      {SELECTION_CRITERES.map((critere) => (
                        <li
                          key={critere}
                          className="flex items-start gap-3 text-body-sm text-ink sm:text-body"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                          <span>{critere}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-5 text-body-sm italic text-ink-muted">
                    Si votre projet n'est pas retenu, nous vous le disons
                    avec transparence et, si possible, vous orientons vers
                    d'autres pistes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL ─────────────────────────────────────────────── */}
        <ServiceCTA
          title="Vous avez un projet sérieux ?"
          subtitle="Étude gratuite, réponse sous 7 jours, 100 % confidentiel. Un conseiller Nexus vous contacte aujourd'hui sur WhatsApp."
          ctaLabel="Soumettre mon projet"
          ctaHref="/demande/complet?service=financement"
          whatsappMessage="Bonjour Nexus, je souhaite soumettre un projet pour le programme Incubateur & Financement."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────────────

function EngagementCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-elevated p-5 shadow-elev-1">
      <div className="text-3xl">{emoji}</div>
      <h4 className="mt-3 font-display text-title text-ink">{title}</h4>
      <p className="mt-1 text-body-sm text-ink-muted">{description}</p>
    </div>
  );
}

function ListItemCross({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 font-bold text-rose-300">
        ×
      </span>
      <span>{children}</span>
    </li>
  );
}

function ListItemCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-nexus-orange-400" />
      <span>{children}</span>
    </li>
  );
}

function ModelAdvantage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <h4 className="font-display text-title text-white">{title}</h4>
      <p className="mt-2 text-body-sm text-slate-300">{description}</p>
    </div>
  );
}
