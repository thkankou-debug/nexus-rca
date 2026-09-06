"use client";

// ============================================================================
// COMPOSANT — TemoignagesManager
// P8, lot Témoignages. Un témoignage se crée en brouillon (ni vérifié ni
// publié), doit être explicitement vérifié par un humain, puis publié —
// jamais l'inverse (règle P8 : rien ne s'affiche sans avoir été vérifié).
// Toute modification de contenu remet is_verified à false (trigger DB).
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, ShieldCheck, Eye, EyeOff, Edit3, Trash2, X, Star, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TemoignageItem {
  id: string;
  auteur_nom: string;
  auteur_role: string | null;
  contenu: string;
  note: number | null;
  source: string | null;
  is_verified: boolean;
  is_published: boolean;
}

export function TemoignagesManager({ initialTemoignages }: { initialTemoignages: TemoignageItem[] }) {
  const [items, setItems] = useState<TemoignageItem[]>(initialTemoignages);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TemoignageItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TemoignageItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/temoignages");
    const json = await res.json();
    if (json.success) setItems(json.temoignages);
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/temoignages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  async function handleDelete(item: TemoignageItem) {
    const res = await fetch(`/api/temoignages/${item.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Témoignage supprimé");
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
          Nouveau témoignage
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucun témoignage pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-nexus-blue-950">{t.auteur_nom}</span>
                    {t.auteur_role && <span className="text-sm text-slate-500">— {t.auteur_role}</span>}
                    {t.note && (
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: t.note }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        t.is_verified ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {t.is_verified ? "Vérifié" : "Non vérifié"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        t.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {t.is_published ? "Publié" : "Non publié"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm italic text-slate-600">&laquo; {t.contenu} &raquo;</p>
                  {t.source && <p className="mt-1 text-xs text-slate-400">Source : {t.source}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  {!t.is_verified && (
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => patch(t.id, { is_verified: true })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Vérifier
                    </button>
                  )}
                  {t.is_verified && !t.is_published && (
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => patch(t.id, { is_published: true })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Publier
                    </button>
                  )}
                  {t.is_published && (
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => patch(t.id, { is_published: false })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Dépublier
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(t)}
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
        <TemoignageFormModal
          temoignage={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Témoignage mis à jour" : "Témoignage créé");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer ce témoignage ?</h3>
            <p className="mt-2 text-sm text-slate-600">{confirmDelete.auteur_nom}</p>
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

function TemoignageFormModal({
  temoignage,
  onClose,
  onSaved,
}: {
  temoignage: TemoignageItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [auteurNom, setAuteurNom] = useState(temoignage?.auteur_nom || "");
  const [auteurRole, setAuteurRole] = useState(temoignage?.auteur_role || "");
  const [contenu, setContenu] = useState(temoignage?.contenu || "");
  const [note, setNote] = useState(temoignage?.note || 5);
  const [source, setSource] = useState(temoignage?.source || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!auteurNom.trim() || !contenu.trim()) {
      toast.error("Nom de l'auteur et contenu requis");
      return;
    }
    setSaving(true);
    try {
      const url = temoignage ? `/api/temoignages/${temoignage.id}` : "/api/temoignages";
      const method = temoignage ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auteur_nom: auteurNom.trim(),
          auteur_role: auteurRole.trim() || null,
          contenu: contenu.trim(),
          note,
          source: source.trim() || null,
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
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">
            {temoignage ? "Modifier le témoignage" : "Nouveau témoignage"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {temoignage && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Modifier le contenu remettra ce témoignage au statut &laquo; non vérifié &raquo;.
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nom de l&apos;auteur</label>
              <input
                type="text"
                value={auteurNom}
                onChange={(e) => setAuteurNom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rôle (optionnel)</label>
              <input
                type="text"
                value={auteurRole}
                onChange={(e) => setAuteurRole(e.target.value)}
                placeholder="ex: Client visa Canada"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Témoignage</label>
            <textarea
              rows={4}
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Note (1 à 5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={note}
                onChange={(e) => setNote(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Source (optionnel)</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="ex: WhatsApp, Google avis"
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
