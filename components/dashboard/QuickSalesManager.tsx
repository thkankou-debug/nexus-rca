"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Calendar,
  User,
  ShoppingCart,
  TrendingUp,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import {
  QuickSaleForm,
  QuickSaleReceiptButtons,
  SERVICE_LABELS,
  SERVICE_ICONS,
  type QuickSale,
  type QuickServiceType,
  type QuickPaymentMethod,
} from "./QuickSaleForm";

interface AgentInfo {
  id: string;
  nom: string;
  prenom: string | null;
}

const PAYMENT_LABELS: Record<QuickPaymentMethod, string> = {
  especes: "Espèces",
  virement: "Virement",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  carte: "Carte",
  cheque: "Chèque",
  autre: "Autre",
};

type Period = "today" | "week" | "month" | "all";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function isInPeriod(dateStr: string, period: Period): boolean {
  if (period === "all") return true;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    if (period === "today") {
      return d.toDateString() === now.toDateString();
    }
    const start = new Date(now);
    if (period === "week") start.setDate(start.getDate() - 7);
    if (period === "month") start.setMonth(start.getMonth() - 1);
    return d >= start;
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
function exportCSV(sales: QuickSale[], agents: AgentInfo[]) {
  const headers = [
    "Reference",
    "Date",
    "Service",
    "Description",
    "Quantite",
    "Prix unitaire",
    "Total",
    "Devise",
    "Mode paiement",
    "Client",
    "Agent",
  ];

  const rows = sales.map((s) => {
    const agent = agents.find((a) => a.id === s.agent_id);
    const agentName = agent
      ? [agent.prenom, agent.nom].filter(Boolean).join(" ")
      : "—";
    return [
      s.reference || "",
      new Date(s.date_paiement).toLocaleDateString("fr-FR"),
      SERVICE_LABELS[s.type_service],
      s.description || "",
      String(s.quantite),
      String(s.prix_unitaire),
      String(s.montant_total),
      s.devise,
      PAYMENT_LABELS[s.mode_paiement],
      s.client_nom || "—",
      agentName,
    ];
  });

  const csv = [
    `"Caisse rapide Nexus RCA - ${new Date().toLocaleString("fr-FR")}"`,
    "",
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Caisse_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportPDF(sales: QuickSale[], agents: AgentInfo[], period: Period) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = 297;
  const margin = 12;
  let y = margin;

  doc.setFillColor(255, 102, 0);
  doc.rect(0, 0, pageWidth, 6, "F");

  y = 16;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(12, 28, 64);
  doc.text("NEXUS RCA - Caisse rapide", margin, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Genere le ${new Date().toLocaleString("fr-FR")}`,
    pageWidth - margin,
    y - 2,
    { align: "right" }
  );
  doc.text(
    `Periode : ${period === "today" ? "Aujourd hui" : period === "week" ? "7 jours" : period === "month" ? "30 jours" : "Tout"}`,
    pageWidth - margin,
    y + 3,
    { align: "right" }
  );

  // Total
  const total = sales.reduce(
    (s, x) => s + Number(x.montant_total || 0),
    0
  );
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(12, 28, 64);
  doc.text(`Total : ${formatMoney(total)}`, margin, y + 8);

  y += 18;

  // Tableau
  const colWidths = [22, 28, 30, 60, 18, 25, 28, 25, 35];
  const headers = [
    "Ref.",
    "Date",
    "Service",
    "Description",
    "Qte",
    "P.U.",
    "Total",
    "Mode",
    "Agent",
  ];

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  let x = margin + 2;
  headers.forEach((h, i) => {
    doc.text(h, x, y + 5);
    x += colWidths[i];
  });
  y += 8;

  doc.setFont("helvetica", "normal");
  sales.forEach((s, i) => {
    if (y > 195) {
      doc.addPage();
      y = margin;
    }
    if (i % 2 === 1) {
      doc.setFillColor(252, 252, 253);
      doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
    }
    const agent = agents.find((a) => a.id === s.agent_id);
    const agentName = agent
      ? [agent.prenom?.[0], agent.nom].filter(Boolean).join(". ")
      : "—";

    x = margin + 2;
    doc.setFontSize(7);
    doc.text((s.reference || "").substring(0, 14), x, y + 4);
    x += colWidths[0];
    doc.text(
      new Date(s.date_paiement).toLocaleDateString("fr-FR"),
      x,
      y + 4
    );
    x += colWidths[1];
    doc.text(SERVICE_LABELS[s.type_service], x, y + 4);
    x += colWidths[2];
    doc.text((s.description || "—").substring(0, 35), x, y + 4);
    x += colWidths[3];
    doc.text(String(s.quantite), x, y + 4);
    x += colWidths[4];
    doc.text(formatMoney(s.prix_unitaire, "").trim(), x, y + 4);
    x += colWidths[5];
    doc.setFont("helvetica", "bold");
    doc.text(formatMoney(s.montant_total, ""), x, y + 4);
    doc.setFont("helvetica", "normal");
    x += colWidths[6];
    doc.text(PAYMENT_LABELS[s.mode_paiement], x, y + 4);
    x += colWidths[7];
    doc.text(agentName.substring(0, 15), x, y + 4);
    y += 6;
  });

  doc.save(`Caisse_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function QuickSalesManager({
  initialSales,
  agents,
  currentUserId,
  showAgentColumn = false,
  showStats = false,
}: {
  initialSales: QuickSale[];
  agents: AgentInfo[];
  currentUserId: string;
  showAgentColumn?: boolean;
  showStats?: boolean;
}) {
  const [sales, setSales] = useState<QuickSale[]>(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<Period>("today");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<QuickServiceType | "all">(
    "all"
  );
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = sales.filter((s) => isInPeriod(s.date_paiement, period));
    if (serviceFilter !== "all") {
      list = list.filter((s) => s.type_service === serviceFilter);
    }
    if (agentFilter !== "all") {
      list = list.filter((s) => s.agent_id === agentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          (s.reference || "").toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.client_nom || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [sales, period, search, serviceFilter, agentFilter]);

  const stats = useMemo(() => {
    const total = filtered.reduce(
      (s, x) => s + Number(x.montant_total || 0),
      0
    );
    const nb = filtered.length;
    const moyenne = nb > 0 ? total / nb : 0;

    // Top services
    const parService: Record<string, { nb: number; total: number }> = {};
    filtered.forEach((s) => {
      if (!parService[s.type_service]) {
        parService[s.type_service] = { nb: 0, total: 0 };
      }
      parService[s.type_service].nb += s.quantite;
      parService[s.type_service].total += Number(s.montant_total);
    });
    const topServices = Object.entries(parService)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    // Top agents
    const parAgent: Record<string, { nb: number; total: number }> = {};
    filtered.forEach((s) => {
      if (!s.agent_id) return;
      if (!parAgent[s.agent_id]) {
        parAgent[s.agent_id] = { nb: 0, total: 0 };
      }
      parAgent[s.agent_id].nb += 1;
      parAgent[s.agent_id].total += Number(s.montant_total);
    });
    const topAgents = Object.entries(parAgent)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    return { total, nb, moyenne, topServices, topAgents };
  }, [filtered]);

  const handleSaved = (saved: QuickSale) => {
    setSales((list) => [saved, ...list]);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {/* BARRE ACTIONS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <PeriodChip
            label="Aujourd'hui"
            active={period === "today"}
            onClick={() => setPeriod("today")}
          />
          <PeriodChip
            label="7 jours"
            active={period === "week"}
            onClick={() => setPeriod("week")}
          />
          <PeriodChip
            label="30 jours"
            active={period === "month"}
            onClick={() => setPeriod("month")}
          />
          <PeriodChip
            label="Tout"
            active={period === "all"}
            onClick={() => setPeriod("all")}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {showStats && (
            <>
              <button
                type="button"
                onClick={() => exportCSV(filtered, agents)}
                className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => exportPDF(filtered, agents, period)}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
              >
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Nouvelle vente
          </button>
        </div>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatBlock
          icon={ShoppingCart}
          label="Total encaissé"
          value={formatMoney(stats.total)}
          sub={`${stats.nb} vente${stats.nb > 1 ? "s" : ""}`}
          accent="green"
        />
        <StatBlock
          icon={TrendingUp}
          label="Panier moyen"
          value={formatMoney(stats.moyenne)}
          sub="Par vente"
          accent="orange"
        />
        <StatBlock
          icon={Calendar}
          label="Période"
          value={
            period === "today"
              ? "Aujourd'hui"
              : period === "week"
              ? "7 jours"
              : period === "month"
              ? "30 jours"
              : "Tout"
          }
          sub={`${filtered.length} transaction${filtered.length > 1 ? "s" : ""}`}
          accent="blue"
        />
      </div>

      {/* STATS DETAILLEES (super-admin uniquement) */}
      {showStats && (stats.topServices.length > 0 || stats.topAgents.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              Ventes par service
            </h3>
            <div className="space-y-2">
              {stats.topServices.map(([service, data]) => {
                const Icon = SERVICE_ICONS[service as QuickServiceType];
                const pct = stats.total > 0 ? (data.total / stats.total) * 100 : 0;
                return (
                  <div key={service}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <Icon className="h-3.5 w-3.5" />
                        {SERVICE_LABELS[service as QuickServiceType]}
                      </span>
                      <span className="font-semibold text-nexus-blue-950">
                        {formatMoney(data.total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-600"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {data.nb} unité{data.nb > 1 ? "s" : ""} · {pct.toFixed(1)}% du total
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top agents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              Ventes par agent
            </h3>
            <div className="space-y-2">
              {stats.topAgents.map(([agentId, data]) => {
                const agent = agents.find((a) => a.id === agentId);
                const name = agent
                  ? [agent.prenom, agent.nom].filter(Boolean).join(" ")
                  : "—";
                const pct = stats.total > 0 ? (data.total / stats.total) * 100 : 0;
                return (
                  <div key={agentId}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <User className="h-3.5 w-3.5" />
                        {name}
                      </span>
                      <span className="font-semibold text-nexus-blue-950">
                        {formatMoney(data.total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-nexus-blue-600 to-nexus-blue-800"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {data.nb} vente{data.nb > 1 ? "s" : ""} · {pct.toFixed(1)}% du total
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par référence, description, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <select
          value={serviceFilter}
          onChange={(e) =>
            setServiceFilter(e.target.value as QuickServiceType | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Tous services</option>
          {(
            Object.entries(SERVICE_LABELS) as [QuickServiceType, string][]
          ).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        {showAgentColumn && (
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Tous agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {[a.prenom, a.nom].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* HISTORIQUE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-slate-600">
              {sales.length === 0
                ? "Aucune vente enregistrée."
                : "Aucune vente pour ces filtres."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((sale) => (
              <SaleRow
                key={sale.id}
                sale={sale}
                agents={agents}
                showAgent={showAgentColumn}
              />
            ))}
          </div>
        )}
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <QuickSaleForm
          currentUserId={currentUserId}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ============================================================================
// LIGNE VENTE
// ============================================================================
function SaleRow({
  sale,
  agents,
  showAgent,
}: {
  sale: QuickSale;
  agents: AgentInfo[];
  showAgent: boolean;
}) {
  const Icon = SERVICE_ICONS[sale.type_service];
  const agent = agents.find((a) => a.id === sale.agent_id);
  const agentName = agent
    ? [agent.prenom, agent.nom].filter(Boolean).join(" ")
    : null;

  return (
    <div className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-100 to-nexus-orange-50 text-nexus-orange-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-nexus-blue-700">
            {sale.reference}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {SERVICE_LABELS[sale.type_service]}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            x{sale.quantite}
          </span>
        </div>
        {sale.description && (
          <p className="mt-0.5 truncate text-xs text-slate-600">
            {sale.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
          <span>{formatDate(sale.date_paiement)}</span>
          <span>· {PAYMENT_LABELS[sale.mode_paiement]}</span>
          {sale.client_nom && <span>· {sale.client_nom}</span>}
          {showAgent && agentName && <span>· Agent : {agentName}</span>}
        </div>
      </div>
      <div className="text-right">
        <p className="font-display text-base font-bold text-nexus-blue-950">
          {formatMoney(Number(sale.montant_total), sale.devise)}
        </p>
        <div className="mt-1 flex flex-wrap justify-end gap-1">
          <QuickSaleReceiptButtons sale={sale} agent={agent} compact />
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent: "green" | "orange" | "blue";
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    blue: "from-nexus-blue-600 to-nexus-blue-800",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate font-display text-lg font-bold text-nexus-blue-950 sm:text-xl">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow",
            colorMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
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
