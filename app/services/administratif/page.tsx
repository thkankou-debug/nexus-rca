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
import { FileText, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Services administratifs, CV & traductions | Nexus RCA",
  description:
    "CV format canadien, lettres de motivation, traductions FR/EN, remplissage de formulaires officiels (IRCC, France-Visas), impression et scan à Bangui. Documents propres livrés dans les délais.",
};

const PRISES_EN_CHARGE = [
  "Rédaction de CV au format canadien, français ou international",
  "Lettres de motivation sur-mesure (études, emploi, visa, bourse)",
  "Traduction français vers anglais de documents courts et officiels",
  "Remplissage de formulaires complexes (IRCC, France-Visas, consulats, universités)",
  "Rédaction et mise en forme de documents personnels ou professionnels",
  "Attestations, courriers formels, demandes manuscrites",
  "Correction et amélioration de textes existants",
  "Impression, scan haute qualité, reliure, plastification",
  "Numérisation et envoi électronique de dossiers complets",
  "Archivage numérique sécurisé de vos documents",
];

const ETAPES = [
  {
    title: "Vous nous expliquez votre besoin",
    description:
      "Par e-mail, WhatsApp ou en agence. Rapide, sans obligation, sans jargon.",
  },
  {
    title: "Devis clair et délai annoncé",
    description:
      "Avant toute action, vous savez ce qui est inclus, combien ça coûte et quand c'est livré.",
  },
  {
    title: "Rédaction, traduction, remplissage",
    description:
      "Un membre de notre équipe prend en charge votre dossier avec les bons codes et le bon vocabulaire.",
  },
  {
    title: "Relecture systématique",
    description:
      "Avant livraison, chaque document est relu. Pas d'envoi à l'aveugle, pas de fautes évitables.",
  },
  {
    title: "Livraison numérique ou papier",
    description:
      "Format PDF, document modifiable, version imprimée — ou les trois. Vous choisissez.",
  },
];

const PROFILS = [
  {
    title: "Candidats à l'emploi",
    text: "Qui doivent présenter un CV impeccable et une lettre solide.",
  },
  {
    title: "Étudiants",
    text: "Qui préparent une candidature universitaire ou un dossier de bourse.",
  },
  {
    title: "Demandeurs de visa",
    text: "Qui doivent remplir des formulaires officiels sans erreur.",
  },
  {
    title: "Entrepreneurs",
    text: "Qui montent un dossier administratif, juridique ou commercial.",
  },
  {
    title: "Particuliers pressés",
    text: "Qui ont besoin d'un document propre, imprimé ou scanné, dans la journée.",
  },
  {
    title: "Diaspora",
    text: "Qui pilote à distance la préparation de documents pour un proche en RCA.",
  },
];

const POURQUOI = [
  {
    title: "Codes canadiens maîtrisés",
    text: "Nos rédacteurs connaissent les codes du CV canadien, européen et africain. On ne mise pas sur le hasard.",
  },
  {
    title: "Relecture systématique",
    text: "Chaque document est relu avant livraison. Pas de fautes, pas de formulations bancales.",
  },
  {
    title: "Livraison fiable",
    text: "Vous savez quand vous recevez votre document. Les délais promis sont tenus.",
  },
  {
    title: "Confidentialité totale",
    text: "Vos documents personnels restent strictement entre vous et Nexus. Rien n'est diffusé ni réutilisé.",
  },
];

const FAQ = [
  {
    question: "Un CV canadien est-il vraiment différent ?",
    answer:
      "Oui. Format, longueur, ton, vocabulaire, organisation des expériences : tout change par rapport au CV français. Un CV mal adapté coule souvent une candidature avant même d'être lue.",
  },
  {
    question: "Vos traductions sont-elles certifiées ?",
    answer:
      "Nous livrons des traductions professionnelles de qualité. Pour une traduction assermentée officielle (tribunaux, certains consulats), nous vous orientons vers un traducteur agréé : certains dossiers l'exigent.",
  },
  {
    question: "Combien coûte un CV sur-mesure ?",
    answer:
      "Le tarif dépend du niveau d'expérience à retraiter et du format cible. Un devis vous est remis dès réception de vos informations. Pas de surprise.",
  },
  {
    question: "Je n'ai pas de CV actuel, vous partez de zéro ?",
    answer:
      "Oui. Un entretien d'une trentaine de minutes suffit souvent à reconstituer votre parcours et à en sortir un CV propre.",
  },
  {
    question: "Vous pouvez remplir un formulaire IRCC à ma place ?",
    answer:
      "Nous pouvons préparer la totalité du remplissage et vous guider ligne par ligne. La signature et la soumission restent votre responsabilité, pour des raisons légales.",
  },
  {
    question: "Faites-vous aussi l'impression ?",
    answer:
      "Oui. Impression couleur, noir et blanc, reliure, plastification. En agence à Bangui, ou à récupérer sur place après commande sur WhatsApp.",
  },
];

export default function AdministratifPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Services administratifs"
          title="Vos documents, faits proprement, rendus à temps."
          subtitle="CV canadien, traductions, lettres, formulaires officiels, impression : Nexus RCA vous sort du bricolage et vous donne des documents prêts à déposer."
          image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Documents officiels et stylo sur un bureau"
          whatsappMessage="Bonjour Nexus, j'ai un document à préparer ou à traduire."
        />

        <ServiceSection
          eyebrow="Introduction"
          title="Un CV au mauvais format, un formulaire mal rempli, et votre dossier part à la poubelle."
          description="Nexus RCA gère la partie documentaire de vos démarches avec le soin qu'elle mérite : format attendu, vocabulaire précis, relecture, mise en page nette. Vos papiers sortent d'ici prêts à être déposés."
        >
          <div />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix services documentaires pour couvrir tous les besoins classiques et les cas plus spécifiques."
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
          description="Un process simple, rapide, transparent, du premier message à la livraison."
        >
          <ServiceSteps steps={ETAPES} />
        </ServiceSection>

        <ServiceSection eyebrow="Préparation" title="À prévoir dès le départ">
          <div className="grid gap-6 lg:grid-cols-2">
            <InfoBlock icon={FileText} accent="blue" title="Documents utiles">
              <p>
                CV existant si vous en avez un, diplômes, relevés de notes,
                contrats, lettres à traduire, formulaire vierge avec la liste
                des pièces demandées, et vos informations personnelles à jour.
                Tout est traité en confidentialité.
              </p>
            </InfoBlock>

            <InfoBlock icon={Clock} accent="orange" title="Délais indicatifs">
              <ul className="space-y-2">
                <li>
                  <strong className="text-ink">CV ou lettre :</strong> 24 à 48 h
                </li>
                <li>
                  <strong className="text-ink">Traduction courte :</strong> 24
                  à 72 h
                </li>
                <li>
                  <strong className="text-ink">
                    Remplissage formulaire complet :
                  </strong>{" "}
                  48 h à 5 jours
                </li>
                <li>
                  <strong className="text-ink">
                    Impression, scan simples :
                  </strong>{" "}
                  dans la journée
                </li>
                <li className="pt-2 italic">
                  Nous tenons les délais urgents sans sacrifier la qualité.
                </li>
              </ul>
            </InfoBlock>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Pas de modèles copiés. Chaque document est adapté à votre profil."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {POURQUOI.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <CheckCircle2 className="h-5 w-5" />
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
          title="Envoyez-nous votre besoin. Devis et délai sous quelques heures."
          subtitle="Un conseiller Nexus RCA revient vers vous rapidement avec un plan clair et un prix transparent."
          whatsappMessage="Bonjour Nexus, j'ai un document administratif à préparer."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
