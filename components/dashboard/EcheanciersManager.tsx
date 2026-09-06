"use client";

// ============================================================================
// COMPOSANT — EcheanciersManager
// P6, lot Échéanciers. Planification d'échéances sur une facture validée/
// payée + suivi payé/à venir/en retard + reste dû.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Plus, CalendarClock, CheckCircle2, AlertTriangle, FileSpreadsheet, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv-export";

type EcheancierStatus = "a_venir" | "paye" | "en_retard";

export interface EcheancierListItem {
  id: string;
  facture_id: string;
  amount: number;
  due_date: string;
  status: EcheancierStatus;
  paid_at: string | null;
  factures: {
    reference: string | null;
    amount: number;
    currency: string;
    status: string;
    demandes: { reference: string | null; nom_complet: string; service: string; agent_id: string | null } | null;
  } | null;
}

interface FactureOption {
  id: string;
  reference: string | null;
  amount: number;
  currency: string;
  demandes: { nom_complet: string } | null;
}

const STATUS_LABELS: Record<EcheancierStatus, string> = {
  a_venir: "À venir",
  paye: "Payée",
  en_retard: "En retard",
};

const STATUS_COLORS: Record<EcheancierStatus, string> = {
  a_venir: "bg-blue-100 text-blue-700 border-blue-200",
  paye: "bg-green-100 text-green-700 border-green-200",
  en_retard: "bg-red-100 text-red-700 border-red-200",
};

const STATUSES: EcheancierStatus[] = ["a_venir", "en_retard", "paye"];

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function EcheanciersManager({
  initialEcheanciers,
  canMarkPaid,
}: {
  initialEcheanciers: EcheancierListItem[];
  canMarkPaid: boolean;
}) {
  const supabase = createClient();
  const [echeanciers, setEcheanciers] = useState<EcheancierListItem[]>(initialEcheanciers);
  const [filter, setFilter] = useState<EcheancierStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = echeanciers;
    if (filter !== "all") list = list.filter((e) => e.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          (e.factures?.reference || "").toLowerCase().includes(q) ||
          (e.factures?.demandes?.nom_complet || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [echeanciers, filter, search]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: echeanciers.length };
    for (const s of STATUSES) base[s] = echeanciers.filter((e) => e.status === s).length;
    return base;
  }, [echeanciers]);

  const resteDu = useMemo(
    () => echeanciers.filter((e) => e.status !== "paye").reduce((sum, e) => sum + e.amount, 0),
    [echeanciers]
  );

  async function reload() {
    const res = await fetch("/api/echeanciers");
    const json = await res.json();
    if (json.success) setEcheanciers(json.echeanciers);
  }

  async function markPaid(item: EcheancierListItem) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/echeanciers/${item.id}`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec");
        return;
      }
      toast.success("Échéance marquée payée");
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reste dû (à venir + en retard)</p>
        <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">{formatMoney(resteDu)}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par référence facture, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `Echeanciers_${new Date().toISOString().split("T")[0]}.csv`,
                ["Facture", "Client", "Statut", "Montant", "Devise", "Echeance", "Payee le"],
                filtered.map((e) => [
                  e.factures?.reference || "",
                  e.factures?.demandes?.nom_complet || "",
                  STATUS_LABELS[e.status],
                  String(e.amount),
                  e.factures?.currency || "XAF",
                  formatDate(e.due_date),
                  formatDate(e.paid_at),
                ])
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Planifier une échéance
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label={`Toutes (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUSES.map((s) => (
          <FilterChip key={s} label={`${STATUS_LABELS[s]} (${counts[s] || 0})`} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <CalendarClock className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {echeanciers.length === 0 ? "Aucune échéance planifiée pour le moment." : "Aucune échéance pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <EcheanceCard key={e.id} item={e} busy={busyId === e.id} canMarkPaid={canMarkPaid} onMarkPaid={() => markPaid(e)} />
          ))}
        </div>
      )}

      {showForm && (
        <EcheanceFormModal
          supabase={supabase}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await reload();
            toast.success("Échéance planifiée");
          }}
        />
      )}
    </div>
  );
}

function EcheanceCard({
  item,
  busy,
  canMarkPaid,
  onMarkPaid,
}: {
  item: EcheancierListItem;
  busy: boolean;
  canMarkPaid: boolean;
  onMarkPaid: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_COLORS[item.status])}>
                {STATUS_LABELS[item.status]}
              </span>
              {item.factures?.reference && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Facture {item.factures.reference}
                </span>
              )}
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
              {item.factures?.demandes?.nom_complet || "—"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">Échéance le {formatDate(item.due_date)}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">
              {formatMoney(item.amount, item.factures?.currency)}
            </p>
            {item.paid_at && <p className="text-xs text-slate-500">Payée le {formatDate(item.paid_at)}</p>}
          </div>
        </div>

        {item.status === "en_retard" && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Échéance dépassée
          </div>
        )}

        {item.status !== "paye" && canMarkPaid && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={onMarkPaid}
              className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Marquer payée
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EcheanceFormModal({
  supabase,
  onClose,
  onCreated,
}: {
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [factures, setFactures] = useState<FactureOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [factureId, setFactureId] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("factures")
        .select("id, reference, amount, currency, demandes(nom_complet)")
        .in("status", ["validee", "payee"])
        .order("created_at", { ascending: false })
        .limit(200);
      setFactures((data as unknown as FactureOption[]) || []);
      setLoadingOptions(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (!factureId) {
      toast.error("Sélectionne une facture");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Le montant doit être > 0");
      return;
    }
    if (!dueDate) {
      toast.error("La date d'échéance est requise");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/echeanciers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facture_id: factureId, amount, due_date: dueDate }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de création");
        return;
      }
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">Planifier une échéance</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Facture (validée ou payée)</label>
            <select
              value={factureId}
              onChange={(e) => setFactureId(e.target.value)}
              disabled={loadingOptions}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            >
              <option value="">
                {loadingOptions ? "Chargement..." : factures.length === 0 ? "Aucune facture éligible" : "Sélectionner une facture"}
              </option>
              {factures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.reference || f.id.slice(0, 8)} — {f.demandes?.nom_complet} ({formatMoney(f.amount, f.currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Montant de l&apos;échéance</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date d&apos;échéance</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-full bg-nexus-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-nexus-orange-600 disabled:opacity-50"
          >
            {saving ? "Création..." : "Planifier"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active ? "border-nexus-blue-950 bg-nexus-blue-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}
