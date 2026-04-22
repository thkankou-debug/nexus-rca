import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { FileText, Clock, Plane, Hotel, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Billets et hotels | Nexus RCA",
  description: "Reservation de vols et hotels au meilleur tarif. Nexus RCA Bangui.",
};

const PRISES_EN_CHARGE = [
  "Recherche de vols en temps reel via Google Flights",
  "Comparaison multi-compagnies et multi-aeroports",
  "Reservation de billets simples, aller-retour, multi-destinations",
  "Tarifs groupes, familles, professionnels",
  "Reservation hotels via Skyscanner",
  "Hebergements verifies, adaptes a votre budget",
  "Itineraires complexes avec plusieurs escales",
  "Transferts aeroport et location de voiture",
  "Assistance voyage 24 sur 24 via WhatsApp",
  "Reprogrammation en cas d imprevu",
];

const ETAPES = [
  {
    title: "Vous nous dites votre voyage",
    description: "Origine, destination, dates, nombre de personnes, budget.",
  },
  {
    title: "Comparaison en temps reel",
    description: "Nous proposons 2 a 3 options claires apres comparaison.",
  },
  {
    title: "Vous choisissez",
    description: "Nous reservons immediatement pour bloquer le tarif.",
  },
  {
    title: "Confirmations email et WhatsApp",
    description: "Billets et reservations envoyes au format numerique.",
  },
  {
    title: "Assistance pendant le voyage",
    description: "En cas d imprevu, WhatsApp. Nous prenons le relais.",
  },
];

const FAQ = [
  {
    question: "Etes-vous plus chers que les plateformes en ligne ?",
    answer: "Non. Nous utilisons les memes sources et parfois obtenons de meilleurs tarifs grace a nos partenaires.",
  },
  {
    question: "Acceptez-vous le paiement en FCFA ?",
    answer: "Oui, en FCFA ou en devises selon vos preferences. Nous gerons la conversion.",
  },
  {
    question: "Et si mon vol est annule ?",
    answer: "Contactez-nous sur WhatsApp. Nous cherchons une alternative immediatement.",
  },
  {
    question: "Organisez-vous les transferts aeroport ?",
    answer: "Oui sur demande, pour les destinations principales.",
  },
  {
    question: "Verifiez-vous les hotels ?",
    answer: "Oui. Nous nous basons sur les avis recents et ecartons les hebergements problematiques.",
  },
];

export default function BilletsPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Billets et hotels"
          title="Voyagez bien, sans y passer la journee."
          subtitle="Nous comparons, reservons et vous accompagnons. Nexus RCA gere toute la logistique."
          image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Avion au coucher du soleil"
          ctaLabel="Organiser mon voyage"
          whatsappMessage="Bonjour Nexus, je souhaite organiser un voyage."
        />

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix interventions concretes pour un voyage simple."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Reservation rapide"
          title="Recherchez vous-meme ou laissez Nexus s en occuper"
          description="Explorez directement via Google Flights et Skyscanner."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <a
              href="https://www.google.com/flights"
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-nexus-blue-50 text-nexus-blue-700">
                <Plane className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-nexus-blue-950">
                  Rechercher un vol
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Comparer les meilleurs vols via Google Flights.
                </p>
              </div>
            </a>

            <a
              href="https://www.skyscanner.net/hotels"
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-nexus-blue-50 text-nexus-blue-700">
                <Hotel className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-nexus-blue-950">
                  Reserver un hotel
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Explorer les hotels via Skyscanner.
                </p>
              </div>
            </a>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Methode"
          title="Comment ca se passe"
          description="Cinq etapes simples."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Questions frequentes"
          title="Les reponses aux questions frequentes"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>

        <ServiceCTA
          title="Envoyez-nous votre voyage."
          subtitle="Un conseiller Nexus revient avec 2 a 3 options claires."
          ctaLabel="Organiser mon voyage"
          whatsappMessage="Bonjour Nexus, je souhaite organiser un voyage."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
