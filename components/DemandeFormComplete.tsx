"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Paperclip,
  Sparkles,
  User,
  FileText,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { DynamicServiceFields } from "@/components/DynamicServiceFields";
import { FileUploader } from "@/components/FileUploader";
import { createClient } from "@/lib/supabase/client";
import {
  SERVICE_TYPES,
  getServiceTypeConfig,
  DEFAULT_FORM_VALUES,
  validateDemandeForm,
  type DemandeCompleteForm,
  type ValidationErrors,
  SERVICE_SLUG_TO_TYPE,
} from "@/lib/demande-form";
import { whatsappLink, cn } from "@/lib/utils";
import type { ServiceType, UrgenceLevel } from "@/types";

// ============================================================================
// FORM — DEMANDE COMPLÈTE
// ============================================================================
export function DemandeFormComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [form, setForm] = useState<DemandeCompleteForm>(DEFAULT_FORM_VALUES);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [success, setSuccess] = useState<{
    demandeId: string;
    prioritaire: boolean;
  } | null>(null);

  // Préremplissage depuis URL ou session IA
  useEffect(() => {
    const serviceSlug = searchParams.get("service");
    const iaContext = searchParams.get("ia_context");

    if (serviceSlug && SERVICE_SLUG_TO_TYPE[serviceSlug]) {
      const inferredType = SERVICE_SLUG_TO_TYPE[serviceSlug];
      setForm((f) => ({ ...f, service_type: inferredType }));
    }

    if (iaContext) {
      try {
        const decoded = decodeURIComponent(iaContext);
        setForm((f) => ({
          ...f,
          description: f.description || decoded,
          source: "nexus_ia",
        } as DemandeCompleteForm));
      } catch {
        /* ignore */
      }
    }

    // Récupération des infos utilisateur si connecté
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setForm((f) => ({
          ...f,
          nom_complet:
            f.nom_complet ||
            `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim(),
          email: f.email || profile.email,
          telephone: f.telephone || profile.telephone || "",
          pays: f.pays || profile.pays || "Centrafrique",
        }));
      }
    })();
  }, [searchParams, supabase]);

  const serviceConfig = form.service_type
    ? getServiceTypeConfig(form.service_type)
    : undefined;

  const updateField = <K extends keyof DemandeCompleteForm>(
    key: K,
    value: DemandeCompleteForm[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => ({ ...e, [key as string]: undefined }));
    }
  };

  const updateDetail = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent, prioritaire: boolean) => {
    e.preventDefault();
    const validation = validateDemandeForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Merci de corriger les champs indiqués");
      // Scroll vers le premier champ en erreur
      const firstError = Object.keys(validation)[0];
      const el = document.querySelector(`[data-field="${firstError}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      // 1. Récupération utilisateur (pour client_id si connecté)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Résolution du nom lisible du service
      const serviceLabel = serviceConfig?.label || form.service_type;

      // 3. Génération de l'ID côté client (évite un SELECT après INSERT,
      //    qui échouerait en RLS pour les utilisateurs non connectés)
      const demandeId = crypto.randomUUID();

      // 4. Insertion de la demande
      const { error: insertError } = await supabase.from("demandes").insert({
        id: demandeId,
        client_id: user?.id ?? null,
        nom_complet: form.nom_complet,
        email: form.email,
        telephone: form.telephone,
        pays: form.pays,
        ville: form.ville,
        langue_preferee: form.langue_preferee,
        service: serviceLabel,
        objet: form.objet,
        description: form.description,
        urgence: form.urgence,
        date_souhaitee: form.date_souhaitee || null,
        pays_concerne: form.pays_concerne || null,
        destination: form.destination || null,
        budget_estimatif: form.budget_estimatif || null,
        traitement_prioritaire: prioritaire,
        source: "formulaire_complet",
        details_service: form.details,
        consentement_examen: form.consentement_examen,
        consentement_documents: form.consentement_documents,
        consentement_recontact: form.consentement_recontact,
        statut: "nouveau",
      });

      if (insertError) throw insertError;

      // 5. Upload des fichiers
      if (files.length > 0) {
        setUploadProgress({ current: 0, total: files.length });
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${demandeId}/${crypto.randomUUID()}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("demande-documents")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type || undefined,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            toast.error(`Erreur upload ${file.name}`);
            continue;
          }

          await supabase.from("demande_documents").insert({
            demande_id: demandeId,
            uploaded_by: user?.id ?? null,
            storage_path: path,
            file_name: file.name,
            file_size_bytes: file.size,
            mime_type: file.type || "application/octet-stream",
          });

          setUploadProgress({ current: i + 1, total: files.length });
        }
      }

      toast.success(
        prioritaire
          ? "Demande prioritaire soumise ! Un conseiller vous appelle rapidement."
          : "Demande soumise ! Réponse sous 24h."
      );
      setSuccess({ demandeId, prioritaire });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Erreur lors de la soumission";
      toast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // ===== ÉCRAN DE SUCCÈS =====
  if (success) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-display text-4xl font-bold text-nexus-blue-950">
          Demande enregistrée ✅
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Merci <strong>{form.nom_complet}</strong>.
          {success.prioritaire
            ? " Votre demande a été marquée comme prioritaire — un conseiller vous contacte dans les heures qui suivent."
            : " Un conseiller Nexus RCA étudie votre dossier et vous revient sous 24h."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Référence : {success.demandeId.slice(0, 8).toUpperCase()}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/dashboard" variant="secondary">
            Mon espace
          </Button>
          <Button
            href={whatsappLink(
              `Bonjour, je viens de soumettre ma demande #${success.demandeId.slice(
                0,
                8
              ).toUpperCase()} pour : ${serviceConfig?.label}`
            )}
            external
            variant="primary"
          >
            <MessageCircle className="h-5 w-5" />
            Suivre sur WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  // ===== LOADING OVERLAY pendant upload =====
  const isUploading = uploadProgress !== null;

  return (
    <form className="space-y-8">
      {/* Source IA (si venu depuis Nexus IA) */}
      {form.source === "nexus_ia" && (
        <div className="rounded-2xl border border-nexus-orange-200 bg-gradient-to-r from-nexus-orange-50 to-nexus-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-nexus-orange-600" />
            <p className="text-sm text-nexus-blue-900">
              <strong>Conversation Nexus IA reprise.</strong> Nous avons prérempli la description — ajustez-la si besoin.
            </p>
          </div>
        </div>
      )}

      {/* ====== SECTION 1 — INFOS PERSONNELLES ====== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <SectionHeader icon={User} title="Informations personnelles" step={1} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div data-field="nom_complet">
            <Input
              label="Nom complet *"
              value={form.nom_complet}
              onChange={(e) => updateField("nom_complet", e.target.value)}
              error={errors.nom_complet}
              placeholder="Jean Dupont"
            />
          </div>
          <div data-field="email">
            <Input
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.email}
              placeholder="vous@exemple.com"
            />
          </div>
          <div data-field="telephone">
            <Input
              label="Téléphone / WhatsApp *"
              value={form.telephone}
              onChange={(e) => updateField("telephone", e.target.value)}
              error={errors.telephone}
              placeholder="+236 ..."
            />
          </div>
          <div data-field="pays">
            <Input
              label="Pays de résidence *"
              value={form.pays}
              onChange={(e) => updateField("pays", e.target.value)}
              error={errors.pays}
            />
          </div>
          <div data-field="ville">
            <Input
              label="Ville *"
              value={form.ville}
              onChange={(e) => updateField("ville", e.target.value)}
              error={errors.ville}
              placeholder="Bangui, Paris, Montréal..."
            />
          </div>
          <Select
            label="Langue préférée"
            value={form.langue_preferee}
            onChange={(e) => updateField("langue_preferee", e.target.value)}
          >
            <option value="Français">Français</option>
            <option value="English">English</option>
            <option value="Sango">Sango</option>
            <option value="Arabe">Arabe</option>
          </Select>
        </div>
      </section>

      {/* ====== SECTION 2 — TYPE DE SERVICE ====== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <SectionHeader icon={Sparkles} title="Service demandé" step={2} />
        <div data-field="service_type">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_TYPES.map((s) => {
              const selected = form.service_type === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    updateField("service_type", s.value as ServiceType);
                    // Reset details quand on change de service
                    setForm((f) => ({ ...f, details: {} }));
                  }}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-left transition-all",
                    selected
                      ? "border-nexus-orange-500 bg-nexus-orange-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-nexus-blue-300 hover:bg-nexus-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-nexus-blue-950">
                        {s.label}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.service_type && (
            <p className="mt-2 text-sm text-red-600">{errors.service_type}</p>
          )}
        </div>
      </section>

      {/* ====== SECTION 3 — DÉTAILS DE LA DEMANDE ====== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <SectionHeader icon={FileText} title="Détails de la demande" step={3} />
        <div className="space-y-5">
          <div data-field="objet">
            <Input
              label="Objet de la demande *"
              value={form.objet}
              onChange={(e) => updateField("objet", e.target.value)}
              error={errors.objet}
              placeholder="ex : Visa étudiant Canada pour rentrée septembre"
            />
          </div>
          <div data-field="description">
            <Textarea
              label="Description détaillée *"
              rows={5}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              error={errors.description}
              placeholder="Expliquez votre situation, vos objectifs, ce que vous avez déjà entrepris, et ce que vous attendez précisément de Nexus RCA..."
            />
            <p className="mt-1 text-xs text-slate-500">
              {form.description.length} / min. 20 caractères
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Niveau d'urgence"
              value={form.urgence}
              onChange={(e) =>
                updateField("urgence", e.target.value as UrgenceLevel)
              }
            >
              <option value="faible">Faible (plus d'un mois)</option>
              <option value="normale">Normale (quelques semaines)</option>
              <option value="elevee">Élevée (sous 2 semaines)</option>
              <option value="critique">Critique (urgent)</option>
            </Select>
            <Input
              label="Date souhaitée (si pertinent)"
              type="date"
              value={form.date_souhaitee}
              onChange={(e) => updateField("date_souhaitee", e.target.value)}
            />
            <Input
              label="Pays concerné"
              value={form.pays_concerne}
              onChange={(e) => updateField("pays_concerne", e.target.value)}
              placeholder="ex : Canada, France..."
            />
            <Input
              label="Destination (si voyage)"
              value={form.destination}
              onChange={(e) => updateField("destination", e.target.value)}
              placeholder="ex : Montréal, Paris..."
            />
            <div className="sm:col-span-2">
              <Input
                label="Budget estimatif (si pertinent)"
                value={form.budget_estimatif}
                onChange={(e) =>
                  updateField("budget_estimatif", e.target.value)
                }
                placeholder="ex : 500 000 FCFA, 1000 EUR, flexible..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 4 — CHAMPS DYNAMIQUES ====== */}
      {form.service_type && serviceConfig?.hasDynamicFields && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <SectionHeader icon={Sparkles} title="Précisions spécifiques" step={4} />
          <DynamicServiceFields
            serviceType={form.service_type as ServiceType}
            details={form.details}
            onChange={updateDetail}
          />
        </section>
      )}

      {/* ====== SECTION 5 — DOCUMENTS ====== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <SectionHeader
          icon={Paperclip}
          title="Documents à joindre"
          step={5}
          optional
        />
        <p className="mb-4 text-sm text-slate-600">
          Joignez les documents utiles à votre dossier : passeport, relevés, CV, lettres, diplômes, plan d'affaires, etc. Tout est confidentiel.
        </p>
        <FileUploader files={files} onChange={setFiles} disabled={loading} />
      </section>

      {/* ====== SECTION 6 — CONSENTEMENTS ====== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <SectionHeader icon={ShieldCheck} title="Consentement & confidentialité" step={6} />
        <div className="space-y-3">
          <ConsentCheckbox
            checked={form.consentement_examen}
            onChange={(v) => updateField("consentement_examen", v)}
            error={errors.consentement_examen}
            label="J'accepte que Nexus RCA examine ma demande et mes documents."
          />
          <ConsentCheckbox
            checked={form.consentement_documents}
            onChange={(v) => updateField("consentement_documents", v)}
            error={errors.consentement_documents}
            label="J'autorise Nexus RCA à traiter les documents transmis dans le cadre de ma demande."
          />
          <ConsentCheckbox
            checked={true}
            onChange={() => {}}
            disabled
            label="Je comprends qu'aucun résultat (obtention de visa, bourse, financement...) n'est garanti et que Nexus RCA fournit un service d'accompagnement."
          />
          <ConsentCheckbox
            checked={form.consentement_recontact}
            onChange={(v) => updateField("consentement_recontact", v)}
            label="Je souhaite être recontacté(e) par Nexus RCA pour suivre cette demande."
          />
        </div>
      </section>

      {/* ====== SECTION 7 — SOUMISSION ====== */}
      <section className="rounded-3xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              Prêt à envoyer votre demande ?
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Un conseiller Nexus RCA revient vers vous sous 24h. Besoin d'une réponse plus rapide ? Choisissez le traitement prioritaire.
            </p>
          </div>

          {isUploading && (
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-2 text-sm text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi des documents... {uploadProgress!.current} / {uploadProgress!.total}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-nexus-orange-500 transition-all"
                  style={{
                    width: `${
                      (uploadProgress!.current / uploadProgress!.total) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              {loading && !form.traitement_prioritaire ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
              Soumettre ma demande
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              variant="white"
              size="lg"
              className="flex-1"
            >
              {loading && form.traitement_prioritaire ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 text-nexus-orange-600" />
              )}
              Demander un traitement prioritaire
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
function SectionHeader({
  icon: Icon,
  title,
  step,
  optional,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  step: number;
  optional?: boolean;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-white shadow-lg">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Étape {step}
          {optional && " · Optionnel"}
        </p>
        <h2 className="font-display text-xl font-bold text-nexus-blue-950">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  label,
  error,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors",
        checked && "border-nexus-orange-300 bg-nexus-orange-50/50",
        disabled && "cursor-default opacity-80",
        error && "border-red-400 bg-red-50"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-nexus-orange-600 focus:ring-2 focus:ring-nexus-orange-500/30"
      />
      <span className="text-sm text-nexus-blue-950">{label}</span>
    </label>
  );
}
