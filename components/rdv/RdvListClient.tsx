"use client";

// ============================================================================
// COMPOSANT — Liste de rendez-vous unique (L5-1)
// Vues enregistrées remplaçant les sections codées en dur des 3 anciennes
// pages : "Non assignés" (file d'attente agent), "Aujourd'hui", "À venir",
// "Historique", "Tous". Réutilise AppointmentActions.tsx tel quel (déjà
// générique : canTake pour l'agent, isSuperAdmin pour admin/super_admin).
// ============================================================================

import { useMemo, useState } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Users, Phone, Inbox } from "lucide-react";
import { AppointmentActions } from "@/components/dashboard/AppointmentActions";
import { cn } from "@/lib/utils";
import type { Appointment, UserRole } from "@/types";

interface AgentLite {
  id: string;
  prenom: string | null;
  nom: string | null;
}

type SavedViewId = "non-assignes" | "aujourdhui" | "a-venir" | "historique" | "tous";
type FilterValue = "all" | "en_attente" | "confirme" | "termine" | "annule";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tous statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "confirme", label: "Confirmés" },
  { value: "termine", label: "Terminés" },
  { value: "annule", label: "Annulés" },
];

function matchesFilter(statut: string, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "annule") return ["annule_client", "annule_agent", "absent"].includes(statut);
  return statut === filter;
}

function getStatusInfo(statut: string) {
  switch (statut) {
    case "en_attente":
      return { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock };
    case "confirme":
      return { label: "Confirmé", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
    case "annule_client":
    case "annule_agent":
    case "absent":
      return { label: "Annulé", color: "bg-rose-100 text-rose-700", icon: XCircle };
    case "termine":
      return { label: "Terminé", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 };
    default:
      return { label: statut, color: "bg-slate-100 text-slate-700", icon: AlertCircle };
  }
}

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function RdvListClient({
  appointments,
  agents,
  role,
  currentUserId,
}: {
  appointments: Appointment[];
  agents: AgentLite[];
  role: UserRole;
  currentUserId: string;
}) {
  const [activeView, setActiveView] = useState<SavedViewId>("aujourdhui");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");

  const isManager = role === "admin" || role === "super_admin";
  const todayIso = new Date().toISOString().split("T")[0];

  const savedViews = useMemo(() => {
    const nonAssignes = appointments.filter(
      (a) => !a.agent_id && a.statut === "en_attente"
    );
    const aujourdhui = appointments.filter(
      (a) => a.rdv_date === todayIso && ["en_attente", "confirme"].includes(a.statut || "")
    );
    const aVenir = appointments.filter(
      (a) => a.rdv_date > todayIso && ["en_attente", "confirme"].includes(a.statut || "")
    );
    const historique = appointments.filter(
      (a) =>
        a.rdv_date < todayIso ||
        ["termine", "annule_client", "annule_agent", "absent"].includes(a.statut || "")
    );

    return [
      { id: "non-assignes" as const, label: "Non assignés", rows: nonAssignes },
      { id: "aujourdhui" as const, label: "Aujourd'hui", rows: aujourdhui },
      { id: "a-venir" as const, label: "À venir", rows: aVenir },
      { id: "historique" as const, label: "Historique", rows: historique },
      { id: "tous" as const, label: "Tous", rows: appointments },
    ];
  }, [appointments, todayIso]);

  const viewRows = savedViews.find((v) => v.id === activeView)?.rows ?? appointments;
  const filtered = useMemo(
    () => viewRows.filter((a) => matchesFilter(a.statut || "", statusFilter)),
    [viewRows, statusFilter]
  );

  const agentMap = useMemo(() => {
    const m = new Map<string, AgentLite>();
    agents.forEach((a) => m.set(a.id, a));
    return m;
  }, [agents]);

  return (
    <div className="space-y-4">
      {/* Vues enregistrées */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div role="tablist" className="flex flex-wrap gap-1">
          {savedViews.map((v) => {
            const isActive = v.id === activeView;
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveView(v.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition",
                  isActive ? "bg-nexus-blue-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {v.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    isActive ? "bg-white/20" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {v.rows.length}
                </span>
              </button>
            );
          })}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterValue)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-nexus-orange-400 focus:outline-none"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          {activeView === "non-assignes" ? (
            <>
              <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              Aucun rendez-vous en attente d&apos;affectation.
            </>
          ) : (
            "Aucun rendez-vous ne correspond aux critères."
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rdv) => {
            const status = getStatusInfo(rdv.statut || "");
            const StatusIcon = status.icon;
            const agent = rdv.agent_id ? agentMap.get(rdv.agent_id) : null;
            const agentName = agent ? [agent.prenom, agent.nom].filter(Boolean).join(" ") : null;

            return (
              <div
                key={rdv.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-nexus-blue-950">
                        {rdv.service_type || "Rendez-vous"}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                          status.color
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </span>
                      {rdv.reference && (
                        <span className="font-mono text-[10px] text-slate-400">{rdv.reference}</span>
                      )}
                    </div>

                    <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                      <p className="text-slate-700">
                        <Users className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                        <strong>{rdv.client_nom}</strong>
                      </p>
                      {rdv.client_email && <p className="text-slate-600">{rdv.client_email}</p>}
                    </div>

                    {rdv.client_telephone && (
                      <p className="mt-1 text-sm text-slate-600">
                        <Phone className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                        {rdv.client_telephone}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-nexus-orange-600" />
                        {formatDateLong(rdv.rdv_date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-nexus-orange-600" />
                        {rdv.rdv_heure}
                      </span>
                    </div>

                    {isManager && (
                      <div className="mt-2 text-sm">
                        {agentName ? (
                          <span className="text-slate-700">
                            Assigné à : <strong className="text-nexus-blue-950">{agentName}</strong>
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                            ⚠ Non assigné
                          </span>
                        )}
                      </div>
                    )}

                    {rdv.notes_client && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes client</p>
                        <p className="mt-1 text-sm text-slate-700">{rdv.notes_client}</p>
                      </div>
                    )}
                  </div>

                  <AppointmentActions
                    appointmentId={rdv.id}
                    currentStatus={rdv.statut || ""}
                    currentAgentId={rdv.agent_id}
                    agents={agents}
                    isSuperAdmin={isManager}
                    canTake={role === "agent"}
                    agentId={currentUserId}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
