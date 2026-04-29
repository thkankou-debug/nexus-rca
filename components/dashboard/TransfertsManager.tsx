"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  TransfertForm,
  type Transfert,
  type TransfertStatut,
  type TransfertMode,
} from "./TransfertForm";

const STATUT_LABELS: Record<TransfertStatut, string> = {
  en_attente: "En attente",
  valide: "Validé",
  rejete: "Rejeté",
  effectue: "Effectué",
  annule: "Annulé",
};

const STATUT_COLORS: Record<TransfertStatut, string> = {
  en_attente: "bg-amber-100 text-amber-700 border-amber-200",
  valide: "bg-blue-100 text-blue-700 border-blue-200",
  rejete: "bg-red-100 text-red-700 border-red-200",
  effectue: "bg-green-100 text-green-700 border-green-200",
  annule: "bg-slate-100 text-slate-500 border-slate-200",
};

const MODE_LABELS: Record<TransfertMode, string> = {
  western_union: "Western Union",
  moneygram: "MoneyGram",
  mobile_money: "Mobile Money",
  virement_bancaire: "Virement",
  ria: "Ria",
  wise: "Wise",
  autre: "Autre",
};

const STATUTS: TransfertStatut[] = [
  "en_attente",
  "valide",
  "effectue",
  "rejete",
  "annule",
];

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
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

interface ValidatorAction {
  validate: (transfert: Transfert) => Promise<void>;
  reject: (transfert: Transfert, motif: string) => Promise<void>;
  markEffectue: (transfert: Transfert) => Promise<void>;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function TransfertsManager({
  initialTransferts,
  currentUserId,
  canValidate = false,
}: {
  initialTransferts: Transfert[];
  currentUserId: string;
  canValidate?: boolean;
}) {
  const supabase = createClient();
  const [transferts, setTransferts] = useState<Transfert[]>(initialTransferts);
  const [filter, setFilter] = useState<TransfertStatut | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rejectingId, setRejectingId] = useState<Transfert | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");

  const stats = useMemo(() => {
    return {
      total: transferts.reduce(
        (sum, t) => sum + Number(t.montant_envoye),
        0
      ),
      enAttente: transferts.filter((t) => t.statut === "en_attente").length,
      effectues: transferts.filter((t) => t.statut === "effectue").length,
    };
  }, [transferts]);

  const filtered = useMemo(() => {
    let list = transferts;
    if (filter !== "all") list = list.filter((t) => t.statut === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.expediteur_nom.toLowerCase().includes(q) ||
          t.beneficiaire_nom.toLowerCase().includes(q) ||
          t.beneficiaire_pays.toLowerCase().includes(q) ||
          (t.reference || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [transferts, filter, search]);

  const counts = useMemo(() => {
    return {
      all: transferts.length,
      en_attente: transferts.filter((t) => t.statut === "en_attente").length,
      valide: transferts.filter((t) => t.statut === "valide").length,
      effectue: transferts.filter((t) => t.statut === "effectue").length,
      rejete: transferts.filter((t) => t.statut === "rejete").length,
      annule: transferts.filter((t) => t.statut === "annule").length,
    };
  }, [transferts]);

  const handleSaved = (saved: Transfert) => {
    setTransferts((list) => [saved, ...list]);
    setShowForm(false);
  };

  const handleValidate = async (t: Transfert) => {
    const { data, error } = await supabase
      .from("transferts")
      .update({
        statut: "valide",
        validated_by: currentUserId,
        validated_at: new Date().toISOString(),
      })
      .eq("id", t.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    setTransferts((list) =>
      list.map((x) => (x.id === t.id ? (data as Transfert) : x))
    );
    toast.success("Transfert validé. L'agent peut procéder à l'envoi.");
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    if (!rejectMotif.trim()) {
      toast.error("Le motif de rejet est obligatoire");
      return;
    }
    const { data, error } = await supabase
      .from("transferts")
      .update({
        statut: "rejete",
        motif_rejet: rejectMotif.trim(),
        validated_by: currentUserId,
        validated_at: new Date().toISOString(),
      })
      .eq("id", rejectingId.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    setTransferts((list) =>
      list.map((x) => (x.id === rejectingId.id ? (data as Transfert) : x))
    );
    setRejectingId(null);
    setRejectMotif("");
    toast.success("Transfert rejeté");
  };

  const handleMarkEffectue = async (t: Transfert) => {
    const { data, error } = await supabase
      .from("transferts")
      .update({
        statut: "effectue",
        effectue_at: new Date().toISOString(),
      })
      .eq("id", t.id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    setTransferts((list) =>
      list.map((x) => (x.id === t.id ? (data as Transfert) : x))
    );
    toast.success("Transfert marqué comme effectué");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatBlock
          icon={Send}
          label="Total transféré"
          value={formatMoney(stats.total)}
          accent="blue"
        />
        <StatBlock
          icon={Clock}
          label="En attente de validation"
          value={stats.enAttente.toString()}
          accent="orange"
        />
        <StatBlock
          icon={CheckCircle2}
          label="Effectués"
          value={stats.effectues.toString()}
          accent="green"
        />
      </div>

      {/* Barre actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par expéditeur, bénéficiaire, pays..."
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
          Nouveau transfert
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={`Tous (${counts.all})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {STATUTS.map((s) => (
          <FilterChip
            key={s}
            label={`${STATUT_LABELS[s]} (${counts[s]})`}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Send className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">
            {transferts.length === 0
              ? "Aucun transfert enregistré pour le moment."
              : "Aucun transfert pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TransfertCard
              key={t.id}
              transfert={t}
              canValidate={canValidate}
              onValidate={() => handleValidate(t)}
              onReject={() => {
                setRejectingId(t);
                setRejectMotif("");
              }}
              onMarkEffectue={() => handleMarkEffectue(t)}
            />
          ))}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <TransfertForm
          currentUserId={currentUserId}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Modal rejet */}
      {rejectingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRejectingId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Rejeter ce transfert ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Transfert de{" "}
                  <strong>{rejectingId.expediteur_nom}</strong> vers{" "}
                  <strong>{rejectingId.beneficiaire_nom}</strong>
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Motif du rejet *
              </label>
              <textarea
                rows={3}
                value={rejectMotif}
                onChange={(e) => setRejectMotif(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                placeholder="Expliquer pourquoi ce transfert est rejeté..."
              />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
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
    </div>
  );
}

// ============================================================================
// CARTE TRANSFERT
// ============================================================================
function TransfertCard({
  transfert,
  canValidate,
  onValidate,
  onReject,
  onMarkEffectue,
}: {
  transfert: Transfert;
  canValidate: boolean;
  onValidate: () => void;
  onReject: () => void;
  onMarkEffectue: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const total =
    Number(transfert.montant_envoye) + Number(transfert.frais_transfert);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-nexus-blue-700">
                {transfert.reference || "—"}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  STATUT_COLORS[transfert.statut]
                )}
              >
                {STATUT_LABELS[transfert.statut]}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                {MODE_LABELS[transfert.mode_transfert]}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="font-semibold text-nexus-blue-950">
                {transfert.expediteur_nom}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-nexus-blue-950">
                {transfert.beneficiaire_nom}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {transfert.beneficiaire_pays}
                {transfert.beneficiaire_ville
                  ? ` · ${transfert.beneficiaire_ville}`
                  : ""}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(transfert.created_at)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-display text-xl font-bold text-nexus-blue-950">
              {formatMoney(
                Number(transfert.montant_envoye),
                transfert.devise
              )}
            </p>
            {Number(transfert.frais_transfert) > 0 && (
              <p className="text-xs text-slate-500">
                + {formatMoney(Number(transfert.frais_transfert), transfert.devise)}{" "}
                de frais
              </p>
            )}
            <p className="text-xs font-semibold text-nexus-orange-600">
              Total : {formatMoney(total, transfert.devise)}
            </p>
          </div>
        </div>

        {/* Motif rejet */}
        {transfert.statut === "rejete" && transfert.motif_rejet && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Motif du rejet</p>
              <p className="mt-0.5 text-red-700">{transfert.motif_rejet}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            {expanded ? "Masquer" : "Détails"}
          </button>

          {canValidate && transfert.statut === "en_attente" && (
            <>
              <button
                type="button"
                onClick={onValidate}
                className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Valider
              </button>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <XCircle className="h-3.5 w-3.5" />
                Rejeter
              </button>
            </>
          )}

          {canValidate && transfert.statut === "valide" && (
            <button
              type="button"
              onClick={onMarkEffectue}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Send className="h-3.5 w-3.5" />
              Marquer comme effectué
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <DetailField
              label="Expéditeur"
              value={transfert.expediteur_nom}
            />
            {transfert.expediteur_telephone && (
              <DetailField
                label="Tél. expéditeur"
                value={transfert.expediteur_telephone}
              />
            )}
            {transfert.expediteur_piece_identite && (
              <DetailField
                label="Pièce d'identité"
                value={transfert.expediteur_piece_identite}
              />
            )}
            <DetailField
              label="Bénéficiaire"
              value={transfert.beneficiaire_nom}
            />
            {transfert.beneficiaire_telephone && (
              <DetailField
                label="Tél. bénéficiaire"
                value={transfert.beneficiaire_telephone}
              />
            )}
            <DetailField
              label="Destination"
              value={
                transfert.beneficiaire_ville
                  ? `${transfert.beneficiaire_ville}, ${transfert.beneficiaire_pays}`
                  : transfert.beneficiaire_pays
              }
            />
            {transfert.numero_reference_externe && (
              <DetailField
                label="N° de référence externe"
                value={transfert.numero_reference_externe}
              />
            )}
            {transfert.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-line text-slate-700">
                  {transfert.notes}
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}
