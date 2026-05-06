import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  Globe2,
  Handshake,
  Heart,
  Linkedin,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

export const metadata = {
  title: "À propos | Nexus RCA",
  description:
    "Nexus RCA est une agence internationale basée à Bangui, spécialisée dans l'accompagnement administratif, les projets internationaux et le développement d'activités. Découvrez notre vision, notre équipe et notre approche.",
};

interface Founder {
  name: string;
  role: string;
  bio: string;
  /** Chemin vers l'image dans /public — laisse undefined pour afficher les initiales */
  photo?: string;
  email?: string;
  linkedin?: string;
  initials: string;
  location: string;
}

const FOUNDERS: Founder[] = [
  {
    name: "Thierry F. KANKOU",
    role: "Cofondateur & Responsable International",
    bio: "Spécialiste de la logistique, du service client et de la gestion de projets. Thierry structure les opérations de Nexus RCA et accompagne les clients dans leurs démarches internationales avec rigueur et méthode. Sa vision : transformer chaque projet en résultat concret grâce à une approche structurée et un suivi sans faille.",
    initials: "TK",
    location: "Bangui · Canada",
    photo: "/team/thierry-kankou.jpg",
  },
  {
    name: "Orson DIBERT.K",
    role: "Cofondateur & Responsable International (Europe–RCA)",
    bio: "Pilier de la stratégie internationale de Nexus RCA, Orson développe les ponts entre l'Europe et la Centrafrique. Son expertise en gestion et en coordination transfrontalière permet à l'agence d'accompagner des projets ambitieux à l'échelle internationale.",
    initials: "OD",
    location: "Europe · RCA",
    photo: "/team/orson-dibert.jpg",
  },
];

const VALEURS = [
  {
    icon: ShieldCheck,
    title: "Rigueur",
    description:
      "Chaque dossier est traité avec sérieux, méthode et attention aux détails.",
  },
  {
    icon: Target,
    title: "Résultats",
    description:
      "Notre engagement se mesure aux objectifs atteints, pas aux promesses faites.",
  },
  {
    icon: Handshake,
    title: "Partenariat",
    description:
      "Nous travaillons aux côtés de nos clients, pas simplement pour eux.",
  },
  {
    icon: Globe2,
    title: "Ouverture",
    description:
      "Une vision internationale ancrée dans une expertise locale solide.",
  },
];

const POURQUOI = [
  {
    icon: CheckCircle2,
    title: "Accompagnement structuré",
    description:
      "Un processus clair, du premier contact jusqu'à l'atteinte de l'objectif.",
  },
  {
    icon: Briefcase,
    title: "Approche sérieuse",
    description:
      "Nous ne promettons que ce que nous savons livrer. Chaque dossier est étudié avec rigueur.",
  },
  {
    icon: Sparkles,
    title: "Solutions concrètes",
    description:
      "Pas de jargon, pas de fausses pistes. Des actions précises pour des résultats mesurables.",
  },
  {
    icon: Users,
    title: "Suivi des dossiers",
    description:
      "Un interlocuteur dédié, des points d'étape réguliers, une transparence totale.",
  },
];

// ─── Pattern dot grid (Stripe-like) ─────────────────────────────────────────
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

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO Premium tech ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-28 pb-16 text-white sm:pt-40 sm:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/40 hover:bg-white/10">
                <Building2 className="h-3 w-3" />
                À propos de Nexus RCA
              </span>

              <h1 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Une structure engagée pour accompagner et développer vos projets.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                NEXUS RCA accompagne particuliers et entreprises dans leurs
                démarches, projets internationaux, partenariats et
                développement d'activités.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Bureau Bangui
                </span>
                <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
                  <Globe2 className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Présence Europe & Canada
                </span>
                <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Méthodologie écrite
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── QUI SOMMES-NOUS ────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                  Qui sommes-nous
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                  Une agence internationale, ancrée à Bangui.
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                  <p>
                    NEXUS RCA est une agence internationale basée à{" "}
                    <strong className="text-nexus-blue-950">
                      Bangui, en République Centrafricaine
                    </strong>
                    , spécialisée dans l'accompagnement administratif, les
                    projets internationaux et le développement d'activités.
                  </p>
                  <p>
                    Nous travaillons avec une approche{" "}
                    <strong className="text-nexus-blue-950">
                      structurée et professionnelle
                    </strong>
                    , au service de clients qui veulent transformer leurs
                    démarches et projets en résultats concrets.
                  </p>
                </div>
              </div>

              {/* Stats card avec dot grid + glow subtle au hover */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50/40 p-7 shadow-sm transition-all duration-500 hover:border-nexus-orange-300/40 hover:shadow-[0_20px_50px_-25px_rgba(255,102,0,0.20)] sm:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={DOT_GRID_LIGHT}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-700 group-hover:bg-nexus-orange-500/10"
                />
                <div className="relative grid gap-3 sm:grid-cols-2">
                  <Stat number="10+" label="Services experts" />
                  <Stat number="2" label="Pôles internationaux" />
                  <Stat number="24h" label="Délai de réponse" />
                  <Stat number="100%" label="Suivi des dossiers" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VISION (cœur orange préservé) ──────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/12 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/10 blur-[100px]"
          />

          <div className="relative mx-auto max-w-3xl px-4 lg:px-8">
            <div className="text-center">
              <div className="group/heart relative mx-auto mb-5 inline-flex">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 blur-xl transition-opacity duration-500 group-hover/heart:opacity-100 opacity-60"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_12px_32px_-8px_rgba(255,102,0,0.5)] transition-transform duration-500 ease-out group-hover/heart:scale-110">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Notre vision
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Une mission profondément humaine.
              </h2>
            </div>

            <div className="mt-12 space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              <p>
                Nexus RCA est né d'une réalité simple :{" "}
                <strong className="text-nexus-blue-950">
                  trop de talents en République Centrafricaine restent bloqués
                </strong>{" "}
                faute d'accompagnement, d'information et d'opportunités.
              </p>

              <p>
                Nous avons créé Nexus pour aider concrètement — pas seulement
                informer, mais{" "}
                <strong className="text-nexus-blue-950">
                  accompagner, guider et ouvrir des portes
                </strong>
                .
              </p>

              <p>
                Notre mission est profondément humaine : soutenir les jeunes,
                les entrepreneurs, les commerçants et les familles
                centrafricaines dans leurs projets de vie et leurs ambitions.
              </p>

              {/* Citation Premium tech */}
              <blockquote className="group/quote relative my-10 overflow-hidden rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-6 py-6 shadow-[0_20px_50px_-25px_rgba(12,28,64,0.18)] transition-all duration-500 hover:shadow-[0_24px_60px_-25px_rgba(255,102,0,0.22)] sm:px-9 sm:py-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover/quote:bg-nexus-orange-500/12"
                />
                <p className="relative font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                  Nous croyons que le développement d'un pays commence par ses
                  personnes.
                </p>
                <p className="relative mt-3 text-base leading-relaxed text-slate-600">
                  Chaque dossier traité, chaque projet lancé représente une vie
                  qui avance et une communauté qui progresse.
                </p>
              </blockquote>

              <p>
                Nexus RCA agit comme un{" "}
                <strong className="text-nexus-blue-950">
                  outil de transformation sociale
                </strong>
                , en rendant accessibles des services souvent complexes avec un
                accompagnement sérieux, honnête et engagé.
              </p>

              <p>
                Au-delà du business, nous avons une responsabilité :{" "}
                <strong className="text-nexus-blue-950">
                  contribuer au développement de la République Centrafricaine
                </strong>{" "}
                en aidant sa population à se connecter au monde et à construire
                un avenir meilleur.
              </p>
            </div>
          </div>
        </section>

        {/* ─── MISSION ────────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Notre mission
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Trois engagements clairs.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <MissionCard
                icon={Compass}
                title="Simplifier les démarches"
                description="Visa, études, administratif : nous transformons les processus complexes en parcours clairs et exécutables."
              />
              <MissionCard
                icon={Briefcase}
                title="Accompagner les projets"
                description="Du premier contact jusqu'à l'objectif atteint, un interlocuteur dédié pour structurer et avancer."
              />
              <MissionCard
                icon={Sparkles}
                title="Créer des opportunités"
                description="Mettre en relation, ouvrir des portes, débloquer des projets : faire émerger ce qui peut grandir."
              />
            </div>
          </div>
        </section>

        {/* ─── NOTRE APPROCHE ─────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Notre approche
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Méthode, rigueur, résultats.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Nous croyons qu'un bon accompagnement repose sur trois piliers
                indissociables.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <ApproachCard
                step="01"
                title="Accompagnement personnalisé"
                description="Chaque client est unique. Nous prenons le temps de comprendre votre situation avant de proposer un plan d'action."
              />
              <ApproachCard
                step="02"
                title="Structuration des projets"
                description="Un dossier bien monté, c'est 80% du résultat. Nous structurons, organisons, anticipons."
              />
              <ApproachCard
                step="03"
                title="Rigueur et résultats"
                description="Pas de promesses creuses. Des engagements tenus, des suivis transparents, des résultats mesurables."
              />
            </div>
          </div>
        </section>

        {/* ─── NOTRE DIFFÉRENCE — navy Premium tech ───────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Notre différence
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Une approche globale, peu commune.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {VALEURS.slice(0, 3).map((val) => {
                const Icon = val.icon;
                return (
                  <article
                    key={val.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.08] hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.30)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-lg font-bold text-white">
                        {val.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300/95">
                        {val.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-nexus-orange-500/30 bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/10 to-nexus-orange-500/5 p-7 text-center backdrop-blur-md transition-colors duration-300 hover:border-nexus-orange-500/50 sm:p-8">
              <p className="text-base leading-relaxed text-white sm:text-lg">
                <strong className="text-nexus-orange-300">
                  Approche globale, capacité à accompagner de A à Z, logique de
                  partenariat
                </strong>{" "}
                — c'est ce qui distingue Nexus RCA des solutions classiques.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FONDATEURS ─────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Direction
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Les visages derrière Nexus RCA.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Une équipe engagée, complémentaire, qui porte ses convictions au
                service de ses clients.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
              {FOUNDERS.map((founder) => (
                <FounderCard key={founder.name} founder={founder} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── POURQUOI NOUS FAIRE CONFIANCE ──────────────────────────── */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                Pourquoi nous faire confiance
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                Quatre raisons concrètes.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {POURQUOI.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="group relative flex gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="relative min-w-0">
                      <h3 className="font-display text-base font-bold text-nexus-blue-950">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL Premium tech ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              Prochaine étape
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Vous avez un projet ou une démarche ?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Parlons-en. Notre équipe étudie votre situation et revient avec un
              plan clair, sans engagement.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/demande/complet"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                Ouvrir un dossier
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                Prendre rendez-vous
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composants Premium tech ─────────────────────────────────────────

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="group/stat relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_12px_28px_-12px_rgba(255,102,0,0.18)]">
      <p className="font-display text-2xl font-bold leading-none text-nexus-blue-950 transition-colors duration-300 group-hover/stat:text-nexus-orange-600 sm:text-3xl">
        {number}
      </p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function MissionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-lg font-bold text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}

function ApproachCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <p className="font-display text-3xl font-bold tabular-nums text-slate-200 transition-colors duration-300 group-hover:text-nexus-orange-300">
          {step}
        </p>
        <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}

// ─── Carte fondateur Premium tech ──────────────────────────────────────────
function FounderCard({ founder }: { founder: Founder }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_20px_50px_-20px_rgba(255,102,0,0.18)] sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/12"
      />
      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Photo / initiales */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-nexus-orange-500/0 blur-xl transition-all duration-500 group-hover:bg-nexus-orange-500/20" />
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 transition-all duration-500 group-hover:ring-nexus-orange-300/60 sm:h-36 sm:w-36">
            {founder.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={founder.photo}
                alt={`Portrait de ${founder.name}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 font-display text-3xl font-bold text-white sm:text-4xl">
                {founder.initials}
              </div>
            )}
          </div>
        </div>

        {/* Texte du fondateur */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h3 className="font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {founder.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-nexus-orange-600">
            {founder.role}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors duration-300 group-hover:bg-slate-200/80">
            <MapPin className="h-3 w-3 text-nexus-orange-500" />
            {founder.location}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {founder.bio}
          </p>

          {(founder.email || founder.linkedin) && (
            <div className="mt-5 flex justify-center gap-2 border-t border-slate-200 pt-5 sm:justify-start">
              {founder.email && (
                <a
                  href={`mailto:${founder.email}`}
                  aria-label={`Envoyer un email à ${founder.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-100 hover:text-nexus-orange-600"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`LinkedIn de ${founder.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-blue-100 hover:text-nexus-blue-700"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
