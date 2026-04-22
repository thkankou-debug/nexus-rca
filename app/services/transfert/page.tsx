import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceChecklist } from "@/components/services/ServiceChecklist";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { FileText, Clock, Send, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Transfert d argent international | Nexus RCA",
  description: "Envoi et reception d argent entre la RCA et le reste du monde. Rapide, fiable, transparent.",
};

const PRISES_EN_CHARGE = [
  "Envoi d argent depuis la RCA vers l etranger",
  "Reception d argent depuis l etranger vers la RCA",
  "Transferts entre particuliers pour soutien familial",
  "Transferts business pour paiements fournisseurs ou clients",
  "Conversion de devise integree au transfert",
  "Devis clair avant toute operation",
  "Frais transparents affiches d avance",
  "Assistance pour les gros transferts",
  "Conseil sur le meilleur canal selon destination et montant",
  "Suivi jusqu a la reception confirmee par le beneficiaire",
];

const ETAPES = [
  {
    title: "Vous exprimez votre besoin",
    description: "Montant, devise, destination, beneficiaire. Par WhatsApp ou en agence.",
  },
  {
    title: "Devis et conseil canal",
    description: "Nous vous proposons le meilleur canal (Western Union, MoneyGram, mobile money, reseau bancaire) selon votre cas.",
  },
  {
    title: "Preparation du transfert",
    description: "Collecte des informations necessaires, verification des coordonnees du beneficiaire.",
  },
  {
    title: "Execution",
    description: "Transfert effectue en agence, avec remise du recu et des references pour le suivi.",
  },
  {
    title: "Confirmation de reception",
    description: "Nous vous confirmons la bonne reception par le beneficiaire, et restons disponibles en cas de probleme.",
  },
];

const FAQ = [
  {
    question: "Quels canaux utilisez-vous ?",
    answer: "Western Union, MoneyGram, mobile money, virements bancaires. Nous choisissons selon la destination, le montant et l urgence.",
  },
  {
    question: "Combien coutent les frais ?",
    answer: "Les frais dependent du canal, du montant et de la destination. Un devis clair vous est remis avant toute operation. Aucun frais cache.",
  },
  {
    question: "Est-ce plus cher qu un envoi direct ?",
    answer: "Non. Nous vous faisons beneficier des memes tarifs operateurs, avec en plus le conseil sur le meilleur canal et le suivi jusqu a la reception.",
  },
  {
    question: "Combien de temps pour recevoir l argent ?",
    answer: "Pour les transferts rapides, quelques minutes a quelques heures. Pour les virements bancaires, 1 a 3 jours ouvres. Le delai est annonce avant le transfert.",
  },
  {
    question: "Y a-t-il un plafond ?",
    answer: "Les plafonds varient selon les canaux et les reglementations. Pour les gros transferts, nous fractionnons ou combinons plusieurs canaux si necessaire.",
  },
  {
    question: "Que se passe-t-il si le beneficiaire ne recoit pas l argent ?",
    answer: "Nous disposons des references de traçabilite et intervenons immediatement aupres de l operateur pour resoudre le probleme.",
  },
  {
    question: "Acceptez-vous les paiements en especes ?",
    answer: "Oui. Especes en FCFA ou en devises, selon l operation. Le mode de paiement est valide au devis.",
  },
];

export default function TransfertPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Transfert d argent"
          title="Envoyez et recevez de l argent, en toute confiance."
          subtitle="Entre la RCA et le reste du monde, Nexus RCA gere vos transferts avec rapidite, transparence et un suivi jusqu a la reception confirmee."
          image="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Transaction financiere sur smartphone"
          ctaLabel="Demander un transfert"
          whatsappMessage="Bonjour Nexus, je souhaite effectuer un transfert d argent."
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
          eyebrow="Profils accompagnes"
          title="Pour qui ce service est concu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Familles", text: "Qui envoient ou recoivent un soutien financier entre Bangui et l etranger." },
              { title: "Diaspora", text: "Qui soutient ses proches en RCA depuis l etranger." },
              { title: "Etudiants", text: "Qui recoivent leur budget mensuel depuis leur famille." },
              { title: "Entrepreneurs", text: "Qui paient des fournisseurs internationaux ou recoivent des clients." },
              { title: "Voyageurs", text: "Qui ont besoin de fonds a l etranger ou a leur retour." },
              { title: "ONG et associations", text: "Qui gerent des flux entre bailleurs internationaux et equipes locales." },
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
          description="Cinq etapes claires, du besoin a la confirmation de reception."
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
                Nom complet exact du beneficiaire tel qu il apparait sur sa piece d identite, pays et ville de reception, numero de telephone du beneficiaire, montant et devise, piece d identite de l expediteur.
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
                <li><strong className="text-nexus-blue-950">Transfert rapide :</strong> quelques minutes a quelques heures</li>
                <li><strong className="text-nexus-blue-950">Mobile money :</strong> instantane a 30 minutes</li>
                <li><strong className="text-nexus-blue-950">Virement bancaire :</strong> 1 a 3 jours ouvres</li>
                <li><strong className="text-nexus-blue-950">Gros transferts :</strong> delai selon canal</li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Un interlocuteur de confiance, pas juste un guichet."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Conseil sur le canal", text: "Nous choisissons le canal le plus rapide et le moins cher selon votre situation." },
              { title: "Transparence totale", text: "Frais annonces avant toute operation. Aucune surprise, aucune marge cachee." },
              { title: "Suivi jusqu a reception", text: "Nous ne cloturons pas avant la confirmation de reception par le beneficiaire." },
              { title: "Reactivite sur incidents", text: "En cas de blocage ou de retard, nous intervenons immediatement aupres de l operateur." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <Send className="h-5 w-5" />
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
          title="Demandez un devis de transfert en quelques minutes."
          subtitle="Un conseiller Nexus RCA repond sur WhatsApp avec les frais et le delai selon votre destination."
          ctaLabel="Demander un transfert"
          whatsappMessage="Bonjour Nexus, je souhaite effectuer un transfert d argent."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}