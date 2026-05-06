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

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO Premium ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-36 pb-20 text-white sm:pt-40">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-nexus-blue-700/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300 backdrop-blur">
                <Building2 className="h-3 w-3" />
                À propos de Nexus RCA
              </span>

              <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Une structure engagée pour accompagner et développer vos projets.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                NEXUS RCA accompagne particuliers et entreprises dans leurs
                démarches, projets internationaux, partenariats et
                développement d'activités.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Bureau Bangui
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Présence Europe & Canada
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Méthodologie écrite
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── QUI SOMMES-NOUS ───────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                  Qui sommes-nous
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
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

              <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm sm:p-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Stat number="10+" label="Services experts" />
                  <Stat number="2" label="Pôles internationaux" />
                  <Stat number="24h" label="Délai de réponse" />
                  <Stat number="100%" label="Suivi des dossiers" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VISION (cœur orange préservé) ─────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-nexus-orange-500/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-nexus-blue-500/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
                <Heart className="h-6 w-6" />
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                Notre vision
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
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

              {/* Citation mise en avant — Premium */}
              <blockquote className="my-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-7 py-7 shadow-sm sm:px-9 sm:py-8">
                <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                  Nous croyons que le développement d'un pays commence par ses
                  personnes.
                </p>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
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

        {/* ─── MISSION ───────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                Notre mission
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
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

        {/* ─── NOTRE APPROCHE ────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                Notre approche
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
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

        {/* ─── NOTRE DIFFÉRENCE ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-700/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
                Notre différence
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                Une approche globale, peu commune.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {VALEURS.slice(0, 3).map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-colors hover:border-nexus-orange-300/40"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-white">
                      {val.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300/90">
                      {val.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-nexus-orange-500/30 bg-nexus-orange-500/10 p-7 text-center backdrop-blur sm:p-8">
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

        {/* ─── FONDATEURS ────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                Direction
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
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

        {/* ─── POURQUOI NOUS FAIRE CONFIANCE ─────────────────────────── */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                Pourquoi nous faire confiance
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
                Quatre raisons concrètes.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {POURQUOI.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-nexus-orange-300/70"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-nexus-blue-950">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-nexus-blue-700/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
              Prochaine étape
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Vous avez un projet ou une démarche ?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Parlons-en. Notre équipe étudie votre situation et revient avec un
              plan clair, sans engagement.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/demande/complet"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600"
              >
                Ouvrir un dossier
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-white/10"
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

// ─── Sous-composants ──────────────────────────────────────────────────────

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
        {number}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
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
    <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-colors hover:border-nexus-orange-300/70">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
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
    <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-colors hover:border-nexus-orange-300/70">
      <p className="font-display text-3xl font-bold text-slate-200 tabular-nums">
        {step}
      </p>
      <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </article>
  );
}

// ─── Carte fondateur — design horizontal sober Premium ────────────────────
function FounderCard({ founder }: { founder: Founder }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-nexus-orange-300/70 sm:p-7">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Photo / initiales */}
        <div className="relative shrink-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 sm:h-36 sm:w-36">
            {founder.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={founder.photo}
                alt={`Portrait de ${founder.name}`}
                className="h-full w-full object-cover"
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
          <p className="mt-1 text-sm font-semibold text-nexus-orange-600">
            {founder.role}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-nexus-orange-100 hover:text-nexus-orange-600"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-nexus-blue-100 hover:text-nexus-blue-700"
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
