import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Check,
  Calendar,
  MessageCircle,
  Search,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Languages,
  Edit3,
  Printer,
  FileSignature,
  Eye,
  Lock,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Services administratifs, CV & traductions | Nexus RCA",
  description:
    "L'expertise centrafricaine pour vos documents administratifs : CV format canadien, lettres, traductions, formulaires officiels, impression. Documents prêts à déposer, livrés dans les délais.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous voulez un document propre, conforme au format attendu (CV canadien, lettre formelle, formulaire IRCC) sans approximation",
    "Vous acceptez de fournir vos informations exactes et de répondre à nos questions de cadrage",
    "Vous êtes prêt(e) à valider une relecture finale avant la livraison",
  ],
  non: [
    "Vous cherchez un modèle générique recopié sans adaptation à votre profil — ce n'est pas notre méthode",
    "Vous voulez signer un dossier officiel à votre place — pour des raisons légales, la signature reste celle du demandeur",
    "Vous attendez un document écrit en quelques minutes sans cadrage — chaque livrable passe par une relecture",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (type de prestation, format cible, langue, urgence) ou prenez rendez-vous. Nous récupérons les pièces nécessaires.",
  },
  {
    num: "02",
    icon: Search,
    title: "Cadrage & devis",
    description:
      "Un conseiller Nexus précise le périmètre exact, propose un devis fixe et un délai de livraison. Aucune action engagée avant validation.",
  },
  {
    num: "03",
    icon: Edit3,
    title: "Production rigoureuse",
    description:
      "Rédaction, traduction ou remplissage assuré par un membre qualifié de l'équipe. Codes du document cible (CV canadien, IRCC…) maîtrisés.",
  },
  {
    num: "04",
    icon: ShieldCheck,
    title: "Relecture & livraison",
    description:
      "Relecture systématique avant envoi. Livraison numérique (PDF + modifiable) et/ou impression à l'agence Bangui selon votre choix.",
  },
];

interface PrestationType {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delai: string;
}

const PRESTATIONS: PrestationType[] = [
  {
    icon: FileSignature,
    title: "CV & lettres de motivation",
    description:
      "CV format canadien, européen ou africain. Lettre de motivation sur-mesure (études, emploi, visa, bourse). Cadrage par entretien si besoin.",
    delai: "24 à 48 h",
  },
  {
    icon: Languages,
    title: "Traductions FR ↔ EN",
    description:
      "Traduction professionnelle de documents courts et officiels. Pour traductions assermentées (tribunaux, certains consulats), orientation vers traducteur agréé.",
    delai: "24 à 72 h",
  },
  {
    icon: ClipboardCheck,
    title: "Formulaires officiels",
    description:
      "Remplissage IRCC, France-Visas, consulats, dossiers universitaires. Préparation complète, accompagnement ligne par ligne. Signature : vous.",
    delai: "48 h à 5 jours",
  },
  {
    icon: Printer,
    title: "Impression, scan, reliure",
    description:
      "Impression couleur ou N/B, reliure, plastification, scan haute qualité, numérisation et envoi électronique de dossiers complets.",
    delai: "Dans la journée",
  },
];

const STATS = [
  { value: "Devis", label: "Fixe avant production" },
  { value: "Relecture", label: "Systématique avant livraison" },
  { value: "Confidentialité", label: "Documents non rediffusés" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function AdministratifPage() {
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
                <FileText className="h-3.5 w-3.5" />
                Services administratifs
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                pour vos documents administratifs.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                CV au format attendu, lettres adaptées, traductions
                professionnelles, formulaires IRCC remplis avec rigueur,
                impression à Bangui. Vos documents sortent prêts à être
                déposés — pas réécrits par le destinataire.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/administratif/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=administratif"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Devis gratuit · Confidentialité totale · Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Administratif."
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
                Nous travaillons avec rigueur sur chaque document. Cette
                exigence fait partie de notre engagement professionnel.
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
                Du brief initial jusqu'à la livraison du document, chaque
                étape est cadrée et tracée.
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
                    Soumettez votre besoin documentaire.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Devis sous quelques heures. Délai annoncé avant production.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/administratif/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=administratif"
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

        {/* 4. PRESTATIONS ───────────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Périmètre du service</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quatre familles de prestations
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Chaque famille a ses codes et ses livrables. Le devis précise
                le périmètre exact selon votre besoin.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {PRESTATIONS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {p.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                      Délai indicatif : {p.delai}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. EXIGENCES QUALITÉ ─────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Exigences qualité</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Pas de modèles copiés. Chaque document est cadré.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                La qualité ne tient pas à un beau gabarit, mais à la
                pertinence du contenu pour le destinataire réel.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileSignature,
                  title: "Codes du format cible",
                  text: "CV canadien ≠ CV français. IRCC ≠ France-Visas. Nous adaptons systématiquement.",
                },
                {
                  icon: Edit3,
                  title: "Cadrage par entretien",
                  text: "Si vos infos sont incomplètes, un échange court suffit à reconstituer un parcours propre.",
                },
                {
                  icon: Eye,
                  title: "Relecture systématique",
                  text: "Aucun document n'est livré sans relecture. Pas de fautes évitables, pas d'incohérences.",
                },
                {
                  icon: Languages,
                  title: "Langues maîtrisées",
                  text: "Français, anglais. Pour traductions assermentées, orientation vers traducteur agréé.",
                },
                {
                  icon: Lock,
                  title: "Confidentialité totale",
                  text: "Documents et informations strictement confidentiels. Aucune rediffusion ni réutilisation.",
                },
                {
                  icon: ShieldCheck,
                  title: "Délais tenus",
                  text: "Délai annoncé = délai livré. En cas de risque, prévenu à l'avance, pas après.",
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
                  📄 CV format canadien
                </div>
                <h3 className="font-display text-headline text-ink">
                  Reconstruction CV pour candidature étudiante
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Entretien d'une trentaine de minutes pour reconstituer le
                  parcours, identification des expériences à valoriser, mise
                  au format canadien strict (longueur, vocabulaire,
                  organisation), relecture et livraison PDF + version
                  modifiable.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : CV propre déposé dans 3 universités, dossier
                  pris au sérieux dès le tri initial.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  📋 Formulaire IRCC complet
                </div>
                <h3 className="font-display text-headline text-ink">
                  Préparation dossier permis d'études Canada
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Liste précise des pièces, remplissage ligne par ligne avec
                  le demandeur, traduction de 3 documents, vérification des
                  cohérences entre formulaires, accompagnement jusqu'à la
                  signature et soumission par le demandeur.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : dossier propre, soumis sans aller-retour avec
                  l'agent de visas.
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
                Ce que nous faisons, ce que nous ne faisons pas
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Une délimitation claire évite les malentendus et protège la
                qualité du livrable comme la conformité légale.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Signer ou soumettre un dossier officiel à votre place",
                    "Garantir l'acceptation d'un visa, d'une admission ou d'une candidature",
                    "Délivrer une traduction assermentée — orientation vers traducteur agréé",
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
                    "Un document conforme au format attendu par le destinataire",
                    "Une relecture systématique avant chaque livraison",
                    "Un délai annoncé à l'avance et respecté",
                    "Une confidentialité totale sur les documents transmis",
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
                Devis fixe selon la prestation, communiqué avant production.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Cadrage initial
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit. Périmètre, format cible et délai validés avant
                  toute production.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Devis fixe
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Tarif annoncé avant production selon le type de document.
                  Aucune facturation surprise en cours de route.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Frais externes
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Si frais externes nécessaires (traducteur assermenté, frais
                  postaux, impression volumineuse), détaillés à part.
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
                Démarrer la démarche
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Précisez votre besoin, recevez un devis sous quelques heures.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                CV, lettre, traduction, formulaire ou impression — un
                conseiller revient avec un périmètre clair, un délai et un
                prix fixe.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Devis
                  <br />
                  <span className="text-white">Fixe</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Délai
                  <br />
                  <span className="text-white">Tenu</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Confidentialité
                  <br />
                  <span className="text-white">Totale</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/administratif/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=administratif"
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
                    "Bonjour Nexus, j'ai un document administratif à préparer."
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
