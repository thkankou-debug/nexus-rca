"use client";

// ============================================================================
// COMPOSANT — Liste de dossiers d'une catégorie (filtres + table responsive)
// Utilisé par les 3 pages /dashboard/[role]/dossiers/[categorie]/page.tsx
// ============================================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Filter,
  Search,
  User,
  UserPlus,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatCard";
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

type SortKey = "date_desc" | "date_asc" | "step_desc" | "step_asc";

export function DossiersListClient({
  demandes,
  agents,
  role,
  baseDetailHref,
}: {
  demandes: Demande[];
  agents: AgentLite[];
  role: UserRole;
  /** Préfixe URL vers le détail dossier (sans le /id final). Ex: /dashboard/agent/dossiers/visa */
  baseDetailHref: string;
}) {
  const [statusFilter, setStatusFilter] = useState<DemandeStatus | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");

  const canAssign = role === "admin" || role === "super_admin";

  const agentMap = useMemo(() => {
    const m = new Map<string, AgentLite>();
    agents.forEach((a) => m.set(a.id, a));
    return m;
  }, [agents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = demandes.filter((d) => {
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
  }, [demandes, statusFilter, agentFilter, onlyUnassigned, search, sort]);

  return (
    <div className="space-y-4">
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
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span>
            {filtered.length} dossier{filtered.length > 1 ? "s" : ""} affiché
            {filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Liste cards (mobile-first, table-like sur desktop) */}
      {filtered.length === 0 ? (
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
      )}
    </div>
  );
}
