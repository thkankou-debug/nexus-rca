import Link from "next/link";
import { Plus, FileText, Zap, Filter, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

// =============================================================================
// FILTRES DISPONIBLES
// =============================================================================
type FilterValue = "all" | "en_cours" | "complete" | "nouveau" | "annule";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "en_cours", label: "En cours" },
  { value: "nouveau", label: "Nouveaux" },
  { value: "complete", label: "Terminés" },
  { value: "annule", label: "Annulés" },
];

// =============================================================================
// LOGIQUE DE FILTRAGE COTE SERVEUR
// =============================================================================
function matchesFilter(statut: string, filter: FilterValue): boolean {
  const lower = (statut || "").toLowerCase().trim();

  if (filter === "all") return true;

  if (filter === "nouveau") {
    return lower === "nouveau" || lower === "nouvelle" || lower.startsWith("nouv");
  }

  if (filter === "en_cours") {
    // En cours = tout sauf terminé/annulé/rejeté
    if (lower.includes("traite")) return false;
    if (lower.includes("complet")) return false;
    if (lower.includes("termin")) return false;
    if (lower.includes("annul")) return false;
    if (lower.includes("rejet")) return false;
    if (lower === "fini" || lower === "ferme") return false;
    return true;
  }

  if (filter === "complete") {
    return (
      lower.includes("traite") ||
      lower.includes("complet") ||
      lower.includes("termin") ||
      lower === "fini" ||
      lower === "ferme"
    );
  }

  if (filter === "annule") {
    return lower.includes("annul") || lower.includes("rejet") || lower.includes("refuse");
  }

  return true;
}

export default async function ClientDemandesPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const profile = await requireProfile([
    "client",
    "agent",
    "admin",
    "super_admin",
  ]);
  const supabase = createClient();

  // Lecture du filtre depuis l URL
  const rawFilter = (searchParams?.status || "all").toLowerCase();
  const activeFilter: FilterValue = (
    ["all", "en_cours", "complete", "nouveau", "annule"].includes(rawFilter)
      ? rawFilter
      : "all"
  ) as FilterValue;

  // Recuperation TOUTES les demandes (filtrage en JS pour gerer les variantes de statut)
  const { data: demandes } = await supabase
    .from("demandes")
    .select("*")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  const allDemandes = (demandes || []) as Demande[];
  const list = allDemandes.filter((d) =>
    matchesFilter(d.statut || "", activeFilter)
  );

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Mes demandes
          </h1>
          <p className="mt-1 text-slate-600">
            Suivez l'état de tous vos dossiers.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/demande"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-nexus-blue-950 shadow-sm hover:border-slate-300"
          >
            <Plus className="h-4 w-4" />
            Rapide
          </Link>
          <Link
            href="/demande/complet"
            className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600"
          >
            <FileText className="h-4 w-4" />
            Dossier complet
          </Link>
        </div>
      </div>

      {/* BARRE DE FILTRES */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="flex shrink-0 items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filtrer
          </span>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            const count = allDemandes.filter((d) =>
              matchesFilter(d.statut || "", f.value)
            ).length;
            const href =
              f.value === "all"
                ? "/dashboard/client/demandes"
                : `/dashboard/client/demandes?status=${f.value}`;
            return (
              <Link
                key={f.value}
                href={href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  isActive
                    ? "bg-nexus-blue-950 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-700"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* LISTE */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">
            {activeFilter === "all"
              ? "Aucune demande pour le moment."
              : `Aucune demande dans la catégorie "${FILTERS.find((f) => f.value === activeFilter)?.label}".`}
          </p>
          {activeFilter !== "all" && (
            <Link
              href="/dashboard/client/demandes"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-nexus-blue-950 hover:bg-slate-50"
            >
              Voir toutes les demandes
            </Link>
          )}
          {activeFilter === "all" && (
            <Link
              href="/demande/complet"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-blue-900"
            >
              <Plus className="h-4 w-4" />
              Démarrer mon premier dossier
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((d) => {
            const dRecord = d as unknown as Record<string, unknown>;
            const ref =
              (dRecord.reference as string) ||
              `NX-${d.id.slice(0, 8).toUpperCase()}`;
            return (
              <Link
                key={d.id}
                href={`/dashboard/client/demandes/${d.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-nexus-orange-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-nexus-blue-50 px-2 py-0.5 font-mono text-[11px] font-bold text-nexus-orange-600">
                    {ref}
                  </span>
                  <h3 className="font-semibold text-nexus-blue-950">
                    {d.service}
                  </h3>
                  <StatusBadge status={d.statut} />
                  <UrgenceBadge level={d.urgence} />
                  {d.traitement_prioritaire && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-2 py-0.5 text-xs font-semibold text-white">
                      <Zap className="h-3 w-3" />
                      Prioritaire
                    </span>
                  )}
                </div>
                {d.objet && (
                  <p className="mt-2 font-medium text-nexus-blue-900">{d.objet}</p>
                )}
                {d.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {d.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    Envoyée le {formatDate(d.created_at)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition group-hover:text-nexus-orange-600">
                    Ouvrir
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
