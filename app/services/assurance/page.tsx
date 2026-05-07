import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { AssuranceWorldMap } from "@/components/services/AssuranceWorldMap";
import { AssuranceUniverseCards } from "@/components/services/AssuranceUniverseCards";
import {
  ShieldCheck,
  Globe2,
  Compass,
  ArrowRight,
  MessageCircle,
  Calendar,
  ClipboardList,
  Search,
  FileSignature,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Plane,
  Building2,
  Scale,
  HandCoins,
  Award,
  Headphones,
  ChevronDown,
  Shield,
  MapPin,
  Network,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title:
    "Assurance & mobilité internationale | Nexus RCA — courtage premium",
  description:
    "Cabinet de courtage assurance Nexus RCA — voyage, visa Schengen, santé internationale, études et mobilité business. Sélection rigoureuse, accompagnement complet, traitement des sinistres assuré par notre cabinet.",
};

// ─── Pattern dot grid sombre (réutilisé sur toute la page) ────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Méthodologie cabinet — 4 étapes ──────────────────────────────────────
const METHODOLOGIE = [
  {
    n: "01",
    icon: Search,
    title: "Diagnostic personnalisé",
    text: "Étude de votre profil, destination, durée, exigences consulaires et antécédents santé. Aucune souscription proposée tant que le besoin n'est pas qualifié.",
  },
  {
    n: "02",
    icon: ClipboardList,
    title: "Sélection assureur",
    text: "Comparaison rigoureuse parmi notre réseau d'assureurs partenaires européens. Recommandation argumentée — pas de produit imposé, pas de commission opaque.",
  },
  {
    n: "03",
    icon: FileSignature,
    title: "Souscription accompagnée",
    text: "Constitution du dossier, vérification ligne par ligne des conditions, attestation officielle remise au format consulaire. Conformité dossier visa garantie.",
  },
  {
    n: "04",
    icon: HeartPulse,
    title: "Activation & suivi sinistre",
    text: "En cas d'incident, notre cabinet traite le dossier sinistre pour vous : interface assureur, suivi médical, avocat-conseil partenaire si nécessaire.",
  },
];

// ─── 4 profils types — recommandations distinctes ─────────────────────────
const PROFILS = [
  {
    icon: Plane,
    eyebrow: "Profil 01",
    titre: "Touriste & affaires",
    description:
      "Séjour court 7 à 30 jours, Europe ou Amérique. Couverture voyage standard premium suffit dans 90% des cas.",
    recommandation: "Univers Voyage & loisirs",
    duree: "7 à 30 jours",
  },
  {
    icon: GraduationCap,
    eyebrow: "Profil 02",
    titre: "Étudiant international",
    description:
      "Départ Canada, France ou Europe pour 1 an+. Exigences universitaires + visa long séjour. Couverture santé internationale + RC scolaire indispensables.",
    recommandation: "Univers Études à l'étranger",
    duree: "1 à 5 ans",
  },
  {
    icon: Building2,
    eyebrow: "Profil 03",
    titre: "Expatrié & famille",
    description:
      "Mission longue, installation famille. Une vraie couverture santé internationale, pas un voyage prolongé. Maternité, dentaire, pédiatrie pris en compte.",
    recommandation: "Univers Santé internationale",
    duree: "12 mois et plus",
  },
  {
    icon: Briefcase,
    eyebrow: "Profil 04",
    titre: "Dirigeant & VIP",
    description:
      "Missions répétées, plusieurs continents, exigences renforcées. Conciergerie d'assistance dédiée, plafonds médicaux relevés, rapatriement VIP.",
    recommandation: "Univers Business & déplacements pro",
    duree: "Annuel multi-déplacements",
  },
];

// ─── Pourquoi Nexus — 4 raisons cabinet ───────────────────────────────────
const RAISONS = [
  {
    icon: Network,
    title: "Courtage neutre, pas vendeur d'un seul produit",
    text: "Nous sommes courtiers indépendants : nous comparons et recommandons l'assureur qui correspond à votre profil, pas celui qui paie le mieux.",
  },
  {
    icon: HandCoins,
    title: "Tarifs négociés grands comptes",
    text: "Notre volume nous permet de négocier des conditions préférentielles. Vous bénéficiez de tarifs et plafonds qu'un particulier seul n'obtiendrait pas.",
  },
  {
    icon: Shield,
    title: "Dossier sinistre traité par nous",
    text: "Vous n'affrontez pas l'assureur seul en cas d'incident. Notre cabinet prend en charge le dossier, l'interface, la relance jusqu'à indemnisation.",
  },
  {
    icon: Scale,
    title: "Avocat-conseil partenaire",
    text: "Litige, refus d'indemnisation, complication juridique à l'étranger : un avocat spécialisé en assurance internationale est mobilisable sous 24 h.",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: "Quelle assurance les consulats Schengen exigent-ils précisément ?",
    a: "Le code visas UE (règlement 810/2009) impose une couverture médicale d'au moins 30 000 €, valable dans tout l'espace Schengen, pour la durée du séjour. L'attestation doit être nominative et préciser les pays couverts. Nous délivrons des attestations conformes acceptées par tous les consulats.",
  },
  {
    q: "Que se passe-t-il en cas de refus de visa après souscription ?",
    a: "La plupart des polices que nous sélectionnons prévoient un remboursement partiel ou intégral en cas de refus de visa, sur présentation du courrier consulaire. Cette clause fait partie de nos critères de sélection — nous l'imposons à nos partenaires.",
  },
  {
    q: "En cas de sinistre à l'étranger, qui contacter ?",
    a: "Vous appelez la plateforme d'assistance 24/7 multilingue de l'assureur, dont le numéro figure sur votre attestation. En parallèle, vous pouvez nous contacter — notre cabinet ouvre un dossier de suivi et intervient si la prise en charge tarde ou pose problème.",
  },
  {
    q: "Quels sont les ordres de grandeur tarifaires ?",
    a: "Nos tarifs varient selon profil, durée, destination et niveau de couverture. Aucune grille publique : chaque devis est personnalisé après diagnostic. Notre approche est consultative, pas tarifaire — la priorité est la pertinence de la couverture, pas le prix d'appel.",
  },
  {
    q: "Quelle durée maximale pour une assurance voyage ?",
    a: "Les polices voyage couvrent généralement jusqu'à 90 jours par séjour. Au-delà, il faut une assurance santé internationale (formules 1, 2, 3 ans renouvelables) ou une assurance étudiant longue durée. Nous orientons selon la durée réelle du projet.",
  },
  {
    q: "Quelles sont les principales exclusions à connaître ?",
    a: "Les exclusions classiques sont : guerre, terrorisme dans certaines zones, sports extrêmes non déclarés, antécédents médicaux non signalés, voyages effectués contre avis médical. Nous parcourons ces points avec vous pendant le diagnostic — pas après souscription.",
  },
];

// ─── Réseau partenaires — placeholders ────────────────────────────────────
// Liste neutre, modifiable plus tard avec les vrais partenaires.
const PARTENAIRES_TYPES = [
  "Assureurs européens spécialisés voyage",
  "Mutuelles santé internationales",
  "Réseaux d'assistance médicale mondiaux",
  "Cabinets d'avocats spécialisés assurance",
];

export default function AssurancePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO ─────────────────────────────────────────────────────── */}
        <PublicHero
          eyebrow="Protection voyage haut de gamme"
          titleStart="Assurance & "
          accentWord="mobilité internationale"
          titleEnd="."
          subtitle="Cabinet de courtage Nexus RCA. Nous sélectionnons, négocions et accompagnons vos couvertures voyage, visa, santé, études et mobilité professionnelle — avec le sérieux d'une plateforme internationale."
          ctaPrimary={{
            href: "/contact?service=assurance",
            label: "Demander un diagnostic",
            icon: ShieldCheck,
          }}
          ctaSecondary={{
            href: "#univers",
            label: "Voir nos univers de couverture",
            icon: Compass,
          }}
        />

        {/* 2. COUVERTURE MONDIALE — carte signature ───────────────────── */}
        <section
          id="couverture"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
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
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <Globe2 className="h-3 w-3" />
                Réseau international
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Une couverture{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    mondiale
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                , pilotée depuis Bangui.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Notre réseau d&rsquo;assureurs et de plateformes d&rsquo;assistance
                couvre plus de 150 pays. Vous voyagez accompagné — partout,
                tout le temps.
              </p>
            </div>

            <div className="mt-14">
              <AssuranceWorldMap />
            </div>
          </div>
        </section>

        {/* 3. STANDARD SCHENGEN — bloc explicatif sobre ──────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-20 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              {/* Colonne titre */}
              <div className="lg:col-span-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                  Conformité consulaire
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Le standard exigé par les{" "}
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    consulats Schengen
                  </span>
                  .
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-300">
                  Le code visas de l&rsquo;Union européenne (règlement
                  810/2009) impose une assurance médicale conforme à des
                  critères précis. Tout dossier non-conforme est rejeté.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  Nos attestations sont délivrées sous 24 h ouvrées et
                  acceptées par l&rsquo;ensemble des consulats Schengen
                  représentés en RCA et en Afrique centrale.
                </p>
              </div>

              {/* Colonne checklist standard */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-nexus-orange-400/25 bg-gradient-to-br from-nexus-orange-500/8 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.20)] sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                    Critères réglementaires
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                    Le strict minimum à respecter
                  </h3>

                  <dl className="mt-6 space-y-5">
                    {[
                      {
                        terme: "Plafond médical",
                        valeur: "30 000 € minimum",
                        precision:
                          "Frais médicaux d&rsquo;urgence et hospitalisation",
                      },
                      {
                        terme: "Validité géographique",
                        valeur: "Ensemble de l&rsquo;espace Schengen",
                        precision: "27 États membres + AELE",
                      },
                      {
                        terme: "Durée de couverture",
                        valeur: "Égale ou supérieure au séjour demandé",
                        precision:
                          "Aller-retour inclus, période complète du visa",
                      },
                      {
                        terme: "Format attestation",
                        valeur: "Document nominatif officiel",
                        precision:
                          "Pays couverts, dates, nature de la garantie listés",
                      },
                    ].map((item) => (
                      <div
                        key={item.terme}
                        className="flex flex-col gap-1.5 border-b border-white/10 pb-5 last:border-0 last:pb-0 sm:grid sm:grid-cols-3 sm:gap-4"
                      >
                        <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                          {item.terme}
                        </dt>
                        <dd className="sm:col-span-2">
                          <p
                            className="font-display text-base font-bold text-white"
                            dangerouslySetInnerHTML={{ __html: item.valeur }}
                          />
                          <p
                            className="mt-1 text-xs leading-relaxed text-slate-400"
                            dangerouslySetInnerHTML={{
                              __html: item.precision,
                            }}
                          />
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-nexus-blue-950/40 px-4 py-2 text-xs text-slate-300 backdrop-blur">
                    <Award className="h-3.5 w-3.5 text-nexus-orange-300" />
                    <span>
                      Toutes nos polices Schengen sont auditées avant
                      délivrance.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LES 5 UNIVERS DE COUVERTURE ──────────────────────────────── */}
        <section
          id="univers"
          className="relative overflow-hidden bg-gradient-to-b from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-40 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-40 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/10 blur-[140px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                Domaines de couverture
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Cinq{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  univers
                </span>
                , conseillés au cas par cas.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Pas de produits à acheter, mais des domaines de couverture.
                Chaque profil n&rsquo;a pas besoin de tout — notre rôle est de
                construire la combinaison juste.
              </p>
            </div>

            <div className="mt-14">
              <AssuranceUniverseCards />
            </div>
          </div>
        </section>

        {/* 5. PROFILS — 4 cas types navy glass ─────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                Pour qui
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Quatre profils, quatre{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  recommandations
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Un cadre indicatif, pas une vente. Le diagnostic personnalisé
                affine systématiquement la recommandation.
              </p>
            </div>

            {/* Mobile : carrousel snap-x · Desktop : grid 4 cols */}
            <div className="mt-12 -mx-4 sm:-mx-6 lg:mx-0">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
                {PROFILS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <article
                      key={p.titre}
                      className="group relative w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:w-[60%] lg:w-auto"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                      />
                      <div className="relative flex h-full flex-col">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white ring-1 ring-white/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                          {p.eyebrow}
                        </p>
                        <h3 className="mt-1.5 font-display text-lg font-bold leading-tight text-white sm:text-xl">
                          {p.titre}
                        </h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
                          {p.description}
                        </p>
                        <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                            Recommandation
                          </div>
                          <div className="text-sm font-bold text-white">
                            {p.recommandation}
                          </div>
                          <div className="text-xs text-slate-400">
                            {p.duree}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. MÉTHODOLOGIE 4 ÉTAPES — timeline numérotée ─────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-nexus-orange-500/10 blur-[140px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                Méthodologie
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Quatre étapes, un{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  accompagnement
                </span>{" "}
                continu.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Du premier échange jusqu&rsquo;au traitement éventuel d&rsquo;un
                sinistre, votre dossier reste piloté par notre cabinet.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {METHODOLOGIE.map((etape, i) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.n}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-5xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(251,146,60,0.4)] sm:text-6xl">
                          {etape.n}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
                          <Icon className="h-4 w-4 text-nexus-orange-300" />
                        </div>
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {etape.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {etape.text}
                      </p>
                    </div>
                    {/* Connecteur visuel desktop entre étapes */}
                    {i < METHODOLOGIE.length - 1 && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-3 bg-gradient-to-r from-nexus-orange-500/40 to-transparent lg:block"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. POURQUOI NEXUS — 4 raisons ──────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                Notre différence
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Pourquoi confier votre assurance à{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  notre cabinet
                </span>
                ?
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
              {RAISONS.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:p-8"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative flex gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
                        <Icon className="h-5 w-5 text-nexus-orange-300" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                          {r.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {r.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. RÉSEAU PARTENAIRES — placeholder discret ────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={DOT_GRID_DARK}
          />

          <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              Notre réseau
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Un{" "}
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                écosystème de partenaires
              </span>{" "}
              sélectionnés.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Nous travaillons exclusivement avec des assureurs et plateformes
              d&rsquo;assistance reconnus internationalement. Sélection
              auditée chaque année selon la qualité du traitement sinistre.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PARTENAIRES_TYPES.map((p) => (
                <div
                  key={p}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                >
                  <Network className="mx-auto h-5 w-5 text-nexus-orange-300" />
                  <p className="mt-3 text-xs font-semibold leading-relaxed text-white">
                    {p}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-10 text-xs text-slate-500">
              Liste détaillée des partenaires communiquée lors du diagnostic.
            </p>
          </div>
        </section>

        {/* 9. FAQ ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                FAQ — questions d&rsquo;expert
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Les{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  bonnes questions
                </span>{" "}
                à se poser.
              </h2>
            </div>

            <div className="mt-12 space-y-3">
              {FAQ.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-colors hover:border-nexus-orange-400/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
                    <span className="font-display text-base font-bold leading-snug text-white sm:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-nexus-orange-300 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-6 pt-0 text-sm leading-relaxed text-slate-300 sm:px-6">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 10. CTA FINAL — hero card premium ──────────────────────────── */}
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

          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              Diagnostic personnalisé
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Construisons ensemble votre{" "}
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                couverture
              </span>
              .
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Un échange préliminaire pour qualifier votre besoin. Une
              recommandation argumentée. Une souscription accompagnée. Un
              cabinet derrière chaque dossier.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Compass className="mx-auto mb-1 h-4 w-4 text-nexus-orange-300" />
                Diagnostic offert
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Calendar className="mx-auto mb-1 h-4 w-4 text-nexus-orange-300" />
                Réponse 24 h ouvrées
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Headphones className="mx-auto mb-1 h-4 w-4 text-nexus-orange-300" />
                Suivi 24 / 7
              </div>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/contact?service=assurance"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <ShieldCheck className="h-4 w-4" />
                Demander un diagnostic
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <a
                href={whatsappLink(
                  "Bonjour Nexus, je souhaite un diagnostic assurance personnalisé."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp +236 73 26 96 92
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/60">
              <span className="flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-nexus-orange-300" />
                Assistance multilingue 24/7
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-nexus-orange-300" />
                Réseau 150+ pays
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                Conforme code visas UE
              </span>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 backdrop-blur">
              <MapPin className="h-3 w-3 text-nexus-orange-300" />
              Bangui, République Centrafricaine
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
