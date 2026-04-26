import Link from "next/link";
import {
  Building2,
  Target,
  Compass,
  Sparkles,
  Globe2,
  Handshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Mail,
  Linkedin,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

export const metadata = {
  title: "À propos | Nexus RCA",
  description:
    "Nexus RCA est une agence internationale basée à Bangui, spécialisée dans l'accompagnement administratif, les projets internationaux et le développement d'activités. Découvrez notre équipe et notre approche.",
};

interface Founder {
  name: string;
  role: string;
  bio: string;
  /** Chemin vers l image dans /public — laisse undefined pour afficher les initiales */
  photo?: string;
  email?: string;
  linkedin?: string;
  initials: string;
  location: string;
}

// IMPORTANT : pour utiliser une vraie photo, place le fichier dans /public/team/
// puis decommente la ligne photo de chaque fondateur ci-dessous.
const FOUNDERS: Founder[] = [
  {
    name: "Thierry F. Kankou",
    role: "Cofondateur & Responsable International",
    bio: "Spécialiste de la logistique, du service client et de la gestion de projets. Thierry structure les opérations de Nexus RCA et accompagne les clients dans leurs démarches internationales avec rigueur et méthode. Sa vision : transformer chaque projet en résultat concret grâce à une approche structurée et un suivi sans faille.",
    initials: "TK",
    location: "Bangui · Canada",
    // photo: "/team/thierry-kankou.jpg", // ← decommente quand tu auras place la photo
  },
  {
    name: "Orson Dibert L.",
    role: "Cofondateur & Responsable International (Europe–RCA)",
    bio: "Pilier de la stratégie internationale de Nexus RCA, Orson développe les ponts entre l'Europe et la Centrafrique. Son expertise en gestion et en coordination transfrontalière permet à l'agence d'accompagner des projets ambitieux à l'échelle internationale.",
    initials: "OD",
    location: "Europe · RCA",
    // photo: "/team/orson-dibert.jpg", // ← decommente quand tu auras place la photo
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
        {/* ==================== HERO ==================== */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                <Building2 className="h-4 w-4 text-nexus-orange-400" />
                À propos de Nexus RCA
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
                Une structure engagée pour{" "}
                <span className="text-gradient-orange">accompagner</span> et{" "}
                <span className="text-gradient-orange">développer</span> vos
                projets
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
                NEXUS RCA accompagne particuliers et entreprises dans leurs
                démarches, projets internationaux, partenariats et développement
                d'activités.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== QUI SOMMES-NOUS ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                  Qui sommes-nous
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                  Une agence internationale, ancrée à Bangui
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
                  <p>
                    NEXUS RCA est une agence internationale basée à{" "}
                    <strong className="text-nexus-blue-950">
                      Bangui, en République Centrafricaine
                    </strong>
                    , spécialisée dans l'accompagnement administratif, les projets
                    internationaux et le développement d'activités.
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

              <div className="relative">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-100 to-nexus-orange-100 p-8 shadow-xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Stat number="10+" label="Services experts" />
                    <Stat number="2" label="Pôles internationaux" />
                    <Stat number="24h" label="Délai de réponse" />
                    <Stat number="100%" label="Suivi des dossiers" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== MISSION ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre mission
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Trois engagements clairs
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
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

        {/* ==================== NOTRE APPROCHE ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre approche
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Méthode, rigueur, résultats
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
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

        {/* ==================== NOTRE DIFFÉRENCE ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-400">
                Notre différence
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                Une approche globale, peu commune
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {VALEURS.slice(0, 3).map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 shadow-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold">
                      {val.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {val.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-nexus-orange-500/30 bg-nexus-orange-500/10 p-6 text-center backdrop-blur sm:p-8">
              <p className="text-lg leading-relaxed text-white sm:text-xl">
                <strong className="text-nexus-orange-300">
                  Approche globale, capacité à accompagner de A à Z, logique de
                  partenariat
                </strong>{" "}
                — c'est ce qui distingue Nexus RCA des solutions classiques.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== FONDATEURS ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Direction
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Les visages derrière Nexus RCA
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Une équipe engagée, complémentaire, qui porte ses convictions au
                service de ses clients.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {FOUNDERS.map((founder) => (
                <FounderCard key={founder.name} founder={founder} />
              ))}
            </div>
          </div>
        </section>

        {/* ==================== POURQUOI NOUS FAIRE CONFIANCE ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Pourquoi nous faire confiance
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Quatre raisons concrètes
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {POURQUOI.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== CTA FINAL ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Vous avez un projet ou une démarche ?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
              Parlons-en. Notre équipe étudie votre situation et revient avec un
              plan clair, sans engagement.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/demande/complet"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-nexus-blue-950 shadow-xl transition hover:scale-105 hover:shadow-2xl"
              >
                Ouvrir un dossier
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
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

// ============================================================================
// SOUS-COMPOSANTS (tous en server components — pas de onClick/onError)
// ============================================================================

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-5 text-center backdrop-blur-sm">
      <p className="font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
        {number}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
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
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="font-display text-4xl font-bold text-nexus-orange-500">
        {step}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover">
      {/* Photo si fournie, sinon initiales */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-nexus-blue-100 via-slate-100 to-nexus-orange-100">
        {founder.photo ? (
          // Vraie photo : on l affiche en couvrant tout
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={founder.photo}
            alt={`Portrait de ${founder.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Pas de photo : on affiche les initiales dans un cercle
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-orange-500 font-display text-5xl font-bold text-white shadow-2xl">
              {founder.initials}
            </div>
          </div>
        )}

        {/* Badge localisation */}
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-nexus-blue-950 shadow-md backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-nexus-orange-500" />
          {founder.location}
        </div>
      </div>

      {/* Texte */}
      <div className="p-6 sm:p-8">
        <h3 className="font-display text-2xl font-bold text-nexus-blue-950">
          {founder.name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-nexus-orange-600">
          {founder.role}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {founder.bio}
        </p>

        {/* Liens contact */}
        {(founder.email || founder.linkedin) && (
          <div className="mt-5 flex gap-2 border-t border-slate-200 pt-5">
            {founder.email && (
              <a
                href={`mailto:${founder.email}`}
                aria-label={`Envoyer un email à ${founder.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-nexus-orange-100 hover:text-nexus-orange-600"
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-nexus-blue-100 hover:text-nexus-blue-700"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
