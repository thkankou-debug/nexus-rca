import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { NexusAIChat } from "@/components/NexusAIChat";
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Check,
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
  Users,
  FileQuestion,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Nexus IA — Assistant virtuel | Nexus RCA",
  description:
    "L'expertise centrafricaine pour vos questions et un assistant IA dédié à votre activité. Chat 24/7 sur le site, et intégrations sur-mesure pour entrepreneurs RCA.",
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

// ─── Composant ──────────────────────────────────────────────────────────────

export default function NexusIAPage() {
  const t = useTranslations("ServiceNexusIa");

  const STATS = [
    { value: t("stat1_value"), label: t("stat1_label") },
    { value: t("stat2_value"), label: t("stat2_label") },
    { value: t("stat3_value"), label: t("stat3_label") },
  ];

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

  const USAGES_PUBLIC = [
    t("usages_public_q1"),
    t("usages_public_q2"),
    t("usages_public_q3"),
    t("usages_public_q4"),
  ];
  const USAGES_DEDIE = [
    t("usages_dedie_q1"),
    t("usages_dedie_q2"),
    t("usages_dedie_q3"),
    t("usages_dedie_q4"),
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

  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO INSTITUTIONNEL ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-hero-institutional pt-32 pb-20 text-white lg:pt-36 lg:pb-24">
          <div className="absolute inset-0 bg-mesh-gradient-subtle" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <Bot className="h-3.5 w-3.5" />
                {t("hero_eyebrow")}
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("hero_title")}
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                {t("hero_subtitle")}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="#chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t("hero_cta_primary")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/services/nexus-ia/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <FileText className="h-5 w-5" />
                  {t("hero_cta_secondary")}
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                {t("hero_trust_before")}
                <a
                  href={whatsappLink(t("wa_complex"))}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  {t("hero_trust_link")}
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

        {/* 1.5 INTRO COURTE ─────────────────────────────────────── */}
        <section className="border-b border-line bg-surface py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-display-sm text-ink lg:text-display-md">
              {t("intro_before")}
              <span className="text-brand">{t("intro_highlight")}</span>
              {t("intro_after")}
            </p>
          </div>
        </section>

        {/* 1.6 CE QUE NOUS FAISONS ─────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:items-start">
              <div>
                <p className="text-overline text-brand">{t("scope_eyebrow")}</p>
                <h2 className="mt-3 font-display text-display-md text-ink">
                  {t("scope_title")}
                </h2>
                <p className="mt-4 text-body-sm text-ink-muted">
                  {t("scope_subtitle")}
                </p>
              </div>
              <ul className="space-y-5">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-4 border-l-2 border-line pl-5 py-1">
                    <div>
                      <h3 className="font-display text-headline text-ink">{t(`scope_item${i}_title`)}</h3>
                      <p className="mt-1 text-body-sm text-ink-muted">{t(`scope_item${i}_desc`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 1.7 CE QUE VOUS OBTENEZ ──────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-overline text-brand">{t("result_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink">{t("result_title")}</h2>
              <p className="mt-4 text-body-lg text-ink-muted">
                {t("result_subtitle")}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface-elevated p-6">
                  <h3 className="font-display text-headline text-ink">{t(`result_item${i}_title`)}</h3>
                  <p className="mt-2 text-body-sm text-ink-muted">{t(`result_item${i}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. POUR QUI CE SERVICE EST CONÇU ────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">{t("pourqui_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("pourqui_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                {t("pourqui_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-emerald-200/60 bg-emerald-50/40 p-7 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    {t("pourqui_oui_title")}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {POUR_QUI_OUI.map((item, i) => (
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
                    {t("pourqui_non_title")}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {POUR_QUI_NON.map((item, i) => (
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
              <p className="text-overline text-brand">{t("metho_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("metho_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                {t("metho_subtitle")}
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
                          {t(`${etape.key}_title`)}
                        </h3>
                      </div>
                      <p className="mt-2 text-body-sm text-ink-muted">
                        {t(`${etape.key}_desc`)}
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
                    {t("metho_cta_eyebrow")}
                  </p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    {t("metho_cta_title")}
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    {t("metho_cta_subtitle")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="#chat"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    {t("metho_cta_primary")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/services/nexus-ia/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-surface-sunken"
                  >
                    <Calendar className="h-4 w-4" />
                    {t("metho_cta_secondary")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CHAT EMBARQUÉ (le service en action) ──────────────── */}
        <section id="chat" className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">{t("chat_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("chat_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
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
                  <div
                    key={f.key}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 text-center shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-headline text-ink">
                      {t(`${f.key}_title`)}
                    </h3>
                    <p className="mt-1 text-body-sm text-ink-muted">{t(`${f.key}_desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. CAS D'USAGE & ASSISTANT DÉDIÉ ────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">{t("usages_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("usages_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                {t("usages_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-headline text-ink">
                  {t("usages_public_title")}
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {t("usages_public_desc")}
                </p>
                <ul className="mt-4 space-y-2 text-body-sm text-ink">
                  {USAGES_PUBLIC.map((q) => (
                    <li key={q} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="#chat"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-5 py-2.5 text-body-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-surface-sunken"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("usages_public_cta")}
                </Link>
              </div>

              <div className="rounded-3xl border-2 border-brand/40 bg-brand-subtle/40 p-7 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-headline text-ink">
                  {t("usages_dedie_title")}
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {t("usages_dedie_desc")}
                </p>
                <ul className="mt-4 space-y-2 text-body-sm text-ink">
                  {USAGES_DEDIE.map((q) => (
                    <li key={q} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/nexus-ia/demarrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  {t("usages_dedie_cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. EXIGENCES & PRINCIPES ──────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">{t("principes_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("principes_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                {t("principes_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PRINCIPES.map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.key}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {t(`${it.key}_title`)}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {t(`${it.key}_desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT DE TRANSPARENCE ────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">{t("engagement_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("engagement_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                {t("engagement_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  {t("engagement_no_title")}
                </p>
                <ul className="mt-4 space-y-3">
                  {ENGAGEMENT_NO.map((item, i) => (
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
                  {t("engagement_yes_title")}
                </p>
                <ul className="mt-4 space-y-3">
                  {ENGAGEMENT_YES.map((item, i) => (
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
              <p className="text-overline text-brand">{t("tarif_eyebrow")}</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                {t("tarif_title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                {t("tarif_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  {t("tarif_1_title")}
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {t("tarif_1_desc")}
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  {t("tarif_2_title")}
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {t("tarif_2_desc")}
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  {t("tarif_3_title")}
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {t("tarif_3_desc")}
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
                {t("cta_final_eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                {t("cta_final_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                {t("cta_final_subtitle")}
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  {t("cta_final_chip1_top")}
                  <br />
                  <span className="text-white">{t("cta_final_chip1_bot")}</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  {t("cta_final_chip2_top")}
                  <br />
                  <span className="text-white">{t("cta_final_chip2_bot")}</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  {t("cta_final_chip3_top")}
                  <br />
                  <span className="text-white">{t("cta_final_chip3_bot")}</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="#chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t("cta_final_primary")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/services/nexus-ia/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <FileText className="h-5 w-5" />
                  {t("cta_final_secondary")}
                </Link>
              </div>

              <p className="mt-8 text-caption text-white/70">
                {t("cta_final_question_before")}
                <a
                  href={whatsappLink(t("cta_final_wa_msg"))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("cta_final_question_link")}
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
