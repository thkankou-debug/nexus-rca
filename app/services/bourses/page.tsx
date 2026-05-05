import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import {
  GraduationCap,
  School,
  Building2,
  Wrench,
  DollarSign,
  Award,
  Target,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Search,
  ClipboardCheck,
  FileText,
  Plane,
  Eye,
  Sparkles,
  TrendingUp,
  Calendar,
  MessageCircle,
  XCircle,
  Wallet,
  Check,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Études au Canada | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos études au Canada. Nous étudions chaque dossier avec rigueur avant d'accepter de l'accompagner. Méthode en quatre étapes du diagnostic au permis d'études.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const POUR_QUI = {
  oui: [
    "Vous avez un projet d'études au Canada cohérent avec votre parcours académique",
    "Vous disposez du temps nécessaire pour préparer votre dossier (6 à 12 mois minimum)",
    "Vous êtes prêt(e) à structurer votre projet selon les standards des établissements canadiens",
  ],
  non: [
    "Vous cherchez une rentrée dans moins de 3 mois sans préparation préalable",
    "Vous n'avez pas terminé votre cycle d'études actuel ou vos résultats ne sont pas stabilisés",
    "Vous attendez une garantie d'admission ou de bourse — aucune agence sérieuse ne peut le promettre",
  ],
};

const METHODOLOGIE = [
  {
    num: "01",
    icon: FileText,
    title: "Soumission de la demande",
    description:
      "Vous remplissez notre formulaire structuré ou prenez rendez-vous. Nous recueillons votre parcours académique, votre projet et votre calendrier cible.",
  },
  {
    num: "02",
    icon: Search,
    title: "Analyse de faisabilité",
    description:
      "Un conseiller Nexus étudie votre profil, identifie les programmes et établissements compatibles, et évalue vos chances réelles. Bilan de faisabilité écrit avant tout engagement.",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Accompagnement structuré",
    description:
      "Montage complet du dossier d'admission selon les standards canadiens : lettre de motivation, CV académique, traductions certifiées, recherche d'aides financières documentées.",
  },
  {
    num: "04",
    icon: Plane,
    title: "Suivi jusqu'au résultat",
    description:
      "Suivi actif des admissions, réponses aux demandes complémentaires, prise en charge du visa étudiant : CAQ ou attestation provinciale, permis d'études IRCC, biométrie à Yaoundé.",
  },
];

interface EtablissementType {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  duree: string;
}

const ETABLISSEMENTS: EtablissementType[] = [
  {
    icon: School,
    title: "Collèges (Cégeps)",
    description:
      "Formations techniques et professionnelles, fortement orientées emploi.",
    duree: "1 à 3 ans",
  },
  {
    icon: Building2,
    title: "Universités",
    description: "Licences, masters et doctorats dans tous les domaines.",
    duree: "3 à 5 ans",
  },
  {
    icon: Wrench,
    title: "Instituts spécialisés",
    description: "Formations techniques de pointe et métiers spécifiques.",
    duree: "Variable",
  },
];

const TYPES_AIDES = [
  {
    icon: Award,
    title: "Bourses partielles",
    description:
      "Réduction de 10 % à 50 % des frais, accordées par les établissements selon le profil.",
    pct: "10-50%",
  },
  {
    icon: TrendingUp,
    title: "Aides au mérite",
    description:
      "Versées après l'admission selon les résultats académiques et l'engagement.",
    pct: "Au mérite",
  },
  {
    icon: Sparkles,
    title: "Programmes ciblés",
    description:
      "Bourses de gouvernement, partenariats éducatifs, profils à fort potentiel.",
    pct: "Sur profil",
  },
];

const STATS = [
  { value: "Étude", label: "Initiale gratuite" },
  { value: "CAQ + permis", label: "Visa étudiant inclus" },
  { value: "Bilan", label: "Honnête écrit" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function BoursesPage() {
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
                <GraduationCap className="h-3.5 w-3.5" />
                Service études Canada
              </div>

              <h1
                className="font-display text-display-xl text-white lg:text-display-2xl"
                style={{ paddingBottom: "0.15em" }}
              >
                Identification et{" "}
                <span className="text-gradient-orange">
                  positionnement stratégique
                </span>{" "}
                sur les financements académiques disponibles.
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-body-lg text-slate-300">
                Nous étudions chaque dossier avec rigueur avant d'accepter de
                l'accompagner. Si votre profil correspond, nous le construisons
                selon les standards exigés par les établissements canadiens et
                menons votre projet jusqu'à l'obtention du permis d'études.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/bourses/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=bourses"
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
                    "Bonjour Nexus, j'ai une question sur le service Études Canada avant de soumettre ma demande."
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
              Une bourse n&apos;est pas une chance. C&apos;est{" "}
              <span className="text-brand">une cible</span>. Encore faut-il viser juste, au bon moment, avec le bon dossier.
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
                  Quatre prestations pour transformer un projet en candidature qualifiée.
                </p>
              </div>
              <ul className="space-y-5">
                {[
                  { title: "Cartographie des financements éligibles", desc: "Inventaire des bourses gouvernementales, des programmes ciblés et des aides au mérite ouvertes à votre profil." },
                  { title: "Positionnement stratégique du profil", desc: "Sélection des candidatures à fort potentiel selon vos résultats, votre projet et les critères d'éligibilité." },
                  { title: "Montage des dossiers ciblés", desc: "Lettre de motivation, projet professionnel et pièces justificatives adaptés à chaque organisme bailleur." },
                  { title: "Suivi des résultats et plan B", desc: "Réponse aux compléments demandés, gestion du calendrier, alternatives documentées si refus." },
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
                Pas de promesse de bourse — la décision appartient au bailleur.
                En revanche, voici ce que nous structurons concrètement.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Stratégie financière claire", desc: "Vous savez qui demande quoi, à quelle date, et avec quelle pièce." },
                { title: "Candidatures qualifiées", desc: "Pas d'envoi de masse. Chaque dossier est ciblé sur un bailleur précis." },
                { title: "Maximisation des chances", desc: "Votre dossier valorise les angles qui comptent pour le bailleur." },
                { title: "Plan B documenté", desc: "Si la bourse principale échoue, des alternatives identifiées en amont." },
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
                Du diagnostic académique jusqu'à votre arrivée au Canada,
                chaque étape est documentée et communiquée.
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
                  <p className="text-overline text-brand">
                    Démarrer la démarche
                  </p>
                  <p className="mt-2 font-display text-headline text-ink sm:text-display-sm">
                    Soumettez votre projet d'études dès aujourd'hui.
                  </p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    Étude initiale gratuite. Bilan de faisabilité écrit.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/bourses/demarrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
                  >
                    Soumettre mon dossier
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=bourses"
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

        {/* 4. SYSTÈME ÉDUCATIF CANADIEN ─────────────────────────── */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">
                Le système éducatif canadien
              </p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Trois types d'établissements, trois logiques différentes
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Chaque type a ses critères d'admission et ses possibilités
                d'aides financières. Nexus RCA vous oriente selon votre profil.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {ETABLISSEMENTS.map((etab) => {
                const Icon = etab.icon;
                return (
                  <div
                    key={etab.title}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 dark:from-blue-500/15 dark:to-blue-500/10 dark:text-blue-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {etab.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {etab.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                      <Building2 className="h-3.5 w-3.5" />
                      {etab.duree}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coût moyen */}
            <div className="mt-10 rounded-3xl border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-surface-elevated to-orange-50 p-8 shadow-elev-3 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5 sm:p-10">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-overline text-amber-700 dark:text-amber-300">
                    Coût moyen des études
                  </p>
                  <p className="mt-2 font-display text-display-sm text-ink sm:text-display-md">
                    15 000 à 30 000 $ CAD par an
                  </p>
                  <p className="mt-2 text-body text-ink-muted">
                    Soit environ{" "}
                    <strong className="text-ink">
                      7 à 14 millions FCFA/an
                    </strong>{" "}
                    selon le programme et la province. Les bourses et aides
                    financières sont essentielles dans tout projet d'études au
                    Canada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. AIDES FINANCIÈRES ─────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-overline text-brand">Aides financières</p>
              <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
                Ce qu'il faut savoir, sans illusions
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                Les bourses 100 % sont rares. La majorité des étudiants
                accèdent à des aides partielles ou cumulent plusieurs
                financements.
              </p>
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-500/10 sm:p-6">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-title text-amber-900 dark:text-amber-200">
                  À retenir avant de continuer
                </p>
                <p className="mt-1 text-body-sm text-amber-800 dark:text-amber-300">
                  Les bourses 100 % (frais + vie courante) sont
                  exceptionnelles et hyper-compétitives. La plupart des
                  étudiants obtiennent des bourses partielles ou cumulent
                  plusieurs aides pour réduire le coût total.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TYPES_AIDES.map((aide) => {
                const Icon = aide.icon;
                return (
                  <div
                    key={aide.title}
                    className="flex flex-col rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-elev-2">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-nexus-blue-100 px-3 py-1 text-overline text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {aide.pct}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-headline text-ink">
                      {aide.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted">
                      {aide.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. CAS TYPES ─────────────────────────────────────────── */}
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
                  🎓 Université au Québec
                </div>
                <h3 className="font-display text-headline text-ink">
                  Bachelière, projet de licence à Montréal
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Calendrier de 12 mois avant la rentrée. Nexus RCA mène le
                  diagnostic académique, sélectionne 3 universités cibles,
                  monte le dossier d'admission complet, identifie deux bourses
                  partielles éligibles, puis prend en charge le CAQ et le
                  permis d'études IRCC.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : admission + bourse partielle, permis d'études
                  obtenu, départ à l'heure pour la rentrée d'automne.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-7 shadow-elev-2">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-overline text-nexus-orange-700 dark:text-brand">
                  🛠️ Cégep technique en Ontario
                </div>
                <h3 className="font-display text-headline text-ink">
                  Diplômé technique, formation professionnelle
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Profil ciblé sur un Cégep avec orientation emploi. Nexus
                  RCA structure la lettre de motivation autour du projet
                  professionnel, organise la traduction des relevés et le
                  dépôt biométrique à Yaoundé.
                </p>
                <p className="mt-3 text-body-sm font-semibold text-ink">
                  Résultat : admission obtenue, permis d'études validé, projet
                  d'employabilité construit dès l'arrivée au Canada.
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
                Aucune agence sérieuse ne peut garantir une bourse
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-muted">
                La décision finale appartient toujours aux établissements.
                Toute structure qui vous promet une bourse ou une admission
                vous trompe. Nexus RCA ne le fera jamais.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border-2 border-rose-200/60 bg-rose-50/40 p-7 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-overline text-rose-700 dark:text-rose-300">
                  Ce que nous ne pouvons pas
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Garantir l'obtention d'une bourse",
                    "Influencer la décision d'admission",
                    "Promettre une rentrée certaine",
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
                    "Un dossier solide et compétitif, conforme aux standards canadiens",
                    "Une stratégie d'établissement adaptée à votre profil",
                    "L'identification documentée des aides financières éligibles",
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
                  Devis fixe communiqué après le bilan de faisabilité. Aucune
                  facturation surprise en cours de route.
                </p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-headline text-ink">
                  Frais d'admission & visa
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">
                  À votre charge, montant détaillé à l'avance par établissement
                  et par juridiction. Reversés directement aux organismes
                  concernés.
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
                Lancez votre projet d'études selon notre méthodologie.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-body-lg text-slate-300">
                Les calendriers d'admission canadiens demandent une préparation
                anticipée — souvent 6 à 12 mois avant la rentrée. Soumettez
                votre demande maintenant pour sécuriser votre rentrée.
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
                  Visa
                  <br />
                  <span className="text-white">Inclus</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/services/bourses/demarrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-4 transition hover:bg-brand-hover hover:shadow-glow-orange"
                >
                  <FileText className="h-5 w-5" />
                  Soumettre ma demande
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/rendez-vous?service=bourses"
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
                    "Bonjour Nexus, j'ai une question sur le service Études Canada avant de soumettre ma demande."
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
