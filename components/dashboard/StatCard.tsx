"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import { Sparkline } from "@/components/ui/Sparkline";
import type { DemandeStatus, UrgenceLevel } from "@/types";

type Accent = "blue" | "orange" | "green" | "red";

const ACCENT_GRADIENT: Record<Accent, string> = {
  blue: "from-nexus-blue-600 to-nexus-blue-800",
  orange: "from-nexus-orange-400 to-nexus-orange-600",
  green: "from-emerald-400 to-emerald-600",
  red: "from-rose-400 to-rose-600",
};

const ACCENT_TEXT: Record<Accent, string> = {
  blue: "text-nexus-blue-500",
  orange: "text-nexus-orange-500",
  green: "text-emerald-500",
  red: "text-rose-500",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  href,
  trend,
  delta,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  /** Si fourni, la carte devient cliquable et redirige vers ce chemin */
  href?: string;
  /** Série de valeurs pour la sparkline (au moins 2 points) */
  trend?: number[];
  /** Variation en % vs période précédente (signée) */
  delta?: number;
}) {
  const showSparkline = trend && trend.length >= 2;
  const showDelta = typeof delta === "number" && Number.isFinite(delta);

  // Direction du delta : positive = green, negative = rose, 0 = neutre
  const deltaUp = showDelta && delta! > 0;
  const deltaDown = showDelta && delta! < 0;

  const content = (
    <div className="flex h-full flex-col">
      {/* Top : label + value + icon */}
      <div
        className="flex items-start justify-between"
        style={{ transform: "translateZ(25px)" }}
      >
        <div className="min-w-0">
          <p className="text-caption font-medium uppercase tracking-wide text-ink-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-display-md text-ink">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-elev-2",
            ACCENT_GRADIENT[accent]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Bottom : sparkline + delta — affiché seulement si données */}
      {(showSparkline || showDelta) && (
        <div
          className="mt-5 flex items-end justify-between gap-3"
          style={{ transform: "translateZ(15px)" }}
        >
          {showDelta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-caption font-semibold",
                deltaUp &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                deltaDown &&
                  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                !deltaUp &&
                  !deltaDown &&
                  "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300"
              )}
            >
              {deltaUp && <ArrowUpRight className="h-3 w-3" />}
              {deltaDown && <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta!).toFixed(1)}%
            </span>
          )}
          {showSparkline && (
            <div className={cn("min-w-0 flex-1", ACCENT_TEXT[accent])}>
              <Sparkline data={trend!} height={32} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const surfaceClasses =
    "relative block h-full overflow-hidden rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition-shadow duration-300";

  // Tilt subtil — cartes dashboard, pas marketing
  const tiltProps = { maxTilt: 5, glowOpacity: 0.08 } as const;

  if (href) {
    return (
      <TiltCard {...tiltProps} className="group h-full rounded-3xl">
        <Link
          href={href}
          className={cn(
            surfaceClasses,
            "hover:border-brand/40 hover:shadow-elev-4"
          )}
          aria-label={`${label} : ${value}. Cliquez pour voir les détails`}
        >
          {content}
        </Link>
      </TiltCard>
    );
  }

  return (
    <TiltCard {...tiltProps} className="group h-full rounded-3xl">
      <div className={cn(surfaceClasses, "hover:shadow-elev-3")}>{content}</div>
    </TiltCard>
  );
}

// P3 (migration 049a/049b) : 15 valeurs remplacent les 7 valeurs 2026-04.
// Les valeurs legacy restent typees (l'enum ne les retire jamais) mais plus
// aucun dossier reel ne les porte — voir docs/AUDIT_CRM.md.
const STATUS_STYLES: Record<DemandeStatus, string> = {
  nouveau: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  en_cours: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  en_attente: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  incomplet: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  en_traitement: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  annule: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  nouvelle_demande: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  qualification: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  documents_demandes: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  dossier_incomplet: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  etude_faisabilite: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  devis_envoye: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  devis_accepte: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  paiement_attente: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  traitement: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  transmis_partenaire: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  decision_recue: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  termine: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  refuse: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  archive: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
};

const STATUS_LABELS: Record<DemandeStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  en_attente: "En attente",
  incomplet: "Incomplet",
  en_traitement: "En traitement",
  complete: "Complété",
  annule: "Annulé",
  nouvelle_demande: "Nouvelle demande",
  qualification: "Qualification",
  documents_demandes: "Documents demandés",
  dossier_incomplet: "Dossier incomplet",
  etude_faisabilite: "Étude de faisabilité",
  devis_envoye: "Devis envoyé",
  devis_accepte: "Devis accepté",
  paiement_attente: "Paiement en attente",
  traitement: "Traitement",
  transmis_partenaire: "Transmis partenaire",
  decision_recue: "Décision reçue",
  termine: "Terminé",
  refuse: "Refusé",
  archive: "Archivé",
};

export function StatusBadge({ status }: { status: DemandeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const URGENCE_STYLES: Record<UrgenceLevel, string> = {
  faible: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  normale: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  elevee: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  critique: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const URGENCE_LABELS: Record<UrgenceLevel, string> = {
  faible: "Faible",
  normale: "Normale",
  elevee: "Élevée",
  critique: "Critique",
};

export function UrgenceBadge({ level }: { level: UrgenceLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        URGENCE_STYLES[level]
      )}
    >
      {URGENCE_LABELS[level]}
    </span>
  );
}

export { STATUS_LABELS, URGENCE_LABELS };
