"use client";

// ============================================================================
// COMPOSANT — FacturesManager
// P6, lot Factures. Même patron que DevisManager.tsx : CRUD + cycle de vie
// (brouillon → validée → payée, annulée depuis brouillon/validée) + PDF.
// Toutes les mutations passent par /api/factures/* (permission, audit_log,
// email).
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Banknote,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type FactureStatus = "brouillon" | "validee" | "payee" | "annulee";

export interface FactureListItem {
  id: string;
  reference: string | null;
  status: FactureStatus;
  amount: number;
  currency: string;
  due_date: string | null;
  validated_at: string | null;
  created_at: string;
  demande_id: string | null;
  devis_id: string | null;
  demandes: { reference: string | null; nom_complet: string; service: string; agent_id: string | null } | null;
}

interface DemandeOption {
  id: string;
  reference: string | null;
  nom_complet: string;
  service: string;
}

interface DevisOption {
  id: string;
  reference: string | null;
  amount: number;
  currency: string;
  demandes: { nom_complet: string; service: string } | null;
}

interface LigneDraft {
  description: string;
  quantity: number;
  unit_price: number;
}

const STATUS_LABELS: Record<FactureStatus, string> = {
  brouillon: "Brouillon",
  validee: "Validée",
  payee: "Payée",
  annulee: "Annulée",
};

const STATUS_COLORS: Record<FactureStatus, string> = {
  brouillon: "bg-slate-100 text-slate-700 border-slate-200",
  validee: "bg-blue-100 text-blue-700 border-blue-200",
  payee: "bg-green-100 text-green-700 border-green-200",
  annulee: "bg-red-100 text-red-700 border-red-200",
};

const STATUSES: FactureStatus[] = ["brouillon", "validee", "payee", "annulee"];

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

export function FacturesManager({ initialFactures }: { initialFactures: FactureListItem[] }) {
  const supabase = createClient();
  const [factures, setFactures] = useState<FactureListItem[]>(initialFactures);
  const [filter, setFilter] = useState<FactureStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = factures;
    if (filter !== "all") list = list.filter((f) => f.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          (f.reference || "").toLowerCase().includes(q) ||
          (f.demandes?.nom_complet || "").toLowerCase().includes(q) ||
          (f.demandes?.reference || "").toLowerCase().includes(q) ||
          (f.demandes?.service || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [factures, filter, search]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: factures.length };
    for (const s of STATUSES) base[s] = factures.filter((f) => f.status === s).length;
    return base;
  }, [factures]);

  async function reload() {
    const res = await fetch("/api/factures");
    const json = await res.json();
    if (json.success) setFactures(json.factures);
  }

  async function handleTransition(item: FactureListItem, status: FactureStatus) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/factures/${item.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la transition");
        return;
      }
      toast.success(`Facture marquée "${STATUS_LABELS[status]}"`);
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par référence, client, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label={`Toutes (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={`${STATUS_LABELS[s]} (${counts[s] || 0})`}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {factures.length === 0 ? "Aucune facture créée pour le moment." : "Aucune facture pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <FactureCard
              key={f.id}
              item={f}
              busy={busyId === f.id}
              onValidate={() => handleTransition(f, "validee")}
              onMarkPaid={() => handleTransition(f, "payee")}
              onCancel={() => handleTransition(f, "annulee")}
            />
          ))}
        </div>
      )}

      {showForm && (
        <FactureFormModal
          supabase={supabase}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await reload();
            toast.success("Facture créée");
          }}
        />
      )}
    </div>
  );
}

function FactureCard({
  item,
  busy,
  onValidate,
  onMarkPaid,
  onCancel,
}: {
  item: FactureListItem;
  busy: boolean;
  onValidate: () => void;
  onMarkPaid: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-nexus-blue-700">{item.reference || "—"}</span>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_COLORS[item.status])}>
                {STATUS_LABELS[item.status]}
              </span>
              {item.demandes?.reference && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Dossier {item.demandes.reference}
                </span>
              )}
              {item.devis_id && (
                <span className="rounded-full bg-nexus-blue-50 px-2.5 py-0.5 text-xs font-semibold text-nexus-blue-700">
                  Depuis devis
                </span>
              )}
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">{item.demandes?.nom_complet || "—"}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.demandes?.service || "—"}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">{formatMoney(item.amount, item.currency)}</p>
            <p className="text-xs text-slate-500">Créée le {formatDate(item.created_at)}</p>
            {item.due_date && <p className="text-xs text-slate-500">Échéance {formatDate(item.due_date)}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <a
            href={`/api/factures/${item.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>

          {item.status === "brouillon" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onValidate}
                className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-blue-900 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Valider
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Annuler
              </button>
            </>
          )}

          {item.status === "validee" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onMarkPaid}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Banknote className="h-3.5 w-3.5" />
                Marquer payée
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FactureFormModal({
  supabase,
  onClose,
  onCreated,
}: {
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<"manuel" | "devis">("manuel");
  const [demandes, setDemandes] = useState<DemandeOption[]>([]);
  const [devisAcceptes, setDevisAcceptes] = useState<DevisOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [demandeId, setDemandeId] = useState("");
  const [devisId, setDevisId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lignes, setLignes] = useState<LigneDraft[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [demandesRes, devisRes] = await Promise.all([
        supabase.from("demandes").select("id, reference, nom_complet, service").order("created_at", { ascending: false }).limit(200),
        supabase
          .from("devis")
          .select("id, reference, amount, currency, demandes(nom_complet, service)")
          .eq("status", "accepte")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      setDemandes((demandesRes.data as DemandeOption[]) || []);
      setDevisAcceptes((devisRes.data as unknown as DevisOption[]) || []);
      setLoadingOptions(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = lignes.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

  function updateLigne(idx: number, patch: Partial<LigneDraft>) {
    setLignes((list) => list.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLigne() {
    setLignes((list) => [...list, { description: "", quantity: 1, unit_price: 0 }]);
  }
  function removeLigne(idx: number) {
    setLignes((list) => list.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (mode === "devis") {
      if (!devisId) {
        toast.error("Sélectionne un devis accepté");
        return;
      }
      setSaving(true);
      try {
        const res = await fetch("/api/factures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devis_id: devisId, due_date: dueDate || null }),
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.error || "Échec de la création");
          return;
        }
        onCreated();
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!demandeId) {
      toast.error("Sélectionne un dossier");
      return;
    }
    if (lignes.some((l) => !l.description.trim() || l.quantity <= 0)) {
      toast.error("Chaque ligne doit avoir une description et une quantité > 0");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demande_id: demandeId, due_date: dueDate || null, lignes }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la création");
        return;
      }
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">Nouvelle facture</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("manuel")}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
              mode === "manuel" ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700" : "border-slate-200 text-slate-600"
            )}
          >
            Facture manuelle
          </button>
          <button
            type="button"
            onClick={() => setMode("devis")}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
              mode === "devis" ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700" : "border-slate-200 text-slate-600"
            )}
          >
            Générer depuis un devis accepté
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {mode === "devis" ? (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Devis accepté</label>
              <select
                value={devisId}
                onChange={(e) => setDevisId(e.target.value)}
                disabled={loadingOptions}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              >
                <option value="">
                  {loadingOptions ? "Chargement..." : devisAcceptes.length === 0 ? "Aucun devis accepté" : "Sélectionner un devis"}
                </option>
                {devisAcceptes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.reference || d.id.slice(0, 8)} — {d.demandes?.nom_complet} ({formatMoney(d.amount, d.currency)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dossier</label>
                <select
                  value={demandeId}
                  onChange={(e) => setDemandeId(e.target.value)}
                  disabled={loadingOptions}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                >
                  <option value="">{loadingOptions ? "Chargement..." : "Sélectionner un dossier"}</option>
                  {demandes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.reference || d.id.slice(0, 8)} — {d.nom_complet} ({d.service})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prestations</label>
                  <button type="button" onClick={addLigne} className="text-xs font-semibold text-nexus-orange-600 hover:underline">
                    + Ajouter une ligne
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {lignes.map((ligne, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={ligne.description}
                        onChange={(e) => updateLigne(idx, { description: e.target.value })}
                        className="min-w-[180px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Qté"
                        value={ligne.quantity}
                        onChange={(e) => updateLigne(idx, { quantity: Number(e.target.value) })}
                        className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Prix unitaire"
                        value={ligne.unit_price}
                        onChange={(e) => updateLigne(idx, { unit_price: Number(e.target.value) })}
                        className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                      />
                      {lignes.length > 1 && (
                        <button type="button" onClick={() => removeLigne(idx)} className="rounded-full p-1.5 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <span className="font-display text-lg font-bold text-nexus-blue-950">{formatMoney(total)}</span>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Échéance (optionnel)</label>
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
            {saving ? "Création..." : "Créer la facture"}
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
