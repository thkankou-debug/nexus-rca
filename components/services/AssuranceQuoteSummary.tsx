"use client";

import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
  Hash,
  Clock,
  Wallet,
} from "lucide-react";
import {
  COVERAGE_LABELS,
  URGENCY_LABELS,
  type QuoteFormData,
} from "@/lib/insurance/types";
import { computeDurationDays, estimate, formatRange } from "@/lib/insurance/pricing";
import { AssuranceStatusTracker } from "./AssuranceStatusTracker";

/**
 * Résumé "dossier actif" du devis assurance.
 *
 * Pas un récap technique — un vrai bloc dossier premium :
 * - Référence pré-générée affichée gros (sticker en haut)
 * - Status tracker vertical (Reçu → ...)
 * - Récap dynamique mis à jour à chaque saisie du wizard
 * - Estimation tarifaire dès l'étape 3
 *
 * Style : glass, glow orange/navy, sticky top-24 desktop, collapse mobile.
 */

type Props = {
  reference: string; // Référence prévisionnelle affichée pendant la saisie
  formData: QuoteFormData;
  step: 1 | 2 | 3 | 4;
};

function isFilled(s: string): boolean {
  return Boolean(s && s.trim().length > 0);
}

export function AssuranceQuoteSummary({ reference, formData, step }: Props) {
  const duration = computeDurationDays(
    formData.date_depart,
    formData.date_retour
  );
  const est = step >= 3 ? estimate(formData) : null;

  const coverageLabels = formData.coverage_types.map(
    (c) => COVERAGE_LABELS[c]
  );

  return (
    <div className="relative">
      {/* Halo décoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/5 to-nexus-blue-500/15 opacity-70 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.30)]">
        {/* Glow décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-nexus-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
        />

        {/* ─── En-tête : référence + dossier actif ─── */}
        <div className="relative border-b border-white/10 p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 ring-1 ring-white/15 shadow-[0_8px_22px_-8px_rgba(255,102,0,0.7)]">
              <ShieldCheck className="h-4 w-4 text-white" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
              Dossier actif
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <Hash className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              Référence
            </span>
          </div>
          <p className="mt-1 break-all font-mono text-2xl font-bold leading-tight text-white sm:text-[1.7rem]">
            <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-500 bg-clip-text text-transparent">
              {reference}
            </span>
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
            </span>
            En préparation · étape {step} / 4
          </div>
        </div>

        {/* ─── Status tracker vertical ─── */}
        <div className="relative border-b border-white/10 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            Suivi du dossier
          </p>
          <div className="mt-4">
            <AssuranceStatusTracker current="recu" orientation="vertical" />
          </div>
        </div>

        {/* ─── Récap dynamique des données ─── */}
        <div className="relative space-y-3 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            Données saisies
          </p>

          <SummaryRow
            icon={FileText}
            label="Nom complet"
            value={isFilled(formData.full_name) ? formData.full_name : null}
          />
          <SummaryRow
            icon={Mail}
            label="Email"
            value={isFilled(formData.email) ? formData.email : null}
          />
          <SummaryRow
            icon={Phone}
            label="WhatsApp"
            value={isFilled(formData.whatsapp) ? formData.whatsapp : null}
          />
          <SummaryRow
            icon={MapPin}
            label="Destination"
            value={isFilled(formData.destination) ? formData.destination : null}
          />
          <SummaryRow
            icon={Calendar}
            label="Période"
            value={
              isFilled(formData.date_depart) && isFilled(formData.date_retour)
                ? `${formData.date_depart} → ${formData.date_retour}${duration ? ` (${duration} j)` : ""}`
                : null
            }
          />
          <SummaryRow
            icon={Users}
            label="Voyageurs"
            value={`${formData.num_travelers} ${formData.num_travelers > 1 ? "personnes" : "personne"}${
              formData.traveler_ages.length > 0
                ? ` · ${formData.traveler_ages.join(", ")} ans`
                : ""
            }`}
          />
          <SummaryRow
            icon={ShieldCheck}
            label="Couvertures"
            value={
              coverageLabels.length > 0 ? coverageLabels.join(" · ") : null
            }
          />
          {step >= 4 && (
            <SummaryRow
              icon={Clock}
              label="Urgence"
              value={URGENCY_LABELS[formData.urgency]}
            />
          )}
        </div>

        {/* ─── Estimation tarifaire (à partir étape 3) ─── */}
        {est && (
          <div className="relative border-t border-white/10 bg-gradient-to-br from-nexus-orange-500/10 via-nexus-orange-500/5 to-transparent p-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-nexus-orange-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                Estimation indicative
              </p>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {formatRange(est)}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
              Fourchette indicative basée sur les paramètres saisis. Le tarif
              définitif est établi après étude par notre cabinet.
            </p>
            {est.breakdown.length > 0 && (
              <ul className="mt-3 space-y-1 text-[11px] leading-tight text-slate-400">
                {est.breakdown.map((b, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-nexus-orange-400/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composant : ligne récap ────────────────────────────────────────────

type RowProps = {
  icon: typeof FileText;
  label: string;
  value: string | null;
};

function SummaryRow({ icon: Icon, label, value }: RowProps) {
  const isEmpty = !value;
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
          isEmpty
            ? "bg-white/[0.03] text-white/30"
            : "bg-gradient-to-br from-nexus-orange-500/25 to-nexus-orange-700/20 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
          {label}
        </p>
        <p
          className={`mt-0.5 break-words text-xs leading-snug ${
            isEmpty ? "italic text-white/35" : "font-semibold text-white"
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
