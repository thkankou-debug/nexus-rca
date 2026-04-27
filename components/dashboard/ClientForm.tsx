"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2, User, Building2, Landmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type Client,
  type ClientType,
  CLIENT_TYPE_LABELS,
} from "@/types/client-types";

// ============================================================================
// COMPOSANT
// ============================================================================
export function ClientForm({
  initialData,
  currentUserId,
  onClose,
  onSaved,
}: {
  initialData?: Client | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: (client: Client) => void;
}) {
  const supabase = createClient();
  const isEditing = !!initialData;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: initialData?.type || ("particulier" as ClientType),
    nom: initialData?.nom || "",
    prenom: initialData?.prenom || "",
    raison_sociale: initialData?.raison_sociale || "",
    numero_identification: initialData?.numero_identification || "",
    email: initialData?.email || "",
    telephone: initialData?.telephone || "",
    telephone_2: initialData?.telephone_2 || "",
    adresse: initialData?.adresse || "",
    ville: initialData?.ville || "",
    pays: initialData?.pays || "République Centrafricaine",
    notes: initialData?.notes || "",
    actif: initialData?.actif ?? true,
  });

  const handleChange = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!form.nom.trim()) {
      toast.error("Le nom est requis");
      setSaving(false);
      return;
    }

    const payload = {
      type: form.type,
      nom: form.nom.trim(),
      prenom: form.type === "particulier" ? form.prenom.trim() || null : null,
      raison_sociale:
        form.type === "entreprise"
          ? form.raison_sociale.trim() || null
          : null,
      numero_identification: form.numero_identification.trim() || null,
      email: form.email.trim() || null,
      telephone: form.telephone.trim() || null,
      telephone_2: form.telephone_2.trim() || null,
      adresse: form.adresse.trim() || null,
      ville: form.ville.trim() || null,
      pays: form.pays.trim() || null,
      notes: form.notes.trim() || null,
      actif: form.actif,
      created_by: currentUserId,
    };

    let savedClient: Client | null = null;

    if (isEditing && initialData) {
      const { data, error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", initialData.id)
        .select()
        .single();

      if (error) {
        toast.error("Erreur : " + error.message);
        setSaving(false);
        return;
      }
      savedClient = data as Client;
    } else {
      const { data, error } = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error("Erreur : " + error.message);
        setSaving(false);
        return;
      }
      savedClient = data as Client;
    }

    setSaving(false);

    if (savedClient) {
      toast.success(isEditing ? "Client mis à jour" : "Client créé");
      onSaved(savedClient);
    }
  };

  const TYPE_ICONS: Record<ClientType, typeof User> = {
    particulier: User,
    entreprise: Building2,
    institution: Landmark,
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
              {isEditing ? "Modifier le client" : "Nouveau client"}
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
          {/* SECTION : Type */}
          <Section title="Type de client">
            <div className="grid grid-cols-3 gap-2">
              {(
                Object.entries(CLIENT_TYPE_LABELS) as [ClientType, string][]
              ).map(([val, label]) => {
                const Icon = TYPE_ICONS[val];
                const isActive = form.type === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange("type", val)}
                    className={
                      isActive
                        ? "flex flex-col items-center gap-2 rounded-xl border-2 border-nexus-orange-500 bg-nexus-orange-50 p-4 text-nexus-orange-700"
                        : "flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-slate-600 hover:border-slate-300"
                    }
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* SECTION : Identité */}
          <Section title="Identité">
            {form.type === "particulier" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom">
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => handleChange("prenom", e.target.value)}
                    className={inputClass}
                    placeholder="Jean"
                  />
                </Field>
                <Field label="Nom *">
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    className={inputClass}
                    placeholder="Dupont"
                  />
                </Field>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Nom commercial / Nom court *">
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    className={inputClass}
                    placeholder="Ex : SARL Centrafrique Tech"
                  />
                </Field>
                {form.type === "entreprise" && (
                  <Field label="Raison sociale complète">
                    <input
                      type="text"
                      value={form.raison_sociale}
                      onChange={(e) =>
                        handleChange("raison_sociale", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Société à Responsabilité Limitée Centrafrique Tech"
                    />
                  </Field>
                )}
              </div>
            )}

            <div className="mt-4">
              <Field
                label={
                  form.type === "particulier"
                    ? "N° de pièce d'identité (CNI, passeport)"
                    : "N° d'identification (NIF, RCCM, RC)"
                }
              >
                <input
                  type="text"
                  value={form.numero_identification}
                  onChange={(e) =>
                    handleChange("numero_identification", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Optionnel"
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Coordonnées */}
          <Section title="Coordonnées">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass}
                  placeholder="email@exemple.com"
                />
              </Field>
              <Field label="Téléphone principal">
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  className={inputClass}
                  placeholder="+236 ..."
                />
              </Field>
              <Field label="Téléphone secondaire (WhatsApp)" className="sm:col-span-2">
                <input
                  type="tel"
                  value={form.telephone_2}
                  onChange={(e) => handleChange("telephone_2", e.target.value)}
                  className={inputClass}
                  placeholder="+236 ..."
                />
              </Field>
            </div>
          </Section>

          {/* SECTION : Adresse */}
          <Section title="Adresse">
            <div className="space-y-4">
              <Field label="Adresse">
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => handleChange("adresse", e.target.value)}
                  className={inputClass}
                  placeholder="Rue, quartier, etc."
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ville">
                  <input
                    type="text"
                    value={form.ville}
                    onChange={(e) => handleChange("ville", e.target.value)}
                    className={inputClass}
                    placeholder="Bangui"
                  />
                </Field>
                <Field label="Pays">
                  <input
                    type="text"
                    value={form.pays}
                    onChange={(e) => handleChange("pays", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* SECTION : Notes */}
          <Section title="Notes internes">
            <Field label="">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className={inputClass}
                placeholder="Observations, contexte, informations utiles pour l'équipe..."
              />
            </Field>
          </Section>

          {/* SECTION : Statut */}
          {isEditing && (
            <Section title="Statut">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => handleChange("actif", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-nexus-orange-600 focus:ring-nexus-orange-500"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Client actif
                </span>
                <span className="text-xs text-slate-500">
                  (les clients inactifs sont masqués par défaut)
                </span>
              </label>
            </Section>
          )}

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
                  Enregistrement...
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  {isEditing ? "Enregistrer les modifications" : "Créer le client"}
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
