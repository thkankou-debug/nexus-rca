"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  AlertTriangle,
  Wallet,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  Download,
  UserCircle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  PaymentForm,
  type Payment,
  type PaymentStatus,
  type PaymentMethod,
} from "./PaymentForm";

interface AgentOption {
  id: string;
  nom: string;
  prenom: string | null;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  non_paye: "Non payé",
  partiel: "Partiel",
  paye: "Payé",
  rembourse: "Remboursé",
  annule: "Annulé",
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  non_paye: "bg-red-100 text-red-700 border-red-200",
  partiel: "bg-amber-100 text-amber-700 border-amber-200",
  paye: "bg-green-100 text-green-700 border-green-200",
  rembourse: "bg-slate-100 text-slate-700 border-slate-200",
  annule: "bg-slate-100 text-slate-500 border-slate-200",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: "Espèces",
  virement: "Virement",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  carte: "Carte",
  cheque: "Chèque",
  autre: "Autre",
};

const STATUSES: PaymentStatus[] = [
  "non_paye",
  "partiel",
  "paye",
  "rembourse",
  "annule",
];

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
export function PaymentsManager({
  initialPayments,
  agents,
  currentUserId,
  canEdit = true,
  canDelete = false,
}: {
  initialPayments: Payment[];
  agents: AgentOption[];
  currentUserId: string;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const supabase = createClient();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null);

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.montant_total), 0);
    const recu = payments.reduce((sum, p) => sum + Number(p.montant_recu), 0);
    const restant = total - recu;
    return { total, recu, restant };
  }, [payments]);

  const filtered = useMemo(() => {
    let list = payments;
    if (filter !== "all") list = list.filter((p) => p.statut === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.client_nom.toLowerCase().includes(q) ||
          p.service.toLowerCase().includes(q) ||
          (p.reference || "").toLowerCase().includes(q) ||
          (p.client_email || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [payments, filter, search]);

  const counts = useMemo(() => {
    return {
      all: payments.length,
      non_paye: payments.filter((p) => p.statut === "non_paye").length,
      partiel: payments.filter((p) => p.statut === "partiel").length,
      paye: payments.filter((p) => p.statut === "paye").length,
      rembourse: payments.filter((p) => p.statut === "rembourse").length,
      annule: payments.filter((p) => p.statut === "annule").length,
    };
  }, [payments]);

  const handleSaved = (saved: Payment) => {
    setPayments((list) => {
      const idx = list.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = saved;
        return next;
      }
      return [saved, ...list];
    });
    setShowForm(false);
    setEditingPayment(null);
  };

  const handleDelete = async (payment: Payment) => {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id);

    if (error) {
      toast.error("Suppression refusée : " + error.message);
      return;
    }
    setPayments((list) => list.filter((p) => p.id !== payment.id));
    setConfirmDelete(null);
    toast.success("Paiement supprimé");
  };

  const downloadProof = async (payment: Payment) => {
    if (!payment.preuve_path) return;
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(payment.preuve_path, 60);
    if (error || !data) {
      toast.error("Impossible de télécharger");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatBlock
          icon={Wallet}
          label="Total facturé"
          value={formatMoney(stats.total)}
          accent="blue"
        />
        <StatBlock
          icon={CheckCircle2}
          label="Total encaissé"
          value={formatMoney(stats.recu)}
          accent="green"
        />
        <StatBlock
          icon={Clock}
          label="Restant à encaisser"
          value={formatMoney(stats.restant)}
          accent="orange"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par client, référence, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPayment(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouveau paiement
        </button>
      </div>

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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {payments.length === 0
              ? "Aucun paiement enregistré pour le moment."
              : "Aucun paiement pour ce filtre."}
          </p>
          {payments.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-orange-600"
            >
              <Plus className="h-4 w-4" />
              Enregistrer le premier paiement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PaymentCard
              key={p.id}
              payment={p}
              agents={agents}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={() => {
                setEditingPayment(p);
                setShowForm(true);
              }}
              onDelete={() => setConfirmDelete(p)}
              onDownloadProof={() => downloadProof(p)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PaymentForm
          initialData={editingPayment}
          agents={agents}
          currentUserId={currentUserId}
          onClose={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Supprimer ce paiement ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Paiement de <strong>{confirmDelete.client_nom}</strong> ·{" "}
                  {formatMoney(
                    Number(confirmDelete.montant_total),
                    confirmDelete.devise
                  )}
                </p>
                <p className="mt-2 text-xs text-red-600">
                  Cette action est irréversible.
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
// CARTE PAIEMENT
// ============================================================================
function PaymentCard({
  payment,
  agents,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onDownloadProof,
}: {
  payment: Payment;
  agents: AgentOption[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDownloadProof: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const agentName = agents.find((a) => a.id === payment.agent_id);
  const restant = Number(payment.montant_total) - Number(payment.montant_recu);
  const pct =
    Number(payment.montant_total) > 0
      ? (Number(payment.montant_recu) / Number(payment.montant_total)) * 100
      : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-nexus-blue-700">
                {payment.reference || "—"}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_COLORS[payment.statut]
                )}
              >
                {STATUS_LABELS[payment.statut]}
              </span>
              {payment.client_record_id && (
                <Link
                  href={`/dashboard/super-admin/clients/${payment.client_record_id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-nexus-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nexus-blue-700 transition hover:bg-nexus-blue-200"
                >
                  <UserCircle className="h-3 w-3" />
                  Fiche client
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
              {payment.client_nom}
            </h3>
            <p className="text-sm text-slate-600">{payment.service}</p>
          </div>

          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">
              {formatMoney(Number(payment.montant_recu), payment.devise)}
            </p>
            <p className="text-xs text-slate-500">
              sur {formatMoney(Number(payment.montant_total), payment.devise)}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full transition-all",
                payment.statut === "paye"
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600"
              )}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          {restant > 0 && (
            <p className="mt-1 text-xs text-nexus-orange-600">
              Restant : {formatMoney(restant, payment.devise)}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(payment.date_paiement)}
          </span>
          <span>{METHOD_LABELS[payment.mode_paiement]}</span>
          {agentName && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {agentName.prenom} {agentName.nom}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            {expanded ? "Masquer" : "Détails"}
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-nexus-blue-200 bg-nexus-blue-50 px-3 py-1.5 text-xs font-semibold text-nexus-blue-700 hover:bg-nexus-blue-100"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Modifier
            </button>
          )}
          {payment.preuve_path && (
            <button
              type="button"
              onClick={onDownloadProof}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              <Download className="h-3.5 w-3.5" />
              Voir reçu
            </button>
          )}
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

        {expanded && (
          <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
            {payment.client_email && (
              <DetailRow icon={Mail} label="Email" value={payment.client_email} />
            )}
            {payment.client_telephone && (
              <DetailRow
                icon={Phone}
                label="Téléphone"
                value={payment.client_telephone}
              />
            )}
            {payment.description && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </p>
                <p className="mt-1 text-slate-700">{payment.description}</p>
              </div>
            )}
            {payment.notes_internes && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Notes internes
                </p>
                <p className="mt-1 whitespace-pre-line text-slate-700">
                  {payment.notes_internes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}
