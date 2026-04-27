"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

// ============================================================================
// TYPES
// ============================================================================
export type PaymentMethod =
  | "especes"
  | "virement"
  | "mobile_money"
  | "western_union"
  | "moneygram"
  | "carte"
  | "cheque"
  | "autre";

export type PaymentStatus =
  | "non_paye"
  | "partiel"
  | "paye"
  | "rembourse"
  | "annule";

export interface Payment {
  id: string;
  reference: string | null;
  client_id: string | null;
  demande_id: string | null;
  agent_id: string | null;
  client_nom: string;
  client_email: string | null;
  client_telephone: string | null;
  service: string;
  description: string | null;
  montant_total: number;
  montant_recu: number;
  devise: string;
  mode_paiement: PaymentMethod;
  date_paiement: string;
  statut: PaymentStatus;
  preuve_path: string | null;
  preuve_nom: string | null;
  notes_internes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface AgentOption {
  id: string;
  nom: string;
  prenom: string | null;
}

// ============================================================================
// LABELS
// ============================================================================
const METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  carte: "Carte bancaire",
  cheque: "Chèque",
  autre: "Autre",
};

const SERVICES = [
  "Visa",
  "Études Canada",
  "Bourses",
  "TCF",
  "Financement / Incubateur",
  "Billets d'avion",
  "Hôtels",
  "Change de devises",
  "Transfert d'argent",
  "Services administratifs",
  "Digitalisation",
  "Autre",
];

// ============================================================================
// COMPOSANT
// ============================================================================
export function PaymentForm({
  initialData,
  agents,
  currentUserId,
  onClose,
  onSaved,
}: {
  initialData?: Payment | null;
  agents: AgentOption[];
  currentUserId: string;
  onClose: () => void;
  onSaved: (payment: Payment) => void;
}) {
  const supabase = createClient();
  const isEditing = !!initialData;

  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    client_nom: initialData?.client_nom || "",
    client_email: initialData?.client_email || "",
    client_telephone: initialData?.client_telephone || "",
    service: initialData?.service || "",
    description: initialData?.description || "",
    montant_total: initialData?.montant_total?.toString() || "",
    montant_recu: initialData?.montant_recu?.toString() || "0",
    devise: initialData?.devise || "XAF",
    mode_paiement: initialData?.mode_paiement || ("especes" as PaymentMethod),
    date_paiement: initialData?.date_paiement
      ? new Date(initialData.date_paiement).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    agent_id: initialData?.agent_id || currentUserId,
    notes_internes: initialData?.notes_internes || "",
  });

  // Calcul affiché du montant restant
  const montantTotal = parseFloat(form.montant_total) || 0;
  const montantRecu = parseFloat(form.montant_recu) || 0;
  const montantRestant = Math.max(0, montantTotal - montantRecu);

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    setProofFile(file);
  };

  const uploadProofToStorage = async (
    paymentId: string
  ): Promise<{ path: string; nom: string } | null> => {
    if (!proofFile) return null;
    setUploadingProof(true);

    const ext = proofFile.name.split(".").pop();
    const path = `${paymentId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("payment-proofs")
      .upload(path, proofFile);

    setUploadingProof(false);

    if (error) {
      toast.error("Erreur upload preuve : " + error.message);
      return null;
    }
    return { path, nom: proofFile.name };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validation basique
    if (!form.client_nom.trim()) {
      toast.error("Nom du client requis");
      setSaving(false);
      return;
    }
    if (!form.service) {
      toast.error("Service requis");
      setSaving(false);
      return;
    }
    if (montantTotal <= 0) {
      toast.error("Le montant total doit être supérieur à 0");
      setSaving(false);
      return;
    }
    if (montantRecu < 0) {
      toast.error("Le montant reçu ne peut pas être négatif");
      setSaving(false);
      return;
    }

    const payload = {
      client_nom: form.client_nom.trim(),
      client_email: form.client_email.trim() || null,
      client_telephone: form.client_telephone.trim() || null,
      service: form.service,
      description: form.description.trim() || null,
      montant_total: montantTotal,
      montant_recu: montantRecu,
      devise: form.devise,
      mode_paiement: form.mode_paiement,
      date_paiement: new Date(form.date_paiement).toISOString(),
      agent_id: form.agent_id || null,
      notes_internes: form.notes_internes.trim() || null,
      created_by: currentUserId,
    };

    let savedPayment: Payment | null = null;

    if (isEditing && initialData) {
      // UPDATE
      const { data, error } = await supabase
        .from("payments")
        .update(payload)
        .eq("id", initialData.id)
        .select()
        .single();

      if (error) {
        toast.error("Erreur : " + error.message);
        setSaving(false);
        return;
      }
      savedPayment = data as Payment;
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("payments")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error("Erreur : " + error.message);
        setSaving(false);
        return;
      }
      savedPayment = data as Payment;
    }

    // Upload preuve si fichier sélectionné
    if (proofFile && savedPayment) {
      const proofData = await uploadProofToStorage(savedPayment.id);
      if (proofData) {
        const { data: updated } = await supabase
          .from("payments")
          .update({
            preuve_path: proofData.path,
            preuve_nom: proofData.nom,
          })
          .eq("id", savedPayment.id)
          .select()
          .single();
        if (updated) savedPayment = updated as Payment;
      }
    }

    setSaving(false);

    if (savedPayment) {
      toast.success(isEditing ? "Paiement mis à jour" : "Paiement enregistré");
      onSaved(savedPayment);
    }
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-nexus-blue-950">
              {isEditing ? "Modifier le paiement" : "Nouveau paiement"}
            </h2>
            {initialData?.reference && (
              <p className="mt-1 font-mono text-xs text-slate-500">
                {initialData.reference}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* SECTION : Client */}
          <Section title="Client">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet *">
                <input
                  type="text"
                  required
                  value={form.client_nom}
                  onChange={(e) => handleChange("client_nom", e.target.value)}
                  className={inputClass}
                  placeholder="Nom et prénom du client"
                />
              </Field>
              <Field label="Téléphone">
                <input
                  type="tel"
                  value={form.client_telephone}
                  onChange={(e) =>
                    handleChange("client_telephone", e.target.value)
                  }
                  className={inputClass}
                  placeholder="+236 ..."
                />
              </Field>
              <Field label="Email" className="sm:col-span-2">
                <input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => handleChange("client_email", e.target.value)}
                  className={inputClass}
                  placeholder="email@exemple.com"
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Service */}
          <Section title="Service & description">
            <div className="grid gap-4">
              <Field label="Service *">
                <select
                  required
                  value={form.service}
                  onChange={(e) => handleChange("service", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Sélectionner un service —</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description / précisions">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={inputClass}
                  placeholder="Détails sur le service ou la prestation..."
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Montants */}
          <Section title="Montants">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Montant total *">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.montant_total}
                  onChange={(e) => handleChange("montant_total", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field label="Montant reçu *">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.montant_recu}
                  onChange={(e) => handleChange("montant_recu", e.target.value)}
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

            {/* Récap montant restant */}
            {montantTotal > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">Montant restant :</span>
                  <span
                    className={
                      montantRestant > 0
                        ? "font-bold text-nexus-orange-600"
                        : "font-bold text-green-600"
                    }
                  >
                    {montantRestant.toLocaleString("fr-FR")} {form.devise}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (montantRecu / montantTotal) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Statut prévu :{" "}
                  <strong>
                    {montantRecu <= 0
                      ? "Non payé"
                      : montantRecu >= montantTotal
                      ? "Payé"
                      : "Partiel"}
                  </strong>
                </p>
              </div>
            )}
          </Section>

          {/* SECTION : Mode et date */}
          <Section title="Détails du paiement">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mode de paiement">
                <select
                  value={form.mode_paiement}
                  onChange={(e) =>
                    handleChange("mode_paiement", e.target.value)
                  }
                  className={inputClass}
                >
                  {(
                    Object.entries(METHOD_LABELS) as [PaymentMethod, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date du paiement">
                <input
                  type="datetime-local"
                  value={form.date_paiement}
                  onChange={(e) => handleChange("date_paiement", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Agent ayant encaissé" className="sm:col-span-2">
                <select
                  value={form.agent_id}
                  onChange={(e) => handleChange("agent_id", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Aucun agent —</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.prenom} {a.nom}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* SECTION : Preuve */}
          <Section title="Preuve / reçu (optionnel)">
            <div>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 hover:border-nexus-orange-300 hover:bg-nexus-orange-50">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">
                  {proofFile
                    ? proofFile.name
                    : initialData?.preuve_nom
                    ? `Actuel : ${initialData.preuve_nom}`
                    : "Choisir un fichier (JPG, PNG, PDF · max 10 Mo)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleProofUpload}
                  className="hidden"
                />
              </label>
            </div>
          </Section>

          {/* SECTION : Notes */}
          <Section title="Notes internes">
            <Field label="">
              <textarea
                rows={3}
                value={form.notes_internes}
                onChange={(e) =>
                  handleChange("notes_internes", e.target.value)
                }
                className={inputClass}
                placeholder="Observations, contexte, informations utiles pour l'équipe..."
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
              disabled={saving || uploadingProof}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600 disabled:opacity-50"
            >
              {saving || uploadingProof ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingProof ? "Upload..." : "Enregistrement..."}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  {isEditing ? "Enregistrer les modifications" : "Enregistrer le paiement"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
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
