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
import { VisaRequirementChecker } from "@/components/visa/VisaRequirementChecker";
import { EVisaEligibilityChecker } from "@/components/visa/EVisaEligibilityChecker";
import { VisaDocumentChecklist } from "@/components/visa/VisaDocumentChecklist";
import { VisaExpressForm } from "@/components/visa/VisaExpressForm";

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
        <section className="relative overflow-hidden bg-nexus-hero-institutional pt-32 pb-20 text-white lg:pt-36 lg:pb-24">
          <div className="absolute inset-0 bg-mesh-gradient-subtle" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                <Plane className="h-3.5 w-3.5" />
                Service visa
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Visa &amp; e-Visa
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

        {/* 1.0 DIAGNOSTIC VISA — fonctionnalité centrale ──────────── */}
        <section
          id="diagnostic"
          className="relative bg-gradient-to-b from-surface-sunken via-surface to-surface py-20 sm:py-24 lg:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-subtle/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                Diagnostic gratuit
              </span>
              <h2 className="mt-5 font-display text-display-md text-ink sm:text-display-lg">
                Évaluez votre dossier en 60 secondes
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-body-lg leading-relaxed text-ink-muted">
                Deux outils Nexus pour identifier votre type de visa et vos exigences
                avant même de nous contacter — sans inscription.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <VisaRequirementChecker />
              <EVisaEligibilityChecker />
            </div>
          </div>
        </section>

        {/* 1.5 INTRO COURTE — positionnement institutionnel ─────── */}
        <section className="border-b border-line bg-surface py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-display-sm text-ink lg:text-display-md">
              Le visa n&apos;est pas une formalité. C&apos;est une décision
              d&apos;État qui demande{" "}
              <span className="text-brand">structure, transparence et conformité</span>.
            </p>
          </div>
        </section>

        {/* 1.6 CE QUE NOUS FAISONS ─────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:items-start">
              <div>
                <p className="text-overline text-brand">Périmètre</p>
                <h2 className="mt-3 font-display text-display-md text-ink">
                  Ce que nous faisons
                </h2>
                <p className="mt-4 text-body-sm text-ink-muted">
                  Quatre prestations encadrées, livrables documentés à chaque
                  étape.
                </p>
              </div>

              <ul className="space-y-5">
                {[
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
                    desc: "Réservation du créneau, préparation du dossier physique remis prêt-à-déposer, instructions précises pour la dépose à Yaoundé.",
                  },
                  {
                    title: "Suivi jusqu'à la décision",
                    desc: "Réponse aux compléments d'information demandés, ajustement du dossier si nécessaire, transmission de la décision finale.",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 border-l-2 border-line pl-5 py-1"
                  >
                    <div>
                      <h3 className="font-display text-headline text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-body-sm text-ink-muted">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 1.7 CE QUE VOUS OBTENEZ ──────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-overline text-brand">Résultat</p>
              <h2 className="mt-3 font-display text-display-md text-ink">
                Ce que vous obtenez
              </h2>
              <p className="mt-4 text-body-lg text-ink-muted">
                Pas de promesse de visa — la décision appartient au consulat.
                En revanche, voici ce que nous vous garantissons concrètement.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
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
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-line bg-surface-elevated p-6"
                >
                  <h3 className="font-display text-headline text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-muted">
                    {item.desc}
                  </p>
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

        {/* 5.5 DOCUMENTS PAR TYPE DE VISA ────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-overline text-brand">Documents fréquents</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pièces requises selon votre type de visa
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Liste indicative par type. Le consulat ciblé peut exiger des pièces
                complémentaires — c'est ce que Nexus cadre pour vous.
              </p>
            </div>

            <VisaDocumentChecklist />
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

        {/* 8.5 FORMULAIRE EXPRESS ─────────────────────────────────── */}
        <section
          id="demarrer"
          className="relative bg-gradient-to-b from-surface to-surface-sunken py-24 sm:py-28 lg:py-32"
        >
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-subtle/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                Démarche express
              </span>
              <h2 className="mt-5 font-display text-display-md text-ink sm:text-display-lg">
                Soumettez votre dossier
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-body-lg leading-relaxed text-ink-muted">
                Un conseiller Nexus revient vers vous sous 24 h à 3 jours selon urgence.
                Étude initiale gratuite, bilan écrit avant tout engagement.
              </p>
            </div>

            <VisaExpressForm />
          </div>
        </section>

        {/* 9. CTA FINAL PREMIUM ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-nexus-orange-500/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
              Une question avant de démarrer
            </span>

            <h2 className="mt-7 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Parlons de votre projet.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Vous hésitez sur la procédure, le timing ou les pièces&nbsp;? Notre équipe
              à Bangui vous répond personnellement.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={whatsappLink(
                  "Bonjour Nexus, j'ai une question sur le service visa avant de soumettre ma demande."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-nexus-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-nexus-orange-600 hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                Discuter sur WhatsApp
              </a>
              <Link
                href="/rendez-vous?service=visa"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <Calendar className="h-5 w-5" />
                Prendre rendez-vous
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                Étude gratuite
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Bilan écrit</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Devis fixe</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Confidentialité absolue</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
