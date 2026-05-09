import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
      {/* === Dot grid === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* === Lignes lumineuses convergentes === */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="conv-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,102,0,0)" />
            <stop offset="50%" stopColor="rgba(255,102,0,0.6)" />
            <stop offset="100%" stopColor="rgba(255,102,0,0)" />
          </linearGradient>
          <linearGradient id="conv-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,102,0,0)" />
            <stop offset="50%" stopColor="rgba(255,102,0,0.5)" />
            <stop offset="100%" stopColor="rgba(255,102,0,0)" />
          </linearGradient>
          <linearGradient id="conv-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(99,102,241,0)" />
            <stop offset="50%" stopColor="rgba(99,102,241,0.4)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </linearGradient>
        </defs>
        {/* Lignes convergentes vers le centre */}
        <line x1="0" y1="0" x2="600" y2="400" stroke="url(#conv-grad-1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1="1200" y1="0" x2="600" y2="400" stroke="url(#conv-grad-2)" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="800" x2="600" y2="400" stroke="url(#conv-grad-1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" repeatCount="indefinite" />
        </line>
        <line x1="1200" y1="800" x2="600" y2="400" stroke="url(#conv-grad-3)" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5.5s" repeatCount="indefinite" />
        </line>
        <line x1="600" y1="0" x2="600" y2="400" stroke="url(#conv-grad-1)" strokeWidth="0.6">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3.5s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="400" x2="600" y2="400" stroke="url(#conv-grad-1)" strokeWidth="0.6">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3.8s" repeatCount="indefinite" />
        </line>
        <line x1="1200" y1="400" x2="600" y2="400" stroke="url(#conv-grad-2)" strokeWidth="0.6">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="4.2s" repeatCount="indefinite" />
        </line>
      </svg>

      {/* === Orbes ambiantes === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-indigo-500/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/15 blur-[120px] animate-pulse"
      />
      {/* === Hairlines === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
        {/* === Badge pulsant === */}
        <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-nexus-orange-400" />
          </span>
          Initier la conversation
        </span>

        {/* === Titre principal === */}
        <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Confiez-nous
          <br />
          <span className="bg-gradient-to-r from-white via-nexus-orange-200 to-nexus-orange-400 bg-clip-text text-transparent">
            votre prochain dossier.
          </span>
        </h2>

        {/* === Sous-titre === */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Un conseiller Nexus prend votre situation en main sous 24 heures
          ouvrées. Étude initiale gratuite, traitement confidentiel, réponse
          écrite. Aucune décision ne se prend dans le brouillard.
        </p>

        {/* === CTA principal massif === */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/demande/complet"
            className="group/cta relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-nexus-orange-500 px-8 py-4 text-base font-bold text-white shadow-[0_15px_40px_-10px_rgba(255,102,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-nexus-orange-600 hover:shadow-[0_25px_55px_-12px_rgba(255,102,0,0.8)] sm:text-lg"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover/cta:left-[120%] group-hover/cta:opacity-100"
            />
            <FileText className="h-5 w-5" />
            Soumettre mon dossier
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>

        {/* === Trust strip premium === */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <TrustItem
            icon={Sparkles}
            label="Réponse 24h"
            sub="Bilan écrit garanti"
          />
          <TrustItem
            icon={ShieldCheck}
            label="Confidentialité"
            sub="Traitement sécurisé"
          />
          <TrustItem
            icon={FileText}
            label="Devis fixe"
            sub="Sans surprise"
          />
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon: Icon,
  label,
  sub,
}: {
  icon: typeof Sparkles;
  label: string;
  sub: string;
}) {
  return (
    <div className="group flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-400/40 hover:bg-white/[0.07]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nexus-orange-500/15 ring-1 ring-nexus-orange-500/30 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-4 w-4 text-nexus-orange-400" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">
          {sub}
        </p>
      </div>
    </div>
  );
}
