import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceCTA } from "@/components/services/ServiceCTA";
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
  Search,
  ClipboardCheck,
  FileText,
  Plane,
  Eye,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Compass,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Bourses d'études Canada | Nexus RCA — Bangui",
  description:
    "Accompagnement stratégique pour étudier au Canada depuis Bangui. Choix de l'établissement, dossier optimisé, recherche d'aides financières, suivi visa. Étude gratuite du profil.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const PROBLEMES = [
  { icon: DollarSign, text: "Coût élevé des frais de scolarité (15 000 à 30 000 $ CAD/an)" },
  { icon: BookOpen, text: "Exigences académiques strictes selon le programme" },
  { icon: AlertCircle, text: "Information éparse, contradictoire ou périmée" },
  { icon: ClipboardCheck, text: "Démarches administratives longues (CAQ, permis d'études)" },
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
    title: "Collèges (Cégeps)",
    description:
      "Formations techniques et professionnelles, fortement orientées emploi.",
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
      "Réduction de 10 % à 50 % des frais, accordées par les établissements selon le profil.",
    pct: "10-50%",
  },
  {
    icon: TrendingUp,
    title: "Aides au mérite",
    description:
      "Versées après l'admission selon les résultats académiques et l'engagement.",
    pct: "Au mérite",
  },
  {
    icon: Sparkles,
    title: "Programmes ciblés",
    description:
      "Bourses de gouvernement, partenariats éducatifs, profils à fort potentiel.",
    pct: "Sur profil",
  },
];

const NEXUS_DIFFERENCE = [
  {
    num: "01",
    icon: Target,
    title: "Positionnement stratégique du dossier",
    description:
      "Pas un dossier standard. Nous construisons un profil cohérent qui valorise vos atouts et anticipe les questions du jury.",
  },
  {
    num: "02",
    icon: Compass,
    title: "Choix intelligent des établissements",
    description:
      "Tous ne donnent pas les mêmes chances. Nous orientons vers ceux où votre profil sera accepté et où l'aide financière est réellement possible.",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Optimisation globale",
    description:
      "Lettre de motivation, cohérence du projet, présentation académique. Le détail fait la différence entre une admission et un refus.",
  },
];

const ACCOMPAGNEMENT_ETAPES = [
  {
    icon: Search,
    title: "Analyse du profil",
    description:
      "Étude du parcours, des résultats et du projet. Bilan de faisabilité honnête.",
  },
  {
    icon: Compass,
    title: "Choix du programme",
    description:
      "Identification des programmes et établissements compatibles avec votre profil.",
  },
  {
    icon: FileText,
    title: "Préparation du dossier",
    description:
      "Lettre de motivation, pièces justificatives, traductions certifiées si besoin.",
  },
  {
    icon: Eye,
    title: "Suivi de l'admission",
    description:
      "Soumission, suivi actif, réponse aux demandes complémentaires de l'établissement.",
  },
  {
    icon: Plane,
    title: "Accompagnement visa",
    description:
      "Une fois admis : CAQ Québec ou attestation provinciale + permis d'études IRCC.",
  },
];

const PROFIL_REQUIS = [
  {
    icon: GraduationCap,
    title: "Niveau académique sérieux",
    description:
      "Résultats scolaires solides qui démontrent votre capacité à suivre un cursus exigeant.",
  },
  {
    icon: Lightbulb,
    title: "Projet d'études clair",
    description:
      "Vision précise du programme visé et de la suite logique dans votre parcours.",
  },
  {
    icon: Target,
    title: "Motivation réelle",
    description:
      "L'engagement nécessaire pour réussir un projet d'études à l'étranger sur 2 à 5 ans.",
  },
  {
    icon: TrendingUp,
    title: "Capacité d'adaptation",
    description:
      "La maturité pour évoluer dans un système éducatif et un climat différents.",
  },
];

const STATS = [
  { value: "3", label: "Types d'établissements" },
  { value: "CAQ + permis", label: "Visa étude inclus" },
  { value: "Yaoundé", label: "Biométrie Canada" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function BoursesPage() {
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
                <GraduationCap className="h-3.5 w-3.5" />
                Études au Canada
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                Étudier au Canada,{" "}
                <span className="text-gradient-orange">depuis Bangui</span>, avec
                un accompagnement structuré
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Choix de l'établissement, dossier optimisé, recherche d'aides
                financières, suivi CAQ et permis d'études. Étude gratuite du
                profil avant tout engagement.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=bourses"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  Déposer ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#accompagnement"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Voir notre méthode
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Étude gratuite · Conseil honnête · Suivi jusqu'au visa
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
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Le constat</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Étudier au Canada : une opportunité, pas une évidence
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                L'accès reste limité par des obstacles concrets qu'il faut
                anticiper avant de déposer.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {PROBLEMES.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-line bg-surface-sunken p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-body-sm font-semibold text-ink">
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-brand bg-brand-subtle/40 px-6 py-6 shadow-elev-1 sm:px-8 sm:py-8">
              <p className="font-display text-headline text-ink sm:text-display-sm">
                Nexus RCA ne se contente pas de vous informer.
              </p>
              <p className="mt-3 text-body text-ink-muted">
                Nous{" "}
                <strong className="text-ink">structurons votre projet</strong>{" "}
                et vous{" "}
                <strong className="text-ink">positionnons</strong> pour maximiser
                vos chances d'admission et d'aides financières.
              </p>
            </div>
          </div>
        </section>

        {/* SYSTÈME ÉDUCATIF ──────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">
                Le système éducatif canadien
              </p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Trois types d'établissements, trois logiques différentes
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Chaque type a ses critères d'admission et ses possibilités
                d'aides. Nous orientons selon votre profil.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {ETABLISSEMENTS.map((etab) => {
                const Icon = etab.icon;
                return (
                  <div
                    key={etab.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {etab.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {etab.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                      <Building2 className="h-3.5 w-3.5" />
                      {etab.duree}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coût moyen */}
            <div className="mt-10 rounded-3xl border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-surface-elevated to-orange-50 p-8 shadow-elev-3 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5 sm:p-10">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-amber-700 dark:text-amber-300">
                    Coût moyen des études
                  </p>
                  <p className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    15 000 à 30 000 $ CAD par an
                  </p>
                  <p className="mt-2 text-body text-ink-muted">
                    Soit environ <strong className="text-ink">7 à 14 millions FCFA/an</strong>{" "}
                    selon le programme et la province. C'est pourquoi les
                    bourses et aides financières sont essentielles dans tout
                    projet d'études au Canada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOURSES & AIDES ──────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Aides financières</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce qu'il faut savoir, sans illusions
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Les bourses 100 % sont rares. La majorité des étudiants accèdent
                à des aides partielles, qui restent significatives.
              </p>
            </div>

            {/* Alerte réaliste */}
            <div className="mt-10 flex items-start gap-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-500/10 sm:p-6">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-title text-amber-900 dark:text-amber-200">
                  À retenir avant de continuer
                </p>
                <p className="mt-1 text-body-sm text-amber-800 dark:text-amber-300">
                  Les bourses 100 % (frais + vie courante) sont exceptionnelles
                  et hyper-compétitives. La plupart des étudiants obtiennent des
                  bourses partielles ou cumulent plusieurs aides pour réduire le
                  coût total.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TYPES_AIDES.map((aide) => {
                const Icon = aide.icon;
                return (
                  <div
                    key={aide.title}
                    className="flex flex-col rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-nexus-blue-100 px-3 py-1 text-overline text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {aide.pct}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {aide.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {aide.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CE QUE NEXUS FAIT ────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-nexus-orange-400">
                Notre valeur ajoutée
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Ce que Nexus RCA fait{" "}
                <span className="text-nexus-orange-400">concrètement</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-body-lg text-slate-300">
                Trois leviers stratégiques que peu d'agences maîtrisent.
              </p>
            </div>

            <div className="mt-12 space-y-5">
              {NEXUS_DIFFERENCE.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-display text-display-sm text-nexus-orange-400">
                        {item.num}
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-headline text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-body-sm text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TRANSPARENCE ─────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-surface-elevated to-orange-50 p-8 shadow-elev-3 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5 sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-elev-2">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-amber-700 dark:text-amber-300">
                    Transparence totale
                  </p>
                  <h2 className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    Aucune agence sérieuse ne peut garantir une bourse
                  </h2>

                  <p className="mt-6 text-body text-ink-muted">
                    <strong className="text-ink">
                      Nous préférons être honnêtes.
                    </strong>{" "}
                    La décision finale appartient toujours aux établissements.
                    Ce qui se joue, c'est la qualité du dossier et la stratégie
                    d'établissement.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/5">
                      <p className="text-overline text-rose-700 dark:text-rose-300">
                        Ce que nous ne pouvons pas
                      </p>
                      <ul className="mt-3 space-y-2 text-body-sm text-rose-900 dark:text-rose-200">
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

                    <div className="rounded-2xl border-2 border-brand/40 bg-brand-subtle/40 p-5">
                      <p className="text-overline text-nexus-orange-700 dark:text-brand">
                        Ce que nous garantissons
                      </p>
                      <ul className="mt-3 space-y-2 text-body-sm text-ink">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span>Un dossier solide et compétitif</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span>Une stratégie d'établissement adaptée</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span>Vos chances maximisées</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="mt-6 text-body font-semibold text-ink sm:text-body-lg">
                    Bon dossier = chances fortement augmentées.
                    <br />
                    Mauvaise préparation = refus quasi certain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACCOMPAGNEMENT ───────────────────────────────────────── */}
        <section id="accompagnement" className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre méthode</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Cinq étapes, du diagnostic au visa
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Un processus clair, sans surprise. Vous savez à tout moment où
                vous en êtes.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-5">
              {ACCOMPAGNEMENT_ETAPES.map((etape, idx) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.title}
                    className="relative rounded-3xl border border-line bg-surface-elevated p-5 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="absolute -top-3 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white shadow-elev-2">
                      {idx + 1}
                    </div>
                    <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-title text-ink">
                      {etape.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {etape.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROFIL REQUIS ────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Profil requis</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce programme est fait pour vous si...
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
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

        {/* CTA FINAL ─────────────────────────────────────────────── */}
        <ServiceCTA
          title="Prêt à lancer votre projet d'études au Canada ?"
          subtitle="Étude gratuite du profil, conseil honnête, accompagnement jusqu'au visa. Un conseiller Nexus vous répond aujourd'hui sur WhatsApp."
          ctaLabel="Déposer ma demande"
          ctaHref="/demande/complet?service=bourses"
          whatsappMessage="Bonjour Nexus, je souhaite démarrer un projet d'études au Canada."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
