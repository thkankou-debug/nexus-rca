import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Handshake,
  TrendingUp,
  Briefcase,
  Globe2,
  Sparkles,
  ShieldCheck,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Heart,
  Users,
  Lightbulb,
  Rocket,
  Compass,
  GraduationCap,
  Store,
  HandCoins,
} from "lucide-react";

export const metadata = {
  title: "Incubateur et financement en partenariat | Nexus RCA",
  description:
    "Nexus RCA accompagne, incube et cofinance des projets sélectionnés en République Centrafricaine. Modèle de partenariat gagnant-gagnant basé sur le partage des résultats. Soumettez votre projet.",
};

// ============================================================================
// DONNEES
// ============================================================================
const APPROCHE_POINTS = [
  {
    icon: ShieldCheck,
    title: "Projets sérieux",
    description:
      "Une vision claire, un porteur engagé, des bases solides à construire ensemble.",
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
      "Des porteurs déterminés, prêts à s'investir et à porter leur projet sur la durée.",
  },
];

const OFFRES = [
  {
    icon: Compass,
    number: "01",
    title: "Accompagnement stratégique",
    description:
      "Nous structurons votre projet, validons sa faisabilité et construisons un plan d'action concret.",
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
      "Nous accompagnons le porteur dans la mise en place opérationnelle du projet.",
    points: [
      "Encadrement du porteur de projet",
      "Aide à l'organisation et à la gestion",
      "Mise en place des bases solides du business",
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
      "Pas de charge financière écrasante",
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
      "Vous souhaitez développer votre activité, l'agrandir ou la moderniser. Nous structurons sa croissance.",
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

const VISION_POINTS = [
  {
    icon: TrendingUp,
    title: "Développement économique",
    description:
      "Contribuer au développement économique de la République Centrafricaine.",
  },
  {
    icon: Users,
    title: "Réussite locale",
    description:
      "Aider les entrepreneurs locaux à réussir durablement et à créer de la valeur.",
  },
  {
    icon: Sparkles,
    title: "Opportunités concrètes",
    description:
      "Créer des opportunités réelles pour la communauté et la jeunesse centrafricaine.",
  },
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export default function FinancementPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ==================== HERO ==================== */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                <Handshake className="h-4 w-4 text-nexus-orange-400" />
                Incubateur & Financement Nexus
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
                Donnez vie à votre projet avec un{" "}
                <span className="text-gradient-orange">accompagnement réel</span>{" "}
                et un{" "}
                <span className="text-gradient-orange">
                  financement responsable
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
                Un programme structuré pour les porteurs de projets sérieux en
                République Centrafricaine. Nous incubons, accompagnons et
                cofinançons les projets à fort potentiel.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=financement"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-nexus-orange-500/40 transition hover:scale-105 hover:bg-nexus-orange-600"
                >
                  Soumettre mon projet
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#approche"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Découvrir notre approche
                </Link>
              </div>

              <p className="mt-5 text-sm text-white/60">
                Étude gratuite du dossier · Réponse sous 7 jours · 100%
                confidentiel
              </p>
            </div>
          </div>
        </section>

        {/* ==================== INTRODUCTION (PROBLÈME) ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Le constat
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Lancer un projet en RCA reste un défi
              </h2>
            </div>

            <div className="mt-12 space-y-6 text-base leading-relaxed text-slate-700 sm:text-lg">
              <p>
                Créer un projet en République Centrafricaine est souvent
                difficile :{" "}
                <strong className="text-nexus-blue-950">
                  manque de financement
                </strong>
                ,{" "}
                <strong className="text-nexus-blue-950">
                  manque d'accompagnement
                </strong>
                , <strong className="text-nexus-blue-950">manque de structure</strong>.
              </p>

              <p>
                Trop de talents et de projets prometteurs n'arrivent jamais à
                voir le jour, faute d'un partenaire capable de soutenir leur
                développement avec sérieux.
              </p>

              <div className="my-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-gradient-to-br from-nexus-orange-50 to-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
                <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                  Chez Nexus RCA, nous faisons le choix d'agir concrètement.
                </p>
                <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                  Notre programme Incubateur & Financement ne se limite pas à
                  donner des conseils. Nous{" "}
                  <strong className="text-nexus-blue-950">accompagnons</strong>,{" "}
                  <strong className="text-nexus-blue-950">structurons</strong> et{" "}
                  <strong className="text-nexus-blue-950">cofinançons</strong>{" "}
                  des projets sérieux à fort potentiel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== NOTRE APPROCHE ==================== */}
        <section id="approche" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre approche
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Nous ne finançons pas au hasard
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Chaque projet retenu fait l'objet d'une étude approfondie. Nous
                investissons notre temps et nos ressources uniquement dans des
                projets que nous croyons capables de réussir.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {APPROCHE_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-nexus-blue-950">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 3 piliers d engagement */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <EngagementCard
                emoji="🤝"
                title="Nous nous impliquons"
                description="Pas seulement de l'argent : du temps, de l'expertise, des contacts."
              />
              <EngagementCard
                emoji="⚖️"
                title="Nous partageons le risque"
                description="Notre réussite est liée à la vôtre. Nous avançons ensemble."
              />
              <EngagementCard
                emoji="🚀"
                title="Nous accompagnons la réussite"
                description="Du démarrage à la croissance, nous restons à vos côtés."
              />
            </div>
          </div>
        </section>

        {/* ==================== CE QUE NOUS OFFRONS ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Ce que nous offrons
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Trois volets, un programme complet
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Un accompagnement structuré qui couvre toutes les dimensions de
                votre projet, de la stratégie au financement.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {OFFRES.map((offre) => {
                const Icon = offre.icon;
                return (
                  <div
                    key={offre.number}
                    className={
                      offre.highlighted
                        ? "relative flex flex-col rounded-3xl border-2 border-nexus-orange-500 bg-gradient-to-br from-nexus-orange-50 to-white p-8 shadow-2xl shadow-nexus-orange-500/10"
                        : "flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md"
                    }
                  >
                    {offre.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-nexus-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                        Cœur du programme
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div
                        className={
                          offre.highlighted
                            ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg"
                            : "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700"
                        }
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <div
                        className={
                          offre.highlighted
                            ? "font-display text-3xl font-bold text-nexus-orange-500"
                            : "font-display text-3xl font-bold text-slate-300"
                        }
                      >
                        {offre.number}
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-nexus-blue-950">
                      {offre.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {offre.description}
                    </p>

                    <ul className="mt-5 flex-1 space-y-2.5 border-t border-slate-200 pt-5">
                      {offre.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <CheckCircle2
                            className={
                              offre.highlighted
                                ? "mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600"
                                : "mt-0.5 h-4 w-4 shrink-0 text-nexus-blue-600"
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

        {/* ==================== EXPLICATION DU MODÈLE ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-400">
                Comment ça marche
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                Un modèle de partenariat,
                <br />
                <span className="text-nexus-orange-400">pas un prêt classique</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
                Notre modèle repose sur la collaboration et le partage des
                résultats. Pas de dette qui écrase, pas de charge financière
                lourde dès le départ.
              </p>
            </div>

            {/* Comparaison visuelle : ce qu on fait pas / ce qu on fait */}
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {/* Ce qu on ne fait PAS */}
              <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ce que nous ne faisons pas
                </div>
                <ul className="space-y-3 text-sm leading-relaxed text-white/80">
                  <ListItemCross>
                    Nous ne sommes pas une banque
                  </ListItemCross>
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

              {/* Ce qu on fait */}
              <div className="rounded-3xl border-2 border-nexus-orange-500/40 bg-nexus-orange-500/10 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-nexus-orange-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ce que nous faisons
                </div>
                <ul className="space-y-3 text-sm leading-relaxed text-white">
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

            {/* Les 3 avantages clés */}
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

        {/* ==================== QUI PEUT POSTULER ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Qui peut postuler
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Ce programme est fait pour vous si...
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {QUI_PEUT_POSTULER.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== CRITÈRES DE SÉLECTION ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-nexus-orange-200 bg-gradient-to-br from-nexus-orange-50 via-white to-nexus-blue-50 p-8 shadow-xl sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                    Sélection rigoureuse
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl md:text-4xl">
                    Tous les projets ne sont pas retenus
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
                    Notre engagement implique une sélection rigoureuse. Chaque
                    dossier est étudié sérieusement, et seuls les projets
                    correspondant à nos critères sont retenus.
                  </p>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
                      Critères de sélection
                    </p>
                    <ul className="space-y-3">
                      {SELECTION_CRITERES.map((critere) => (
                        <li
                          key={critere}
                          className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 sm:text-base"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-nexus-orange-500" />
                          <span>{critere}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-5 text-sm italic text-slate-600">
                    Si votre projet n'est pas retenu, nous vous le disons avec
                    transparence et, si possible, vous orientons vers d'autres
                    pistes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== VISION ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-50 via-white to-nexus-orange-50 py-20">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-nexus-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-nexus-blue-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre vision
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Au-delà du financement, un engagement
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-700 sm:text-xl">
                Notre objectif dépasse la simple rentabilité. Nous croyons que
                soutenir les entrepreneurs locaux est une manière concrète de
                contribuer au développement de la République Centrafricaine.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {VISION_POINTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-nexus-blue-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
              <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                Chaque projet réussi, c'est une vie qui avance et une communauté
                qui progresse.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                Voilà pourquoi nous nous engageons aux côtés des porteurs de
                projets, avec rigueur et avec cœur.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== CTA FINAL ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Vous avez un projet sérieux ?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
              Déposez votre dossier dès maintenant. Un conseiller Nexus vous
              contactera pour évaluer votre projet et vous indiquer les
              prochaines étapes.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/demande/complet?service=financement"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-nexus-blue-950 shadow-2xl transition hover:scale-105 hover:shadow-2xl"
              >
                Soumettre mon projet
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Prendre rendez-vous
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/80">
              Étude gratuite · Réponse sous 7 jours · 100% confidentiel
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
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
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-3xl">{emoji}</div>
      <h4 className="mt-3 font-display text-base font-bold text-nexus-blue-950">
        {title}
      </h4>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

function ListItemCross({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 font-bold text-red-300">
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
      <h4 className="font-display text-base font-bold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
    </div>
  );
}
