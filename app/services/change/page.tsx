import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { FileText, Clock, Coins } from "lucide-react";

export const metadata = {
  title: "Change de devises a Bangui | Nexus RCA",
  description: "Change manuel de devises a Bangui. Taux competitifs, transactions rapides.",
};

const PRISES_EN_CHARGE = [
  "Change manuel euros, dollars US, dollars canadiens, livres sterling",
  "Change FCFA vers devises etrangeres pour vos voyages",
  "Change devises etrangeres vers FCFA a votre arrivee",
  "Taux competitifs reevalues plusieurs fois par jour",
  "Transactions en espece sans frais caches",
  "Devis immediat avant toute transaction",
  "Service discret pour gros montants sur rendez-vous",
  "Conseil sur le timing optimal selon les tendances",
  "Accueil en agence a Bangui, Relais Sica",
  "Remise d un recu detaille pour chaque transaction",
];

const ETAPES = [
  {
    title: "Contact initial",
    description: "Par WhatsApp, telephone ou en agence, vous indiquez le montant et les devises souhaitees.",
  },
  {
    title: "Devis instantane",
    description: "Nous communiquons le taux applique et le montant exact, sans surprise.",
  },
  {
    title: "Rendez-vous en agence",
    description: "Vous passez a l agence de Bangui. Pour gros montants, un rendez-vous est conseille.",
  },
  {
    title: "Transaction securisee",
    description: "Echange en espece, comptage verifie, remise du recu.",
  },
  {
    title: "Suivi et relation",
    description: "Nous gardons votre contact pour vous alerter sur les evolutions de taux.",
  },
];

const FAQ = [
  {
    question: "Quelles devises changez-vous ?",
    answer: "Euros, dollars americains, dollars canadiens, livres sterling et FCFA. Pour d autres devises, contactez-nous.",
  },
  {
    question: "Vos taux sont-ils meilleurs qu en banque ?",
    answer: "Generalement oui, surtout pour les montants moyens et eleves. Nous actualisons nos taux en temps reel.",
  },
  {
    question: "Y a-t-il des frais caches ?",
    answer: "Non. Le taux annonce est le taux applique. Aucun frais additionnel, aucune commission cachee.",
  },
  {
    question: "Quel est le montant minimum ?",
    answer: "Nous traitons de petits comme de gros montants. Pour tres gros montants, un rendez-vous est conseille.",
  },
  {
    question: "Le service est-il securise ?",
    answer: "Oui. Transactions en agence, comptage verifie par les deux parties, recu remis systematiquement.",
  },
  {
    question: "Faut-il une piece d identite ?",
    answer: "Pour les gros montants oui. Pour les petites transactions courantes, ce n est generalement pas requis.",
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
          subtitle="Euros, dollars US, dollars canadiens, livres sterling, FCFA. Nexus RCA echange vos devises en agence, sans frais caches."
          image="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Billets de banque de differentes devises"
          ctaLabel="Obtenir un devis de change"
          whatsappMessage="Bonjour Nexus, je souhaite effectuer une operation de change."
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
          eyebrow="Profils accompagnes"
          title="Pour qui ce service est concu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Voyageurs", text: "Qui partent a l etranger et convertissent leurs FCFA en devises." },
              { title: "Arrivants", text: "Qui reviennent ou arrivent en RCA avec des devises a convertir." },
              { title: "Entrepreneurs", text: "Qui paient des fournisseurs dans des devises etrangeres." },
              { title: "Diaspora", text: "Qui soutient leurs proches a Bangui avec des envois en devises." },
              { title: "Etudiants", text: "Qui preparent leur depart ou leur retour." },
              { title: "Professionnels en mission", text: "En passage a Bangui qui ont besoin de changer rapidement." },
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
          description="Cinq etapes simples."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        <ServiceSection eyebrow="Informations pratiques" title="A savoir avant de venir">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-50 text-nexus-blue-700">
                  <FileText className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">A preparer</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Le montant exact a changer, la devise de depart, la devise d arrivee, une piece d identite pour les gros montants, et votre numero WhatsApp pour un devis prealable.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                  <Clock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">Delais et horaires</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-nexus-blue-950">Transaction courante :</strong> 10 a 15 minutes</li>
                <li><strong className="text-nexus-blue-950">Gros montants :</strong> rendez-vous recommande</li>
                <li><strong className="text-nexus-blue-950">Devis WhatsApp :</strong> sous 30 minutes</li>
                <li><strong className="text-nexus-blue-950">Agence :</strong> Relais Sica, Bangui</li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Taux competitifs, transparence totale, accueil soigne."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Taux reels", text: "Nos taux sont actualises en temps reel selon le marche. Pas de marge abusive." },
              { title: "Zero frais cache", text: "Le taux annonce est le taux applique. Point final." },
              { title: "Securite", text: "Transactions en agence, comptage verifie, recu systematique." },
              { title: "Discretion", text: "Service discret pour les gros montants, sur rendez-vous." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Coins className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection
          eyebrow="Questions frequentes"
          title="Les reponses aux questions frequentes"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>

        <ServiceCTA
          title="Demandez votre devis de change en quelques minutes."
          subtitle="Un conseiller Nexus RCA repond sur WhatsApp avec le taux du jour et le montant exact."
          ctaLabel="Obtenir un devis"
          whatsappMessage="Bonjour Nexus, je souhaite un devis de change."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}