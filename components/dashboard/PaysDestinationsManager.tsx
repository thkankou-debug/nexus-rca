"use client";

// ============================================================================
// COMPOSANT — PaysDestinationsManager
// P8, lot Pays & destinations.
// ============================================================================

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Power, Edit3, Trash2, X, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PaysStatus = "actif" | "inactif";

export interface PaysDestinationItem {
  id: string;
  nom: string;
  code_iso: string | null;
  continent: string | null;
  status: PaysStatus;
  ordre_affichage: number;
}

export function PaysDestinationsManager({ initialPays }: { initialPays: PaysDestinationItem[] }) {
  const [items, setItems] = useState<PaysDestinationItem[]>(initialPays);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PaysDestinationItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PaysDestinationItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const parContinent = useMemo(() => {
    const map = new Map<string, PaysDestinationItem[]>();
    for (const p of items) {
      const cont = p.continent || "Sans continent";
      const list = map.get(cont) || [];
      list.push(p);
      map.set(cont, list);
    }
    return Array.from(map.entries());
  }, [items]);

  async function reload() {
    const res = await fetch("/api/pays-destinations");
    const json = await res.json();
    if (json.success) setItems(json.pays);
  }

  async function toggleStatus(p: PaysDestinationItem) {
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/pays-destinations/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: p.status === "actif" ? "inactif" : "actif" }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec");
        return;
      }
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(p: PaysDestinationItem) {
    const res = await fetch(`/api/pays-destinations/${p.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Pays supprimé");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouveau pays
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Globe2 className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucun pays de destination pour le moment.</p>
        </div>
      ) : (
        parContinent.map(([continent, list]) => (
          <div key={continent}>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">{continent}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-4 pr-2"
                >
                  <span className="text-sm font-semibold text-nexus-blue-950">{p.nom}</span>
                  {p.code_iso && <span className="font-mono text-xs text-slate-400">{p.code_iso}</span>}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      p.status === "actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {p.status === "actif" ? "Actif" : "Inactif"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Modifier"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => toggleStatus(p)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    title={p.status === "actif" ? "Désactiver" : "Activer"}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(p)}
                    className="rounded-full p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {(showForm || editing) && (
        <PaysFormModal
          pays={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Pays mis à jour" : "Pays créé");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer ce pays ?</h3>
            <p className="mt-2 text-sm text-slate-600">{confirmDelete.nom}</p>
            <p className="mt-2 text-xs text-red-600">Action irréversible.</p>
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

function PaysFormModal({
  pays,
  onClose,
  onSaved,
}: {
  pays: PaysDestinationItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nom, setNom] = useState(pays?.nom || "");
  const [codeIso, setCodeIso] = useState(pays?.code_iso || "");
  const [continent, setContinent] = useState(pays?.continent || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      const url = pays ? `/api/pays-destinations/${pays.id}` : "/api/pays-destinations";
      const method = pays ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), code_iso: codeIso.trim() || null, continent: continent.trim() || null }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec");
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">{pays ? "Modifier le pays" : "Nouveau pays"}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: Canada"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Code ISO (optionnel)</label>
              <input
                type="text"
                value={codeIso}
                onChange={(e) => setCodeIso(e.target.value)}
                placeholder="CA"
                maxLength={3}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm uppercase focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Continent (optionnel)</label>
              <input
                type="text"
                value={continent}
                onChange={(e) => setContinent(e.target.value)}
                placeholder="Amérique du Nord"
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
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
