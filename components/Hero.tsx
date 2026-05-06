import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  FilePlus,
  Globe2,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

// ─── Pattern dot grid (Stripe-like) ─────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Hero Premium tech — direction Stripe + Arc + fintech ────────────────────
// Server component, zero framer-motion, animations CSS pures.
// Cohérent avec /contact, /a-propos, /nexus-connect.
// ────────────────────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-28 pb-20 text-white sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
      {/* Dot grid pattern subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={DOT_GRID_DARK}
      />

      {/* Orb central rayonnant + 2 blobs latéraux */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/12 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />

      {/* Bordure inférieure éclairée gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="max-w-3xl">
          {/* Eyebrow Premium tech */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/40 hover:bg-white/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
            </span>
            Agence Internationale · Bangui
          </span>

          {/* TITRE — h1 contenu, leading tight, tracking tight */}
          <h1 className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            L&apos;accompagnement qui transforme{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                vos projets
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
              />
            </span>{" "}
            en réalité.
          </h1>

          {/* Sous-titre */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Démarches administratives, projets internationaux, partenariats et
            financement. Un accompagnement structuré, fiable et axé sur des
            résultats concrets.
          </p>

          {/* CTAs Premium tech */}
          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/demande/complet"
              className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              <FilePlus className="h-4 w-4" />
              Soumettre un dossier
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </Link>
            <Link
              href="/rendez-vous"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              <Calendar className="h-4 w-4" />
              Prendre rendez-vous
            </Link>
          </div>

          {/* Trust signals inline */}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
              Premier contact gratuit
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
              <Clock className="h-3.5 w-3.5 text-nexus-orange-300" />
              Réponse sous 24 h
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-nexus-orange-300" />
              100% confidentiel
            </span>
          </div>

          {/* Stats premium — 3 cards glassmorphism (mobile : 1 col stack, desktop : 3 col) */}
          <div className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard number="10+" label="Services experts" highlight />
            <StatCard number="24 h" label="Délai de réponse" />
            <StatCard
              number="2"
              label="Pôles internationaux"
              hint="Bangui · Canada"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sous-composant Stat premium ───────────────────────────────────────────
function StatCard({
  number,
  label,
  hint,
  highlight = false,
}: {
  number: string;
  label: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group/stat relative overflow-hidden rounded-2xl border bg-white/[0.04] px-5 py-4 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
        highlight
          ? "border-nexus-orange-400/30 hover:border-nexus-orange-400/60"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      {/* Glow corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/stat:bg-nexus-orange-500/20"
      />
      <div className="relative">
        <p className="font-display text-2xl font-bold leading-none text-white sm:text-3xl">
          <span className="bg-gradient-to-r from-nexus-orange-300 to-nexus-orange-500 bg-clip-text text-transparent">
            {number}
          </span>
        </p>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>
        )}
      </div>
    </div>
  );
}
