"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Coins,
  Info,
  TrendingUp,
} from "lucide-react";

// Taux mid indicatifs : 1 unité étrangère = X FCFA
const RATES_TO_XAF: Record<string, number> = {
  XAF: 1,
  EUR: 656.4,
  USD: 600.1,
  CAD: 440.2,
  GBP: 763.5,
  MAD: 65.4,
};

type Currency = keyof typeof RATES_TO_XAF;

const CURRENCIES: { code: Currency; label: string; flag: string }[] = [
  { code: "XAF", label: "FCFA", flag: "🇨🇫" },
  { code: "EUR", label: "EUR", flag: "🇪🇺" },
  { code: "USD", label: "USD", flag: "🇺🇸" },
  { code: "CAD", label: "CAD", flag: "🇨🇦" },
  { code: "GBP", label: "GBP", flag: "🇬🇧" },
  { code: "MAD", label: "MAD", flag: "🇲🇦" },
];

// Marge Nexus indicative
const SPREAD = 0.005; // 0,5 %

function formatNumber(n: number, currency: Currency): string {
  if (!Number.isFinite(n)) return "—";
  const decimals = currency === "XAF" ? 0 : 2;
  // Format manuel FR sans toLocaleString (pas de espace insécable)
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart ? `${grouped},${decPart}` : grouped;
}

export function CurrencyConverterPro() {
  const [amount, setAmount] = useState<string>("100");
  const [from, setFrom] = useState<Currency>("EUR");
  const [to, setTo] = useState<Currency>("XAF");

  const { converted, midRate, clientRate } = useMemo(() => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return { converted: 0, midRate: 0, clientRate: 0 };
    }
    const mid = RATES_TO_XAF[from] / RATES_TO_XAF[to];
    // Spread appliqué au défaveur du client
    const client = mid * (1 - SPREAD);
    return {
      converted: value * client,
      midRate: mid,
      clientRate: client,
    };
  }, [amount, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-orange-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.25)] sm:p-9">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/25 blur-[100px]"
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
              <Coins className="h-6 w-6" />
            </div>
          </div>
          <div>
            <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
              Convertisseur Pro
            </span>
            <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
              Estimer votre change
            </h3>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          {/* Montant + devise départ */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
              Montant à changer
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-display text-xl font-bold tabular-nums text-white placeholder:text-white/30 ring-1 ring-white/5 backdrop-blur transition-all duration-200 focus:border-nexus-orange-400/60 focus:outline-none focus:ring-2 focus:ring-nexus-orange-400/30 sm:text-2xl"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value as Currency)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white ring-1 ring-white/5 backdrop-blur transition-all duration-200 focus:border-nexus-orange-400/60 focus:outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="bg-nexus-blue-950"
                  >
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bouton swap orange */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={swap}
              aria-label="Inverser les devises"
              className="group/swap relative flex h-11 w-11 items-center justify-center rounded-full border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.6)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(255,102,0,0.7)]"
            >
              <ArrowLeftRight className="h-4 w-4 transition-transform duration-300 group-hover/swap:rotate-180" />
            </button>
          </div>

          {/* Résultat + devise arrivée */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
              Vous obtenez
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="flex items-center rounded-2xl border border-nexus-orange-400/30 bg-nexus-orange-500/[0.08] px-4 py-3 ring-1 ring-nexus-orange-400/15 backdrop-blur">
                <span className="font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
                  ≈ {formatNumber(converted, to)}
                </span>
              </div>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value as Currency)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white ring-1 ring-white/5 backdrop-blur transition-all duration-200 focus:border-nexus-orange-400/60 focus:outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="bg-nexus-blue-950"
                  >
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats taux mid + spread */}
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
              <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                <TrendingUp className="h-3 w-3" />
                Taux mid
              </p>
              <p className="mt-1 font-display text-sm font-bold tabular-nums text-white">
                1 {from === "XAF" ? "FCFA" : from} ={" "}
                {midRate >= 1
                  ? formatNumber(midRate, "XAF")
                  : midRate.toFixed(4).replace(".", ",")}{" "}
                {to === "XAF" ? "FCFA" : to}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                Marge Nexus
              </p>
              <p className="mt-1 font-display text-sm font-bold tabular-nums text-white">
                0,5 % incluse
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                Taux client
              </p>
              <p className="mt-1 font-display text-sm font-bold tabular-nums text-white">
                {clientRate >= 1
                  ? formatNumber(clientRate, "XAF")
                  : clientRate.toFixed(4).replace(".", ",")}
              </p>
            </div>
          </div>
        </div>

        {/* Note légale */}
        <div className="mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-300" />
          <p>
            Taux indicatifs — confirmés au comptoir avant toute transaction.
            La marge Nexus de 0,5 % est déjà incluse dans le taux client
            affiché.
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/services/change/demarrer"
            className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
            />
            Demander mon devis
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
