"use client";

// ============================================================================
// COMPOSANT — AgencySettingsManager
// P8, lot Informations institutionnelles. Chaque champ (dénomination
// juridique, RCCM, mentions légales...) se crée en brouillon, doit être
// explicitement vérifié, puis publié — jamais l'inverse. Réservé
// super_admin (RLS "Super admin manages agency_settings", migration 046 —
// même les admins ne peuvent qu'y lire, pas y écrire).
//
// Les libellés suggérés ci-dessous viennent de la liste d'informations
// institutionnelles du texte P10/E8 — une liste de noms de champs
// attendus, PAS des valeurs pré-remplies (aucune donnée fictive créée).
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, ShieldCheck, Eye, EyeOff, Edit3, Trash2, X, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const CHAMPS_SUGGERES = [
  "Dénomination juridique exacte",
  "Forme juridique",
  "Numéro RCCM",
  "Numéro fiscal",
  "Horaires ou conditions de réception",
  "Coordonnées professionnelles",
  "Interlocuteurs nommés et autorisés",
  "Méthode de traitement documentée",
  "Engagements de confidentialité",
  "Mentions légales",
  "Politique de confidentialité",
];

export interface AgencySettingItem {
  id: string;
  cle: string;
  valeur: { label: string; texte: string };
  is_verified: boolean;
  is_published: boolean;
  updated_at: string;
}

export function AgencySettingsManager({ initialSettings }: { initialSettings: AgencySettingItem[] }) {
  const [items, setItems] = useState<AgencySettingItem[]>(initialSettings);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AgencySettingItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AgencySettingItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const champsRestants = CHAMPS_SUGGERES.filter(
    (label) => !items.some((i) => i.valeur.label.toLowerCase() === label.toLowerCase())
  );

  async function reload() {
    const res = await fetch("/api/agency-settings");
    const json = await res.json();
    if (json.success) setItems(json.settings);
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/agency-settings/${id}`, {
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

  async function handleDelete(item: AgencySettingItem) {
    const res = await fetch(`/api/agency-settings/${item.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Champ supprimé");
  }

  return (
    <div className="space-y-6">
      {champsRestants.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Champs suggérés pas encore créés :</p>
          <p className="mt-1 text-blue-800">{champsRestants.join(" · ")}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouveau champ
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Landmark className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucune information institutionnelle enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-nexus-blue-950">{item.valeur.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        item.is_verified ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.is_verified ? "Vérifié" : "Non vérifié"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        item.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.is_published ? "Publié" : "Non publié"}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                    {item.valeur.texte || <span className="italic text-slate-400">Vide</span>}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  {!item.is_verified && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => patch(item.id, { is_verified: true })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Vérifier
                    </button>
                  )}
                  {item.is_verified && !item.is_published && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => patch(item.id, { is_published: true })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Publier
                    </button>
                  )}
                  {item.is_published && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => patch(item.id, { is_published: false })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Dépublier
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(item)}
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
        <SettingFormModal
          setting={editing}
          suggestions={champsRestants}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Champ mis à jour" : "Champ créé");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer ce champ ?</h3>
            <p className="mt-2 text-sm text-slate-600">{confirmDelete.valeur.label}</p>
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

function SettingFormModal({
  setting,
  suggestions,
  onClose,
  onSaved,
}: {
  setting: AgencySettingItem | null;
  suggestions: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(setting?.valeur.label || "");
  const [texte, setTexte] = useState(setting?.valeur.texte || "");
  const [saving, setSaving] = useState(false);

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // diacritiques (accents) apres normalisation NFD
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  async function handleSubmit() {
    if (!label.trim()) {
      toast.error("Le libellé est requis");
      return;
    }
    setSaving(true);
    try {
      const url = setting ? `/api/agency-settings/${setting.id}` : "/api/agency-settings";
      const method = setting ? "PATCH" : "POST";
      const payload = setting
        ? { label: label.trim(), texte: texte.trim() }
        : { cle: slugify(label), label: label.trim(), texte: texte.trim() };
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
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">
            {setting ? "Modifier le champ" : "Nouveau champ institutionnel"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {setting && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Modifier ce champ remettra son statut à &laquo; non vérifié &raquo;.
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Libellé</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={!!setting}
              list="champs-suggeres"
              placeholder="ex: Numéro RCCM"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30 disabled:bg-slate-50 disabled:text-slate-500"
            />
            <datalist id="champs-suggeres">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valeur</label>
            <textarea
              rows={4}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="Laisse vide si tu ne connais pas encore cette information — ne rien inventer."
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
