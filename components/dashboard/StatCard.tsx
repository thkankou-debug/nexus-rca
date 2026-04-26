import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { DemandeStatus, UrgenceLevel } from "@/types";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  href,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "orange" | "green" | "red";
  /** Si fourni, la carte devient cliquable et redirige vers ce chemin */
  href?: string;
}) {
  const accentClasses = {
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    green: "from-emerald-400 to-emerald-600",
    red: "from-rose-400 to-rose-600",
  };

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-display text-4xl font-bold text-nexus-blue-950">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            accentClasses[accent]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </>
  );

  // Si href fourni : carte cliquable
  if (href) {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-nexus-orange-300 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/40"
        aria-label={`${label} : ${value}. Cliquez pour voir les détails`}
      >
        {content}
      </Link>
    );
  }

  // Sinon : div statique (comportement original)
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:shadow-card-hover">
      {content}
    </div>
  );
}

const STATUS_STYLES: Record<DemandeStatus, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  en_cours: "bg-amber-100 text-amber-700",
  en_attente: "bg-slate-200 text-slate-700",
  incomplet: "bg-orange-100 text-orange-700",
  en_traitement: "bg-indigo-100 text-indigo-700",
  complete: "bg-emerald-100 text-emerald-700",
  annule: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS: Record<DemandeStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  en_attente: "En attente",
  incomplet: "Incomplet",
  en_traitement: "En traitement",
  complete: "Complété",
  annule: "Annulé",
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
  faible: "bg-slate-100 text-slate-600",
  normale: "bg-blue-100 text-blue-700",
  elevee: "bg-amber-100 text-amber-800",
  critique: "bg-rose-100 text-rose-700",
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
