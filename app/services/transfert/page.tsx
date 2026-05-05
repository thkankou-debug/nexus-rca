import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Send,
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
  Smartphone,
  Building2,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Transfert d'argent international | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos transferts d'argent entre la RCA et le reste du monde. Frais transparents annoncés avant opération, suivi jusqu'à réception confirmée.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous avez besoin d'envoyer ou de recevoir de l'argent entre la RCA et l'étranger, en toute traçabilité",
    "Vous acceptez de fournir une pièce d'identité valide pour respecter la réglementation",
    "Vous êtes prêt(e) à confirmer le bénéficiaire avec ses coordonnées exactes (nom, pièce, ville)",
  ],
  non: [
    "Vous cherchez un canal anonyme ou hors traçabilité — Nexus opère uniquement dans le cadre légal",
    "Vous voulez transférer des fonds dont l'origine ne peut être justifiée",
    "Vous attendez un taux ou des frais inférieurs à ce que la réglementation autorise — la transparence n'a pas de magie",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire (montant, devise, destination, bénéficiaire) ou venez en agence. Nous vérifions la faisabilité réglementaire.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse & devis canal",
    description:
      "Un conseiller Nexus identifie le meilleur canal selon destination, montant et urgence. Devis écrit avec frais et taux annoncés avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Exécution structurée",
    description:
      "Vérification des coordonnées du bénéficiaire, exécution du transfert en agence ou par voie sécurisée. Remise du reçu et des références de traçabilité.",
  },
  {
    num: "04",
    icon: Send,
    title: "Suivi jusqu'à réception",
    description:
      "Nous ne clôturons pas avant la confirmation de réception par le bénéficiaire. En cas de blocage, intervention immédiate auprès de l'opérateur.",
  },
];

interface CanalType {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delai: string;
}

const CANAUX: CanalType[] = [
  {
    icon: Send,
    title: "Western Union & MoneyGram",
    description:
      "Transfert rapide international, retrait en espèces auprès d'un agent agréé.",
    delai: "Quelques minutes à 1 heure",
  },
  {
    icon: Smartphone,
    title: "Mobile money",
    description:
      "Versement direct sur portefeuille mobile (Orange Money, MTN, Airtel Money).",
    delai: "Instantané à 30 min",
  },
  {
    icon: Building2,
    title: "Virement bancaire",
    description:
      "Transfert IBAN/SWIFT vers compte bancaire international ou domestique.",
    delai: "1 à 3 jours ouvrés",
  },
  {
    icon: Globe,
    title: "Réseau partenaire",
    description:
      "Solutions ad hoc pour gros transferts ou destinations difficiles, validées par le conseiller.",
    delai: "Variable selon dossier",
  },
];

const STATS = [
  { value: "Devis", label: "Frais annoncés avant" },
  { value: "Suivi", label: "Jusqu'à réception" },
  { value: "Reçu", label: "Traçabilité complète" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function TransfertPage() {
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
                <Send className="h-3.5 w-3.5" />
                Service transfert d'argent
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  Transferts internationaux
                </span>{" "}
                sécurisés avec exécution rapide et traçable.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Entre la RCA et le reste du monde, nous gérons vos transferts
                avec rigueur, transparence et un suivi jusqu'à la réception
                confirmée. Frais annoncés avant opération, traçabilité
                complète, intervention immédiate en cas d'incident.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/transfert/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=transfert"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-body font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </div>

              <p className="mt-5 text-caption text-slate-400">
                Devis gratuit · Frais annoncés avant opération · Une question ?{" "}
                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'ai une question sur le service Transfert d'argent."
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
              Un transfert international n&apos;est pas une opération technique. C&apos;est{" "}
              <span className="text-brand">une chaîne de confiance</span>{" "}
              entre l&apos;expéditeur, l&apos;opérateur et le destinataire.
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
                  Quatre étapes encadrées, du cadrage initial à la confirmation de réception.
                </p>
              </div>
              <ul className="space-y-5">
                {[
                  { title: "Cadrage origine, destination et montant", desc: "Vérification réglementaire, validation des pièces et confirmation de la procédure applicable selon le couloir." },
                  { title: "Choix du corridor optimal", desc: "Sélection du couple opérateur-méthode le mieux adapté en frais, délais et sécurité pour votre cas." },
                  { title: "Exécution sécurisée", desc: "Opération réalisée depuis nos bureaux, frais annoncés avant exécution, justificatifs remis." },
                  { title: "Confirmation de réception", desc: "Suivi jusqu'à la réception confirmée par le destinataire, alerte en cas d'anomalie." },
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
                Quatre engagements concrets sur chaque opération. Pas de marge cachée,
                pas de délai approximatif.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Frais annoncés avant opération", desc: "Aucun frais ajouté en cours de route. Le devis fait foi." },
                { title: "Traçabilité complète", desc: "Justificatifs et numéro de transaction transmis pour vos comptes." },
                { title: "Délai annoncé respecté", desc: "Opérateur sélectionné selon votre contrainte temporelle." },
                { title: "Réception confirmée", desc: "Vous savez que la somme est arrivée, pas une supposition." },
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
                Nous opérons strictement dans le cadre légal et réglementaire.
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
                Du devis initial jusqu'à la confirmation de réception par le
                bénéficiaire, chaque étape est tracée et communiquée.
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
                    Soumettez votre demande de transfert.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Devis gratuit. Frais annoncés avant opération.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/transfert/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=transfert"
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

        {/* 4. CANAUX DISPONIBLES ───────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Canaux disponibles</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Le bon canal selon le besoin
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Chaque canal a sa logique : rapidité, coût, plafond,
                destination. Notre conseiller propose le plus adapté à votre
                situation, pas celui qui rapporte le plus à l'agence.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {CANAUX.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {c.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                      {c.delai}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. CADRE RÉGLEMENTAIRE ───────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">
                Cadre légal & réglementaire
              </p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Tout transfert est tracé, et c'est volontaire
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous opérons dans le respect strict de la BEAC, de la COBAC
                et des règles internationales de lutte contre le blanchiment.
                Cette rigueur protège l'expéditeur, le bénéficiaire et le
                pays.
              </p>
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-500/10 sm:p-6">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-title text-amber-900 dark:text-amber-200">
                  À retenir avant de commencer
                </p>
                <p className="mt-1 text-body-sm text-amber-800 dark:text-amber-300">
                  Pour les transferts au-delà de certains seuils, les
                  opérateurs exigent des justificatifs supplémentaires
                  (origine des fonds, motif). Anticipez avec votre conseiller.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Pièce d'identité valide",
                  text: "Pour l'expéditeur et conformité avec les coordonnées du bénéficiaire.",
                },
                {
                  icon: Receipt,
                  title: "Origine des fonds",
                  text: "Justificatif requis au-delà de certains seuils selon les canaux.",
                },
                {
                  icon: Wallet,
                  title: "Plafonds réglementaires",
                  text: "Variables selon canal et juridiction. Nexus fractionne ou combine si nécessaire.",
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
                  💸 Soutien familial mensuel
                </div>
                <h3 className="font-display text-headline text-ink">
                  Diaspora vers RCA, montant régulier
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Envoi mensuel structuré depuis la France ou le Canada vers
                  un proche à Bangui. Choix du canal optimisé selon la
                  régularité (mobile money, Western Union), suivi de
                  réception, archivage des reçus pour traçabilité.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : régularité respectée, frais minimisés, confiance
                  renforcée des deux côtés.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  🏢 Paiement fournisseur international
                </div>
                <h3 className="font-display text-headline text-ink">
                  Entrepreneur RCA, fournisseur asiatique ou européen
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Virement bancaire SWIFT vers fournisseur, montage du
                  dossier de justification des fonds, traçabilité complète
                  pour les obligations fiscales et bancaires de l'entreprise.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : fournisseur payé dans les délais, dossier carré
                  côté banque RCA et fiscalité.
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
                Aucune marge cachée, aucune promesse impossible
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Les frais que nous appliquons correspondent aux tarifs
                opérateurs plus une commission de service annoncée à
                l'avance. Aucune marge dissimulée dans les taux de change.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Effectuer un transfert hors traçabilité ou anonyme",
                    "Garantir un délai inférieur à celui de l'opérateur",
                    "Contourner un plafond ou un blocage réglementaire",
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
                    "Un devis clair avec frais et taux annoncés avant opération",
                    "Le canal le plus adapté à votre cas, pas le plus rentable pour nous",
                    "Un suivi actif jusqu'à la confirmation de réception",
                    "Une intervention immédiate auprès de l'opérateur en cas d'incident",
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
                Vous savez ce que ça coûte avant que l'opération soit
                exécutée.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Devis initial
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Gratuit. Frais opérateur, commission Nexus et taux de
                  change clairement détaillés.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Frais opérateurs
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Western Union, MoneyGram, banques, mobile money — tarifs
                  réels, sans majoration cachée.
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
                  Service, conseil et suivi. Montant fixe communiqué dès le
                  devis. Aucune surprise.
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
                Lancer le transfert
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Demandez votre devis avec frais et délai garantis.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Réponse rapide d'un conseiller avec le canal recommandé, les
                frais exacts et le délai annoncé. Soumettez votre demande
                pour recevoir un devis sous 24 heures ouvrées.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Devis
                  <br />
                  <span className="text-white">Gratuit</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Frais
                  <br />
                  <span className="text-white">Annoncés</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Suivi
                  <br />
                  <span className="text-white">Réception</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/transfert/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=transfert"
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
                    "Bonjour Nexus, j'ai une question sur un transfert d'argent."
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
