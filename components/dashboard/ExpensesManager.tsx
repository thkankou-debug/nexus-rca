"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Trash2,
  Edit3,
  Eye,
  AlertTriangle,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Building2,
  Download,
  TrendingDown,
  Plus,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  ExpenseForm,
  CATEGORY_LABELS,
  METHOD_LABELS,
  type Expense,
  type ExpenseStatus,
} from "./ExpenseForm";

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  en_attente: "En attente",
  valide: "Validée",
  rejete: "Rejetée",
};

const STATUS_COLORS: Record<ExpenseStatus, string> = {
  en_attente: "bg-amber-100 text-amber-700 border-amber-200",
  valide: "bg-green-100 text-green-700 border-green-200",
  rejete: "bg-red-100 text-red-700 border-red-200",
};

const STATUSES: ExpenseStatus[] = ["en_attente", "valide", "rejete"];

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

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function ExpensesManager({
  initialExpenses,
  currentUserId,
  currentUserName,
  canValidate = false,
  canDelete = false,
}: {
  initialExpenses: Expense[];
  currentUserId: string;
  currentUserName: string;
  canValidate?: boolean;
  canDelete?: boolean;
}) {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filter, setFilter] = useState<ExpenseStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  // Statistiques
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.montant), 0);
    const valide = expenses
      .filter((e) => e.statut === "valide")
      .reduce((sum, e) => sum + Number(e.montant), 0);
    const enAttente = expenses
      .filter((e) => e.statut === "en_attente")
      .reduce((sum, e) => sum + Number(e.montant), 0);
    return { total, valide, enAttente };
  }, [expenses]);

  // Filtrage
  const filtered = useMemo(() => {
    let list = expenses;
    if (filter !== "all") list = list.filter((e) => e.statut === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.employee_nom.toLowerCase().includes(q) ||
          e.motif.toLowerCase().includes(q) ||
          (e.reference || "").toLowerCase().includes(q) ||
          (e.fournisseur || "").toLowerCase().includes(q) ||
          CATEGORY_LABELS[e.categorie].toLowerCase().includes(q)
      );
    }
    return list;
  }, [expenses, filter, search]);

  const counts = useMemo(() => {
    return {
      all: expenses.length,
      en_attente: expenses.filter((e) => e.statut === "en_attente").length,
      valide: expenses.filter((e) => e.statut === "valide").length,
      rejete: expenses.filter((e) => e.statut === "rejete").length,
    };
  }, [expenses]);

  // Actions
  const handleSaved = (saved: Expense) => {
    setExpenses((list) => {
      const idx = list.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = saved;
        return next;
      }
      return [saved, ...list];
    });
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleValidate = async (expense: Expense) => {
    const { data, error } = await supabase
      .from("expenses")
      .update({
        statut: "valide",
        validated_by: currentUserId,
        motif_rejet: null,
      })
      .eq("id", expense.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    setExpenses((list) =>
      list.map((e) => (e.id === expense.id ? (data as Expense) : e))
    );
    toast.success("Dépense validée");
  };

  const handleReject = async () => {
    if (!rejectingExpense) return;
    if (!rejectReason.trim()) {
      toast.error("Indique le motif du rejet");
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        statut: "rejete",
        validated_by: currentUserId,
        motif_rejet: rejectReason.trim(),
      })
      .eq("id", rejectingExpense.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    setExpenses((list) =>
      list.map((e) =>
        e.id === rejectingExpense.id ? (data as Expense) : e
      )
    );
    setRejectingExpense(null);
    setRejectReason("");
    toast.success("Dépense rejetée");
  };

  const handleResetStatus = async (expense: Expense) => {
    const { data, error } = await supabase
      .from("expenses")
      .update({
        statut: "en_attente",
      })
      .eq("id", expense.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    setExpenses((list) =>
      list.map((e) => (e.id === expense.id ? (data as Expense) : e))
    );
    toast.success("Remise en attente");
  };

  const handleDelete = async (expense: Expense) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id);

    if (error) {
      toast.error("Suppression refusée : " + error.message);
      return;
    }
    setExpenses((list) => list.filter((e) => e.id !== expense.id));
    setConfirmDelete(null);
    toast.success("Dépense supprimée");
  };

  const downloadProof = async (expense: Expense) => {
    if (!expense.preuve_path) return;
    const { data, error } = await supabase.storage
      .from("expense-proofs")
      .createSignedUrl(expense.preuve_path, 60);
    if (error || !data) {
      toast.error("Impossible de télécharger");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatBlock
          icon={TrendingDown}
          label="Total des dépenses"
          value={formatMoney(stats.total)}
          accent="blue"
        />
        <StatBlock
          icon={CheckCircle2}
          label="Validées"
          value={formatMoney(stats.valide)}
          accent="green"
        />
        <StatBlock
          icon={Clock}
          label="En attente"
          value={formatMoney(stats.enAttente)}
          accent="orange"
        />
      </div>

      {/* Barre d action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par employé, motif, fournisseur, catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle dépense
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={`Tous (${counts.all})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={`${STATUS_LABELS[s]} (${counts[s]})`}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {expenses.length === 0
              ? "Aucune dépense enregistrée pour le moment."
              : "Aucune dépense pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <ExpenseCard
              key={e.id}
              expense={e}
              canValidate={canValidate}
              canDelete={canDelete}
              onEdit={() => {
                setEditingExpense(e);
                setShowForm(true);
              }}
              onDelete={() => setConfirmDelete(e)}
              onValidate={() => handleValidate(e)}
              onReject={() => {
                setRejectingExpense(e);
                setRejectReason(e.motif_rejet || "");
              }}
              onResetStatus={() => handleResetStatus(e)}
              onDownloadProof={() => downloadProof(e)}
            />
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <ExpenseForm
          initialData={editingExpense}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Modal rejet */}
      {rejectingExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setRejectingExpense(null);
            setRejectReason("");
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Rejeter la dépense ?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  De {rejectingExpense.employee_nom} ·{" "}
                  {formatMoney(
                    Number(rejectingExpense.montant),
                    rejectingExpense.devise
                  )}
                </p>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  placeholder="Motif du rejet (visible par l'employé)..."
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRejectingExpense(null);
                  setRejectReason("");
                }}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Supprimer cette dépense ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  De <strong>{confirmDelete.employee_nom}</strong> ·{" "}
                  {formatMoney(
                    Number(confirmDelete.montant),
                    confirmDelete.devise
                  )}
                </p>
                <p className="mt-2 text-xs text-red-600">
                  Action irréversible.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CARTE DEPENSE
// ============================================================================
function ExpenseCard({
  expense,
  canValidate,
  canDelete,
  onEdit,
  onDelete,
  onValidate,
  onReject,
  onResetStatus,
  onDownloadProof,
}: {
  expense: Expense;
  canValidate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onValidate: () => void;
  onReject: () => void;
  onResetStatus: () => void;
  onDownloadProof: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-nexus-blue-700">
                {expense.reference || "—"}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_COLORS[expense.statut]
                )}
              >
                {STATUS_LABELS[expense.statut]}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {CATEGORY_LABELS[expense.categorie]}
              </span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
              {expense.motif}
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {expense.employee_nom}
              </span>
              {expense.fournisseur && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {expense.fournisseur}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">
              {formatMoney(Number(expense.montant), expense.devise)}
            </p>
            <p className="text-xs text-slate-500">
              {METHOD_LABELS[expense.mode_paiement]}
            </p>
          </div>
        </div>

        {/* Méta */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Dépensé le {formatDate(expense.date_depense)}
          </span>
          {expense.validated_at && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {expense.statut === "valide" ? "Validée" : "Rejetée"} le{" "}
              {formatDate(expense.validated_at)}
            </span>
          )}
        </div>

        {/* Motif rejet (si rejeté) */}
        {expense.statut === "rejete" && expense.motif_rejet && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">
              Motif du rejet
            </p>
            <p className="mt-1 text-sm text-red-900">{expense.motif_rejet}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            {expanded ? "Masquer" : "Détails"}
          </button>

          {expense.preuve_path && (
            <button
              type="button"
              onClick={onDownloadProof}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              <Download className="h-3.5 w-3.5" />
              Voir reçu
            </button>
          )}

          {/* Actions super-admin (validation) */}
          {canValidate && expense.statut === "en_attente" && (
            <>
              <button
                type="button"
                onClick={onValidate}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Valider
              </button>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                <XCircle className="h-3.5 w-3.5" />
                Rejeter
              </button>
            </>
          )}

          {/* Remettre en attente si validé/rejeté */}
          {canValidate && expense.statut !== "en_attente" && (
            <button
              type="button"
              onClick={onResetStatus}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              <Clock className="h-3.5 w-3.5" />
              Remettre en attente
            </button>
          )}

          {/* Modifier (toujours possible si admin/super_admin, ou si en_attente pour agent) */}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full border border-nexus-blue-200 bg-nexus-blue-50 px-3 py-1.5 text-xs font-semibold text-nexus-blue-700 hover:bg-nexus-blue-100"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Modifier
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          )}
        </div>

        {/* Détails dépliés */}
        {expanded && (
          <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <DetailRow label="Référence" value={expense.reference || "—"} />
            <DetailRow
              label="Catégorie"
              value={CATEGORY_LABELS[expense.categorie]}
            />
            <DetailRow
              label="Mode de paiement"
              value={METHOD_LABELS[expense.mode_paiement]}
            />
            {expense.fournisseur && (
              <DetailRow label="Fournisseur" value={expense.fournisseur} />
            )}
            <DetailRow
              label="Soumis le"
              value={formatDate(expense.created_at)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS COMMUNS
// ============================================================================
function StatBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "blue" | "green" | "orange";
}) {
  const colorMap = {
    blue: "from-nexus-blue-600 to-nexus-blue-800",
    green: "from-emerald-400 to-emerald-600",
    orange: "from-nexus-orange-400 to-nexus-orange-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function FilterChip({
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  );
}
