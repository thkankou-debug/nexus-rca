import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  GraduationCap,
  School,
  Building2,
  Wrench,
  DollarSign,
  Award,
  Target,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Heart,
  Search,
  ClipboardCheck,
  FileText,
  Plane,
  Eye,
  Sparkles,
  TrendingUp,
  Users,
  Lightbulb,
  Compass,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Bourses d'études Canada | Nexus RCA",
  description:
    "Accompagnement stratégique pour étudier au Canada. Préparation du dossier, choix de l'établissement, optimisation des chances de bourse. Approche réaliste et professionnelle par Nexus RCA.",
};

// ============================================================================
// DONNEES
// ============================================================================
const PROBLEMES = [
  {
    icon: DollarSign,
    text: "Coût élevé des frais de scolarité",
  },
  {
    icon: BookOpen,
    text: "Exigences académiques strictes",
  },
  {
    icon: AlertCircle,
    text: "Manque d'information fiable et à jour",
  },
  {
    icon: ClipboardCheck,
    text: "Démarches administratives complexes",
  },
];

interface EtablissementType {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  duree: string;
}

const ETABLISSEMENTS: EtablissementType[] = [
  {
    icon: School,
    title: "Collèges",
    description:
      "Formations techniques et professionnelles, orientées emploi.",
    duree: "1 à 3 ans",
  },
  {
    icon: Building2,
    title: "Universités",
    description: "Licences, masters et doctorats dans tous les domaines.",
    duree: "3 à 5 ans",
  },
  {
    icon: Wrench,
    title: "Instituts spécialisés",
    description: "Formations techniques de pointe et métiers spécifiques.",
    duree: "Variable",
  },
];

const TYPES_AIDES = [
  {
    icon: Award,
    title: "Bourses partielles",
    description:
      "Réduction de 10 % à 50 % des frais de scolarité, accordées par les établissements.",
    pct: "10-50%",
  },
  {
    icon: TrendingUp,
    title: "Aides internes aux écoles",
    description:
      "Basées sur les résultats scolaires, accordées après l'admission selon le mérite.",
    pct: "Au mérite",
  },
  {
    icon: Sparkles,
    title: "Opportunités ciblées",
    description:
      "Programmes spécifiques, partenariats éducatifs, profils à fort potentiel.",
    pct: "Sur profil",
  },
];

const NEXUS_DIFFERENCE = [
  {
    num: "01",
    icon: Target,
    title: "Positionnement stratégique du dossier",
    description:
      "Nous ne soumettons pas un dossier standard. Nous construisons un profil cohérent et stratégique qui valorise vos atouts et masque les points faibles.",
  },
  {
    num: "02",
    icon: Compass,
    title: "Choix intelligent des établissements",
    description:
      "Tous les établissements ne donnent pas les mêmes chances. Nous orientons vers ceux où votre profil sera accepté et où les aides financières sont réellement possibles.",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Optimisation globale du dossier",
    description:
      "Lettre de motivation, cohérence du projet d'études, présentation académique. Chaque détail compte. C'est ce qui fait la différence entre une admission et un refus.",
  },
];

const ACCOMPAGNEMENT_ETAPES = [
  {
    icon: Search,
    title: "Analyse du profil",
    description:
      "Étude approfondie de votre parcours académique, vos résultats et votre projet.",
  },
  {
    icon: Compass,
    title: "Choix du programme",
    description:
      "Identification des programmes et établissements adaptés à votre profil.",
  },
  {
    icon: FileText,
    title: "Préparation du dossier",
    description:
      "Rédaction de la lettre de motivation, optimisation des pièces justificatives.",
  },
  {
    icon: Eye,
    title: "Suivi de l'admission",
    description:
      "Soumission du dossier, suivi actif jusqu'à la réponse de l'établissement.",
  },
  {
    icon: Plane,
    title: "Accompagnement visa",
    description:
      "Une fois admis, accompagnement complet pour le CAQ et le permis d'études.",
  },
];

const PROFIL_REQUIS = [
  {
    icon: GraduationCap,
    title: "Niveau académique sérieux",
    description:
      "Des résultats scolaires solides qui démontrent votre capacité à suivre un cursus universitaire.",
  },
  {
    icon: Lightbulb,
    title: "Projet d'études clair",
    description:
      "Une vision précise du programme visé et de la suite logique dans votre parcours.",
  },
  {
    icon: Target,
    title: "Motivation réelle",
    description:
      "L'engagement et la détermination nécessaires pour réussir un projet d'études à l'étranger.",
  },
  {
    icon: TrendingUp,
    title: "Capacité d'adaptation",
    description:
      "La maturité pour suivre un programme dans un système éducatif différent du système local.",
  },
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export default function BoursesPage() {
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
                <GraduationCap className="h-4 w-4 text-nexus-orange-400" />
                Bourses d'études — Canada
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
                Préparez votre projet d'études avec un{" "}
                <span className="text-gradient-orange">
                  accompagnement structuré
                </span>{" "}
                et professionnel
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
                Nexus RCA vous accompagne dans votre projet d'études au Canada.
                Choix de l'établissement, préparation du dossier, optimisation
                des chances d'admission et d'aide financière.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=bourses"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-nexus-orange-500/40 transition hover:scale-105 hover:bg-nexus-orange-600"
                >
                  Déposer ma demande
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#accompagnement"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Voir notre accompagnement
                </Link>
              </div>

              <p className="mt-5 text-sm text-white/60">
                Étude gratuite du profil · Conseil honnête · Suivi jusqu'au visa
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
                Étudier au Canada : une opportunité, mais pas une évidence
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Étudier au Canada représente une opportunité majeure, mais
                l'accès reste limité par plusieurs obstacles concrets.
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
                Chez Nexus RCA, nous ne nous contentons pas de vous informer.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                Nous{" "}
                <strong className="text-nexus-blue-950">
                  structurons votre projet
                </strong>{" "}
                et vous{" "}
                <strong className="text-nexus-blue-950">
                  positionnons pour maximiser
                </strong>{" "}
                vos chances d'admission et d'accès aux aides financières
                disponibles.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== ÉTUDIER AU CANADA ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Le système éducatif canadien
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Comprendre les études au Canada
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Trois types d'établissements, des durées variables, et un
                investissement financier important à anticiper.
              </p>
            </div>

            {/* Types d etablissements */}
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {ETABLISSEMENTS.map((etab) => {
                const Icon = etab.icon;
                return (
                  <div
                    key={etab.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-nexus-blue-950">
                      {etab.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {etab.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
                      <Building2 className="h-3.5 w-3.5" />
                      {etab.duree}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cout moyen */}
            <div className="mt-10 rounded-3xl border-2 border-nexus-orange-200 bg-gradient-to-br from-nexus-orange-50 via-white to-nexus-blue-50 p-8 shadow-xl sm:p-10">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-700">
                    Coût moyen des études
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl md:text-4xl">
                    15 000 $ à 30 000 $ CAD par an
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                    Selon le programme, l'établissement et la province. C'est
                    pour cette raison que les bourses et aides financières sont
                    essentielles dans la construction d'un projet d'études au
                    Canada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== BOURSES ET AIDES ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Bourses et aides financières
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Ce qu'il faut savoir, sans illusions
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Soyons honnêtes : les bourses complètes sont rares. La majorité
                des étudiants accèdent à des aides partielles, qui restent
                significatives.
              </p>
            </div>

            {/* Alerte realiste */}
            <div className="mt-10 flex items-start gap-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 sm:p-6">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">
                  À retenir avant de continuer
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800 sm:text-base">
                  Les bourses 100% (couvrant la totalité des frais) sont
                  exceptionnelles et très compétitives. La plupart des étudiants
                  obtiennent des bourses partielles ou des aides cumulées qui
                  réduisent fortement le coût total.
                </p>
              </div>
            </div>

            {/* 3 types d aides */}
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TYPES_AIDES.map((aide) => {
                const Icon = aide.icon;
                return (
                  <div
                    key={aide.title}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-nexus-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-nexus-blue-700">
                        {aide.pct}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-nexus-blue-950">
                      {aide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {aide.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== CE QUE NEXUS FAIT (DIFFÉRENCIATION) ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-400">
                Notre valeur ajoutée
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                Ce que Nexus RCA fait{" "}
                <span className="text-nexus-orange-400">concrètement</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
                Nous faisons la différence sur trois leviers stratégiques que
                peu d'agences maîtrisent.
              </p>
            </div>

            <div className="mt-12 space-y-5">
              {NEXUS_DIFFERENCE.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-display text-4xl font-bold text-nexus-orange-400">
                        {item.num}
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
                        {item.description}
                      </p>
                    </div>
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
                    Transparence totale
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl md:text-4xl">
                    Aucune agence sérieuse ne peut garantir une bourse
                  </h2>

                  <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
                    <p>
                      <strong className="text-nexus-blue-950">
                        Nous préférons être honnêtes.
                      </strong>{" "}
                      Aucune structure, peu importe ce qu'elle prétend, ne peut
                      vous garantir l'obtention d'une bourse. Les décisions
                      finales appartiennent toujours aux établissements.
                    </p>
                  </div>

                  {/* 2 colonnes : ce qu on ne peut pas / ce qu on peut */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                        Ce que nous ne pouvons pas
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-red-900">
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5">×</span>
                          <span>Garantir une bourse</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5">×</span>
                          <span>Influencer la décision finale</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5">×</span>
                          <span>Promettre une admission certaine</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border-2 border-nexus-orange-300 bg-nexus-orange-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
                        Ce que nous garantissons
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-nexus-blue-950">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600" />
                          <span>Un dossier solide et compétitif</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600" />
                          <span>Une stratégie d'établissement adaptée</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600" />
                          <span>Des chances maximisées</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="mt-6 text-base font-semibold leading-relaxed text-nexus-blue-950 sm:text-lg">
                    Un bon dossier = chances fortement augmentées.
                    <br />
                    Une mauvaise préparation = refus quasi certain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== ACCOMPAGNEMENT ==================== */}
        <section id="accompagnement" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre accompagnement
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Cinq étapes, un accompagnement complet
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Du premier diagnostic jusqu'à votre arrivée au Canada, nous
                sommes à vos côtés.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-5">
              {ACCOMPAGNEMENT_ETAPES.map((etape, idx) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.title}
                    className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="absolute -top-3 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-nexus-orange-500 font-display text-sm font-bold text-white shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-nexus-blue-950">
                      {etape.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {etape.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== PROFIL REQUIS ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Profil requis
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Ce programme est fait pour vous si...
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Nous travaillons avec des candidats sérieux, motivés et
                conscients des exigences d'un projet d'études à l'étranger.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {PROFIL_REQUIS.map((item) => {
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
                Au-delà des études, un investissement humain
              </h2>
            </div>

            <div className="mt-10 space-y-6 text-base leading-relaxed text-slate-700 sm:text-lg">
              <p>
                Chez Nexus RCA, ce service va au-delà de la simple admission
                universitaire. Nous croyons que{" "}
                <strong className="text-nexus-blue-950">
                  former une nouvelle génération
                </strong>{" "}
                d'étudiants centrafricains est un acte de développement
                national.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <VisionCard
                  icon={Users}
                  title="Aider les jeunes"
                  description="Soutenir les talents centrafricains dans leur projet international."
                />
                <VisionCard
                  icon={Sparkles}
                  title="Créer des opportunités"
                  description="Donner accès à un avenir académique et professionnel ambitieux."
                />
                <VisionCard
                  icon={TrendingUp}
                  title="Contribuer au développement"
                  description="Former les compétences qui feront la RCA de demain."
                />
              </div>

              <div className="rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
                <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                  Chaque étudiant accompagné devient une compétence pour demain
                  et un acteur du changement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CTA FINAL ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Vous souhaitez étudier au Canada avec un accompagnement sérieux ?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
              Déposez votre dossier dès maintenant. Nous analysons votre profil
              en profondeur et vous orientons vers les meilleures options
              adaptées à votre situation.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/demande/complet?service=bourses"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-nexus-blue-950 shadow-2xl transition hover:scale-105 hover:shadow-2xl"
              >
                Déposer ma demande
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
              Étude gratuite du profil · Conseil honnête · Accompagnement
              jusqu'au visa
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
// SOUS-COMPOSANT
// ============================================================================
function VisionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-display text-base font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}
