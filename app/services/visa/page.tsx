import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  FileText,
  Globe,
  Plane,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Search,
  ClipboardCheck,
  Calendar,
  Eye,
  Sparkles,
  Heart,
  AlertTriangle,
  Zap,
  Smartphone,
  MapPin,
} from "lucide-react";

export const metadata = {
  title: "Visa & e-Visa internationaux | Nexus RCA",
  description:
    "Accompagnement professionnel pour vos demandes de visa et e-Visa. Asie, Moyen-Orient, Europe, Afrique, Canada. Préparation complète du dossier, vérification, suivi. Maximisez vos chances avec Nexus RCA.",
};

// ============================================================================
// DONNEES
// ============================================================================
const PROBLEMES = [
  {
    icon: FileText,
    text: "Documents incomplets ou mal préparés",
  },
  {
    icon: AlertCircle,
    text: "Erreurs dans les formulaires officiels",
  },
  {
    icon: Eye,
    text: "Manque d'information sur les exigences",
  },
  {
    icon: Clock,
    text: "Délais longs et démarches stressantes",
  },
];

const ETAPES = [
  {
    num: "01",
    icon: Search,
    title: "Analyse de votre situation",
    description:
      "Étude de votre profil, de votre destination et du type de visa adapté à votre projet.",
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "Vérification des documents",
    description:
      "Contrôle complet de tous les documents requis selon les exigences du pays visé.",
  },
  {
    num: "03",
    icon: FileText,
    title: "Constitution du dossier",
    description:
      "Préparation rigoureuse du dossier complet, formulaires officiels remplis correctement.",
  },
  {
    num: "04",
    icon: Calendar,
    title: "Prise de rendez-vous",
    description:
      "Si nécessaire, planification du rendez-vous au consulat ou centre de visas.",
  },
  {
    num: "05",
    icon: Eye,
    title: "Suivi jusqu'à la décision",
    description:
      "Accompagnement actif jusqu'à la décision finale des autorités consulaires.",
  },
];

const E_VISA_AVANTAGES = [
  {
    icon: Smartphone,
    title: "100% en ligne",
    description: "Demande effectuée entièrement par voie électronique.",
  },
  {
    icon: Zap,
    title: "Traitement rapide",
    description:
      "Délais réduits, généralement de 48 heures à quelques jours selon le pays.",
  },
  {
    icon: MapPin,
    title: "Pas de déplacement",
    description: "Aucun rendez-vous physique à l'ambassade ou au consulat.",
  },
  {
    icon: CheckCircle2,
    title: "Procédure simplifiée",
    description:
      "Moins de documents à fournir, processus plus accessible et plus simple.",
  },
];

interface Destination {
  name: string;
  type: string;
  emoji: string;
}

interface Region {
  title: string;
  emoji: string;
  description: string;
  destinations: Destination[];
  highlight?: boolean;
}

const REGIONS: Region[] = [
  {
    title: "Asie",
    emoji: "🌏",
    description: "Forte demande pour les voyages, études et affaires.",
    highlight: true,
    destinations: [
      { name: "Inde", type: "e-Visa tourisme & affaires", emoji: "🇮🇳" },
      { name: "Indonésie (Bali)", type: "e-Visa tourisme", emoji: "🇮🇩" },
      { name: "Vietnam", type: "e-Visa rapide", emoji: "🇻🇳" },
      { name: "Thaïlande", type: "Visa & e-Visa", emoji: "🇹🇭" },
      { name: "Sri Lanka", type: "ETA en ligne", emoji: "🇱🇰" },
      { name: "Chine", type: "Accompagnement spécifique", emoji: "🇨🇳" },
    ],
  },
  {
    title: "Moyen-Orient",
    emoji: "🌍",
    description: "Destinations business et tourisme premium.",
    destinations: [
      { name: "Dubaï (Émirats Arabes Unis)", type: "e-Visa rapide", emoji: "🇦🇪" },
      { name: "Turquie", type: "e-Visa simplifié", emoji: "🇹🇷" },
    ],
  },
  {
    title: "Europe & Amérique",
    emoji: "🌎",
    description: "Démarches consulaires complètes et exigeantes.",
    destinations: [
      { name: "Visa Schengen (Europe)", type: "Tourisme, études, travail", emoji: "🇪🇺" },
      { name: "Canada", type: "Visa visiteur, études, travail", emoji: "🇨🇦" },
    ],
  },
  {
    title: "Afrique",
    emoji: "🌍",
    description: "Démarches régionales et continentales.",
    destinations: [
      { name: "Maroc", type: "Visa & e-Visa", emoji: "🇲🇦" },
      { name: "Kenya", type: "e-Visa en ligne", emoji: "🇰🇪" },
      { name: "Rwanda", type: "e-Visa rapide", emoji: "🇷🇼" },
    ],
  },
];

const POURQUOI_NEXUS = [
  {
    icon: Sparkles,
    title: "Accompagnement personnalisé",
    description:
      "Un conseiller dédié comprend votre situation et adapte la démarche à votre profil.",
  },
  {
    icon: ShieldCheck,
    title: "Expertise des procédures",
    description:
      "Maîtrise des exigences de chaque consulat, mises à jour régulières des règles.",
  },
  {
    icon: CheckCircle2,
    title: "Réduction des erreurs",
    description:
      "Vérification rigoureuse à chaque étape pour éliminer les motifs de refus évitables.",
  },
  {
    icon: Clock,
    title: "Gain de temps considérable",
    description:
      "Vous vous concentrez sur votre voyage, nous gérons les démarches complexes.",
  },
  {
    icon: Eye,
    title: "Suivi sérieux",
    description:
      "Information transparente à chaque étape, du dépôt jusqu'à la décision.",
  },
  {
    icon: ClipboardCheck,
    title: "Dossier optimisé",
    description:
      "Présentation soignée qui valorise votre profil auprès des autorités consulaires.",
  },
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export default function VisaPage() {
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
                <Plane className="h-4 w-4 text-nexus-orange-400" />
                Visa & e-Visa internationaux
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
                Voyagez en toute{" "}
                <span className="text-gradient-orange">sérénité</span>, avec un
                accompagnement{" "}
                <span className="text-gradient-orange">professionnel</span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
                Nexus RCA vous accompagne à chaque étape de votre demande de
                visa : préparation du dossier, vérification des documents,
                soumission et suivi jusqu'à la décision finale.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=visa"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-nexus-orange-500/40 transition hover:scale-105 hover:bg-nexus-orange-600"
                >
                  Faire une demande de visa
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#destinations"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Voir les destinations
                </Link>
              </div>

              <p className="mt-5 text-sm text-white/60">
                Étude gratuite du dossier · Conseil personnalisé · Suivi
                jusqu'à la décision
              </p>
            </div>
          </div>
        </section>

        {/* ==================== INTRODUCTION (PROBLÈME) ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Le constat
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Obtenir un visa, ce n'est pas si simple
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Les démarches sont souvent plus complexes qu'il n'y paraît, et
                une erreur peut coûter cher : refus, perte de temps, frais
                inutiles.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {PROBLEMES.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 sm:text-base">
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-gradient-to-br from-nexus-orange-50 to-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
              <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                Chez Nexus RCA, nous simplifions tout.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                Nous vous accompagnons de manière professionnelle pour{" "}
                <strong className="text-nexus-blue-950">
                  éviter les erreurs
                </strong>
                ,{" "}
                <strong className="text-nexus-blue-950">gagner du temps</strong>{" "}
                et{" "}
                <strong className="text-nexus-blue-950">
                  maximiser vos chances d'acceptation
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ==================== NOS SERVICES VISA (ÉTAPES) ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre accompagnement
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Nous prenons votre dossier en charge de A à Z
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Vous êtes guidé à chaque étape, sans stress ni confusion.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {ETAPES.map((etape, idx) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.num}
                    className="group flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md sm:items-center"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 font-display text-xl font-bold text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
                      {etape.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-nexus-orange-500" />
                        <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                          {etape.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                        {etape.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== E-VISA ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                <Smartphone className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-400">
                Visa électronique
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                Le e-Visa,{" "}
                <span className="text-nexus-orange-400">
                  rapide et moderne
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
                Le visa électronique (e-Visa) est une solution simplifiée pour
                de nombreuses destinations. Nexus s'occupe de toute la procédure
                pour vous, de la demande à la réception du document.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {E_VISA_AVANTAGES.map((avantage) => {
                const Icon = avantage.icon;
                return (
                  <div
                    key={avantage.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 shadow-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold">
                      {avantage.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {avantage.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-nexus-orange-500/30 bg-nexus-orange-500/10 p-6 text-center backdrop-blur sm:p-8">
              <p className="text-base leading-relaxed text-white sm:text-lg">
                <strong className="text-nexus-orange-300">
                  Important :
                </strong>{" "}
                tous les pays ne proposent pas le e-Visa. Nous vous indiquons la
                meilleure procédure selon votre destination et votre situation.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== DESTINATIONS ==================== */}
        <section id="destinations" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Destinations disponibles
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Quelle est votre destination ?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Nous accompagnons les démarches pour de nombreux pays à travers
                le monde. Voici les principales destinations couvertes.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {REGIONS.map((region) => (
                <div key={region.title}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{region.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-2xl font-bold text-nexus-blue-950">
                          {region.title}
                        </h3>
                        {region.highlight && (
                          <span className="rounded-full bg-nexus-orange-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
                            Forte demande
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {region.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {region.destinations.map((dest) => (
                      <div
                        key={dest.name}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                      >
                        <span className="text-2xl">{dest.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-nexus-blue-950">
                            {dest.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {dest.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-sm italic text-slate-500">
              Et plusieurs autres destinations selon votre projet — contactez-nous
              pour les pays non listés.
            </p>
          </div>
        </section>

        {/* ==================== POURQUOI NEXUS ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Pourquoi choisir Nexus RCA
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Une démarche compliquée devient simple
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Six raisons concrètes de nous confier votre dossier de visa.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POURQUOI_NEXUS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== TRANSPARENCE ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 shadow-xl sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
                    Transparence
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl md:text-4xl">
                    Une information honnête sur ce que nous pouvons garantir
                  </h2>

                  <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
                    <p>
                      <strong className="text-nexus-blue-950">
                        La décision finale appartient toujours aux autorités
                        consulaires.
                      </strong>{" "}
                      Aucune agence sérieuse ne peut garantir l'obtention d'un
                      visa, et nous ne le ferons jamais.
                    </p>
                    <p>Cependant, ce que Nexus RCA vous garantit, c'est :</p>
                  </div>

                  <ul className="mt-5 space-y-3">
                    <TransparenceItem>
                      Un dossier <strong>solide et complet</strong>, conforme aux
                      exigences du consulat
                    </TransparenceItem>
                    <TransparenceItem>
                      Une <strong>présentation optimisée</strong> qui valorise
                      votre profil
                    </TransparenceItem>
                    <TransparenceItem>
                      La <strong>réduction maximale</strong> des risques de refus
                      pour motifs évitables
                    </TransparenceItem>
                    <TransparenceItem>
                      Un <strong>conseil honnête</strong> sur vos chances
                      réelles avant tout engagement
                    </TransparenceItem>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== ENGAGEMENT (VISION) ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-50 via-white to-nexus-orange-50 py-20">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-nexus-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-nexus-blue-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre engagement
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Bien plus que des formulaires
              </h2>
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
              <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                Chaque dossier représente un projet de vie.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                Nous ne nous contentons pas de remplir des formulaires. Nous
                aidons des personnes à{" "}
                <strong className="text-nexus-blue-950">voyager</strong>,{" "}
                <strong className="text-nexus-blue-950">étudier</strong>,{" "}
                <strong className="text-nexus-blue-950">
                  développer leurs activités
                </strong>{" "}
                et{" "}
                <strong className="text-nexus-blue-950">
                  accéder à des opportunités à l'international
                </strong>
                .
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                C'est pourquoi nous traitons chaque dossier avec le sérieux
                qu'il mérite.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== CTA FINAL ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Vous souhaitez obtenir un visa sans complication ?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
              Déposez votre demande dès maintenant. Un conseiller Nexus vous
              accompagne immédiatement pour évaluer votre projet et préparer
              votre dossier.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/demande/complet?service=visa"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-nexus-blue-950 shadow-2xl transition hover:scale-105 hover:shadow-2xl"
              >
                Lancer ma demande de visa
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
              Étude gratuite · Conseil personnalisé · 100% confidentiel
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
function TransparenceItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-nexus-orange-500" />
      <span className="text-sm leading-relaxed text-slate-700 sm:text-base">
        {children}
      </span>
    </li>
  );
}
