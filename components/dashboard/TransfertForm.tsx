"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ClientSelector } from "./ClientSelector";

// ============================================================================
// TYPES
// ============================================================================
export type TransfertStatut =
  | "en_attente"
  | "valide"
  | "rejete"
  | "effectue"
  | "annule";

export type TransfertMode =
  | "western_union"
  | "moneygram"
  | "mobile_money"
  | "virement_bancaire"
  | "ria"
  | "wise"
  | "autre";

export interface Transfert {
  id: string;
  reference: string | null;
  client_record_id: string | null;
  expediteur_nom: string;
  expediteur_telephone: string | null;
  expediteur_piece_identite: string | null;
  beneficiaire_nom: string;
  beneficiaire_telephone: string | null;
  beneficiaire_pays: string;
  beneficiaire_ville: string | null;
  montant_envoye: number;
  frais_transfert: number;
  devise: string;
  mode_transfert: TransfertMode;
  numero_reference_externe: string | null;
  statut: TransfertStatut;
  motif_rejet: string | null;
  notes: string | null;
  agent_id: string | null;
  validated_by: string | null;
  validated_at: string | null;
  effectue_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

const MODE_LABELS: Record<TransfertMode, string> = {
  western_union: "Western Union",
  moneygram: "MoneyGram",
  mobile_money: "Mobile Money",
  virement_bancaire: "Virement bancaire",
  ria: "Ria Money Transfer",
  wise: "Wise (TransferWise)",
  autre: "Autre",
};

// ============================================================================
// COMPOSANT
// ============================================================================
export function TransfertForm({
  currentUserId,
  onClose,
  onSaved,
}: {
  currentUserId: string;
  onClose: () => void;
  onSaved: (transfert: Transfert) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_record_id: null as string | null,
    expediteur_nom: "",
    expediteur_telephone: "",
    expediteur_piece_identite: "",
    beneficiaire_nom: "",
    beneficiaire_telephone: "",
    beneficiaire_pays: "",
    beneficiaire_ville: "",
    montant_envoye: "",
    frais_transfert: "",
    devise: "XAF",
    mode_transfert: "western_union" as TransfertMode,
    numero_reference_externe: "",
    notes: "",
  });

  const handleChange = (field: keyof typeof form, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const handleClientPicked = (client: {
    id: string;
    type: string;
    nom: string;
    prenom: string | null;
    raison_sociale: string | null;
    email: string | null;
    telephone: string | null;
  }) => {
    const fullName =
      client.type === "particulier"
        ? [client.prenom, client.nom].filter(Boolean).join(" ")
        : client.nom;

    setForm((prev) => ({
      ...prev,
      client_record_id: client.id,
      expediteur_nom: fullName || prev.expediteur_nom,
      expediteur_telephone: client.telephone || prev.expediteur_telephone,
    }));
  };

  const montantTotal =
    (parseFloat(form.montant_envoye) || 0) +
    (parseFloat(form.frais_transfert) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!form.expediteur_nom.trim()) {
      toast.error("Nom de l'expéditeur requis");
      setSaving(false);
      return;
    }
    if (!form.beneficiaire_nom.trim()) {
      toast.error("Nom du bénéficiaire requis");
      setSaving(false);
      return;
    }
    if (!form.beneficiaire_pays.trim()) {
      toast.error("Pays de destination requis");
      setSaving(false);
      return;
    }
    if (parseFloat(form.montant_envoye) <= 0) {
      toast.error("Le montant doit être supérieur à 0");
      setSaving(false);
      return;
    }

    const payload = {
      client_record_id: form.client_record_id,
      expediteur_nom: form.expediteur_nom.trim(),
      expediteur_telephone: form.expediteur_telephone.trim() || null,
      expediteur_piece_identite: form.expediteur_piece_identite.trim() || null,
      beneficiaire_nom: form.beneficiaire_nom.trim(),
      beneficiaire_telephone: form.beneficiaire_telephone.trim() || null,
      beneficiaire_pays: form.beneficiaire_pays.trim(),
      beneficiaire_ville: form.beneficiaire_ville.trim() || null,
      montant_envoye: parseFloat(form.montant_envoye),
      frais_transfert: parseFloat(form.frais_transfert) || 0,
      devise: form.devise,
      mode_transfert: form.mode_transfert,
      numero_reference_externe: form.numero_reference_externe.trim() || null,
      notes: form.notes.trim() || null,
      agent_id: currentUserId,
      created_by: currentUserId,
      statut: "en_attente" as TransfertStatut,
    };

    const { data, error } = await supabase
      .from("transferts")
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }

    toast.success("Transfert envoyé en validation");
    onSaved(data as Transfert);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-nexus-blue-950">
              Nouveau transfert d'argent
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Sera envoyé pour validation au super-admin avant exécution.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* SECTION : Expediteur */}
          <Section title="Expéditeur (client)">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Lier à un client existant (optionnel)
                </label>
                <ClientSelector
                  selectedClientId={form.client_record_id}
                  onSelect={(id) => handleChange("client_record_id", id)}
                  onClientPicked={handleClientPicked}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet *">
                  <input
                    type="text"
                    required
                    value={form.expediteur_nom}
                    onChange={(e) =>
                      handleChange("expediteur_nom", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Nom et prénom de l'expéditeur"
                  />
                </Field>
                <Field label="Téléphone">
                  <input
                    type="tel"
                    value={form.expediteur_telephone}
                    onChange={(e) =>
                      handleChange("expediteur_telephone", e.target.value)
                    }
                    className={inputClass}
                    placeholder="+236 ..."
                  />
                </Field>
                <Field label="Pièce d'identité (CNI, passeport)" className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.expediteur_piece_identite}
                    onChange={(e) =>
                      handleChange("expediteur_piece_identite", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Numéro de la pièce"
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* SECTION : Beneficiaire */}
          <Section title="Bénéficiaire (qui reçoit)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet *" className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={form.beneficiaire_nom}
                  onChange={(e) =>
                    handleChange("beneficiaire_nom", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Nom et prénom du bénéficiaire"
                />
              </Field>
              <Field label="Téléphone">
                <input
                  type="tel"
                  value={form.beneficiaire_telephone}
                  onChange={(e) =>
                    handleChange("beneficiaire_telephone", e.target.value)
                  }
                  className={inputClass}
                  placeholder="+... ..."
                />
              </Field>
              <Field label="Pays de destination *">
                <input
                  type="text"
                  required
                  value={form.beneficiaire_pays}
                  onChange={(e) =>
                    handleChange("beneficiaire_pays", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Ex : France, Cameroun, Canada..."
                />
              </Field>
              <Field label="Ville (optionnel)" className="sm:col-span-2">
                <input
                  type="text"
                  value={form.beneficiaire_ville}
                  onChange={(e) =>
                    handleChange("beneficiaire_ville", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Paris, Douala, Montréal..."
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Montants */}
          <Section title="Montants">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Montant à envoyer *">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.montant_envoye}
                  onChange={(e) =>
                    handleChange("montant_envoye", e.target.value)
                  }
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field label="Frais de transfert">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.frais_transfert}
                  onChange={(e) =>
                    handleChange("frais_transfert", e.target.value)
                  }
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field label="Devise">
                <select
                  value={form.devise}
                  onChange={(e) => handleChange("devise", e.target.value)}
                  className={inputClass}
                >
                  <option value="XAF">FCFA (XAF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                  <option value="CAD">Dollar CAD</option>
                </select>
              </Field>
            </div>

            {montantTotal > 0 && (
              <div className="mt-3 rounded-xl border border-nexus-orange-200 bg-nexus-orange-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    Montant total à collecter du client :
                  </span>
                  <span className="font-display text-lg font-bold text-nexus-orange-700">
                    {montantTotal.toLocaleString("fr-FR")} {form.devise}
                  </span>
                </div>
              </div>
            )}
          </Section>

          {/* SECTION : Mode et reference */}
          <Section title="Mode de transfert">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mode *">
                <select
                  required
                  value={form.mode_transfert}
                  onChange={(e) =>
                    handleChange("mode_transfert", e.target.value)
                  }
                  className={inputClass}
                >
                  {(
                    Object.entries(MODE_LABELS) as [TransfertMode, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="N° de référence externe (MTCN, etc.)">
                <input
                  type="text"
                  value={form.numero_reference_externe}
                  onChange={(e) =>
                    handleChange("numero_reference_externe", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Optionnel (à remplir après envoi)"
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Notes */}
          <Section title="Notes complémentaires">
            <Field label="">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className={inputClass}
                placeholder="Informations complémentaires (relation expéditeur/bénéficiaire, urgence, etc.)"
              />
            </Field>
          </Section>

          {/* Boutons */}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer pour validation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
