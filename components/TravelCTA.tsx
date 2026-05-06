import { ArrowUpRight, Hotel, Plane } from "lucide-react";

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function TravelCTA() {
  return (
    <section className="relative bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Flights */}
          <a
            href="https://www.google.com/flights"
            target="_blank"
            rel="noreferrer"
            className="group/card relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 p-8 text-white shadow-[0_24px_60px_-25px_rgba(12,28,64,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-25px_rgba(255,102,0,0.30)] sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={DOT_GRID_DARK}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-nexus-orange-500/20 blur-[100px] transition-all duration-700 group-hover/card:bg-nexus-orange-500/35"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-nexus-blue-500/15 blur-[100px]"
            />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md transition-transform duration-300 ease-out group-hover/card:scale-105">
                <Plane className="h-5 w-5 text-nexus-orange-400" />
              </div>
              <span className="mt-5 inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Vols
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Rechercher un vol.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                Comparez les meilleurs prix sur des milliers d&apos;itinéraires
                avec Google Flights. Accès direct, recherche en temps réel.
              </p>

              <span className="group/btn mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-nexus-blue-950 shadow-sm transition-all duration-300 ease-out group-hover/card:gap-3">
                Ouvrir Google Flights
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </a>

          {/* Hotels */}
          <a
            href="https://www.skyscanner.net/hotels"
            target="_blank"
            rel="noreferrer"
            className="group/card relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-orange-700 p-8 text-white shadow-[0_24px_60px_-25px_rgba(255,102,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-25px_rgba(255,102,0,0.55)] sm:p-10"
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
              className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/15 blur-[80px] transition-all duration-700 group-hover/card:bg-white/25"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-nexus-blue-950/25 blur-[80px]"
            />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-md transition-transform duration-300 ease-out group-hover/card:scale-105">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <span className="mt-5 inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-white/90">
                Hôtels
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Réserver un hôtel.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                Skyscanner compare des millions d&apos;hôtels dans le monde
                entier. Confort garanti, meilleurs tarifs.
              </p>

              <span className="group/btn mt-7 inline-flex items-center gap-2 rounded-2xl bg-nexus-blue-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 ease-out group-hover/card:gap-3">
                Ouvrir Skyscanner
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
