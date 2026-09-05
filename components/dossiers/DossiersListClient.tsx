"use client";

// ============================================================================
// COMPOSANT — Liste de dossiers d'une catégorie (vues enregistrées + filtres
// + sélection de masse + table responsive)
// Utilisé par les 3 pages /dashboard/[role]/dossiers/[categorie]/page.tsx
// A5 : ajoute les vues enregistrées en onglets (remplace le dropdown statut
// comme filtre primaire) et la sélection multiple + actions de masse.
// ============================================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Check,
  Columns3,
  Download,
  Filter,
  List,
  Loader2,
  Search,
  User,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatCard";
import { DossierKanban } from "./DossierKanban";
import type { Demande, DemandeStatus, UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface AgentLite {
  id: string;
  nom: string;
  prenom: string | null;
}

// P3 (migration 049a/049b) : 15 valeurs remplacent les 7 valeurs 2026-04 —
// voir docs/AUDIT_CRM.md. Filtrer sur une ancienne valeur ne remonterait
// plus aucun dossier réel.
const STATUS_FILTERS: { value: DemandeStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "nouvelle_demande", label: "Nouvelle demande" },
  { value: "qualification", label: "Qualification" },
  { value: "documents_demandes", label: "Documents demandés" },
  { value: "dossier_incomplet", label: "Dossier incomplet" },
  { value: "etude_faisabilite", label: "Étude de faisabilité" },
  { value: "devis_envoye", label: "Devis envoyé" },
  { value: "devis_accepte", label: "Devis accepté" },
  { value: "paiement_attente", label: "Paiement en attente" },
  { value: "traitement", label: "Traitement" },
  { value: "transmis_partenaire", label: "Transmis partenaire" },
  { value: "decision_recue", label: "Décision reçue" },
  { value: "termine", label: "Terminé" },
  { value: "refuse", label: "Refusé" },
  { value: "annule", label: "Annulé" },
  { value: "archive", label: "Archivé" },
];

const TERMINAL_STATUTS = ["termine", "refuse", "annule", "archive", "complete"];

type SavedViewId = "reception" | "mes-dossiers" | "urgents" | "en-retard" | "tous";
type SortKey = "date_desc" | "date_asc" | "step_desc" | "step_asc";

export function DossiersListClient({
  demandes,
  agents,
  role,
  currentUserId,
  baseDetailHref,
}: {
  demandes: Demande[];
  agents: AgentLite[];
  role: UserRole;
  /** ID du profil connecté — nécessaire pour la vue « Mes dossiers ». */
  currentUserId: string;
  /** Préfixe URL vers le détail dossier (sans le /id final). Ex: /dashboard/agent/dossiers/visa */
  baseDetailHref: string;
}) {
  const [viewMode, setViewMode] = useState<"liste" | "kanban">("liste");
  const [activeView, setActiveView] = useState<SavedViewId>("tous");
  const [statusFilter, setStatusFilter] = useState<DemandeStatus | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAssignAgent, setBulkAssignAgent] = useState("");
  const [bulkStatus, setBulkStatus] = useState<DemandeStatus>("traitement");
  const [bulkAction, setBulkAction] = useState<"assign" | "status" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const canAssign = role === "admin" || role === "super_admin";

  const agentMap = useMemo(() => {
    const m = new Map<string, AgentLite>();
    agents.forEach((a) => m.set(a.id, a));
    return m;
  }, [agents]);

  // Vues enregistrées — un seul module Dossiers, des vues, pas des pages
  // séparées (règle A3/A5 : « demandes reçues » et « dossiers clients » sont
  // la même table, deux entrées de menu dessus produisent la confusion).
  const savedViews = useMemo(() => {
    const now = Date.now();
    const reception = demandes.filter((d) => d.statut === "nouvelle_demande" && !d.agent_id);
    const mesDossiers = demandes.filter((d) => d.agent_id === currentUserId);
    const urgents = demandes.filter(
      (d) => (d.urgence === "critique" || d.traitement_prioritaire) && !TERMINAL_STATUTS.includes(d.statut)
    );
    const enRetard = demandes.filter(
      (d) => d.deadline && new Date(d.deadline).getTime() < now && !TERMINAL_STATUTS.includes(d.statut)
    );

    return [
      { id: "reception" as const, label: "Réception", rows: reception },
      { id: "mes-dossiers" as const, label: "Mes dossiers", rows: mesDossiers },
      { id: "urgents" as const, label: "Urgents", rows: urgents },
      { id: "en-retard" as const, label: "En retard", rows: enRetard },
      { id: "tous" as const, label: "Tous", rows: demandes },
    ];
  }, [demandes, currentUserId]);

  const viewRows = savedViews.find((v) => v.id === activeView)?.rows ?? demandes;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = viewRows.filter((d) => {
      if (statusFilter !== "all" && d.statut !== statusFilter) return false;
      if (onlyUnassigned && d.agent_id) return false;
      if (!onlyUnassigned && agentFilter !== "all" && d.agent_id !== agentFilter)
        return false;
      if (q) {
        const ref = (d.reference || "").toLowerCase();
        const nom = (d.nom_complet || "").toLowerCase();
        const email = (d.email || "").toLowerCase();
        if (!ref.includes(q) && !nom.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "date_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "date_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sort === "step_desc") {
        return (b.current_step || 0) - (a.current_step || 0);
      }
      return (a.current_step || 0) - (b.current_step || 0);
    });

    return list;
  }, [viewRows, statusFilter, agentFilter, onlyUnassigned, search, sort]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected = filtered.length > 0 && filtered.every((d) => selectedIds.has(d.id));

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((d) => next.delete(d.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((d) => next.add(d.id));
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkAction(null);
  }

  async function applyBulkAssign() {
    if (!bulkAssignAgent) {
      toast.error("Choisissez un agent");
      return;
    }
    setBulkLoading(true);
    let ok = 0;
    let fail = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/demandes/${id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: bulkAssignAgent }),
        });
        if (res.ok) ok++;
        else fail++;
      } catch {
        fail++;
      }
    }
    setBulkLoading(false);
    setBulkAction(null);
    clearSelection();
    if (fail === 0) toast.success(`${ok} dossier${ok > 1 ? "s" : ""} affecté${ok > 1 ? "s" : ""}`);
    else toast.error(`${ok} réussi(s), ${fail} échec(s)`);
  }

  async function applyBulkStatus() {
    setBulkLoading(true);
    let ok = 0;
    let fail = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/demandes/${id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statut: bulkStatus }),
        });
        if (res.ok) ok++;
        else fail++;
      } catch {
        fail++;
      }
    }
    setBulkLoading(false);
    setBulkAction(null);
    clearSelection();
    if (fail === 0) toast.success(`Statut mis à jour sur ${ok} dossier${ok > 1 ? "s" : ""}`);
    else toast.error(`${ok} réussi(s), ${fail} échec(s) — un changement de statut peut être refusé si la transition n'est pas valide`);
  }

  function exportSelection() {
    const rows = filtered.filter((d) => selectedIds.has(d.id));
    if (rows.length === 0) return;
    const header = ["reference", "nom_complet", "email", "service", "statut", "agent", "created_at"];
    const lines = rows.map((d) => {
      const agent = d.agent_id ? agentMap.get(d.agent_id) : null;
      const agentName = agent ? [agent.prenom, agent.nom].filter(Boolean).join(" ") : "";
      return [
        d.reference ?? "",
        d.nom_complet,
        d.email,
        d.service,
        d.statut,
        agentName,
        d.created_at,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dossiers-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} dossier${rows.length > 1 ? "s" : ""} exporté${rows.length > 1 ? "s" : ""}`);
  }

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
                  isActive
                    ? "bg-nexus-blue-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
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
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setViewMode("liste")}
            aria-label="Vue liste"
            className={cn(
              "rounded-lg p-1.5",
              viewMode === "liste" ? "bg-nexus-blue-950 text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            aria-label="Vue Kanban"
            className={cn(
              "rounded-lg p-1.5",
              viewMode === "kanban" ? "bg-nexus-blue-950 text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Columns3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Référence, nom ou email…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-9 text-sm focus:border-nexus-orange-400 focus:outline-none"
            />
          </div>
          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DemandeStatus | "all")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-400 focus:outline-none"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  Statut : {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <select
              value={onlyUnassigned ? "_unassigned" : agentFilter}
              onChange={(e) => {
                if (e.target.value === "_unassigned") {
                  setOnlyUnassigned(true);
                  setAgentFilter("all");
                } else {
                  setOnlyUnassigned(false);
                  setAgentFilter(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-400 focus:outline-none"
            >
              <option value="all">Agent : tous</option>
              <option value="_unassigned">Agent : non assignés</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {[a.prenom, a.nom].filter(Boolean).join(" ") || "Agent"}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-400 focus:outline-none"
            >
              <option value="date_desc">Tri : récent</option>
              <option value="date_asc">Tri : ancien</option>
              <option value="step_desc">Tri : étape ↓</option>
              <option value="step_asc">Tri : étape ↑</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            Tout sélectionner
          </label>
          <span className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            {filtered.length} dossier{filtered.length > 1 ? "s" : ""} affiché
            {filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Barre d'actions de masse */}
      {selectedCount > 0 && (
        <div className="rounded-2xl border border-nexus-orange-200 bg-nexus-orange-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={clearSelection}
              aria-label="Désélectionner"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-nexus-blue-950">
              {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {canAssign && (
                <button
                  onClick={() => setBulkAction(bulkAction === "assign" ? null : "assign")}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-nexus-blue-950 hover:bg-slate-50"
                >
                  Affecter
                </button>
              )}
              <button
                onClick={() => setBulkAction(bulkAction === "status" ? null : "status")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-nexus-blue-950 hover:bg-slate-50"
              >
                Changer le statut
              </button>
              <button
                onClick={exportSelection}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-nexus-blue-950 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Exporter
              </button>
            </div>
          </div>

          {bulkAction === "assign" && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-nexus-orange-200 pt-3">
              <select
                value={bulkAssignAgent}
                onChange={(e) => setBulkAssignAgent(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
              >
                <option value="">Choisir un agent…</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {[a.prenom, a.nom].filter(Boolean).join(" ") || "Agent"}
                  </option>
                ))}
              </select>
              <button
                onClick={applyBulkAssign}
                disabled={bulkLoading}
                className="flex items-center gap-1 rounded-lg bg-nexus-blue-950 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Appliquer
              </button>
            </div>
          )}

          {bulkAction === "status" && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-nexus-orange-200 pt-3">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as DemandeStatus)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
              >
                {STATUS_FILTERS.filter((s) => s.value !== "all").map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={applyBulkStatus}
                disabled={bulkLoading}
                className="flex items-center gap-1 rounded-lg bg-nexus-blue-950 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Appliquer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vue Kanban (A5) */}
      {viewMode === "kanban" && (
        <DossierKanban demandes={filtered} agentMap={agentMap} baseDetailHref={baseDetailHref} />
      )}

      {/* Liste cards (mobile-first, table-like sur desktop) */}
      {viewMode === "liste" && (filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Aucun dossier ne correspond aux critères.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((d) => {
            const agent = d.agent_id ? agentMap.get(d.agent_id) : null;
            const ref = d.reference || `NX-${d.id.slice(0, 8).toUpperCase()}`;
            const detailHref = `${baseDetailHref}/${d.id}`;
            return (
              <li
                key={d.id}
                className={cn(
                  "rounded-2xl border bg-white p-4 shadow-sm transition hover:border-nexus-orange-300",
                  !d.agent_id && "border-l-4 border-l-nexus-orange-500"
                )}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(d.id)}
                    onChange={() => toggleOne(d.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                    aria-label={`Sélectionner ${ref}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-nexus-orange-700">
                        {ref}
                      </span>
                      <StatusBadge status={d.statut} />
                      {d.traitement_prioritaire && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          <Zap className="h-2.5 w-2.5" />
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-nexus-blue-950">
                      {d.nom_complet}
                    </p>
                    <p className="text-xs text-slate-500">
                      {d.service} · {d.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Étape {d.current_step ?? 1}/6</span>
                      <span className="h-1 w-24 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full bg-nexus-orange-500"
                          style={{
                            width: `${Math.min(100, ((d.current_step ?? 1) / 6) * 100)}%`,
                          }}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {agent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        <User className="h-3 w-3" />
                        {[agent.prenom, agent.nom].filter(Boolean).join(" ")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-100 px-2 py-1 text-[11px] font-bold text-nexus-orange-700">
                        Non assigné
                      </span>
                    )}
                    <Link
                      href={detailHref}
                      className="inline-flex items-center gap-1 rounded-lg bg-nexus-blue-950 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-nexus-blue-900"
                    >
                      Voir <ArrowRight className="h-3 w-3" />
                    </Link>
                    {canAssign && !d.agent_id && (
                      <Link
                        href={`${detailHref}/assigner`}
                        className="inline-flex items-center gap-1 rounded-lg border border-nexus-orange-300 bg-white px-3 py-1.5 text-[11px] font-bold text-nexus-orange-700 hover:bg-nexus-orange-50"
                      >
                        <UserPlus className="h-3 w-3" />
                        Assigner
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
