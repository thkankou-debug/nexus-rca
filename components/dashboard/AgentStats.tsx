"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Trophy,
  Users,
  FileText,
  Receipt,
  Wallet,
  Send,
  Crown,
  Medal,
  Award,
  CircleDot,
  CircleOff,
  TrendingUp,
  ArrowUpDown,
  FileDown,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

// ============================================================================
// TYPES
// ============================================================================
export interface AgentStatsRow {
  id: string;
  nom: string;
  prenom: string | null;
  role: string;
  paiements_encaisses: number;
  nb_paiements: number;
  clients_crees: number;
  demandes_traitees: number;
  depenses_validees: number;
  nb_depenses: number;
  transferts_inities: number;
  paiements_dates: { date: string; montant: number; service?: string }[];
  clients_dates: string[];
  demandes_dates: string[];
  depenses_data: { date: string; montant: number; statut: string }[];
  transferts_dates: string[];
  derniere_activite: string | null;
}

type Period = "today" | "week" | "month" | "custom" | "all";

// ============================================================================
// HELPERS
// ============================================================================
function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function getPeriodStartDate(period: Period, customStart?: string): Date | null {
  if (period === "all") return null;
  if (period === "custom" && customStart) return new Date(customStart);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "today") return start;
  if (period === "week") {
    start.setDate(start.getDate() - 7);
    return start;
  }
  if (period === "month") {
    start.setMonth(start.getMonth() - 1);
    return start;
  }
  return null;
}

function getPeriodEndDate(period: Period, customEnd?: string): Date | null {
  if (period === "custom" && customEnd) {
    const d = new Date(customEnd);
    d.setHours(23, 59, 59, 999);
    return d;
  }
  return null;
}

function isInPeriod(dateStr: string, start: Date | null, end: Date | null): boolean {
  if (!start && !end) return true;
  try {
    const d = new Date(dateStr);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  } catch {
    return false;
  }
}

function getRankIcon(rank: number) {
  if (rank === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 1) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 2) return <Award className="h-5 w-5 text-orange-700" />;
  return null;
}

function getRankColor(rank: number): string {
  if (rank === 0) return "border-yellow-300 bg-gradient-to-br from-yellow-50 to-white";
  if (rank === 1) return "border-slate-300 bg-gradient-to-br from-slate-50 to-white";
  if (rank === 2) return "border-orange-300 bg-gradient-to-br from-orange-50 to-white";
  return "border-slate-200 bg-white";
}

function getRoleBadge(role: string): { label: string; color: string } {
  if (role === "super_admin") return { label: "Super admin", color: "bg-rose-100 text-rose-700" };
  if (role === "admin") return { label: "Admin", color: "bg-amber-100 text-amber-700" };
  return { label: "Agent", color: "bg-emerald-100 text-emerald-700" };
}

function isActive(derniereActivite: string | null): boolean {
  if (!derniereActivite) return false;
  try {
    const last = new Date(derniereActivite);
    const now = new Date();
    const days = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  } catch {
    return false;
  }
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  } catch {
    return "—";
  }
}

function calculateScore(
  row: AgentStatsRow,
  maxValues: {
    paiements: number;
    clients: number;
    demandes: number;
    transferts: number;
  }
): number {
  const w_paiements = 0.4;
  const w_clients = 0.25;
  const w_demandes = 0.2;
  const w_transferts = 0.15;

  const score_paiements = maxValues.paiements > 0
    ? (row.paiements_encaisses / maxValues.paiements) * 100
    : 0;
  const score_clients = maxValues.clients > 0
    ? (row.clients_crees / maxValues.clients) * 100
    : 0;
  const score_demandes = maxValues.demandes > 0
    ? (row.demandes_traitees / maxValues.demandes) * 100
    : 0;
  const score_transferts = maxValues.transferts > 0
    ? (row.transferts_inities / maxValues.transferts) * 100
    : 0;

  return Math.round(
    w_paiements * score_paiements +
    w_clients * score_clients +
    w_demandes * score_demandes +
    w_transferts * score_transferts
  );
}

// ============================================================================
// EXPORTS
// ============================================================================
function exportCSV(rows: (AgentStatsRow & { score: number })[], periodLabel: string) {
  const headers = [
    "Rang",
    "Nom",
    "Prenom",
    "Role",
    "Score",
    "Montant encaisse",
    "Nb paiements",
    "Clients crees",
    "Demandes traitees",
    "Transferts",
    "Depenses validees",
    "Nb depenses",
    "Statut",
    "Derniere activite",
  ];

  const csvRows = rows.map((r, i) => [
    String(i + 1),
    r.nom || "",
    r.prenom || "",
    r.role,
    String(r.score),
    String(Math.round(r.paiements_encaisses)),
    String(r.nb_paiements),
    String(r.clients_crees),
    String(r.demandes_traitees),
    String(r.transferts_inities),
    String(Math.round(r.depenses_validees)),
    String(r.nb_depenses),
    isActive(r.derniere_activite) ? "Actif" : "Inactif",
    r.derniere_activite ? new Date(r.derniere_activite).toLocaleDateString("fr-FR") : "Jamais",
  ]);

  const csvContent = [
    `"Rapport Performances Agents - ${periodLabel}"`,
    `"Genere le ${new Date().toLocaleString("fr-FR")}"`,
    "",
    headers.map((h) => `"${h}"`).join(","),
    ...csvRows.map((row) => row.map((c) => `"${c}"`).join(",")),
  ].join("\n");

  const BOM = "\uFEFF"; // pour Excel reconnaisse l UTF-8
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Stats_Agents_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportPDF(rows: (AgentStatsRow & { score: number })[], periodLabel: string) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const margin = 15;
  let y = margin;

  const NEXUS_BLUE: [number, number, number] = [12, 28, 64];
  const NEXUS_ORANGE: [number, number, number] = [255, 102, 0];
  const SLATE_DARK: [number, number, number] = [30, 41, 59];
  const SLATE_MID: [number, number, number] = [100, 116, 139];

  // Bandeau header
  doc.setFillColor(...NEXUS_ORANGE);
  doc.rect(0, 0, pageWidth, 6, "F");

  y = 18;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("NEXUS RCA", margin, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("Rapport Performances Agents", margin, y + 5);

  doc.setFontSize(8);
  doc.text(
    `Genere le ${new Date().toLocaleString("fr-FR")}`,
    pageWidth - margin,
    y - 2,
    { align: "right" }
  );
  doc.text(`Periode : ${periodLabel}`, pageWidth - margin, y + 3, {
    align: "right",
  });
  doc.text(`${rows.length} agent${rows.length > 1 ? "s" : ""}`, pageWidth - margin, y + 8, {
    align: "right",
  });

  y += 18;

  // Tableau header
  const colWidths = [10, 50, 25, 18, 35, 22, 22, 22, 32, 22];
  const headers = [
    "#",
    "Agent",
    "Role",
    "Score",
    "Encaisse",
    "Clients",
    "Demandes",
    "Transferts",
    "Depenses",
    "Statut",
  ];

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  let x = margin + 2;
  headers.forEach((h, i) => {
    doc.text(h, x, y + 5);
    x += colWidths[i];
  });
  y += 8;

  // Tableau lignes
  doc.setFont("helvetica", "normal");
  rows.forEach((r, i) => {
    if (y > 190) {
      doc.addPage();
      y = margin;
    }

    if (i % 2 === 1) {
      doc.setFillColor(252, 252, 253);
      doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    }

    const role = getRoleBadge(r.role);
    const displayName = [r.prenom, r.nom].filter(Boolean).join(" ") || "-";
    const active = isActive(r.derniere_activite);

    x = margin + 2;
    doc.setTextColor(...SLATE_DARK);
    doc.text(String(i + 1), x, y + 5);
    x += colWidths[0];

    doc.setFont("helvetica", "bold");
    doc.text(displayName.substring(0, 28), x, y + 5);
    x += colWidths[1];

    doc.setFont("helvetica", "normal");
    doc.text(role.label, x, y + 5);
    x += colWidths[2];

    doc.setFont("helvetica", "bold");
    doc.text(String(r.score), x, y + 5);
    x += colWidths[3];

    doc.setFont("helvetica", "normal");
    doc.text(formatMoney(r.paiements_encaisses), x, y + 5);
    x += colWidths[4];

    doc.text(String(r.clients_crees), x, y + 5);
    x += colWidths[5];

    doc.text(String(r.demandes_traitees), x, y + 5);
    x += colWidths[6];

    doc.text(String(r.transferts_inities), x, y + 5);
    x += colWidths[7];

    doc.text(formatMoney(r.depenses_validees), x, y + 5);
    x += colWidths[8];

    if (active) doc.setTextColor(34, 197, 94);
    else doc.setTextColor(...SLATE_MID);
    doc.text(active ? "Actif" : "Inactif", x, y + 5);

    y += 7;
  });

  // Footer sur derniere page
  doc.setFontSize(7);
  doc.setTextColor(...SLATE_MID);
  doc.text(
    "Score = encaissements (40%) + clients (25%) + demandes (20%) + transferts (15%)",
    margin,
    200
  );
  doc.text(
    "Nexus RCA - Bangui, RCA - contact@nexusrca.com",
    pageWidth - margin,
    200,
    { align: "right" }
  );

  doc.save(`Stats_Agents_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function AgentStats({ rows }: { rows: AgentStatsRow[] }) {
  const [period, setPeriod] = useState<Period>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "score" | "paiements" | "clients" | "demandes" | "transferts" | "depenses"
  >("score");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const periodLabel = useMemo(() => {
    if (period === "today") return "Aujourd'hui";
    if (period === "week") return "Sur les 7 derniers jours";
    if (period === "month") return "Sur les 30 derniers jours";
    if (period === "custom" && customStart && customEnd)
      return `Du ${new Date(customStart).toLocaleDateString("fr-FR")} au ${new Date(customEnd).toLocaleDateString("fr-FR")}`;
    return "Depuis le début";
  }, [period, customStart, customEnd]);

  // Filtrage par periode
  const filteredRows = useMemo<AgentStatsRow[]>(() => {
    const refStart = getPeriodStartDate(period, customStart);
    const refEnd = getPeriodEndDate(period, customEnd);

    return rows
      .filter((r) => agentFilter === "all" || r.id === agentFilter)
      .map((r) => {
        const paiements_filtres = r.paiements_dates.filter((p) =>
          isInPeriod(p.date, refStart, refEnd)
        );
        const clients_filtres = r.clients_dates.filter((d) =>
          isInPeriod(d, refStart, refEnd)
        );
        const demandes_filtres = r.demandes_dates.filter((d) =>
          isInPeriod(d, refStart, refEnd)
        );
        const depenses_filtres = r.depenses_data.filter((d) =>
          isInPeriod(d.date, refStart, refEnd)
        );
        const transferts_filtres = r.transferts_dates.filter((d) =>
          isInPeriod(d, refStart, refEnd)
        );

        return {
          ...r,
          paiements_encaisses: paiements_filtres.reduce(
            (s, p) => s + p.montant,
            0
          ),
          nb_paiements: paiements_filtres.length,
          clients_crees: clients_filtres.length,
          demandes_traitees: demandes_filtres.length,
          depenses_validees: depenses_filtres
            .filter((d) => d.statut === "valide")
            .reduce((s, d) => s + d.montant, 0),
          nb_depenses: depenses_filtres.length,
          transferts_inities: transferts_filtres.length,
        };
      });
  }, [rows, period, customStart, customEnd, agentFilter]);

  const maxValues = useMemo(() => {
    return {
      paiements: Math.max(...filteredRows.map((r) => r.paiements_encaisses), 1),
      clients: Math.max(...filteredRows.map((r) => r.clients_crees), 1),
      demandes: Math.max(...filteredRows.map((r) => r.demandes_traitees), 1),
      transferts: Math.max(...filteredRows.map((r) => r.transferts_inities), 1),
    };
  }, [filteredRows]);

  const rowsWithScore = useMemo(() => {
    return filteredRows.map((r) => ({
      ...r,
      score: calculateScore(r, maxValues),
    }));
  }, [filteredRows, maxValues]);

  const sorted = useMemo(() => {
    const fieldMap: Record<typeof sortBy, keyof typeof rowsWithScore[0]> = {
      score: "score",
      paiements: "paiements_encaisses",
      clients: "clients_crees",
      demandes: "demandes_traitees",
      transferts: "transferts_inities",
      depenses: "depenses_validees",
    };
    const field = fieldMap[sortBy];
    return [...rowsWithScore].sort((a, b) => {
      const va = Number(a[field]) || 0;
      const vb = Number(b[field]) || 0;
      return sortDir === "desc" ? vb - va : va - vb;
    });
  }, [rowsWithScore, sortBy, sortDir]);

  const top3 = useMemo(() => {
    return [...rowsWithScore].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [rowsWithScore]);

  const globaux = useMemo(() => {
    return rowsWithScore.reduce(
      (acc, r) => ({
        paiements: acc.paiements + r.paiements_encaisses,
        nb_paiements: acc.nb_paiements + r.nb_paiements,
        clients: acc.clients + r.clients_crees,
        demandes: acc.demandes + r.demandes_traitees,
        transferts: acc.transferts + r.transferts_inities,
        depenses: acc.depenses + r.depenses_validees,
        nb_actifs: acc.nb_actifs + (isActive(r.derniere_activite) ? 1 : 0),
      }),
      {
        paiements: 0,
        nb_paiements: 0,
        clients: 0,
        demandes: 0,
        transferts: 0,
        depenses: 0,
        nb_actifs: 0,
      }
    );
  }, [rowsWithScore]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrint = () => {
    window.print();
  };

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
    <div className="space-y-5">
      {/* ============================================================ */}
      {/* FILTRES + EXPORTS */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <PeriodChip
              label="Aujourd'hui"
              active={period === "today"}
              onClick={() => setPeriod("today")}
            />
            <PeriodChip
              label="Cette semaine"
              active={period === "week"}
              onClick={() => setPeriod("week")}
            />
            <PeriodChip
              label="Ce mois"
              active={period === "month"}
              onClick={() => setPeriod("month")}
            />
            <PeriodChip
              label="Tout"
              active={period === "all"}
              onClick={() => setPeriod("all")}
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                showFilters || period === "custom" || agentFilter !== "all"
                  ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Filtres avancés
              {(period === "custom" || agentFilter !== "all") && (
                <span className="rounded-full bg-nexus-orange-500 px-1.5 text-[10px] font-bold text-white">
                  {(period === "custom" ? 1 : 0) +
                    (agentFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportCSV(sorted, periodLabel)}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              CSV / Excel
            </button>
            <button
              type="button"
              onClick={() => exportPDF(sorted, periodLabel)}
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
            >
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer
            </button>
          </div>
        </div>

        {/* Filtres avances (collapsable) */}
        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Période personnalisée
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    if (e.target.value) setPeriod("custom");
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                />
                <span className="text-xs text-slate-400">→</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => {
                    setCustomEnd(e.target.value);
                    if (e.target.value) setPeriod("custom");
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Agent spécifique
              </label>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
              >
                <option value="all">Tous les agents</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {[r.prenom, r.nom].filter(Boolean).join(" ") || r.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              {(period === "custom" || agentFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setPeriod("all");
                    setCustomStart("");
                    setCustomEnd("");
                    setAgentFilter("all");
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          {periodLabel}
          {agentFilter !== "all" && (
            <>
              {" · "}
              <span className="font-semibold text-nexus-orange-600">
                Filtré sur 1 agent
              </span>
            </>
          )}
        </p>
      </div>

      {/* CARTES GLOBALES */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <GlobalCard
          icon={Wallet}
          label="Total encaissé"
          value={formatMoney(globaux.paiements)}
          subValue={`${globaux.nb_paiements} paiement${globaux.nb_paiements > 1 ? "s" : ""}`}
          accent="green"
          onClick={() => {
            setSortBy("paiements");
            setSortDir("desc");
            scrollToTable();
          }}
        />
        <GlobalCard
          icon={Users}
          label="Clients créés"
          value={globaux.clients.toString()}
          subValue={`${globaux.nb_actifs} agent${globaux.nb_actifs > 1 ? "s" : ""} actif${globaux.nb_actifs > 1 ? "s" : ""}`}
          accent="blue"
          onClick={() => {
            setSortBy("clients");
            setSortDir("desc");
            scrollToTable();
          }}
        />
        <GlobalCard
          icon={FileText}
          label="Demandes traitées"
          value={globaux.demandes.toString()}
          accent="purple"
          onClick={() => {
            setSortBy("demandes");
            setSortDir("desc");
            scrollToTable();
          }}
        />
        <GlobalCard
          icon={Send}
          label="Transferts initiés"
          value={globaux.transferts.toString()}
          subValue={`${formatMoney(globaux.depenses)} de dépenses`}
          accent="orange"
          onClick={() => {
            setSortBy("transferts");
            setSortDir("desc");
            scrollToTable();
          }}
        />
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Top 3 — Score de performance
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {top3.map((agent, rank) => {
              const displayName = [agent.prenom, agent.nom].filter(Boolean).join(" ");
              const role = getRoleBadge(agent.role);
              const active = isActive(agent.derniere_activite);
              return (
                <Link
                  key={agent.id}
                  href={`/dashboard/super-admin/stats-agents/${agent.id}`}
                  className={cn(
                    "rounded-xl border-2 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                    getRankColor(rank)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRankIcon(rank) || <span className="text-sm font-bold text-slate-500">#{rank + 1}</span>}
                      <span className="font-display text-2xl font-bold text-nexus-blue-950">
                        {agent.score}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <p className="mt-2 truncate font-display text-sm font-bold text-nexus-blue-950">
                    {displayName || agent.nom}
                  </p>
                  <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", role.color)}>
                    {role.label}
                  </span>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span className="font-semibold">{formatMoney(agent.paiements_encaisses)}</span>
                      <span className="text-slate-400"> · </span>
                      <span>{agent.clients_crees} clients</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLEAU */}
      <div ref={tableRef} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 print:border-b-2 print:border-black">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-nexus-orange-600" />
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Classement complet
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {sorted.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 print:hidden">
            Clic sur une ligne pour voir le détail
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left font-bold text-slate-600">#</th>
                <th className="px-3 py-2.5 text-left font-bold text-slate-600">Agent</th>
                <th className="px-3 py-2.5 text-left font-bold text-slate-600">Statut</th>
                <SortableHeader
                  label="Score"
                  active={sortBy === "score"}
                  dir={sortDir}
                  onClick={() => handleSort("score")}
                />
                <SortableHeader
                  label="Encaissé"
                  active={sortBy === "paiements"}
                  dir={sortDir}
                  onClick={() => handleSort("paiements")}
                />
                <SortableHeader
                  label="Clients"
                  active={sortBy === "clients"}
                  dir={sortDir}
                  onClick={() => handleSort("clients")}
                />
                <SortableHeader
                  label="Demandes"
                  active={sortBy === "demandes"}
                  dir={sortDir}
                  onClick={() => handleSort("demandes")}
                />
                <SortableHeader
                  label="Transferts"
                  active={sortBy === "transferts"}
                  dir={sortDir}
                  onClick={() => handleSort("transferts")}
                />
                <SortableHeader
                  label="Dépenses"
                  active={sortBy === "depenses"}
                  dir={sortDir}
                  onClick={() => handleSort("depenses")}
                />
                <th className="px-3 py-2.5 text-left font-bold text-slate-600">
                  Dernière activité
                </th>
                <th className="px-3 py-2.5 text-right font-bold text-slate-600 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((agent, rank) => {
                const displayName = [agent.prenom, agent.nom].filter(Boolean).join(" ");
                const role = getRoleBadge(agent.role);
                const active = isActive(agent.derniere_activite);
                return (
                  <tr
                    key={agent.id}
                    className={cn(
                      "cursor-pointer transition hover:bg-slate-50",
                      rank === 0 && sortBy === "score" && sortDir === "desc" && "bg-yellow-50/50"
                    )}
                    onClick={() => {
                      window.location.href = `/dashboard/super-admin/stats-agents/${agent.id}`;
                    }}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {sortBy === "score" && sortDir === "desc" && getRankIcon(rank)}
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {rank + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-nexus-blue-950">
                        {displayName || agent.nom || "—"}
                      </div>
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", role.color)}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                          <CircleDot className="h-2.5 w-2.5" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                          <CircleOff className="h-2.5 w-2.5" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={cn(
                              "h-full transition-all",
                              agent.score >= 70
                                ? "bg-green-500"
                                : agent.score >= 40
                                ? "bg-amber-500"
                                : "bg-red-400"
                            )}
                            style={{ width: `${Math.max(2, agent.score)}%` }}
                          />
                        </div>
                        <span className="font-bold text-nexus-blue-950">
                          {agent.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-nexus-blue-950">
                        {formatMoney(agent.paiements_encaisses)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {agent.nb_paiements} paie.
                      </div>
                    </td>
                    <td className="px-3 py-3 text-nexus-blue-950">
                      {agent.clients_crees}
                    </td>
                    <td className="px-3 py-3 text-nexus-blue-950">
                      {agent.demandes_traitees}
                    </td>
                    <td className="px-3 py-3 text-nexus-blue-950">
                      {agent.transferts_inities}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-nexus-blue-950">
                        {formatMoney(agent.depenses_validees)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {agent.nb_depenses} dép.
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {formatRelativeDate(agent.derniere_activite)}
                    </td>
                    <td className="px-3 py-3 text-right print:hidden">
                      <ChevronRight className="inline h-4 w-4 text-slate-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <strong>Score</strong> = encaissements (40%) · clients (25%) ·
          demandes (20%) · transferts (15%).
          <span className="text-slate-400"> · </span>
          <strong>Actif</strong> = activité dans les 7 derniers jours.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function GlobalCard({
  icon: Icon,
  label,
  value,
  subValue,
  accent,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  accent: "green" | "blue" | "purple" | "orange";
  onClick?: () => void;
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    purple: "from-purple-500 to-purple-700",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate font-display text-lg font-bold text-nexus-blue-950 sm:text-xl">
            {value}
          </p>
          {subValue && (
            <p className="mt-0.5 text-xs text-slate-500">{subValue}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow",
            colorMap[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

function PeriodChip({
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
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-nexus-blue-950 bg-nexus-blue-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-3 py-2.5 text-left font-bold text-slate-600">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "inline-flex items-center gap-1 transition",
          active ? "text-nexus-blue-950" : "hover:text-nexus-blue-950"
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            active ? "text-nexus-orange-500" : "text-slate-300"
          )}
        />
        {active && (
          <span className="ml-0.5 text-[10px]">
            {dir === "desc" ? "↓" : "↑"}
          </span>
        )}
      </button>
    </th>
  );
}
