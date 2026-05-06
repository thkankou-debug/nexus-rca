"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  DESTINATIONS,
  TYPES_VISA_OPTIONS,
  DUREES,
  type TypeVisa,
  type DureeSejour,
} from "@/lib/visa-form";
import { computeRequirement } from "@/lib/visa-rules";
import { VisaResultCard } from "@/components/visa/VisaResultCard";

// ─── VisaRequirementChecker ────────────────────────────────────────────────
// Mini-checker public : 3 questions → verdict synthétique.
// 100 % client, zéro dépendance vers VisaForm.tsx (formulaire de soumission).

export function VisaRequirementChecker() {
  const [destination, setDestination] = useState("");
  const [type, setType] = useState<TypeVisa | "">("");
  const [duree, setDuree] = useState<DureeSejour | "">("");

  const result = useMemo(() => {
    if (!destination || !type || !duree) return null;
    return computeRequirement(destination, type, duree);
  }, [destination, type, duree]);

  const reset = () => {
    setDestination("");
    setType("");
    setDuree("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-nexus-blue-950">
            Vérifier mes exigences visa
          </h3>
          <p className="text-xs text-slate-500">
            Réponse en 60 secondes — sans inscription
          </p>
        </div>
      </div>

      {/* 3 questions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="vrc-destination"
            className="mb-1.5 block text-xs font-semibold text-nexus-blue-950"
          >
            Destination
          </label>
          <select
            id="vrc-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
          >
            <option value="">Choisir un pays…</option>
            {DESTINATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.emoji} {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="vrc-type"
            className="mb-1.5 block text-xs font-semibold text-nexus-blue-950"
          >
            Type de voyage
          </label>
          <select
            id="vrc-type"
            value={type}
            onChange={(e) => setType(e.target.value as TypeVisa | "")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
          >
            <option value="">Motif…</option>
            {TYPES_VISA_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="vrc-duree"
            className="mb-1.5 block text-xs font-semibold text-nexus-blue-950"
          >
            Durée prévue
          </label>
          <select
            id="vrc-duree"
            value={duree}
            onChange={(e) => setDuree(e.target.value as DureeSejour | "")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
          >
            <option value="">Durée…</option>
            {DUREES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultat */}
      {result && (
        <div className="mt-6">
          <VisaResultCard result={result} />
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-xs font-semibold text-slate-500 underline-offset-4 hover:text-nexus-orange-600 hover:underline"
          >
            Recommencer la vérification
          </button>
        </div>
      )}

      {!result && (
        <p className="mt-5 text-xs text-slate-500">
          Sélectionnez les 3 champs pour obtenir un avis Nexus instantané.
        </p>
      )}
    </div>
  );
}
