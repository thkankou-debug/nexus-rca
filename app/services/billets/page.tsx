import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Plane,
  Hotel,
  Search,
  TrendingDown,
  MapPin,
  Wallet,
  Headphones,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Heart,
  Globe,
  Star,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Billets d'avion & Hôtels | Nexus RCA",
  description:
    "Réservation de billets d'avion et d'hôtels à travers le monde. Accompagnement personnalisé, meilleurs tarifs, hôtels fiables. Asie, Europe, Afrique, Moyen-Orient, Amérique. Demandez votre devis avec Nexus RCA.",
};

// ============================================================================
// DONNEES
// ============================================================================
const PROBLEMES = [
  {
    icon: Clock,
    text: "Heures perdues à comparer les sites de réservation",
  },
  {
    icon: AlertCircle,
    text: "Erreurs sur les dates, les correspondances ou les paiements",
  },
  {
    icon: Wallet,
    text: "Difficultés à trouver les meilleurs tarifs",
  },
  {
    icon: Hotel,
    text: "Doutes sur la fiabilité des hôtels et des plateformes",
  },
];

const VOLS_SERVICES = [
  {
    icon: Search,
    title: "Recherche des meilleurs vols",
    description:
      "Comparaison sur les principales compagnies aériennes internationales et africaines.",
  },
  {
    icon: TrendingDown,
    title: "Comparaison des prix",
    description:
      "Identification des meilleures offres en temps réel selon vos dates et votre flexibilité.",
  },
  {
    icon: MapPin,
    title: "Itinéraires optimisés",
    description:
      "Choix des correspondances, durées et escales les mieux adaptés à votre voyage.",
  },
  {
    icon: Wallet,
    title: "Vols adaptés au budget",
    description:
      "Solutions économiques, business ou première classe selon vos moyens et vos préférences.",
  },
  {
    icon: Headphones,
    title: "Conseils personnalisés",
    description:
      "Recommandations sur les meilleures dates, périodes et compagnies pour votre destination.",
  },
];

const HOTELS_SERVICES = [
  {
    icon: ShieldCheck,
    title: "Hôtels fiables uniquement",
    description:
      "Sélection rigoureuse parmi les établissements vérifiés et bien notés par les voyageurs.",
  },
  {
    icon: Wallet,
    title: "Options selon votre budget",
    description:
      "De l'hébergement abordable à l'hôtel premium, des solutions pour chaque profil.",
  },
  {
    icon: MapPin,
    title: "Localisation stratégique",
    description:
      "Hôtels proches du centre-ville, des sites touristiques ou des zones d'affaires.",
  },
  {
    icon: Star,
    title: "Confort et sécurité",
    description:
      "Vérification systématique de la qualité du service, du confort et des standards de sécurité.",
  },
];

interface Destination {
  name: string;
  emoji: string;
  description: string;
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
    description: "Destinations populaires pour le tourisme et les affaires.",
    highlight: true,
    destinations: [
      { name: "Inde", emoji: "🇮🇳", description: "Tourisme, business, spirituel" },
      { name: "Thaïlande", emoji: "🇹🇭", description: "Bangkok, Phuket, Chiang Mai" },
      { name: "Indonésie (Bali)", emoji: "🇮🇩", description: "Bali, Jakarta" },
      { name: "Vietnam", emoji: "🇻🇳", description: "Hanoi, Ho Chi Minh, Da Nang" },
      { name: "Dubaï (EAU)", emoji: "🇦🇪", description: "Business, shopping, luxe" },
    ],
  },
  {
    title: "Europe",
    emoji: "🌍",
    description: "Voyages d'affaires, études, tourisme et famille.",
    destinations: [
      { name: "France", emoji: "🇫🇷", description: "Paris, Marseille, Lyon" },
      { name: "Belgique", emoji: "🇧🇪", description: "Bruxelles, Anvers" },
      { name: "Allemagne", emoji: "🇩🇪", description: "Berlin, Francfort, Munich" },
      { name: "Espagne", emoji: "🇪🇸", description: "Madrid, Barcelone, Séville" },
    ],
  },
  {
    title: "Afrique",
    emoji: "🌍",
    description: "Vols continentaux et liaisons régionales.",
    destinations: [
      { name: "Maroc", emoji: "🇲🇦", description: "Casablanca, Marrakech, Rabat" },
      { name: "Sénégal", emoji: "🇸🇳", description: "Dakar et environs" },
      { name: "Kenya", emoji: "🇰🇪", description: "Nairobi, Mombasa" },
    ],
  },
  {
    title: "Amérique",
    emoji: "🌎",
    description: "Destinations long-courrier et études.",
    destinations: [
      { name: "Canada", emoji: "🇨🇦", description: "Montréal, Toronto, Ottawa" },
    ],
  },
];

const POURQUOI = [
  {
    icon: Clock,
    title: "Gain de temps considérable",
    description:
      "Plus besoin de passer des heures à comparer. Vous nous donnez votre projet, nous gérons la recherche.",
  },
  {
    icon: Sparkles,
    title: "Accompagnement personnalisé",
    description:
      "Un conseiller dédié comprend votre projet de voyage et propose les meilleures options.",
  },
  {
    icon: ShieldCheck,
    title: "Solutions fiables",
    description:
      "Compagnies aériennes reconnues, hôtels vérifiés, plateformes de confiance uniquement.",
  },
  {
    icon: Wallet,
    title: "Optimisation du budget",
    description:
      "Nous trouvons le meilleur rapport qualité-prix selon vos contraintes et vos priorités.",
  },
  {
    icon: Headphones,
    title: "Assistance complète",
    description:
      "Suivi avant, pendant et après votre voyage. Un contact direct en cas de besoin.",
  },
  {
    icon: Heart,
    title: "Voyages adaptés à vos besoins",
    description:
      "Tourisme, famille, affaires, études, urgence : nous traitons chaque demande avec soin.",
  },
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export default function BilletsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ==================== HERO ==================== */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                <Plane className="h-4 w-4 text-nexus-orange-400" />
                Billets d'avion & Hôtels
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
                Voyagez{" "}
                <span className="text-gradient-orange">sans stress</span>, avec
                un accompagnement{" "}
                <span className="text-gradient-orange">de A à Z</span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
                Nexus RCA s'occupe de tout : recherche des meilleurs vols,
                réservation d'hôtels fiables, optimisation de votre itinéraire
                et de votre budget. Vous voyagez, nous gérons le reste.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=billets"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-nexus-orange-500/40 transition hover:scale-105 hover:bg-nexus-orange-600"
                >
                  Demander une réservation
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#destinations"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Voir les destinations
                </Link>
              </div>

              <p className="mt-5 text-sm text-white/60">
                Devis gratuit · Réponse rapide · Tarifs transparents
              </p>
            </div>
          </div>
        </section>

        {/* ==================== INTRODUCTION (PROBLÈME) ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Le constat
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Organiser un voyage prend trop de temps
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Comparer les sites, vérifier les correspondances, choisir un
                hôtel fiable, gérer son budget : un voyage bien préparé demande
                des heures de recherche.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {PROBLEMES.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 sm:text-base">
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-gradient-to-br from-nexus-orange-50 to-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
              <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                Avec Nexus RCA, vous économisez du temps et du stress.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                Un seul interlocuteur, une recherche professionnelle, des
                solutions claires. Vous nous donnez votre projet, nous nous
                occupons du reste.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== BILLETS D'AVION ==================== */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                <Plane className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Billets d'avion
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Le bon vol, au bon prix, au bon moment
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Nous comparons, conseillons et réservons à votre place.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VOLS_SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== HÔTELS ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
                <Hotel className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Réservation d'hôtels
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Un hébergement fiable et adapté
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Nous sélectionnons les hôtels selon vos critères réels :
                budget, localisation, confort et sécurité.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {HOTELS_SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== DESTINATIONS ==================== */}
        <section
          id="destinations"
          className="bg-slate-50 py-20"
        >
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
                <Globe className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Destinations
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Où souhaitez-vous voyager ?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
                Nous gérons des réservations vers de nombreux pays à travers le
                monde. Voici les principales destinations couvertes.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {REGIONS.map((region) => (
                <div key={region.title}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{region.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-2xl font-bold text-nexus-blue-950">
                          {region.title}
                        </h3>
                        {region.highlight && (
                          <span className="rounded-full bg-nexus-orange-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
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
                      <div
                        key={dest.name}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                      >
                        <span className="text-2xl">{dest.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-nexus-blue-950">
                            {dest.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {dest.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-sm italic text-slate-500">
              Et de nombreuses autres destinations sur demande. Contactez-nous
              pour les pays non listés.
            </p>
          </div>
        </section>

        {/* ==================== POURQUOI NEXUS ==================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Pourquoi nous choisir
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Six bonnes raisons de nous confier votre voyage
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POURQUOI.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== ENGAGEMENT ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-50 via-white to-nexus-orange-50 py-20">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-nexus-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-nexus-blue-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre engagement
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Voyager doit rester un plaisir
              </h2>
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-6 py-6 shadow-md sm:px-8 sm:py-8">
              <p className="font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                Chez Nexus RCA, nous traitons chaque réservation avec sérieux.
              </p>
              <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                <p>
                  Nous accompagnons des particuliers, des familles et des
                  professionnels qui veulent{" "}
                  <strong className="text-nexus-blue-950">
                    voyager sereinement
                  </strong>
                  ,{" "}
                  <strong className="text-nexus-blue-950">
                    éviter les erreurs
                  </strong>{" "}
                  et bénéficier d'un{" "}
                  <strong className="text-nexus-blue-950">
                    accompagnement humain
                  </strong>
                  .
                </p>
                <p>
                  Que ce soit un déplacement professionnel, un voyage en famille
                  ou des études à l'étranger, nous traitons chaque demande avec
                  la même attention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CTA FINAL ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Prêt à organiser votre voyage ?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
                Indiquez-nous votre destination, vos dates et votre budget. Un
                conseiller Nexus revient vers vous rapidement avec les
                meilleures options.
              </p>
            </div>

            {/* 3 infos a fournir */}
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              <InfoCard
                icon={MapPin}
                title="Destination"
                description="Où souhaitez-vous aller ?"
              />
              <InfoCard
                icon={Calendar}
                title="Dates"
                description="Départ et retour souhaités"
              />
              <InfoCard
                icon={Wallet}
                title="Budget"
                description="Votre fourchette de prix"
              />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/demande/complet?service=billet"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-nexus-blue-950 shadow-2xl transition hover:scale-105 hover:shadow-2xl"
              >
                Lancer ma demande de réservation
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Prendre rendez-vous
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-white/80">
              Devis gratuit · Réponse rapide · Tarifs transparents
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ============================================================================
// SOUS-COMPOSANT
// ============================================================================
function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h4 className="mt-3 font-display text-base font-bold text-white">
        {title}
      </h4>
      <p className="mt-1 text-sm text-white/80">{description}</p>
    </div>
  );
}
