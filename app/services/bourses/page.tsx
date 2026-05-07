import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { EducationLevelSelector } from "@/components/services/EducationLevelSelector";
import {
  GraduationCap,
  School,
  Building2,
  Wrench,
  Award,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Search,
  ClipboardCheck,
  FileText,
  Plane,
  Sparkles,
  TrendingUp,
  Calendar,
  MessageCircle,
  XCircle,
  Wallet,
  ShieldCheck,
  BookOpen,
  MapPin,
  Eye,
  Activity,
  Receipt,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Études au Canada | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos études au Canada. Nous étudions chaque dossier avec rigueur avant d'accepter de l'accompagner. Méthode en quatre étapes du diagnostic au permis d'études.",
};

// ─── Pattern dot grid sombre ─────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Données : icônes + clés de traduction ─────────────────────────────────

const METHODOLOGIE = [
  { num: "01", icon: FileText, key: "metho_01" },
  { num: "02", icon: Search, key: "metho_02" },
  { num: "03", icon: ClipboardCheck, key: "metho_03" },
  { num: "04", icon: Plane, key: "metho_04" },
] as const;

const ETABLISSEMENTS = [
  { icon: School, key: "etab_1" },
  { icon: Building2, key: "etab_2" },
  { icon: Wrench, key: "etab_3" },
] as const;

const TYPES_AIDES = [
  { icon: Award, key: "aides_1" },
  { icon: TrendingUp, key: "aides_2" },
  { icon: Sparkles, key: "aides_3" },
] as const;

const TARIFS = [
  { icon: Search, key: "tarif_1" },
  { icon: ClipboardCheck, key: "tarif_2", highlight: true },
  { icon: Wallet, key: "tarif_3" },
] as const;

// ─── Données : Parcours académique (signature) ──────────────────────────
const PARCOURS_NODES = [
  { id: "bac", label: "Bac", icon: BookOpen, x: 8 },
  { id: "lic", label: "Licence", icon: GraduationCap, x: 28 },
  { id: "mst", label: "Master", icon: Award, x: 50 },
  { id: "doc", label: "Doctorat", icon: Sparkles, x: 72 },
  { id: "pr", label: "PR Canada", icon: MapPin, x: 92 },
] as const;

// ─── Données : Universités cibles ──────────────────────────────────────
const UNIVERSITES = [
  { flag: "🇨🇦", uni: "🏛️", name: "Université de Montréal", city: "Montréal, QC" },
  { flag: "🇨🇦", uni: "🎓", name: "Université Laval", city: "Québec, QC" },
  { flag: "🇨🇦", uni: "📚", name: "McGill University", city: "Montréal, QC" },
  { flag: "🇨🇦", uni: "🏫", name: "Université d'Ottawa", city: "Ottawa, ON" },
  { flag: "🇨🇦", uni: "🎯", name: "Université de Sherbrooke", city: "Sherbrooke, QC" },
  { flag: "🇨🇦", uni: "🌐", name: "UQAM", city: "Montréal, QC" },
  { flag: "🇨🇦", uni: "🛠️", name: "ÉTS", city: "Montréal, QC" },
  { flag: "🇨🇦", uni: "🌲", name: "Université Concordia", city: "Montréal, QC" },
] as const;

// ─── Données : Bourses & Aides bento ───────────────────────────────────
const BOURSES_BENTO = [
  {
    title: "Bourses gouvernementales canadiennes",
    desc: "Programmes Vanier, BESC, Mitacs, bourses fédérales et provinciales pour les profils à haut potentiel. Critères d'éligibilité stricts, calendriers anticipés.",
    icon: Award,
    badge: "Master / Doctorat",
    master: true,
  },
  {
    title: "BCBG (Bourses canadiennes de Bons-Génies)",
    desc: "Aides ciblées pour les profils techniques et scientifiques d'excellence.",
    icon: Sparkles,
    badge: "Sur dossier",
  },
  {
    title: "MELS (Bourses du Québec)",
    desc: "Programmes provinciaux du Ministère de l'Éducation du Québec.",
    icon: GraduationCap,
    badge: "Province QC",
  },
  {
    title: "Bourses provinciales",
    desc: "Programmes spécifiques de chaque province (ON, AB, BC, NB, etc.).",
    icon: MapPin,
    badge: "Hors-Québec",
  },
  {
    title: "Bourses privées & fondations",
    desc: "Fondations universitaires et bourses sectorielles (Femmes en sciences, etc.).",
    icon: BookOpen,
    badge: "Au mérite",
  },
] as const;

// ─── Composant ──────────────────────────────────────────────────────────────

export default function BoursesPage() {
  const t = useTranslations("ServiceBourses");

  const POUR_QUI_OUI = [
    t("pourqui_oui_1"),
    t("pourqui_oui_2"),
    t("pourqui_oui_3"),
  ];
  const POUR_QUI_NON = [
    t("pourqui_non_1"),
    t("pourqui_non_2"),
    t("pourqui_non_3"),
  ];

  const ENGAGEMENT_NO = [
    t("engagement_no_1"),
    t("engagement_no_2"),
    t("engagement_no_3"),
  ];
  const ENGAGEMENT_YES = [
    t("engagement_yes_1"),
    t("engagement_yes_2"),
    t("engagement_yes_3"),
    t("engagement_yes_4"),
  ];

  const SCOPE_ITEMS = [1, 2, 3, 4].map((i) => ({
    title: t(`scope_item${i}_title`),
    desc: t(`scope_item${i}_desc`),
  }));

  const RESULT_ITEMS = [1, 2, 3, 4].map((i) => ({
    title: t(`result_item${i}_title`),
    desc: t(`result_item${i}_desc`),
  }));

  // Cas types — case study factuel (sans "Résultat: XXX" marketing)
  const CAS = [
    {
      badge: t("cas_1_badge"),
      title: t("cas_1_title"),
      desc: t("cas_1_desc"),
      stats: [
        { label: "Calendrier", value: "12 mois" },
        { label: "Cible", value: "3 universités QC" },
        { label: "Aides", value: "2 bourses partielles" },
        { label: "Visa", value: "CAQ + IRCC" },
      ],
    },
    {
      badge: t("cas_2_badge"),
      title: t("cas_2_title"),
      desc: t("cas_2_desc"),
      stats: [
        { label: "Cible", value: "Cégep ON" },
        { label: "Profil", value: "Technique" },
        { label: "Biométrie", value: "Yaoundé" },
        { label: "Visa", value: "Permis d'études" },
      ],
    },
    {
      badge: "🎯 Master en sciences",
      title: "Étudiante diplômée, recherche au Québec",
      desc: "Profil scientifique avec mémoire de fin de licence valorisé. Cartographie des bourses Vanier et BESC, alignement du projet de recherche avec un directeur ciblé, montage de la candidature en 14 mois avant la rentrée.",
      stats: [
        { label: "Calendrier", value: "14 mois" },
        { label: "Cible", value: "Master recherche" },
        { label: "Aides", value: "Vanier + BESC" },
        { label: "Visa", value: "CAQ + IRCC" },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO Premium tech ────────────────────────────────────── */}
        <PublicHero
          eyebrow={t("hero_eyebrow")}
          titleStart={t("hero_title_start")}
          accentWord={t("hero_title_accent")}
          titleEnd={t("hero_title_end")}
          subtitle={t("hero_subtitle")}
          ctaPrimary={{
            href: "/services/bourses/demarrer",
            label: t("hero_cta_primary"),
            icon: FileText,
          }}
          ctaSecondary={{
            href: "/rendez-vous?service=bourses",
            label: t("hero_cta_secondary"),
            icon: Calendar,
          }}
        />

        {/* 2. PARCOURS ACADÉMIQUE — signature unique ─────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Parcours académique RCA → Canada
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Du diplôme RCA{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    au permis d&apos;études
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                Canada.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Cinq jalons jalonnent un parcours d&apos;études internationales.
                Selon votre niveau actuel, nous orientons votre dossier vers la
                bonne porte d&apos;entrée du système canadien.
              </p>
            </div>

            {/* Timeline desktop horizontale */}
            <div className="relative hidden h-48 w-full md:block">
              <svg
                aria-hidden
                viewBox="0 0 800 100"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-1/2 h-24 w-full -translate-y-1/2"
              >
                <defs>
                  <linearGradient id="parcoursGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,102,0,0.25)" />
                    <stop offset="50%" stopColor="rgba(255,102,0,0.85)" />
                    <stop offset="100%" stopColor="rgba(255,102,0,0.25)" />
                  </linearGradient>
                </defs>
                <line
                  x1="40"
                  y1="50"
                  x2="760"
                  y2="50"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="50"
                  x2="760"
                  y2="50"
                  stroke="url(#parcoursGrad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="720"
                  strokeDashoffset="720"
                  className="animate-pathprogress"
                />
              </svg>

              {/* Nodes */}
              {PARCOURS_NODES.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${n.x}%` }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                        />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/20 via-white/[0.06] to-white/[0.02] text-nexus-orange-300 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_18px_40px_-16px_rgba(255,102,0,0.45)]">
                          <Icon className="h-6 w-6" />
                          <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nexus-orange-400" />
                          </span>
                        </div>
                      </div>
                      <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                        {n.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline mobile verticale */}
            <div className="relative md:hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute left-7 top-4 bottom-4 w-px bg-gradient-to-b from-nexus-orange-500/50 via-nexus-orange-500/30 to-transparent"
              />
              <div className="space-y-5">
                {PARCOURS_NODES.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="relative flex items-center gap-5">
                      <div className="relative shrink-0">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                        />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/20 via-white/[0.06] to-white/[0.02] text-nexus-orange-300 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_18px_40px_-16px_rgba(255,102,0,0.45)]">
                          <Icon className="h-6 w-6" />
                          <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nexus-orange-400" />
                          </span>
                        </div>
                      </div>
                      <span className="font-display text-base font-bold leading-tight text-white">
                        {n.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-white/60">
              Chaque transition exige des justificatifs précis. Le bon timing
              fait la différence entre un dossier qualifié et un dossier rejeté.
            </p>
          </div>
        </section>

        {/* 3. SÉLECTEUR NIVEAU — signature unique ─────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12 lg:px-8">
            {/* Texte gauche */}
            <div>
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Outil d&apos;orientation
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Quel niveau{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    êtes-vous
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                ?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                Sélectionnez votre dernier diplôme obtenu. Nous indiquons les
                débouchés directement accessibles dans le système canadien et
                les bourses associées à votre profil.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  { icon: ShieldCheck, text: "Orientation factuelle, sans promesse" },
                  { icon: Eye, text: "Bilan écrit après échange initial" },
                  { icon: ClipboardCheck, text: "Devis fixe avant tout engagement" },
                ].map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-500/10 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30 backdrop-blur">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {it.text}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sélecteur droite */}
            <EducationLevelSelector />
          </div>
        </section>

        {/* 4. BOURSES & AIDES — bento signature ──────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Bourses &amp; aides financières
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Cinq familles de financements,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    cinq logiques
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                différentes.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Aucune bourse ne s&apos;auto-attribue. Chacune a son calendrier,
                ses critères et son dossier-type. Nous identifions celles
                qui correspondent à votre profil avant tout engagement.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {BOURSES_BENTO.map((b) => {
                  const Icon = b.icon;
                  return (
                    <article
                      key={b.title}
                      className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                        {b.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {b.desc}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        <Sparkles className="h-3 w-3" />
                        {b.badge}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Desktop : bento asymétrique */}
            <div className="hidden sm:grid sm:grid-cols-4 sm:gap-5">
              {BOURSES_BENTO.map((b) => {
                const Icon = b.icon;
                const isMaster = "master" in b && b.master;
                const span = isMaster
                  ? "sm:col-span-2 sm:row-span-2"
                  : "sm:col-span-2";
                return (
                  <article
                    key={b.title}
                    className={`group relative overflow-hidden rounded-3xl border backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 ${span} ${
                      isMaster
                        ? "border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] hover:border-nexus-orange-400/60 sm:p-9"
                        : "border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:p-7"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${
                        isMaster
                          ? "bg-nexus-orange-500/25"
                          : "bg-nexus-orange-500/0"
                      } blur-[80px] transition-all duration-500 group-hover:bg-nexus-orange-500/30`}
                    />
                    <div className="relative">
                      <div
                        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105 ${
                          isMaster ? "h-16 w-16" : "h-12 w-12"
                        }`}
                      >
                        <Icon className={isMaster ? "h-8 w-8" : "h-5 w-5"} />
                      </div>
                      <h3
                        className={`mt-5 font-display font-bold leading-tight text-white ${
                          isMaster ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                        }`}
                      >
                        {b.title}
                      </h3>
                      <p
                        className={`mt-3 leading-relaxed text-slate-200 ${
                          isMaster ? "text-base" : "text-sm"
                        }`}
                      >
                        {b.desc}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        <Sparkles className="h-3 w-3" />
                        {b.badge}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Avertissement intégré */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-white/[0.02] p-6 ring-1 ring-amber-400/15 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30 backdrop-blur">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                    {t("aides_warn_title")}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                    {t("aides_warn_text")}
                  </p>
                </div>
              </div>
            </div>

            {/* Types d'aides — 3 cards */}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {TYPES_AIDES.map((aide) => {
                const Icon = aide.icon;
                return (
                  <article
                    key={aide.key}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                          {t(`${aide.key}_pct`)}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {t(`${aide.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {t(`${aide.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. INTRO COURTE éditoriale ──────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t("intro_before")}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  {t("intro_highlight")}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                />
              </span>
              {t("intro_after")}
            </p>
          </div>
        </section>

        {/* 6. CE QUE NOUS FAISONS — navy + cards glass + scroll-snap mobile */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-16">
              <div>
                <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                  {t("scope_eyebrow")}
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  {t("scope_title")}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t("scope_subtitle")}
                </p>
              </div>

              <ul className="space-y-4">
                {SCOPE_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <span className="font-display text-xs font-bold tabular-nums">
                          0{i + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-200">
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

        {/* 7. CE QUE VOUS OBTENEZ — navy grid 4 + scroll-snap ──── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("result_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("result_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("result_subtitle")}
              </p>
            </div>

            {/* Desktop : grid 4 col */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
              {RESULT_ITEMS.map((item, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:p-7"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                  />
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {RESULT_ITEMS.map((item, i) => (
                  <article
                    key={i}
                    className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. POUR QUI — navy split emerald/rose ───────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-emerald-500/12 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/3 h-[32rem] w-[32rem] rounded-full bg-rose-500/12 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("pourqui_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("pourqui_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                {t("pourqui_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-emerald-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.06] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-[100px] transition-all duration-500 group-hover:bg-emerald-500/25"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                      {t("pourqui_oui_title")}
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {POUR_QUI_OUI.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-rose-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rose-400/40 hover:bg-white/[0.06] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-[100px] transition-all duration-500 group-hover:bg-rose-500/25"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                      {t("pourqui_non_title")}
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {POUR_QUI_NON.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 9. MÉTHODOLOGIE timeline numéros 7xl gradient orange ─── */}
        <section
          id="methodologie"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("metho_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("metho_title_before")}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    {t("metho_title_highlight")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                {t("metho_title_after")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("metho_subtitle")}
              </p>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-nexus-orange-500/40 via-nexus-orange-500/20 to-transparent sm:left-[3.75rem]"
              />

              <div className="space-y-7">
                {METHODOLOGIE.map((etape) => {
                  const Icon = etape.icon;
                  return (
                    <div
                      key={etape.num}
                      className="group relative grid grid-cols-[4rem_1fr] gap-5 sm:grid-cols-[7.5rem_1fr] sm:gap-7"
                    >
                      <div className="relative flex justify-center sm:justify-start">
                        <div className="relative">
                          <div
                            aria-hidden
                            className="absolute inset-0 rounded-3xl bg-nexus-orange-500/40 blur-md transition-all duration-500 group-hover:bg-nexus-orange-500/60"
                          />
                          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-nexus-orange-400/30 bg-nexus-blue-900/60 backdrop-blur-md font-display text-5xl font-bold tabular-nums shadow-[0_10px_28px_-10px_rgba(255,102,0,0.4)] sm:h-[7.5rem] sm:w-[7.5rem] sm:text-7xl">
                            <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                              {etape.num}
                            </span>
                          </span>
                        </div>
                      </div>

                      <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-nexus-orange-400/40 group-hover:bg-white/[0.06] sm:p-7">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                        />
                        <div className="relative">
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-nexus-orange-300" />
                            <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                              {t(`${etape.key}_title`)}
                            </h3>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                            {t(`${etape.key}_desc`)}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA milieu glass orange */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                    {t("metho_cta_eyebrow")}
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    {t("metho_cta_title")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {t("metho_cta_subtitle")}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/bourses/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    <FileText className="h-4 w-4" />
                    {t("metho_cta_primary")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=bourses"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                  >
                    <Calendar className="h-4 w-4" />
                    {t("metho_cta_secondary")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. UNIVERSITÉS CIBLES — cards glass + drapeau ─────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("etab_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("etab_title_before")}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    {t("etab_title_highlight")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                {t("etab_title_after")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                {t("etab_subtitle")}
              </p>
            </div>

            {/* Types d'établissements */}
            <div className="grid gap-5 md:grid-cols-3">
              {ETABLISSEMENTS.map((etab) => {
                const Icon = etab.icon;
                return (
                  <article
                    key={etab.key}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                          {t(`${etab.key}_duree`)}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {t(`${etab.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {t(`${etab.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Universités cibles — emoji drapeau + ville */}
            <div className="mt-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                  Établissements ciblés
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-nexus-orange-500/30 via-white/10 to-transparent" />
              </div>

              {/* Mobile : scroll-snap */}
              <div className="sm:hidden">
                <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                  {UNIVERSITES.map((u) => (
                    <article
                      key={u.name}
                      className="relative w-[75vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{u.flag}</span>
                        <span className="text-2xl">{u.uni}</span>
                      </div>
                      <h3 className="mt-3 font-display text-sm font-bold leading-tight text-white">
                        {u.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {u.city}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              {/* Desktop : grille */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                {UNIVERSITES.map((u) => (
                  <article
                    key={u.name}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{u.flag}</span>
                        <span className="text-xl">{u.uni}</span>
                      </div>
                      <h3 className="mt-3 font-display text-sm font-bold leading-tight text-white">
                        {u.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
                        <MapPin className="h-3 w-3 text-nexus-orange-300" />
                        {u.city}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-white/60">
                Liste indicative. Le ciblage final dépend de votre profil et
                des programmes disponibles à la date de candidature.
              </p>
            </div>
          </div>
        </section>

        {/* 11. CAS TYPES — 3 cards tech case study factuel ─────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("cas_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("cas_title")}
              </h2>
            </div>

            {/* Mobile : scroll-snap + Tablet : grid 2 col */}
            <div className="xl:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-1 pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {CAS.map((cas, idx) => (
                  <article
                    key={idx}
                    className="group relative w-[85vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:w-auto sm:p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/10 blur-[80px] transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        <Sparkles className="h-3 w-3" />
                        {cas.badge}
                      </span>
                      <h3 className="mt-4 font-display text-lg font-bold leading-tight text-white">
                        {cas.title}
                      </h3>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {cas.stats.map((s) => (
                          <div
                            key={s.label}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur"
                          >
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                              {s.label}
                            </p>
                            <p className="mt-1 font-display text-xs font-bold leading-tight text-white">
                              {s.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-slate-200">
                        {cas.desc}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.18em] text-transparent">
                          Approche méthodologique
                        </span>
                        <ArrowRight className="h-4 w-4 text-nexus-orange-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="hidden xl:grid xl:grid-cols-3 xl:gap-5">
              {CAS.map((cas, idx) => (
                <article
                  key={idx}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/10 blur-[100px] transition-all duration-500 group-hover:bg-nexus-orange-500/30"
                  />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                      <Sparkles className="h-3 w-3" />
                      {cas.badge}
                    </span>
                    <h3 className="mt-4 font-display text-xl font-bold leading-tight text-white">
                      {cas.title}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {cas.stats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur transition-all duration-300 group-hover:border-nexus-orange-400/30"
                        >
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                            {s.label}
                          </p>
                          <p className="mt-1 font-display text-xs font-bold leading-tight text-white">
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-slate-200">
                      {cas.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.18em] text-transparent">
                        Approche méthodologique
                      </span>
                      <ArrowRight className="h-4 w-4 text-nexus-orange-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 12. ENGAGEMENT TRANSPARENCE — asymétrique 1+2 col ──── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-1/3 h-96 w-96 rounded-full bg-rose-500/10 blur-[140px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("engagement_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("engagement_title_before")}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    {t("engagement_title_highlight")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                {t("engagement_title_after")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("engagement_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Ce que nous ne pouvons pas — 1 col rose */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-rose-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rose-400/40 hover:bg-white/[0.06]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-[80px] transition-all duration-500 group-hover:bg-rose-500/25"
                />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30 backdrop-blur">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-rose-300">
                    {t("engagement_no_title")}
                  </span>
                  <ul className="mt-4 space-y-3">
                    {ENGAGEMENT_NO.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* Ce que nous garantissons — 2 col orange highlight */}
              <article className="group relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_60px_-16px_rgba(255,102,0,0.40)] sm:p-9 lg:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/25 blur-[100px] transition-all duration-500 group-hover:bg-nexus-orange-500/40"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                      {t("engagement_yes_title")}
                    </span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {ENGAGEMENT_YES.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200 sm:text-base"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 13. CADRE TARIFAIRE — 3 cards glass ──────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("tarif_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("tarif_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("tarif_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {TARIFS.map((tarif) => {
                const Icon = tarif.icon;
                const isHi = "highlight" in tarif && tarif.highlight;
                return (
                  <article
                    key={tarif.key}
                    className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 sm:p-7 ${
                      isHi
                        ? "border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] hover:border-nexus-orange-400/60"
                        : "border-white/10 bg-white/[0.04] ring-1 ring-white/5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${
                        isHi
                          ? "bg-nexus-orange-500/20"
                          : "bg-nexus-orange-500/0"
                      } blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25`}
                    />
                    <div className="relative">
                      <div
                        className={`flex items-center justify-center rounded-2xl text-white shadow-sm ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105 ${
                          isHi
                            ? "h-14 w-14 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)]"
                            : "h-11 w-11 bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900"
                        }`}
                      >
                        <Icon className={isHi ? "h-7 w-7" : "h-5 w-5"} />
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {t(`${tarif.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {t(`${tarif.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 14. CTA FINAL — hero card premium navy ─────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-nexus-orange-500/20 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-nexus-blue-500/25 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              {t("cta_final_eyebrow")}
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("cta_final_title")}
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {t("cta_final_subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/services/bourses/demarrer"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <FileText className="h-4 w-4" />
                {t("cta_final_primary")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/rendez-vous?service=bourses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                {t("cta_final_secondary")}
              </Link>
              <a
                href={whatsappLink(t("cta_final_wa_msg"))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-bold text-white/70 transition-all duration-300 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                {t("cta_final_question_link")}
              </a>
            </div>

            {/* Tagline éditoriale */}
            <div className="relative mx-auto mt-14 max-w-2xl">
              <p className="font-display text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                Diagnostic +{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  candidature ciblée
                </span>{" "}
                + permis d&apos;études.
              </p>
            </div>

            {/* 4 trust signals */}
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: ShieldCheck, label: t("cta_final_foot1") },
                { icon: Receipt, label: t("cta_final_foot2") },
                { icon: Eye, label: t("cta_final_foot3") },
                { icon: Activity, label: t("cta_final_foot4") },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center backdrop-blur-md ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <Icon className="h-4 w-4 text-nexus-orange-300" />
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-white/80">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
