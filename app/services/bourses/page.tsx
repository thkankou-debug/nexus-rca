import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { FileText, Clock, Award } from "lucide-react";

export const metadata = {
  title: "Bourses d'études Canada & admission université | Nexus RCA",
  description:
    "Nexus RCA pilote votre projet d'études au Canada : choix d'université, admission, bourses, CAQ, permis d'études. Accompagnement complet depuis Bangui jusqu'à votre arrivée.",
};

const PRISES_EN_CHARGE = [
  "Évaluation académique de votre profil et définition d'une stratégie réaliste",
  "Identification des universités et programmes alignés à votre parcours et votre budget",
  "Constitution du dossier d'admission (relevés, diplômes, équivalences)",
  "Rédaction ou réécriture de la lettre de motivation et de la lettre d'intention",
  "Demandes d'admission sur les plateformes officielles (OUAC, universités du Québec, etc.)",
  "Recherche active des bourses éligibles (excellence, provinciales, fédérales, universitaires)",
  "Montage du dossier CAQ pour le Québec",
  "Demande de permis d'études auprès d'IRCC",
  "Préparation à l'entretien consulaire si nécessaire",
  "Orientation à l'arrivée : logement, compte bancaire, transports, sécurité sociale étudiante",
];

const ETAPES = [
  {
    title: "Évaluation académique et entretien de projet",
    description:
      "Nous cadrons ensemble votre profil, vos objectifs, votre budget et votre calendrier pour définir une stratégie réaliste et ambitieuse.",
  },
  {
    title: "Sélection de 3 à 6 programmes ciblés",
    description:
      "Nous identifions les universités et programmes réellement adaptés à votre parcours, plutôt que de vous faire postuler partout.",
  },
  {
    title: "Préparation du dossier d'admission",
    description:
      "Relevés, diplômes, équivalences, lettres de motivation et d'intention : chaque pièce est travaillée et cohérente avec le programme visé.",
  },
  {
    title: "Dépôt des candidatures et suivi des réponses",
    description:
      "Nous gérons les dépôts sur les plateformes officielles et suivons chaque retour université par université.",
  },
  {
    title: "Recherche et dépôt des bourses",
    description:
      "Nous identifions les bourses auxquelles vous êtes réellement éligible et montons chaque dossier avec le même soin que l'admission.",
  },
  {
    title: "CAQ, permis d'études, préparation à l'arrivée",
    description:
      "Dossier CAQ pour le Québec, permis d'études IRCC, puis orientation logement, banque, transports avant votre départ.",
  },
];

const FAQ = [
  {
    question: "Est-ce que Nexus garantit l'admission ou la bourse ?",
    answer:
      "Non. Ni l'université, ni les bailleurs de bourses ne sous-traitent leurs décisions. Ce que nous garantissons, c'est une candidature cohérente, bien ciblée, qui respecte les attentes de chaque établissement et de chaque programme de bourses.",
  },
  {
    question: "Quel niveau académique faut-il pour postuler ?",
    answer:
      "Cela varie énormément selon le programme. Certaines formations sont très sélectives, d'autres accessibles avec un bon dossier et une motivation claire. Nous évaluons honnêtement votre profil avant toute démarche.",
  },
  {
    question: "Combien coûtent les études au Canada ?",
    answer:
      "Pour un étudiant international, il faut compter des frais de scolarité variables et environ 20 000 à 25 000 CAD par an pour vivre. Certaines provinces et bourses réduisent fortement la facture. Nous chiffrons précisément votre projet dès le début.",
  },
  {
    question: "Puis-je travailler pendant mes études ?",
    answer:
      "Oui, en général 20 heures par semaine pendant les sessions et temps plein pendant les pauses, sous certaines conditions. Nous vous expliquons les règles exactes selon votre permis.",
  },
  {
    question: "Et après mes études, que se passe-t-il ?",
    answer:
      "Le permis de travail post-diplôme (PTPD) permet souvent de rester travailler au Canada 1 à 3 ans. C'est souvent la porte vers la résidence permanente via Entrée express ou un programme provincial.",
  },
  {
    question: "Vous accompagnez aussi les doctorats ?",
    answer:
      "Oui. Les doctorats demandent une approche différente (recherche d'encadrant, proposition de recherche, financement interne). Nous vous aidons à structurer la démarche.",
  },
  {
    question: "Le niveau de français ou d'anglais est-il toujours demandé ?",
    answer:
      "Oui, presque toujours. TCF Canada ou IELTS selon le programme. Nexus prépare aussi le TCF si nécessaire.",
  },
];

export default function BoursesPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Études au Canada"
          title="Étudier au Canada, avec un dossier qui se défend."
          subtitle="Choix des universités, admission, bourses, CAQ, permis d'études : Nexus RCA vous pilote sur chaque étape, dans le bon ordre."
          image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Étudiants sur un campus universitaire au Canada"
          ctaLabel="Lancer mon projet Canada"
          whatsappMessage="Bonjour Nexus, je souhaite étudier au Canada et j'aimerais être accompagné."
        />

        {/* Introduction */}
        <ServiceSection
          eyebrow="Introduction"
          title="Un projet d'études Canada, c'est une suite de choix stratégiques — pas un seul formulaire."
          description="Partir étudier au Canada ne se joue pas sur un seul document. C'est un enchaînement de dossiers, chacun avec ses règles, ses délais et ses pièges. Nexus RCA vous accompagne depuis le choix de l'université jusqu'à l'obtention du permis d'études, en cherchant toutes les bourses auxquelles vous êtes éligible."
        >
          <div />
        </ServiceSection>

        {/* Ce que Nexus prend en charge */}
        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix interventions concrètes qui font la différence entre un dossier qui dort et un dossier qui passe."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        {/* Pour qui */}
        <ServiceSection
          eyebrow="Profils accompagnés"
          title="Pour qui ce service est conçu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Lycéens",
                text: "Qui visent un bachelor ou un cégep au Canada.",
              },
              {
                title: "Licenciés",
                text: "Qui préparent un master ou un MBA dans une université canadienne.",
              },
              {
                title: "Doctorants",
                text: "À la recherche d'un programme avec encadrement et financement interne.",
              },
              {
                title: "Professionnels",
                text: "Qui souhaitent se reconvertir via une formation canadienne reconnue.",
              },
              {
                title: "Parents",
                text: "Qui préparent sérieusement la suite du parcours de leur enfant.",
              },
              {
                title: "Diaspora",
                text: "Qui soutient un proche en RCA dans son projet d'études à l'étranger.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        {/* Comment ça se passe */}
        <ServiceSection
          variant="muted"
          eyebrow="Méthode"
          title="Comment ça se passe"
          description="Un parcours balisé en six étapes, sur 10 à 14 mois idéalement avant la rentrée visée."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        {/* Documents + Délais (2 colonnes) */}
        <ServiceSection eyebrow="Préparation" title="À prévoir dès le départ">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-50 text-nexus-blue-700">
                  <FileText className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">
                  Documents à préparer
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Diplômes et relevés de notes traduits si besoin, CV académique, lettres de recommandation (nous aidons à les structurer), preuve de niveau de français ou d'anglais, pièce d'identité et passeport, justificatifs financiers, et une idée claire de votre projet d'études et de carrière.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                  <Clock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">
                  Délais indicatifs
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <strong className="text-nexus-blue-950">Dossier d'admission :</strong> 3 à 6 semaines
                </li>
                <li>
                  <strong className="text-nexus-blue-950">Décision d'admission :</strong> 4 à 12 semaines selon l'université
                </li>
                <li>
                  <strong className="text-nexus-blue-950">Demandes de bourses :</strong> calendriers spécifiques (souvent octobre à mars)
                </li>
                <li>
                  <strong className="text-nexus-blue-950">CAQ :</strong> 4 à 8 semaines
                </li>
                <li>
                  <strong className="text-nexus-blue-950">Permis d'études :</strong> 4 à 12 semaines
                </li>
                <li className="pt-2 italic">
                  Commencer 10 à 14 mois avant la rentrée visée est idéal.
                </li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        {/* Pourquoi Nexus */}
        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Nous pilotons tout le parcours, pas juste une étape."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                title: "Vision complète",
                text: "Nous gérons l'ensemble du parcours — de la sélection d'université jusqu'à votre arrivée effective au Canada.",
              },
              {
                title: "Bourses ciblées",
                text: "Nous identifions les bourses auxquelles vous êtes réellement éligible plutôt que de vous faire postuler partout.",
              },
              {
                title: "Spécificités québécoises",
                text: "Nous connaissons les subtilités du CAQ, du cégep et du MELS, ainsi que les différences avec l'Ontario ou la Colombie-Britannique.",
              },
              {
                title: "Suivi jusqu'à l'arrivée",
                text: "Nous ne vous lâchons pas une fois le permis obtenu : logement, banque, transports, premiers pas sur place.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </ServiceSection>

        {/* FAQ */}
        <ServiceSection
          eyebrow="Questions fréquentes"
          title="Les réponses aux questions qu'on nous pose souvent"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>

        {/* CTA final */}
        <ServiceCTA
          title="Lancez votre projet d'études Canada dès aujourd'hui."
          subtitle="Évaluation de profil offerte. Un conseiller Nexus RCA revient vers vous sous 48h avec une stratégie claire."
          ctaLabel="Démarrer mon dossier Canada"
          whatsappMessage="Bonjour Nexus, je souhaite démarrer mon projet d'études au Canada."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}