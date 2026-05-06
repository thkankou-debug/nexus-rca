"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Smartphone,
  XCircle,
  Zap,
} from "lucide-react";
import { DESTINATIONS, getDestination } from "@/lib/visa-form";
import { getDelai } from "@/lib/visa-rules";
import { cn } from "@/lib/utils";

// ─── EVisaEligibilityChecker ───────────────────────────────────────────────
// Sélecteur destination → ✅/❌ e-Visa + délai + recommandation rapide.
// 100 % client, zéro dépendance vers le formulaire.

export function EVisaEligibilityChecker() {
  const [destination, setDestination] = useState("");

  const dest = useMemo(() => getDestination(destination), [destination]);
  const delai = useMemo(() => getDelai(destination), [destination]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-nexus-blue-950">
            Éligibilité e-Visa
          </h3>
          <p className="text-xs text-slate-500">
            Vérifiez si votre destination accepte le visa électronique
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="evc-destination"
          className="mb-1.5 block text-xs font-semibold text-nexus-blue-950"
        >
          Choisissez votre destination
        </label>
        <select
          id="evc-destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
        >
          <option value="">Sélectionner un pays…</option>
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.emoji} {d.label}
            </option>
          ))}
        </select>
      </div>

      {dest && (
        <div className="mt-6">
          <div
            className={cn(
              "rounded-2xl border-2 p-5",
              dest.hasEVisa
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-rose-200 bg-rose-50/40"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  dest.hasEVisa
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {dest.hasEVisa ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-lg font-bold text-nexus-blue-950">
                  {dest.emoji} {dest.label} —{" "}
                  {dest.hasEVisa ? "e-Visa disponible" : "Pas d'e-Visa"}
                </h4>
                <p className="mt-1 text-sm text-slate-600">
                  {dest.hasEVisa ? (
                    <>
                      Procédure 100 % en ligne. Aucun déplacement à Yaoundé requis.
                      Idéal pour tourisme, business et famille.
                    </>
                  ) : (
                    <>
                      Visa classique au consulat requis.
                      {dest.requiresBiometrieYaounde &&
                        " Biométrie obligatoire à Yaoundé (Cameroun)."}
                    </>
                  )}
                </p>

                {/* Mini grille infos */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {delai && (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <Zap className="h-3 w-3 text-nexus-orange-600" />
                        Délai indicatif
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-nexus-blue-950">
                        {delai.min}–{delai.max} jours
                      </p>
                    </div>
                  )}

                  {dest.requiresBiometrieYaounde && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                        <MapPin className="h-3 w-3" />
                        Biométrie
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-rose-700">
                        Yaoundé obligatoire
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href="/services/visa/demarrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
                >
                  {dest.hasEVisa ? "Démarrer mon e-Visa" : "Démarrer ma demande"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {!dest && (
        <p className="mt-5 text-xs text-slate-500">
          Liste des destinations couvertes par Nexus RCA. Si la vôtre n'apparaît pas,
          contactez-nous : nous traitons à la demande.
        </p>
      )}
    </div>
  );
}
