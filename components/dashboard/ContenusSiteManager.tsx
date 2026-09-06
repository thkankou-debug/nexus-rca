"use client";

// ============================================================================
// COMPOSANT — ContenusSiteManager
// P8, lot Contenus de page. Textes et appels à l'action du site public,
// groupés par section. Pas de workflow vérifier→publier ici (non requis
// par le texte P8 pour cette table, contrairement aux témoignages/
// partenaires/informations institutionnelles).
// ============================================================================

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit3, Trash2, X, FileText } from "lucide-react";

export interface ContenuSiteItem {
  id: string;
  cle: string;
  section: string;
  contenu: { texte: string };
  updated_at: string;
}

export function ContenusSiteManager({ initialContenus }: { initialContenus: ContenuSiteItem[] }) {
  const [items, setItems] = useState<ContenuSiteItem[]>(initialContenus);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContenuSiteItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContenuSiteItem | null>(null);

  const parSection = useMemo(() => {
    const map = new Map<string, ContenuSiteItem[]>();
    for (const c of items) {
      const list = map.get(c.section) || [];
      list.push(c);
      map.set(c.section, list);
    }
    return Array.from(map.entries());
  }, [items]);

  async function reload() {
    const res = await fetch("/api/contenus-site");
    const json = await res.json();
    if (json.success) setItems(json.contenus);
  }

  async function handleDelete(item: ContenuSiteItem) {
    const res = await fetch(`/api/contenus-site/${item.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Contenu supprimé");
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
          Nouveau contenu
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucun contenu de page enregistré pour le moment.</p>
        </div>
      ) : (
        parSection.map(([section, list]) => (
          <div key={section}>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">{section}</h2>
            <div className="mt-3 space-y-2">
              {list.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-nexus-blue-700">{c.cle}</span>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                        {c.contenu.texte || <span className="italic text-slate-400">Vide</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(c)}
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
          </div>
        ))
      )}

      {(showForm || editing) && (
        <ContenuFormModal
          contenu={editing}
          sectionsExistantes={Array.from(new Set(items.map((i) => i.section)))}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Contenu mis à jour" : "Contenu créé");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer ce contenu ?</h3>
            <p className="mt-2 font-mono text-sm text-slate-600">{confirmDelete.cle}</p>
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

function ContenuFormModal({
  contenu,
  sectionsExistantes,
  onClose,
  onSaved,
}: {
  contenu: ContenuSiteItem | null;
  sectionsExistantes: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [section, setSection] = useState(contenu?.section || "");
  const [cle, setCle] = useState(contenu?.cle || "");
  const [texte, setTexte] = useState(contenu?.contenu.texte || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!section.trim() || (!contenu && !cle.trim())) {
      toast.error("Section et clé requises");
      return;
    }
    setSaving(true);
    try {
      const url = contenu ? `/api/contenus-site/${contenu.id}` : "/api/contenus-site";
      const method = contenu ? "PATCH" : "POST";
      const payload = contenu
        ? { section: section.trim(), texte: texte.trim() }
        : { section: section.trim(), cle: cle.trim(), texte: texte.trim() };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">{contenu ? "Modifier le contenu" : "Nouveau contenu"}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Section</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              list="sections-existantes"
              placeholder="ex: accueil_hero"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
            <datalist id="sections-existantes">
              {sectionsExistantes.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clé</label>
            <input
              type="text"
              value={cle}
              onChange={(e) => setCle(e.target.value)}
              disabled={!!contenu}
              placeholder="ex: accueil_hero_titre"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Texte</label>
            <textarea
              rows={4}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
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
