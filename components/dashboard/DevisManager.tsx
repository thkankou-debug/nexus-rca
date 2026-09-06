"use client";

// ============================================================================
// COMPOSANT — DevisManager
// P6, lot Devis. CRUD + cycle de vie (brouillon → envoyé → accepté/refusé/
// expiré) + PDF. Toutes les mutations passent par /api/devis/* (permission,
// audit_log, email) — jamais d'écriture directe sur `devis`/`devis_lignes`
// depuis le client, contrairement à ExpensesManager (table sans les mêmes
// exigences d'audit).
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv-export";

type DevisStatus = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

export interface DevisListItem {
  id: string;
  reference: string | null;
  status: DevisStatus;
  amount: number;
  currency: string;
  valid_until: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
  demande_id: string | null;
  demandes: { reference: string | null; nom_complet: string; service: string; agent_id: string | null } | null;
}

interface DemandeOption {
  id: string;
  reference: string | null;
  nom_complet: string;
  service: string;
}

interface LigneDraft {
  description: string;
  quantity: number;
  unit_price: number;
}

const STATUS_LABELS: Record<DevisStatus, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

const STATUS_COLORS: Record<DevisStatus, string> = {
  brouillon: "bg-slate-100 text-slate-700 border-slate-200",
  envoye: "bg-blue-100 text-blue-700 border-blue-200",
  accepte: "bg-green-100 text-green-700 border-green-200",
  refuse: "bg-red-100 text-red-700 border-red-200",
  expire: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUSES: DevisStatus[] = ["brouillon", "envoye", "accepte", "refuse", "expire"];

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
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

export function DevisManager({ initialDevis }: { initialDevis: DevisListItem[] }) {
  const supabase = createClient();
  const [devis, setDevis] = useState<DevisListItem[]>(initialDevis);
  const [filter, setFilter] = useState<DevisStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = devis;
    if (filter !== "all") list = list.filter((d) => d.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          (d.reference || "").toLowerCase().includes(q) ||
          (d.demandes?.nom_complet || "").toLowerCase().includes(q) ||
          (d.demandes?.reference || "").toLowerCase().includes(q) ||
          (d.demandes?.service || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [devis, filter, search]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: devis.length };
    for (const s of STATUSES) base[s] = devis.filter((d) => d.status === s).length;
    return base;
  }, [devis]);

  async function reload() {
    const res = await fetch("/api/devis");
    const json = await res.json();
    if (json.success) setDevis(json.devis);
  }

  async function handleTransition(item: DevisListItem, status: DevisStatus) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/devis/${item.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la transition");
        return;
      }
      toast.success(`Devis marqué "${STATUS_LABELS[status]}"`);
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `Devis_${new Date().toISOString().split("T")[0]}.csv`,
                ["Reference", "Statut", "Client", "Service", "Dossier", "Montant", "Devise", "Cree le", "Valable jusqu'au"],
                filtered.map((d) => [
                  d.reference || "",
                  STATUS_LABELS[d.status],
                  d.demandes?.nom_complet || "",
                  d.demandes?.service || "",
                  d.demandes?.reference || "",
                  String(d.amount),
                  d.currency,
                  formatDate(d.created_at),
                  formatDate(d.valid_until),
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Nouveau devis
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label={`Tous (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
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
            {devis.length === 0 ? "Aucun devis créé pour le moment." : "Aucun devis pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DevisCard
              key={d.id}
              item={d}
              busy={busyId === d.id}
              onSend={() => handleTransition(d, "envoye")}
              onAccept={() => handleTransition(d, "accepte")}
              onRefuse={() => handleTransition(d, "refuse")}
              onExpire={() => handleTransition(d, "expire")}
            />
          ))}
        </div>
      )}

      {showForm && (
        <DevisFormModal
          supabase={supabase}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await reload();
            toast.success("Devis créé");
          }}
        />
      )}
    </div>
  );
}

function DevisCard({
  item,
  busy,
  onSend,
  onAccept,
  onRefuse,
  onExpire,
}: {
  item: DevisListItem;
  busy: boolean;
  onSend: () => void;
  onAccept: () => void;
  onRefuse: () => void;
  onExpire: () => void;
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
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
              {item.demandes?.nom_complet || "—"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{item.demandes?.service || "—"}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">
              {formatMoney(item.amount, item.currency)}
            </p>
            <p className="text-xs text-slate-500">Créé le {formatDate(item.created_at)}</p>
            {item.valid_until && <p className="text-xs text-slate-500">Valable jusqu&apos;au {formatDate(item.valid_until)}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <a
            href={`/api/devis/${item.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>

          {item.status === "brouillon" && (
            <button
              type="button"
              disabled={busy}
              onClick={onSend}
              className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-blue-900 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Envoyer au client
            </button>
          )}

          {item.status === "envoye" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onAccept}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Marquer accepté
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onRefuse}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Marquer refusé
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onExpire}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                <Clock className="h-3.5 w-3.5" />
                Marquer expiré
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DevisFormModal({
  supabase,
  onClose,
  onCreated,
}: {
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [demandes, setDemandes] = useState<DemandeOption[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const [demandeId, setDemandeId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [lignes, setLignes] = useState<LigneDraft[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("demandes")
        .select("id, reference, nom_complet, service")
        .order("created_at", { ascending: false })
        .limit(200);
      setDemandes((data as DemandeOption[]) || []);
      setLoadingDemandes(false);
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
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demande_id: demandeId, valid_until: validUntil || null, lignes }),
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
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">Nouveau devis</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dossier</label>
            <select
              value={demandeId}
              onChange={(e) => setDemandeId(e.target.value)}
              disabled={loadingDemandes}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            >
              <option value="">{loadingDemandes ? "Chargement..." : "Sélectionner un dossier"}</option>
              {demandes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.reference || d.id.slice(0, 8)} — {d.nom_complet} ({d.service})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Valable jusqu&apos;au (optionnel)
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
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
                    <button
                      type="button"
                      onClick={() => removeLigne(idx)}
                      className="rounded-full p-1.5 text-red-500 hover:bg-red-50"
                    >
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
            {saving ? "Création..." : "Créer le devis"}
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
