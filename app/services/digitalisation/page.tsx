import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Globe,
  LayoutGrid,
  Sparkles,
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
  Smartphone,
  Workflow,
  TrendingUp,
  Eye,
  Cpu,
} from "lucide-react";
import { whatsappLink, cn } from "@/lib/utils";

export const metadata = {
  title: "Digital & développement d'activité | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour la digitalisation de votre activité. Sites web, WhatsApp Business, formulaires, automatisation. Trois packs en FCFA, devis transparent.",
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
    "Vous avez une activité existante (commerce, service, association) et voulez gagner en visibilité et crédibilité",
    "Vous êtes prêt(e) à fournir vos contenus (textes, photos, logo) ou à accepter notre cadrage pour les produire",
    "Vous comprenez qu'un site n'est pas une fin en soi, mais un outil au service d'objectifs business",
  ],
  non: [
    "Vous voulez un site « parce qu'il faut en avoir un » sans réflexion sur l'usage et l'audience",
    "Vous attendez des résultats marketing immédiats — visibilité Google et acquisition demandent du temps et des contenus réguliers",
    "Vous cherchez le moins cher du marché, sans considérer la qualité et la durabilité du livrable",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (activité, présence existante, pack envisagé, objectifs) ou prenez rendez-vous. Nous comprenons votre projet réel.",
  },
  {
    num: "02",
    icon: Search,
    title: "Cadrage & devis fixe",
    description:
      "Un conseiller Nexus vous reçoit, étudie votre activité et propose un devis avec périmètre exact, livrables, calendrier et pack adapté. Aucun engagement avant validation.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Production structurée",
    description:
      "Conception, design, développement, configuration WhatsApp/e-mail, optimisation. Points d'étape réguliers, validations à chaque jalon, pas de surprise à la livraison.",
  },
  {
    num: "04",
    icon: TrendingUp,
    title: "Mise en ligne & autonomie",
    description:
      "Mise en production, formation à l'auto-gestion (mises à jour simples), accompagnement initial post-lancement. Vous repartez maître de votre outil.",
  },
];

interface PackType {
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  packSlug: string;
}

const PACKS: PackType[] = [
  {
    name: "Essentiel",
    tagline: "Démarrer une présence digitale crédible",
    price: "150 000 - 250 000 FCFA",
    icon: Globe,
    packSlug: "essentiel",
    features: [
      "Site web simple (1 à 3 pages)",
      "WhatsApp Business configuré",
      "Mise en ligne et hébergement",
      "Configuration de base (logo, couleurs)",
      "Formulaire de contact simple",
    ],
  },
  {
    name: "Pro",
    tagline: "Une vraie image professionnelle",
    price: "300 000 - 600 000 FCFA",
    icon: LayoutGrid,
    highlighted: true,
    packSlug: "pro",
    features: [
      "Site web professionnel multi-pages",
      "Formulaire client avancé",
      "Intégration WhatsApp + e-mail",
      "Design et branding sur-mesure simple",
      "Optimisation mobile et vitesse",
      "Pages services détaillées",
    ],
  },
  {
    name: "Premium",
    tagline: "Une plateforme complète pour développer",
    price: "700 000 - 1 500 000 FCFA+",
    icon: Sparkles,
    packSlug: "premium",
    features: [
      "Site web complet + stratégie digitale",
      "Tunnel client (capture, suivi, conversion)",
      "Automatisation WhatsApp et e-mail",
      "Optimisation SEO avancée",
      "Accompagnement stratégique",
      "Tableau de bord client",
      "Formation et support",
    ],
  },
];

const STATS = [
  { value: "3 packs", label: "En FCFA, transparents" },
  { value: "Devis", label: "Fixe avant production" },
  { value: "Formation", label: "À l'auto-gestion incluse" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function DigitalisationPage() {
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
                Service digitalisation
              </span>

              <h1 className="mx-auto mt-6 max-w-4xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    Transformation digitale
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                et structuration de vos processus opérationnels.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Nous étudions votre activité avant de proposer un pack. Si
                votre projet correspond à nos critères, nous le construisons
                proprement — site web, WhatsApp Business, formulaires,
                automatisation — et vous formons à l&apos;auto-gestion.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/services/digitalisation/demarrer"
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
                  href="/rendez-vous?service=digitalisation"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Devis fixe · Tarifs en FCFA · Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Digitalisation."
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

        {/* 1.5 INTRO COURTE ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-nexus-blue-950 sm:text-3xl lg:text-4xl">
              Une présence digitale n&apos;est pas une vitrine. C&apos;est{" "}
              <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                un outil opérationnel
              </span>{" "}
              qui doit servir l&apos;activité, pas la concurrencer.
            </p>
          </div>
        </section>

        {/* 1.6 CE QUE NOUS FAISONS ──────────────────────────────────── */}
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
                  Quatre étapes du diagnostic métier à la livraison documentée.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: "Audit du besoin opérationnel",
                    desc: "Compréhension du métier, des flux et des points de friction actuels avant toute proposition.",
                  },
                  {
                    title: "Cadrage périmètre et budget",
                    desc: "Définition précise des livrables, des fonctionnalités et du devis fixe avant tout démarrage.",
                  },
                  {
                    title: "Réalisation aux standards",
                    desc: "Site web, intégration WhatsApp Business, formulaires, automatisations selon le pack retenu.",
                  },
                  {
                    title: "Livraison et formation",
                    desc: "Remise documentée + session de prise en main pour autonomie complète de l'équipe.",
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

        {/* 1.7 CE QUE VOUS OBTENEZ ──────────────────────────────────── */}
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
                Un outil utilisé au quotidien par votre équipe, pas un site
                qu&apos;on regarde puis qu&apos;on oublie.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Outil aligné au métier",
                  desc: "Pas de gadget. Des fonctionnalités utilisées au quotidien.",
                },
                {
                  title: "Devis fixe sans dépassement",
                  desc: "Vous savez exactement ce que ça coûte avant de signer.",
                },
                {
                  title: "Documentation transmise",
                  desc: "Codes d'accès, procédures et points de contrôle remis à votre équipe.",
                },
                {
                  title: "Autonomie opérationnelle",
                  desc: "Vous pouvez faire tourner l'outil sans dépendre de nous.",
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

        {/* 2. POUR QUI ──────────────────────────────────────────────── */}
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
                Nous n&apos;acceptons pas tous les projets. Cette transparence
                fait partie de notre engagement professionnel — un site mal
                pensé vaut moins que pas de site.
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

        {/* 3. MÉTHODOLOGIE ──────────────────────────────────────────── */}
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
                De la soumission jusqu&apos;à votre autonomie sur l&apos;outil,
                chaque étape est cadrée et tracée.
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

            {/* CTA Premium en sortie de méthodologie */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-nexus-orange-50/30 p-7 shadow-[0_20px_50px_-20px_rgba(255,102,0,0.20)] ring-1 ring-slate-100/80 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                    Démarrer la démarche
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-2xl">
                    Soumettez votre projet de digitalisation.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Étude initiale gratuite. Devis fixe communiqué après
                    cadrage.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/digitalisation/demarrer"
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
                    href="/rendez-vous?service=digitalisation"
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

        {/* 4. LES 3 PACKS ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Nos offres
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Trois packs,{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  trois niveaux d&apos;ambition
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Tarifs indicatifs en FCFA. Le devis final est cadré selon votre
                activité, votre secteur et vos objectifs réels.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {PACKS.map((pack) => {
                const Icon = pack.icon;
                const highlighted = pack.highlighted;
                return (
                  <div
                    key={pack.name}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-3xl p-8 transition-all duration-300 ease-out hover:-translate-y-0.5",
                      highlighted
                        ? "border-2 border-nexus-orange-300/70 bg-gradient-to-br from-nexus-orange-50/60 via-white to-nexus-orange-50/30 shadow-[0_22px_48px_-18px_rgba(255,102,0,0.25)] hover:border-nexus-orange-400/80 hover:shadow-[0_28px_60px_-18px_rgba(255,102,0,0.32)]"
                        : "border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                    )}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/18"
                    />
                    {highlighted && (
                      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_8px_20px_-6px_rgba(255,102,0,0.5)]">
                        Recommandé
                      </div>
                    )}

                    <div className="relative">
                      <div
                        className={cn(
                          "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105",
                          highlighted
                            ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                            : "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900"
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      <h3 className="font-display text-2xl font-bold leading-tight text-nexus-blue-950">
                        {pack.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {pack.tagline}
                      </p>

                      <div className="mt-5 border-y border-slate-200/80 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          Tarif indicatif
                        </p>
                        <p
                          className={cn(
                            "mt-1 font-display text-xl font-bold leading-tight sm:text-2xl",
                            highlighted
                              ? "bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent"
                              : "text-nexus-blue-950"
                          )}
                        >
                          {pack.price}
                        </p>
                      </div>

                      <ul className="mt-5 flex-1 space-y-2.5">
                        {pack.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm leading-relaxed text-nexus-blue-950"
                          >
                            <Check
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0",
                                highlighted
                                  ? "text-nexus-orange-600"
                                  : "text-nexus-blue-700"
                              )}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={`/services/digitalisation/demarrer?pack=${pack.packSlug}`}
                        className={cn(
                          "group/cta mt-6 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 ease-out",
                          highlighted
                            ? "relative overflow-hidden bg-nexus-orange-500 text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                            : "border border-slate-200 bg-white text-nexus-blue-950 shadow-sm hover:-translate-y-0.5 hover:border-nexus-orange-300/70 hover:bg-slate-50"
                        )}
                      >
                        {highlighted && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                          />
                        )}
                        Soumettre avec ce pack
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. CE QUE NOUS FAISONS RÉELLEMENT ─────────────────────────── */}
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

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Périmètre du service
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Sites, WhatsApp,{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  formulaires, automatisation
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Quatre familles d&apos;interventions, articulées autour
                d&apos;un seul objectif : rendre votre activité visible,
                crédible et outillée.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Globe,
                  title: "Site web",
                  text: "Vitrine, e-commerce simple, sur-mesure. Hébergement et nom de domaine inclus.",
                },
                {
                  icon: Smartphone,
                  title: "WhatsApp Business",
                  text: "Catalogue, réponses automatiques, intégration au site, formation à l'usage.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Formulaires & e-mail",
                  text: "Formulaires de contact ou prospection, intégration e-mail, capture de leads.",
                },
                {
                  icon: Workflow,
                  title: "Automatisation simple",
                  text: "Réponses auto, agenda, paiement en ligne, tableau de bord client (pack Premium).",
                },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <article
                    key={it.title}
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
                        {it.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {it.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. POURQUOI SE DIGITALISER ───────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                L&apos;effet attendu
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Quatre effets concrets sur votre activité.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Un site bien pensé, un WhatsApp Business bien configuré et des
                formulaires bien intégrés produisent ces effets — pas
                magiquement, mais de façon mesurable.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: Eye,
                  title: "Être visible quand on vous cherche",
                  text: "Apparaître sur Google, sur les réseaux, là où vos prospects regardent en priorité.",
                },
                {
                  icon: ShieldCheck,
                  title: "Inspirer confiance dès le 1er contact",
                  text: "Un site propre + un numéro WhatsApp Business = crédibilité immédiate.",
                },
                {
                  icon: TrendingUp,
                  title: "Capter des demandes qualifiées",
                  text: "Formulaires bien pensés qui filtrent les demandes et facilitent le suivi.",
                },
                {
                  icon: Cpu,
                  title: "Gagner du temps au quotidien",
                  text: "Réponses automatiques, agenda partagé, archivage des demandes.",
                },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <article
                    key={it.title}
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
                        {it.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {it.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT TRANSPARENCE ────────────────────────────────── */}
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
                Un site n&apos;achète pas{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  le succès commercial
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Nous fabriquons un outil performant. Le développement
                commercial dépend ensuite de la qualité de votre offre, de vos
                contenus et de votre régularité.
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
                      "Garantir un nombre de clients ou un chiffre d'affaires",
                      "Promettre une 1ère page Google immédiate sans contenus",
                      "Maintenir le site à jour à votre place sans contrat de suivi",
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
                      "Un site propre, mobile-friendly, conforme au pack choisi",
                      "Un devis fixe avec périmètre, livrables et calendrier annoncés",
                      "Une formation à l'auto-gestion incluse à chaque pack",
                      "Un accompagnement post-lancement pour démarrer sereinement",
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

        {/* 8. CADRE TARIFAIRE ───────────────────────────────────────── */}
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
                Tarifs en FCFA, devis fixe, frais récurrents annoncés à part.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  iconBg:
                    "bg-gradient-to-br from-emerald-500 to-emerald-600",
                  title: "Cadrage initial",
                  desc: "Gratuit. Périmètre, pack et calendrier validés avant toute production.",
                },
                {
                  icon: ClipboardCheck,
                  iconBg:
                    "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
                  title: "Devis fixe",
                  desc: "Tarif annoncé selon pack et adaptations. Aucune facturation surprise en cours de production.",
                },
                {
                  icon: Wallet,
                  iconBg:
                    "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
                  title: "Frais récurrents",
                  desc: "Hébergement, nom de domaine, services tiers : annoncés à part avec leur tarif annuel exact.",
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
              Lancer votre projet digital
            </span>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Soumettez votre projet pour un cadrage gratuit.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Un conseiller revient vers vous avec un pack adapté, un périmètre
              précis et un calendrier de livraison réaliste.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/services/digitalisation/demarrer"
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
                href="/rendez-vous?service=digitalisation"
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
                  "Bonjour Nexus, j'ai une question sur la digitalisation de mon activité."
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
                Cadrage gratuit
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Devis fixe FCFA</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Formation incluse</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Autonomie complète</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
