import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Languages,
  Headphones,
  Mic,
  BookOpen,
  PenLine,
  Target,
  CheckCircle2,
  ArrowRight,
  Search,
  ClipboardCheck,
  FileText,
  Calendar,
  MessageCircle,
  XCircle,
  Wallet,
  Check,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Préparation TCF Canada | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour préparer le TCF Canada. Diagnostic linguistique honnête, plan d'entraînement personnalisé, simulations dans les conditions du test. Inscription officielle au centre agréé.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous avez besoin d'un score TCF Canada pour un projet d'immigration, d'études ou de travail au Canada francophone",
    "Vous êtes prêt(e) à vous entraîner régulièrement (plusieurs sessions par semaine pendant 4 à 16 semaines)",
    "Vous acceptez de passer un test de positionnement initial pour construire un plan d'entraînement réaliste",
  ],
  non: [
    "Vous voulez une certification de complaisance sans test réel — ce n'est pas notre cabinet",
    "Vous cherchez un score garanti — aucun préparateur sérieux ne peut le promettre",
    "Votre niveau de français est insuffisant pour viser un score utile dans un délai raisonnable et vous refusez la mise à niveau préalable",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons votre niveau de français déclaré, votre projet d'immigration et votre calendrier cible.",
  },
  {
    num: "02",
    icon: Search,
    title: "Test de positionnement & analyse",
    description:
      "Un coach Nexus mesure votre niveau réel sur les quatre épreuves et compare au score visé. Bilan honnête écrit avant tout engagement, avec proposition de plan adapté.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Cours, exercices ciblés par épreuve, méthodologie de gestion du temps, coaching individuel sur l'expression orale, simulations dans les conditions réelles du test.",
  },
  {
    num: "04",
    icon: GraduationCap,
    title: "Inscription & suivi jusqu'au test",
    description:
      "Inscription officielle au centre agréé, briefing avant le jour J, debriefing après le test. Si le score n'est pas suffisant, nous reprenons le plan ensemble.",
  },
];

interface EpreuveType {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  duree: string;
}

const EPREUVES: EpreuveType[] = [
  {
    icon: Headphones,
    title: "Compréhension orale",
    description:
      "QCM sur dialogues, annonces et conversations. Travail de l'oreille et des stratégies d'écoute ciblée.",
    duree: "39 questions · 35 min",
  },
  {
    icon: BookOpen,
    title: "Compréhension écrite",
    description:
      "QCM sur courriels, articles, textes informatifs. Lecture rapide, repérage et inférence.",
    duree: "39 questions · 60 min",
  },
  {
    icon: PenLine,
    title: "Expression écrite",
    description:
      "Trois tâches rédactionnelles (message, article, argumentation). Travail de structure et de précision.",
    duree: "3 tâches · 60 min",
  },
  {
    icon: Mic,
    title: "Expression orale",
    description:
      "Trois tâches face à un examinateur (entretien, présentation, argumentation). Le point faible le plus fréquent.",
    duree: "3 tâches · 12 min",
  },
];

const NIVEAUX_VISES = [
  {
    nclc: "NCLC 4–6",
    cefr: "B1",
    usage: "Seuil minimum pour certains permis de travail et programmes provinciaux.",
  },
  {
    nclc: "NCLC 7",
    cefr: "B2",
    usage:
      "Seuil clé pour Entrée express : maximisation des points liés à la langue française.",
    pivot: true,
  },
  {
    nclc: "NCLC 9–10",
    cefr: "C1",
    usage:
      "Bonus de points significatif pour profils francophones avancés (PEQ Québec, Mobilité francophone).",
  },
];

const STATS = [
  { value: "Test", label: "Positionnement gratuit" },
  { value: "4 épreuves", label: "Travaillées séparément" },
  { value: "Bilan", label: "Honnête écrit" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function TcfPage() {
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
                <Languages className="h-3.5 w-3.5" />
                Service TCF Canada
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                pour préparer le TCF Canada.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous mesurons d'abord votre niveau réel et vous disons
                honnêtement le score atteignable dans votre délai. Si votre
                profil correspond à nos critères, nous construisons un plan
                d'entraînement adapté aux quatre épreuves jusqu'au passage
                officiel.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/tcf/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=tcf"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Test de positionnement gratuit · Bilan honnête écrit · Une
                question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur la préparation TCF Canada avant de soumettre ma demande."
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
                Nous n'inscrivons pas tous les candidats. Cette transparence
                fait partie de notre engagement professionnel.
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
                Du test de positionnement initial jusqu'au passage officiel,
                chaque étape est documentée et communiquée.
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
                    Soumettez votre demande de préparation TCF.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Test de positionnement gratuit. Bilan honnête écrit.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/tcf/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=tcf"
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

        {/* 4. LES 4 ÉPREUVES ───────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">
                Le test, en quatre épreuves
              </p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quatre compétences, quatre stratégies
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Chaque épreuve a sa logique. Bien parler français ne suffit
                pas — il faut aussi maîtriser le format du test, la grille
                d'évaluation et les pièges récurrents.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {EPREUVES.map((ep) => {
                const Icon = ep.icon;
                return (
                  <div
                    key={ep.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {ep.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {ep.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                      {ep.duree}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. SCORES & NIVEAUX CIBLES ───────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Niveaux & scores</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quel score viser, et pour quel projet
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Le score utile dépend de votre projet. Notre coach définit
                avec vous l'objectif réaliste après le test de positionnement.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {NIVEAUX_VISES.map((n) => (
                <div
                  key={n.nclc}
                  className={
                    n.pivot
                      ? "rounded-3xl border-2 border-brand bg-brand-subtle/50 p-6 shadow-elev-3"
                      : "rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-overline text-brand">{n.nclc}</p>
                      <p className="mt-1 font-display text-display-sm text-ink">
                        {n.cefr}
                      </p>
                    </div>
                    {n.pivot && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-overline text-white">
                        <TrendingUp className="h-3 w-3" />
                        Pivot
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-body-sm text-ink-muted">{n.usage}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-line bg-surface-elevated p-5 text-body-sm text-ink-muted sm:p-6">
              <p>
                <strong className="text-ink">À noter.</strong> Les seuils
                exacts varient selon le programme (Entrée express, PEQ
                Québec, Mobilité francophone, admission universitaire). Le
                conseiller Nexus précise le score exact à viser après l'étude
                de votre projet.
              </p>
            </div>
          </div>
        </section>

        {/* 6. POURQUOI NEXUS ────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Méthode pédagogique</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Nous travaillons le score, pas la conversation
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display text-headline text-ink">
                  Grille d'évaluation maîtrisée
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Nos coachs connaissent la grille exacte du TCF, ce que
                  l'examinateur cherche, ce qu'il pénalise. La performance
                  vient de cette connaissance — pas du seul niveau de langue.
                </p>
              </div>
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <Mic className="h-5 w-5" />
                </div>
                <h3 className="font-display text-headline text-ink">
                  Coaching individuel sur l'oral
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  L'expression orale est le point faible le plus fréquent. Nous
                  y consacrons un coaching individuel sérieux : argumentation
                  structurée, gestion du stress, articulation.
                </p>
              </div>
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-headline text-ink">
                  Simulations dans les conditions réelles
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Tests blancs au format exact, durée réelle, type de consignes
                  identique. Corrections détaillées. Beaucoup de candidats
                  gagnent un niveau complet entre le test blanc d'entrée et le
                  test officiel.
                </p>
              </div>
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-display text-headline text-ink">
                  Progression mesurée
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Test de positionnement initial, mi-parcours, et test blanc
                  final. Vous savez précisément où vous en êtes avant de payer
                  l'inscription officielle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT DE TRANSPARENCE ────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Engagement</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Aucun préparateur sérieux ne peut garantir un score
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Le score final dépend de votre travail et de votre performance
                le jour J. Toute structure qui vous promet un score précis vous
                trompe. Nexus RCA ne le fera jamais.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Garantir un score précis",
                    "Influencer le résultat ou l'examinateur",
                    "Faire progresser un candidat qui ne s'entraîne pas",
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
                    "Un diagnostic linguistique honnête avant tout engagement",
                    "Un plan d'entraînement construit sur vos points faibles réels",
                    "Des simulations conformes au format officiel du TCF",
                    "Un conseil franc sur la faisabilité de votre score cible dans votre délai",
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
                Vous savez ce que ça coûte avant de signer. Aucun frais caché.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Test de positionnement
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit, sans engagement. Bilan écrit avec score estimé
                  actuel et score atteignable.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Préparation Nexus
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Devis fixe communiqué après le test. Format groupe ou
                  individuel, durée selon écart à combler. Aucune facturation
                  surprise.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Inscription officielle
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Frais d'inscription au centre agréé en supplément, montant
                  détaillé à l'avance et reversé directement au centre.
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
                Lancer la préparation
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Mesurons votre niveau réel et fixons un objectif honnête.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Plus vous commencez tôt, meilleur sera le score. Soumettez
                votre demande pour un test de positionnement gratuit et un
                bilan clair sous 48 heures ouvrées.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Test
                  <br />
                  <span className="text-white">Gratuit</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Bilan
                  <br />
                  <span className="text-white">Honnête</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Inscription
                  <br />
                  <span className="text-white">Gérée</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/tcf/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=tcf"
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
                    "Bonjour Nexus, j'ai une question sur la préparation TCF Canada avant de soumettre ma demande."
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
