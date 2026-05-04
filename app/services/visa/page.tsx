import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  MapPin,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Visa & e-Visa | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos démarches visa. Nous étudions chaque dossier avec rigueur avant d'accepter de l'accompagner. Schengen, Canada, e-Visa Asie et Moyen-Orient.",
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
    "Vous cherchez uniquement à obtenir un visa « à tout prix »",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons les éléments essentiels de votre situation.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse de faisabilité",
    description:
      "Un conseiller Nexus étudie votre dossier, identifie le type de visa adapté et évalue la faisabilité. Bilan honnête écrit avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Constitution du dossier complet selon les exigences exactes du consulat ciblé : formulaires, justificatifs, lettre, préparation à l'entretien.",
  },
  {
    num: "04",
    icon: Eye,
    title: "Suivi jusqu'au résultat",
    description:
      "Prise de rendez-vous au consulat ou centre VFS/TLS, accompagnement le jour du dépôt, suivi actif jusqu'à la décision finale, communication transparente.",
  },
];

const E_VISA_AVANTAGES = [
  {
    icon: Smartphone,
    title: "100 % en ligne",
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
      { name: "Canada", type: "Visiteur, études, travail", emoji: "🇨🇦" },
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

const STATS = [
  { value: "Étude", label: "Initiale gratuite" },
  { value: "Devis", label: "Fixe avant engagement" },
  { value: "Bilan", label: "Honnête écrit" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function VisaPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO INSTITUTIONNEL ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <Plane className="h-3.5 w-3.5" />
                Service visa
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                pour vos démarches visa.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous étudions chaque dossier avec rigueur avant d'accepter de
                l'accompagner. Si votre projet correspond à nos critères, nous
                structurons votre dossier selon les exigences exactes du
                consulat ciblé et menons votre demande jusqu'à la décision.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/visa/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=visa"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Étude initiale gratuite · Bilan de faisabilité honnête · Une
                question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service visa avant de soumettre ma demande."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  contactez-nous sur WhatsApp
                </a>
              </p>
            </div>

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

        {/* 2. POUR QUI CE SERVICE EST CONÇU ────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Sélectivité</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pour qui ce service est conçu
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous n'accompagnons pas tous les profils. Cette transparence
                fait partie de notre engagement professionnel.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-emerald-200/60 bg-emerald-50/40 p-7 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    Ce service s'adresse aux personnes
                  </h3>
                </div>
                <ul className="space-y-3">
                  {POUR_QUI.oui.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-body-sm text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    Ce service ne s'adresse pas aux personnes
                  </h3>
                </div>
                <ul className="space-y-3">
                  {POUR_QUI.non.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-body-sm text-ink">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. NOTRE MÉTHODOLOGIE ───────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre méthodologie</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Un parcours en quatre étapes documentées
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                De la soumission à la décision, chaque étape est documentée et
                communiquée. Vous savez à tout moment où en est votre dossier.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {METHODOLOGIE.map((etape) => {
                const Icon = etape.icon;
                return (
                  <div
                    key={etape.num}
                    className="group flex items-start gap-5 rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 font-display text-xl font-bold text-nexus-blue-700 transition group-hover:from-brand-subtle group-hover:to-orange-50 group-hover:text-brand dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      {etape.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-brand" />
                        <h3 className="font-display text-headline text-ink">
                          {etape.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-body-sm text-ink-muted">
                        {etape.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA en sortie de méthodologie */}
            <div className="mt-10 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-overline text-brand">Démarrer la démarche</p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    Soumettez votre dossier dès aujourd'hui.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Étude initiale gratuite. Bilan de faisabilité écrit.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/visa/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre mon dossier
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=visa"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-surface-sunken"
                  >
                    <Calendar className="h-4 w-4" />
                    Prendre rendez-vous
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DESTINATIONS COUVERTES ───────────────────────────── */}
        <section id="destinations" className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Destinations couvertes</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Treize destinations principales, et davantage sur demande
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Si votre destination n'est pas listée, contactez-nous — nous
                traitons à la demande selon la complexité du dossier.
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
          </div>
        </section>

        {/* 5. e-VISA : PROCÉDURE SIMPLIFIÉE ─────────────────────── */}
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
                Le e-Visa, procédure simplifiée
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-body-lg text-slate-300">
                Pour de nombreuses destinations, la procédure se déroule
                entièrement en ligne. Aucun déplacement à Yaoundé n'est requis.
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
                tous les pays ne proposent pas le e-Visa. La procédure adaptée
                à votre destination vous sera indiquée à l'étape d'analyse.
              </p>
            </div>
          </div>
        </section>

        {/* 6. CAS TYPES TRAITÉS ─────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cas types traités</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Voici comment ça se passe concrètement
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  🎓 Études en France
                </div>
                <h3 className="font-display text-headline text-ink">
                  Étudiante en master, admission validée
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Visa Schengen études, biométrie obligatoire à Yaoundé. Nexus
                  RCA monte le dossier complet (admission, ressources,
                  hébergement, assurance, lettre de motivation), prend le
                  rendez-vous TLS et remet à la cliente un dossier physique
                  prêt à déposer.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : un seul aller-retour Bangui-Yaoundé. Dossier
                  conforme dès le premier passage.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  💼 Salon professionnel à Dubaï
                </div>
                <h3 className="font-display text-headline text-ink">
                  Cadre d'une PME centrafricaine, délais courts
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Premier voyage international, agenda chargé, salon dans
                  10 jours. Nexus RCA prépare l'e-Visa EAU en 48 à 72 heures,
                  organise la réservation d'hôtel à proximité du salon, et
                  transmet le visa par e-mail avant le décollage.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : aucun déplacement physique. Tout traité depuis
                  Bangui.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ENGAGEMENT DE TRANSPARENCE ────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Engagement</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Aucune agence sérieuse ne peut garantir un visa
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                La décision finale appartient toujours aux autorités
                consulaires. Toute structure qui vous promet une obtention vous
                trompe. Nexus RCA ne le fera jamais.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Garantir l'obtention d'un visa",
                    "Influencer la décision consulaire",
                    "Promettre une admission certaine",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-brand/40 bg-brand-subtle/40 p-7">
                <p className="text-overline text-nexus-orange-700 dark:text-brand">
                  Ce que nous garantissons
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Un dossier solide et complet, conforme aux exigences exactes du consulat",
                    "Une présentation optimisée qui valorise votre profil",
                    "La réduction maximale des risques de refus pour motifs évitables",
                    "Un conseil honnête sur vos chances réelles avant tout engagement",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CADRE TARIFAIRE ──────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cadre tarifaire</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Une transparence économique complète
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Vous savez ce que ça coûte avant de signer. Aucun frais caché.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Étude initiale
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuite, sans engagement. Bilan de faisabilité écrit.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Accompagnement Nexus
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Devis fixe communiqué après le bilan de faisabilité.
                  Aucune facturation surprise en cours de route.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Frais consulaires
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  À votre charge, montant détaillé à l'avance par pays.
                  Reversés directement aux autorités.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CTA FINAL FORMEL ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-nexus-orange-300">
                Soumettre votre dossier
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Lancez votre demande visa selon notre méthodologie.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                L'étude de faisabilité est gratuite. Si nous estimons que votre
                dossier a des chances réelles, nous vous accompagnons. Sinon,
                nous vous le disons franchement.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Étude
                  <br />
                  <span className="text-white">Gratuite</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Bilan
                  <br />
                  <span className="text-white">Honnête</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Devis
                  <br />
                  <span className="text-white">Fixe</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/visa/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=visa"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-8 text-caption text-white/70">
                Une question avant de commencer ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service visa avant de soumettre ma demande."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contactez-nous sur WhatsApp
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
