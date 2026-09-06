"use client";

// ============================================================================
// COMPOSANT — CategoriesComptaManager
// P6, lot Catégories comptables. Liste + création + bascule actif/inactif.
// Réservé admin/super_admin (categorie_compta.write) — donnée de référence
// proche d'un paramétrage.
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Tag, TrendingUp, TrendingDown, Power, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CategorieType = "revenu" | "depense";
type CategorieStatus = "actif" | "inactif";

export interface CategorieComptaItem {
  id: string;
  code: string;
  label: string;
  type: CategorieType;
  status: CategorieStatus;
  created_at: string;
}

export function CategoriesComptaManager({ initialCategories }: { initialCategories: CategorieComptaItem[] }) {
  const [categories, setCategories] = useState<CategorieComptaItem[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/categories-compta");
    const json = await res.json();
    if (json.success) setCategories(json.categories);
  }

  async function toggleStatus(cat: CategorieComptaItem) {
    setBusyId(cat.id);
    try {
      const res = await fetch(`/api/categories-compta/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: cat.status === "actif" ? "inactif" : "actif" }),
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

  const revenus = categories.filter((c) => c.type === "revenu");
  const depenses = categories.filter((c) => c.type === "depense");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategorieColumn
          title="Revenus"
          icon={TrendingUp}
          accent="green"
          items={revenus}
          busyId={busyId}
          onToggle={toggleStatus}
        />
        <CategorieColumn
          title="Dépenses"
          icon={TrendingDown}
          accent="red"
          items={depenses}
          busyId={busyId}
          onToggle={toggleStatus}
        />
      </div>

      {showForm && (
        <CategorieFormModal
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await reload();
            toast.success("Catégorie créée");
          }}
        />
      )}
    </div>
  );
}

function CategorieColumn({
  title,
  icon: Icon,
  accent,
  items,
  busyId,
  onToggle,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "green" | "red";
  items: CategorieComptaItem[];
  busyId: string | null;
  onToggle: (cat: CategorieComptaItem) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", accent === "green" ? "text-green-600" : "text-red-600")} />
        <h3 className="font-display text-lg font-bold text-nexus-blue-950">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Aucune catégorie.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-mono text-xs font-bold text-slate-500">{c.code}</span>
                <span className="text-sm text-nexus-blue-950">{c.label}</span>
              </div>
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => onToggle(c)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50",
                  c.status === "actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                )}
              >
                <Power className="h-3 w-3" />
                {c.status === "actif" ? "Actif" : "Inactif"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorieFormModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<CategorieType>("revenu");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!code.trim() || !label.trim()) {
      toast.error("Code et libellé requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories-compta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), label: label.trim(), type }),
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
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">Nouvelle catégorie comptable</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: VISA-FRAIS"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Libellé</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Frais de dossier visa"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Type</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setType("revenu")}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                  type === "revenu" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600"
                )}
              >
                Revenu
              </button>
              <button
                type="button"
                onClick={() => setType("depense")}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                  type === "depense" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-600"
                )}
              >
                Dépense
              </button>
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
