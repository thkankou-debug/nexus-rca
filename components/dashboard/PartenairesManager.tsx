"use client";

// ============================================================================
// COMPOSANT — PartenairesManager
// P8, lot Partenaires. Un partenaire se crée en brouillon (ni vérifié ni
// publié), doit être explicitement vérifié par un humain, puis publié —
// règle P8 "aucun faux partenaire, aucun logo non autorisé".
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, ShieldCheck, Eye, EyeOff, Edit3, Trash2, X, Handshake, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PartenaireItem {
  id: string;
  nom: string;
  logo_url: string | null;
  site_url: string | null;
  description: string | null;
  is_verified: boolean;
  is_published: boolean;
  ordre_affichage: number;
}

export function PartenairesManager({ initialPartenaires }: { initialPartenaires: PartenaireItem[] }) {
  const [items, setItems] = useState<PartenaireItem[]>(initialPartenaires);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PartenaireItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PartenaireItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/partenaires");
    const json = await res.json();
    if (json.success) setItems(json.partenaires);
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/partenaires/${id}`, {
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

  async function handleDelete(item: PartenaireItem) {
    const res = await fetch(`/api/partenaires/${item.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Partenaire supprimé");
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
          Nouveau partenaire
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Handshake className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucun partenaire pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-nexus-blue-950">{p.nom}</span>
                    {p.site_url && (
                      <a
                        href={p.site_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-nexus-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Site
                      </a>
                    )}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        p.is_verified ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {p.is_verified ? "Vérifié" : "Non vérifié"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        p.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {p.is_published ? "Publié" : "Non publié"}
                    </span>
                  </div>
                  {p.description && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}
                  {p.logo_url && <p className="mt-1 truncate text-xs text-slate-400">Logo : {p.logo_url}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  {!p.is_verified && (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => patch(p.id, { is_verified: true })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Vérifier
                    </button>
                  )}
                  {p.is_verified && !p.is_published && (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => patch(p.id, { is_published: true })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Publier
                    </button>
                  )}
                  {p.is_published && (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => patch(p.id, { is_published: false })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Dépublier
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(p)}
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
        <PartenaireFormModal
          partenaire={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Partenaire mis à jour" : "Partenaire créé");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer ce partenaire ?</h3>
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

function PartenaireFormModal({
  partenaire,
  onClose,
  onSaved,
}: {
  partenaire: PartenaireItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nom, setNom] = useState(partenaire?.nom || "");
  const [logoUrl, setLogoUrl] = useState(partenaire?.logo_url || "");
  const [siteUrl, setSiteUrl] = useState(partenaire?.site_url || "");
  const [description, setDescription] = useState(partenaire?.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      const url = partenaire ? `/api/partenaires/${partenaire.id}` : "/api/partenaires";
      const method = partenaire ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          logo_url: logoUrl.trim() || null,
          site_url: siteUrl.trim() || null,
          description: description.trim() || null,
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
            {partenaire ? "Modifier le partenaire" : "Nouveau partenaire"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {partenaire && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Modifier ces informations remettra ce partenaire au statut &laquo; non vérifié &raquo;.
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">URL du site (optionnel)</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">URL du logo (optionnel)</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description (optionnel)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
