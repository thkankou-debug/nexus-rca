import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { FileText, Clock, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Financement business & partenariat | Nexus RCA Bangui",
  description:
    "Nexus RCA accompagne entrepreneurs et PME en Centrafrique pour structurer leur projet, monter des dossiers bancaires et rencontrer les bons investisseurs.",
};

const PRISES_EN_CHARGE = [
  "Diagnostic du projet et evaluation de sa maturite (idee, prototype, lancement, croissance)",
  "Etude de faisabilite technique, commerciale et financiere",
  "Redaction du business plan complet avec previsionnel 3 a 5 ans",
  "Modelisation financiere (compte de resultat, plan de tresorerie, seuil de rentabilite)",
  "Structuration juridique de l entreprise ou de la levee",
  "Montage du dossier bancaire pour pret professionnel ou ligne de credit",
  "Preparation du pitch investisseurs (deck, executive summary, video si pertinent)",
  "Mise en relation ciblee avec investisseurs, banques partenaires, fonds et bailleurs",
  "Accompagnement dans les negociations et la signature",
  "Suivi post-financement : reporting, gouvernance, structuration des premieres etapes",
];

const ETAPES = [
  {
    title: "Premier rendez-vous gratuit de 30 minutes",
    description:
      "Nous ecoutons votre projet, votre ambition et votre besoin reel de financement.",
  },
  {
    title: "Audit du projet",
    description:
      "Analyse des forces, faiblesses, opportunites, risques, et evaluation du besoin en financement.",
  },
  {
    title: "Construction du dossier",
    description:
      "Business plan, previsionnel, deck, documents juridiques : tout est travaille pour etre bancable.",
  },
  {
    title: "Ciblage des interlocuteurs",
    description:
      "Nous identifions les banques, fonds et bailleurs les plus pertinents pour votre secteur et votre montant.",
  },
  {
    title: "Coaching avant chaque rendez-vous",
    description:
      "Simulation de pitch, questions types, objections, gestion des chiffres : vous arrivez prepare.",
  },
  {
    title: "Suivi jusqu au decaissement",
    description:
      "Nous vous accompagnons jusqu a la signature, puis mettons en place le reporting et la gouvernance post-financement.",
  },
];

const FAQ = [
  {
    question: "Est-ce que Nexus garantit d obtenir un financement ?",
    answer:
      "Non, aucun cabinet serieux ne peut garantir une decision d investisseur ou de banque. En revanche, nous maximisons vos chances en structurant un dossier solide, en ciblant les bons interlocuteurs et en vous preparant aux entretiens.",
  },
  {
    question: "Combien coute l accompagnement ?",
    answer:
      "Les tarifs dependent de la complexite du projet et du montant recherche. Un devis personnalise vous est remis apres le premier rendez-vous. Nous proposons aussi, sur certains dossiers, une partie de remuneration au succes.",
  },
  {
    question: "Je n ai que l idee, pas de business plan. Vous pouvez quand meme m aider ?",
    answer:
      "Oui. C est meme la que notre accompagnement a le plus d impact. Nous partons de votre intuition et la transformons en un dossier structure.",
  },
  {
    question: "Est-ce que vous travaillez avec la diaspora ?",
    answer:
      "Oui. Nous accompagnons regulierement des porteurs de projet bases au Canada, en France, aux Etats-Unis ou ailleurs, qui veulent investir en RCA sans y etre physiquement.",
  },
  {
    question: "Quels secteurs sont les plus finances en ce moment ?",
    answer:
      "L agro-alimentaire, les services numeriques, l energie decentralisee, la sante et la logistique attirent particulierement les investisseurs panafricains et les bailleurs internationaux.",
  },
  {
    question: "Vous prenez tous les projets ?",
    answer:
      "Non. Apres le premier rendez-vous, nous vous disons honnetement si votre projet est pret, s il faut le retravailler, ou s il vaut mieux attendre. Notre credibilite depend de la qualite des dossiers que nous presentons.",
  },
];

export default function FinancementPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Financement et partenariat"
          title="Financez votre projet, trouvez les bons partenaires."
          subtitle="De l idee au decaissement : Nexus RCA structure votre dossier, ouvre les bonnes portes et vous tient la main jusqu au financement."
          image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Analyse de donnees financieres sur un ordinateur portable"
          ctaLabel="Ouvrir mon dossier de financement"
          whatsappMessage="Bonjour Nexus, je souhaite preparer un dossier de financement."
        />

        <ServiceSection
          eyebrow="Introduction"
          title="Monter un projet solide demande plus qu une bonne idee. Il faut un dossier bancable."
          description="Nexus RCA accompagne entrepreneurs, PME et porteurs de projet dans la structuration financiere, la recherche de capitaux et la mise en relation avec des partenaires serieux, locaux comme internationaux."
        >
          <div />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix interventions concretes pour passer de l intuition au dossier structure, puis au decaissement."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Profils accompagnes"
          title="Pour qui ce service est concu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Entrepreneurs centrafricains", text: "Qui veulent lancer ou developper leur activite avec un cadre solide." },
              { title: "PME locales", text: "Qui cherchent a se moderniser, se structurer ou a exporter." },
              { title: "Porteurs de projet", text: "Agriculture, tech, commerce, services, energie, sante, education." },
              { title: "Diaspora investisseuse", text: "Qui veut investir en RCA avec un partenaire de confiance sur le terrain." },
              { title: "Associations et ONG", text: "A la recherche de subventions ou de bailleurs internationaux." },
              { title: "Structures a impact", text: "Dont le projet a besoin d etre chiffre et presente dans les regles." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Methode"
          title="Comment ca se passe"
          description="Un parcours balise en six etapes, du premier rendez-vous au decaissement."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        <ServiceSection eyebrow="Preparation" title="A prevoir des le depart">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-50 text-nexus-blue-700">
                  <FileText className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">A preparer</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Presentation du projet meme brouillonne, piece d identite, registre de commerce si la societe existe, etats financiers des deux dernieres annees si disponibles, CV du porteur et de l equipe, devis fournisseurs, lettres d intention clients, et tout document prouvant la traction (ventes, contrats, partenariats).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                  <Clock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">Delais indicatifs</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-nexus-blue-950">Business plan complet :</strong> 2 a 4 semaines</li>
                <li><strong className="text-nexus-blue-950">Dossier bancaire :</strong> 3 a 6 semaines</li>
                <li><strong className="text-nexus-blue-950">Recherche d investisseurs :</strong> 2 a 6 mois</li>
                <li><strong className="text-nexus-blue-950">Subventions internationales :</strong> 4 a 9 mois</li>
                <li className="pt-2 italic">Plus le dossier est solide en amont, plus la recherche avance vite.</li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Nous structurons des dossiers qui passent, pas des dossiers qui dorment."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Connaissance des financeurs", text: "Nous connaissons les attentes reelles des banques et investisseurs qui financent l Afrique centrale." },
              { title: "Reseau actif", text: "Institutions financieres locales, fonds panafricains, diaspora investisseuse, bailleurs internationaux." },
              { title: "Preparation serieuse", text: "Vous ne partez jamais seul en rendez-vous. Coaching, simulation, gestion des questions difficiles." },
              { title: "Suivi post-signature", text: "Nous restons a vos cotes apres la signature, pour que les premiers mois ne coulent pas le projet." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection
          eyebrow="Questions frequentes"
          title="Les reponses aux questions qu on nous pose souvent"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>

        <ServiceCTA
          title="Ouvrez votre dossier de financement maintenant."
          subtitle="Premier rendez-vous gratuit. Devis sous 48h. Un conseiller Nexus RCA revient vers vous avec un plan clair."
          ctaLabel="Ouvrir mon dossier de financement"
          whatsappMessage="Bonjour Nexus, je souhaite discuter d un projet a financer."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}