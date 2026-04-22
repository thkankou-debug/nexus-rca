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
import { FileText, Clock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Visa & e-Visa Canada, Europe, USA | Nexus RCA Bangui",
  description:
    "Nexus RCA prepare vos demandes de visa tourisme, etudes, travail ou affaires. Dossiers complets, assistance personnalisee, suivi jusqu a la decision. Agence a Bangui.",
};

const PRISES_EN_CHARGE = [
  "Analyse de votre profil et recommandation du bon type de visa",
  "Liste personnalisee des documents a rassembler selon votre situation",
  "Relecture et verification de chaque piece justificative",
  "Redaction ou reecriture de la lettre de motivation et du plan de voyage",
  "Remplissage des formulaires officiels (IRCC, France-Visas, TLS, VFS, DS-160)",
  "Preparation du dossier de ressources financieres",
  "Prise de rendez-vous biometrie et depot au centre VFS, TLS ou equivalent",
  "Preparation a l entretien consulaire si applicable (USA, certains cas France)",
  "Suivi du dossier jusqu a la decision",
  "Assistance en cas de demande de pieces complementaires",
];

const ETAPES = [
  {
    title: "Consultation initiale",
    description:
      "Nous identifions ensemble le bon visa et evaluons vos chances, en toute transparence.",
  },
  {
    title: "Liste personnalisee et echeancier",
    description:
      "Vous recevez une liste precise des documents a reunir et un calendrier clair pour ne pas perdre de temps.",
  },
  {
    title: "Collecte et verification",
    description:
      "Nous verifions vos pieces une par une. Rien ne part tant que le dossier n est pas solide.",
  },
  {
    title: "Formulaires et lettres",
    description:
      "Nous remplissons les formulaires officiels et redigeons la lettre de motivation et le plan de sejour adaptes a votre profil.",
  },
  {
    title: "Prise de rendez-vous, depot, biometrie",
    description:
      "Nous organisons le depot au centre de visa et vous accompagnons jusqu a la biometrie.",
  },
  {
    title: "Suivi jusqu a la decision",
    description:
      "Nous suivons le dossier, reagissons vite en cas de demande complementaire et vous accompagnons a l arrivee.",
  },
];

const FAQ = [
  {
    question: "Est-ce que Nexus garantit l obtention du visa ?",
    answer:
      "Non. La decision appartient exclusivement au consulat. Ce que nous garantissons, c est un dossier propre, complet et coherent, qui reduit fortement les risques de refus lies a la forme.",
  },
  {
    question: "J ai deja eu un refus. Vous pouvez m aider ?",
    answer:
      "Oui, c est meme un cas frequent. Nous analysons les motifs du refus, identifions les points a renforcer et reconstruisons un dossier adapte. Un refus precedent n est pas eliminatoire s il est bien traite.",
  },
  {
    question: "Combien coute l accompagnement visa ?",
    answer:
      "Cela depend du pays, du type de visa et de la complexite du dossier. Les tarifs Nexus sont remis apres la consultation initiale, avec la liste des services inclus. Les frais consulaires restent a votre charge.",
  },
  {
    question: "Pouvez-vous faire la demande a ma place ?",
    answer:
      "Nous preparons entierement le dossier et vous accompagnons au depot. La biometrie et la presence physique au centre de depot restent obligatoires pour certains visas.",
  },
  {
    question: "Je ne parle pas bien anglais, est-ce un probleme pour le Canada ?",
    answer:
      "Pas forcement. La plupart des visas canadiens peuvent se faire en francais. Si votre profil necessite une preuve linguistique, nous vous orientons vers le TCF Canada (que Nexus prepare egalement).",
  },
  {
    question: "Combien de temps a l avance dois-je m y prendre ?",
    answer:
      "Idealement 2 a 3 mois avant la date de voyage pour un visa classique, 4 a 6 mois pour un visa etudes. Plus tot vous commencez, plus le dossier est serein.",
  },
  {
    question: "Vous gerez aussi les regroupements familiaux ?",
    answer:
      "Oui, pour certains pays. Nous examinons votre situation au cas par cas lors du premier rendez-vous.",
  },
];

export default function VisaPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero
          badge="Visa et e-Visa"
          title="Votre visa, prepare comme il faut, depose comme il faut."
          subtitle="Canada, France, Belgique, Schengen, Etats-Unis : Nexus RCA monte des dossiers propres, complets et coherents pour maximiser vos chances des le premier depot."
          image="https://images.unsplash.com/photo-1569974498991-d3c12a504f95?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Passeport et documents de voyage sur un bureau"
          ctaLabel="Demarrer mon dossier visa"
          whatsappMessage="Bonjour Nexus, je souhaite preparer un dossier de visa."
        />

        <ServiceSection
          eyebrow="Introduction"
          title="Un refus de visa tient rarement a votre profil. Il tient presque toujours a un dossier mal prepare."
          description="Nexus RCA connait les exigences precises de chaque consulat et monte votre demande avec la rigueur attendue, en vous evitant les erreurs couteuses et les allers-retours."
        >
          <div />
        </ServiceSection>

        <ServiceSection
          variant="muted"
          eyebrow="Notre accompagnement"
          title="Ce que Nexus RCA prend en charge"
          description="Dix interventions concretes qui reduisent les risques de refus lies a la forme du dossier."
        >
          <ServiceChecklist items={PRISES_EN_CHARGE} />
        </ServiceSection>

        <ServiceSection
          eyebrow="Profils accompagnes"
          title="Pour qui ce service est concu"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Etudiants", text: "Qui partent au Canada, en France ou en Belgique pour leurs etudes." },
              { title: "Touristes et familles", text: "Qui visitent l Europe ou l Amerique du Nord." },
              { title: "Professionnels", text: "En deplacement pour affaires, conferences ou formation." },
              { title: "Travailleurs", text: "Qui visent un permis de travail Canada via EIMT ou Mobilite francophone." },
              { title: "Visites familiales", text: "Qui souhaitent rejoindre un proche a l etranger le temps d un sejour." },
              { title: "Regroupement familial", text: "Etudies au cas par cas lors du premier rendez-vous Nexus." },
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
          description="Un parcours balise en six etapes, pour un dossier depose sans stress."
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
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">Documents a preparer</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Passeport valide au moins 6 mois, photos aux normes, piece d identite, justificatifs financiers (3 a 6 derniers mois), justificatif de domicile, documents lies au motif du voyage (lettre d admission, invitation, reservation d hotel, billet d avion), CV recent, et actes d etat civil si applicable.
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
                <li><strong className="text-nexus-blue-950">Preparation Nexus :</strong> 1 a 3 semaines</li>
                <li><strong className="text-nexus-blue-950">E-visa (Turquie, Kenya, Rwanda...) :</strong> 48h a 7 jours</li>
                <li><strong className="text-nexus-blue-950">Schengen :</strong> 2 a 4 semaines</li>
                <li><strong className="text-nexus-blue-950">Visa Canada :</strong> 4 a 12 semaines</li>
                <li><strong className="text-nexus-blue-950">Visa USA :</strong> tres variable selon le poste consulaire</li>
                <li className="pt-2 italic">Anticiper de 2 a 6 mois selon le type de visa vise.</li>
              </ul>
            </div>
          </div>
        </ServiceSection>

        <ServiceSection
          variant="dark"
          eyebrow="Pourquoi Nexus RCA"
          title="Nous ne remplissons pas des formulaires. Nous construisons des dossiers coherents."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Connaissance consulaire", text: "Nous connaissons les exigences specifiques de chaque consulat et les pieges a eviter pour chaque type de visa." },
              { title: "Verification systematique", text: "Chaque piece est verifiee avant le depot. Un dossier Nexus ne part pas tant qu il n est pas solide." },
              { title: "Un interlocuteur dedie", text: "Vous parlez a la meme personne du debut a la fin. Votre dossier n est jamais un numero dans une file." },
              { title: "Reactivite sur les complements", text: "Si le consulat demande une piece additionnelle, nous repondons vite, pour ne pas faire trainer votre dossier." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-500/20 text-nexus-orange-300">
                  <ShieldCheck className="h-5 w-5" />
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
          title="Faites etudier votre profil visa gratuitement."
          subtitle="Un conseiller Nexus RCA revient vers vous sous 48h avec un plan de dossier clair."
          ctaLabel="Demarrer mon dossier visa"
          whatsappMessage="Bonjour Nexus, je souhaite faire etudier mon profil pour un visa."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}