"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  Users,
  FileText,
  Receipt,
  Wallet,
  Send,
  Crown,
  Medal,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
export interface AgentStatsRow {
  id: string;
  nom: string;
  prenom: string | null;
  role: string;
  // Stats
  paiements_encaisses: number; // montant total recu (devise XAF)
  nb_paiements: number;
  clients_crees: number;
  demandes_traitees: number;
  depenses_validees: number; // montant
  nb_depenses: number;
  transferts_inities: number;
}

// ============================================================================
// HELPERS
// ============================================================================
function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function getRankIcon(rank: number) {
  if (rank === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 1) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 2) return <Award className="h-5 w-5 text-orange-700" />;
  return null;
}

function getRankColor(rank: number): string {
  if (rank === 0) return "border-yellow-200 bg-gradient-to-br from-yellow-50 to-white";
  if (rank === 1) return "border-slate-200 bg-gradient-to-br from-slate-50 to-white";
  if (rank === 2) return "border-orange-200 bg-gradient-to-br from-orange-50 to-white";
  return "border-slate-200 bg-white";
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function AgentStats({ rows }: { rows: AgentStatsRow[] }) {
  const [sortBy, setSortBy] = useState<
    | "paiements_encaisses"
    | "nb_paiements"
    | "clients_crees"
    | "demandes_traitees"
    | "depenses_validees"
    | "transferts_inities"
  >("paiements_encaisses");

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => Number(b[sortBy]) - Number(a[sortBy]));
  }, [rows, sortBy]);

  // Totaux pour le ratio (pour les barres de progression)
  const maxValue = useMemo(() => {
    const values = sorted.map((r) => Number(r[sortBy]));
    return Math.max(...values, 1);
  }, [sorted, sortBy]);

  // Globaux pour vue ensemble
  const globaux = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        paiements: acc.paiements + Number(r.paiements_encaisses),
        nb_paiements: acc.nb_paiements + r.nb_paiements,
        clients: acc.clients + r.clients_crees,
        demandes: acc.demandes + r.demandes_traitees,
        depenses: acc.depenses + Number(r.depenses_validees),
        transferts: acc.transferts + r.transferts_inities,
      }),
      {
        paiements: 0,
        nb_paiements: 0,
        clients: 0,
        demandes: 0,
        depenses: 0,
        transferts: 0,
      }
    );
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-3 text-slate-600">
          Aucun agent avec activité enregistrée.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* TOTAUX GLOBAUX */}
      {/* ============================================================ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlobalStatCard
          icon={Wallet}
          label="Total encaissé"
          value={formatMoney(globaux.paiements)}
          subValue={`${globaux.nb_paiements} paiement${globaux.nb_paiements > 1 ? "s" : ""}`}
          accent="green"
        />
        <GlobalStatCard
          icon={Users}
          label="Clients créés"
          value={globaux.clients.toString()}
          accent="blue"
        />
        <GlobalStatCard
          icon={FileText}
          label="Demandes traitées"
          value={globaux.demandes.toString()}
          accent="purple"
        />
        <GlobalStatCard
          icon={Send}
          label="Transferts initiés"
          value={globaux.transferts.toString()}
          accent="orange"
        />
      </div>

      {/* ============================================================ */}
      {/* SELECTEUR DE TRI */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-nexus-orange-600" />
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Classement des agents
          </h2>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Trier par
        </p>
        <div className="flex flex-wrap gap-2">
          <SortChip
            label="Montant encaissé"
            active={sortBy === "paiements_encaisses"}
            onClick={() => setSortBy("paiements_encaisses")}
          />
          <SortChip
            label="Nb paiements"
            active={sortBy === "nb_paiements"}
            onClick={() => setSortBy("nb_paiements")}
          />
          <SortChip
            label="Clients créés"
            active={sortBy === "clients_crees"}
            onClick={() => setSortBy("clients_crees")}
          />
          <SortChip
            label="Demandes traitées"
            active={sortBy === "demandes_traitees"}
            onClick={() => setSortBy("demandes_traitees")}
          />
          <SortChip
            label="Dépenses validées"
            active={sortBy === "depenses_validees"}
            onClick={() => setSortBy("depenses_validees")}
          />
          <SortChip
            label="Transferts"
            active={sortBy === "transferts_inities"}
            onClick={() => setSortBy("transferts_inities")}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* CLASSEMENT */}
      {/* ============================================================ */}
      <div className="space-y-3">
        {sorted.map((agent, rank) => {
          const value = Number(agent[sortBy]);
          const pct = (value / maxValue) * 100;
          const isMoney =
            sortBy === "paiements_encaisses" ||
            sortBy === "depenses_validees";
          const displayName = [agent.prenom, agent.nom]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={agent.id}
              className={cn(
                "rounded-2xl border p-5 shadow-sm transition hover:shadow-md",
                getRankColor(rank)
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 gap-3">
                  {/* Rang */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white shadow-sm">
                    {getRankIcon(rank) || (
                      <span className="font-display text-lg font-bold text-slate-400">
                        #{rank + 1}
                      </span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                        {displayName || agent.nom || "—"}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          agent.role === "super_admin"
                            ? "bg-rose-100 text-rose-700"
                            : agent.role === "admin"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {agent.role === "super_admin"
                          ? "Super admin"
                          : agent.role === "admin"
                          ? "Admin"
                          : "Agent"}
                      </span>
                    </div>

                    {/* Mini stats */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" />
                        {formatMoney(Number(agent.paiements_encaisses))} (
                        {agent.nb_paiements})
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {agent.clients_crees} client
                        {agent.clients_crees > 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {agent.demandes_traitees} demande
                        {agent.demandes_traitees > 1 ? "s" : ""}
                      </span>
                      {agent.transferts_inities > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Send className="h-3.5 w-3.5" />
                          {agent.transferts_inities} transfert
                          {agent.transferts_inities > 1 ? "s" : ""}
                        </span>
                      )}
                      {Number(agent.depenses_validees) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Receipt className="h-3.5 w-3.5" />
                          {formatMoney(Number(agent.depenses_validees))} de dépenses
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Valeur principale (selon tri) */}
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-nexus-blue-950">
                    {isMoney ? formatMoney(value) : value.toString()}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    "h-full transition-all",
                    rank === 0
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                      : rank === 1
                      ? "bg-gradient-to-r from-slate-400 to-slate-500"
                      : rank === 2
                      ? "bg-gradient-to-r from-orange-500 to-orange-700"
                      : "bg-gradient-to-r from-nexus-blue-600 to-nexus-blue-800"
                  )}
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function GlobalStatCard({
  icon: Icon,
  label,
  value,
  subValue,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  accent: "green" | "blue" | "purple" | "orange";
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    purple: "from-purple-500 to-purple-700",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {value}
          </p>
          {subValue && (
            <p className="mt-1 text-xs text-slate-500">{subValue}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function SortChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-nexus-blue-950 bg-nexus-blue-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}
