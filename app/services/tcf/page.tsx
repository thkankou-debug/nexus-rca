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
  ShieldCheck,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Préparation TCF Canada | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour préparer le TCF Canada. Diagnostic linguistique honnête, plan d'entraînement personnalisé, simulations dans les conditions du test. Inscription officielle au centre agréé.",
};

// ─── Patterns dot grid ──────────────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_LIGHT: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.05) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_LIGHT_SUBTLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
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
        {/* 1. HERO Premium tech ────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-28 pb-20 text-white sm:pt-32 lg:pt-40 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/40 hover:bg-white/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                <Languages className="h-3 w-3" />
                Service TCF Canada
              </span>

              <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    Préparation ciblée
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                au TCF Canada avec optimisation du score requis.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Nous mesurons d&apos;abord votre niveau réel et vous disons
                honnêtement le score atteignable dans votre délai. Si votre
                profil correspond à nos critères, nous construisons un plan
                d&apos;entraînement adapté aux quatre épreuves jusqu&apos;au
                passage officiel.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/services/tcf/demarrer"
                  className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  <FileText className="h-4 w-4" />
                  Soumettre ma demande
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </Link>
                <Link
                  href="/rendez-vous?service=tcf"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Test de positionnement gratuit · Bilan honnête écrit · Une
                question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur la préparation TCF Canada avant de soumettre ma demande."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  contactez-nous sur WhatsApp
                </a>
              </p>
            </div>

            {/* Stats Premium tech */}
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {STATS.map((s, i) => (
                <article
                  key={s.label}
                  className={`group/stat relative overflow-hidden rounded-2xl border bg-white/[0.04] px-5 py-4 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
                    i === 0
                      ? "border-nexus-orange-400/30 hover:border-nexus-orange-400/60"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/stat:bg-nexus-orange-500/20"
                  />
                  <div className="relative">
                    <p className="font-display text-xl font-bold leading-none text-white sm:text-2xl">
                      <span className="bg-gradient-to-r from-nexus-orange-300 to-nexus-orange-500 bg-clip-text text-transparent">
                        {s.value}
                      </span>
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {s.label}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 1.5 INTRO COURTE ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-nexus-blue-950 sm:text-3xl lg:text-4xl">
              Le TCF Canada n&apos;est pas un examen de français. C&apos;est{" "}
              <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                la mesure documentée
              </span>{" "}
              de votre capacité à atteindre un niveau précis dans un délai
              précis.
            </p>
          </div>
        </section>

        {/* 1.6 CE QUE NOUS FAISONS ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-16">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                  Périmètre
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                  Ce que nous faisons.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Quatre étapes encadrées, du diagnostic au passage officiel.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: "Diagnostic linguistique initial",
                    desc: "Évaluation honnête de votre niveau actuel sur les quatre épreuves : compréhension orale et écrite, expression orale et écrite.",
                  },
                  {
                    title: "Plan d'entraînement personnalisé",
                    desc: "Programme adapté à vos points faibles, votre score visé et la date de passage cible.",
                  },
                  {
                    title: "Simulations dans les conditions du test",
                    desc: "Examens blancs chronométrés et corrigés, familiarisation totale avec le format réel.",
                  },
                  {
                    title: "Inscription officielle au centre agréé",
                    desc: "Réservation du créneau, accompagnement administratif et orientation le jour du passage.",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_16px_36px_-16px_rgba(255,102,0,0.20)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/12"
                    />
                    <div className="relative flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-110">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 1.7 CE QUE VOUS OBTENEZ ──────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Résultat
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Ce que vous obtenez.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Pas de promesse de score — il dépend de votre travail et de la
                grille du jour. En revanche, voici ce que nous garantissons sur
                la préparation.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Score visé objectivé",
                  desc: "Niveau cible défini selon votre projet (admission universitaire, immigration économique, etc.).",
                },
                {
                  title: "Méthode adaptée à votre profil",
                  desc: "Pas de programme générique. Votre plan tient compte de votre niveau réel.",
                },
                {
                  title: "Familiarité totale avec le format",
                  desc: "Aucune surprise le jour de l'examen — vous connaissez chaque épreuve.",
                },
                {
                  title: "Inscription au centre agréé",
                  desc: "Démarches administratives prises en charge, créneau officiel sécurisé.",
                },
              ].map((item, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative">
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 2. POUR QUI CE SERVICE EST CONÇU ────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Sélectivité
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Pour qui ce service est conçu.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Nous n&apos;inscrivons pas tous les candidats. Cette
                transparence fait partie de notre engagement professionnel.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border-2 border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(16,185,129,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-300/80 hover:shadow-[0_24px_48px_-18px_rgba(16,185,129,0.30)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/0 blur-2xl transition-all duration-500 group-hover:bg-emerald-400/20"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      Ce service s&apos;adresse aux personnes
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {POUR_QUI.oui.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(244,63,94,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80 hover:shadow-[0_24px_48px_-18px_rgba(244,63,94,0.28)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/18"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      Ce service ne s&apos;adresse pas aux personnes
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {POUR_QUI.non.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 3. NOTRE MÉTHODOLOGIE ───────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Notre méthodologie
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Un parcours en{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  quatre étapes documentées
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Du test de positionnement initial jusqu&apos;au passage
                officiel, chaque étape est documentée et communiquée.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {METHODOLOGIE.map((etape) => {
                const Icon = etape.icon;
                return (
                  <article
                    key={etape.num}
                    className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)] sm:p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative shrink-0">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 opacity-50 blur-md transition-all duration-500 group-hover:opacity-100"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 font-display text-base font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        {etape.num}
                      </div>
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-nexus-orange-600" />
                        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                          {etape.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {etape.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-nexus-orange-50/30 p-7 shadow-[0_20px_50px_-20px_rgba(255,102,0,0.20)] ring-1 ring-slate-100/80 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                    Démarrer la démarche
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-2xl">
                    Soumettez votre demande de préparation TCF.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Test de positionnement gratuit. Bilan honnête écrit.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/tcf/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=tcf"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-nexus-blue-950 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-300/70 hover:bg-slate-50"
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
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Le test, en quatre épreuves
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Quatre compétences,{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  quatre stratégies
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Chaque épreuve a sa logique. Bien parler français ne suffit
                pas — il faut aussi maîtriser le format du test, la grille
                d&apos;évaluation et les pièges récurrents.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {EPREUVES.map((ep) => {
                const Icon = ep.icon;
                return (
                  <article
                    key={ep.title}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                        {ep.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {ep.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                        {ep.duree}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. SCORES & NIVEAUX CIBLES ───────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Niveaux &amp; scores
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Quel score viser, et pour quel projet.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Le score utile dépend de votre projet. Notre coach définit
                avec vous l&apos;objectif réaliste après le test de
                positionnement.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {NIVEAUX_VISES.map((n) => (
                <article
                  key={n.nclc}
                  className={
                    n.pivot
                      ? "group relative overflow-hidden rounded-3xl border-2 border-nexus-orange-400/70 bg-gradient-to-br from-nexus-orange-50/60 via-white to-nexus-orange-50/30 p-6 shadow-[0_18px_44px_-18px_rgba(255,102,0,0.30)] ring-1 ring-nexus-orange-100/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-500/80"
                      : "group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                  }
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                          {n.nclc}
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
                          {n.cefr}
                        </p>
                      </div>
                      {n.pivot && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                          <TrendingUp className="h-3 w-3" />
                          Pivot
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {n.usage}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-100/80 sm:p-6">
              <p>
                <strong className="text-nexus-blue-950">À noter.</strong> Les
                seuils exacts varient selon le programme (Entrée express, PEQ
                Québec, Mobilité francophone, admission universitaire). Le
                conseiller Nexus précise le score exact à viser après
                l&apos;étude de votre projet.
              </p>
            </div>
          </div>
        </section>

        {/* 6. POURQUOI NEXUS ────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Méthode pédagogique
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Nous travaillons{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  le score
                </span>
                , pas la conversation.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {[
                {
                  icon: Target,
                  title: "Grille d'évaluation maîtrisée",
                  desc: "Nos coachs connaissent la grille exacte du TCF, ce que l'examinateur cherche, ce qu'il pénalise. La performance vient de cette connaissance — pas du seul niveau de langue.",
                },
                {
                  icon: Mic,
                  title: "Coaching individuel sur l'oral",
                  desc: "L'expression orale est le point faible le plus fréquent. Nous y consacrons un coaching individuel sérieux : argumentation structurée, gestion du stress, articulation.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Simulations dans les conditions réelles",
                  desc: "Tests blancs au format exact, durée réelle, type de consignes identique. Corrections détaillées. Beaucoup de candidats gagnent un niveau complet entre le test blanc d'entrée et le test officiel.",
                },
                {
                  icon: TrendingUp,
                  title: "Progression mesurée",
                  desc: "Test de positionnement initial, mi-parcours, et test blanc final. Vous savez précisément où vous en êtes avant de payer l'inscription officielle.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-7 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT DE TRANSPARENCE ────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Engagement
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Aucun préparateur sérieux ne peut{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  garantir un score
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Le score final dépend de votre travail et de votre performance
                le jour J. Toute structure qui vous promet un score précis vous
                trompe. Nexus RCA ne le fera jamais.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(244,63,94,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/18"
                />
                <div className="relative">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
                    Ce que nous ne pouvons pas
                  </span>
                  <ul className="mt-4 space-y-3">
                    {[
                      "Garantir un score précis",
                      "Influencer le résultat ou l'examinateur",
                      "Faire progresser un candidat qui ne s'entraîne pas",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border-2 border-nexus-orange-300/70 bg-gradient-to-br from-nexus-orange-50/60 via-white to-nexus-orange-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(255,102,0,0.20)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/80">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/18"
                />
                <div className="relative">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                    Ce que nous garantissons
                  </span>
                  <ul className="mt-4 space-y-3">
                    {[
                      "Un diagnostic linguistique honnête avant tout engagement",
                      "Un plan d'entraînement construit sur vos points faibles réels",
                      "Des simulations conformes au format officiel du TCF",
                      "Un conseil franc sur la faisabilité de votre score cible dans votre délai",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 8. CADRE TARIFAIRE ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Cadre tarifaire
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Une transparence économique complète.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Vous savez ce que ça coûte avant de signer. Aucun frais caché.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  iconBg:
                    "bg-gradient-to-br from-emerald-500 to-emerald-600",
                  title: "Test de positionnement",
                  desc: "Gratuit, sans engagement. Bilan écrit avec score estimé actuel et score atteignable.",
                },
                {
                  icon: ClipboardCheck,
                  iconBg:
                    "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
                  title: "Préparation Nexus",
                  desc: "Devis fixe communiqué après le test. Format groupe ou individuel, durée selon écart à combler. Aucune facturation surprise.",
                },
                {
                  icon: Wallet,
                  iconBg:
                    "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
                  title: "Inscription officielle",
                  desc: "Frais d'inscription au centre agréé en supplément, montant détaillé à l'avance et reversé directement au centre.",
                },
              ].map((tarif) => {
                const Icon = tarif.icon;
                return (
                  <article
                    key={tarif.title}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 ${tarif.iconBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                        {tarif.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {tarif.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. CTA FINAL Premium tech ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              Lancer la préparation
            </span>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Mesurons votre niveau réel et fixons un objectif honnête.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Plus vous commencez tôt, meilleur sera le score. Soumettez votre
              demande pour un test de positionnement gratuit et un bilan clair
              sous 48 heures ouvrées.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                Test
                <br />
                <span className="text-white">Gratuit</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                Bilan
                <br />
                <span className="text-white">Honnête</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                Inscription
                <br />
                <span className="text-white">Gérée</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/services/tcf/demarrer"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <FileText className="h-4 w-4" />
                Soumettre ma demande
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/rendez-vous?service=tcf"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Prendre rendez-vous
              </Link>
            </div>

            <p className="mt-8 text-xs text-white/70">
              Une question avant de commencer ?{" "}
              <a
                href={whatsappLink(
                  "Bonjour Nexus, j'ai une question sur la préparation TCF Canada avant de soumettre ma demande."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-nexus-orange-300 underline-offset-4 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contactez-nous sur WhatsApp
              </a>
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                Test gratuit
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Bilan honnête</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Inscription gérée</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Confidentialité absolue</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
