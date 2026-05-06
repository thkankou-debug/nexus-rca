import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Handshake,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  Store,
  Calendar,
  FileText,
  MessageCircle,
  XCircle,
  Wallet,
  ClipboardCheck,
  Search,
  Eye,
  Check,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Financement & partenariat | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour structurer et cofinancer vos projets. Nous étudions chaque projet avec rigueur avant d'accepter de l'accompagner. Pas un prêt — un partenariat avec partage des résultats.",
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
    "Vous portez un projet structuré ou en voie de structuration sérieuse",
    "Vous êtes prêt(e) à investir du temps dans la préparation et l'analyse",
    "Vous acceptez un partenariat avec partage des résultats — pas une dette",
  ],
  non: [
    "Vous cherchez un prêt classique à rembourser avec intérêts",
    "Vous attendez une garantie de financement immédiate sans étude préalable",
    "Vous ne pouvez pas justifier de votre engagement personnel dans le projet",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons les éléments essentiels de votre projet : porteur, secteur, montant, calendrier.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse de faisabilité",
    description:
      "Un conseiller Nexus étudie votre projet selon nos critères (viabilité, structuration, engagement du porteur, potentiel). Bilan écrit avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Si retenu : structuration complète du projet, incubation opérationnelle, mise en place du cofinancement, formalisation du partenariat dans un accord clair.",
  },
  {
    num: "04",
    icon: Eye,
    title: "Suivi jusqu'au résultat",
    description:
      "Suivi long terme du développement, conseils stratégiques continus, partage des résultats selon les termes du partenariat.",
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
    description:
      "Notre réussite est liée à la vôtre. Nous avançons ensemble.",
  },
  {
    emoji: "🚀",
    title: "Nous accompagnons la réussite",
    description:
      "Du démarrage à la croissance, nous restons à vos côtés.",
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
  { value: "Étude", label: "Initiale gratuite" },
  { value: "Partenariat", label: "Pas de dette" },
  { value: "Bilan", label: "Honnête écrit" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function FinancementPage() {
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
                Service incubateur &amp; financement
              </span>

              <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Incubateur &amp;{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    Financement
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                en partenariat
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Nous étudions chaque projet avec rigueur avant d&apos;accepter
                de l&apos;accompagner. Si votre projet correspond à nos
                critères, nous le structurons, l&apos;incubons et participons
                au cofinancement — dans une logique de partenariat avec
                partage des résultats, pas de prêt avec dette à rembourser.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/services/financement/demarrer"
                  className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  <FileText className="h-4 w-4" />
                  Soumettre mon projet
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </Link>
                <Link
                  href="/rendez-vous?service=financement"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Étude initiale gratuite · Bilan de faisabilité honnête · Une
                question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Incubateur & Financement avant de soumettre mon projet."
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
              Le cofinancement n&apos;est ni un prêt ni une subvention. C&apos;est{" "}
              <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                un partenariat
              </span>{" "}
              où la rigueur de l&apos;étude détermine la confiance dans
              l&apos;engagement.
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
                  Quatre étapes encadrées, de l&apos;étude initiale au suivi
                  opérationnel.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: "Étude de faisabilité écrite",
                    desc: "Analyse approfondie du projet, de son marché et de sa rentabilité avant tout engagement.",
                  },
                  {
                    title: "Structuration juridique",
                    desc: "Cadre contractuel clair, gouvernance, partage des rôles et des résultats.",
                  },
                  {
                    title: "Mobilisation des cofinanceurs",
                    desc: "Présentation aux partenaires identifiés selon le projet et le tour de table requis.",
                  },
                  {
                    title: "Suivi de projet",
                    desc: "Reporting régulier, ajustements et accompagnement opérationnel pendant la durée de l'engagement.",
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
                Un partenariat documenté, pas une promesse de financement.
                Pas d&apos;engagement avant clarté sur la viabilité.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Bilan honnête sans engagement",
                  desc: "Si le projet n'est pas viable, nous le disons franchement avant tout investissement.",
                },
                {
                  title: "Cadre contractuel clair",
                  desc: "Droits, obligations et règles de gouvernance écrites avant tout versement.",
                },
                {
                  title: "Tour de table identifié",
                  desc: "Cofinanceurs alignés avec votre vision et capables de soutenir le projet.",
                },
                {
                  title: "Suivi opérationnel partagé",
                  desc: "Pas seulement un investissement passif. Un accompagnement actif.",
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
                Nous n&apos;accompagnons pas tous les profils. Cette
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
                Du diagnostic initial au partenariat formalisé, chaque étape
                est documentée et communiquée.
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

            {/* CTA en sortie */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-nexus-orange-50/30 p-7 shadow-[0_20px_50px_-20px_rgba(255,102,0,0.20)] ring-1 ring-slate-100/80 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                    Démarrer la démarche
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-2xl">
                    Soumettez votre projet dès aujourd&apos;hui.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Étude initiale gratuite. Bilan de faisabilité écrit.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/financement/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    Soumettre mon projet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=financement"
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

        {/* 4. NOTRE APPROCHE — Ce qui nous distingue ─────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Notre approche
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Trois engagements qui{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  nous distinguent
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Nous ne finançons pas au hasard. Chaque projet retenu fait
                l&apos;objet d&apos;une étude approfondie et d&apos;un
                partenariat formalisé.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {ENGAGEMENTS.map((e) => (
                <article
                  key={e.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative">
                    <div className="text-3xl">{e.emoji}</div>
                    <h3 className="mt-3 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      {e.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {e.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. MODÈLE — Pas un prêt classique ─────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Comment ça marche
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Un partenariat,{" "}
                <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                  pas un prêt
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Notre modèle repose sur la collaboration et le partage des
                résultats. Pas de dette qui écrase, pas de charge financière
                lourde dès le départ.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border border-rose-500/30 bg-rose-500/5 p-7 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-400/50">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-500/0 blur-2xl transition-all duration-500 group-hover:bg-rose-500/20"
                />
                <div className="relative">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Ce que nous ne faisons pas
                  </div>
                  <ul className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <ListItemCross>Nous ne sommes pas une banque</ListItemCross>
                    <ListItemCross>
                      Nous ne prêtons pas d&apos;argent à rembourser avec
                      intérêts
                    </ListItemCross>
                    <ListItemCross>
                      Nous n&apos;imposons pas de dette lourde dès le démarrage
                    </ListItemCross>
                    <ListItemCross>
                      Nous ne demandons pas de garanties bancaires classiques
                    </ListItemCross>
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border-2 border-nexus-orange-500/40 bg-nexus-orange-500/10 p-7 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/70">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                />
                <div className="relative">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
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
              </article>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
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

        {/* 6. QUI PEUT POSTULER ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Qui peut postuler
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Quatre profils que nous accompagnons.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {QUI_PEUT_POSTULER.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. CRITÈRES DE SÉLECTION ───────────────────────────── */}
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

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="overflow-hidden rounded-3xl border-2 border-nexus-orange-300/60 bg-gradient-to-br from-white via-nexus-orange-50/30 to-white p-8 shadow-[0_20px_50px_-20px_rgba(255,102,0,0.25)] ring-1 ring-slate-100/80 sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                    Sélection rigoureuse
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-3xl">
                    Tous les projets ne sont pas retenus.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Notre engagement implique une sélection rigoureuse. Chaque
                    dossier est étudié sérieusement, et seuls les projets
                    correspondant à nos critères sont retenus.
                  </p>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 ring-1 ring-slate-100/80">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Critères de sélection
                    </span>
                    <ul className="mt-3 space-y-3">
                      {SELECTION_CRITERES.map((critere) => (
                        <li
                          key={critere}
                          className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950 sm:text-base"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-nexus-orange-600" />
                          <span>{critere}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-5 text-sm italic leading-relaxed text-slate-600">
                    Si votre projet n&apos;est pas retenu, nous vous le disons
                    avec transparence et, si possible, vous orientons vers
                    d&apos;autres pistes.
                  </p>
                </div>
              </div>
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
                Cadre économique
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Une transparence économique complète.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Vous savez à quoi vous engager avant tout partenariat.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  iconBg:
                    "bg-gradient-to-br from-emerald-500 to-emerald-600",
                  title: "Étude initiale",
                  desc: "Gratuite, sans engagement. Bilan écrit communiqué sous délai annoncé.",
                },
                {
                  icon: Handshake,
                  iconBg:
                    "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
                  title: "Modalités du partenariat",
                  desc: "Apport Nexus, apport porteur, partage des résultats : formalisés dans un accord écrit avant tout démarrage.",
                },
                {
                  icon: Wallet,
                  iconBg:
                    "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
                  title: "Frais externes",
                  desc: "Frais juridiques (statuts, contrats) et opérationnels détaillés à l'avance, à la charge du projet selon plan établi.",
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
              Soumettre votre projet
            </span>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Lancez votre projet selon notre méthodologie.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              L&apos;étude initiale est gratuite. Si nous estimons que votre
              projet correspond à nos critères, nous vous proposons un
              partenariat. Sinon, nous vous le disons franchement et vous
              orientons.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                Étude
                <br />
                <span className="text-white">Gratuite</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                Partenariat
                <br />
                <span className="text-white">Pas de dette</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                Bilan
                <br />
                <span className="text-white">Honnête</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/services/financement/demarrer"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <FileText className="h-4 w-4" />
                Soumettre mon projet
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/rendez-vous?service=financement"
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
                  "Bonjour Nexus, j'ai une question sur le service Incubateur & Financement avant de soumettre mon projet."
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
                Étude gratuite
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Bilan écrit</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Pas de dette</span>
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

// ─── Sous-composants ────────────────────────────────────────────────────────

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
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
      />
      <div className="relative">
        <h4 className="font-display text-base font-bold leading-tight text-white">
          {title}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {description}
        </p>
      </div>
    </article>
  );
}
