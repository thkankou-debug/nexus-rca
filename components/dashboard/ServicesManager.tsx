"use client";

// ============================================================================
// COMPOSANT — ServicesManager
// P8, lot Services et tarifs. Le super_admin gère catégorie, description,
// tarif (fixe ou sur devis), délai indicatif, statut et ordre d'affichage
// sans toucher au code. Groupé par pôle officiel.
// ============================================================================

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Power, Edit3, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TarifType = "fixe" | "sur_devis";
type ServiceStatus = "actif" | "inactif";

export interface ServiceItem {
  id: string;
  slug: string;
  nom: string;
  categorie: string;
  description: string | null;
  tarif_type: TarifType;
  tarif_montant: number | null;
  devise: string;
  delai_indicatif: string | null;
  status: ServiceStatus;
  ordre_affichage: number;
}

function formatMoney(amount: number | null, currency: string): string {
  if (amount === null) return "—";
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

export function ServicesManager({ initialServices }: { initialServices: ServiceItem[] }) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const parCategorie = useMemo(() => {
    const map = new Map<string, ServiceItem[]>();
    for (const s of services) {
      const list = map.get(s.categorie) || [];
      list.push(s);
      map.set(s.categorie, list);
    }
    return Array.from(map.entries());
  }, [services]);

  async function reload() {
    const res = await fetch("/api/services");
    const json = await res.json();
    if (json.success) setServices(json.services);
  }

  async function toggleStatus(s: ServiceItem) {
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s.status === "actif" ? "inactif" : "actif" }),
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

  return (
    <div className="space-y-8">
      {parCategorie.map(([categorie, items]) => (
        <div key={categorie}>
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">{categorie}</h2>
          <div className="mt-3 space-y-2">
            {items.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-nexus-blue-950">{s.nom}</span>
                    <span className="font-mono text-xs text-slate-400">/{s.slug}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        s.status === "actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {s.status === "actif" ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  {s.description && <p className="mt-1 text-sm text-slate-600">{s.description}</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    {s.tarif_type === "fixe" ? formatMoney(s.tarif_montant, s.devise) : "Sur devis"}
                    {s.delai_indicatif && ` · Délai indicatif : ${s.delai_indicatif}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={busyId === s.id}
                    onClick={() => toggleStatus(s)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
                      s.status === "actif" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-green-600 text-white hover:bg-green-700"
                    )}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {s.status === "actif" ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editing && (
        <ServiceEditModal
          service={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
            toast.success("Service mis à jour");
          }}
        />
      )}
    </div>
  );
}

function ServiceEditModal({
  service,
  onClose,
  onSaved,
}: {
  service: ServiceItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState(service.description || "");
  const [tarifType, setTarifType] = useState<TarifType>(service.tarif_type);
  const [tarifMontant, setTarifMontant] = useState(service.tarif_montant || 0);
  const [delaiIndicatif, setDelaiIndicatif] = useState(service.delai_indicatif || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description || null,
          tarif_type: tarifType,
          tarif_montant: tarifType === "fixe" ? tarifMontant : null,
          delai_indicatif: delaiIndicatif || null,
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">{service.nom}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tarif</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setTarifType("sur_devis")}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                  tarifType === "sur_devis" ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700" : "border-slate-200 text-slate-600"
                )}
              >
                Sur devis
              </button>
              <button
                type="button"
                onClick={() => setTarifType("fixe")}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                  tarifType === "fixe" ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700" : "border-slate-200 text-slate-600"
                )}
              >
                Tarif fixe
              </button>
            </div>
            {tarifType === "fixe" && (
              <input
                type="number"
                min={0}
                value={tarifMontant}
                onChange={(e) => setTarifMontant(Number(e.target.value))}
                placeholder="Montant en XAF"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Délai indicatif (optionnel)</label>
            <input
              type="text"
              value={delaiIndicatif}
              onChange={(e) => setDelaiIndicatif(e.target.value)}
              placeholder="ex: 5 à 10 jours ouvrés"
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
