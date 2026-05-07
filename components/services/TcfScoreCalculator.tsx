"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  GraduationCap,
  Info,
  Plane,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

// Référence officielle des paliers NCLC mappés au TCF Canada (toutes épreuves
// confondues — le score officiel est par épreuve mais cet outil donne un
// ordre de grandeur unique à titre indicatif).
type Tier = {
  nclc: number;
  min: number;
  max: number;
  cefr: string;
  tone: "rose" | "orange" | "emerald";
  uses: { icon: typeof Plane; label: string }[];
};

const TIERS: Tier[] = [
  {
    nclc: 4,
    min: 331,
    max: 368,
    cefr: "A2+",
    tone: "rose",
    uses: [{ icon: Briefcase, label: "Permis de travail (certains)" }],
  },
  {
    nclc: 5,
    min: 369,
    max: 397,
    cefr: "B1−",
    tone: "rose",
    uses: [{ icon: Briefcase, label: "Permis de travail provincial" }],
  },
  {
    nclc: 6,
    min: 398,
    max: 455,
    cefr: "B1",
    tone: "orange",
    uses: [{ icon: Plane, label: "Études Canada (certains programmes)" }],
  },
  {
    nclc: 7,
    min: 456,
    max: 523,
    cefr: "B2",
    tone: "orange",
    uses: [{ icon: Plane, label: "Express Entry — points francophones" }],
  },
  {
    nclc: 8,
    min: 524,
    max: 548,
    cefr: "B2+",
    tone: "orange",
    uses: [{ icon: Plane, label: "Express Entry — score renforcé" }],
  },
  {
    nclc: 9,
    min: 549,
    max: 694,
    cefr: "C1",
    tone: "emerald",
    uses: [{ icon: GraduationCap, label: "PEQ Québec · Mobilité francophone" }],
  },
  {
    nclc: 10,
    min: 695,
    max: 699,
    cefr: "C2",
    tone: "emerald",
    uses: [{ icon: GraduationCap, label: "Profil francophone avancé" }],
  },
];

function tierFor(score: number): Tier {
  for (const t of TIERS) {
    if (score >= t.min && score <= t.max) return t;
  }
  return score < 331 ? TIERS[0] : TIERS[TIERS.length - 1];
}

const TONE_TEXT: Record<Tier["tone"], string> = {
  rose: "text-rose-300",
  orange: "text-nexus-orange-300",
  emerald: "text-emerald-300",
};
const TONE_RING: Record<Tier["tone"], string> = {
  rose: "ring-rose-400/30 border-rose-400/40 from-rose-500/15",
  orange:
    "ring-nexus-orange-400/30 border-nexus-orange-400/40 from-nexus-orange-500/15",
  emerald: "ring-emerald-400/30 border-emerald-400/40 from-emerald-500/15",
};
const TONE_TRACK: Record<Tier["tone"], string> = {
  rose: "bg-rose-500",
  orange: "bg-nexus-orange-500",
  emerald: "bg-emerald-500",
};

export function TcfScoreCalculator() {
  const [score, setScore] = useState<number>(456);

  const { tier, percent, idx } = useMemo(() => {
    const t = tierFor(score);
    const p = Math.max(0, Math.min(100, ((score - 100) / (699 - 100)) * 100));
    const i = TIERS.findIndex((x) => x.nclc === t.nclc);
    return { tier: t, percent: p, idx: i };
  }, [score]);

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br via-white/[0.04] to-white/[0.02] p-7 ring-1 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.25)] sm:p-9 ${TONE_RING[tier.tone]}`}
    >
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
              <Calculator className="h-6 w-6" />
            </div>
          </div>
          <div>
            <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
              Simulateur
            </span>
            <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
              Estimer votre niveau NCLC
            </h3>
          </div>
        </div>

        {/* Score géant */}
        <div className="mt-7 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
            Score TCF estimé
          </p>
          <p
            className={`mt-2 font-display text-7xl font-bold leading-none tabular-nums sm:text-8xl ${TONE_TEXT[tier.tone]}`}
          >
            {score}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className={TONE_TEXT[tier.tone]}>NCLC {tier.nclc}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span className="text-white/70">CEFR {tier.cefr}</span>
          </p>
        </div>

        {/* Slider */}
        <div className="mt-7">
          <label
            htmlFor="tcf-score"
            className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300"
          >
            <span>Glisser pour ajuster</span>
            <span className="tabular-nums text-white/60">100 — 699</span>
          </label>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${TONE_TRACK[tier.tone]}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <input
              id="tcf-score"
              type="range"
              min={100}
              max={699}
              step={1}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="relative h-6 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-nexus-orange-500 [&::-webkit-slider-thumb]:shadow-[0_8px_20px_-4px_rgba(255,102,0,0.7)] [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-nexus-orange-500"
            />
          </div>

          {/* Échelle NCLC */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {TIERS.map((t, i) => (
              <button
                key={t.nclc}
                type="button"
                onClick={() => setScore(Math.round((t.min + t.max) / 2))}
                className={`rounded-lg border px-1 py-1.5 text-[9px] font-bold uppercase tracking-[0.10em] transition-all duration-200 backdrop-blur ${
                  i === idx
                    ? "border-nexus-orange-400/60 bg-nexus-orange-500/15 text-white shadow-[0_4px_14px_-4px_rgba(255,102,0,0.5)]"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-nexus-orange-400/30 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                NCLC {t.nclc}
              </button>
            ))}
          </div>
        </div>

        {/* Recommandation */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 ring-1 ring-white/5 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
            Niveau adapté pour
          </p>
          <ul className="mt-3 space-y-2">
            {tier.uses.map((u) => {
              const Icon = u.icon;
              return (
                <li
                  key={u.label}
                  className="flex items-center gap-3 text-sm leading-snug text-slate-200"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-500/10 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30 backdrop-blur">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{u.label}</span>
                </li>
              );
            })}
            <li className="flex items-center gap-3 text-sm leading-snug text-slate-200">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-500/10 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30 backdrop-blur">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span>
                Plage TCF :{" "}
                <span className="font-bold tabular-nums text-white">
                  {tier.min}–{tier.max}
                </span>
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-300" />
          <p>
            Estimation indicative. Le score officiel est par épreuve. Notre
            test de positionnement gratuit donne un bilan précis avant tout
            engagement.
          </p>
        </div>

        <div className="mt-5">
          <Link
            href="/services/tcf/demarrer"
            className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
            />
            Demander un test de positionnement
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
