import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { NexusAIChat } from "@/components/NexusAIChat";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageCircle,
  FileText,
  Search,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Clock,
  Zap,
  Lock,
  Workflow,
  Sparkles,
  Send,
  GraduationCap,
  Plane,
  Building2,
  Heart,
  Hotel,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Nexus IA — Assistant virtuel | Nexus RCA",
  description:
    "L'expertise centrafricaine pour vos questions et un assistant IA dédié à votre activité. Chat 24/7 sur le site, et intégrations sur-mesure pour entrepreneurs RCA.",
};

// ─── Pattern dot grid sombre ─────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Données : icônes + clés de traduction ─────────────────────────────────

const METHODOLOGIE = [
  { num: "01", icon: MessageCircle, key: "metho_01" },
  { num: "02", icon: Sparkles, key: "metho_02" },
  { num: "03", icon: Workflow, key: "metho_03" },
  { num: "04", icon: ClipboardCheck, key: "metho_04" },
] as const;

const CHAT_FEATURES = [
  { icon: Clock, key: "chat_feature1" },
  { icon: Zap, key: "chat_feature2" },
  { icon: Bot, key: "chat_feature3" },
  { icon: ShieldCheck, key: "chat_feature4" },
] as const;

const PRINCIPES = [
  { icon: Lock, key: "principes_1" },
  { icon: ShieldCheck, key: "principes_2" },
  { icon: Zap, key: "principes_3" },
  { icon: Workflow, key: "principes_4" },
  { icon: Bot, key: "principes_5" },
  { icon: ClipboardCheck, key: "principes_6" },
] as const;

// ─── Suggestions clicables (signature) ────────────────────────────────────
const SUGGESTIONS = [
  { icon: Plane, label: "Visa Canada", href: "/services/visa" },
  { icon: GraduationCap, label: "TCF Score", href: "/services/tcf" },
  { icon: Wallet, label: "Financement étudiant", href: "/services/etudes" },
  { icon: Send, label: "Transfert d'argent", href: "/services/transfert" },
  { icon: Hotel, label: "Hôtels Bangui", href: "/services/billets" },
  { icon: FileCheck, label: "Démarches IRCC", href: "/services/visa" },
] as const;

// ─── Cas d'usage (bento navy signature) ──────────────────────────────────
type UseCase = {
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets: string[];
  master?: boolean;
};

const USE_CASES: UseCase[] = [
  {
    icon: GraduationCap,
    title: "Étudiants",
    desc: "TCF, choix d'orientation Canada/France, comparaison de programmes, financement et bourses, lettres de motivation, démarches IRCC ou Campus France.",
    bullets: [
      "Score TCF visé pour Entrée express",
      "Comparaison MELS / BCBG / provinces",
      "Pré-qualification de dossier d'admission",
    ],
    master: true,
  },
  {
    icon: Plane,
    title: "Voyageurs",
    desc: "Choix du bon visa, billets et hôtels, transferts d'argent depuis la diaspora.",
    bullets: ["Visa adapté à la destination", "Itinéraires & hôtels"],
  },
  {
    icon: Building2,
    title: "Entrepreneurs",
    desc: "Assistant IA dédié à votre activité — FAQ client, prise de RDV, support niveau 1.",
    bullets: ["FAQ automatisée 24/7", "Pré-qualification prospects"],
  },
  {
    icon: Heart,
    title: "Familles",
    desc: "Regroupement familial, dossiers conjoints, accompagnement humain en relais.",
    bullets: ["Conditions & justificatifs", "Bascule humaine systématique"],
  },
];

// ─── Cas types (3 case studies factuels) ─────────────────────────────────
const CAS = [
  {
    badge: "🎓 Orientation étudiante",
    title: "Étudiant qui prépare le Canada",
    desc: "Première vérification du score TCF visé, comparaison rapide MELS / BCBG, identification du bon service Nexus avant rendez-vous avec un conseiller humain.",
    stats: [
      { label: "Profil", value: "Étudiant RCA" },
      { label: "Canal", value: "Chat public" },
      { label: "Sortie", value: "RDV conseiller" },
      { label: "Délai", value: "Immédiat" },
    ],
  },
  {
    badge: "💼 Assistant dédié",
    title: "Entrepreneur RCA — FAQ 24/7",
    desc: "Cadrage d'un assistant IA branché sur l'offre du client, formé sur ses propres documents, intégré à WhatsApp Business pour pré-qualifier les prospects.",
    stats: [
      { label: "Périmètre", value: "FAQ + RDV" },
      { label: "Canal", value: "WhatsApp" },
      { label: "Devis", value: "Fixe" },
      { label: "Mise en route", value: "2-4 semaines" },
    ],
  },
  {
    badge: "🌍 Diaspora — orientation",
    title: "Membre de la diaspora",
    desc: "Réponses rapides aux questions de transfert, choix du canal le plus adapté en frais et délai, orientation vers le service Nexus correspondant.",
    stats: [
      { label: "Profil", value: "Diaspora" },
      { label: "Canal", value: "Chat public" },
      { label: "Sortie", value: "Service Nexus" },
      { label: "Coût", value: "Gratuit" },
    ],
  },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function NexusIAPage() {
  const t = useTranslations("ServiceNexusIa");

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

  const RESULT_ITEMS = [
    { title: t("result_item1_title"), desc: t("result_item1_desc") },
    { title: t("result_item2_title"), desc: t("result_item2_desc") },
    { title: t("result_item3_title"), desc: t("result_item3_desc") },
    { title: t("result_item4_title"), desc: t("result_item4_desc") },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO ────────────────────────────────────────────────── */}
        <PublicHero
          eyebrow={t("hero_eyebrow")}
          accentWord={t("hero_title")}
          subtitle={t("hero_subtitle")}
          ctaPrimary={{
            href: "#chat",
            label: t("hero_cta_primary"),
            icon: MessageCircle,
          }}
          ctaSecondary={{
            href: "/services/nexus-ia/demarrer",
            label: t("hero_cta_secondary"),
            icon: FileText,
          }}
        />

        {/* 2. CHAT INTERFACE MOCKUP — signature unique ──────────── */}
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
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Conversation type
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Voici{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    Nexus IA en action
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Une démonstration visuelle d&apos;un échange typique. Le vrai
                chat fonctionnel est disponible plus bas.
              </p>
            </div>

            {/* Chat mockup card */}
            <div className="relative mx-auto max-w-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-nexus-orange-500/10 blur-3xl"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_60px_-20px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                      />
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-6px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                        <Bot className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold leading-tight text-white">
                        NEXUS IA
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-300">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                        en ligne
                      </p>
                    </div>
                  </div>
                  <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/60 backdrop-blur sm:inline-flex">
                    <Sparkles className="h-3 w-3 text-nexus-orange-300" />
                    Démo
                  </div>
                </div>

                {/* Body — messages */}
                <div className="space-y-4 px-5 py-6 sm:px-6">
                  {/* AI message 1 */}
                  <div className="flex items-end gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-1 ring-white/10">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-slate-100 backdrop-blur">
                      Bonjour ! Je suis Nexus IA. Comment puis-je vous aider ?
                    </div>
                  </div>

                  {/* User message 1 */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]">
                      Quelle bourse pour étudier au Canada ?
                    </div>
                  </div>

                  {/* AI message 2 */}
                  <div className="flex items-end gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-1 ring-white/10">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-slate-100 backdrop-blur">
                      Plusieurs programmes existent : BCBG, MELS, bourses
                      provinciales canadiennes&hellip;
                    </div>
                  </div>

                  {/* User message 2 */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]">
                      Quelle est la différence ?
                    </div>
                  </div>

                  {/* AI typing indicator */}
                  <div className="flex items-end gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-1 ring-white/10">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-nexus-orange-300 animate-typing-dot"
                          style={{ animationDelay: "0s" }}
                        />
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-nexus-orange-300 animate-typing-dot"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-nexus-orange-300 animate-typing-dot"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer — fake input */}
                <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white/40 backdrop-blur">
                      Posez votre question&hellip;
                    </div>
                    <button
                      type="button"
                      aria-label="Envoyer"
                      className="group/send relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-nexus-orange-500 text-white shadow-[0_8px_20px_-6px_rgba(255,102,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/send:left-[120%] group-hover/send:opacity-100"
                      />
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-white/60">
              Échange illustratif. Pour parler à Nexus IA en vrai, descendez à
              la section &laquo;&nbsp;{t("chat_title")}&nbsp;&raquo;.
            </p>
          </div>
        </section>

        {/* 3. SUGGESTIONS CLICABLES — signature ────────────────── */}
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

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Sujets fréquents
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Pas d&apos;idée ?{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    Commencez ici
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Six entrées rapides vers les services les plus consultés sur
                Nexus.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-4">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.label}
                      href={s.href}
                      className="group relative w-[60vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                      />
                      <div className="relative flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-1 ring-white/10 shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-display text-sm font-bold leading-tight text-white">
                          {s.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop : grid 3 col */}
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                    />
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-1 ring-white/10 shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-display text-sm font-bold leading-tight text-white sm:text-base">
                          {s.label}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-nexus-orange-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. CAS D'USAGE — bento navy signature ─────────────────── */}
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
            className="pointer-events-none absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Cas d&apos;usage
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Pour qui Nexus IA est{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    le plus utile
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Quatre profils, quatre usages concrets de l&apos;assistant.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {USE_CASES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <article
                      key={c.title}
                      className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {c.desc}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Desktop : bento varié — master 2x large orange */}
            <div className="hidden sm:grid sm:grid-cols-4 sm:gap-5">
              {USE_CASES.map((c) => {
                const Icon = c.icon;
                const isMaster = c.master === true;
                const span = isMaster
                  ? "sm:col-span-2 sm:row-span-2"
                  : "sm:col-span-2";

                return (
                  <article
                    key={c.title}
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
                    <div className="relative flex h-full flex-col">
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
                        {c.title}
                      </h3>
                      <p
                        className={`mt-3 leading-relaxed text-slate-200 ${
                          isMaster ? "text-base" : "text-sm"
                        }`}
                      >
                        {c.desc}
                      </p>
                      <ul className="mt-5 space-y-2">
                        {c.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2 text-sm leading-relaxed text-slate-200"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-300" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
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

        {/* 6. COMMENT ÇA MARCHE — méthodologie timeline ────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
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
                {t("metho_title")}
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
                    href="#chat"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    <MessageCircle className="h-4 w-4" />
                    {t("metho_cta_primary")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/services/nexus-ia/demarrer"
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

        {/* 7. CE QUE VOUS OBTENEZ — navy + scroll-snap mobile ─── */}
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

            {/* Mobile : scroll-snap horizontal */}
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

        {/* 9. LE VRAI CHAT (NexusAIChat) ─────────────────────────── */}
        <section
          id="chat"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24"
        >
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
            className="pointer-events-none absolute -right-40 bottom-1/3 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("chat_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("chat_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                {t("chat_subtitle")}
              </p>
            </div>

            <div className="mt-10">
              <NexusAIChat />
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CHAT_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <article
                    key={f.key}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                    />
                    <div className="relative">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                        {t(`${f.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {t(`${f.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. ENGAGEMENT — l'IA augmente, ne remplace pas ────── */}
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
                {t("engagement_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("engagement_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Ce que l'IA ne peut pas — 1 col rose */}
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

              {/* Ce que nous garantissons — 2 col orange */}
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

            {/* Bandeau principes (6 cards micro) */}
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRINCIPES.map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.key}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nexus-blue-900/60 text-nexus-orange-300 ring-1 ring-nexus-orange-400/20 backdrop-blur">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-bold leading-tight text-white">
                          {t(`${it.key}_title`)}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                          {t(`${it.key}_desc`)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. CAS TYPES — 3 case studies factuels ─────────────── */}
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
                {t("usages_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("usages_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("usages_subtitle")}
              </p>
            </div>

            {/* Mobile + Desktop */}
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

        {/* 12. CADRE TARIFAIRE — gratuit + dédié ────────────────── */}
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
              {[
                { key: "tarif_1", icon: Search, highlight: false },
                { key: "tarif_2", icon: ClipboardCheck, highlight: true },
                { key: "tarif_3", icon: Wallet, highlight: false },
              ].map((tarif) => {
                const Icon = tarif.icon;
                const isHi = tarif.highlight;
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

        {/* 13. CTA FINAL — hero card premium navy ─────────────── */}
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

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                {t("cta_final_chip1_top")}
                <br />
                <span className="text-white">
                  {t("cta_final_chip1_bot")}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                {t("cta_final_chip2_top")}
                <br />
                <span className="text-white">
                  {t("cta_final_chip2_bot")}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                {t("cta_final_chip3_top")}
                <br />
                <span className="text-white">
                  {t("cta_final_chip3_bot")}
                </span>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="#chat"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <MessageCircle className="h-4 w-4" />
                {t("cta_final_primary")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/services/nexus-ia/demarrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
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

            {/* 4 trust signals */}
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: Bot, label: "IA Nexus dédiée" },
                { icon: ShieldCheck, label: "Relais humain" },
                { icon: Clock, label: "24/7" },
                { icon: TrendingUp, label: "Devis fixe" },
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
