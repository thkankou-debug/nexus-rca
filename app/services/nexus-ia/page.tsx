import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { NexusAIChat } from "@/components/NexusAIChat";
import { ServiceSection } from "@/components/services/ServiceSection";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import {
  Bot,
  Zap,
  Clock,
  Shield,
  MessageCircle,
  Sparkles,
  FileQuestion,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Nexus IA | Assistant virtuel | Nexus RCA",
  description:
    "Discutez avec Nexus IA, votre assistant virtuel 24/7 en français pour visa, études Canada, financement, voyages, transferts. Gratuit, sans inscription. Relais humain disponible.",
};

// ─── Données ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Clock,
    title: "Disponible 24/7",
    desc: "Jour, nuit, week-end. Pas d'horaires d'ouverture.",
  },
  {
    icon: Zap,
    title: "Réponses instantanées",
    desc: "Pas d'attente. Votre question, une réponse.",
  },
  {
    icon: Bot,
    title: "Spécialiste Nexus",
    desc: "Formé sur tous nos services et procédures RCA.",
  },
  {
    icon: Shield,
    title: "Relais humain",
    desc: "Un conseiller prend le relais dès que c'est nécessaire.",
  },
];

const CAS_USAGE = [
  {
    icon: FileQuestion,
    title: "Premières questions",
    desc: "Vous ne savez pas par où commencer ? Nexus IA vous aiguille vers le bon service en quelques messages.",
  },
  {
    icon: Sparkles,
    title: "Vérification rapide",
    desc: "Une question précise sur un document, un délai, une procédure ? Réponse immédiate, jour et nuit.",
  },
  {
    icon: MessageCircle,
    title: "Avant un rendez-vous",
    desc: "Clarifiez les points clés avec Nexus IA pour arriver préparé devant le conseiller.",
  },
  {
    icon: Users,
    title: "Orientation service",
    desc: "Visa ? Études ? Financement ? Transfert ? Nexus IA vous oriente vers le bon accompagnement.",
  },
];

const ETAPES = [
  {
    num: "01",
    title: "Posez votre question",
    text: "Directement dans la fenêtre de chat, en français, comme avec un conseiller humain.",
  },
  {
    num: "02",
    title: "Recevez une réponse",
    text: "Nexus IA répond en quelques secondes avec les informations pertinentes et les prochaines étapes.",
  },
  {
    num: "03",
    title: "Basculez vers un humain",
    text: "Si votre demande mérite un conseiller, Nexus IA vous propose de passer sur WhatsApp ou le formulaire officiel.",
  },
];

const FAQ = [
  {
    question: "Nexus IA peut-il traiter ma demande à la place d'un humain ?",
    answer:
      "Non. Nexus IA est un assistant d'orientation et d'information. Pour toute demande officielle (visa, admission, financement), un conseiller Nexus RCA humain prend le relais et gère votre dossier.",
  },
  {
    question: "Mes conversations sont-elles privées ?",
    answer:
      "Oui. Les conversations avec Nexus IA sont confidentielles. Elles peuvent être consultées uniquement par nos conseillers pour mieux vous accompagner, jamais pour d'autres usages.",
  },
  {
    question: "Pourquoi Nexus IA ne répond pas toujours comme un humain ?",
    answer:
      "Nexus IA est excellent sur les questions Nexus et les démarches courantes. Pour les cas complexes ou personnels, il vaut toujours mieux passer par un conseiller humain — ce que Nexus IA vous proposera lui-même.",
  },
  {
    question: "Combien ça coûte d'utiliser Nexus IA ?",
    answer:
      "C'est totalement gratuit. Nexus IA est mis à disposition de tous les visiteurs du site, sans inscription préalable.",
  },
  {
    question: "Comment passer du chat IA à un vrai conseiller ?",
    answer:
      "À tout moment, cliquez sur le bouton WhatsApp ou allez sur la page de demande complète. Nexus IA vous propose aussi de basculer vers un humain dès que votre demande le mérite.",
  },
  {
    question: "Nexus IA fonctionne-t-il sur téléphone ?",
    answer:
      "Oui, parfaitement. La conversation s'affiche aussi bien sur ordinateur, tablette que smartphone — et reste fluide même en 3G.",
  },
];

const STATS = [
  { value: "0 FCFA", label: "Gratuit" },
  { value: "24/7", label: "Disponible" },
  { value: "FR", label: "Français" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export default function NexusIAPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-32 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-nexus-blue-500/20 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
              <Bot className="h-3.5 w-3.5" />
              Assistant virtuel
            </div>

            <h1
              className="font-display text-display-xl text-white lg:text-display-2xl"
              style={{ paddingBottom: "0.15em" }}
            >
              Rencontrez{" "}
              <span className="text-gradient-orange">Nexus IA</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-slate-300">
              Votre assistant virtuel intelligent disponible 24/7 en français
              pour vos questions visa, études Canada, financement business,
              voyages et transferts. Gratuit, sans inscription.
            </p>

            {/* Stats strip */}
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-display-sm text-nexus-orange-400">
                    {s.value}
                  </div>
                  <div className="mt-1 text-overline text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CHAT + FEATURES ────────────────────────────────────────── */}
        <section className="relative -mt-20 pb-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <NexusAIChat />

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl border border-line bg-surface-elevated p-6 text-center shadow-elev-2 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-elev-4"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-white shadow-elev-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-headline text-ink">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-body-sm text-ink-muted">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CAS D'USAGE ─────────────────────────────────────────── */}
        <ServiceSection
          variant="muted"
          eyebrow="Cas d'usage"
          title="Quand Nexus IA vous fait gagner du temps"
          description="Quatre situations concrètes où l'assistant virtuel fait la différence au quotidien."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {CAS_USAGE.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-headline text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-muted">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </ServiceSection>

        {/* COMMENT ÇA MARCHE ─────────────────────────────────── */}
        <ServiceSection
          eyebrow="Comment ça marche"
          title="Un assistant simple à utiliser"
          description="Pas d'application à installer, pas de compte à créer. Vous ouvrez, vous parlez."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {ETAPES.map((item) => (
              <div
                key={item.num}
                className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition hover:border-brand/40 hover:shadow-elev-3"
              >
                <div className="font-display text-display-sm text-brand">
                  {item.num}
                </div>
                <h3 className="mt-2 font-display text-headline text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-body-sm text-ink-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        {/* FAQ ───────────────────────────────────────────────── */}
        <ServiceSection
          variant="muted"
          eyebrow="Questions fréquentes"
          title="Les réponses aux questions sur Nexus IA"
        >
          <ServiceFAQ items={FAQ} />
        </ServiceSection>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
