import {
  ArrowUpRight,
  Globe2,
  Hotel,
  Plane,
} from "lucide-react";

const DESTINATIONS = [
  "Paris",
  "Montréal",
  "Bruxelles",
  "Casablanca",
  "Dubaï",
  "Yaoundé",
  "Istanbul",
  "Genève",
  "Toronto",
  "Bangui",
  "Douala",
  "Tunis",
  "Le Caire",
  "Madrid",
  "Lisbonne",
];

export function TravelCTA() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-24 sm:py-28 lg:py-32">
      {/* === Couches de fond profondeur === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* === Globe SVG cinéma === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 hidden h-[40rem] w-[40rem] -translate-y-1/2 opacity-[0.18] lg:block"
      >
        <svg viewBox="0 0 600 600" fill="none" className="h-full w-full animate-[float_12s_ease-in-out_infinite]">
          <circle cx="300" cy="300" r="280" stroke="rgba(255,102,0,0.5)" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="220" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="160" stroke="rgba(255,102,0,0.3)" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="280" ry="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="280" ry="160" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="280" ry="220" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="100" ry="280" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="160" ry="280" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="220" ry="280" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {/* Hubs */}
          <circle cx="380" cy="220" r="6" fill="rgb(255,102,0)" className="animate-pulse" />
          <circle cx="200" cy="180" r="4" fill="rgba(255,255,255,0.6)" className="animate-pulse" />
          <circle cx="160" cy="380" r="5" fill="rgb(255,102,0)" className="animate-pulse" />
          <circle cx="420" cy="380" r="4" fill="rgba(255,255,255,0.6)" className="animate-pulse" />
          {/* Connections animées */}
          <path d="M 380 220 Q 290 100 200 180" stroke="rgba(255,102,0,0.4)" strokeWidth="0.8" strokeDasharray="4 4" fill="none">
            <animate attributeName="stroke-dashoffset" values="0;-40" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M 380 220 Q 500 280 420 380" stroke="rgba(255,102,0,0.4)" strokeWidth="0.8" strokeDasharray="4 4" fill="none">
            <animate attributeName="stroke-dashoffset" values="0;-40" dur="3.5s" repeatCount="indefinite" />
          </path>
          <path d="M 160 380 Q 290 500 420 380" stroke="rgba(255,102,0,0.3)" strokeWidth="0.8" strokeDasharray="4 4" fill="none">
            <animate attributeName="stroke-dashoffset" values="0;-40" dur="4s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      {/* === Orbes ambiantes === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-indigo-500/15 blur-[120px]"
      />

      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mb-14 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
            <Globe2 className="h-3 w-3" />
            Mobilité internationale
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Le monde,
            <br />
            <span className="text-nexus-orange-400">à portée de votre dossier.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Vols internationaux, hôtellerie professionnelle, transferts —
            orchestrés depuis Bangui par des conseillers qui connaissent les
            destinations, les fenêtres tarifaires et les opérateurs fiables.
          </p>
        </div>

        {/* === Marquee destinations === */}
        <div className="marquee-track mb-12 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] py-3 backdrop-blur-md">
          <div className="animate-marquee flex shrink-0 items-center gap-8 pl-8 whitespace-nowrap">
            {[...DESTINATIONS, ...DESTINATIONS].map((city, i) => (
              <span
                key={`${city}-${i}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300"
              >
                <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* === 2 cards majestueuses === */}
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Vols */}
          <a
            href="https://www.google.com/flights"
            target="_blank"
            rel="noreferrer"
            className="group/card relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0F1B40] via-nexus-blue-900 to-[#0F1B40] p-8 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)] transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-400/50 hover:shadow-[0_40px_80px_-25px_rgba(255,102,0,0.45)] sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/20 blur-[100px] transition-all duration-700 group-hover/card:bg-nexus-orange-500/40"
            />
            {/* Icône avion XXL en arrière-plan */}
            <Plane
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-6 h-48 w-48 -rotate-12 text-white/[0.04] transition-all duration-700 group-hover/card:rotate-0 group-hover/card:text-nexus-orange-400/[0.10]"
            />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nexus-orange-500/15 ring-1 ring-nexus-orange-500/30 backdrop-blur-md transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-6">
                <Plane className="h-5 w-5 text-nexus-orange-400" />
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
                Vols & itinéraires
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Réservez vos vols internationaux.
              </h3>
              <div
                aria-hidden
                className="my-4 h-px w-12 bg-gradient-to-r from-nexus-orange-400 to-transparent"
              />
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Comparez en temps réel les tarifs sur des milliers
                d&apos;itinéraires. Accès direct via Google Flights — Nexus
                vous accompagne sur les billets complexes.
              </p>

              <span className="group/btn mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-nexus-blue-950 shadow-sm transition-all duration-300 group-hover/card:gap-3 group-hover/card:bg-nexus-orange-500 group-hover/card:text-white">
                Ouvrir Google Flights
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </a>

          {/* Hôtels */}
          <a
            href="https://www.skyscanner.net/hotels"
            target="_blank"
            rel="noreferrer"
            className="group/card relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-orange-700 p-8 shadow-[0_30px_60px_-25px_rgba(255,102,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_80px_-25px_rgba(255,102,0,0.7)] sm:p-10"
          >
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
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-[80px] transition-all duration-700 group-hover/card:bg-white/30"
            />
            {/* Icône hôtel XXL en arrière-plan */}
            <Hotel
              aria-hidden
              className="pointer-events-none absolute -right-4 -bottom-4 h-48 w-48 text-white/[0.08] transition-all duration-700 group-hover/card:scale-110 group-hover/card:text-white/[0.16]"
            />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-md transition-transform duration-500 group-hover/card:scale-110">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-white/90">
                Hôtellerie & hébergement
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Réservez l&apos;adresse qui s&apos;impose.
              </h3>
              <div
                aria-hidden
                className="my-4 h-px w-12 bg-gradient-to-r from-white/80 to-transparent"
              />
              <p className="text-sm leading-relaxed text-white/95 sm:text-base">
                Hôtellerie professionnelle dans les principales capitales.
                Skyscanner pour la comparaison — Nexus pour les négociations
                groupées et les séjours complexes.
              </p>

              <span className="group/btn mt-7 inline-flex items-center gap-2 rounded-2xl bg-nexus-blue-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 group-hover/card:gap-3">
                Ouvrir Skyscanner
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
