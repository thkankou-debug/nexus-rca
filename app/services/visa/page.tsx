import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  MapPin,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";
import { VisaRequirementChecker } from "@/components/visa/VisaRequirementChecker";
import { EVisaEligibilityChecker } from "@/components/visa/EVisaEligibilityChecker";
import { VisaDocumentChecklist } from "@/components/visa/VisaDocumentChecklist";
import { VisaExpressForm } from "@/components/visa/VisaExpressForm";

export const metadata = {
  title: "Visa & e-Visa | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos démarches visa. Nous étudions chaque dossier avec rigueur avant d'accepter de l'accompagner. Schengen, Canada, e-Visa Asie et Moyen-Orient.",
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
    "Vous avez un projet de voyage, d'études, business ou famille structuré",
    "Vous acceptez un délai de préparation cohérent avec les exigences consulaires",
    "Vous souhaitez un dossier professionnel plutôt qu'une soumission rapide",
  ],
  non: [
    "Vous avez un départ dans moins de 10 jours pour un visa Schengen ou Canada",
    "Vous avez un historique de plusieurs refus successifs sans changement de situation",
    "Vous cherchez uniquement à obtenir un visa « à tout prix »",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons les éléments essentiels de votre situation.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse de faisabilité",
    description:
      "Un conseiller Nexus étudie votre dossier, identifie le type de visa adapté et évalue la faisabilité. Bilan honnête écrit avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Constitution du dossier complet selon les exigences exactes du consulat ciblé : formulaires, justificatifs, lettre, préparation à l'entretien.",
  },
  {
    num: "04",
    icon: Eye,
    title: "Suivi jusqu'au résultat",
    description:
      "Prise de rendez-vous au consulat ou centre VFS/TLS, accompagnement le jour du dépôt, suivi actif jusqu'à la décision finale, communication transparente.",
  },
];

const E_VISA_AVANTAGES = [
  {
    icon: Smartphone,
    title: "100 % en ligne",
    description: "La procédure ne nécessite pas de déplacement au consulat.",
  },
  {
    icon: Zap,
    title: "Délai court",
    description: "48 heures à 5 jours selon la destination.",
  },
  {
    icon: MapPin,
    title: "Pas de biométrie",
    description: "Aucun rendez-vous physique à Yaoundé n'est requis.",
  },
  {
    icon: CheckCircle2,
    title: "Moins de pièces",
    description: "Procédure plus accessible que le visa classique.",
  },
];

interface Destination {
  name: string;
  type: string;
  emoji: string;
}

interface Region {
  title: string;
  emoji: string;
  description: string;
  destinations: Destination[];
  highlight?: boolean;
}

const REGIONS: Region[] = [
  {
    title: "Asie",
    emoji: "🌏",
    description: "Voyages d'affaires, tourisme, études — forte demande RCA.",
    highlight: true,
    destinations: [
      { name: "Inde", type: "e-Visa tourisme & affaires", emoji: "🇮🇳" },
      { name: "Indonésie (Bali)", type: "e-Visa tourisme", emoji: "🇮🇩" },
      { name: "Vietnam", type: "e-Visa rapide", emoji: "🇻🇳" },
      { name: "Thaïlande", type: "Visa & e-Visa", emoji: "🇹🇭" },
      { name: "Sri Lanka", type: "ETA en ligne", emoji: "🇱🇰" },
      { name: "Chine", type: "Visa classique", emoji: "🇨🇳" },
    ],
  },
  {
    title: "Moyen-Orient",
    emoji: "🌍",
    description: "Business, commerce, transit aérien.",
    destinations: [
      { name: "Émirats Arabes Unis (Dubaï)", type: "e-Visa rapide", emoji: "🇦🇪" },
      { name: "Turquie", type: "e-Visa simplifié", emoji: "🇹🇷" },
    ],
  },
  {
    title: "Europe & Amérique",
    emoji: "🌎",
    description:
      "Démarches consulaires complètes — biométrie souvent à Yaoundé ou Douala.",
    destinations: [
      {
        name: "Visa Schengen",
        type: "Tourisme, études, travail (26 pays)",
        emoji: "🇪🇺",
      },
      { name: "Canada", type: "Visiteur, études, travail", emoji: "🇨🇦" },
    ],
  },
  {
    title: "Afrique",
    emoji: "🌍",
    description: "Démarches régionales et continentales.",
    destinations: [
      { name: "Maroc", type: "Visa & e-Visa", emoji: "🇲🇦" },
      { name: "Kenya", type: "e-Visa en ligne", emoji: "🇰🇪" },
      { name: "Rwanda", type: "e-Visa rapide", emoji: "🇷🇼" },
    ],
  },
];

const STATS = [
  { value: "Étude", label: "Initiale gratuite" },
  { value: "Devis", label: "Fixe avant engagement" },
  { value: "Bilan", label: "Honnête écrit" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function VisaPage() {
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
                Service visa
              </span>

              <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Visa &{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    e-Visa
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Nous étudions chaque dossier avec rigueur avant d&apos;accepter
                de l&apos;accompagner. Si votre projet correspond à nos
                critères, nous structurons votre dossier selon les exigences
                exactes du consulat ciblé et menons votre demande jusqu&apos;à
                la décision.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/services/visa/demarrer"
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
                  href="/rendez-vous?service=visa"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Étude initiale gratuite · Bilan de faisabilité honnête ·{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service visa avant de soumettre ma demande."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  Question sur WhatsApp
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

        {/* 1.0 DIAGNOSTIC VISA ──────────────────────────────────────── */}
        <section
          id="diagnostic"
          className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28"
        >
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

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Diagnostic gratuit
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Évaluez votre dossier en{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  60 secondes
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Deux outils Nexus pour identifier votre type de visa et vos
                exigences avant même de nous contacter — sans inscription.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <VisaRequirementChecker />
              <EVisaEligibilityChecker />
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
              Le visa n&apos;est pas une formalité. C&apos;est une décision
              d&apos;État qui demande{" "}
              <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                structure, transparence et conformité
              </span>
              .
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
                  Quatre prestations encadrées, livrables documentés à chaque
                  étape.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: "Audit du projet et identification de la procédure",
                    desc: "Schengen, Canada, e-Visa, biométrie : nous déterminons la procédure exacte applicable à votre destination et à votre profil avant tout engagement.",
                  },
                  {
                    title: "Constitution du dossier aux exigences du consulat",
                    desc: "Pièces administratives, lettre de motivation, ressources, hébergement, assurance : tout est cadré selon le référentiel exact du poste consulaire ciblé.",
                  },
                  {
                    title: "Prise de rendez-vous TLS/VFS et coordination",
                    desc: "Réservation du créneau, préparation du dossier physique remis prêt-à-déposer, instructions précises pour la dépose à Yaoundé.",
                  },
                  {
                    title: "Suivi jusqu'à la décision",
                    desc: "Réponse aux compléments d'information demandés, ajustement du dossier si nécessaire, transmission de la décision finale.",
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
                Pas de promesse de visa — la décision appartient au consulat.
                En revanche, voici ce que nous vous garantissons concrètement.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Un dossier conforme dès la première dépose",
                  desc: "Aucun retour pour pièces manquantes ou non conformes au référentiel consulaire.",
                },
                {
                  title: "Une compréhension claire de vos chances",
                  desc: "Bilan de faisabilité écrit avant tout engagement. Pas de zone grise.",
                },
                {
                  title: "Une économie de déplacements",
                  desc: "Un seul aller-retour Bangui-Yaoundé pour la biométrie. Tout le reste géré depuis nos bureaux.",
                },
                {
                  title: "Un interlocuteur unique",
                  desc: "Du premier contact à la décision finale, le même conseiller suit votre dossier.",
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
                      Service adapté à vous si…
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
                      Pas adapté si…
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
                De la soumission à la décision, chaque étape est documentée et
                communiquée. Vous savez à tout moment où en est votre dossier.
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
                    Soumettez votre dossier dès aujourd&apos;hui.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Étude initiale gratuite. Bilan de faisabilité écrit.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/visa/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    Soumettre mon dossier
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=visa"
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

        {/* 4. DESTINATIONS ──────────────────────────────────────────── */}
        <section
          id="destinations"
          className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Destinations couvertes
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Treize destinations principales,{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  et davantage sur demande
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Si votre destination n&apos;est pas listée, contactez-nous —
                nous traitons à la demande selon la complexité du dossier.
              </p>
            </div>

            <div className="space-y-10">
              {REGIONS.map((region) => (
                <div key={region.title}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{region.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold tracking-tight text-nexus-blue-950 sm:text-2xl">
                          {region.title}
                        </h3>
                        {region.highlight && (
                          <span className="rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-orange-700">
                            Forte demande
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {region.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {region.destinations.map((dest) => (
                      <article
                        key={dest.name}
                        className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_12px_28px_-12px_rgba(255,102,0,0.20)]"
                      >
                        <span className="text-2xl transition-transform duration-300 ease-out group-hover:scale-110">
                          {dest.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-bold text-nexus-blue-950">
                            {dest.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {dest.type}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. e-VISA Premium tech (déjà navy, polish léger) ─────────── */}
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
              <div className="relative mx-auto mb-4 inline-flex">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 opacity-50 blur-md"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_12px_30px_-8px_rgba(255,102,0,0.55)]">
                  <Smartphone className="h-6 w-6" />
                </div>
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Visa électronique
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Le e-Visa, procédure simplifiée.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Pour de nombreuses destinations, la procédure se déroule
                entièrement en ligne. Aucun déplacement à Yaoundé n&apos;est
                requis.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {E_VISA_AVANTAGES.map((avantage) => {
                const Icon = avantage.icon;
                return (
                  <article
                    key={avantage.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.08]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold text-white">
                        {avantage.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300/95">
                        {avantage.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-nexus-orange-500/30 bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/10 to-nexus-orange-500/5 p-7 text-center backdrop-blur-md sm:p-8">
              <p className="text-base leading-relaxed text-white sm:text-lg">
                <strong className="text-nexus-orange-300">À savoir : </strong>
                tous les pays ne proposent pas le e-Visa. La procédure adaptée
                à votre destination vous sera indiquée à l&apos;étape
                d&apos;analyse.
              </p>
            </div>
          </div>
        </section>

        {/* 5.5 DOCUMENTS PAR TYPE DE VISA ────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Documents fréquents
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Pièces requises selon votre type de visa.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Liste indicative par type. Le consulat ciblé peut exiger des
                pièces complémentaires — c&apos;est ce que Nexus cadre pour
                vous.
              </p>
            </div>

            <VisaDocumentChecklist />
          </div>
        </section>

        {/* 6. CAS TYPES ─────────────────────────────────────────────── */}
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
                Cas types traités
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Voici comment ça se passe concrètement.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {[
                {
                  badge: "🎓 Études en France",
                  title: "Étudiante en master, admission validée",
                  desc: "Visa Schengen études, biométrie obligatoire à Yaoundé. Nexus RCA monte le dossier complet (admission, ressources, hébergement, assurance, lettre de motivation), prend le rendez-vous TLS et remet à la cliente un dossier physique prêt à déposer.",
                  result:
                    "Résultat : un seul aller-retour Bangui-Yaoundé. Dossier conforme dès le premier passage.",
                },
                {
                  badge: "💼 Salon professionnel à Dubaï",
                  title: "Cadre d'une PME centrafricaine, délais courts",
                  desc: "Premier voyage international, agenda chargé, salon dans 10 jours. Nexus RCA prépare l'e-Visa EAU en 48 à 72 heures, organise la réservation d'hôtel à proximité du salon, et transmet le visa par e-mail avant le décollage.",
                  result:
                    "Résultat : aucun déplacement physique. Tout traité depuis Bangui.",
                },
              ].map((cas) => (
                <article
                  key={cas.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-7 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                      {cas.badge}
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      {cas.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {cas.desc}
                    </p>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-nexus-blue-950">
                      {cas.result}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT TRANSPARENCE ────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Engagement
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Aucune agence sérieuse ne peut{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  garantir un visa
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                La décision finale appartient toujours aux autorités
                consulaires. Toute structure qui vous promet une obtention vous
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
                      "Garantir l'obtention d'un visa",
                      "Influencer la décision consulaire",
                      "Promettre une admission certaine",
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
                      "Un dossier solide et complet, conforme aux exigences exactes du consulat",
                      "Une présentation optimisée qui valorise votre profil",
                      "La réduction maximale des risques de refus pour motifs évitables",
                      "Un conseil honnête sur vos chances réelles avant tout engagement",
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
                  title: "Étude initiale",
                  desc: "Gratuite, sans engagement. Bilan de faisabilité écrit.",
                },
                {
                  icon: ClipboardCheck,
                  iconBg:
                    "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
                  title: "Accompagnement Nexus",
                  desc: "Devis fixe communiqué après le bilan de faisabilité. Aucune facturation surprise en cours de route.",
                },
                {
                  icon: Wallet,
                  iconBg:
                    "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
                  title: "Frais consulaires",
                  desc: "À votre charge, montant détaillé à l'avance par pays. Reversés directement aux autorités.",
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

        {/* 8.5 FORMULAIRE EXPRESS ────────────────────────────────────── */}
        <section
          id="demarrer"
          className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24 lg:py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Démarche express
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Soumettez votre dossier.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Un conseiller Nexus revient vers vous sous 24 h à 3 jours selon
                urgence. Étude initiale gratuite, bilan écrit avant tout
                engagement.
              </p>
            </div>

            <VisaExpressForm />
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
              Une question avant de démarrer
            </span>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Parlons de votre projet.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Vous hésitez sur la procédure, le timing ou les pièces ? Notre
              équipe à Bangui vous répond personnellement.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href={whatsappLink(
                  "Bonjour Nexus, j'ai une question sur le service visa avant de soumettre ma demande."
                )}
                target="_blank"
                rel="noreferrer"
                className="group/wa relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/wa:left-[120%] group-hover/wa:opacity-100"
                />
                <MessageCircle className="h-4 w-4" />
                Discuter sur WhatsApp
              </a>
              <Link
                href="/rendez-vous?service=visa"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Prendre rendez-vous
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                Étude gratuite
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Bilan écrit</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Devis fixe</span>
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
