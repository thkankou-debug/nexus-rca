import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  Handshake,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  Rocket,
  Compass,
  GraduationCap,
  Store,
  HandCoins,
  Calendar,
  FileText,
  MessageCircle,
  XCircle,
  Wallet,
  ClipboardCheck,
  Search,
  Eye,
  Check,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Financement & partenariat | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour structurer et cofinancer vos projets. Nous étudions chaque projet avec rigueur avant d'accepter de l'accompagner. Pas un prêt — un partenariat avec partage des résultats.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous portez un projet structuré ou en voie de structuration sérieuse",
    "Vous êtes prêt(e) à investir du temps dans la préparation et l'analyse",
    "Vous acceptez un partenariat avec partage des résultats — pas une dette",
  ],
  non: [
    "Vous cherchez un prêt classique à rembourser avec intérêts",
    "Vous attendez une garantie de financement immédiate sans étude préalable",
    "Vous ne pouvez pas justifier de votre engagement personnel dans le projet",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons les éléments essentiels de votre projet : porteur, secteur, montant, calendrier.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse de faisabilité",
    description:
      "Un conseiller Nexus étudie votre projet selon nos critères (viabilité, structuration, engagement du porteur, potentiel). Bilan écrit avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Si retenu : structuration complète du projet, incubation opérationnelle, mise en place du cofinancement, formalisation du partenariat dans un accord clair.",
  },
  {
    num: "04",
    icon: Eye,
    title: "Suivi jusqu'au résultat",
    description:
      "Suivi long terme du développement, conseils stratégiques continus, partage des résultats selon les termes du partenariat.",
  },
];

const ENGAGEMENTS = [
  {
    emoji: "🤝",
    title: "Nous nous impliquons",
    description:
      "Pas seulement de l'argent : du temps, de l'expertise, des contacts.",
  },
  {
    emoji: "⚖️",
    title: "Nous partageons le risque",
    description:
      "Notre réussite est liée à la vôtre. Nous avançons ensemble.",
  },
  {
    emoji: "🚀",
    title: "Nous accompagnons la réussite",
    description:
      "Du démarrage à la croissance, nous restons à vos côtés.",
  },
];

const QUI_PEUT_POSTULER = [
  {
    icon: GraduationCap,
    title: "Jeunes entrepreneurs",
    description:
      "Vous avez une idée et l'envie d'entreprendre. Nous vous aidons à la transformer en projet viable.",
  },
  {
    icon: Store,
    title: "Commerçants",
    description:
      "Vous voulez développer votre activité, l'agrandir ou la moderniser. Nous structurons sa croissance.",
  },
  {
    icon: Briefcase,
    title: "Porteurs de projets",
    description:
      "Vous portez un projet structuré avec une vision claire. Nous l'évaluons sérieusement.",
  },
  {
    icon: Lightbulb,
    title: "Personnes motivées",
    description:
      "Vous avez la détermination et la rigueur nécessaires. Nous valorisons l'engagement avant tout.",
  },
];

const SELECTION_CRITERES = [
  "Le projet est réaliste et économiquement viable",
  "Le porteur est sérieux, motivé et engagé",
  "La structure et le modèle sont cohérents",
  "Le potentiel de croissance est clairement identifié",
];

const STATS = [
  { value: "Étude", label: "Initiale gratuite" },
  { value: "Partenariat", label: "Pas de dette" },
  { value: "Bilan", label: "Honnête écrit" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function FinancementPage() {
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
                <Handshake className="h-3.5 w-3.5" />
                Service incubateur & financement
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                <span className="text-gradient-orange">
                  L'expertise centrafricaine
                </span>{" "}
                pour structurer et cofinancer vos projets.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous étudions chaque projet avec rigueur avant d'accepter de
                l'accompagner. Si votre projet correspond à nos critères, nous
                le structurons, l'incubons et participons au cofinancement —
                dans une logique de partenariat avec partage des résultats,
                pas de prêt avec dette à rembourser.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/financement/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre mon projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=financement"
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
                    "Bonjour Nexus, j'ai une question sur le service Incubateur & Financement avant de soumettre mon projet."
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
                Du diagnostic initial au partenariat formalisé, chaque étape
                est documentée et communiquée.
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

            {/* CTA en sortie */}
            <div className="mt-10 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-overline text-brand">
                    Démarrer la démarche
                  </p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    Soumettez votre projet dès aujourd'hui.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Étude initiale gratuite. Bilan de faisabilité écrit.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/financement/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre mon projet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=financement"
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

        {/* 4. NOTRE APPROCHE — Ce qui nous distingue ─────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Notre approche</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Trois engagements qui nous distinguent
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Nous ne finançons pas au hasard. Chaque projet retenu fait
                l'objet d'une étude approfondie et d'un partenariat formalisé.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {ENGAGEMENTS.map((e) => (
                <div
                  key={e.title}
                  className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2"
                >
                  <div className="text-3xl">{e.emoji}</div>
                  <h3 className="mt-3 font-display text-headline text-ink">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-muted">
                    {e.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. MODÈLE — Pas un prêt classique ─────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-nexus-orange-400">
                Comment ça marche
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Un partenariat,{" "}
                <span className="text-nexus-orange-400">pas un prêt</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-body-lg text-slate-300">
                Notre modèle repose sur la collaboration et le partage des
                résultats. Pas de dette qui écrase, pas de charge financière
                lourde dès le départ.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-overline text-rose-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ce que nous ne faisons pas
                </div>
                <ul className="space-y-3 text-body-sm text-slate-300">
                  <ListItemCross>Nous ne sommes pas une banque</ListItemCross>
                  <ListItemCross>
                    Nous ne prêtons pas d'argent à rembourser avec intérêts
                  </ListItemCross>
                  <ListItemCross>
                    Nous n'imposons pas de dette lourde dès le démarrage
                  </ListItemCross>
                  <ListItemCross>
                    Nous ne demandons pas de garanties bancaires classiques
                  </ListItemCross>
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-nexus-orange-500/40 bg-nexus-orange-500/10 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-500/20 px-3 py-1 text-overline text-nexus-orange-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ce que nous faisons
                </div>
                <ul className="space-y-3 text-body-sm text-white">
                  <ListItemCheck>
                    Nous investissons dans votre projet
                  </ListItemCheck>
                  <ListItemCheck>
                    Nous devenons partenaire de votre développement
                  </ListItemCheck>
                  <ListItemCheck>
                    Nous partageons les résultats selon un accord clair
                  </ListItemCheck>
                  <ListItemCheck>
                    Nous accompagnons la croissance sur le long terme
                  </ListItemCheck>
                </ul>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <ModelAdvantage
                title="Pas de charge écrasante"
                description="Vous démarrez sans le poids d'une dette à rembourser dès le premier jour."
              />
              <ModelAdvantage
                title="Relation gagnant-gagnant"
                description="Notre intérêt est aligné avec le vôtre : la réussite du projet."
              />
              <ModelAdvantage
                title="Croissance accompagnée"
                description="Un partenaire engagé sur la durée, pas un simple financeur de passage."
              />
            </div>
          </div>
        </section>

        {/* 6. QUI PEUT POSTULER ──────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Qui peut postuler</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Quatre profils que nous accompagnons
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {QUI_PEUT_POSTULER.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-headline text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-body-sm text-ink-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. CRITÈRES DE SÉLECTION ───────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-brand-subtle/40 via-surface-elevated to-nexus-blue-50/40 p-8 shadow-elev-3 dark:from-brand/10 dark:via-surface-elevated dark:to-blue-500/5 sm:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-brand">
                    Sélection rigoureuse
                  </p>
                  <h2 className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    Tous les projets ne sont pas retenus
                  </h2>
                  <p className="mt-4 text-body text-ink-muted sm:text-body-lg">
                    Notre engagement implique une sélection rigoureuse. Chaque
                    dossier est étudié sérieusement, et seuls les projets
                    correspondant à nos critères sont retenus.
                  </p>

                  <div className="mt-6 rounded-2xl border border-line bg-surface-elevated p-5">
                    <p className="mb-3 text-overline text-ink-muted">
                      Critères de sélection
                    </p>
                    <ul className="space-y-3">
                      {SELECTION_CRITERES.map((critere) => (
                        <li
                          key={critere}
                          className="flex items-start gap-3 text-body-sm text-ink sm:text-body"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                          <span>{critere}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-5 text-body-sm italic text-ink-muted">
                    Si votre projet n'est pas retenu, nous vous le disons
                    avec transparence et, si possible, vous orientons vers
                    d'autres pistes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CADRE TARIFAIRE ──────────────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Cadre économique</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Une transparence économique complète
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Vous savez à quoi vous engager avant tout partenariat.
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
                  Gratuite, sans engagement. Bilan écrit communiqué sous
                  délai annoncé.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                  <Handshake className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Modalités du partenariat
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  Apport Nexus, apport porteur, partage des résultats :
                  formalisés dans un accord écrit avant tout démarrage.
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
                  Frais juridiques (statuts, contrats) et opérationnels
                  détaillés à l'avance, à la charge du projet selon plan
                  établi.
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
                Soumettre votre projet
              </p>
              <h2 className="mt-3 font-display text-display-md text-white sm:text-display-lg">
                Lancez votre projet selon notre méthodologie.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                L'étude initiale est gratuite. Si nous estimons que votre
                projet correspond à nos critères, nous vous proposons un
                partenariat. Sinon, nous vous le disons franchement et vous
                orientons.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-overline text-white/80">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Étude
                  <br />
                  <span className="text-white">Gratuite</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Partenariat
                  <br />
                  <span className="text-white">Pas de dette</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  Bilan
                  <br />
                  <span className="text-white">Honnête</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/financement/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre mon projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=financement"
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
                    "Bonjour Nexus, j'ai une question sur le service Incubateur & Financement avant de soumettre mon projet."
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

// ─── Sous-composants ────────────────────────────────────────────────────────

function ListItemCross({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 font-bold text-rose-300">
        ×
      </span>
      <span>{children}</span>
    </li>
  );
}

function ListItemCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-nexus-orange-400" />
      <span>{children}</span>
    </li>
  );
}

function ModelAdvantage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <h4 className="font-display text-title text-white">{title}</h4>
      <p className="mt-2 text-body-sm text-slate-300">{description}</p>
    </div>
  );
}
