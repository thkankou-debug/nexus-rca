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
  title: "Billets d'avion & hôtels | Nexus RCA — Bangui",
  description:
    "Réservation de vols et hôtels depuis Bangui : Air France, Royal Air Maroc, Ethiopian Airlines. Asie, Europe, Afrique, Amérique. Devis gratuit, paiement en FCFA, suivi 24/7.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const PROBLEMES = [
  { icon: Clock, text: "Heures perdues à comparer les sites de réservation" },
  {
    icon: AlertCircle,
    text: "Erreurs sur les dates, correspondances ou paiements",
  },
  { icon: Wallet, text: "Paiement en ligne difficile depuis Bangui" },
  { icon: Hotel, text: "Doutes sur la fiabilité de l'hôtel à l'arrivée" },
];

const VOLS_SERVICES = [
  {
    icon: Search,
    title: "Recherche des meilleurs vols",
    description:
      "Comparaison sur les principales compagnies internationales et régionales (Air France, Royal Air Maroc, Ethiopian, ASKY…).",
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
      "Choix des correspondances, durées et escales les mieux adaptés depuis Bangui.",
  },
  {
    icon: Wallet,
    title: "Vols adaptés au budget",
    description:
      "Économique, business ou première — solutions pour chaque profil et budget.",
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
      "Sélection rigoureuse parmi les établissements vérifiés et bien notés.",
  },
  {
    icon: Wallet,
    title: "Options selon votre budget",
    description:
      "De l'hébergement abordable à l'hôtel premium — solutions pour chaque profil.",
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
      "Vérification systématique de la qualité du service et des standards de sécurité.",
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
    description: "Tourisme, business, voyages spirituels.",
    highlight: true,
    destinations: [
      { name: "Inde", emoji: "🇮🇳", description: "Tourisme, business, spirituel" },
      { name: "Thaïlande", emoji: "🇹🇭", description: "Bangkok, Phuket, Chiang Mai" },
      { name: "Indonésie (Bali)", emoji: "🇮🇩", description: "Bali, Jakarta" },
      { name: "Vietnam", emoji: "🇻🇳", description: "Hanoï, Hô Chi Minh, Da Nang" },
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
    description: "Long-courrier, études et regroupement familial.",
    destinations: [
      { name: "Canada", emoji: "🇨🇦", description: "Montréal, Toronto, Ottawa" },
    ],
  },
];

const POURQUOI = [
  {
    icon: Clock,
    title: "Gain de temps",
    description:
      "Plus d'heures à comparer. Vous donnez votre projet, nous gérons la recherche.",
  },
  {
    icon: Sparkles,
    title: "Conseiller dédié",
    description:
      "Un seul interlocuteur, joignable sur WhatsApp, qui comprend votre projet.",
  },
  {
    icon: ShieldCheck,
    title: "Solutions fiables",
    description:
      "Compagnies reconnues, hôtels vérifiés, plateformes de confiance uniquement.",
  },
  {
    icon: Wallet,
    title: "Paiement en FCFA",
    description:
      "Plus besoin de carte bancaire internationale. Nous gérons la transaction depuis Bangui.",
  },
  {
    icon: Headphones,
    title: "Assistance complète",
    description:
      "Suivi avant, pendant et après votre voyage. Contact direct en cas de besoin.",
  },
  {
    icon: Heart,
    title: "Voyages adaptés",
    description:
      "Tourisme, famille, affaires, études, urgence : chaque demande traitée avec soin.",
  },
];

const STATS = [
  { value: "13+", label: "Pays couverts" },
  { value: "0 FCFA", label: "Devis" },
  { value: "24/7", label: "WhatsApp" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function BilletsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <Plane className="h-3.5 w-3.5" />
                Vols & hôtels
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                Voyagez{" "}
                <span className="text-gradient-orange">sans stress</span>,
                réservé depuis{" "}
                <span className="text-gradient-orange">Bangui</span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Recherche du meilleur vol, hôtel fiable, paiement en FCFA. Vous
                voyagez, nous gérons le reste — Air France, Royal Air Maroc,
                Ethiopian Airlines, ASKY et autres.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=billet"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  Demander une réservation
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#destinations"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Voir les destinations
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Devis gratuit · Réponse rapide · Tarifs en FCFA
              </p>
            </div>

            {/* Stats strip */}
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-display-sm text-nexus-orange-400">
                    {s.value}
                  </div>
                  <div className="mt-1 text-overline text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LE CONSTAT ─────────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Le constat</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Organiser un voyage prend trop de temps
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Comparer les sites, vérifier les correspondances, choisir un
                hôtel fiable, gérer le paiement : un voyage bien préparé
                demande des heures.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {PROBLEMES.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-line bg-surface-sunken p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-body-sm font-semibold text-ink">
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border-l-4 border-brand bg-brand-subtle/40 px-6 py-6 shadow-elev-1 sm:px-8 sm:py-8">
              <p className="font-display text-headline text-ink sm:text-display-sm">
                Avec Nexus RCA, vous économisez du temps et du stress.
              </p>
              <p className="mt-3 text-body text-ink-muted">
                Un seul interlocuteur, une recherche professionnelle, un
                paiement local en FCFA. Vous donnez votre projet, nous nous
                occupons du reste.
              </p>
            </div>
          </div>
        </section>

        {/* BILLETS D'AVION ─────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-3">
                <Plane className="h-6 w-6" />
              </div>
              <p className="text-overline text-brand">Billets d'avion</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Le bon vol, au bon prix, au bon moment
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous comparons, conseillons et réservons à votre place.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VOLS_SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="group rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-brand-subtle group-hover:to-orange-50 group-hover:text-brand dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HÔTELS ─────────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-elev-3">
                <Hotel className="h-6 w-6" />
              </div>
              <p className="text-overline text-brand">Réservation d'hôtels</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Un hébergement fiable et adapté
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Sélection selon vos critères réels : budget, localisation,
                confort et sécurité.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {HOTELS_SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="flex gap-4 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-headline text-ink">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-body-sm text-ink-muted">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DESTINATIONS ───────────────────────────────────────── */}
        <section id="destinations" className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-elev-3">
                <Globe className="h-6 w-6" />
              </div>
              <p className="text-overline text-brand">Destinations</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Où souhaitez-vous voyager ?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Treize pays principaux, et davantage sur demande. Pour les
                destinations non listées, contactez-nous.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {REGIONS.map((region) => (
                <div key={region.title}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{region.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-display-sm text-ink">
                          {region.title}
                        </h3>
                        {region.highlight && (
                          <span className="rounded-full bg-brand-subtle px-2.5 py-0.5 text-overline text-nexus-orange-700 dark:text-brand">
                            Forte demande
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-ink-muted">
                        {region.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {region.destinations.map((dest) => (
                      <div
                        key={dest.name}
                        className="group flex items-center gap-3 rounded-2xl border border-line bg-surface-elevated p-4 shadow-elev-1 transition hover:border-brand/40 hover:shadow-elev-2"
                      >
                        <span className="text-2xl">{dest.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-title text-ink">{dest.name}</p>
                          <p className="truncate text-caption text-ink-muted">
                            {dest.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-body-sm italic text-ink-muted">
              Pays non listé ? Contactez-nous, nous traitons à la demande.
            </p>
          </div>
        </section>

        {/* POURQUOI NEXUS ─────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Pourquoi nous choisir</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Six raisons concrètes
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POURQUOI.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA FINAL avec InfoCards ────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />
          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-display-md text-white sm:text-display-lg">
                Prêt à organiser votre voyage ?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-white/90">
                Indiquez-nous votre destination, vos dates et votre budget. Un
                conseiller Nexus revient vers vous rapidement avec les meilleures
                options.
              </p>
            </div>

            {/* 3 infos à fournir */}
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-body font-semibold text-nexus-blue-950 shadow-elev-4 transition hover:shadow-elev-5"
              >
                Lancer ma demande
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Prendre rendez-vous
              </Link>
            </div>

            <p className="mt-6 text-center text-caption text-white/80">
              Devis gratuit · Réponse sur WhatsApp · Tarifs en FCFA
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composant ────────────────────────────────────────────────────────

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
      <h4 className="mt-3 font-display text-title text-white">{title}</h4>
      <p className="mt-1 text-body-sm text-white/80">{description}</p>
    </div>
  );
}
