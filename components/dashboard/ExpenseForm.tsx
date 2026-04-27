"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES
// ============================================================================
export type ExpenseStatus = "en_attente" | "valide" | "rejete";

export type ExpenseCategory =
  | "fournitures"
  | "transport"
  | "communication"
  | "restauration"
  | "hebergement"
  | "materiel"
  | "logiciel"
  | "marketing"
  | "maintenance"
  | "frais_bancaires"
  | "salaires"
  | "loyer"
  | "electricite"
  | "internet"
  | "autre";

export type PaymentMethod =
  | "especes"
  | "virement"
  | "mobile_money"
  | "western_union"
  | "moneygram"
  | "carte"
  | "cheque"
  | "autre";

export interface Expense {
  id: string;
  reference: string | null;
  employee_id: string | null;
  employee_nom: string;
  date_depense: string;
  categorie: ExpenseCategory;
  montant: number;
  devise: string;
  motif: string;
  fournisseur: string | null;
  mode_paiement: PaymentMethod;
  preuve_path: string | null;
  preuve_nom: string | null;
  statut: ExpenseStatus;
  validated_by: string | null;
  validated_at: string | null;
  motif_rejet: string | null;
  notes_internes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// LABELS
// ============================================================================
export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fournitures: "Fournitures de bureau",
  transport: "Transport / déplacement",
  communication: "Communication / téléphone",
  restauration: "Restauration / repas",
  hebergement: "Hébergement",
  materiel: "Matériel / équipement",
  logiciel: "Logiciels / abonnements",
  marketing: "Marketing / publicité",
  maintenance: "Maintenance / réparations",
  frais_bancaires: "Frais bancaires",
  salaires: "Salaires / honoraires",
  loyer: "Loyer",
  electricite: "Électricité / eau",
  internet: "Internet",
  autre: "Autre",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  carte: "Carte bancaire",
  cheque: "Chèque",
  autre: "Autre",
};

// ============================================================================
// COMPOSANT
// ============================================================================
export function ExpenseForm({
  initialData,
  currentUserId,
  currentUserName,
  onClose,
  onSaved,
}: {
  initialData?: Expense | null;
  currentUserId: string;
  currentUserName: string;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}) {
  const supabase = createClient();
  const isEditing = !!initialData;

  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    date_depense:
      initialData?.date_depense ||
      new Date().toISOString().slice(0, 10),
    categorie: initialData?.categorie || ("autre" as ExpenseCategory),
    montant: initialData?.montant?.toString() || "",
    devise: initialData?.devise || "XAF",
    motif: initialData?.motif || "",
    fournisseur: initialData?.fournisseur || "",
    mode_paiement: initialData?.mode_paiement || ("especes" as PaymentMethod),
  });

  const handleChange = (field: keyof typeof form, value: string) => {
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
    expenseId: string
  ): Promise<{ path: string; nom: string } | null> => {
    if (!proofFile) return null;
    setUploadingProof(true);
    const ext = proofFile.name.split(".").pop();
    const path = `${expenseId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("expense-proofs")
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

    // Validation
    const montant = parseFloat(form.montant);
    if (!form.motif.trim()) {
      toast.error("Le motif de la dépense est requis");
      setSaving(false);
      return;
    }
    if (!montant || montant <= 0) {
      toast.error("Le montant doit être supérieur à 0");
      setSaving(false);
      return;
    }

    const payload = {
      employee_id: currentUserId,
      employee_nom: currentUserName,
      date_depense: form.date_depense,
      categorie: form.categorie,
      montant,
      devise: form.devise,
      motif: form.motif.trim(),
      fournisseur: form.fournisseur.trim() || null,
      mode_paiement: form.mode_paiement,
    };

    let savedExpense: Expense | null = null;

    if (isEditing && initialData) {
      const { data, error } = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", initialData.id)
        .select()
        .single();

      if (error) {
        toast.error("Erreur : " + error.message);
        setSaving(false);
        return;
      }
      savedExpense = data as Expense;
    } else {
      const { data, error } = await supabase
        .from("expenses")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error("Erreur : " + error.message);
        setSaving(false);
        return;
      }
      savedExpense = data as Expense;
    }

    // Upload preuve si fichier
    if (proofFile && savedExpense) {
      const proofData = await uploadProofToStorage(savedExpense.id);
      if (proofData) {
        const { data: updated } = await supabase
          .from("expenses")
          .update({
            preuve_path: proofData.path,
            preuve_nom: proofData.nom,
          })
          .eq("id", savedExpense.id)
          .select()
          .single();
        if (updated) savedExpense = updated as Expense;
      }
    }

    setSaving(false);

    if (savedExpense) {
      toast.success(
        isEditing ? "Dépense mise à jour" : "Dépense soumise pour validation"
      );
      onSaved(savedExpense);
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
              {isEditing ? "Modifier la dépense" : "Soumettre une dépense"}
            </h2>
            {initialData?.reference && (
              <p className="mt-1 font-mono text-xs text-slate-500">
                {initialData.reference}
              </p>
            )}
            {!isEditing && (
              <p className="mt-1 text-xs text-slate-500">
                Sera soumis pour validation par le super-admin
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
          {/* SECTION : Date & Catégorie */}
          <Section title="Informations de base">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date de la dépense *">
                <input
                  type="date"
                  required
                  value={form.date_depense}
                  onChange={(e) =>
                    handleChange("date_depense", e.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Catégorie *">
                <select
                  required
                  value={form.categorie}
                  onChange={(e) => handleChange("categorie", e.target.value)}
                  className={inputClass}
                >
                  {(
                    Object.entries(CATEGORY_LABELS) as [
                      ExpenseCategory,
                      string
                    ][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* SECTION : Montant */}
          <Section title="Montant">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Montant *" className="sm:col-span-2">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.montant}
                  onChange={(e) => handleChange("montant", e.target.value)}
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
                  <option value="USD">Dollar US</option>
                  <option value="CAD">Dollar CAD</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* SECTION : Motif & fournisseur */}
          <Section title="Motif & fournisseur">
            <div className="grid gap-4">
              <Field label="Motif de la dépense *">
                <textarea
                  required
                  rows={2}
                  value={form.motif}
                  onChange={(e) => handleChange("motif", e.target.value)}
                  className={inputClass}
                  placeholder="Ex : Achat de papier pour l'imprimante du bureau"
                />
              </Field>
              <Field label="Fournisseur / bénéficiaire">
                <input
                  type="text"
                  value={form.fournisseur}
                  onChange={(e) => handleChange("fournisseur", e.target.value)}
                  className={inputClass}
                  placeholder="Ex : Papeterie Centrale"
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Mode de paiement */}
          <Section title="Mode de paiement">
            <Field label="">
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
          </Section>

          {/* SECTION : Preuve */}
          <Section title="Preuve / reçu (optionnel)">
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
                  {isEditing ? "Enregistrer" : "Soumettre la dépense"}
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
