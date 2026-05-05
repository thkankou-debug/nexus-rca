import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Plane,
  Hotel,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Check,
  Calendar,
  MessageCircle,
  FileText,
  Search,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Globe,
  MapPin,
  Headphones,
  Receipt,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Billets d'avion & hôtels | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos voyages. Recherche multi-compagnies, hôtels vérifiés, paiement local en FCFA, suivi avant et pendant le voyage.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous voulez confier la recherche et la réservation de vol et/ou d'hôtel à un interlocuteur unique à Bangui",
    "Vous préférez payer en FCFA depuis Bangui plutôt que par carte internationale",
    "Vous voulez un dossier de voyage clair (e-billets, vouchers, contacts utiles) avant le départ",
  ],
  non: [
    "Vous attendez un tarif inférieur au prix officiel des compagnies — nous ne créons pas de marché parallèle",
    "Vous voulez réserver à la dernière minute sur une période très tendue sans flexibilité — anticipez si possible",
    "Vous comptez payer après le voyage — la réservation exige un paiement préalable comme partout",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (destination, dates, voyageurs, budget) ou prenez rendez-vous. Nous comprenons votre projet de voyage.",
  },
  {
    num: "02",
    icon: Search,
    title: "Recherche & sélection",
    description:
      "Comparaison sur les compagnies pertinentes (Air France, Royal Air Maroc, Ethiopian, ASKY…) et hôtels vérifiés. Devis avec 2 à 3 options proposées sous 24 heures ouvrées.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Validation & paiement local",
    description:
      "Vous validez l'option retenue. Paiement en FCFA à l'agence Bangui. Émission immédiate des billets et confirmations hôtels.",
  },
  {
    num: "04",
    icon: Plane,
    title: "Dossier de voyage & suivi",
    description:
      "Remise du dossier complet (e-billets, vouchers, contacts utiles) et accompagnement avant et pendant le voyage en cas d'incident.",
  },
];

interface RegionType {
  title: string;
  emoji: string;
  description: string;
  destinations: string[];
}

const REGIONS: RegionType[] = [
  {
    title: "Asie",
    emoji: "🌏",
    description: "Tourisme, business, voyages spirituels.",
    destinations: ["Inde 🇮🇳", "Thaïlande 🇹🇭", "Bali 🇮🇩", "Vietnam 🇻🇳", "Dubaï 🇦🇪"],
  },
  {
    title: "Europe",
    emoji: "🌍",
    description: "Voyages d'affaires, études, tourisme et famille.",
    destinations: ["France 🇫🇷", "Belgique 🇧🇪", "Allemagne 🇩🇪", "Espagne 🇪🇸"],
  },
  {
    title: "Afrique",
    emoji: "🌍",
    description: "Vols continentaux et liaisons régionales.",
    destinations: ["Maroc 🇲🇦", "Sénégal 🇸🇳", "Kenya 🇰🇪"],
  },
  {
    title: "Amérique",
    emoji: "🌎",
    description: "Long-courrier, études et regroupement familial.",
    destinations: ["Canada 🇨🇦"],
  },
];

const STATS = [
  { value: "13+", label: "Pays couverts" },
  { value: "FCFA", label: "Paiement local" },
  { value: "Dossier", label: "De voyage complet" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function BilletsPage() {
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
                Service vols & hôtels
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Billet d&apos;avion &amp; Hôtels
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Recherche multi-compagnies, hôtels vérifiés, paiement en FCFA
                à Bangui, dossier de voyage complet avant le départ. Vous
                expliquez votre projet, nous gérons la suite — proprement,
                sans approximation.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/billets/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=billets"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Devis gratuit · Paiement en FCFA · Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Vols & hôtels."
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

        {/* 1.5 INTRO COURTE ─────────────────────────────────────── */}
        <section className="border-b border-line bg-surface py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-display-sm text-ink lg:text-display-md">
              Un billet d&apos;avion n&apos;est pas un produit isolé. C&apos;est{" "}
              <span className="text-brand">le maillon central d&apos;un déplacement</span>{" "}
              où chaque détail compte — itinéraire, hôtel, assistance.
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
                  Quatre prestations encadrées, de la réservation à l&apos;assistance pendant le voyage.
                </p>
              </div>
              <ul className="space-y-5">
                {[
                  { title: "Recherche multi-compagnies", desc: "Comparaison transparente des tarifs et des contraintes (escales, bagages, classes, conditions de modification)." },
                  { title: "Réservation hôtels vérifiés", desc: "Hébergements conformes au standing demandé, à proximité des lieux clés du déplacement." },
                  { title: "Coordination des transferts", desc: "Recommandations transport sur place, transferts aéroport-hôtel, guidance pratique." },
                  { title: "Suivi avant et pendant", desc: "Notification des changements horaires, intervention en cas d'imprévu pendant le voyage." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 border-l-2 border-line pl-5 py-1">
                    <div>
                      <h3 className="font-display text-headline text-ink">{item.title}</h3>
                      <p className="mt-1 text-body-sm text-ink-muted">{item.desc}</p>
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
              <h2 className="mt-3 font-display text-display-md text-ink">Ce que vous obtenez</h2>
              <p className="mt-4 text-body-lg text-ink-muted">
                Un voyage organisé du début à la fin, en un seul interlocuteur.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Itinéraire optimisé", desc: "Compromis maîtrisé entre prix, durée et conditions de voyage." },
                { title: "Paiement local en FCFA", desc: "Pas de virement international ni de carte étrangère exigés." },
                { title: "Hôtels conformes au standing", desc: "Sélection vérifiée, retours clients consultés avant proposition." },
                { title: "Assistance avant et pendant", desc: "Vous n'êtes pas seul si quelque chose change en route." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface-elevated p-6">
                  <h3 className="font-display text-headline text-ink">{item.title}</h3>
                  <p className="mt-2 text-body-sm text-ink-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. POUR QUI CE SERVICE EST CONÇU ────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cadre du service</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pour qui ce service est conçu
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous travaillons avec des compagnies et plateformes officielles.
                Cette transparence fait partie de notre engagement professionnel.
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
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-sm text-ink"
                    >
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
                Du brief initial jusqu'au dossier de voyage final, chaque
                étape est claire et tracée.
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

            <div className="mt-10 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-overline text-brand">
                    Démarrer la démarche
                  </p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    Soumettez votre projet de voyage.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Devis gratuit. 2 à 3 options proposées sous 24 h ouvrées.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/billets/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=billets"
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

        {/* 4. CE QUE NEXUS PREND EN CHARGE ───────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Périmètre du service</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Vols, hôtels, dossier de voyage
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Trois prestations qui peuvent être commandées séparément ou en
                combinaison.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                  <Plane className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Billets d'avion
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Vol simple, aller-retour ou multi-destinations. Comparaison
                  Air France, Royal Air Maroc, Ethiopian, ASKY et autres
                  compagnies pertinentes selon la destination.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                  <Hotel className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Hôtels vérifiés
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Sélection sur plateformes reconnues, choix selon budget,
                  localisation et type de séjour. Vérification des notes,
                  proximité points d'intérêt, sécurité du quartier.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Dossier de voyage
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Remise d'un dossier complet : e-billets, vouchers hôtels,
                  contacts utiles, indications transferts aéroport. Le
                  voyageur part avec tout en main.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. DESTINATIONS ───────────────────────────────────────── */}
        <section id="destinations" className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-elev-3">
                <Globe className="h-6 w-6" />
              </div>
              <p className="text-overline text-brand">Destinations</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Treize pays principaux, davantage à la demande
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Pour les destinations non listées, contactez-nous. Nous
                traitons les demandes au cas par cas selon faisabilité de la
                liaison depuis Bangui.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {REGIONS.map((region) => (
                <div
                  key={region.title}
                  className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{region.emoji}</span>
                    <div>
                      <h3 className="font-display text-headline text-ink">
                        {region.title}
                      </h3>
                      <p className="text-caption text-ink-muted">
                        {region.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {region.destinations.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-line bg-surface-sunken px-3 py-1 text-caption font-semibold text-ink"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CAS TYPES ──────────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cas types accompagnés</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Voici comment ça se passe concrètement
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  ✈️ Mission professionnelle
                </div>
                <h3 className="font-display text-headline text-ink">
                  Bangui → Paris, A-R + 4 nuits hôtel centre
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Brief reçu lundi, 3 options vol (compagnie, escales, prix)
                  envoyées mercredi avec 2 propositions hôtel quartier
                  affaires. Validation jeudi, paiement en FCFA, dossier
                  complet remis avant le départ samedi.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : voyage réservé en 3 jours, dossier carré, aucun
                  stress côté entreprise.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  👨‍👩‍👧 Voyage familial
                </div>
                <h3 className="font-display text-headline text-ink">
                  Bangui → Marrakech, 2 adultes + 2 enfants, 8 nuits
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Recherche de la meilleure combinaison vol + hôtel familial
                  avec budget cadré. Comparaison sur 3 plateformes, vérif
                  notes hôtels, sélection riad central avec piscine.
                  Paiement local, conseils transferts aéroport joints.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : famille partie sereine, hôtel conforme aux
                  attentes, budget tenu.
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
                Compagnies officielles uniquement, marge annoncée
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Les billets que nous émettons proviennent des compagnies
                aériennes ou de plateformes officielles. Notre commission de
                service est annoncée à l'avance dans le devis.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Émettre des billets hors circuit officiel des compagnies",
                    "Garantir la disponibilité d'un tarif si vous tardez à valider",
                    "Modifier les conditions de remboursement imposées par la compagnie",
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
                    "Un devis détaillé avec compagnies, escales, durée et prix",
                    "2 à 3 options réelles à comparer, pas une seule poussée",
                    "Le paiement local en FCFA et l'émission immédiate après validation",
                    "Un suivi avant et pendant le voyage en cas d'incident",
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
                Tarif compagnie + commission Nexus, le tout en FCFA, sans
                surprise.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Devis & recherche
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit. 2 à 3 options proposées avec compagnies, durée,
                  escales et prix exacts.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <Plane className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Tarif compagnie
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Prix officiel facturé par la compagnie, converti en FCFA au
                  taux du jour, sans majoration cachée.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Commission Nexus
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Service, recherche, gestion paiement, dossier de voyage et
                  suivi. Annoncée à l'avance, jamais ajustée a posteriori.
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
                Lancer votre voyage
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Trois informations suffisent pour démarrer
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Destination, dates, voyageurs. Le reste se construit avec
                vous au fil de l'échange.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <MapPin className="mx-auto mb-1 h-4 w-4" />
                  Destination
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <Calendar className="mx-auto mb-1 h-4 w-4" />
                  Dates
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <Wallet className="mx-auto mb-1 h-4 w-4" />
                  Budget
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/billets/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=billets"
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
                    "Bonjour Nexus, j'ai une question sur un projet de voyage."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-nexus-orange-300 underline-offset-4 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contactez-nous sur WhatsApp
                </a>
              </p>

              <p className="mt-4 text-caption text-white/60">
                <Headphones className="mr-1 inline h-3 w-3" />
                Suivi avant et pendant le voyage · Compagnies officielles ·{" "}
                <ShieldCheck className="ml-1 mr-0.5 inline h-3 w-3" />
                Hôtels vérifiés
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
