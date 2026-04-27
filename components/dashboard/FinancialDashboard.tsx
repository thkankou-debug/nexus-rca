"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Activity,
  Calendar,
  User,
  XCircle,
  AlertTriangle,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Payment,
  PaymentStatus,
} from "./PaymentForm";
import {
  type Expense,
  type ExpenseStatus,
  CATEGORY_LABELS,
} from "./ExpenseForm";

// ============================================================================
// LABELS
// ============================================================================
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  non_paye: "Non payé",
  partiel: "Partiel",
  paye: "Payé",
  rembourse: "Remboursé",
  annule: "Annulé",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  non_paye: "bg-red-100 text-red-700",
  partiel: "bg-amber-100 text-amber-700",
  paye: "bg-green-100 text-green-700",
  rembourse: "bg-slate-100 text-slate-700",
  annule: "bg-slate-100 text-slate-500",
};

const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  en_attente: "En attente",
  valide: "Validée",
  rejete: "Rejetée",
};

const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  valide: "bg-green-100 text-green-700",
  rejete: "bg-red-100 text-red-700",
};

// ============================================================================
// HELPERS
// ============================================================================
function formatMoney(amount: number, currency = "XAF"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function FinancialDashboard({
  payments,
  expenses,
}: {
  payments: Payment[];
  expenses: Expense[];
}) {
  const [period, setPeriod] = useState<"all" | "month" | "year">("all");

  // Filtrer selon la période
  const filteredData = useMemo(() => {
    if (period === "all") return { payments, expenses };

    const now = new Date();
    const startDate = new Date();
    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return {
      payments: payments.filter(
        (p) => new Date(p.date_paiement) >= startDate
      ),
      expenses: expenses.filter(
        (e) => new Date(e.date_depense) >= startDate
      ),
    };
  }, [payments, expenses, period]);

  // ==========================================================================
  // CALCULS FINANCIERS
  // ==========================================================================
  const stats = useMemo(() => {
    const { payments: p, expenses: e } = filteredData;

    // Encaissements
    const totalFacture = p.reduce(
      (sum, x) => sum + Number(x.montant_total),
      0
    );
    const totalEncaisse = p.reduce(
      (sum, x) => sum + Number(x.montant_recu),
      0
    );
    const totalRestant = totalFacture - totalEncaisse;

    // Dépenses
    const totalDepenses = e.reduce(
      (sum, x) => sum + Number(x.montant),
      0
    );
    const totalDepensesValidees = e
      .filter((x) => x.statut === "valide")
      .reduce((sum, x) => sum + Number(x.montant), 0);
    const totalDepensesEnAttente = e
      .filter((x) => x.statut === "en_attente")
      .reduce((sum, x) => sum + Number(x.montant), 0);

    // Solde net (encaissé - dépenses validées)
    const soldeNet = totalEncaisse - totalDepensesValidees;

    // Compteurs
    const nbPaiementsPartiels = p.filter(
      (x) => x.statut === "partiel"
    ).length;
    const nbPaiementsImpayes = p.filter(
      (x) => x.statut === "non_paye"
    ).length;
    const nbDepensesEnAttente = e.filter(
      (x) => x.statut === "en_attente"
    ).length;

    return {
      totalFacture,
      totalEncaisse,
      totalRestant,
      totalDepenses,
      totalDepensesValidees,
      totalDepensesEnAttente,
      soldeNet,
      nbPaiementsPartiels,
      nbPaiementsImpayes,
      nbDepensesEnAttente,
    };
  }, [filteredData]);

  // ==========================================================================
  // ACTIVITE RECENTE (5 derniers de chaque)
  // ==========================================================================
  const recentPayments = useMemo(
    () =>
      [...filteredData.payments]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [filteredData.payments]
  );

  const recentExpenses = useMemo(
    () =>
      [...filteredData.expenses]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [filteredData.expenses]
  );

  // ==========================================================================
  // ALERTES (problèmes nécessitant attention)
  // ==========================================================================
  const alerts = useMemo(() => {
    const list: Array<{
      type: "warning" | "info" | "danger";
      title: string;
      description: string;
      href?: string;
      count?: number;
    }> = [];

    if (stats.nbDepensesEnAttente > 0) {
      list.push({
        type: "warning",
        title: `${stats.nbDepensesEnAttente} dépense${
          stats.nbDepensesEnAttente > 1 ? "s" : ""
        } en attente de validation`,
        description: `${formatMoney(
          stats.totalDepensesEnAttente
        )} à valider ou rejeter`,
        href: "/dashboard/super-admin/depenses",
        count: stats.nbDepensesEnAttente,
      });
    }

    if (stats.nbPaiementsPartiels > 0) {
      list.push({
        type: "info",
        title: `${stats.nbPaiementsPartiels} paiement${
          stats.nbPaiementsPartiels > 1 ? "s" : ""
        } partiel${stats.nbPaiementsPartiels > 1 ? "s" : ""}`,
        description: `Solde restant à encaisser`,
        href: "/dashboard/super-admin/paiements",
        count: stats.nbPaiementsPartiels,
      });
    }

    if (stats.nbPaiementsImpayes > 0) {
      list.push({
        type: "danger",
        title: `${stats.nbPaiementsImpayes} paiement${
          stats.nbPaiementsImpayes > 1 ? "s" : ""
        } non payé${stats.nbPaiementsImpayes > 1 ? "s" : ""}`,
        description: `Aucun encaissement effectué`,
        href: "/dashboard/super-admin/paiements",
        count: stats.nbPaiementsImpayes,
      });
    }

    if (stats.soldeNet < 0) {
      list.push({
        type: "danger",
        title: "Solde net négatif",
        description: `Les dépenses validées (${formatMoney(
          stats.totalDepensesValidees
        )}) dépassent les encaissements (${formatMoney(
          stats.totalEncaisse
        )})`,
      });
    }

    return list;
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* SELECTEUR DE PERIODE */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            {period === "all"
              ? "Vue d'ensemble depuis le début"
              : period === "year"
              ? "Données des 12 derniers mois"
              : "Données des 30 derniers jours"}
          </p>
        </div>
        <div className="flex gap-2">
          <PeriodChip
            label="Tout"
            active={period === "all"}
            onClick={() => setPeriod("all")}
          />
          <PeriodChip
            label="12 derniers mois"
            active={period === "year"}
            onClick={() => setPeriod("year")}
          />
          <PeriodChip
            label="30 derniers jours"
            active={period === "month"}
            onClick={() => setPeriod("month")}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* STATS PRINCIPALES — 4 GROSSES CARTES */}
      {/* ============================================================ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStatCard
          icon={CheckCircle2}
          label="Total encaissé"
          value={formatMoney(stats.totalEncaisse)}
          accent="green"
          trend={
            stats.totalFacture > 0
              ? `${Math.round(
                  (stats.totalEncaisse / stats.totalFacture) * 100
                )}% de ${formatMoney(stats.totalFacture)}`
              : undefined
          }
        />
        <BigStatCard
          icon={Clock}
          label="Restant à encaisser"
          value={formatMoney(stats.totalRestant)}
          accent="orange"
          trend={
            stats.totalRestant > 0 ? "Solde dû par les clients" : "Tout encaissé"
          }
        />
        <BigStatCard
          icon={TrendingDown}
          label="Total dépenses validées"
          value={formatMoney(stats.totalDepensesValidees)}
          accent="blue"
          trend={
            stats.nbDepensesEnAttente > 0
              ? `+ ${formatMoney(
                  stats.totalDepensesEnAttente
                )} en attente`
              : "Toutes validées"
          }
        />
        <BigStatCard
          icon={Wallet}
          label="Solde net"
          value={formatMoney(stats.soldeNet)}
          accent={stats.soldeNet >= 0 ? "purple" : "red"}
          trend="Encaissé − Dépenses validées"
          highlighted={true}
        />
      </div>

      {/* ============================================================ */}
      {/* ALERTES */}
      {/* ============================================================ */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-nexus-orange-600" />
            <h3 className="font-display text-base font-bold text-nexus-blue-950">
              Alertes & actions à faire
            </h3>
            <span className="ml-auto rounded-full bg-nexus-orange-100 px-2.5 py-0.5 text-xs font-bold text-nexus-orange-700">
              {alerts.length}
            </span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <AlertItem key={i} {...alert} />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RESUME RAPIDE — RATIO ENTRÉES / SORTIES */}
      {/* ============================================================ */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Entrées */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Entrées
              </p>
              <p className="font-display text-lg font-bold text-nexus-blue-950">
                {formatMoney(stats.totalEncaisse)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-slate-500">Facturé</p>
              <p className="font-semibold text-slate-700">
                {formatMoney(stats.totalFacture)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-slate-500">Restant</p>
              <p className="font-semibold text-nexus-orange-600">
                {formatMoney(stats.totalRestant)}
              </p>
            </div>
          </div>
        </div>

        {/* Sorties */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sorties
              </p>
              <p className="font-display text-lg font-bold text-nexus-blue-950">
                {formatMoney(stats.totalDepensesValidees)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-slate-500">Validées</p>
              <p className="font-semibold text-green-700">
                {formatMoney(stats.totalDepensesValidees)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-slate-500">En attente</p>
              <p className="font-semibold text-amber-600">
                {formatMoney(stats.totalDepensesEnAttente)}
              </p>
            </div>
          </div>
        </div>

        {/* Solde net (illustré) */}
        <div
          className={cn(
            "rounded-2xl border p-5 shadow-sm",
            stats.soldeNet >= 0
              ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
              : "border-red-200 bg-gradient-to-br from-red-50 to-white"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                stats.soldeNet >= 0
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              )}
            >
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Solde net
              </p>
              <p
                className={cn(
                  "font-display text-lg font-bold",
                  stats.soldeNet >= 0 ? "text-green-700" : "text-red-700"
                )}
              >
                {formatMoney(stats.soldeNet)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Calculé : encaissements − dépenses validées
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ACTIVITE RECENTE (2 colonnes : paiements + dépenses) */}
      {/* ============================================================ */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Paiements récents */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-nexus-orange-600" />
              <h3 className="font-display text-base font-bold text-nexus-blue-950">
                Paiements récents
              </h3>
            </div>
            <Link
              href="/dashboard/super-admin/paiements"
              className="inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
            >
              Tout voir
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                Aucun paiement enregistré.
              </p>
            ) : (
              recentPayments.map((p) => (
                <RecentPaymentRow key={p.id} payment={p} />
              ))
            )}
          </div>
        </div>

        {/* Dépenses récentes */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-nexus-blue-700" />
              <h3 className="font-display text-base font-bold text-nexus-blue-950">
                Dépenses récentes
              </h3>
            </div>
            <Link
              href="/dashboard/super-admin/depenses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-nexus-blue-700 hover:text-nexus-blue-900"
            >
              Tout voir
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentExpenses.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                Aucune dépense enregistrée.
              </p>
            ) : (
              recentExpenses.map((e) => (
                <RecentExpenseRow key={e.id} expense={e} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ACCES RAPIDE */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-nexus-blue-50 to-nexus-orange-50 p-5 shadow-sm">
        <h3 className="font-display text-base font-bold text-nexus-blue-950">
          Actions rapides
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/super-admin/paiements"
            className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-orange-100 text-nexus-orange-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-nexus-blue-950">
                Gérer les paiements
              </p>
              <p className="text-xs text-slate-500">
                Encaisser, modifier, suivre
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-nexus-blue-950" />
          </Link>

          <Link
            href="/dashboard/super-admin/depenses"
            className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-nexus-blue-950">
                Valider les dépenses
              </p>
              <p className="text-xs text-slate-500">
                {stats.nbDepensesEnAttente > 0
                  ? `${stats.nbDepensesEnAttente} en attente`
                  : "Tout est à jour"}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-nexus-blue-950" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function BigStatCard({
  icon: Icon,
  label,
  value,
  accent,
  trend,
  highlighted = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "green" | "orange" | "blue" | "purple" | "red";
  trend?: string;
  highlighted?: boolean;
}) {
  const colorMap = {
    green: "from-emerald-400 to-emerald-600",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    purple: "from-purple-500 to-indigo-700",
    red: "from-red-500 to-red-700",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
        highlighted
          ? "border-2 border-nexus-orange-300 ring-2 ring-nexus-orange-100"
          : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {value}
          </p>
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
      {trend && (
        <p className="mt-3 text-xs text-slate-500">{trend}</p>
      )}
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

function AlertItem({
  type,
  title,
  description,
  href,
  count,
}: {
  type: "warning" | "info" | "danger";
  title: string;
  description: string;
  href?: string;
  count?: number;
}) {
  const styleMap = {
    warning: {
      bg: "bg-amber-50 border-amber-200",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      countBg: "bg-amber-200 text-amber-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      countBg: "bg-blue-200 text-blue-800",
    },
    danger: {
      bg: "bg-red-50 border-red-200",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      countBg: "bg-red-200 text-red-800",
    },
  };

  const style = styleMap[type];

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 transition",
        style.bg,
        href && "hover:shadow-md cursor-pointer"
      )}
    >
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-700">{description}</p>
      </div>
      {count !== undefined && (
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
            style.countBg
          )}
        >
          {count}
        </span>
      )}
      {href && (
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function RecentPaymentRow({ payment }: { payment: Payment }) {
  return (
    <div className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-100 to-nexus-orange-50 text-nexus-orange-700">
        <Wallet className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-nexus-blue-950">
            {payment.client_nom}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              PAYMENT_STATUS_COLORS[payment.statut]
            )}
          >
            {PAYMENT_STATUS_LABELS[payment.statut]}
          </span>
        </div>
        <p className="truncate text-xs text-slate-500">
          {payment.service} · {formatDateShort(payment.date_paiement)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-nexus-blue-950">
          {formatMoney(Number(payment.montant_recu), payment.devise)}
        </p>
        {Number(payment.montant_recu) < Number(payment.montant_total) && (
          <p className="text-xs text-slate-500">
            sur {formatMoney(Number(payment.montant_total), payment.devise)}
          </p>
        )}
      </div>
    </div>
  );
}

function RecentExpenseRow({ expense }: { expense: Expense }) {
  return (
    <div className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-100 to-nexus-blue-50 text-nexus-blue-700">
        <Receipt className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-nexus-blue-950">
            {expense.motif}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              EXPENSE_STATUS_COLORS[expense.statut]
            )}
          >
            {EXPENSE_STATUS_LABELS[expense.statut]}
          </span>
        </div>
        <p className="truncate text-xs text-slate-500">
          {expense.employee_nom} · {CATEGORY_LABELS[expense.categorie]} ·{" "}
          {formatDateShort(expense.date_depense)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-nexus-blue-950">
          {formatMoney(Number(expense.montant), expense.devise)}
        </p>
      </div>
    </div>
  );
}
