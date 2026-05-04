import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { ProfilGrid } from "@/components/services/ProfilGrid";
import { InfoBlock } from "@/components/services/InfoBlock";
import { FileText, Clock, Target } from "lucide-react";

export const metadata = {
  title: "Préparation TCF Canada | Nexus RCA — Bangui",
  description:
    "Préparation complète au TCF Canada à Bangui : cours, simulations, coaching oral et inscription au centre agréé. Nexus RCA vous entraîne sur les quatre épreuves.",
};

const PRISES_EN_CHARGE = [
  "Évaluation initiale de votre niveau (test de positionnement)",
  "Définition du score cible selon votre programme d'immigration",
  "Cours intensifs ou réguliers, en groupe ou individuel",
  "Travail spécifique sur les quatre épreuves du TCF",
  "Simulations complètes dans les conditions réelles du test",
  "Coaching personnalisé en expression orale (point faible le plus fréquent)",
  "Méthodologie : gestion du temps, stratégies par question, pièges à éviter",
  "Supports numériques illimités (exercices, audios, corrigés)",
  "Inscription officielle au centre de test agréé",
  "Bilan final et recommandations avant le jour J",
];

const ETAPES = [
  {
    title: "Test de positionnement",
    description:
      "Nous mesurons votre niveau actuel sur les quatre compétences pour construire un plan adapté à vos points faibles.",
  },
  {
    title: "Définition du score cible",
    description:
      "Nous définissons ensemble le score à viser selon votre projet (Entrée express, programme provincial, admission universitaire).",
  },
  {
    title: "Plan d'entraînement personnalisé",
    description:
      "Durée, fréquence, format (groupe ou individuel, présentiel ou à distance) : tout est calé sur votre disponibilité.",
  },
  {
    title: "Cours et travail par épreuve",
    description:
      "Compréhension orale, compréhension écrite, expression écrite, expression orale : chaque compétence est travaillée avec les bonnes stratégies.",
  },
  {
    title: "Simulations régulières",
    description:
      "Tests blancs dans les conditions réelles. Corrections détaillées pour progresser vite.",
  },
  {
    title: "Inscription officielle et passage",
    description:
      "Nous gérons l'inscription administrative et vous briefons avant le jour du test.",
  },
];

const PROFILS = [
  {
    title: "Candidats Entrée express",
    text: "Qui veulent maximiser leurs points liés au français dans leur demande d'immigration.",
  },
  {
    title: "Candidats provinciaux",
    text: "PEQ Québec, Nouveau-Brunswick et autres programmes qui exigent une preuve linguistique.",
  },
  {
    title: "Étudiants",
    text: "Qui doivent justifier leur niveau pour une admission universitaire au Canada francophone.",
  },
  {
    title: "Travailleurs",
    text: "Qui visent un permis de travail via la Mobilité francophone.",
  },
  {
    title: "Regroupement familial",
    text: "Qui veulent consolider un dossier de regroupement par un score officiel.",
  },
  {
    title: "Francophones exigeants",
    text: "Qui parlent déjà bien mais veulent viser un score élevé (B2 ou C1).",
  },
];

const POURQUOI = [
  {
    title: "Grille d'évaluation maîtrisée",
    text: "Nos coachs connaissent la grille d'évaluation exacte du TCF, pas seulement la langue française.",
  },
  {
    title: "Simulations réalistes",
    text: "Nos tests blancs sont au plus près de l'examen : format, durée, type de consignes, système de notation.",
  },
  {
    title: "Focus expression orale",
    text: "C'est le point faible le plus fréquent. Nous y consacrons un coaching individuel sérieux.",
  },
  {
    title: "Progression mesurée",
    text: "Beaucoup de nos candidats gagnent un niveau complet entre le test blanc d'entrée et le test officiel.",
  },
];

const FAQ = [
  {
    question: "Quel score viser pour Entrée express ?",
    answer:
      "Cela dépend du programme et du profil global. Un NCLC 7 (B2) est souvent un seuil pertinent pour maximiser les points liés à la langue. Nous définissons votre score cible ensemble après le test de positionnement.",
  },
  {
    question: "Je parle déjà bien français, ai-je besoin d'une préparation ?",
    answer:
      "Oui, vivement. Parler couramment et bien performer au TCF sont deux choses différentes. Le test a son format, son chronométrage, ses pièges. Sans entraînement ciblé, beaucoup de bons francophones perdent des points évitables.",
  },
  {
    question: "Quelle est la différence entre TCF Canada et TEF Canada ?",
    answer:
      "Les deux sont acceptés par IRCC. Le TCF Canada est souvent plus accessible et mieux structuré pour les francophones d'Afrique centrale. Nous vous orientons au cas par cas.",
  },
  {
    question: "Combien coûte la préparation ?",
    answer:
      "Le tarif dépend du format (groupe ou individuel) et de la durée. Un devis précis vous est donné après le test de positionnement. Les frais d'inscription officielle au test sont en supplément.",
  },
  {
    question: "Où passe-t-on le test ?",
    answer:
      "L'inscription se fait via un centre agréé. Nexus gère l'inscription administrative et vous confirme la date et le lieu.",
  },
  {
    question: "Peut-on repasser le test si le score n'est pas suffisant ?",
    answer:
      "Oui, après un délai minimum. Si cela arrive, Nexus reprend avec vous l'analyse et cible les compétences à renforcer pour la session suivante.",
  },
  {
    question: "Les cours sont-ils en présentiel ou à distance ?",
    answer:
      "Les deux formats sont possibles. Nous adaptons à votre emploi du temps et à votre localisation.",
  },
];

export default function TcfPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="TCF Canada"
          title="Le TCF Canada, préparé sérieusement. Pas appris par cœur."
          subtitle="Compréhension orale, expression orale, compréhension écrite, expression écrite : Nexus vous entraîne aux quatre épreuves dans les conditions réelles, avec des coachs qui connaissent le test."
          image="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Livres et stylos pour une préparation au test de français"
          ctaLabel="Faire mon test de positionnement"
          whatsappMessage="Bonjour Nexus, je souhaite préparer le TCF Canada."
        />

        <ServiceSection
          eyebrow="Introduction"
          title="Un bon score au TCF change concrètement le poids de votre dossier d'immigration."
          description="Le TCF Canada est reconnu par IRCC pour toutes les démarches d'immigration francophone. Obtenir le bon niveau peut faire basculer une demande. Nexus RCA vous prépare avec méthode, simulations et coaching individuel pour viser le score qui fait la différence."
        >
          <div />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix interventions concrètes pour vous faire gagner des points sur chaque épreuve."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Profils accompagnés"
          title="Pour qui ce service est conçu"
        >
          <ProfilGrid items={PROFILS} />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Méthode"
          title="Comment ça se passe"
          description="Un parcours balisé en six étapes, adapté à votre niveau de départ et votre calendrier."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        <ServiceSection eyebrow="Préparation" title="À prévoir dès le départ">
          <div className="grid gap-6 lg:grid-cols-2">
            <InfoBlock icon={FileText} accent="blue" title="À préparer">
              <p>
                Pièce d'identité en cours de validité, passeport si disponible,
                e-mail actif pour la plateforme d'entraînement, et une
                disponibilité régulière. L'irrégularité est le premier obstacle
                au progrès : mieux vaut 3 sessions par semaine tenues que 6
                sessions espacées.
              </p>
            </InfoBlock>

            <InfoBlock icon={Clock} accent="orange" title="Délais indicatifs">
              <ul className="space-y-2">
                <li>
                  <strong className="text-ink">Préparation intensive :</strong>{" "}
                  4 semaines
                </li>
                <li>
                  <strong className="text-ink">Préparation standard :</strong>{" "}
                  8 à 10 semaines
                </li>
                <li>
                  <strong className="text-ink">Préparation longue :</strong> 3
                  à 4 mois pour viser B2 ou C1
                </li>
                <li>
                  <strong className="text-ink">Inscription au test :</strong> 4
                  à 6 semaines avant la date
                </li>
                <li className="pt-2 italic">
                  Plus tôt vous commencez, meilleur sera le score.
                </li>
              </ul>
            </InfoBlock>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Nous travaillons le score, pas juste la conversation."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {POURQUOI.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display text-headline text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-body-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection
          eyebrow="Questions fréquentes"
          title="Les réponses aux questions qu'on nous pose souvent"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>

        <ServiceCTA
          title="Réservez votre test de positionnement gratuit et construisons votre plan TCF."
          subtitle="Un coach Nexus RCA revient vers vous sous 48 h avec un diagnostic clair et un plan précis."
          ctaLabel="Faire mon test de positionnement"
          whatsappMessage="Bonjour Nexus, je souhaite faire un test de positionnement TCF."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
