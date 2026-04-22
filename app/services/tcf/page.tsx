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
import { FileText, Clock, Target } from "lucide-react";

export const metadata = {
  title: "Preparation TCF Canada | Nexus RCA Bangui",
  description:
    "Preparation complete au TCF Canada : cours, simulations, coaching oral et inscription. Nexus RCA vous entraine sur les quatre epreuves pour viser le score cible.",
};

const PRISES_EN_CHARGE = [
  "Evaluation initiale de votre niveau (test de positionnement)",
  "Definition du score cible selon votre programme d immigration",
  "Cours intensifs ou reguliers, en groupe ou individuel",
  "Travail specifique sur les quatre epreuves du TCF",
  "Simulations completes dans les conditions reelles du test",
  "Coaching personnalise en expression orale (point faible le plus frequent)",
  "Methodologie : gestion du temps, strategies par question, pieges a eviter",
  "Supports numeriques illimites (exercices, audios, corriges)",
  "Inscription officielle au centre de test agree",
  "Bilan final et recommandations avant le jour J",
];

const ETAPES = [
  {
    title: "Test de positionnement",
    description:
      "Nous mesurons votre niveau actuel sur les quatre competences pour construire un plan adapte a vos points faibles.",
  },
  {
    title: "Definition du score cible",
    description:
      "Nous definissons ensemble le score a viser en fonction de votre projet (Entree express, programme provincial, admission universitaire).",
  },
  {
    title: "Plan d entrainement personnalise",
    description:
      "Duree, frequence, format (groupe ou individuel, presentiel ou distance) : tout est cale sur votre disponibilite.",
  },
  {
    title: "Cours et travail par epreuve",
    description:
      "Comprehension orale, comprehension ecrite, expression ecrite, expression orale : chaque competence est travaillee avec les bonnes strategies.",
  },
  {
    title: "Simulations regulieres",
    description:
      "Tests blancs dans les conditions reelles. Corrections detaillees pour progresser vite.",
  },
  {
    title: "Inscription officielle et passage",
    description:
      "Nous gerons l inscription administrative et vous briefons avant le jour du test.",
  },
];

const FAQ = [
  {
    question: "Quel score dois-je viser pour Entree express ?",
    answer:
      "Cela depend du programme et du profil global. Un NCLC 7 (B2) est souvent un seuil pertinent pour maximiser les points lies a la langue. Nous definissons votre score cible ensemble apres le test de positionnement.",
  },
  {
    question: "Je parle deja bien francais, ai-je besoin d une preparation ?",
    answer:
      "Oui, vivement. Parler couramment et bien performer au TCF sont deux choses differentes. Le test a son format, son chronometrage, ses pieges. Sans entrainement cible, beaucoup de bons francophones perdent des points evitables.",
  },
  {
    question: "Quelle est la difference entre TCF Canada et TEF Canada ?",
    answer:
      "Les deux sont acceptes par IRCC. Le TCF Canada est souvent plus accessible et mieux structure pour les francophones d Afrique centrale. Nous vous orientons au cas par cas.",
  },
  {
    question: "Combien coute la preparation ?",
    answer:
      "Le tarif depend du format (groupe ou individuel) et de la duree. Un devis precis vous est donne apres le test de positionnement. Les frais d inscription officielle au test sont en supplement.",
  },
  {
    question: "Ou passe-t-on le test ?",
    answer:
      "L inscription se fait via un centre agree. Nexus gere l inscription administrative et vous confirme la date et le lieu.",
  },
  {
    question: "Peut-on repasser le test si le score n est pas suffisant ?",
    answer:
      "Oui, apres un delai minimum. Si cela arrive, Nexus reprend avec vous l analyse et cible les competences a renforcer pour la session suivante.",
  },
  {
    question: "Les cours sont-ils en presentiel ou a distance ?",
    answer:
      "Les deux formats sont possibles. Nous adaptons a votre emploi du temps et a votre localisation.",
  },
];

export default function TcfPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="TCF Canada"
          title="Le TCF Canada, prepare serieusement. Pas appris par coeur."
          subtitle="Comprehension orale, expression orale, comprehension ecrite, expression ecrite : Nexus vous entraine aux quatre epreuves dans les conditions reelles, avec des coachs qui connaissent le test."
          image="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Livres et stylos pour une preparation au test de francais"
          ctaLabel="Faire mon test de positionnement"
          whatsappMessage="Bonjour Nexus, je souhaite preparer le TCF Canada."
        />

        <ServiceSection
          eyebrow="Introduction"
          title="Un bon score au TCF change concretement le poids de votre dossier d immigration."
          description="Le TCF Canada est reconnu par IRCC pour toutes les demarches d immigration francophone. Obtenir le bon niveau peut faire basculer une demande. Nexus RCA vous prepare avec methode, simulations et coaching individuel pour viser le score qui fait la difference."
        >
          <div />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix interventions concretes pour vous faire gagner des points sur chaque epreuve."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Profils accompagnes"
          title="Pour qui ce service est concu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Candidats Entree express", text: "Qui veulent maximiser leurs points liés au francais dans leur demande d immigration." },
              { title: "Candidats provinciaux", text: "PEQ Quebec, Nouveau-Brunswick, et autres programmes qui exigent une preuve linguistique." },
              { title: "Etudiants", text: "Qui doivent justifier leur niveau pour une admission universitaire au Canada francophone." },
              { title: "Travailleurs", text: "Qui visent un permis de travail via la Mobilite francophone." },
              { title: "Regroupement familial", text: "Qui veulent consolider un dossier de regroupement par un score officiel." },
              { title: "Francophones exigeants", text: "Qui parlent deja bien mais veulent viser un score eleve (B2 ou C1)." },
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
          description="Un parcours balise en six etapes, adapte a votre niveau de depart et votre calendrier."
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
                Piece d identite en cours de validite, passeport si disponible, email actif pour la plateforme d entrainement, et une disponibilite reguliere. L irregularite est le premier obstacle au progres : mieux vaut 3 sessions par semaine tenues que 6 sessions espacees.
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
                <li><strong className="text-nexus-blue-950">Preparation intensive :</strong> 4 semaines</li>
                <li><strong className="text-nexus-blue-950">Preparation standard :</strong> 8 a 10 semaines</li>
                <li><strong className="text-nexus-blue-950">Preparation longue :</strong> 3 a 4 mois pour viser B2 ou C1</li>
                <li><strong className="text-nexus-blue-950">Inscription au test :</strong> 4 a 6 semaines avant la date</li>
                <li className="pt-2 italic">Plus tot vous commencez, meilleur sera le score.</li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Nous travaillons le score, pas juste la conversation."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Grille d evaluation maitrisee", text: "Nos coachs connaissent la grille d evaluation exacte du TCF, pas seulement la langue francaise." },
              { title: "Simulations realistes", text: "Nos tests blancs sont les plus proches possibles de l examen reel : format, duree, type de consignes, systeme de notation." },
              { title: "Focus expression orale", text: "C est le point faible le plus frequent. Nous y consacrons un coaching individuel serieux." },
              { title: "Progression mesuree", text: "Beaucoup de nos candidats gagnent un niveau complet entre le test blanc d entree et le test officiel." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Target className="h-5 w-5" />
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
          title="Reservez votre test de positionnement gratuit et construisons votre plan TCF."
          subtitle="Un coach Nexus RCA revient vers vous sous 48h avec un diagnostic clair et un plan precis."
          ctaLabel="Faire mon test de positionnement"
          whatsappMessage="Bonjour Nexus, je souhaite faire un test de positionnement TCF."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}