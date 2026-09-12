"use client";

// ============================================================================
// NOUVEAU CLIENT — modale de création minimale (Espace Accueil & Caisse,
// §3.2 étape Client). Partagée entre le Comptoir POS et la page Clients.
// La détection de similitude est faite côté serveur (409 + candidats) :
// jamais de création silencieuse quand des fiches proches existent.
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccueilClient {
  id: string;
  reference: string | null;
  type: string;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
}

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function NewClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (client: AccueilClient) => void;
}) {
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "" });
  const [duplicates, setDuplicates] = useState<
    {
      id: string;
      reference: string | null;
      nom: string;
      prenom: string | null;
      telephone: string | null;
      email: string | null;
    }[]
  >([]);
  const [saving, setSaving] = useState(false);

  async function submit(force: boolean) {
    if (!form.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, force }),
      });
      const json = await res.json();
      if (res.status === 409 && json.duplicates) {
        setDuplicates(json.duplicates);
        return;
      }
      if (!json.success) {
        toast.error(json.error || "Échec de la création");
        return;
      }
      toast.success("Fiche client créée");
      onCreated(json.client);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-title font-bold text-ink">Nouveau client</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          Avant toute création, rechercher le client pour éviter les doublons.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Nom *</span>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Prénom</span>
            <input
              type="text"
              value={form.prenom}
              onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Téléphone</span>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={cn(inputClass, "mt-1")}
            />
          </label>
        </div>

        {duplicates.length > 0 && (
          <div className="mt-4 rounded-sm border border-status-waiting bg-surface p-3">
            <p className="text-body-sm font-semibold text-ink">Des fiches similaires existent déjà :</p>
            <ul className="mt-2 space-y-1">
              {duplicates.map((d) => (
                <li key={d.id} className="text-caption text-ink-muted">
                  {[d.prenom, d.nom].filter(Boolean).join(" ")} ·{" "}
                  {[d.reference, d.telephone, d.email].filter(Boolean).join(" · ")}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-caption text-ink-muted">
              Utilisez la recherche pour sélectionner une fiche existante, ou confirmez la création
              s&rsquo;il s&rsquo;agit bien d&rsquo;une autre personne.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => submit(duplicates.length > 0)}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : duplicates.length > 0 ? "Créer quand même" : "Créer la fiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
