import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Eye,
  FilePlus,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  MessageCircle,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserCircle,
  Wallet,
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

// ─── Pattern dot grid (Stripe-like) ─────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_LIGHT: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.05) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export default function NexusConnectPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ─── HEADER Premium tech ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="transition-opacity duration-300 hover:opacity-90"
          >
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/services"
              className="text-sm font-bold text-slate-600 transition-colors duration-200 hover:text-nexus-blue-950"
            >
              Services
            </Link>
            <Link
              href="/a-propos"
              className="text-sm font-bold text-slate-600 transition-colors duration-200 hover:text-nexus-blue-950"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="text-sm font-bold text-slate-600 transition-colors duration-200 hover:text-nexus-blue-950"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 sm:inline-block"
            >
              Connexion
            </Link>
            <Link
              href="/demande/complet"
              className="group/cta relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_12px_30px_-8px_rgba(255,102,0,0.6)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              <FilePlus className="h-4 w-4" />
              Ouvrir un dossier
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO Premium tech ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-4 pt-20 pb-32 text-white sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={DOT_GRID_DARK}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/50 hover:bg-nexus-orange-500/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
            </span>
            Nouveau · Espace client premium
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            NEXUS{" "}
            <span className="bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
              CONNECT
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Votre espace personnel chez Nexus RCA. Suivez vos dossiers, vos
            paiements, téléchargez vos documents et restez en contact direct
            avec votre agent dédié.
          </p>

          <p className="mx-auto mt-3 max-w-xl text-xs text-slate-400 sm:text-sm">
            Une expérience numérique premium pour vos démarches internationales,
            où que vous soyez à Bangui, Yaoundé, Paris ou Montréal.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demande/complet"
              className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              <FilePlus className="h-4 w-4" />
              Ouvrir un dossier
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              J'ai déjà un compte
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-nexus-orange-400" />
              Données sécurisées
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
              <Eye className="h-4 w-4 text-nexus-orange-400" />
              100% transparent
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
              <Bell className="h-4 w-4 text-nexus-orange-400" />
              Notifications en temps réel
            </span>
          </div>
        </div>
      </section>

      {/* ─── 4 PILIERS Premium tech (overlap negative) ───────────────── */}
      <section className="-mt-20 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* ─── SERVICES CONCERNÉS Premium tech ─────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={DOT_GRID_LIGHT}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
              Tous vos services Nexus
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
              Un espace pour{" "}
              <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                tous vos projets
              </span>
              .
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
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

      {/* ─── COMMENT ÇA MARCHE Premium tech ──────────────────────────── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
              Simple et rapide
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
              Comment ça marche ?
            </h2>
          </div>

          <div className="mt-14 space-y-4">
            <Step
              number={1}
              title="Ouvrez un dossier en ligne"
              description="Choisissez le service qui vous intéresse (visa, bourse, TCF, transfert, etc.) et soumettez votre demande sur notre site en quelques minutes."
            />
            <Step
              number={2}
              title="Votre compte est créé automatiquement"
              description="Dès la soumission de votre première demande, votre espace NEXUS CONNECT est activé. Vous recevez vos identifiants par email."
            />
            <Step
              number={3}
              title="Suivez votre dossier en temps réel"
              description="Votre agent dédié traite votre demande. Vous voyez chaque étape, chaque paiement, chaque document directement sur NEXUS CONNECT."
            />
            <Step
              number={4}
              title="Restez connecté"
              description="Contactez votre agent dédié à tout moment par WhatsApp, email ou téléphone pour toute question."
            />
          </div>
        </div>
      </section>

      {/* ─── TRANSPARENCE — navy Premium tech ────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={DOT_GRID_DARK}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Notre engagement
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Une transparence totale, à chaque étape.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-300">
                Chaque opération réalisée chez Nexus est enregistrée avec le nom
                de l'agent, la date, le montant, le mode de paiement et le
                statut.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-300">
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

      {/* ─── CTA FINAL Premium tech ──────────────────────────────────── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="group/cta relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-orange-700 p-10 text-center shadow-[0_30px_80px_-30px_rgba(255,102,0,0.45)] sm:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-[80px] transition-all duration-700 group-hover/cta:bg-white/25"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-nexus-blue-950/25 blur-[80px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Activation immédiate
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Prêt à rejoindre NEXUS CONNECT ?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/95 sm:text-lg">
                Ouvrez votre premier dossier en quelques minutes. C'est simple,
                rapide et professionnel.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/demande/complet"
                  className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-blue-950 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(12,28,64,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-blue-900 hover:shadow-[0_18px_40px_-10px_rgba(12,28,64,0.6)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                  />
                  <FilePlus className="h-4 w-4" />
                  Ouvrir un dossier
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/15 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/25"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter un agent
                </Link>
              </div>

              <p className="mt-6 text-xs text-white/80">
                Votre espace personnel est créé automatiquement après votre
                première demande.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER MINIMAL ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo />
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <Link
                href="/services"
                className="font-bold transition-colors duration-200 hover:text-nexus-blue-950"
              >
                Services
              </Link>
              <Link
                href="/a-propos"
                className="font-bold transition-colors duration-200 hover:text-nexus-blue-950"
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="font-bold transition-colors duration-200 hover:text-nexus-blue-950"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="font-bold transition-colors duration-200 hover:text-nexus-blue-950"
              >
                Connexion
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Nexus RCA · Bangui, République
            Centrafricaine
          </p>
        </div>
      </footer>
    </main>
  );
}

// ─── Sous-composants Premium tech ─────────────────────────────────────────

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
  const isOrange = accent === "orange";
  const gradient = isOrange
    ? "from-nexus-orange-500 to-nexus-orange-700"
    : "from-nexus-blue-700 to-nexus-blue-900";
  // Couleurs en inline style pour éviter les problèmes de purge Tailwind
  const glowRgba = isOrange ? "255,102,0" : "30,64,175";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-20px_rgba(12,28,64,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/50">
      {/* Glow corner orange/navy — opacity transition */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: `rgba(${glowRgba}, 0.18)` }}
      />
      {/* Custom shadow au hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 24px 60px -22px rgba(${glowRgba}, 0.25)` }}
      />

      <div className="relative">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-lg font-bold leading-tight text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </article>
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
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_16px_36px_-16px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/12"
      />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600 ring-1 ring-nexus-orange-100 transition-all duration-300 ease-out group-hover:bg-nexus-orange-100 group-hover:ring-nexus-orange-300/60">
          <Icon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:scale-110" />
        </div>
        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950">
          {title}
        </h3>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </article>
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
    <article className="group relative flex gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />

      {/* Numéro avec halo orange au hover */}
      <div className="relative shrink-0">
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-nexus-orange-500/0 blur-md transition-all duration-500 group-hover:bg-nexus-orange-500/30"
        />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 font-display text-lg font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
          {number}
        </div>
      </div>

      <div className="relative flex-1 min-w-0">
        <h3 className="font-display text-lg font-bold leading-tight text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </article>
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
    <article className="group relative flex gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.08]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />
      <CheckCircle2 className="relative h-5 w-5 shrink-0 text-nexus-orange-400 transition-transform duration-300 ease-out group-hover:scale-110" />
      <div className="relative">
        <p className="font-bold text-white">{title}</p>
        <p className="mt-0.5 text-sm text-slate-400">{description}</p>
      </div>
    </article>
  );
}
