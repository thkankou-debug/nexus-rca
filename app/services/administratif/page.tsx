import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Check,
  Calendar,
  MessageCircle,
  Search,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Languages,
  Edit3,
  Printer,
  FileSignature,
  Eye,
  Lock,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Services administratifs, CV & traductions | Nexus RCA",
  description:
    "L'expertise centrafricaine pour vos documents administratifs : CV format canadien, lettres, traductions, formulaires officiels, impression. Documents prêts à déposer, livrés dans les délais.",
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
    "Vous voulez un document propre, conforme au format attendu (CV canadien, lettre formelle, formulaire IRCC) sans approximation",
    "Vous acceptez de fournir vos informations exactes et de répondre à nos questions de cadrage",
    "Vous êtes prêt(e) à valider une relecture finale avant la livraison",
  ],
  non: [
    "Vous cherchez un modèle générique recopié sans adaptation à votre profil — ce n'est pas notre méthode",
    "Vous voulez signer un dossier officiel à votre place — pour des raisons légales, la signature reste celle du demandeur",
    "Vous attendez un document écrit en quelques minutes sans cadrage — chaque livrable passe par une relecture",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (type de prestation, format cible, langue, urgence) ou prenez rendez-vous. Nous récupérons les pièces nécessaires.",
  },
  {
    num: "02",
    icon: Search,
    title: "Cadrage & devis",
    description:
      "Un conseiller Nexus précise le périmètre exact, propose un devis fixe et un délai de livraison. Aucune action engagée avant validation.",
  },
  {
    num: "03",
    icon: Edit3,
    title: "Production rigoureuse",
    description:
      "Rédaction, traduction ou remplissage assuré par un membre qualifié de l'équipe. Codes du document cible (CV canadien, IRCC…) maîtrisés.",
  },
  {
    num: "04",
    icon: ShieldCheck,
    title: "Relecture & livraison",
    description:
      "Relecture systématique avant envoi. Livraison numérique (PDF + modifiable) et/ou impression à l'agence Bangui selon votre choix.",
  },
];

interface PrestationType {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delai: string;
}

const PRESTATIONS: PrestationType[] = [
  {
    icon: FileSignature,
    title: "CV & lettres de motivation",
    description:
      "CV format canadien, européen ou africain. Lettre de motivation sur-mesure (études, emploi, visa, bourse). Cadrage par entretien si besoin.",
    delai: "24 à 48 h",
  },
  {
    icon: Languages,
    title: "Traductions FR ↔ EN",
    description:
      "Traduction professionnelle de documents courts et officiels. Pour traductions assermentées (tribunaux, certains consulats), orientation vers traducteur agréé.",
    delai: "24 à 72 h",
  },
  {
    icon: ClipboardCheck,
    title: "Formulaires officiels",
    description:
      "Remplissage IRCC, France-Visas, consulats, dossiers universitaires. Préparation complète, accompagnement ligne par ligne. Signature : vous.",
    delai: "48 h à 5 jours",
  },
  {
    icon: Printer,
    title: "Impression, scan, reliure",
    description:
      "Impression couleur ou N/B, reliure, plastification, scan haute qualité, numérisation et envoi électronique de dossiers complets.",
    delai: "Dans la journée",
  },
];

const STATS = [
  { value: "Devis", label: "Fixe avant production" },
  { value: "Relecture", label: "Systématique avant livraison" },
  { value: "Confidentialité", label: "Documents non rediffusés" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function AdministratifPage() {
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
                Services administratifs
              </span>

              <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    Gestion rigoureuse
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                de vos démarches administratives critiques.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                CV au format attendu, lettres adaptées, traductions
                professionnelles, formulaires IRCC remplis avec rigueur,
                impression à Bangui. Vos documents sortent prêts à être
                déposés — pas réécrits par le destinataire.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/services/administratif/demarrer"
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
                  href="/rendez-vous?service=administratif"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Devis gratuit · Confidentialité totale · Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Administratif."
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
              Un document officiel ne supporte pas l&apos;à-peu-près. Une virgule, un format,
              une omission peuvent faire la différence entre{" "}
              <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                une décision favorable et un refus
              </span>
              .
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
                  Quatre étapes structurées, du cadrage du livrable à la relecture finale.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  { title: "Cadrage du livrable attendu", desc: "Identification du format, de la langue et des conventions exactes attendues par le destinataire." },
                  { title: "Rédaction structurée", desc: "CV, lettre, attestation : produits selon les standards de la juridiction ou de l'institution cible." },
                  { title: "Traduction conforme", desc: "Français-anglais, français-arabe : traductions certifiées le cas échéant." },
                  { title: "Relecture finale", desc: "Double passage qualité avant remise. Aucune coquille, aucune incohérence." },
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
                Des documents prêts à déposer, sans correction de dernière minute.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Format attendu respecté", desc: "CV canadien si Canada, Europass si UE, format consulaire si visa, etc." },
                { title: "Cohérence éditoriale", desc: "Ton, style et terminologie ajustés au destinataire et au contexte." },
                { title: "Conformité aux normes", desc: "Traductions reconnues, signatures et tampons selon procédure officielle." },
                { title: "Document prêt à déposer", desc: "Aucune correction à faire vous-même au dernier moment." },
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
                Cadre du service
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Pour qui ce service est conçu.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Nous travaillons avec rigueur sur chaque document. Cette
                exigence fait partie de notre engagement professionnel.
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
                Du brief initial jusqu&apos;à la livraison du document, chaque
                étape est cadrée et tracée.
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
                    Soumettez votre besoin documentaire.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Devis sous quelques heures. Délai annoncé avant production.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/administratif/demarrer"
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
                    href="/rendez-vous?service=administratif"
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

        {/* 4. PRESTATIONS ───────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Périmètre du service
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Quatre familles de{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  prestations
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Chaque famille a ses codes et ses livrables. Le devis précise
                le périmètre exact selon votre besoin.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {PRESTATIONS.map((p) => {
                const Icon = p.icon;
                return (
                  <article
                    key={p.title}
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
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {p.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                        Délai indicatif : {p.delai}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. EXIGENCES QUALITÉ ─────────────────────────────────── */}
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
                Exigences qualité
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Pas de modèles copiés.{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  Chaque document est cadré
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                La qualité ne tient pas à un beau gabarit, mais à la
                pertinence du contenu pour le destinataire réel.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileSignature,
                  title: "Codes du format cible",
                  text: "CV canadien ≠ CV français. IRCC ≠ France-Visas. Nous adaptons systématiquement.",
                },
                {
                  icon: Edit3,
                  title: "Cadrage par entretien",
                  text: "Si vos infos sont incomplètes, un échange court suffit à reconstituer un parcours propre.",
                },
                {
                  icon: Eye,
                  title: "Relecture systématique",
                  text: "Aucun document n'est livré sans relecture. Pas de fautes évitables, pas d'incohérences.",
                },
                {
                  icon: Languages,
                  title: "Langues maîtrisées",
                  text: "Français, anglais. Pour traductions assermentées, orientation vers traducteur agréé.",
                },
                {
                  icon: Lock,
                  title: "Confidentialité totale",
                  text: "Documents et informations strictement confidentiels. Aucune rediffusion ni réutilisation.",
                },
                {
                  icon: ShieldCheck,
                  title: "Délais tenus",
                  text: "Délai annoncé = délai livré. En cas de risque, prévenu à l'avance, pas après.",
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

        {/* 6. CAS TYPES ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Cas types accompagnés
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Voici comment ça se passe concrètement.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {[
                {
                  badge: "📄 CV format canadien",
                  title: "Reconstruction CV pour candidature étudiante",
                  desc: "Entretien d'une trentaine de minutes pour reconstituer le parcours, identification des expériences à valoriser, mise au format canadien strict (longueur, vocabulaire, organisation), relecture et livraison PDF + version modifiable.",
                  result:
                    "Résultat : CV propre déposé dans 3 universités, dossier pris au sérieux dès le tri initial.",
                },
                {
                  badge: "📋 Formulaire IRCC complet",
                  title: "Préparation dossier permis d'études Canada",
                  desc: "Liste précise des pièces, remplissage ligne par ligne avec le demandeur, traduction de 3 documents, vérification des cohérences entre formulaires, accompagnement jusqu'à la signature et soumission par le demandeur.",
                  result:
                    "Résultat : dossier propre, soumis sans aller-retour avec l'agent de visas.",
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

        {/* 7. ENGAGEMENT DE TRANSPARENCE ────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Engagement
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Ce que nous faisons,{" "}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  ce que nous ne faisons pas
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Une délimitation claire évite les malentendus et protège la
                qualité du livrable comme la conformité légale.
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
                      "Signer ou soumettre un dossier officiel à votre place",
                      "Garantir l'acceptation d'un visa, d'une admission ou d'une candidature",
                      "Délivrer une traduction assermentée — orientation vers traducteur agréé",
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
                      "Un document conforme au format attendu par le destinataire",
                      "Une relecture systématique avant chaque livraison",
                      "Un délai annoncé à l'avance et respecté",
                      "Une confidentialité totale sur les documents transmis",
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
                Devis fixe selon la prestation, communiqué avant production.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  iconBg:
                    "bg-gradient-to-br from-emerald-500 to-emerald-600",
                  title: "Cadrage initial",
                  desc: "Gratuit. Périmètre, format cible et délai validés avant toute production.",
                },
                {
                  icon: ClipboardCheck,
                  iconBg:
                    "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
                  title: "Devis fixe",
                  desc: "Tarif annoncé avant production selon le type de document. Aucune facturation surprise en cours de route.",
                },
                {
                  icon: Wallet,
                  iconBg:
                    "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
                  title: "Frais externes",
                  desc: "Si frais externes nécessaires (traducteur assermenté, frais postaux, impression volumineuse), détaillés à part.",
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

        {/* 9. CTA FINAL Premium tech ─────────────────────────────── */}
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
              Démarrer la démarche
            </span>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Précisez votre besoin, recevez un devis sous quelques heures.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              CV, lettre, traduction, formulaire ou impression — un
              conseiller revient avec un périmètre clair, un délai et un
              prix fixe.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                Devis
                <br />
                <span className="text-white">Fixe</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                Délai
                <br />
                <span className="text-white">Tenu</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                Confidentialité
                <br />
                <span className="text-white">Totale</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href={whatsappLink(
                  "Bonjour Nexus, j'ai un document administratif à préparer."
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
                href="/rendez-vous?service=administratif"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Prendre rendez-vous
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                Devis fixe
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Délai tenu</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Relecture systématique</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Confidentialité totale</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
