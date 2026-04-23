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
import { FileText, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Services administratifs, CV canadien et traductions | Nexus RCA",
  description:
    "CV format canadien, lettres de motivation, traductions FR/EN, remplissage de formulaires officiels, impression et scan. Documents propres livres dans les delais.",
};

const PRISES_EN_CHARGE = [
  "Redaction de CV au format canadien, francais ou international",
  "Lettres de motivation sur-mesure (etudes, emploi, visa, bourse)",
  "Traduction francais vers anglais de documents courts et officiels",
  "Remplissage de formulaires complexes (IRCC, France-Visas, consulats, universites)",
  "Redaction et mise en forme de documents personnels ou professionnels",
  "Attestations, courriers formels, demandes manuscrites",
  "Correction et amelioration de textes existants",
  "Impression, scan haute qualite, reliure, plastification",
  "Numerisation et envoi electronique de dossiers complets",
  "Archivage numerique securise de vos documents",
];

const ETAPES = [
  {
    title: "Vous nous expliquez votre besoin",
    description:
      "Par email, WhatsApp ou en agence. Rapide, sans obligation, sans jargon.",
  },
  {
    title: "Devis clair et delai annonce",
    description:
      "Avant toute action, vous savez ce qui est inclus, combien ca coute et quand c est livre.",
  },
  {
    title: "Redaction, traduction, remplissage",
    description:
      "Un membre de notre equipe prend en charge votre dossier avec les bons codes et le bon vocabulaire.",
  },
  {
    title: "Relecture systematique",
    description:
      "Avant livraison, chaque document est relu. Pas d envoi a l aveugle, pas de fautes evitables.",
  },
  {
    title: "Livraison numerique ou papier",
    description:
      "Format PDF, document modifiable, version imprimee ou les trois. Vous choisissez ce qui vous arrange.",
  },
];

const FAQ = [
  {
    question: "Un CV canadien est-il vraiment different ?",
    answer:
      "Oui. Format, longueur, ton, vocabulaire, organisation des experiences : tout change par rapport au CV francais. Un CV mal adapte coule souvent une candidature avant meme d etre lue.",
  },
  {
    question: "Vos traductions sont-elles certifiees ?",
    answer:
      "Nous livrons des traductions professionnelles de qualite. Pour une traduction assermentee officielle (tribunaux, certains consulats), nous vous orientons vers un traducteur agree : certains dossiers l exigent.",
  },
  {
    question: "Combien coute un CV sur-mesure ?",
    answer:
      "Le tarif depend du niveau d experience a retraiter et du format cible. Un devis vous est remis des reception de vos informations. Pas de surprise.",
  },
  {
    question: "Je n ai pas de CV actuel, vous partez de zero ?",
    answer:
      "Oui. Un entretien d une trentaine de minutes suffit souvent a reconstituer votre parcours et a en sortir un CV propre.",
  },
  {
    question: "Vous pouvez remplir un formulaire IRCC a ma place ?",
    answer:
      "Nous pouvons preparer la totalite du remplissage et vous guider ligne par ligne. La signature et la soumission restent votre responsabilite, pour des raisons legales.",
  },
  {
    question: "Faites-vous aussi l impression ?",
    answer:
      "Oui. Impression couleur, noir et blanc, reliure, plastification. En agence a Bangui, ou a recuperer sur place apres commande en ligne.",
  },
];

export default function AdministratifPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Services administratifs"
          title="Vos documents, faits proprement, rendus a temps."
          subtitle="CV canadien, traductions, lettres, formulaires officiels, impression : Nexus RCA vous sort du bricolage et vous donne des documents prets a deposer."
          image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Documents officiels et stylo sur un bureau"
                    whatsappMessage="Bonjour Nexus, j ai un document a preparer ou a traduire."
        />

        <ServiceSection
          eyebrow="Introduction"
          title="Un CV au mauvais format, un formulaire mal rempli, et votre dossier part a la poubelle."
          description="Nexus RCA gere la partie documentaire de vos demarches avec le soin qu elle merite : format attendu, vocabulaire precis, relecture, mise en page nette. Vos papiers sortent d ici prets a etre deposes."
        >
          <div />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix services documentaires pour couvrir tous les besoins classiques et les cas plus specifiques."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Profils accompagnes"
          title="Pour qui ce service est concu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Candidats a l emploi", text: "Qui doivent presenter un CV impeccable et une lettre solide." },
              { title: "Etudiants", text: "Qui preparent une candidature universitaire ou un dossier de bourse." },
              { title: "Demandeurs de visa", text: "Qui doivent remplir des formulaires officiels sans erreur." },
              { title: "Entrepreneurs", text: "Qui montent un dossier administratif, juridique ou commercial." },
              { title: "Particuliers presses", text: "Qui ont besoin d un document propre, imprime ou scanne, dans la journee." },
              { title: "Diaspora", text: "Qui pilote a distance la preparation de documents pour un proche en RCA." },
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
          description="Un process simple, rapide, transparent, du premier message a la livraison."
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
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">Documents utiles</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                CV existant si vous en avez un, diplomes, releves de notes, contrats, lettres a traduire, formulaire vierge avec la liste des pieces demandees, et vos informations personnelles a jour. Tout est traite en confidentialite.
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
                <li><strong className="text-nexus-blue-950">CV ou lettre :</strong> 24 a 48h</li>
                <li><strong className="text-nexus-blue-950">Traduction courte :</strong> 24 a 72h</li>
                <li><strong className="text-nexus-blue-950">Remplissage formulaire complet :</strong> 48h a 5 jours</li>
                <li><strong className="text-nexus-blue-950">Impression, scan simples :</strong> dans la journee</li>
                <li className="pt-2 italic">Nous tenons les delais urgents sans sacrifier la qualite.</li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Pas de modeles copies. Chaque document est adapte a votre profil."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Codes canadiens maitrises", text: "Nos redacteurs connaissent les codes du CV canadien, europeen et africain. On ne mise pas sur le hasard." },
              { title: "Relecture systematique", text: "Chaque document est relu avant livraison. Pas de fautes, pas de formulations bancales." },
              { title: "Livraison fiable", text: "Vous savez quand vous recevez votre document. Les delais promis sont tenus." },
              { title: "Confidentialite totale", text: "Vos documents personnels restent strictement entre vous et Nexus. Rien n est diffuse ni reutilise." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <CheckCircle2 className="h-5 w-5" />
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
          title="Envoyez-nous votre besoin. Devis et delai sous quelques heures."
          subtitle="Un conseiller Nexus RCA revient vers vous rapidement avec un plan clair et un prix transparent."
                    whatsappMessage="Bonjour Nexus, j ai un document administratif a preparer."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}