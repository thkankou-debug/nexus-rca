import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import {
  GraduationCap,
  School,
  Building2,
  FileText,
  Plane,
  Calendar,
  ArrowRight,
  ClipboardCheck,
  Search,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  Globe,
  Sparkles,
  BookOpen,
  Award,
  Receipt,
  Eye,
  Activity,
  Compass,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Études au Canada — admission & permis | Nexus RCA",
  description:
    "Accès structuré aux établissements canadiens et sécurisation du permis d'études. De l'identification du programme à la délivrance du permis IRCC, accompagnement encadré depuis Bangui.",
};

// ─── Pattern dot grid sombre ─────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Carte Canada — villes universitaires ──────────────────────────────
// Coordonnées % positionnées sur viewBox 800x500 (carte stylisée)
const CITIES = [
  {
    id: "vancouver",
    name: "Vancouver",
    x: 12,
    y: 64,
    main: true,
    universities: ["UBC", "Simon Fraser", "Emily Carr"],
    stat: "Côte Pacifique",
  },
  {
    id: "calgary",
    name: "Calgary",
    x: 26,
    y: 60,
    main: false,
    universities: ["University of Calgary", "Mount Royal"],
    stat: "Innovation énergie",
  },
  {
    id: "toronto",
    name: "Toronto",
    x: 60,
    y: 76,
    main: true,
    universities: ["U. of Toronto", "York", "Ryerson"],
    stat: "1ʳᵉ ville universitaire",
  },
  {
    id: "ottawa",
    name: "Ottawa",
    x: 66,
    y: 68,
    main: false,
    universities: ["Carleton", "uOttawa"],
    stat: "Capitale fédérale",
  },
  {
    id: "montreal",
    name: "Montréal",
    x: 73,
    y: 70,
    main: true,
    universities: ["McGill", "UdeM", "Concordia"],
    stat: "Hub francophone",
  },
  {
    id: "quebec",
    name: "Québec",
    x: 80,
    y: 60,
    main: true,
    universities: ["Laval", "TÉLUQ"],
    stat: "Patrimoine UNESCO",
  },
] as const;

// ─── Étapes parcours horizontal ─────────────────────────────────────────
const PARCOURS = [
  {
    num: "01",
    icon: Search,
    title: "Sélection programme",
    desc: "Cartographie des établissements alignés à votre profil et vos objectifs.",
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "Dossier admission",
    desc: "Lettre, CV académique, traductions, relevés conformes aux standards.",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Visa étudiant",
    desc: "CAQ + permis d'études IRCC, biométrie à Yaoundé, suivi décision.",
  },
  {
    num: "04",
    icon: Plane,
    title: "Arrivée Canada",
    desc: "Inscription, logement, billet, assurance, premières démarches.",
  },
] as const;

// ─── Niveaux d'études bento ─────────────────────────────────────────────
const NIVEAUX = [
  {
    icon: BookOpen,
    title: "Cégep",
    desc: "Formations techniques 1 à 3 ans, voie d'accès rapide vers le permis post-diplôme.",
    duree: "1-3 ans",
  },
  {
    icon: School,
    title: "Licence (Bac)",
    desc: "Premier cycle universitaire, 3 à 4 ans, francophone ou anglophone.",
    duree: "3-4 ans",
  },
  {
    icon: GraduationCap,
    title: "Master",
    desc: "Le niveau le plus demandé par la diaspora centrafricaine. Spécialisation, recherche appliquée, ouverture sur le marché qualifié canadien.",
    duree: "1-2 ans",
    highlight: true,
  },
  {
    icon: Award,
    title: "Doctorat",
    desc: "Recherche académique encadrée, possibilité de financement par bourse de doctorat.",
    duree: "4-5 ans",
  },
] as const;

const ETABLISSEMENTS = [
  {
    icon: Building2,
    title: "Universités",
    desc: "Baccalauréats, maîtrises et doctorats — francophones et anglophones, dans toutes les provinces.",
    badge: "Recherche & cycle long",
  },
  {
    icon: School,
    title: "Collèges (Cégeps)",
    desc: "Formations techniques de 1 à 3 ans, fortement orientées emploi, voie d'accès rapide à un permis post-diplôme.",
    badge: "Voie technique",
  },
  {
    icon: GraduationCap,
    title: "Instituts spécialisés",
    desc: "Programmes ciblés (santé, ingénierie, IT, métiers réglementés) avec critères d'admission spécifiques.",
    badge: "Métiers ciblés",
  },
] as const;

const SCOPE_ITEMS = [
  {
    title: "Identification du programme aligné",
    desc: "Cartographie des établissements et programmes compatibles avec votre parcours, vos objectifs et votre calendrier de rentrée.",
  },
  {
    title: "Constitution du dossier d'admission",
    desc: "Lettre de motivation, CV académique, traductions certifiées, relevés mis en conformité avec les standards canadiens.",
  },
  {
    title: "CAQ et permis d'études IRCC",
    desc: "Montage complet de la procédure d'immigration une fois l'admission obtenue, biométrie à Yaoundé.",
  },
  {
    title: "Préparation au départ",
    desc: "Confirmation d'inscription, logement, billet, assurance, dossier complet transmis avant décollage.",
  },
];

const RESULT_ITEMS = [
  {
    title: "Programme aligné au profil",
    desc: "Pas d'admission de complaisance dans un programme inadapté à votre parcours.",
  },
  {
    title: "Dossier d'admission conforme",
    desc: "Les pièces correspondent exactement aux exigences du programme cible.",
  },
  {
    title: "Permis d'études sécurisé",
    desc: "Procédure IRCC encadrée, biométrie à Yaoundé planifiée, examen médical organisé.",
  },
  {
    title: "Arrivée encadrée",
    desc: "Logement, billet, assurance et premières démarches préparées avant départ.",
  },
];

const POURQUI_OUI = [
  "Vous avez un dossier académique solide et un projet d'études réfléchi.",
  "Vous voulez choisir le programme aligné à votre parcours, pas n'importe quelle admission.",
  "Vous acceptez la temporalité réelle des admissions canadiennes (6 à 12 mois).",
];

const POURQUI_NON = [
  "Vous cherchez une admission « rapide » sans dossier consistant.",
  "Vous voulez utiliser le permis d'études comme voie détournée d'immigration.",
  "Vous cherchez une garantie d'admission ou de visa.",
];

const METHODOLOGIE = [
  {
    num: "01",
    icon: Search,
    title: "Identification du programme",
    desc: "Cartographie des établissements (universités, cégeps, instituts) compatibles avec votre parcours académique, vos objectifs professionnels et votre calendrier de rentrée.",
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "Constitution du dossier d'admission",
    desc: "Lettre de motivation cadrée selon les exigences du programme cible, CV académique, traductions certifiées, relevés et diplômes mis en conformité, gestion des délais d'envoi.",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "CAQ + permis d'études IRCC",
    desc: "Une fois l'admission obtenue : montage du dossier de CAQ (Québec) puis du permis d'études IRCC, biométrie à Yaoundé, suivi jusqu'à la décision.",
  },
  {
    num: "04",
    icon: Plane,
    title: "Préparation au départ",
    desc: "Confirmation d'inscription, logement, billet aller, assurance, premières démarches à l'arrivée. Transmission complète du dossier au client avant le départ.",
  },
] as const;

const CAS = [
  {
    badge: "🎓 Master spécialisé",
    title: "Profil ingénieur vers maîtrise Montréal",
    desc: "Ingénieur centrafricain souhaitant poursuivre en maîtrise spécialisée. Sélection de 3 programmes alignés, dossier d'admission complet, préparation CAQ et permis d'études IRCC, biométrie planifiée à Yaoundé.",
    stats: [
      { label: "Niveau", value: "Master 2 ans" },
      { label: "Province", value: "Québec" },
      { label: "Procédure", value: "CAQ + IRCC" },
      { label: "Calendrier", value: "Rentrée +12 mois" },
    ],
  },
  {
    badge: "📚 Cégep technique",
    title: "Bachelier vers cégep Toronto",
    desc: "Bachelier orienté métier technique court (3 ans), passage par cégep ontarien avec voie d'accès rapide au permis post-diplôme. Dossier scolaire et lettre de motivation alignés au programme cible.",
    stats: [
      { label: "Niveau", value: "Cégep 3 ans" },
      { label: "Province", value: "Ontario" },
      { label: "Procédure", value: "IRCC direct" },
      { label: "Calendrier", value: "Rentrée +9 mois" },
    ],
  },
  {
    badge: "🔬 Doctorat recherche",
    title: "Master scientifique vers PhD UBC",
    desc: "Profil de chercheur identifiant un directeur de thèse à l'Université de la Colombie-Britannique. Préparation du dossier de candidature, recherche de financement par bourse, montage du permis d'études IRCC.",
    stats: [
      { label: "Niveau", value: "Doctorat 4-5 ans" },
      { label: "Province", value: "Colombie-Britannique" },
      { label: "Financement", value: "Bourse PhD" },
      { label: "Calendrier", value: "Rentrée +14 mois" },
    ],
  },
];

const ENGAGEMENT_NO = [
  "Garantir une admission ou un visa étudiant.",
  "Présenter un dossier qui ne correspond pas au profil réel du candidat.",
  "Court-circuiter les délais des établissements ou d'IRCC.",
];

const ENGAGEMENT_YES = [
  "Audit de faisabilité écrit avant tout engagement.",
  "Sélection de programmes alignés au parcours et aux objectifs.",
  "Dossier d'admission conforme aux standards exigés.",
  "Suivi de la procédure IRCC jusqu'à la décision finale.",
];

const TARIFS = [
  {
    icon: Search,
    title: "Audit de faisabilité",
    desc: "Étude initiale gratuite. Bilan écrit avec recommandations et programmes envisageables.",
  },
  {
    icon: ClipboardCheck,
    title: "Forfait accompagnement",
    desc: "Tarif fixe annoncé par écrit avant signature. Inclut sélection, dossier d'admission, CAQ, permis d'études et préparation au départ.",
    highlight: true,
  },
  {
    icon: Receipt,
    title: "Frais tiers",
    desc: "Frais de candidature, traductions, biométrie, examen médical : refacturés au coût réel sur justificatif.",
  },
] as const;

const CADRE = [
  {
    icon: ShieldCheck,
    title: "Conformité IRCC",
    desc: "Dossiers montés selon les exigences en vigueur du gouvernement canadien et des établissements.",
  },
  {
    icon: Receipt,
    title: "Devis écrit",
    desc: "Tarif annoncé avant signature. Aucune facturation surprise.",
  },
  {
    icon: Eye,
    title: "Traçabilité complète",
    desc: "Chaque étape produit un livrable validé avec vous avant passage à la suivante.",
  },
];

export default function EtudesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO Premium tech ────────────────────────────────────── */}
        <PublicHero
          eyebrow="Service études Canada"
          titleStart=""
          accentWord="Accès structuré"
          titleEnd=" aux établissements canadiens et sécurisation du permis d'études."
          subtitle="De l'identification du programme aligné à votre parcours jusqu'à la délivrance du permis d'études IRCC, nous opérons un accompagnement encadré, étape par étape, selon les standards exigés par les établissements et les autorités canadiennes."
          ctaPrimary={{
            href: "/services/etudes/demarrer",
            label: "Soumettre ma demande",
            icon: FileText,
          }}
          ctaSecondary={{
            href: "/rendez-vous?service=etudes",
            label: "Prendre rendez-vous",
            icon: Calendar,
          }}
        />

        {/* 2. CARTE CANADA — signature unique ──────────────────────── */}
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

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Cartographie universitaire
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Six villes universitaires{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    couvertes par notre réseau
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Survolez une ville pour découvrir les établissements majeurs.
                Réseau actif sur les principaux pôles francophones et anglophones
                du Canada.
              </p>
            </div>

            {/* Carte Canada SVG stylisé + pills villes (desktop) */}
            <div className="relative mx-auto hidden h-[480px] w-full max-w-5xl sm:block">
              <svg
                aria-hidden
                viewBox="0 0 800 500"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="canadaFill"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(255,102,0,0.10)" />
                    <stop offset="100%" stopColor="rgba(96,138,255,0.08)" />
                  </linearGradient>
                  <linearGradient
                    id="canadaStroke"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(255,102,0,0.45)" />
                    <stop offset="100%" stopColor="rgba(96,138,255,0.35)" />
                  </linearGradient>
                  <linearGradient
                    id="rcaFlow"
                    x1="0%"
                    y1="100%"
                    x2="50%"
                    y2="50%"
                  >
                    <stop offset="0%" stopColor="rgba(255,102,0,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,102,0,0.45)" />
                  </linearGradient>
                </defs>

                {/* Forme stylisée Canada — pas réaliste, suggestion */}
                <path
                  d="M 60 280 Q 50 240 70 200 Q 80 170 130 160 Q 180 130 240 150 Q 300 120 360 140 Q 430 120 500 145 Q 580 130 640 165 Q 700 190 720 240 Q 740 270 720 310 Q 700 345 670 360 Q 640 380 600 370 Q 560 385 500 375 Q 440 395 380 380 Q 320 390 260 370 Q 200 380 140 360 Q 90 345 70 320 Z"
                  fill="url(#canadaFill)"
                  stroke="url(#canadaStroke)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Lignes flux RCA → Canada (depuis bottom center) */}
                {CITIES.filter((c) => c.main).map((c) => {
                  const x = (c.x / 100) * 800;
                  const y = (c.y / 100) * 500;
                  return (
                    <line
                      key={`flow-${c.id}`}
                      x1="400"
                      y1="490"
                      x2={x}
                      y2={y}
                      stroke="url(#rcaFlow)"
                      strokeWidth="1.2"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      style={{
                        animation: "dashflow 3s linear infinite",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Origin RCA badge */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 backdrop-blur-md ring-1 ring-white/5">
                  <span className="text-base leading-none">🇨🇫</span>
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                    Bangui · RCA
                  </span>
                </div>
              </div>

              {/* Pills villes positionnées en absolu */}
              {CITIES.map((c) => (
                <div
                  key={c.id}
                  className="group/city absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                >
                  {/* Pulse dot pour villes principales */}
                  {c.main && (
                    <span className="absolute -left-1 -top-1 z-0 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-nexus-orange-400" />
                    </span>
                  )}

                  <div
                    className={`relative z-10 flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md transition-all duration-300 ease-out cursor-pointer group-hover/city:-translate-y-0.5 ${
                      c.main
                        ? "border-nexus-orange-400/40 bg-nexus-orange-500/15 ring-1 ring-nexus-orange-400/20 shadow-[0_8px_20px_-8px_rgba(255,102,0,0.4)] group-hover/city:border-nexus-orange-400/70 group-hover/city:bg-nexus-orange-500/20"
                        : "border-white/15 bg-white/[0.06] ring-1 ring-white/5 group-hover/city:border-nexus-orange-400/40 group-hover/city:bg-white/[0.10]"
                    }`}
                  >
                    <MapPin
                      className={`h-3 w-3 shrink-0 ${
                        c.main ? "text-nexus-orange-300" : "text-white/70"
                      }`}
                    />
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                      {c.name}
                    </span>
                  </div>

                  {/* Tooltip glass orange — apparaît au hover */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-300 ease-out group-hover/city:translate-y-0 group-hover/city:opacity-100"
                    role="tooltip"
                  >
                    <div className="overflow-hidden rounded-2xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-nexus-blue-950/95 to-nexus-blue-950/95 p-4 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_48px_-16px_rgba(255,102,0,0.40)]">
                      <p className="font-display text-sm font-bold leading-tight text-white">
                        {c.name}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {c.universities.map((u) => (
                          <li
                            key={u}
                            className="flex items-start gap-1.5 text-[11px] leading-tight text-slate-200"
                          >
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-nexus-orange-300" />
                            <span>{u}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                        <Sparkles className="h-2.5 w-2.5" />
                        {c.stat}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile fallback : grille villes */}
            <div className="grid gap-3 sm:hidden">
              {CITIES.map((c) => (
                <article
                  key={c.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl ring-1 ring-white/5 ${
                    c.main
                      ? "border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_36px_-16px_rgba(255,102,0,0.30)]"
                      : "border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`h-4 w-4 shrink-0 ${
                        c.main ? "text-nexus-orange-300" : "text-white/70"
                      }`}
                    />
                    <h3 className="font-display text-base font-bold text-white">
                      {c.name}
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {c.universities.map((u) => (
                      <li
                        key={u}
                        className="flex items-start gap-2 text-xs leading-tight text-slate-200"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-nexus-orange-300" />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                    <Sparkles className="h-2.5 w-2.5" />
                    {c.stat}
                  </div>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl text-center text-xs text-white/60">
              Liste indicative des principaux pôles. Autres provinces et
              établissements possibles selon le profil — étudiés au cas par cas.
            </div>
          </div>
        </section>

        {/* 3. ÉTAPES PARCOURS — timeline horizontale animée ──────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Parcours
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Quatre étapes,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    de Bangui à la salle de classe
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Chaque étape produit un livrable validé avant la suivante.
                Calendrier annoncé dès l&apos;audit initial.
              </p>
            </div>

            {/* Desktop : timeline horizontale */}
            <div className="relative hidden lg:block">
              {/* Ligne horizontale traversante gradient orange */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[8%] right-[8%] top-12 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/50 to-transparent"
              />
              <div className="grid grid-cols-4 gap-5">
                {PARCOURS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.num} className="group relative">
                      {/* Dot pulsant sur la ligne, séquentiel via delay */}
                      <div className="relative mx-auto h-24 w-24">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-3xl bg-nexus-orange-500/40 blur-md transition-all duration-500 group-hover:bg-nexus-orange-500/60"
                        />
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-nexus-orange-400/30 bg-nexus-blue-900/60 backdrop-blur-md font-display text-3xl font-bold tabular-nums shadow-[0_10px_28px_-10px_rgba(255,102,0,0.4)]">
                          <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                            {step.num}
                          </span>
                        </div>
                        {/* Pulse dot séquentiel */}
                        <span
                          className="absolute -right-2 -top-2 flex h-3 w-3"
                          style={{
                            animationDelay: `${i * 0.4}s`,
                          }}
                        >
                          <span
                            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75"
                            style={{ animationDelay: `${i * 0.4}s` }}
                          />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-nexus-orange-400" />
                        </span>
                      </div>

                      <article className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-nexus-orange-400/40 group-hover:bg-white/[0.06]">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                        />
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0 text-nexus-orange-300" />
                            <h3 className="font-display text-base font-bold leading-tight text-white">
                              {step.title}
                            </h3>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-200">
                            {step.desc}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile + tablet : timeline verticale */}
            <div className="relative lg:hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-nexus-orange-500/40 via-nexus-orange-500/20 to-transparent sm:left-12"
              />
              <div className="space-y-6">
                {PARCOURS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.num}
                      className="group relative grid grid-cols-[4rem_1fr] gap-4 sm:grid-cols-[6rem_1fr] sm:gap-6"
                    >
                      <div className="relative flex justify-center sm:justify-start">
                        <div className="relative">
                          <div
                            aria-hidden
                            className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                          />
                          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-nexus-orange-400/30 bg-nexus-blue-900/60 backdrop-blur-md font-display text-2xl font-bold tabular-nums shadow-[0_10px_28px_-10px_rgba(255,102,0,0.4)] sm:h-20 sm:w-20 sm:text-3xl">
                            <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                              {step.num}
                            </span>
                          </span>
                          <span
                            className="absolute -right-1 -top-1 flex h-2.5 w-2.5"
                            style={{ animationDelay: `${i * 0.4}s` }}
                          >
                            <span
                              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75"
                              style={{ animationDelay: `${i * 0.4}s` }}
                            />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nexus-orange-400" />
                          </span>
                        </div>
                      </div>

                      <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-6">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-nexus-orange-300" />
                          <h3 className="font-display text-base font-bold leading-tight text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-200">
                          {step.desc}
                        </p>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. NIVEAUX D'ÉTUDES — bento glass + Master highlight ─── */}
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
            className="pointer-events-none absolute -left-40 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Niveaux
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Du cégep au doctorat,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    chaque cycle a sa logique
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Quatre niveaux couverts. Un seul mot d&apos;ordre : aligner le
                programme au profil réel du candidat.
              </p>
            </div>

            {/* Mobile scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {NIVEAUX.map((n) => {
                  const Icon = n.icon;
                  const isHi = "highlight" in n && n.highlight;
                  return (
                    <article
                      key={n.title}
                      className={`relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border p-6 backdrop-blur-xl ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
                        isHi
                          ? "border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)]"
                          : "border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold leading-tight text-white">
                        {n.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {n.desc}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        {n.duree}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Desktop bento : Master 2x large */}
            <div className="hidden gap-5 sm:grid sm:grid-cols-4">
              {NIVEAUX.map((n) => {
                const Icon = n.icon;
                const isHi = "highlight" in n && n.highlight;
                const span = isHi
                  ? "sm:col-span-2 sm:row-span-2"
                  : "sm:col-span-2";
                return (
                  <article
                    key={n.title}
                    className={`group relative overflow-hidden rounded-3xl border backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 ${span} ${
                      isHi
                        ? "border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] hover:border-nexus-orange-400/60 sm:p-9"
                        : "border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:p-7"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${
                        isHi
                          ? "bg-nexus-orange-500/25"
                          : "bg-nexus-orange-500/0"
                      } blur-[80px] transition-all duration-500 group-hover:bg-nexus-orange-500/30`}
                    />
                    <div className="relative">
                      <div
                        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105 ${
                          isHi ? "h-16 w-16" : "h-12 w-12"
                        }`}
                      >
                        <Icon className={isHi ? "h-8 w-8" : "h-5 w-5"} />
                      </div>
                      <div className="mt-5 flex items-center gap-3">
                        <h3
                          className={`font-display font-bold leading-tight text-white ${
                            isHi ? "text-xl sm:text-3xl" : "text-base sm:text-lg"
                          }`}
                        >
                          {n.title}
                        </h3>
                        {isHi && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                            <Sparkles className="h-2.5 w-2.5" />
                            Le plus demandé
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-3 leading-relaxed text-slate-200 ${
                          isHi ? "text-base" : "text-sm"
                        }`}
                      >
                        {n.desc}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        {n.duree}
                      </div>
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
              L&apos;admission au Canada n&apos;est pas un dépôt de candidature.
              C&apos;est{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  une stratégie d&apos;établissement
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                />
              </span>{" "}
              où chaque pièce compte.
            </p>
          </div>
        </section>

        {/* 6. CE QUE NOUS FAISONS — navy + cards glass ─────────── */}
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
                  Périmètre
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  Ce que nous faisons.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Quatre étapes encadrées, du programme cible au départ.
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
                Résultat
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Ce que vous obtenez.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Pas de promesse d&apos;admission ou de visa. En revanche, voici
                ce que nous structurons concrètement.
              </p>
            </div>

            {/* Desktop : grid 4 col */}
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
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
                Pour qui
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Le service est-il fait pour vous ?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Nous travaillons mieux avec des candidats lucides sur le projet,
                la temporalité et la rigueur exigée par les établissements
                canadiens.
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
                      Idéal si...
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {POURQUI_OUI.map((item, i) => (
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
                      Pas pour vous si...
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {POURQUI_NON.map((item, i) => (
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

        {/* 9. MÉTHODOLOGIE timeline verticale ─── */}
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
                Méthode
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Quatre étapes encadrées,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    du programme cible au départ
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Chaque étape produit un livrable validé avec vous avant le
                passage à la suivante. Pas de raccourci, pas de zone
                d&apos;ombre.
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
                          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-nexus-orange-400/30 bg-nexus-blue-900/60 backdrop-blur-md font-display text-5xl font-bold tabular-nums shadow-[0_10px_28px_-10px_rgba(255,102,0,0.4)] sm:h-[7.5rem] sm:w-[7.5rem] sm:text-6xl">
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
                          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                            {etape.desc}
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
                    Engager la procédure
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    Prêt à construire votre projet d&apos;études au Canada ?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    Soumettez votre demande pour un audit de faisabilité écrit.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/etudes/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    <FileText className="h-4 w-4" />
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=etudes"
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

        {/* 10. UNIVERSITÉS CIBLES — cards glass ────────────────── */}
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
                Établissements
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Trois familles d&apos;établissements{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    canadiens couvertes
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {ETABLISSEMENTS.map((eta) => {
                const Icon = eta.icon;
                return (
                  <article
                    key={eta.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {eta.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {eta.desc}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        <Compass className="h-3 w-3" />
                        {eta.badge}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bourses cross-link */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-nexus-orange-500/15 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30 backdrop-blur">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                    Vous cherchez un financement académique ?
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                    Bourses, aides, programmes ciblés —{" "}
                    <Link
                      href="/services/bourses"
                      className="font-bold text-nexus-orange-300 underline-offset-4 hover:underline"
                    >
                      voir le service Bourses →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. CAS TYPES — 3 cards tech case study ──── */}
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
                Cas types
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Trois profils, trois trajectoires.
              </h2>
            </div>

            {/* Mobile + tablet : scroll-snap */}
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
                Transparence
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ce que nous{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    pouvons et ne pouvons pas
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Pas de promesse marketing. Voici la frontière exacte de notre
                engagement.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
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
                    Nous ne ferons pas
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

        {/* 13. CADRE TARIFAIRE — 3 cards glass ──── */}
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
                Tarif
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Un cadre tarifaire écrit avant signature.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Trois composantes claires. Le forfait accompagnement annoncé
                avant tout engagement.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {TARIFS.map((tarif) => {
                const Icon = tarif.icon;
                const isHi = "highlight" in tarif && tarif.highlight;
                return (
                  <article
                    key={tarif.title}
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
                        {tarif.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {tarif.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Cadre légal */}
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {CADRE.map((it) => {
                const Icon = it.icon;
                return (
                  <article
                    key={it.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-nexus-blue-900/60 text-nexus-orange-300 ring-1 ring-nexus-orange-400/20 backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-sm font-bold leading-tight text-white sm:text-base">
                        {it.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {it.desc}
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
              Engager la procédure
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Engagez la procédure dans les conditions exigées.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Soumettez votre demande pour qu&apos;un conseiller Nexus étudie
              votre dossier. Réponse écrite avec bilan de faisabilité avant tout
              engagement.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/services/etudes/demarrer"
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
                href="/rendez-vous?service=etudes"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Prendre rendez-vous
              </Link>
              <a
                href={whatsappLink("Bonjour, je souhaite étudier au Canada.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-bold text-white/70 transition-all duration-300 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Question rapide
              </a>
            </div>

            {/* Tagline éditoriale */}
            <div className="relative mx-auto mt-14 max-w-2xl">
              <p className="font-display text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                Programme aligné +{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  permis sécurisé
                </span>{" "}
                + arrivée encadrée.
              </p>
            </div>

            {/* 4 trust signals */}
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: ShieldCheck, label: "Étude gratuite" },
                { icon: Receipt, label: "Bilan écrit" },
                { icon: Eye, label: "Programme aligné" },
                { icon: Activity, label: "Permis sécurisé" },
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
