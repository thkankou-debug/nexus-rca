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
  XCircle,
  Wallet,
  Calendar,
  MessageCircle,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Études au Canada | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos études au Canada. Nous étudions chaque dossier avec rigueur avant d'accepter de l'accompagner. Méthode en quatre étapes du diagnostic au permis d'études.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const RISQUES = [
  {
    icon: XCircle,
    title: "Refus d'admission",
    text: "Un dossier mal positionné ou un programme inadapté à votre profil entraîne un refus sec — sans possibilité de retravailler la candidature.",
  },
  {
    icon: Wallet,
    title: "Aides financières manquées",
    text: "Sans connaître les bonnes démarches, beaucoup d'étudiants passent à côté de bourses partielles auxquelles ils étaient pourtant éligibles.",
  },
  {
    icon: TrendingUp,
    title: "Coût total mal anticipé",
    text: "15 000 à 30 000 $ CAD/an, soit 7 à 14 millions FCFA. Sans planification, le projet s'arrête à mi-parcours faute de ressources.",
  },
  {
    icon: BookOpen,
    title: "Visa refusé après l'admission",
    text: "Une admission en main ne suffit pas. CAQ, permis d'études, justificatifs : un visa étudiant refusé annule tout le travail effectué.",
  },
];

const GAINS = [
  {
    icon: Target,
    title: "Choix d'établissement adapté à votre profil",
    text: "Tous les établissements ne donnent pas les mêmes chances. Nous vous orientons vers ceux où votre dossier sera reçu et où les aides sont accessibles.",
  },
  {
    icon: ClipboardCheck,
    title: "Dossier d'admission optimisé",
    text: "Lettre de motivation, cohérence du projet, présentation académique : chaque pièce est travaillée pour valoriser votre candidature.",
  },
  {
    icon: Award,
    title: "Aides financières identifiées",
    text: "Bourses partielles d'établissement, programmes au mérite, aides ciblées : nous documentons les options disponibles selon votre profil.",
  },
  {
    icon: Briefcase,
    title: "Un conseiller dédié à votre projet",
    text: "Le même interlocuteur du diagnostic à l'arrivée au Canada. Pas besoin de raconter votre situation à plusieurs personnes.",
  },
  {
    icon: Plane,
    title: "Visa étudiant pris en charge",
    text: "Une fois l'admission obtenue : CAQ ou attestation provinciale, permis d'études IRCC, biométrie à Yaoundé. Tout est piloté par Nexus.",
  },
  {
    icon: Sparkles,
    title: "Conseil honnête sur la faisabilité",
    text: "Si votre profil ne se prête pas au programme visé, nous vous le disons franchement et proposons une alternative réaliste.",
  },
];

const PROCESSUS = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons votre parcours académique, votre projet et votre calendrier cible.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse professionnelle",
    description:
      "Un conseiller Nexus étudie votre profil, identifie les programmes et établissements compatibles, et évalue vos chances réelles. Bilan de faisabilité honnête avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Montage complet du dossier d'admission : lettre de motivation, CV académique, traductions certifiées, recherche d'aides financières, soumission aux établissements ciblés.",
  },
  {
    num: "04",
    icon: Plane,
    title: "Suivi jusqu'au résultat",
    description:
      "Suivi actif des admissions, réponses aux demandes complémentaires, puis prise en charge du visa étudiant : CAQ Québec ou attestation provinciale, permis d'études IRCC, biométrie.",
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
  { value: "Étude", label: "Initiale gratuite" },
  { value: "CAQ + permis", label: "Visa étudiant inclus" },
  { value: "Yaoundé", label: "Biométrie organisée" },
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
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                pour vos études au Canada.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous étudions chaque dossier avec rigueur avant d'accepter de
                l'accompagner. Si votre profil correspond, nous le construisons
                selon les standards exigés par les établissements canadiens et
                menons votre projet jusqu'à l'obtention du permis d'études.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=bourses"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=bourses"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Étude initiale gratuite · Bilan de faisabilité honnête ·
                Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Bourses Canada avant de soumettre ma demande."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  contactez-nous sur WhatsApp
                </a>
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

        {/* LES ENJEUX ────────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-rose-600 dark:text-rose-400">
                Les enjeux
              </p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pourquoi un projet d'études bien préparé est essentiel
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Étudier au Canada est une opportunité majeure, mais l'accès
                reste limité par quatre obstacles concrets — chacun à un coût
                réel pour votre avenir.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {RISQUES.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.title}
                    className="flex items-start gap-4 rounded-3xl border border-rose-200/60 bg-rose-50/40 p-6 dark:border-rose-500/20 dark:bg-rose-500/5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-headline text-ink">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-body-sm text-ink-muted">
                        {r.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-brand bg-brand-subtle/40 px-6 py-6 shadow-elev-1 sm:px-8 sm:py-8">
              <p className="font-display text-headline text-ink sm:text-display-sm">
                Un projet bien structuré protège votre investissement.
              </p>
              <p className="mt-3 text-body text-ink-muted">
                Nos clients confient leur projet à Nexus RCA pour{" "}
                <strong className="text-ink">
                  maximiser leurs chances d'admission
                </strong>
                ,{" "}
                <strong className="text-ink">
                  identifier les aides financières disponibles
                </strong>{" "}
                et{" "}
                <strong className="text-ink">
                  sécuriser le visa étudiant après l'admission
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CE QUE VOUS GAGNEZ ────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">
                Ce que vous gagnez avec Nexus RCA
              </p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Six bénéfices concrets pour votre projet d'études
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Pas de jargon. Pas de promesses creuses. Juste ce que vous
                obtenez quand vous nous confiez votre projet d'études au Canada.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {GAINS.map((g) => {
                const Icon = g.icon;
                return (
                  <div
                    key={g.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {g.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">{g.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROCESSUS CLIENT ──────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre processus</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Un parcours client clair, en quatre étapes
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Du diagnostic initial jusqu'à votre arrivée au Canada, chaque
                étape est documentée et communiquée.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {PROCESSUS.map((etape) => {
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

            {/* CTA en sortie de processus */}
            <div className="mt-10 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-overline text-brand">Prêt à démarrer ?</p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    Lancez votre projet d'études dès aujourd'hui.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Étude initiale gratuite, bilan de faisabilité honnête avant
                    tout engagement.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/demande/complet?service=bourses"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Lancer mon dossier
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=bourses"
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
                d'aides financières. Nexus RCA vous oriente selon votre profil.
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
                    Soit environ{" "}
                    <strong className="text-ink">
                      7 à 14 millions FCFA/an
                    </strong>{" "}
                    selon le programme et la province. Les bourses et aides
                    financières sont essentielles dans tout projet d'études au
                    Canada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AIDES FINANCIÈRES ────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Aides financières</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce qu'il faut savoir, sans illusions
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Les bourses 100 % sont rares. La majorité des étudiants
                accèdent à des aides partielles ou cumulent plusieurs
                financements.
              </p>
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-500/10 sm:p-6">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-title text-amber-900 dark:text-amber-200">
                  À retenir avant de continuer
                </p>
                <p className="mt-1 text-body-sm text-amber-800 dark:text-amber-300">
                  Les bourses 100 % (frais + vie courante) sont exceptionnelles
                  et hyper-compétitives. La plupart des étudiants obtiennent
                  des bourses partielles ou cumulent plusieurs aides pour
                  réduire le coût total.
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

        {/* PROFIL REQUIS ────────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Profil requis</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce programme est fait pour vous si...
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nexus RCA travaille avec des candidats sérieux, motivés et
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

        {/* TRANSPARENCE ──────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-surface-elevated to-orange-50 p-8 shadow-elev-3 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5 sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-elev-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-amber-700 dark:text-amber-300">
                    Engagement de transparence
                  </p>
                  <h2 className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    Aucune agence sérieuse ne peut garantir une bourse
                  </h2>

                  <p className="mt-6 text-body text-ink-muted">
                    <strong className="text-ink">
                      La décision finale appartient toujours aux établissements.
                    </strong>{" "}
                    Toute agence qui vous promet une bourse ou une admission
                    vous trompe. Nexus RCA ne le fera jamais.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/5">
                      <p className="text-overline text-rose-700 dark:text-rose-300">
                        Ce que nous ne pouvons pas
                      </p>
                      <ul className="mt-3 space-y-2 text-body-sm text-rose-900 dark:text-rose-200">
                        <li className="flex items-start gap-2">
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>Garantir une bourse</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>Influencer la décision finale</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
                          <span>Vos chances réellement maximisées</span>
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

        {/* CTA FINAL — formel, agence-grade ──────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-nexus-orange-300">
                Démarrer votre projet
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Lancez votre projet d'études au Canada dès aujourd'hui.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Les calendriers d'admission canadiens demandent une préparation
                anticipée — souvent 6 à 12 mois avant la rentrée. Soumettez
                votre demande maintenant pour sécuriser votre rentrée.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Étude
                  <br />
                  <span className="text-white">Gratuite</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Bilan
                  <br />
                  <span className="text-white">Honnête</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Visa
                  <br />
                  <span className="text-white">Inclus</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=bourses"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=bourses"
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
                    "Bonjour Nexus, j'ai une question sur le service Bourses Canada avant de soumettre ma demande."
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
