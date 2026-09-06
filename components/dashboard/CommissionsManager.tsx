"use client";

// ============================================================================
// COMPOSANT — CommissionsManager
// P6, lot Commissions. Saisie manuelle (confirmé par Thierry le 06/09/2026,
// pas de calcul automatique) + cycle de vie calculee → validee → payee.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Banknote, CheckCircle2, Coins, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type CommissionStatus = "calculee" | "validee" | "payee";

export interface CommissionListItem {
  id: string;
  agent_id: string;
  demande_id: string | null;
  payment_id: string | null;
  amount: number;
  rate: number | null;
  status: CommissionStatus;
  validated_at: string | null;
  created_at: string;
  profiles: { nom: string; prenom: string | null } | null;
  demandes: { reference: string | null; service: string } | null;
}

interface AgentOption {
  id: string;
  nom: string;
  prenom: string | null;
}

interface DemandeOption {
  id: string;
  reference: string | null;
  nom_complet: string;
}

const STATUS_LABELS: Record<CommissionStatus, string> = {
  calculee: "Calculée",
  validee: "Validée",
  payee: "Payée",
};

const STATUS_COLORS: Record<CommissionStatus, string> = {
  calculee: "bg-slate-100 text-slate-700 border-slate-200",
  validee: "bg-blue-100 text-blue-700 border-blue-200",
  payee: "bg-green-100 text-green-700 border-green-200",
};

const STATUSES: CommissionStatus[] = ["calculee", "validee", "payee"];

function formatMoney(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} XAF`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function CommissionsManager({
  initialCommissions,
  canCreate,
}: {
  initialCommissions: CommissionListItem[];
  canCreate: boolean;
}) {
  const supabase = createClient();
  const [commissions, setCommissions] = useState<CommissionListItem[]>(initialCommissions);
  const [filter, setFilter] = useState<CommissionStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = commissions;
    if (filter !== "all") list = list.filter((c) => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.profiles?.nom || "").toLowerCase().includes(q) ||
          (c.demandes?.reference || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [commissions, filter, search]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: commissions.length };
    for (const s of STATUSES) base[s] = commissions.filter((c) => c.status === s).length;
    return base;
  }, [commissions]);

  const totalDu = useMemo(
    () => commissions.filter((c) => c.status !== "payee").reduce((sum, c) => sum + c.amount, 0),
    [commissions]
  );

  async function reload() {
    const res = await fetch("/api/commissions");
    const json = await res.json();
    if (json.success) setCommissions(json.commissions);
  }

  async function handleTransition(item: CommissionListItem, status: CommissionStatus) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/commissions/${item.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la transition");
        return;
      }
      toast.success(`Commission marquée "${STATUS_LABELS[status]}"`);
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total dû (calculée + validée)</p>
        <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">{formatMoney(totalDu)}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par agent, référence dossier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
          />
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Nouvelle commission
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label={`Toutes (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUSES.map((s) => (
          <FilterChip key={s} label={`${STATUS_LABELS[s]} (${counts[s] || 0})`} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Coins className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {commissions.length === 0 ? "Aucune commission enregistrée pour le moment." : "Aucune commission pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <CommissionCard
              key={c.id}
              item={c}
              busy={busyId === c.id}
              onValidate={() => handleTransition(c, "validee")}
              onMarkPaid={() => handleTransition(c, "payee")}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CommissionFormModal
          supabase={supabase}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await reload();
            toast.success("Commission créée");
          }}
        />
      )}
    </div>
  );
}

function CommissionCard({
  item,
  busy,
  onValidate,
  onMarkPaid,
}: {
  item: CommissionListItem;
  busy: boolean;
  onValidate: () => void;
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
              {item.demandes?.reference && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Dossier {item.demandes.reference}
                </span>
              )}
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-nexus-blue-950">
              {item.profiles ? `${item.profiles.prenom || ""} ${item.profiles.nom}` : "—"}
            </h3>
            {item.rate !== null && <p className="mt-1 text-sm text-slate-600">Taux : {item.rate}%</p>}
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">{formatMoney(item.amount)}</p>
            <p className="text-xs text-slate-500">Créée le {formatDate(item.created_at)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {item.status === "calculee" && (
            <button
              type="button"
              disabled={busy}
              onClick={onValidate}
              className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-blue-900 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valider
            </button>
          )}
          {item.status === "validee" && (
            <button
              type="button"
              disabled={busy}
              onClick={onMarkPaid}
              className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Banknote className="h-3.5 w-3.5" />
              Marquer payée
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommissionFormModal({
  supabase,
  onClose,
  onCreated,
}: {
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [demandes, setDemandes] = useState<DemandeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [agentId, setAgentId] = useState("");
  const [demandeId, setDemandeId] = useState("");
  const [amount, setAmount] = useState(0);
  const [rate, setRate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [agentsRes, demandesRes] = await Promise.all([
        supabase.from("profiles").select("id, nom, prenom").eq("role", "agent").order("nom"),
        supabase.from("demandes").select("id, reference, nom_complet").order("created_at", { ascending: false }).limit(200),
      ]);
      setAgents((agentsRes.data as AgentOption[]) || []);
      setDemandes((demandesRes.data as DemandeOption[]) || []);
      setLoadingOptions(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (!agentId) {
      toast.error("Sélectionne un agent");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Le montant doit être > 0");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          amount,
          rate: rate ? Number(rate) : null,
          demande_id: demandeId || null,
        }),
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
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">Nouvelle commission</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={loadingOptions}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            >
              <option value="">{loadingOptions ? "Chargement..." : "Sélectionner un agent"}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom || ""} {a.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dossier (optionnel)</label>
            <select
              value={demandeId}
              onChange={(e) => setDemandeId(e.target.value)}
              disabled={loadingOptions}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            >
              <option value="">Aucun</option>
              {demandes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.reference || d.id.slice(0, 8)} — {d.nom_complet}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Montant (XAF)</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Taux % (optionnel)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
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
            {saving ? "Création..." : "Créer"}
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
