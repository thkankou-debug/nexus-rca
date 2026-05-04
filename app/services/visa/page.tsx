import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import {
  FileText,
  Globe,
  Plane,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Search,
  ClipboardCheck,
  Calendar,
  Eye,
  Sparkles,
  AlertTriangle,
  Zap,
  Smartphone,
  MapPin,
} from "lucide-react";

export const metadata = {
  title: "Visa & e-Visa | Nexus RCA — Bangui",
  description:
    "Préparation, vérification et suivi de votre dossier visa : Asie, Moyen-Orient, Europe, Canada, Afrique. Étude gratuite, conseil honnête, dossier optimisé. Depuis Bangui.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const PROBLEMES = [
  { icon: FileText, text: "Documents incomplets ou mal préparés" },
  { icon: AlertCircle, text: "Erreurs dans les formulaires officiels" },
  { icon: Eye, text: "Manque d'information sur les exigences réelles" },
  { icon: Clock, text: "Délais qui s'allongent sans explication" },
];

const ETAPES = [
  {
    num: "01",
    icon: Search,
    title: "Étude gratuite de votre situation",
    description:
      "Profil, destination, type de visa : nous évaluons la faisabilité avant tout engagement.",
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "Vérification des documents",
    description:
      "Liste précise selon le pays visé. Tout est contrôlé, rien ne manque le jour du dépôt.",
  },
  {
    num: "03",
    icon: FileText,
    title: "Constitution du dossier",
    description:
      "Formulaires officiels remplis, pièces justificatives organisées, lettre d'accompagnement préparée.",
  },
  {
    num: "04",
    icon: Calendar,
    title: "Rendez-vous & dépôt",
    description:
      "Prise de RDV au consulat ou centre VFS/TLS. Préparation à l'entretien si nécessaire.",
  },
  {
    num: "05",
    icon: Eye,
    title: "Suivi jusqu'à la décision",
    description:
      "Vous êtes informé à chaque étape. En cas de demande de pièces complémentaires, nous réagissons vite.",
  },
];

const E_VISA_AVANTAGES = [
  {
    icon: Smartphone,
    title: "100% en ligne",
    description: "Pas besoin de se déplacer au consulat.",
  },
  {
    icon: Zap,
    title: "Délai court",
    description: "48 h à 5 jours selon la destination.",
  },
  {
    icon: MapPin,
    title: "Pas de biométrie",
    description: "Aucun rendez-vous physique à prévoir.",
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
      {
        name: "Canada",
        type: "Visiteur, études, travail",
        emoji: "🇨🇦",
      },
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

const POURQUOI_NEXUS = [
  {
    icon: Sparkles,
    title: "Conseiller dédié",
    description:
      "Un seul interlocuteur pour tout votre dossier, joignable sur WhatsApp.",
  },
  {
    icon: ShieldCheck,
    title: "Procédures à jour",
    description:
      "Veille active sur les exigences de chaque consulat — elles changent souvent.",
  },
  {
    icon: CheckCircle2,
    title: "Moins de motifs de refus",
    description:
      "Vérification rigoureuse avant le dépôt pour éliminer les erreurs évitables.",
  },
  {
    icon: Clock,
    title: "Vous gagnez du temps",
    description:
      "Vous restez concentré sur votre projet, nous gérons la paperasse.",
  },
  {
    icon: Eye,
    title: "Suivi transparent",
    description:
      "Statut clair à chaque étape, du dépôt jusqu'à la décision finale.",
  },
  {
    icon: ClipboardCheck,
    title: "Dossier optimisé",
    description:
      "Une présentation soignée qui valorise votre profil aux yeux du consulat.",
  },
];

const STATS = [
  { value: "13", label: "Pays couverts" },
  { value: "48 h", label: "Délai e-Visa min." },
  { value: "0 FCFA", label: "Étude initiale" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function VisaPage() {
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
                Visa & e-Visa internationaux
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                Voyagez en toute{" "}
                <span className="text-gradient-orange">sérénité</span>, dossier
                préparé à <span className="text-gradient-orange">Bangui</span>.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Étude gratuite, dossier complet, suivi jusqu'à la décision.
                Asie, Moyen-Orient, Europe, Canada, Afrique — nous traitons
                votre demande comme si c'était la nôtre.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/demande/complet?service=visa"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  Faire ma demande
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
                Étude gratuite · Conseil honnête · Suivi jusqu'à la décision
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
                Obtenir un visa, ce n'est pas si simple
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Une erreur dans le dossier coûte cher : refus, perte de temps,
                frais de visa non remboursés.
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
                Chez Nexus RCA, on simplifie tout.
              </p>
              <p className="mt-3 text-body text-ink-muted">
                Nous vous accompagnons pour{" "}
                <strong className="text-ink">éviter les erreurs</strong>,{" "}
                <strong className="text-ink">gagner du temps</strong> et{" "}
                <strong className="text-ink">
                  maximiser vos chances d'acceptation
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ÉTAPES ────────────────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre méthode</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Votre dossier pris en charge de A à Z
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Cinq étapes claires. Vous savez à tout moment où vous en êtes.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {ETAPES.map((etape) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.num}
                    className="group flex items-start gap-5 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3 sm:items-center"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 font-display text-xl font-bold text-nexus-blue-700 transition group-hover:from-brand-subtle group-hover:to-orange-50 group-hover:text-brand dark:bg-blue-500/15 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      {etape.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-brand" />
                        <h3 className="font-display text-headline text-ink">
                          {etape.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-body-sm text-ink-muted">
                        {etape.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* E-VISA ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-3">
                <Smartphone className="h-6 w-6" />
              </div>
              <p className="text-overline text-nexus-orange-400">
                Visa électronique
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Le e-Visa,{" "}
                <span className="text-nexus-orange-400">rapide et moderne</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-body-lg text-slate-300">
                Pour de nombreuses destinations, plus besoin de se déplacer.
                Nexus s'occupe de toute la procédure en ligne.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {E_VISA_AVANTAGES.map((avantage) => {
                const Icon = avantage.icon;
                return (
                  <div
                    key={avantage.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 shadow-elev-2">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-4 font-display text-title text-white">
                      {avantage.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-slate-300">
                      {avantage.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-nexus-orange-500/30 bg-nexus-orange-500/10 p-6 text-center backdrop-blur sm:p-8">
              <p className="text-body text-white sm:text-body-lg">
                <strong className="text-nexus-orange-300">À savoir : </strong>
                tous les pays ne proposent pas le e-Visa. Nous vous indiquons la
                meilleure procédure selon votre destination et votre profil.
              </p>
            </div>
          </div>
        </section>

        {/* DESTINATIONS ──────────────────────────────────────────── */}
        <section id="destinations" className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Destinations couvertes</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quelle est votre destination ?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Treize pays principaux, et davantage sur demande. Si votre
                destination n'est pas listée, contactez-nous.
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
                            {dest.type}
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

        {/* POURQUOI NEXUS ────────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Pourquoi Nexus RCA</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Une démarche complexe devient simple
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Six raisons concrètes de nous confier votre dossier.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POURQUOI_NEXUS.map((item) => {
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

        {/* TRANSPARENCE ──────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-surface-elevated to-orange-50 p-8 shadow-elev-3 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5 sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-elev-2">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-amber-700 dark:text-amber-300">
                    Transparence
                  </p>
                  <h2 className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    Une information honnête sur ce que nous garantissons
                  </h2>

                  <div className="mt-6 space-y-4 text-body text-ink-muted">
                    <p>
                      <strong className="text-ink">
                        La décision finale appartient toujours aux autorités
                        consulaires.
                      </strong>{" "}
                      Aucune agence sérieuse ne peut garantir l'obtention d'un
                      visa, et nous ne le ferons jamais.
                    </p>
                    <p>Ce que Nexus RCA vous garantit :</p>
                  </div>

                  <ul className="mt-5 space-y-3">
                    <TransparenceItem>
                      Un dossier <strong>solide et complet</strong>, conforme aux
                      exigences du consulat
                    </TransparenceItem>
                    <TransparenceItem>
                      Une <strong>présentation optimisée</strong> qui valorise
                      votre profil
                    </TransparenceItem>
                    <TransparenceItem>
                      La <strong>réduction maximale</strong> des risques de
                      refus pour motifs évitables
                    </TransparenceItem>
                    <TransparenceItem>
                      Un <strong>conseil honnête</strong> sur vos chances réelles
                      avant tout engagement
                    </TransparenceItem>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL ─────────────────────────────────────────────── */}
        <ServiceCTA
          title="Prêt à lancer votre dossier visa ?"
          subtitle="Étude gratuite, conseil personnalisé. Un conseiller Nexus vous répond aujourd'hui sur WhatsApp."
          ctaLabel="Lancer ma demande de visa"
          ctaHref="/demande/complet?service=visa"
          whatsappMessage="Bonjour Nexus, je souhaite démarrer une demande de visa."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────────────

function TransparenceItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-surface-elevated px-4 py-3 shadow-elev-1">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
      <span className="text-body-sm text-ink">{children}</span>
    </li>
  );
}
