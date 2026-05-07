"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

// ─── Suggestions populaires (statiques, indicatives) ──────────────────────
type Suggestion = {
  from: string;
  to: string;
  flag: string;
  price: string;
  duration: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    from: "Bangui",
    to: "Paris CDG",
    flag: "🇫🇷",
    price: "≈ 740 000 FCFA",
    duration: "≈ 9h30 · 1 escale",
  },
  {
    from: "Bangui",
    to: "Casablanca",
    flag: "🇲🇦",
    price: "≈ 520 000 FCFA",
    duration: "≈ 7h · 1 escale",
  },
  {
    from: "Bangui",
    to: "Yaoundé",
    flag: "🇨🇲",
    price: "≈ 220 000 FCFA",
    duration: "≈ 1h30 · direct",
  },
];

type TripType = "round" | "oneway";
type TravelClass = "eco" | "biz";

/**
 * Mock interface de recherche de vol — purement visuel.
 * Aucune soumission réelle : le bouton renvoie vers /demande/complet.
 */
export function FlightSearchMock() {
  const [tripType, setTripType] = useState<TripType>("round");
  const [travelClass, setTravelClass] = useState<TravelClass>("eco");
  const [passengers, setPassengers] = useState<number>(1);

  return (
    <div className="relative">
      {/* Halo orange autour de la card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-nexus-orange-500/15 blur-2xl"
      />

      <article className="relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-orange-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nexus-orange-500/25 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-nexus-blue-500/20 blur-[100px]"
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                <Plane className="h-6 w-6" />
              </div>
            </div>
            <div>
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Recherche de vol
              </span>
              <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                Composez votre itinéraire
              </h3>
            </div>
          </div>

          {/* Toggle aller-retour / aller simple + classe */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 ring-1 ring-white/5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setTripType("round")}
                className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                  tripType === "round"
                    ? "bg-nexus-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Aller-retour
              </button>
              <button
                type="button"
                onClick={() => setTripType("oneway")}
                className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                  tripType === "oneway"
                    ? "bg-nexus-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Aller simple
              </button>
            </div>

            <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 ring-1 ring-white/5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setTravelClass("eco")}
                className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                  travelClass === "eco"
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Économique
              </button>
              <button
                type="button"
                onClick={() => setTravelClass("biz")}
                className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                  travelClass === "biz"
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Affaires
              </button>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5 ring-1 ring-white/5 backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-nexus-orange-300" />
              <button
                type="button"
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="h-5 w-5 rounded-full border border-white/15 text-xs font-bold text-white/80 transition-all hover:border-nexus-orange-400/50 hover:text-white"
                aria-label="Diminuer passagers"
              >
                −
              </button>
              <span className="font-display text-xs font-bold tabular-nums text-white">
                {passengers} {passengers > 1 ? "voyageurs" : "voyageur"}
              </span>
              <button
                type="button"
                onClick={() => setPassengers(Math.min(9, passengers + 1))}
                className="h-5 w-5 rounded-full border border-white/15 text-xs font-bold text-white/80 transition-all hover:border-nexus-orange-400/50 hover:text-white"
                aria-label="Augmenter passagers"
              >
                +
              </button>
            </div>
          </div>

          {/* Inputs grille 4 col desktop / stack mobile */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Départ */}
            <label className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 focus-within:border-nexus-orange-400/50 focus-within:bg-white/[0.06]">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                <PlaneTakeoff className="h-3 w-3" />
                Départ
              </span>
              <input
                type="text"
                defaultValue="Bangui M'Poko (BGF)"
                aria-label="Aéroport de départ"
                className="mt-1 w-full bg-transparent font-display text-sm font-bold text-white outline-none placeholder:text-white/40 sm:text-base"
              />
            </label>

            {/* Arrivée */}
            <label className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 focus-within:border-nexus-orange-400/50 focus-within:bg-white/[0.06]">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                <PlaneLanding className="h-3 w-3" />
                Arrivée
              </span>
              <input
                type="text"
                defaultValue="Paris CDG (CDG)"
                aria-label="Aéroport d'arrivée"
                className="mt-1 w-full bg-transparent font-display text-sm font-bold text-white outline-none placeholder:text-white/40 sm:text-base"
              />
            </label>

            {/* Date départ */}
            <label className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 focus-within:border-nexus-orange-400/50 focus-within:bg-white/[0.06]">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                <Calendar className="h-3 w-3" />
                Aller
              </span>
              <input
                type="text"
                defaultValue="Sam. 14 juin"
                aria-label="Date de départ"
                className="mt-1 w-full bg-transparent font-display text-sm font-bold text-white outline-none placeholder:text-white/40 sm:text-base"
              />
            </label>

            {/* Date retour */}
            <label
              className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 focus-within:border-nexus-orange-400/50 focus-within:bg-white/[0.06] ${
                tripType === "oneway" ? "opacity-50" : ""
              }`}
            >
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                <Calendar className="h-3 w-3" />
                Retour {tripType === "oneway" ? "(désactivé)" : ""}
              </span>
              <input
                type="text"
                defaultValue={tripType === "round" ? "Dim. 29 juin" : "—"}
                disabled={tripType === "oneway"}
                aria-label="Date de retour"
                className="mt-1 w-full bg-transparent font-display text-sm font-bold text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed sm:text-base"
              />
            </label>
          </div>

          {/* CTA bouton primary shimmer */}
          <div className="mt-6">
            <Link
              href="/demande/complet"
              className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)] sm:w-auto"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              <Search className="h-4 w-4" />
              Rechercher des vols
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-white/60">
              Outil indicatif. Soumettez votre demande pour recevoir 2 à 3
              options réelles sous 24 h ouvrées, paiement en FCFA à Bangui.
            </p>
          </div>

          {/* Suggestions populaires */}
          <div className="mt-7 border-t border-white/10 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-nexus-orange-300" />
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Routes populaires depuis Bangui
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s.to}
                  href="/demande/complet"
                  className="group/sug relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/sug:bg-nexus-orange-500/20"
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-nexus-orange-300" />
                      <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                        {s.from} → {s.to}
                      </span>
                      <span className="text-sm leading-none">{s.flag}</span>
                    </div>
                    <p className="mt-2 font-display text-base font-bold tabular-nums text-white">
                      {s.price}
                    </p>
                    <p className="mt-1 text-[11px] text-white/60">
                      {s.duration}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
