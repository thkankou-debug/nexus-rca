import Link from "next/link";
import {
  Activity,
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
  Headphones,
  MessageCircle,
  Plane,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserCircle,
  Wallet,
  Zap,
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
const DOT_GRID_LIGHT_SUBTLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

// ─── Floating chips de services (background du hero) ────────────────────────
const FLOATING_CHIPS = [
  { label: "Visa Schengen", top: "12%", left: "6%", delay: "0s" },
  { label: "Billet d'avion", top: "20%", right: "8%", delay: "0.6s" },
  { label: "Bourse Canada", top: "65%", left: "4%", delay: "1.2s" },
  { label: "Transfert Mobile Money", top: "70%", right: "6%", delay: "1.8s" },
  { label: "TCF Canada", top: "38%", left: "10%", delay: "2.4s" },
  { label: "Hôtel international", top: "45%", right: "12%", delay: "0.3s" },
  { label: "Incubateur", top: "82%", right: "20%", delay: "1.5s" },
  { label: "Bureautique", top: "85%", left: "22%", delay: "0.9s" },
];

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

      {/* ─── HERO immersif Premium tech v2 ──────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-4 pt-16 pb-24 text-white sm:px-6 sm:pt-20 sm:pb-32 lg:px-8">
        {/* Dot grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.6]"
          style={DOT_GRID_DARK}
        />

        {/* Orb central rayonnant */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/15 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
        />

        {/* Floating chips services en background — uniquement desktop pour ne pas charger mobile */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
        >
          {FLOATING_CHIPS.map((chip, i) => (
            <span
              key={i}
              className="absolute select-none rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 backdrop-blur-md"
              style={{
                top: chip.top,
                left: chip.left,
                right: chip.right,
                animation: `floatChip 6s ease-in-out infinite`,
                animationDelay: chip.delay,
              }}
            >
              {chip.label}
            </span>
          ))}
        </div>
        {/* Bordure inférieure éclairée */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/50 hover:bg-nexus-orange-500/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
            </span>
            Nouveau · Espace client premium
          </span>

          <h1 className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            NEXUS{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                CONNECT
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
              />
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

          {/* CTA — full width sur mobile pour impact immédiat */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
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

          {/* Indicateurs métriques avec dots pulsants — vrai bento mini */}
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            <MetricChip
              icon={Activity}
              label="Suivi temps réel"
              hint="État dossier mis à jour"
              accent="emerald"
            />
            <MetricChip
              icon={ShieldCheck}
              label="Données chiffrées"
              hint="Conformité totale"
              accent="orange"
            />
            <MetricChip
              icon={Zap}
              label="Activation immédiate"
              hint="Compte créé en 2 min"
              accent="amber"
            />
          </div>
        </div>
      </section>

      {/* ─── BENTO Showcase navy (NOUVEAU) ─────────────────────────── */}
      <section className="relative -mt-12 px-4 pb-12 sm:-mt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="group/bento relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-nexus-blue-900/95 via-nexus-blue-950/95 to-nexus-blue-900/95 p-5 shadow-[0_30px_80px_-30px_rgba(12,28,64,0.55)] backdrop-blur-xl sm:p-8 lg:p-10">
            {/* Dot grid intérieur */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={DOT_GRID_DARK}
            />
            {/* Glows internes */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nexus-orange-500/15 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-nexus-blue-500/20 blur-[100px]"
            />

            <div className="relative">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                    Aperçu de l'espace
                  </span>
                  <h2 className="mt-2 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    Tout ce qui vous attend dans NEXUS CONNECT.
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>

              {/* 4 Bento tiles : style preview symbolique */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BentoTile
                  icon={FolderOpen}
                  title="Suivi de dossier"
                  description="Étape par étape, mis à jour en temps réel."
                  preview={<DossierPreview />}
                />
                <BentoTile
                  icon={Bell}
                  title="Notifications"
                  description="Soyez prévenu à chaque action importante."
                  preview={<NotifPreview />}
                  highlight
                />
                <BentoTile
                  icon={UserCircle}
                  title="Agent dédié"
                  description="Un seul interlocuteur, plusieurs canaux."
                  preview={<AgentPreview />}
                />
                <BentoTile
                  icon={FileText}
                  title="Documents"
                  description="Reçus, factures et justificatifs en un clic."
                  preview={<DocsPreview />}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 PILIERS Premium tech ──────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-white via-slate-50/40 to-white px-4 pt-12 pb-24 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={DOT_GRID_LIGHT_SUBTLE}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
              Quatre fonctionnalités essentielles
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
              Votre espace, vos outils.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <PillarCard
              icon={FolderOpen}
              title="Mes dossiers"
              description="Suivez l'avancement de vos demandes de visa, bourses, TCF, billets en temps réel."
              accent="orange"
              indicator="Temps réel"
            />
            <PillarCard
              icon={Wallet}
              title="Mes paiements"
              description="Visualisez ce que vous avez payé, ce qui reste à régler. Plus aucune surprise."
              accent="blue"
              indicator="Multi-devises"
            />
            <PillarCard
              icon={FileText}
              title="Mes documents"
              description="Téléchargez vos reçus, factures et justificatifs en un clic, à tout moment."
              accent="orange"
              indicator="PDF · 1 clic"
            />
            <PillarCard
              icon={UserCircle}
              title="Mon agent dédié"
              description="Restez en contact direct avec votre agent Nexus par WhatsApp, email ou téléphone."
              accent="blue"
              indicator="3 canaux"
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
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
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
      <section className="relative bg-gradient-to-b from-white via-slate-50/30 to-white px-4 py-24 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={DOT_GRID_LIGHT_SUBTLE}
        />
        <div className="relative mx-auto max-w-5xl">
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
      <section className="relative bg-gradient-to-b from-white to-slate-50/40 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="group/cta relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-orange-700 p-7 text-center shadow-[0_30px_80px_-30px_rgba(255,102,0,0.45)] sm:p-10 lg:p-16">
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

      {/* ─── Animation floating chips (CSS pure) ─────────────────────── */}
      <style>{`
        @keyframes floatChip {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.25; }
          50% { transform: translateY(-12px) translateX(4px); opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}

// ─── Sous-composants Premium tech ─────────────────────────────────────────

function MetricChip({
  icon: Icon,
  label,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  accent: "emerald" | "orange" | "amber";
}) {
  const dotColor =
    accent === "emerald"
      ? "bg-emerald-400"
      : accent === "orange"
        ? "bg-nexus-orange-400"
        : "bg-amber-400";
  return (
    <div className="group/metric relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-nexus-orange-300 ring-1 ring-white/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className={`relative flex h-1.5 w-1.5`}>
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor} opacity-60`}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor}`}
              />
            </span>
            <p className="text-xs font-bold text-white">{label}</p>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Bento Showcase (NOUVEAU) ──────────────────────────────────────────────
function BentoTile({
  icon: Icon,
  title,
  description,
  preview,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  preview: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <article
      className={`group/tile relative overflow-hidden rounded-2xl border bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
        highlight
          ? "border-nexus-orange-400/30 hover:border-nexus-orange-400/50"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/tile:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]">
            <Icon className="h-4 w-4" />
          </div>
          {highlight && (
            <span className="rounded-full bg-nexus-orange-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-nexus-orange-300 ring-1 ring-nexus-orange-400/30">
              Nouveau
            </span>
          )}
        </div>
        <h3 className="mt-4 font-display text-sm font-bold leading-tight text-white">
          {title}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          {description}
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          {preview}
        </div>
      </div>
    </article>
  );
}

function DossierPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-300">
          Visa Schengen
        </span>
        <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
          En cours
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="h-1 flex-1 rounded-full bg-nexus-orange-500" />
        <span className="h-1 flex-1 rounded-full bg-nexus-orange-500" />
        <span className="h-1 flex-1 rounded-full bg-nexus-orange-500" />
        <span className="h-1 flex-1 rounded-full bg-nexus-orange-500/50" />
        <span className="h-1 flex-1 rounded-full bg-white/10" />
      </div>
      <p className="text-[9px] text-slate-500">Étape 4 / 5 · Documents requis</p>
    </div>
  );
}

function NotifPreview() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-2">
        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-nexus-orange-400" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold text-white">
            Paiement reçu
          </p>
          <p className="truncate text-[9px] text-slate-500">il y a 2 min</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold text-white">
            Document validé
          </p>
          <p className="truncate text-[9px] text-slate-500">il y a 1 h</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold text-white">
            Message agent
          </p>
          <p className="truncate text-[9px] text-slate-500">hier</p>
        </div>
      </div>
    </div>
  );
}

function AgentPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-[10px] font-bold text-white">
          TK
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold text-white">
            Thierry K.
          </p>
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-emerald-300">En ligne</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
          <MessageCircle className="h-2.5 w-2.5 text-nexus-orange-300" />
        </span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
          <Headphones className="h-2.5 w-2.5 text-nexus-orange-300" />
        </span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
          <Radio className="h-2.5 w-2.5 text-nexus-orange-300" />
        </span>
      </div>
    </div>
  );
}

function DocsPreview() {
  return (
    <div className="space-y-1.5">
      {["Reçu paiement", "Facture visa", "Justificatif RDV"].map((label) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-md bg-white/[0.03] px-2 py-1.5"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <FileText className="h-2.5 w-2.5 shrink-0 text-nexus-orange-300" />
            <span className="truncate text-[10px] font-bold text-white">
              {label}
            </span>
          </div>
          <span className="text-[9px] text-slate-500">PDF</span>
        </div>
      ))}
    </div>
  );
}

// ─── Cards renforcées ──────────────────────────────────────────────────────
function PillarCard({
  icon: Icon,
  title,
  description,
  accent,
  indicator,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: "orange" | "blue";
  indicator?: string;
}) {
  const isOrange = accent === "orange";
  const gradient = isOrange
    ? "from-nexus-orange-500 to-nexus-orange-700"
    : "from-nexus-blue-700 to-nexus-blue-900";
  const glowRgba = isOrange ? "255,102,0" : "30,64,175";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-5 shadow-[0_20px_50px_-20px_rgba(12,28,64,0.18)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/50 active:-translate-y-0 sm:rounded-3xl sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: `rgba(${glowRgba}, 0.18)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:rounded-3xl"
        style={{ boxShadow: `0 24px 60px -22px rgba(${glowRgba}, 0.28)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="relative">
            <div
              aria-hidden
              className={`absolute inset-0 rounded-2xl opacity-50 blur-md transition-all duration-500 group-hover:opacity-90`}
              style={{ backgroundColor: `rgba(${glowRgba}, 0.30)` }}
            />
            <div
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 sm:h-12 sm:w-12`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          {indicator && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200/60 transition-all duration-300 group-hover:bg-nexus-orange-50 group-hover:text-nexus-orange-700 group-hover:ring-nexus-orange-200/60">
              {indicator}
            </span>
          )}
        </div>
        <h3 className="mt-4 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:mt-5 sm:text-lg">
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
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-5 shadow-[0_12px_28px_-14px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_20px_40px_-16px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />
      {/* Indicator dot orange en top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-nexus-orange-500/40 transition-all duration-300 group-hover:bg-nexus-orange-500"
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
    <article className="group relative flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-5 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)] active:-translate-y-0 sm:gap-5 sm:rounded-3xl sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />

      <div className="relative shrink-0">
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 opacity-50 blur-md transition-all duration-500 group-hover:opacity-100"
        />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 font-display text-base font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105 sm:h-12 sm:w-12 sm:text-lg">
          {number}
        </div>
      </div>

      <div className="relative flex-1 min-w-0">
        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
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
