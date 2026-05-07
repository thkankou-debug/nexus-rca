"use client";

import { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type LevelKey = "bac" | "licence" | "master" | "doctorat" | "autre";

const LEVELS: {
  key: LevelKey;
  label: string;
  icon: typeof GraduationCap;
}[] = [
  { key: "bac", label: "Bac", icon: BookOpen },
  { key: "licence", label: "Licence", icon: GraduationCap },
  { key: "master", label: "Master", icon: Award },
  { key: "doctorat", label: "Doctorat", icon: Sparkles },
  { key: "autre", label: "Autre", icon: ArrowRight },
];

const MESSAGES: Record<LevelKey, { title: string; desc: string }> = {
  bac: {
    title: "Vous pouvez postuler en Cégep ou première année d'université.",
    desc: "Le baccalauréat centrafricain donne accès aux Cégeps techniques (1 à 3 ans) et aux licences universitaires. Choix selon projet professionnel et budget.",
  },
  licence: {
    title: "Master direct ou 2e licence selon profil.",
    desc: "Avec une licence RCA validée, l'accès direct au Master canadien est possible si le programme et les notes correspondent. Sinon, équivalence ou licence canadienne complémentaire.",
  },
  master: {
    title: "Doctorat ou marché du travail.",
    desc: "Un Master ouvre la voie au doctorat (financements ciblés disponibles) ou au permis de travail post-diplôme via une mention spécialisée.",
  },
  doctorat: {
    title: "Recherche, postdoc, mais aussi PR Canada accessible.",
    desc: "Avec un doctorat, plusieurs programmes provinciaux de résidence permanente sont accessibles. Bourses postdoctorales et postes universitaires possibles.",
  },
  autre: {
    title: "Évaluation comparative requise — bilan personnalisé.",
    desc: "Diplôme professionnel, formation continue ou parcours atypique : nous étudions votre cas avec une évaluation comparative des études (ECE) avant orientation.",
  },
};

export function EducationLevelSelector() {
  const [active, setActive] = useState<LevelKey>("licence");
  const message = MESSAGES[active];

  return (
    <div className="relative">
      {/* Boutons radio */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {LEVELS.map((lvl) => {
          const Icon = lvl.icon;
          const isActive = active === lvl.key;
          return (
            <button
              key={lvl.key}
              type="button"
              onClick={() => setActive(lvl.key)}
              aria-pressed={isActive}
              className={`group relative overflow-hidden rounded-2xl border px-3 py-4 text-center backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out ${
                isActive
                  ? "border-nexus-orange-400/60 bg-gradient-to-br from-nexus-orange-500/20 via-white/[0.06] to-white/[0.02] ring-1 ring-nexus-orange-400/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-16px_rgba(255,102,0,0.45)]"
                  : "border-white/10 bg-white/[0.04] ring-1 ring-white/5 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
              }`}
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-all duration-500 ${
                  isActive
                    ? "bg-nexus-orange-500/30"
                    : "bg-nexus-orange-500/0 group-hover:bg-nexus-orange-500/15"
                }`}
              />
              <div className="relative flex flex-col items-center gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition-transform duration-300 ease-out ${
                    isActive
                      ? "scale-110 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.6)] ring-white/10"
                      : "bg-white/[0.04] text-nexus-orange-300 ring-white/10 group-hover:scale-105"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={`font-display text-xs font-bold uppercase tracking-[0.16em] ${
                    isActive ? "text-white" : "text-white/80"
                  }`}
                >
                  {lvl.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Message dynamique glass orange highlight */}
      <article
        key={active}
        className="relative mt-7 overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/12 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/20 blur-[100px]"
        />
        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
              Niveau {LEVELS.find((l) => l.key === active)?.label} → Canada
            </span>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight text-white sm:text-xl">
              {message.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
              {message.desc}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
