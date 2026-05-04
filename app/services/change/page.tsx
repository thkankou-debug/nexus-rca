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
import { FileText, Clock, Coins } from "lucide-react";

export const metadata = {
  title: "Change de devises à Bangui | Nexus RCA",
  description:
    "Change manuel de devises à Bangui (EUR, USD, CAD, GBP, FCFA). Taux compétitifs réévalués plusieurs fois par jour, transactions rapides, agence Relais Sica.",
};

const PRISES_EN_CHARGE = [
  "Change manuel euros, dollars US, dollars canadiens, livres sterling",
  "Change FCFA vers devises étrangères pour vos voyages",
  "Change devises étrangères vers FCFA à votre arrivée",
  "Taux compétitifs réévalués plusieurs fois par jour",
  "Transactions en espèces sans frais cachés",
  "Devis immédiat avant toute transaction",
  "Service discret pour gros montants sur rendez-vous",
  "Conseil sur le timing optimal selon les tendances",
  "Accueil en agence à Bangui — Relais Sica",
  "Remise d'un reçu détaillé pour chaque transaction",
];

const ETAPES = [
  {
    title: "Contact initial",
    description:
      "Par WhatsApp, téléphone ou en agence, vous indiquez le montant et les devises souhaitées.",
  },
  {
    title: "Devis instantané",
    description:
      "Nous communiquons le taux appliqué et le montant exact, sans surprise.",
  },
  {
    title: "Rendez-vous en agence",
    description:
      "Vous passez à l'agence de Bangui. Pour les gros montants, un rendez-vous est conseillé.",
  },
  {
    title: "Transaction sécurisée",
    description:
      "Échange en espèces, comptage vérifié des deux côtés, remise du reçu.",
  },
  {
    title: "Suivi et relation",
    description:
      "Nous gardons votre contact pour vous alerter sur les évolutions de taux.",
  },
];

const PROFILS = [
  {
    title: "Voyageurs",
    text: "Qui partent à l'étranger et convertissent leurs FCFA en devises.",
  },
  {
    title: "Arrivants",
    text: "Qui reviennent ou arrivent en RCA avec des devises à convertir.",
  },
  {
    title: "Entrepreneurs",
    text: "Qui paient des fournisseurs dans des devises étrangères.",
  },
  {
    title: "Diaspora",
    text: "Qui soutient ses proches à Bangui avec des envois en devises.",
  },
  {
    title: "Étudiants",
    text: "Qui préparent leur départ ou leur retour de l'étranger.",
  },
  {
    title: "Professionnels en mission",
    text: "En passage à Bangui qui ont besoin de changer rapidement.",
  },
];

const POURQUOI = [
  {
    title: "Taux réels",
    text: "Nos taux sont actualisés en temps réel selon le marché. Pas de marge abusive.",
  },
  {
    title: "Zéro frais caché",
    text: "Le taux annoncé est le taux appliqué. Point final.",
  },
  {
    title: "Sécurité",
    text: "Transactions en agence, comptage vérifié, reçu systématique.",
  },
  {
    title: "Discrétion",
    text: "Service discret pour les gros montants, sur rendez-vous.",
  },
];

const FAQ = [
  {
    question: "Quelles devises changez-vous ?",
    answer:
      "Euros, dollars américains, dollars canadiens, livres sterling et FCFA. Pour d'autres devises, contactez-nous.",
  },
  {
    question: "Vos taux sont-ils meilleurs qu'en banque ?",
    answer:
      "Généralement oui, surtout pour les montants moyens et élevés. Nous actualisons nos taux en temps réel.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer:
      "Non. Le taux annoncé est le taux appliqué. Aucun frais additionnel, aucune commission cachée.",
  },
  {
    question: "Quel est le montant minimum ?",
    answer:
      "Nous traitons aussi bien de petits que de gros montants. Pour les très gros montants, un rendez-vous est conseillé.",
  },
  {
    question: "Le service est-il sécurisé ?",
    answer:
      "Oui. Transactions en agence, comptage vérifié par les deux parties, reçu remis systématiquement.",
  },
  {
    question: "Faut-il une pièce d'identité ?",
    answer:
      "Pour les gros montants, oui. Pour les petites transactions courantes, ce n'est généralement pas requis.",
  },
];

export default function ChangePage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Change de devises"
          title="Un change simple, transparent, au meilleur taux."
          subtitle="Euros, dollars US, dollars canadiens, livres sterling, FCFA. Nexus RCA échange vos devises en agence à Bangui, sans frais cachés."
          image="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Billets de banque de différentes devises"
          ctaLabel="Obtenir un devis de change"
          whatsappMessage="Bonjour Nexus, je souhaite effectuer une opération de change."
        />

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix engagements concrets pour un service de change fiable."
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
          description="Cinq étapes simples."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Informations pratiques"
          title="À savoir avant de venir"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <InfoBlock icon={FileText} accent="blue" title="À préparer">
              <p>
                Le montant exact à changer, la devise de départ, la devise
                d'arrivée, une pièce d'identité pour les gros montants, et
                votre numéro WhatsApp pour un devis préalable.
              </p>
            </InfoBlock>

            <InfoBlock icon={Clock} accent="orange" title="Délais et horaires">
              <ul className="space-y-2">
                <li>
                  <strong className="text-ink">Transaction courante :</strong>{" "}
                  10 à 15 minutes
                </li>
                <li>
                  <strong className="text-ink">Gros montants :</strong>{" "}
                  rendez-vous recommandé
                </li>
                <li>
                  <strong className="text-ink">Devis WhatsApp :</strong> sous
                  30 minutes
                </li>
                <li>
                  <strong className="text-ink">Agence :</strong> Relais Sica,
                  Bangui
                </li>
              </ul>
            </InfoBlock>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Taux compétitifs, transparence totale, accueil soigné."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {POURQUOI.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Coins className="h-5 w-5" />
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
          title="Les réponses aux questions fréquentes"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>

        <ServiceCTA
          title="Demandez votre devis de change en quelques minutes."
          subtitle="Un conseiller Nexus RCA répond sur WhatsApp avec le taux du jour et le montant exact."
          ctaLabel="Obtenir un devis"
          whatsappMessage="Bonjour Nexus, je souhaite un devis de change."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
