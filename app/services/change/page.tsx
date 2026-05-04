import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Coins,
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
  Eye,
  Clock,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Change de devises à Bangui | Nexus RCA",
  description:
    "L'expertise centrafricaine pour votre change de devises. Taux annoncés avant transaction, sans marge cachée. Agence Bangui, devis WhatsApp sous 30 minutes.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous avez besoin de changer entre FCFA et devises étrangères (EUR, USD, CAD, GBP) à Bangui",
    "Vous acceptez de présenter une pièce d'identité pour les opérations au-delà du seuil réglementaire",
    "Vous voulez un taux annoncé clairement avant la transaction, sans surprise",
  ],
  non: [
    "Vous cherchez à changer hors traçabilité — Nexus opère uniquement dans le cadre légal",
    "Vous attendez un taux supérieur au marché — la transparence n'a pas de magie",
    "Vous voulez changer des fonds dont l'origine ne peut être justifiée si demandée",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (devises, sens, montant) ou venez en agence. Nous établissons un devis avec le taux du jour.",
  },
  {
    num: "02",
    icon: Search,
    title: "Devis & confirmation taux",
    description:
      "Le taux annoncé est le taux appliqué. Vous recevez le montant exact à recevoir avant tout déplacement, sans marge cachée.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Rendez-vous en agence",
    description:
      "Vous passez à l'agence Relais Sica à Bangui. Pour les gros montants, un rendez-vous est conseillé pour préparer le cash.",
  },
  {
    num: "04",
    icon: Receipt,
    title: "Transaction sécurisée & reçu",
    description:
      "Comptage vérifié des deux côtés, échange en espèces, remise d'un reçu détaillé. Aucune commission cachée.",
  },
];

interface DeviseType {
  code: string;
  nom: string;
  usages: string;
}

const DEVISES: DeviseType[] = [
  {
    code: "EUR",
    nom: "Euro",
    usages: "Voyages zone Schengen, frais d'études France, paiements fournisseurs UE.",
  },
  {
    code: "USD",
    nom: "Dollar US",
    usages: "Paiements internationaux, voyages USA, transactions B2B en devise référence.",
  },
  {
    code: "CAD",
    nom: "Dollar canadien",
    usages: "Frais d'études Canada, voyages, transferts vers la diaspora canadienne.",
  },
  {
    code: "GBP",
    nom: "Livre sterling",
    usages: "Voyages Royaume-Uni, opérations avec partenaires britanniques.",
  },
];

const STATS = [
  { value: "Taux", label: "Annoncé avant transaction" },
  { value: "Reçu", label: "Détaillé systématique" },
  { value: "Devis", label: "WhatsApp sous 30 min" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function ChangePage() {
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
                <Coins className="h-3.5 w-3.5" />
                Service change de devises
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  Opérations de change
                </span>{" "}
                fiables avec taux maîtrisés et transparence totale.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                À Bangui, nous opérons un change manuel rigoureux, transparent
                et sécurisé. Taux du jour annoncé avant la transaction,
                comptage vérifié, reçu systématique. Aucune marge dissimulée
                dans le taux affiché.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/change/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Demander mon devis
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=change"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Devis gratuit · Taux du jour annoncé avant déplacement · Une
                question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Change de devises."
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
              <p className="text-overline text-brand">Cadre du service</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pour qui ce service est conçu
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous opérons strictement dans le cadre légal et réglementaire.
                Cette transparence fait partie de notre engagement.
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
                Du devis initial jusqu'à la remise du reçu, chaque étape est
                claire et tracée.
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
                    Demandez votre devis de change.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Devis gratuit. Taux annoncé avant déplacement.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/change/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=change"
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

        {/* 4. DEVISES TRAITÉES ───────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Devises traitées</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quatre devises principales, dans les deux sens
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Pour les autres devises, contactez-nous : selon disponibilité
                et délai d'approvisionnement.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {DEVISES.map((d) => (
                <div
                  key={d.code}
                  className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-display-sm text-brand">
                      {d.code}
                    </span>
                    <span className="text-body-sm text-ink-muted">
                      {d.nom}
                    </span>
                  </div>
                  <p className="mt-3 text-caption text-ink-muted">
                    {d.usages}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CADRE & SÉCURITÉ ───────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cadre & sécurité</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Cinq exigences que nous tenons systématiquement
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Le change manuel est une opération encadrée. Notre rigueur
                protège l'agence comme le client.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Eye,
                  title: "Taux annoncé avant",
                  text: "Le taux du jour vous est communiqué avant tout déplacement à l'agence.",
                },
                {
                  icon: TrendingUp,
                  title: "Pas de marge cachée",
                  text: "Le taux affiché est le taux appliqué. Aucune commission ajoutée hors devis.",
                },
                {
                  icon: ShieldCheck,
                  title: "Comptage vérifié",
                  text: "Comptage des billets effectué des deux côtés, en présence du client.",
                },
                {
                  icon: Receipt,
                  title: "Reçu systématique",
                  text: "Reçu détaillé remis à chaque transaction, quel que soit le montant.",
                },
                {
                  icon: ShieldCheck,
                  title: "Pièce pour gros montants",
                  text: "Pièce d'identité requise au-delà du seuil réglementaire applicable.",
                },
                {
                  icon: Clock,
                  title: "Rendez-vous gros volumes",
                  text: "Pour les très gros montants, un rendez-vous permet de préparer le cash.",
                },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-headline text-ink">
                      {it.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {it.text}
                    </p>
                  </div>
                );
              })}
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
                  ✈️ Voyageur en partance
                </div>
                <h3 className="font-display text-headline text-ink">
                  FCFA vers euros pour départ Schengen
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Demande WhatsApp en matinée, devis communiqué en moins de
                  30 minutes au taux du jour. Passage à l'agence l'après-midi,
                  comptage devant le client, reçu remis pour les douanes.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : voyage cash sécurisé, taux respecté, douanes
                  rassurées par le reçu.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  💼 Diaspora en visite
                </div>
                <h3 className="font-display text-headline text-ink">
                  Euros vers FCFA à l'arrivée à Bangui
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Pré-devis envoyé pendant le voyage. Rendez-vous calé en
                  agence dès l'arrivée, gros montant préparé à l'avance,
                  pièce d'identité présentée, transaction effectuée
                  rapidement.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : famille soutenue avec le bon montant, séjour
                  organisé sans tracas de change.
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
                Le taux annoncé est le taux appliqué
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Aucune commission cachée, aucune marge ajoutée à la dernière
                minute. Si le taux du marché bouge significativement entre le
                devis et la transaction, nous vous le disons franchement.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Garantir un taux supérieur au marché interbancaire réel",
                    "Effectuer des opérations hors traçabilité",
                    "Bloquer un taux à long terme contre les fluctuations du marché",
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
                    "Un taux du jour annoncé clairement avant transaction",
                    "Aucune commission cachée dans le taux affiché",
                    "Un comptage vérifié contradictoirement et un reçu détaillé",
                    "La discrétion et la sécurité pour les gros montants sur rendez-vous",
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
                Le taux EST le tarif
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Pas de frais d'agence, pas de commission ajoutée. Tout est
                inclus dans le taux annoncé.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Devis
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit. Taux et montant exact à recevoir communiqués avant
                  toute opération.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Taux du jour
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Réévalué plusieurs fois par jour selon le marché. Compétitif
                  sur les volumes moyens et élevés.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Reçu
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Remis systématiquement. Utile pour les douanes, la
                  comptabilité et la traçabilité.
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
                Lancer le change
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Demandez votre devis avec le taux du jour.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Devis sous 30 minutes en heures ouvrées. Taux et montant exact
                communiqués avant tout déplacement.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Taux
                  <br />
                  <span className="text-white">Annoncé</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Marge
                  <br />
                  <span className="text-white">Zéro caché</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Reçu
                  <br />
                  <span className="text-white">Systématique</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/change/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Demander mon devis
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=change"
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
                    "Bonjour Nexus, j'ai une question sur une opération de change."
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
