"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckerResult } from "@/lib/visa-rules";

// ─── Card de résultat partagée — VisaRequirementChecker + EVisaEligibilityChecker
// Pattern Premium navy + orange. Aucun appel API ni état local : pure présentation.

const VERDICT_STYLE: Record<
  CheckerResult["verdict"],
  { tone: "success" | "warning" | "info"; label: string }
> = {
  e_visa: { tone: "success", label: "e-Visa éligible" },
  visa_classique: { tone: "info", label: "Visa classique" },
  biometrie_yaounde: { tone: "warning", label: "Biométrie Yaoundé" },
  transit_simple: { tone: "info", label: "Transit" },
  cas_complexe: { tone: "warning", label: "Cas à étudier" },
};

const TONE_CLASS: Record<
  "success" | "warning" | "info",
  { badge: string; icon: typeof CheckCircle2 }
> = {
  success: {
    badge: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  warning: {
    badge: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
  },
  info: {
    badge: "bg-nexus-blue-100 text-nexus-blue-700",
    icon: Globe,
  },
};

interface Props {
  result: CheckerResult;
  /** URL du CTA principal (par défaut le formulaire complet) */
  ctaHref?: string;
  ctaLabel?: string;
}

export function VisaResultCard({
  result,
  ctaHref = "/services/visa/demarrer",
  ctaLabel = "Démarrer ma demande",
}: Props) {
  const style = VERDICT_STYLE[result.verdict];
  const ToneIcon = TONE_CLASS[style.tone].icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Verdict header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            TONE_CLASS[style.tone].badge
          )}
        >
          <ToneIcon className="h-3 w-3" />
          {style.label}
        </span>
        {result.biometrieYaounde && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            <MapPin className="h-3 w-3" />
            Biométrie obligatoire à Yaoundé
          </span>
        )}
      </div>

      <h3 className="font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
        {result.title}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{result.message}</p>

      {/* Détails */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {result.delai && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Clock className="h-3 w-3 text-nexus-orange-600" />
              Délai indicatif
            </p>
            <p className="mt-1 font-display text-lg font-bold text-nexus-blue-950">
              {result.delai.min}–{result.delai.max} {result.delai.unit}
            </p>
            {result.delai.note && (
              <p className="mt-1 text-xs text-slate-500">{result.delai.note}</p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Globe className="h-3 w-3 text-nexus-orange-600" />
            e-Visa disponible
          </p>
          <p
            className={cn(
              "mt-1 font-display text-lg font-bold",
              result.hasEVisa ? "text-emerald-600" : "text-slate-500"
            )}
          >
            {result.hasEVisa ? "Oui" : "Non — visa au consulat"}
          </p>
        </div>
      </div>

      {/* Recommandation */}
      <div className="mt-5 rounded-2xl border-l-4 border-nexus-orange-500 bg-nexus-orange-50/50 p-4">
        <p className="text-sm text-nexus-blue-950">
          <span className="font-semibold">Recommandation Nexus :</span>{" "}
          {result.recommendation}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-2 text-xs text-slate-500">
          Étude initiale gratuite · Bilan de faisabilité écrit avant tout engagement
        </p>
      </div>
    </div>
  );
}
