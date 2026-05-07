import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  FileSignature,
  FileText,
  Globe2,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCircle,
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

// ─── Pattern dot grid ───────────────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
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
    "Vous cherchez uniquement à obtenir un visa « à tout prix »",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: MessageCircle,
    title: "Brief stratégique",
    description:
      "Recueil structuré des éléments du projet : objet, calendrier, situation personnelle et professionnelle. Un échange approfondi pour comprendre l'enjeu réel.",
  },
  {
    num: "02",
    icon: FileSearch,
    title: "Étude de faisabilité",
    description:
      "Analyse du dossier, identification du poste consulaire ciblé, évaluation des points forts et des risques. Bilan honnête écrit transmis avant tout engagement.",
  },
  {
    num: "03",
    icon: Layers,
    title: "Stratégie & cadrage",
    description:
      "Construction du fil conducteur du dossier : motivation, ressources, hébergement, attaches, cohérence narrative. Définition de la stratégie documentaire.",
  },
  {
    num: "04",
    icon: ClipboardCheck,
    title: "Constitution du dossier",
    description:
      "Pièces administratives, lettres, justificatifs financiers et professionnels rassemblés selon le référentiel exact du poste consulaire ciblé.",
  },
  {
    num: "05",
    icon: Eye,
    title: "Examen interne",
    description:
      "Double-relecture systématique par un binôme de conseillers avant tout dépôt. Vérification de la conformité, de la cohérence et de la complétude.",
  },
  {
    num: "06",
    icon: Calendar,
    title: "Dépôt & coordination",
    description:
      "Prise de rendez-vous TLS/VFS, accompagnement du déplacement à Yaoundé, coordination de la biométrie. Dossier physique remis prêt à déposer.",
  },
  {
    num: "07",
    icon: ShieldCheck,
    title: "Suivi de la décision",
    description:
      "Réponse aux compléments d'information demandés, ajustement du dossier si nécessaire, transmission de la décision finale dès sa notification.",
  },
];

// Indicateurs qualitatifs (NEW E)
const INDICATEURS = [
  {
    icon: Scale,
    label: "Sélectif",
    sub: "Étude initiale obligatoire",
  },
  {
    icon: FileSearch,
    label: "Rigoureux",
    sub: "Bilan écrit avant engagement",
  },
  {
    icon: ClipboardCheck,
    label: "Documenté",
    sub: "Procédure tracée jusqu'à décision",
  },
  {
    icon: Lock,
    label: "Confidentiel",
    sub: "Protocole strict",
  },
];

// Piliers approche Expert (NEW A)
const APPROCHE_PILIERS = [
  {
    icon: UserCircle,
    title: "Interlocuteur unique",
    desc: "Du premier contact à la décision finale, un seul conseiller pilote votre dossier.",
  },
  {
    icon: ShieldCheck,
    title: "Référentiel consulaire",
    desc: "Dossier construit selon les exigences exactes du poste consulaire ciblé.",
  },
  {
    icon: Eye,
    title: "Suivi traçable",
    desc: "Chaque décision est documentée, chaque étape est communiquée par écrit.",
  },
];

// Domaines d'intervention (NEW B)
interface ZoneCompetence {
  id: string;
  region: string;
  count: string;
  detail: string;
  icon: typeof Globe2;
}

const ZONES_COMPETENCE: ZoneCompetence[] = [
  {
    id: "schengen",
    region: "Schengen",
    count: "26 pays",
    detail: "Procédure cadrée — biométrie Yaoundé",
    icon: Globe2,
  },
  {
    id: "canada",
    region: "Canada",
    count: "1 destination",
    detail: "Procédure cadrée — visiteur, études, travail",
    icon: MapPin,
  },
  {
    id: "asie",
    region: "e-Visa Asie",
    count: "5 destinations",
    detail: "Inde, Vietnam, Thaïlande, Sri Lanka, Chine",
    icon: Globe2,
  },
  {
    id: "mena",
    region: "Moyen-Orient & Afrique",
    count: "5 destinations",
    detail: "Émirats, Turquie, Maroc, Kenya, Rwanda",
    icon: Globe2,
  },
];

// Le cabinet Nexus Visa (NEW D)
const CABINET_PILIERS = [
  {
    icon: ShieldCheck,
    eyebrow: "Méthode",
    title: "Rigueur",
    desc: "Méthodologie écrite, double-relecture systématique, référentiel consulaire à jour.",
  },
  {
    icon: Lock,
    eyebrow: "Protocole",
    title: "Confidentialité",
    desc: "Protocole strict de confidentialité, données chiffrées, accès restreint au binôme dédié.",
  },
  {
    icon: Award,
    eyebrow: "Engagement",
    title: "Excellence",
    desc: "Engagement de moyens documenté, suivi traçable jusqu'à la décision finale.",
  },
];

const E_VISA_AVANTAGES = [
  {
    icon: Smartphone,
    title: "100 % en ligne",
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

const STATS = [
  { value: "Étude", label: "Initiale gratuite" },
  { value: "Devis", label: "Fixe avant engagement" },
  { value: "Bilan", label: "Honnête écrit" },
];

const NOUS_FAISONS = [
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
    desc: "Réservation du créneau, préparation du dossier physique remis prêt à déposer, instructions précises pour la dépose à Yaoundé.",
  },
  {
    title: "Suivi jusqu'à la décision",
    desc: "Réponse aux compléments d'information demandés, ajustement du dossier si nécessaire, transmission de la décision finale.",
  },
];

const VOUS_OBTENEZ = [
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
];

const CAS = [
  {
    badge: "Études en France",
    title: "Étudiante en master, admission validée",
    stats: [
      { label: "Procédure", value: "Schengen études" },
      { label: "Biométrie", value: "Yaoundé (TLS)" },
      { label: "Dépose", value: "1 aller-retour" },
      { label: "Approche", value: "Dossier complet" },
    ],
    desc: "Visa Schengen études, biométrie obligatoire à Yaoundé. Nexus RCA monte le dossier complet (admission, ressources, hébergement, assurance, lettre de motivation), prend le rendez-vous TLS et remet à la cliente un dossier physique prêt à déposer.",
  },
  {
    badge: "Salon professionnel à Dubaï",
    title: "Cadre d'une PME centrafricaine, délais courts",
    stats: [
      { label: "Procédure", value: "e-Visa EAU" },
      { label: "Délai", value: "48 à 72 h" },
      { label: "Dépose", value: "100 % en ligne" },
      { label: "Approche", value: "Coordination hôtel" },
    ],
    desc: "Premier voyage international, agenda chargé, salon dans 10 jours. Nexus RCA prépare l'e-Visa EAU en 48 à 72 heures, organise la réservation d'hôtel à proximité du salon, et transmet le visa par e-mail avant le décollage.",
  },
  {
    badge: "Famille Schengen",
    title: "Regroupement familial, dossier sensible",
    stats: [
      { label: "Procédure", value: "Schengen long séjour" },
      { label: "Profil", value: "Sensible" },
      { label: "Étape", value: "Audit préalable" },
      { label: "Approche", value: "Bilan écrit" },
    ],
    desc: "Demande de regroupement familial avec documents d'état civil à harmoniser. Nexus RCA effectue d'abord un audit complet du dossier, identifie les points faibles, propose un plan d'amélioration et n'engage la dépose qu'après mise en conformité.",
  },
];

const ENGAGEMENT_NO = [
  "Garantir l'obtention d'un visa",
  "Influencer la décision consulaire",
  "Promettre une admission certaine",
];

const ENGAGEMENT_YES = [
  "Un dossier solide et complet, conforme aux exigences exactes du consulat",
  "Une présentation optimisée qui valorise votre profil",
  "La réduction maximale des risques de refus pour motifs évitables",
  "Un conseil honnête sur vos chances réelles avant tout engagement",
];

type TarifAccent = "emerald" | "orange" | "blue";
interface Tarif {
  icon: typeof Search;
  accent: TarifAccent;
  title: string;
  desc: string;
  highlight?: boolean;
}
const TARIFS: Tarif[] = [
  {
    icon: Search,
    accent: "emerald",
    title: "Étude initiale",
    desc: "Gratuite, sans engagement. Bilan de faisabilité écrit.",
  },
  {
    icon: ClipboardCheck,
    accent: "orange",
    highlight: true,
    title: "Accompagnement Nexus",
    desc: "Devis fixe communiqué après le bilan de faisabilité. Aucune facturation surprise en cours de route.",
  },
  {
    icon: Wallet,
    accent: "blue",
    title: "Frais consulaires",
    desc: "À votre charge, montant détaillé à l'avance par pays. Reversés directement aux autorités.",
  },
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
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
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
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/50">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Service visa
              </span>

              <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
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

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
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
                  className={`group/stat relative overflow-hidden rounded-2xl border bg-white/[0.04] px-5 py-4 backdrop-blur-md ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
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
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      {s.label}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 2. INDICATEURS QUALITATIFS — bandeau premium navy (NEW E) ─────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-12 text-white sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/10 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {INDICATEURS.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <article
                    key={ind.label}
                    className={`group relative overflow-hidden rounded-2xl border bg-white/[0.04] p-5 backdrop-blur-md ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
                      i === 0
                        ? "border-nexus-orange-400/30 hover:border-nexus-orange-400/60"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500/20 to-nexus-orange-700/10 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                        Marqueur
                      </p>
                      <p className="mt-1 font-display text-lg font-bold leading-tight text-white sm:text-xl">
                        {ind.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                        {ind.sub}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. DIAGNOSTIC VISA — navy + cards glass claires (lisibilité checkers) ── */}
        <section
          id="diagnostic"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Diagnostic gratuit
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Évaluez votre dossier en{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    60 secondes
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Deux outils Nexus pour identifier votre type de visa et vos
                exigences avant même de nous contacter — sans inscription.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/[0.92] p-1 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                />
                <div className="relative">
                  <VisaRequirementChecker />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/[0.92] p-1 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                />
                <div className="relative">
                  <EVisaEligibilityChecker />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. APPROCHE EXPERT — bloc institutionnel premium (NEW A) ─────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Notre approche
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Une approche{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    d&rsquo;expert
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                du visa.
              </h2>
            </div>

            {/* Bloc éditorial — quote pattern Stripe Sessions */}
            <div className="mx-auto mt-12 max-w-3xl">
              <blockquote className="relative">
                <span
                  aria-hidden
                  className="absolute -left-2 -top-6 font-display text-7xl leading-none text-nexus-orange-500/30 sm:-left-6 sm:-top-4 sm:text-8xl"
                >
                  &ldquo;
                </span>
                <p className="relative text-lg leading-relaxed text-white sm:text-xl">
                  Le visa n&apos;est pas une formalité administrative. C&apos;est
                  une décision d&apos;État qui demande structure, transparence et
                  conformité. Notre approche : un interlocuteur unique, un
                  dossier construit selon le référentiel exact du poste
                  consulaire ciblé, un suivi rigoureux jusqu&apos;à la décision
                  finale.
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-px w-10 bg-gradient-to-r from-nexus-orange-500/60 to-transparent"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                    Cabinet Nexus Visa &mdash; Bangui
                  </span>
                </footer>
              </blockquote>
            </div>

            {/* 3 piliers glass */}
            <div className="mt-16 grid gap-5 sm:grid-cols-3">
              {APPROCHE_PILIERS.map((p) => {
                const Icon = p.icon;
                return (
                  <article
                    key={p.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 font-display text-lg font-bold leading-tight text-white sm:text-xl">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {p.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. INTRO COURTE — navy editorial ─────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
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
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
              Le visa n&apos;est pas une formalité. C&apos;est une décision
              d&apos;État qui demande{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                  structure, transparence et conformité
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                />
              </span>
              .
            </p>
          </div>
        </section>

        {/* 4. CE QUE NOUS FAISONS — navy glass split ────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
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

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-16">
              <div>
                <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                  Périmètre
                </span>
                <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Ce que nous{" "}
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    faisons
                  </span>
                  .
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Quatre prestations encadrées, livrables documentés à chaque
                  étape.
                </p>
              </div>

              {/* Mobile : scroll-snap */}
              <div className="sm:hidden">
                <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                  {NOUS_FAISONS.map((item, i) => (
                    <article
                      key={i}
                      className="group relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                      />
                      <div className="relative flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-bold leading-tight text-white">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-300">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {NOUS_FAISONS.map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-white/20"
                    />
                  ))}
                </div>
              </div>

              {/* Desktop */}
              <ul className="hidden space-y-4 sm:block">
                {NOUS_FAISONS.map((item, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-110">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
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

        {/* 5. CE QUE VOUS OBTENEZ — navy glass grid 4 ───────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-32 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Résultat
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Ce que vous{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    obtenez
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Pas de promesse de visa — la décision appartient au consulat.
                En revanche, voici ce que nous vous garantissons concrètement.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {VOUS_OBTENEZ.map((item, i) => (
                  <article
                    key={i}
                    className="group relative w-[80vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/10 blur-2xl"
                    />
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                        <Check className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {item.desc}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {VOUS_OBTENEZ.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/20"
                  />
                ))}
              </div>
            </div>

            {/* Desktop : grid 4 */}
            <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {VOUS_OBTENEZ.map((item, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                  />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                      <Check className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. POUR QUI — navy glass split emerald / rose accents ────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
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
                Sélectivité
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Pour qui ce service est{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    conçu
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Nous n&apos;accompagnons pas tous les profils. Cette
                transparence fait partie de notre engagement professionnel.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {/* Adapté */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-emerald-400/30 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.06] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-[100px] transition-all duration-500 group-hover:bg-emerald-500/25"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                        Adapté
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                        Service adapté à vous si…
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-3.5">
                    {POUR_QUI.oui.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200 sm:text-base"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* Pas adapté */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-rose-400/30 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rose-400/40 hover:bg-white/[0.06] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-[100px] transition-all duration-500 group-hover:bg-rose-500/25"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-rose-300">
                        Non adapté
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                        Pas adapté si…
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-3.5">
                    {POUR_QUI.non.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200 sm:text-base"
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

        {/* 9. MÉTHODOLOGIE 7 PHASES — navy timeline numbers gradient orange (NEW C) ── */}
        <section
          id="methodologie"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32"
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Notre méthodologie
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Un parcours en{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    sept phases
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Du brief stratégique à la décision finale, chaque phase est
                documentée et communiquée. Vous savez à tout moment où en est
                votre dossier.
              </p>
            </div>

            {/* Timeline */}
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
                              {etape.title}
                            </h3>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                            {etape.description}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA méthodologie */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                    Démarrer la démarche
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    Soumettez votre dossier dès aujourd&apos;hui.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
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
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                  >
                    <Calendar className="h-4 w-4" />
                    Prendre rendez-vous
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9 bis. BANDE CTA — ASSURANCE & MOBILITÉ INTERNATIONALE ───────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-12 text-white sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-nexus-orange-500/15 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-nexus-orange-400/25 bg-gradient-to-br from-nexus-orange-500/8 via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.20)]">
              <div className="flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="flex items-start gap-5 lg:items-center">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10 sm:flex">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                      Complément essentiel
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                      L&rsquo;assurance, le détail qui{" "}
                      <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                        valide votre dossier
                      </span>
                      .
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                      Tout dossier visa Schengen exige une couverture conforme
                      au standard 30 000 €. Notre cabinet de courtage
                      sélectionne et accompagne votre assurance — voyage,
                      santé internationale, études, mobilité business.
                    </p>
                  </div>
                </div>

                <Link
                  href="/services/assurance"
                  className="group/cta relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-6 py-3.5 text-sm font-bold text-nexus-orange-200 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/60 hover:bg-nexus-orange-500/15 hover:text-white"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  Découvrir notre cabinet assurance
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10. DOMAINES D'INTERVENTION — Carte du monde stylisée (NEW B) ───── */}
        <section
          id="destinations"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32"
        >
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Zones de compétence
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Nos domaines{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    d&apos;intervention
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Quatre zones de compétence consulaires couvertes selon procédure
                cadrée. Pour toute autre destination, traitement sur demande.
              </p>
            </div>

            {/* Carte du monde stylisée SVG */}
            <div className="relative mx-auto mb-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-[100px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-nexus-blue-500/15 blur-[100px]"
              />
              <svg
                viewBox="0 0 800 400"
                className="relative w-full"
                role="img"
                aria-label="Carte du monde stylisée — zones de compétence Nexus Visa"
              >
                <defs>
                  <linearGradient
                    id="zone-gradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#FF6600" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FF6600" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient
                    id="continent-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0C1C40" stopOpacity="0.6" />
                  </linearGradient>
                  <radialGradient id="pulse-orange">
                    <stop offset="0%" stopColor="#FF6600" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Continents stylisés (formes simplifiées non-réalistes) */}
                <g stroke="rgba(255,255,255,0.12)" strokeWidth="1">
                  {/* Amérique du Nord */}
                  <path
                    d="M 80 100 Q 120 80, 180 90 L 200 130 Q 190 170, 160 180 L 100 175 Q 70 150, 80 100 Z"
                    fill="url(#continent-gradient)"
                  />
                  {/* Amérique du Sud */}
                  <path
                    d="M 170 200 Q 200 200, 215 230 L 210 290 Q 195 320, 180 310 L 165 270 Q 155 230, 170 200 Z"
                    fill="url(#continent-gradient)"
                  />
                  {/* Europe */}
                  <path
                    d="M 360 100 Q 410 90, 450 100 L 460 130 Q 440 145, 410 145 L 370 140 Q 350 125, 360 100 Z"
                    fill="url(#continent-gradient)"
                  />
                  {/* Afrique */}
                  <path
                    d="M 380 170 Q 440 165, 470 195 L 475 270 Q 455 320, 425 320 L 395 290 Q 370 230, 380 170 Z"
                    fill="url(#continent-gradient)"
                  />
                  {/* Moyen-Orient */}
                  <path
                    d="M 470 145 Q 510 140, 540 160 L 545 195 Q 525 215, 495 210 L 470 190 Q 460 170, 470 145 Z"
                    fill="url(#continent-gradient)"
                  />
                  {/* Asie */}
                  <path
                    d="M 540 100 Q 620 85, 700 105 L 720 160 Q 700 200, 640 205 L 555 195 Q 530 145, 540 100 Z"
                    fill="url(#continent-gradient)"
                  />
                  {/* Océanie */}
                  <path
                    d="M 660 270 Q 700 265, 730 285 L 730 310 Q 700 320, 670 310 L 655 295 Q 650 280, 660 270 Z"
                    fill="url(#continent-gradient)"
                  />
                </g>

                {/* Zone Schengen (Europe) — highlighted orange */}
                <g>
                  <path
                    d="M 360 100 Q 410 90, 450 100 L 460 130 Q 440 145, 410 145 L 370 140 Q 350 125, 360 100 Z"
                    fill="url(#zone-gradient)"
                    stroke="#FF6600"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  {/* Pulse dot Europe */}
                  <circle cx="410" cy="120" r="20" fill="url(#pulse-orange)">
                    <animate
                      attributeName="r"
                      values="14;22;14"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="410" cy="120" r="4" fill="#FF6600" />
                </g>

                {/* Zone Canada (Amérique du Nord) — highlighted orange */}
                <g>
                  <path
                    d="M 80 100 Q 120 80, 180 90 L 200 130 Q 190 170, 160 180 L 100 175 Q 70 150, 80 100 Z"
                    fill="url(#zone-gradient)"
                    stroke="#FF6600"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <circle cx="135" cy="130" r="20" fill="url(#pulse-orange)">
                    <animate
                      attributeName="r"
                      values="14;22;14"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="135" cy="130" r="4" fill="#FF6600" />
                </g>

                {/* Zone Asie e-Visa */}
                <g>
                  <path
                    d="M 540 100 Q 620 85, 700 105 L 720 160 Q 700 200, 640 205 L 555 195 Q 530 145, 540 100 Z"
                    fill="url(#zone-gradient)"
                    stroke="#FF6600"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <circle cx="625" cy="150" r="20" fill="url(#pulse-orange)">
                    <animate
                      attributeName="r"
                      values="14;22;14"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="625" cy="150" r="4" fill="#FF6600" />
                </g>

                {/* Zone Moyen-Orient & Afrique */}
                <g>
                  <path
                    d="M 470 145 Q 510 140, 540 160 L 545 195 Q 525 215, 495 210 L 470 190 Q 460 170, 470 145 Z"
                    fill="url(#zone-gradient)"
                    stroke="#FF6600"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M 380 170 Q 440 165, 470 195 L 475 270 Q 455 320, 425 320 L 395 290 Q 370 230, 380 170 Z"
                    fill="url(#zone-gradient)"
                    fillOpacity="0.6"
                    stroke="#FF6600"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                  <circle cx="505" cy="180" r="18" fill="url(#pulse-orange)">
                    <animate
                      attributeName="r"
                      values="12;20;12"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="505" cy="180" r="4" fill="#FF6600" />
                  <circle cx="425" cy="245" r="18" fill="url(#pulse-orange)">
                    <animate
                      attributeName="r"
                      values="12;20;12"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="425" cy="245" r="4" fill="#FF6600" />
                </g>

                {/* Étiquettes zones */}
                <g
                  fontFamily="ui-sans-serif, system-ui"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="2"
                  textAnchor="middle"
                >
                  <text x="135" y="105" fill="#FFA366">
                    CANADA
                  </text>
                  <text x="410" y="92" fill="#FFA366">
                    SCHENGEN
                  </text>
                  <text x="625" y="92" fill="#FFA366">
                    e-VISA ASIE
                  </text>
                  <text x="465" y="220" fill="#FFA366">
                    MENA
                  </text>
                </g>
              </svg>
            </div>

            {/* 4 cards zones de compétence */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ZONES_COMPETENCE.map((zone) => {
                const Icon = zone.icon;
                return (
                  <article
                    key={zone.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                        Zone
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold leading-tight text-white">
                        {zone.region}
                      </h3>
                      <p className="mt-1 font-display text-sm font-bold tabular-nums text-nexus-orange-300">
                        {zone.count}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {zone.detail}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-400">
              Si votre destination n&apos;est pas listée, contactez-nous — nous
              traitons à la demande selon la complexité du dossier.
            </p>
          </div>
        </section>

        {/* 9. e-VISA — navy glass grid 4 ───────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
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
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="relative mx-auto mb-4 inline-flex">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 opacity-50 blur-md"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_12px_30px_-8px_rgba(255,102,0,0.55)] ring-1 ring-white/10">
                  <Smartphone className="h-6 w-6" />
                </div>
              </div>
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Visa électronique
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Le e-Visa, procédure{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    simplifiée
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Pour de nombreuses destinations, la procédure se déroule
                entièrement en ligne. Aucun déplacement à Yaoundé n&apos;est
                requis.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {E_VISA_AVANTAGES.map((avantage) => {
                  const Icon = avantage.icon;
                  return (
                    <article
                      key={avantage.title}
                      className="group relative w-[78vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/10 blur-2xl"
                      />
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="mt-4 font-display text-base font-bold text-white">
                          {avantage.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {avantage.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {E_VISA_AVANTAGES.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/20"
                  />
                ))}
              </div>
            </div>

            {/* Desktop : grid 4 */}
            <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {E_VISA_AVANTAGES.map((avantage) => {
                const Icon = avantage.icon;
                return (
                  <article
                    key={avantage.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold text-white">
                        {avantage.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {avantage.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Note glass orange */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.25)] sm:p-8">
              <p className="text-base leading-relaxed text-white sm:text-lg">
                <strong className="text-nexus-orange-300">À savoir : </strong>
                tous les pays ne proposent pas le e-Visa. La procédure adaptée
                à votre destination vous sera indiquée à l&apos;étape
                d&apos;analyse.
              </p>
            </div>
          </div>
        </section>

        {/* 10. DOCUMENTS PAR TYPE — navy + wrapper glass clair ─────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Documents fréquents
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Pièces requises selon votre{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    type de visa
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Liste indicative par type. Le consulat ciblé peut exiger des
                pièces complémentaires — c&apos;est ce que Nexus cadre pour
                vous.
              </p>
            </div>

            {/* Wrapper glass clair pour lisibilité du checklist interactif */}
            <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/[0.92] p-1 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.4)]">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-[100px]"
              />
              <div className="relative">
                <VisaDocumentChecklist />
              </div>
            </div>
          </div>
        </section>

        {/* 11. CAS TYPES — 3 cards tech case study factuel ─────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Cas types traités
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Voici comment ça se passe{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    concrètement
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="lg:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-1 pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {CAS.map((cas, idx) => (
                  <article
                    key={idx}
                    className="group relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:w-auto sm:p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/10 blur-[80px] transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur">
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

                      <p className="mt-5 text-sm leading-relaxed text-slate-300">
                        {cas.desc}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                          Approche méthodologique
                        </span>
                        <ArrowRight className="h-4 w-4 text-nexus-orange-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Desktop lg+ */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-5">
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
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur">
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

                    <p className="mt-5 text-sm leading-relaxed text-slate-300">
                      {cas.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
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

        {/* 12. ENGAGEMENT TRANSPARENCE — navy glass asymétrique ────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
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
                Engagement
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Aucune agence sérieuse ne peut{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    garantir un visa
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                La décision finale appartient toujours aux autorités
                consulaires. Toute structure qui vous promet une obtention vous
                trompe. Nexus RCA ne le fera jamais.
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
                    Ce que nous ne pouvons pas
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
                      Ce que nous garantissons
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

        {/* 13. CADRE TARIFAIRE — navy glass 3 cards ───────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Cadre tarifaire
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Une transparence économique{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    complète
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Vous savez ce que ça coûte avant de signer. Aucun frais caché.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {TARIFS.map((tarif) => {
                const Icon = tarif.icon;
                const isHi = tarif.highlight;
                const accentRing =
                  tarif.accent === "emerald"
                    ? "ring-emerald-400/25"
                    : tarif.accent === "blue"
                      ? "ring-nexus-blue-400/25"
                      : "ring-white/5";
                const iconBg =
                  tarif.accent === "emerald"
                    ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30"
                    : tarif.accent === "blue"
                      ? "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white ring-1 ring-white/10"
                      : "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10";
                const accentEyebrow =
                  tarif.accent === "emerald"
                    ? "text-emerald-300"
                    : tarif.accent === "blue"
                      ? "text-slate-200"
                      : "text-nexus-orange-300";
                const eyebrowLabel =
                  tarif.accent === "emerald"
                    ? "Gratuit"
                    : tarif.accent === "blue"
                      ? "À votre charge"
                      : "Notre prestation";
                return (
                  <article
                    key={tarif.title}
                    className={`group relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 ${
                      isHi
                        ? `border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] hover:border-nexus-orange-400/60`
                        : `border-white/10 bg-white/[0.04] ring-1 ${accentRing} hover:border-nexus-orange-400/40 hover:bg-white/[0.06]`
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${
                        isHi ? "bg-nexus-orange-500/25" : "bg-nexus-orange-500/0"
                      } blur-[80px] transition-all duration-500 group-hover:bg-nexus-orange-500/30`}
                    />
                    <div className="relative">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105 ${iconBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.22em] ${accentEyebrow}`}
                      >
                        {eyebrowLabel}
                      </span>
                      <h3 className="mt-1 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {tarif.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {tarif.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 16. LE CABINET NEXUS VISA — bloc institutionnel premium (NEW D) ─── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-1/4 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Le cabinet
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Nexus Visa :{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    excellence
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                documentée.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Nexus Visa est la branche dédiée aux démarches consulaires et
                migratoires de Nexus RCA. Une équipe pluridisciplinaire
                (consulaire, juridique, administrative) au service de la
                mobilité internationale. Méthode rigoureuse, confidentialité
                absolue, traçabilité complète.
              </p>
            </div>

            {/* 3 piliers institutionnels — cards glass premium */}
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              {CABINET_PILIERS.map((p) => {
                const Icon = p.icon;
                return (
                  <article
                    key={p.title}
                    className="group relative overflow-hidden rounded-3xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_60px_-16px_rgba(255,102,0,0.35)] sm:p-8"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-[100px] transition-all duration-500 group-hover:bg-nexus-orange-500/35"
                    />
                    <div className="relative">
                      <div className="relative inline-flex">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md transition-all duration-500 group-hover:bg-nexus-orange-500/60"
                        />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                        {p.eyebrow}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {p.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 17. FORMULAIRE EXPRESS — cabinet exécutif premium ────────── */}
        <section
          id="demarrer"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            {/* Header institutionnel */}
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Démarche officielle
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Soumettez votre{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    dossier
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Étude initiale gratuite. Bilan de faisabilité écrit. Devis fixe
                avant tout engagement.
              </p>
            </div>

            {/* Wizard multi-step — récap dynamique intégré côté droit */}
            <VisaExpressForm />
          </div>
        </section>

        {/* 15. CTA FINAL — hero card premium navy ──────────────────── */}
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
              Une question avant de démarrer
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Parlons de votre{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                  projet
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                />
              </span>
              .
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
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
              <Link
                href="#methodologie"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-bold text-white/70 transition-all duration-300 hover:text-white"
              >
                Voir la méthodologie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 4 trust signals */}
            <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: ShieldCheck, label: "Étude gratuite" },
                { icon: FileText, label: "Bilan écrit" },
                { icon: ClipboardCheck, label: "Devis fixe" },
                { icon: Eye, label: "Confidentialité" },
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
