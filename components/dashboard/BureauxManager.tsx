"use client";

// ============================================================================
// COMPOSANT — BureauxManager
// P8, lot Bureaux.
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Power, Edit3, Trash2, X, Building2, Phone, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type BureauStatus = "actif" | "inactif";

export interface BureauItem {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string | null;
  email: string | null;
  horaires: string | null;
  status: BureauStatus;
}

export function BureauxManager({ initialBureaux }: { initialBureaux: BureauItem[] }) {
  const [items, setItems] = useState<BureauItem[]>(initialBureaux);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BureauItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BureauItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/bureaux");
    const json = await res.json();
    if (json.success) setItems(json.bureaux);
  }

  async function toggleStatus(b: BureauItem) {
    setBusyId(b.id);
    try {
      const res = await fetch(`/api/bureaux/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: b.status === "actif" ? "inactif" : "actif" }),
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

  async function handleDelete(b: BureauItem) {
    const res = await fetch(`/api/bureaux/${b.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Bureau supprimé");
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
          Nouveau bureau
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucun bureau pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-nexus-blue-950">{b.nom}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        b.status === "actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {b.status === "actif" ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {b.adresse}, {b.ville}, {b.pays}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {b.telephone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {b.telephone}
                      </span>
                    )}
                    {b.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {b.email}
                      </span>
                    )}
                    {b.horaires && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {b.horaires}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(b)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    onClick={() => toggleStatus(b)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
                      b.status === "actif" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-green-600 text-white hover:bg-green-700"
                    )}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {b.status === "actif" ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(b)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <BureauFormModal
          bureau={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Bureau mis à jour" : "Bureau créé");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer ce bureau ?</h3>
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

function BureauFormModal({
  bureau,
  onClose,
  onSaved,
}: {
  bureau: BureauItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nom, setNom] = useState(bureau?.nom || "");
  const [adresse, setAdresse] = useState(bureau?.adresse || "");
  const [ville, setVille] = useState(bureau?.ville || "");
  const [pays, setPays] = useState(bureau?.pays || "");
  const [telephone, setTelephone] = useState(bureau?.telephone || "");
  const [email, setEmail] = useState(bureau?.email || "");
  const [horaires, setHoraires] = useState(bureau?.horaires || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!nom.trim() || !adresse.trim() || !ville.trim() || !pays.trim()) {
      toast.error("Nom, adresse, ville et pays sont requis");
      return;
    }
    setSaving(true);
    try {
      const url = bureau ? `/api/bureaux/${bureau.id}` : "/api/bureaux";
      const method = bureau ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          adresse: adresse.trim(),
          ville: ville.trim(),
          pays: pays.trim(),
          telephone: telephone.trim() || null,
          email: email.trim() || null,
          horaires: horaires.trim() || null,
        }),
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
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">{bureau ? "Modifier le bureau" : "Nouveau bureau"}</h3>
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
              placeholder="ex: Siège social — Bangui"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adresse</label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ville</label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pays</label>
              <input
                type="text"
                value={pays}
                onChange={(e) => setPays(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Téléphone (optionnel)</label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email (optionnel)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Horaires (optionnel)</label>
            <input
              type="text"
              value={horaires}
              onChange={(e) => setHoraires(e.target.value)}
              placeholder="ex: Sur rendez-vous uniquement"
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
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
