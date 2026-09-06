"use client";

// ============================================================================
// COMPOSANT — FaqManager
// P8, lot FAQ. Le super_admin/moderateur gère les questions fréquentes du
// site public sans toucher au code.
// ============================================================================

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Power, Edit3, Trash2, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqStatus = "actif" | "inactif";

export interface FaqItem {
  id: string;
  question: string;
  reponse: string;
  categorie: string | null;
  ordre_affichage: number;
  status: FaqStatus;
}

export function FaqManager({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FaqItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const parCategorie = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const f of faqs) {
      const cat = f.categorie || "Sans catégorie";
      const list = map.get(cat) || [];
      list.push(f);
      map.set(cat, list);
    }
    return Array.from(map.entries());
  }, [faqs]);

  async function reload() {
    const res = await fetch("/api/faq");
    const json = await res.json();
    if (json.success) setFaqs(json.faqs);
  }

  async function toggleStatus(f: FaqItem) {
    setBusyId(f.id);
    try {
      const res = await fetch(`/api/faq/${f.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: f.status === "actif" ? "inactif" : "actif" }),
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

  async function handleDelete(f: FaqItem) {
    const res = await fetch(`/api/faq/${f.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error || "Échec de la suppression");
      return;
    }
    setConfirmDelete(null);
    await reload();
    toast.success("Question supprimée");
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
          Nouvelle question
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-600">Aucune question fréquente pour le moment.</p>
        </div>
      ) : (
        parCategorie.map(([categorie, items]) => (
          <div key={categorie}>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">{categorie}</h2>
            <div className="mt-3 space-y-2">
              {items.map((f) => (
                <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-nexus-blue-950">{f.question}</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            f.status === "actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {f.status === "actif" ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{f.reponse}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(f)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        disabled={busyId === f.id}
                        onClick={() => toggleStatus(f)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
                          f.status === "actif" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-green-600 text-white hover:bg-green-700"
                        )}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {f.status === "actif" ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(f)}
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
        <FaqFormModal
          faq={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
            toast.success(editing ? "Question mise à jour" : "Question créée");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-nexus-blue-950">Supprimer cette question ?</h3>
            <p className="mt-2 text-sm text-slate-600">{confirmDelete.question}</p>
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

function FaqFormModal({
  faq,
  onClose,
  onSaved,
}: {
  faq: FaqItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [question, setQuestion] = useState(faq?.question || "");
  const [reponse, setReponse] = useState(faq?.reponse || "");
  const [categorie, setCategorie] = useState(faq?.categorie || "");
  const [ordreAffichage, setOrdreAffichage] = useState(faq?.ordre_affichage ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!question.trim() || !reponse.trim()) {
      toast.error("Question et réponse requises");
      return;
    }
    setSaving(true);
    try {
      const url = faq ? `/api/faq/${faq.id}` : "/api/faq";
      const method = faq ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          reponse: reponse.trim(),
          categorie: categorie.trim() || null,
          ordre_affichage: ordreAffichage,
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
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">{faq ? "Modifier la question" : "Nouvelle question"}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Réponse</label>
            <textarea
              rows={4}
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Catégorie (optionnel)</label>
              <input
                type="text"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                placeholder="ex: Visa"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ordre d&apos;affichage</label>
              <input
                type="number"
                value={ordreAffichage}
                onChange={(e) => setOrdreAffichage(Number(e.target.value))}
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
