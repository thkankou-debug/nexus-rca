import Link from "next/link";
import {
  Sparkles,
  FolderOpen,
  Wallet,
  FileText,
  UserCircle,
  ArrowRight,
  CheckCircle2,
  Globe,
  GraduationCap,
  Plane,
  Building2,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Eye,
  Bell,
  MessageCircle,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "NEXUS CONNECT - Votre espace personnel Nexus RCA",
  description:
    "NEXUS CONNECT est l'espace client de Nexus RCA : suivez vos dossiers, vos paiements, vos documents et restez connecté à votre agent dédié. Une expérience premium pour vos démarches internationales.",
  openGraph: {
    title: "NEXUS CONNECT - Votre espace personnel Nexus RCA",
    description:
      "Suivez vos dossiers, paiements et documents en temps réel. Restez connecté à votre agent dédié.",
  },
};

export default function NexusConnectPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ======================================================== */}
      {/* HEADER - Navigation simple */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/services"
              className="text-sm font-semibold text-slate-700 hover:text-nexus-blue-950"
            >
              Services
            </Link>
            <Link
              href="/a-propos"
              className="text-sm font-semibold text-slate-700 hover:text-nexus-blue-950"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold text-slate-700 hover:text-nexus-blue-950"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/connexion"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-block"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* HERO */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        {/* Effet de glow orange en arriere-plan */}
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-400 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Nouveau · Espace client premium
          </div>

          {/* Titre */}
          <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            NEXUS{" "}
            <span className="bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
              CONNECT
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 sm:text-xl">
            Votre espace personnel chez Nexus RCA. Suivez vos dossiers, vos
            paiements, téléchargez vos documents et restez en contact direct
            avec votre agent dédié.
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Une expérience numérique premium pour vos démarches internationales,
            où que vous soyez à Bangui, Yaoundé, Paris ou Montréal.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-2xl shadow-nexus-orange-500/40 transition hover:-translate-y-0.5 hover:bg-nexus-orange-600"
            >
              Créer mon espace gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              J'ai déjà un compte
            </Link>
          </div>

          {/* Bandeau confiance */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-nexus-orange-400" />
              Données sécurisées
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-nexus-orange-400" />
              100% transparent
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-nexus-orange-400" />
              Notifications en temps réel
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4 PILIERS */}
      {/* ======================================================== */}
      <section className="-mt-20 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PillarCard
              icon={FolderOpen}
              title="Mes dossiers"
              description="Suivez l'avancement de vos demandes de visa, bourses, TCF, billets en temps réel."
              accent="orange"
            />
            <PillarCard
              icon={Wallet}
              title="Mes paiements"
              description="Visualisez ce que vous avez payé, ce qui reste à régler. Plus aucune surprise."
              accent="blue"
            />
            <PillarCard
              icon={FileText}
              title="Mes documents"
              description="Téléchargez vos reçus, factures et justificatifs en un clic, à tout moment."
              accent="orange"
            />
            <PillarCard
              icon={UserCircle}
              title="Mon agent dédié"
              description="Restez en contact direct avec votre agent Nexus par WhatsApp, email ou téléphone."
              accent="blue"
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SERVICES CONCERNES */}
      {/* ======================================================== */}
      <section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              Tous vos services Nexus
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
              Un espace pour <span className="text-nexus-orange-600">tous vos projets</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Depuis votre espace NEXUS CONNECT, accédez à l'historique complet
              de vos démarches avec Nexus RCA.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceItem
              icon={Globe}
              title="Visa & e-Visa"
              description="Tous types de visas pour l'étranger, avec accompagnement complet."
            />
            <ServiceItem
              icon={GraduationCap}
              title="Bourses Canada"
              description="Dossiers de bourses d'études, suivi des candidatures."
            />
            <ServiceItem
              icon={GraduationCap}
              title="TCF Canada"
              description="Préparation et inscription au Test de Connaissance du Français."
            />
            <ServiceItem
              icon={Plane}
              title="Billets d'avion & hôtels"
              description="Réservations internationales, factures professionnelles."
            />
            <ServiceItem
              icon={Building2}
              title="Incubateur & financement"
              description="Accompagnement pour entrepreneurs et porteurs de projets."
            />
            <ServiceItem
              icon={TrendingUp}
              title="Digital & développement"
              description="Création de sites web, marketing, identité visuelle."
            />
            <ServiceItem
              icon={ShoppingBag}
              title="Petits services bureautiques"
              description="Photocopie, impression, scan, plastification, photo d'identité."
            />
            <ServiceItem
              icon={Wallet}
              title="Transferts d'argent"
              description="Western Union, MoneyGram, Mobile Money — initiez et suivez vos transferts."
            />
            <ServiceItem
              icon={Sparkles}
              title="Et bien plus encore"
              description="Notre offre s'enrichit régulièrement selon vos besoins."
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* COMMENT CA MARCHE */}
      {/* ======================================================== */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              Simple et rapide
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
              Comment ça marche ?
            </h2>
          </div>

          <div className="mt-16 space-y-8">
            <Step
              number={1}
              title="Créez votre compte gratuit"
              description="En 30 secondes, créez votre espace personnel sécurisé avec votre email."
            />
            <Step
              number={2}
              title="Faites votre demande"
              description="Choisissez le service qui vous intéresse (visa, bourse, transfert, etc.) et soumettez votre demande en ligne."
            />
            <Step
              number={3}
              title="Suivez en temps réel"
              description="Votre agent traite votre dossier. Vous voyez chaque étape, chaque paiement, chaque document directement sur NEXUS CONNECT."
            />
            <Step
              number={4}
              title="Restez connecté"
              description="Contactez votre agent dédié à tout moment par WhatsApp, email ou téléphone pour toute question."
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* TRANSPARENCE */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-400">
                Notre engagement
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                Une transparence totale, à chaque étape
              </h2>
              <p className="mt-4 text-slate-300">
                Chaque opération réalisée chez Nexus est enregistrée avec le nom
                de l'agent, la date, le montant, le mode de paiement et le
                statut.
              </p>
              <p className="mt-3 text-slate-300">
                Vous savez toujours où en est votre dossier, qui s'en occupe et
                ce qu'il vous reste à faire.
              </p>
            </div>

            <div className="space-y-3">
              <TransparencyPoint
                title="Traçabilité complète"
                description="Chaque mouvement est enregistré, horodaté et signé."
              />
              <TransparencyPoint
                title="Reçus professionnels"
                description="Téléchargez et imprimez vos justificatifs à tout moment."
              />
              <TransparencyPoint
                title="Agent identifié"
                description="Vous savez exactement qui traite votre dossier."
              />
              <TransparencyPoint
                title="Historique permanent"
                description="Tous vos échanges et opérations restent accessibles."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* CTA FINAL */}
      {/* ======================================================== */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 p-10 text-center shadow-2xl sm:p-16">
            {/* Effets visuels */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-nexus-blue-950/20 blur-3xl" />

            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Prêt à rejoindre NEXUS CONNECT ?
              </h2>
              <p className="mt-4 text-lg text-white/90">
                Créez votre espace en 30 secondes. C'est gratuit, et ça change tout.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-blue-950 px-8 py-3.5 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-nexus-blue-800"
                >
                  Créer mon espace gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter un agent
                </Link>
              </div>

              <p className="mt-6 text-xs text-white/70">
                Aucune carte bancaire requise · Inscription en 30 secondes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FOOTER MINIMAL */}
      {/* ======================================================== */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo />
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <Link href="/services" className="hover:text-nexus-blue-950">
                Services
              </Link>
              <Link href="/a-propos" className="hover:text-nexus-blue-950">
                À propos
              </Link>
              <Link href="/contact" className="hover:text-nexus-blue-950">
                Contact
              </Link>
              <Link href="/connexion" className="hover:text-nexus-blue-950">
                Connexion
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Nexus RCA · Bangui, République Centrafricaine
          </p>
        </div>
      </footer>
    </main>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function PillarCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: "orange" | "blue";
}) {
  const colorMap = {
    orange: "from-nexus-orange-500 to-nexus-orange-700",
    blue: "from-nexus-blue-700 to-nexus-blue-900",
  };
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[accent]} text-white shadow-lg`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function ServiceItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-orange-50 text-nexus-orange-600">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-base font-bold text-nexus-blue-950">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 font-display text-xl font-bold text-white shadow-lg">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function TransparencyPoint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-nexus-orange-400" />
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
