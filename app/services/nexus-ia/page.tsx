import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { NexusAIChat } from "@/components/NexusAIChat";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { Bot, Zap, Clock, Shield, MessageCircle, Sparkles, FileQuestion, Users } from "lucide-react";

export const metadata = {
  title: "Nexus IA | Assistant virtuel Nexus RCA",
  description:
    "Discutez avec Nexus IA, votre assistant virtuel 24 sur 24 pour toutes les demarches visa, etudes, financement, voyages et plus encore.",
};

const FEATURES = [
  { icon: Clock, title: "Disponible 24 sur 24", desc: "Jour, nuit, week-end, sans interruption." },
  { icon: Zap, title: "Reponses instantanees", desc: "Pas d attente. Votre question, une reponse." },
  { icon: Bot, title: "Specialiste Nexus", desc: "Forme sur tous nos services et procedures." },
  { icon: Shield, title: "Relais humain", desc: "Un conseiller prend le relais si besoin." },
];

const CAS_USAGE = [
  {
    icon: FileQuestion,
    title: "Premieres questions",
    desc: "Vous ne savez pas par ou commencer ? Nexus IA vous aiguille vers le bon service en quelques messages.",
  },
  {
    icon: Sparkles,
    title: "Verification rapide",
    desc: "Une question precise sur un document, un delai, une procedure ? Reponse immediate, jour et nuit.",
  },
  {
    icon: MessageCircle,
    title: "Avant un rendez-vous",
    desc: "Clarifiez les points cles avec Nexus IA pour arriver prepare a votre rendez-vous avec un conseiller humain.",
  },
  {
    icon: Users,
    title: "Orientation service",
    desc: "Visa ? Etudes ? Financement ? Transfert ? Nexus IA vous oriente vers le bon accompagnement Nexus.",
  },
];

const FAQ = [
  {
    question: "Nexus IA peut-il traiter ma demande a la place d un humain ?",
    answer:
      "Non. Nexus IA est un assistant d orientation et d information. Pour toute demande officielle (visa, admission, financement), un conseiller Nexus RCA humain prend le relais et gere votre dossier.",
  },
  {
    question: "Mes conversations sont-elles privees ?",
    answer:
      "Oui. Les conversations avec Nexus IA sont confidentielles. Elles peuvent etre consultees uniquement par nos conseillers pour mieux vous accompagner, jamais pour d autres usages.",
  },
  {
    question: "Pourquoi Nexus IA ne repond pas toujours comme un humain ?",
    answer:
      "Nexus IA est excellent sur les questions Nexus et les demarches courantes. Pour les cas complexes ou personnels, il vaut toujours mieux passer par un conseiller humain, ce que Nexus IA vous proposera lui-meme.",
  },
  {
    question: "Combien ca coute d utiliser Nexus IA ?",
    answer:
      "C est totalement gratuit. Nexus IA est un service mis a disposition de tous les visiteurs du site, sans inscription prealable.",
  },
  {
    question: "Comment passer d un chat IA a un vrai conseiller ?",
    answer:
      "A tout moment, cliquez sur le bouton WhatsApp ou allez sur la page de demande complete. Nexus IA vous propose aussi de basculer vers un humain des que votre demande le merite.",
  },
  {
    question: "Nexus IA fonctionne-t-il sur telephone ?",
    answer:
      "Oui, parfaitement. La conversation s affiche aussi bien sur ordinateur, tablette ou smartphone.",
  },
];

export default function NexusIAPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <Bot className="h-4 w-4 text-nexus-orange-400" />
              <span className="font-medium">Assistant virtuel Nexus</span>
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
              Rencontrez{" "}
              <span className="text-gradient-orange">Nexus IA</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              Votre assistant virtuel intelligent, disponible a toute heure pour repondre a vos
              questions sur le visa, les etudes au Canada, le financement business et plus encore.
            </p>
          </div>
        </section>

        {/* CHAT + FEATURES (bloc existant conserve) */}
        <section className="relative -mt-16 pb-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <NexusAIChat />

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CAS D USAGE */}
        <ServiceSection
          variant="muted"
          eyebrow="Cas d usage"
          title="Quand Nexus IA vous fait vraiment gagner du temps"
          description="Quatre situations concretes ou l assistant virtuel fait la difference au quotidien."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {CAS_USAGE.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-nexus-blue-950">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </ServiceSection>

        {/* COMMENT CA MARCHE */}
        <ServiceSection
          eyebrow="Comment ca marche"
          title="Un assistant simple a utiliser"
          description="Pas d application a installer, pas de compte a creer. Vous ouvrez, vous parlez."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                num: "01",
                title: "Posez votre question",
                text: "Directement dans la fenetre de chat, en francais, comme avec un conseiller humain.",
              },
              {
                num: "02",
                title: "Recevez une reponse",
                text: "Nexus IA vous repond en quelques secondes, avec les informations pertinentes et les prochaines etapes.",
              },
              {
                num: "03",
                title: "Basculez vers un humain",
                text: "Si votre demande merite un conseiller, Nexus IA vous propose de passer sur WhatsApp ou le formulaire officiel.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="font-display text-3xl font-bold text-nexus-orange-500">
                  {item.num}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        {/* FAQ */}
        <ServiceSection
          variant="muted"
          eyebrow="Questions frequentes"
          title="Les reponses aux questions sur Nexus IA"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}