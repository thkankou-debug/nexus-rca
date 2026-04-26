import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import {
  Handshake,
  TrendingUp,
  Briefcase,
  Globe2,
  Sparkles,
  ShieldCheck,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Incubateur et financement en partenariat | Nexus RCA",
  description:
    "Nexus RCA accompagne et finance des projets selectionnes. Approche basee sur le partenariat, le developpement a long terme et le partage des resultats.",
};

const POSITIONNEMENT_POINTS = [
  {
    icon: Handshake,
    text: "Accompagner votre projet de A a Z",
  },
  {
    icon: TrendingUp,
    text: "Participer activement a son developpement",
  },
  {
    icon: Briefcase,
    text: "Investir en partenariat dans les projets selectionnes",
  },
];

const ETAPES = [
  {
    num: "01",
    title: "Soumission du projet",
    description:
      "Vous nous presentez votre projet via notre formulaire dedie. Idee, vision, equipe, besoins.",
  },
  {
    num: "02",
    title: "Analyse",
    description:
      "Etude approfondie de la viabilite, du potentiel et de la structuration du projet.",
  },
  {
    num: "03",
    title: "Selection",
    description:
      "Decision basee sur des criteres clairs. Retour transparent quel que soit le resultat.",
  },
  {
    num: "04",
    title: "Mise en place du partenariat",
    description:
      "Cadre formel, role de chacun, modalites du partenariat etablies dans la transparence.",
  },
  {
    num: "05",
    title: "Suivi et developpement",
    description:
      "Accompagnement continu, suivi de la croissance, ajustements strategiques en partenariat.",
  },
];

const TYPES_PROJETS = [
  {
    icon: Briefcase,
    title: "Projets entrepreneuriaux",
    description: "Creation ou developpement d entreprise avec un projet structure.",
  },
  {
    icon: TrendingUp,
    title: "Activites commerciales",
    description: "Commerces, services, activites generant des revenus reguliers.",
  },
  {
    icon: Globe2,
    title: "Projets internationaux",
    description: "Initiatives transfrontalieres, import-export, expansion regionale.",
  },
  {
    icon: Sparkles,
    title: "Initiatives a fort potentiel",
    description: "Projets innovants, secteurs porteurs, opportunites de marche.",
  },
];

const CRITERES = [
  {
    icon: ShieldCheck,
    title: "Viabilite",
    description:
      "Le projet repose sur des bases economiques solides et un modele realiste.",
  },
  {
    icon: TrendingUp,
    title: "Potentiel de croissance",
    description:
      "Le marche est porteur, le projet peut prendre de l ampleur dans le temps.",
  },
  {
    icon: Layers,
    title: "Structuration",
    description:
      "Le porteur a pris le temps de poser les bases : plan, equipe, organisation.",
  },
  {
    icon: Target,
    title: "Engagement du porteur",
    description:
      "Vision claire, determination, capacite a porter le projet sur le long terme.",
  },
];

export default function FinancementPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <ServiceHero
          badge="Incubateur et financement en partenariat"
          title="Développez votre projet avec un partenaire engagé"
          subtitle="Nous accompagnons et finançons des projets sélectionnés, avec une approche basée sur le partenariat et le développement à long terme."
          image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Incubateur et partenariat Nexus RCA"
          ctaLabel="Soumettre mon projet"
          ctaHref="/demande/complet?service=financement"
          whatsappMessage="Bonjour Nexus, j aimerais soumettre un projet pour un partenariat."
        />

        {/* POSITIONNEMENT — section cle */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-nexus-orange-600">
                Notre positionnement
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl md:text-5xl">
                Bien plus qu un simple conseiller
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-700 sm:text-xl">
                Contrairement aux solutions classiques, NEXUS RCA ne se limite
                pas a conseiller.
              </p>
            </div>

            {/* 3 points */}
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {POSITIONNEMENT_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.text}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="mt-4 font-semibold text-nexus-blue-950">
                      {point.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-nexus-blue-200 bg-gradient-to-br from-nexus-blue-50 to-white p-8 text-center sm:p-10">
              <p className="text-lg italic text-nexus-blue-950 sm:text-xl">
                Notre approche repose sur une{" "}
                <strong className="text-nexus-orange-600">
                  collaboration directe
                </strong>{" "}
                et un{" "}
                <strong className="text-nexus-orange-600">
                  partage des resultats
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* COMMENT CA FONCTIONNE */}
        <ServiceSection
          variant="muted"
          eyebrow="Comment ca fonctionne"
          title="Un processus clair en 5 etapes"
          description="De la soumission a l accompagnement long terme, chaque etape est transparente."
        >
          <div className="space-y-4">
            {ETAPES.map((etape, idx) => (
              <div
                key={etape.num}
                className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 font-display text-xl font-bold text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
                  {etape.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                    {etape.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {etape.description}
                  </p>
                </div>
                {idx < ETAPES.length - 1 && (
                  <ArrowRight className="hidden h-5 w-5 shrink-0 self-center text-slate-300 sm:block" />
                )}
              </div>
            ))}
          </div>
        </ServiceSection>

        {/* TYPES DE PROJETS */}
        <ServiceSection
          eyebrow="Types de projets"
          title="Les projets que nous accompagnons"
          description="Nous etudions des projets varies, des qu ils sont serieux et structures."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {TYPES_PROJETS.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700 transition group-hover:from-nexus-orange-100 group-hover:to-nexus-orange-50 group-hover:text-nexus-orange-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                    {type.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {type.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ServiceSection>

        {/* CRITERES DE SELECTION */}
        <ServiceSection
          variant="muted"
          eyebrow="Criteres de selection"
          title="Comment nous evaluons un projet"
          description="Chaque projet recu fait l objet d une etude rigoureuse selon ces criteres."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {CRITERES.map((critere) => {
              const Icon = critere.icon;
              return (
                <div
                  key={critere.title}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                      {critere.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {critere.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ServiceSection>

        {/* MESSAGE DIFFERENCIANT */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-nexus-blue-200 bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-8 shadow-2xl sm:p-12">
              {/* Effets de fond */}
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-nexus-orange-500/20 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-nexus-orange-500/10 blur-3xl" />

              <div className="relative text-center">
                <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-xl">
                  <Handshake className="h-7 w-7" />
                </div>

                <p className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">
                  Nous ne sommes pas un simple intermediaire.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-slate-200 sm:text-xl">
                  Nous nous engageons aux cotes des porteurs de projets dans une
                  logique de{" "}
                  <span className="font-semibold text-nexus-orange-300">
                    partenariat
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <ServiceCTA
          title="Vous avez un projet ?"
          subtitle="Soumettez-le. Nous l etudions avec serieux et revenons vers vous avec une reponse claire."
          ctaLabel="Soumettre mon projet"
          ctaHref="/demande/complet?service=financement"
          whatsappMessage="Bonjour Nexus, j aimerais soumettre un projet pour un partenariat."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
