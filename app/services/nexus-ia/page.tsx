import Link from "next/link";
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

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous voulez une réponse rapide à une question simple sur nos services (visa, études, transfert, change…) sans attendre",
    "Vous êtes entrepreneur ou structure et envisagez un assistant IA dédié à votre activité (FAQ client, prise de RDV, prospection)",
    "Vous comprenez qu'une IA n'est pas humaine : elle bascule sur un conseiller dès qu'un dossier sérieux le demande",
  ],
  non: [
    "Vous attendez d'une IA qu'elle traite un dossier officiel (visa, admission, financement) — seul un conseiller humain le peut",
    "Vous cherchez une IA pour fournir des informations sensibles ou personnelles à des tiers — la confidentialité passe avant",
    "Vous voulez remplacer toute votre équipe par un chatbot — l'IA augmente, elle ne remplace pas",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: MessageCircle,
    title: "Discutez avec Nexus IA",
    description:
      "Posez votre question dans le chat. Réponse instantanée 24/7 sur les services Nexus, les démarches courantes et l'orientation.",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "Évaluez le besoin",
    description:
      "Si l'échange suffit, vous repartez avec votre réponse. Si la demande est sérieuse, l'IA propose le bon canal humain.",
  },
  {
    num: "03",
    icon: Workflow,
    title: "Pour un projet IA dédié",
    description:
      "Vous êtes entrepreneur et voulez un assistant IA pour votre activité ? Soumettez votre besoin, nous cadrons un assistant sur-mesure (FAQ, RDV, prospection).",
  },
  {
    num: "04",
    icon: ClipboardCheck,
    title: "Cadrage & devis",
    description:
      "Pour un projet IA dédié : un conseiller revient avec une démo, un périmètre, un devis fixe et un calendrier réaliste.",
  },
];

const STATS = [
  { value: "24/7", label: "Chat disponible" },
  { value: "FR", label: "Réponses en français" },
  { value: "Humain", label: "Relais à tout moment" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function NexusIAPage() {
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
                <Bot className="h-3.5 w-3.5" />
                Nexus IA — Assistant virtuel
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                outillée par l'intelligence artificielle.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Discutez avec Nexus IA pour vos questions courantes (visa,
                études, transfert, change…) ou demandez un assistant IA dédié
                à votre activité. L'IA augmente nos conseillers — elle ne les
                remplace jamais sur les dossiers sérieux.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="#chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <MessageCircle className="h-5 w-5" />
                  Discuter avec Nexus IA
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/services/nexus-ia/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <FileText className="h-5 w-5" />
                  Demander un assistant IA dédié
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Chat gratuit · Sans inscription · Une question complexe ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question complexe que je préfère poser à un conseiller humain."
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
              <p className="text-overline text-brand">Cadre du service</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pour qui ce service est conçu
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nexus IA a deux usages distincts : un chat public 24/7 pour
                tout le monde, et des assistants dédiés sur-mesure pour
                entrepreneurs et structures.
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
                Du chat public à l'assistant dédié
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Le chat public est immédiat. L'assistant dédié exige un
                cadrage. Les deux parcours sont structurés.
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
                    Discuter ou demander un assistant IA dédié.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Chat public gratuit · Cadrage assistant dédié sous 48 h
                    ouvrées.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="#chat"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Discuter avec Nexus IA
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/services/nexus-ia/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-surface-sunken"
                  >
                    <Calendar className="h-4 w-4" />
                    Soumettre un projet IA
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
              <p className="text-overline text-brand">Le service en direct</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Posez une question, recevez une réponse
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                L'IA répond aux questions courantes Nexus en quelques secondes.
                Pour les cas complexes, elle bascule vers un conseiller humain.
              </p>
            </div>

            <div className="mt-10">
              <NexusAIChat />
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Clock,
                  title: "Disponible 24/7",
                  desc: "Jour, nuit, week-end. Pas d'horaires d'ouverture.",
                },
                {
                  icon: Zap,
                  title: "Réponses instantanées",
                  desc: "Pas d'attente. Question posée, réponse donnée.",
                },
                {
                  icon: Bot,
                  title: "Spécialiste Nexus",
                  desc: "Formé sur tous nos services et procédures RCA.",
                },
                {
                  icon: ShieldCheck,
                  title: "Relais humain",
                  desc: "Un conseiller prend le relais dès que nécessaire.",
                },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 text-center shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-headline text-ink">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-body-sm text-ink-muted">{f.desc}</p>
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
              <p className="text-overline text-brand">Quand ça aide</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Deux usages, deux portées
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Le chat public sur ce site, ou un assistant IA sur-mesure que
                nous construisons pour votre activité.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-headline text-ink">
                  Chat public Nexus IA
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Pour orientation, vérification rapide, premières questions
                  avant un rendez-vous, choix du bon service Nexus.
                </p>
                <ul className="mt-4 space-y-2 text-body-sm text-ink">
                  {[
                    "Quel visa pour ma destination ?",
                    "Combien coûte un transfert vers la France ?",
                    "Quel TCF viser pour Entrée express ?",
                    "Différence entre les packs digitalisation ?",
                  ].map((q) => (
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
                  Tester le chat
                </Link>
              </div>

              <div className="rounded-3xl border-2 border-brand/40 bg-brand-subtle/40 p-7 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-headline text-ink">
                  Assistant IA dédié à votre activité
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Pour entrepreneurs et structures qui veulent un assistant
                  IA branché sur leur propre offre, FAQ ou processus.
                </p>
                <ul className="mt-4 space-y-2 text-body-sm text-ink">
                  {[
                    "FAQ client automatisée 24/7",
                    "Pré-qualification de prospects",
                    "Prise de rendez-vous guidée",
                    "Support client de niveau 1",
                  ].map((q) => (
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
                  Soumettre un projet IA
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
              <p className="text-overline text-brand">Principes IA</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                L'IA augmente, elle ne remplace pas
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous utilisons l'IA comme un outil au service de l'humain —
                pas l'inverse.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Lock,
                  title: "Confidentialité",
                  text: "Conversations privées. Données utilisées uniquement pour mieux vous accompagner.",
                },
                {
                  icon: ShieldCheck,
                  title: "Relais humain systématique",
                  text: "Sur tout dossier officiel, un conseiller humain prend la suite. Pas d'exception.",
                },
                {
                  icon: Zap,
                  title: "Réponses sourcées Nexus",
                  text: "Le chat public répond uniquement sur les services Nexus et les démarches RCA.",
                },
                {
                  icon: Workflow,
                  title: "Cadrage avant intégration",
                  text: "Pour un assistant dédié : analyse de l'usage réel avant de proposer une IA.",
                },
                {
                  icon: Bot,
                  title: "Limites assumées",
                  text: "L'IA dit clairement quand elle ne sait pas. Pas d'invention, pas d'à-peu-près.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Transparence",
                  text: "Vous savez toujours que vous parlez à une IA. Le bouton « parler à un humain » est visible.",
                },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {it.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {it.text}
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
              <p className="text-overline text-brand">Engagement</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce que l'IA fait, ce qu'elle ne fait pas
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Une délimitation claire pour préserver la qualité du service
                et votre confiance.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Traiter un dossier officiel à la place d'un conseiller humain",
                    "Garantir la justesse à 100 % sur les cas particuliers — préférer un humain",
                    "Faire des promesses commerciales (admissions, visas) — l'IA n'a pas autorité",
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
                    "Un chat public gratuit, 24/7, en français, sans inscription",
                    "Une orientation rapide vers le bon service ou le bon conseiller",
                    "Pour un assistant dédié : un cadrage écrit et un devis fixe",
                    "Une bascule humaine claire et visible à tout moment",
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
                Le chat public est gratuit. Les assistants dédiés ont un
                cadre tarifaire clair selon le périmètre.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Chat public
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit pour tout visiteur. Sans inscription. Disponible
                  24/7 sur ce site.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Cadrage assistant dédié
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit. Analyse de l'usage, démo et devis fixe avant tout
                  engagement.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Assistant sur-mesure
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Devis fixe selon périmètre. Frais récurrents (hébergement,
                  API IA) annoncés à part avec leur tarif mensuel.
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
                Démarrer la démarche
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Discuter maintenant ou cadrer un projet IA
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Le chat est ouvert ci-dessus. Pour un assistant dédié à votre
                activité, soumettez votre besoin pour un cadrage écrit.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Chat public
                  <br />
                  <span className="text-white">Gratuit 24/7</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Cadrage IA
                  <br />
                  <span className="text-white">Sous 48 h</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Relais
                  <br />
                  <span className="text-white">Humain</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="#chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <MessageCircle className="h-5 w-5" />
                  Discuter avec Nexus IA
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/services/nexus-ia/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre un projet IA
                </Link>
              </div>

              <p className="mt-8 text-caption text-white/70">
                Une question avant de commencer ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Nexus IA."
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
