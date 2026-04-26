"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Save,
  Zap,
  Globe,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  StatusBadge,
  UrgenceBadge,
  STATUS_LABELS,
} from "@/components/dashboard/StatCard";
import { DemandeDocumentsList } from "@/components/dashboard/DemandeDocumentsList";
import { formatDate, cn } from "@/lib/utils";
import type { Demande, DemandeStatus } from "@/types";

const STATUSES: DemandeStatus[] = [
  "nouveau",
  "en_cours",
  "en_attente",
  "incomplet",
  "en_traitement",
  "complete",
  "annule",
];

export function DemandesManager({
  initialDemandes,
  canDelete = false,
}: {
  initialDemandes: Demande[];
  canDelete?: boolean;
}) {
  const supabase = createClient();
  const [demandes, setDemandes] = useState<Demande[]>(initialDemandes);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DemandeStatus | "all">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Demande | null>(null);

  const filtered =
    filter === "all" ? demandes : demandes.filter((d) => d.statut === filter);

  const updateStatus = async (id: string, statut: DemandeStatus) => {
    setSavingId(id);
    const { error } = await supabase
      .from("demandes")
      .update({ statut })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Erreur de mise a jour");
      return;
    }
    setDemandes((list) =>
      list.map((d) => (d.id === id ? { ...d, statut } : d))
    );
    toast.success("Statut mis a jour");
  };

  const saveNotes = async (id: string, notes: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("demandes")
      .update({ notes_internes: notes })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Erreur");
      return;
    }
    setDemandes((list) =>
      list.map((d) => (d.id === id ? { ...d, notes_internes: notes } : d))
    );
    toast.success("Note enregistree");
  };

  const deleteDemande = async (demande: Demande) => {
    setSavingId(demande.id);
    const { error } = await supabase
      .from("demandes")
      .delete()
      .eq("id", demande.id);
    setSavingId(null);
    setConfirmDelete(null);

    if (error) {
      toast.error(`Suppression refusee : ${error.message}`);
      return;
    }
    setDemandes((list) => list.filter((d) => d.id !== demande.id));
    toast.success("Demande supprimee");
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Toutes ({demandes.length})
        </FilterChip>
        {STATUSES.map((s) => {
          const count = demandes.filter((d) => d.statut === s).length;
          return (
            <FilterChip
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABELS[s]} ({count})
            </FilterChip>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Aucune demande dans cette categorie.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const expanded = expandedId === d.id;
            return (
              <div
                key={d.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
              >
                <div className="flex items-start justify-between gap-2 p-5">
                  <button
                    onClick={() => setExpandedId(expanded ? null : d.id)}
                    className="flex flex-1 items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-nexus-blue-950">
                          {d.service}
                        </h3>
                        <StatusBadge status={d.statut} />
                        <UrgenceBadge level={d.urgence} />
                        {d.traitement_prioritaire && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-2 py-0.5 text-xs font-semibold text-white">
                            <Zap className="h-3 w-3" />
                            Prioritaire
                          </span>
                        )}
                        {d.source === "nexus_ia" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                            🤖 Nexus IA
                          </span>
                        )}
                      </div>
                      {d.objet && (
                        <p className="mt-1 truncate text-sm font-medium text-nexus-blue-900">
                          {d.objet}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-slate-600">
                        {d.nom_complet} · {d.email}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Recue le {formatDate(d.created_at)}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-slate-400 transition",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Bouton supprimer toujours visible si canDelete */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(d)}
                      disabled={savingId === d.id}
                      className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      aria-label="Supprimer cette demande"
                      title="Supprimer cette demande"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-5">
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <InfoRow icon={Mail} label="Email" value={d.email} />
                      <InfoRow
                        icon={Phone}
                        label="Telephone"
                        value={d.telephone}
                      />
                      <InfoRow
                        icon={MapPin}
                        label="Localisation"
                        value={d.ville ? `${d.ville}, ${d.pays}` : d.pays}
                      />
                    </div>

                    {/* Champs etendus */}
                    {(d.objet ||
                      d.date_souhaitee ||
                      d.pays_concerne ||
                      d.destination ||
                      d.budget_estimatif ||
                      d.langue_preferee) && (
                      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm sm:grid-cols-2">
                        {d.objet && (
                          <InfoRow icon={Mail} label="Objet" value={d.objet} />
                        )}
                        {d.date_souhaitee && (
                          <InfoRow
                            icon={Mail}
                            label="Date souhaitee"
                            value={d.date_souhaitee}
                          />
                        )}
                        {d.pays_concerne && (
                          <InfoRow
                            icon={Globe}
                            label="Pays concerne"
                            value={d.pays_concerne}
                          />
                        )}
                        {d.destination && (
                          <InfoRow
                            icon={Globe}
                            label="Destination"
                            value={d.destination}
                          />
                        )}
                        {d.budget_estimatif && (
                          <InfoRow
                            icon={Mail}
                            label="Budget"
                            value={d.budget_estimatif}
                          />
                        )}
                        {d.langue_preferee && (
                          <InfoRow
                            icon={Globe}
                            label="Langue"
                            value={d.langue_preferee}
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Description du besoin
                      </p>
                      <p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        {d.description}
                      </p>
                    </div>

                    {/* Details dynamiques (JSONB) */}
                    {d.details_service &&
                      Object.keys(d.details_service).length > 0 && (
                        <div className="mt-4">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Details specifiques au service
                          </p>
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                              {Object.entries(d.details_service).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex flex-col border-b border-slate-100 pb-1 last:border-0"
                                  >
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      {key.replace(/_/g, " ")}
                                    </dt>
                                    <dd className="text-sm text-slate-700">
                                      {typeof value === "boolean"
                                        ? value
                                          ? "Oui"
                                          : "Non"
                                        : Array.isArray(value)
                                        ? value.join(", ")
                                        : String(value)}
                                    </dd>
                                  </div>
                                )
                              )}
                            </dl>
                          </div>
                        </div>
                      )}

                    {/* Documents joints */}
                    <div className="mt-4">
                      <DemandeDocumentsList demandeId={d.id} />
                    </div>

                    {/* Status update */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Statut
                        </label>
                        <select
                          value={d.statut}
                          onChange={(e) =>
                            updateStatus(d.id, e.target.value as DemandeStatus)
                          }
                          disabled={savingId === d.id}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Internal notes */}
                    <div className="mt-4">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Notes internes
                      </label>
                      <NotesEditor
                        initial={d.notes_internes || ""}
                        onSave={(val) => saveNotes(d.id, val)}
                        saving={savingId === d.id}
                      />
                    </div>

                    {canDelete && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setConfirmDelete(d)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer la demande
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation */}
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
                  Supprimer cette demande ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Demande de{" "}
                  <strong className="text-nexus-blue-950">
                    {confirmDelete.nom_complet}
                  </strong>{" "}
                  pour le service{" "}
                  <strong className="text-nexus-blue-950">
                    {confirmDelete.service}
                  </strong>
                  .
                </p>
                <p className="mt-2 text-xs text-red-600">
                  Cette action est irreversible. Tous les details et documents
                  seront perdus.
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
                onClick={() => deleteDemande(confirmDelete)}
                disabled={savingId === confirmDelete.id}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingId === confirmDelete.id
                  ? "Suppression..."
                  : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-nexus-blue-950 bg-nexus-blue-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {children}
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function NotesEditor({
  initial,
  onSave,
  saving,
}: {
  initial: string;
  onSave: (val: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Notes pour l equipe (non visibles par le client)"
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => onSave(value)}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
