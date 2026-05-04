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
import { FileText, Clock, Send } from "lucide-react";

export const metadata = {
  title: "Transfert d'argent international | Nexus RCA — Bangui",
  description:
    "Envoi et réception d'argent entre la RCA et le reste du monde. Western Union, MoneyGram, mobile money, virements bancaires. Frais transparents, suivi jusqu'à la réception.",
};

const PRISES_EN_CHARGE = [
  "Envoi d'argent depuis la RCA vers l'étranger",
  "Réception d'argent depuis l'étranger vers la RCA",
  "Transferts entre particuliers pour soutien familial",
  "Transferts business pour paiements fournisseurs ou clients",
  "Conversion de devise intégrée au transfert",
  "Devis clair avant toute opération",
  "Frais transparents affichés d'avance",
  "Assistance pour les gros transferts",
  "Conseil sur le meilleur canal selon destination et montant",
  "Suivi jusqu'à la réception confirmée par le bénéficiaire",
];

const ETAPES = [
  {
    title: "Vous exprimez votre besoin",
    description:
      "Montant, devise, destination, bénéficiaire. Par WhatsApp ou en agence.",
  },
  {
    title: "Devis et conseil canal",
    description:
      "Nous vous proposons le meilleur canal (Western Union, MoneyGram, mobile money, réseau bancaire) selon votre cas.",
  },
  {
    title: "Préparation du transfert",
    description:
      "Collecte des informations nécessaires, vérification des coordonnées du bénéficiaire.",
  },
  {
    title: "Exécution",
    description:
      "Transfert effectué en agence, avec remise du reçu et des références pour le suivi.",
  },
  {
    title: "Confirmation de réception",
    description:
      "Nous vous confirmons la bonne réception par le bénéficiaire et restons disponibles en cas de problème.",
  },
];

const PROFILS = [
  {
    title: "Familles",
    text: "Qui envoient ou reçoivent un soutien financier entre Bangui et l'étranger.",
  },
  {
    title: "Diaspora",
    text: "Qui soutient ses proches en RCA depuis l'étranger.",
  },
  {
    title: "Étudiants",
    text: "Qui reçoivent leur budget mensuel depuis leur famille.",
  },
  {
    title: "Entrepreneurs",
    text: "Qui paient des fournisseurs internationaux ou reçoivent des clients.",
  },
  {
    title: "Voyageurs",
    text: "Qui ont besoin de fonds à l'étranger ou à leur retour.",
  },
  {
    title: "ONG et associations",
    text: "Qui gèrent des flux entre bailleurs internationaux et équipes locales.",
  },
];

const POURQUOI = [
  {
    title: "Conseil sur le canal",
    text: "Nous choisissons le canal le plus rapide et le moins cher selon votre situation.",
  },
  {
    title: "Transparence totale",
    text: "Frais annoncés avant toute opération. Aucune surprise, aucune marge cachée.",
  },
  {
    title: "Suivi jusqu'à réception",
    text: "Nous ne clôturons pas avant la confirmation de réception par le bénéficiaire.",
  },
  {
    title: "Réactivité sur incidents",
    text: "En cas de blocage ou de retard, nous intervenons immédiatement auprès de l'opérateur.",
  },
];

const FAQ = [
  {
    question: "Quels canaux utilisez-vous ?",
    answer:
      "Western Union, MoneyGram, mobile money, virements bancaires. Nous choisissons selon la destination, le montant et l'urgence.",
  },
  {
    question: "Combien coûtent les frais ?",
    answer:
      "Les frais dépendent du canal, du montant et de la destination. Un devis clair vous est remis avant toute opération. Aucun frais caché.",
  },
  {
    question: "Est-ce plus cher qu'un envoi direct ?",
    answer:
      "Non. Nous vous faisons bénéficier des mêmes tarifs opérateurs, avec en plus le conseil sur le meilleur canal et le suivi jusqu'à la réception.",
  },
  {
    question: "Combien de temps pour recevoir l'argent ?",
    answer:
      "Pour les transferts rapides, quelques minutes à quelques heures. Pour les virements bancaires, 1 à 3 jours ouvrés. Le délai est annoncé avant le transfert.",
  },
  {
    question: "Y a-t-il un plafond ?",
    answer:
      "Les plafonds varient selon les canaux et les réglementations. Pour les gros transferts, nous fractionnons ou combinons plusieurs canaux si nécessaire.",
  },
  {
    question:
      "Que se passe-t-il si le bénéficiaire ne reçoit pas l'argent ?",
    answer:
      "Nous disposons des références de traçabilité et intervenons immédiatement auprès de l'opérateur pour résoudre le problème.",
  },
  {
    question: "Acceptez-vous les paiements en espèces ?",
    answer:
      "Oui. Espèces en FCFA ou en devises, selon l'opération. Le mode de paiement est validé au devis.",
  },
];

export default function TransfertPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Transfert d'argent"
          title="Envoyez et recevez de l'argent, en toute confiance."
          subtitle="Entre la RCA et le reste du monde, Nexus RCA gère vos transferts avec rapidité, transparence et un suivi jusqu'à la réception confirmée."
          image="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Transaction financière sur smartphone"
          ctaLabel="Demander un transfert"
          whatsappMessage="Bonjour Nexus, je souhaite effectuer un transfert d'argent."
        />

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix engagements concrets pour des transferts fiables, rapides et transparents."
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
          description="Cinq étapes claires, du besoin à la confirmation de réception."
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
                Nom complet exact du bénéficiaire tel qu'il apparaît sur sa
                pièce d'identité, pays et ville de réception, numéro de
                téléphone du bénéficiaire, montant et devise, pièce d'identité
                de l'expéditeur.
              </p>
            </InfoBlock>

            <InfoBlock icon={Clock} accent="orange" title="Délais indicatifs">
              <ul className="space-y-2">
                <li>
                  <strong className="text-ink">Transfert rapide :</strong>{" "}
                  quelques minutes à quelques heures
                </li>
                <li>
                  <strong className="text-ink">Mobile money :</strong>{" "}
                  instantané à 30 minutes
                </li>
                <li>
                  <strong className="text-ink">Virement bancaire :</strong> 1 à
                  3 jours ouvrés
                </li>
                <li>
                  <strong className="text-ink">Gros transferts :</strong> délai
                  selon canal
                </li>
              </ul>
            </InfoBlock>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Un interlocuteur de confiance, pas juste un guichet."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {POURQUOI.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Send className="h-5 w-5" />
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
          title="Demandez un devis de transfert en quelques minutes."
          subtitle="Un conseiller Nexus RCA répond sur WhatsApp avec les frais et le délai selon votre destination."
          ctaLabel="Demander un transfert"
          whatsappMessage="Bonjour Nexus, je souhaite effectuer un transfert d'argent."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
