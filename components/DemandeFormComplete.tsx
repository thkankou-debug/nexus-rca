"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Paperclip,
  Sparkles,
  User,
  FileText,
  ShieldCheck,
  Zap,
  Loader2,
  ClipboardCheck,
  Check,
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
// TYPE LOCAL - etend DemandeCompleteForm avec source optionnel
// (pour tracer l'origine : nexus_ia, formulaire_complet, etc.)
// ============================================================================
type DemandeCompleteFormWithSource = DemandeCompleteForm & {
  source?: string;
};

// ============================================================================
// CONFIG DES ETAPES
// ============================================================================
type StepId = 1 | 2 | 3 | 4 | 5;

const STEPS: Array<{
  id: StepId;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 1, title: "Vos informations", shortTitle: "Identité", icon: User },
  { id: 2, title: "Service demandé", shortTitle: "Service", icon: Sparkles },
  {
    id: 3,
    title: "Détails de la demande",
    shortTitle: "Détails",
    icon: FileText,
  },
  { id: 4, title: "Documents", shortTitle: "Documents", icon: Paperclip },
  { id: 5, title: "Récapitulatif", shortTitle: "Envoi", icon: ClipboardCheck },
];

// ============================================================================
// CHECKLIST DOCUMENTS PAR SERVICE
// ============================================================================
const DOCUMENTS_CHECKLIST: Record<string, string[]> = {
  visa: [
    "Passeport (copie de toutes les pages utiles)",
    "Photos d'identité aux normes",
    "Justificatifs financiers (relevés bancaires 3-6 mois)",
    "Justificatif de domicile",
    "Documents liés au motif du voyage (invitation, réservation)",
    "CV récent",
  ],
  billet: [
    "Copie du passeport (nom exact, expiration)",
    "Dates et villes précises du voyage",
  ],
  hotel: ["Copie du passeport", "Dates précises du séjour"],
  tcf: [
    "Pièce d'identité en cours de validité",
    "Résultats de tests précédents (si applicable)",
  ],
  etudes: [
    "Diplômes et relevés de notes",
    "CV académique",
    "Lettres de recommandation",
    "Preuve de niveau linguistique (TCF, IELTS)",
    "Passeport",
    "Justificatifs financiers",
  ],
  financement: [
    "Présentation du projet (pitch deck si disponible)",
    "Pièce d'identité du porteur",
    "Registre de commerce (si société existe)",
    "États financiers (si applicable)",
    "CV de l'équipe",
    "Devis fournisseurs, lettres d'intention clients",
  ],
  partenariat: [
    "Présentation de votre activité",
    "Pièce d'identité",
    "Documents légaux de la société",
    "Liste des partenaires recherchés",
  ],
  administratif: [
    "Document source à traduire ou traiter",
    "Version précédente (si applicable)",
    "Pièce d'identité",
    "CV existant (si pertinent)",
  ],
  change_transfert: [
    "Pièce d'identité pour gros montants",
    "Coordonnées du bénéficiaire (si transfert)",
  ],
  assistance: ["Tout document utile à votre demande"],
  autre: ["Tout document utile pour clarifier votre demande"],
};

// Cle de stockage local pour la sauvegarde automatique
const STORAGE_KEY = "nexus_demande_draft_v1";

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function DemandeFormComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [form, setForm] = useState<DemandeCompleteFormWithSource>(DEFAULT_FORM_VALUES);
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

  const hydratedRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // ===== HYDRATATION : URL + localStorage + profil =====
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    // 1. Restauration depuis localStorage
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<DemandeCompleteFormWithSource>;
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch {
      /* ignore */
    }

    // 2. Parametres URL (ecrasent le draft)
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
        }));
      } catch {
        /* ignore */
      }
    }

    // 3. Auto-fill depuis le profil authentifie
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

  // ===== SAUVEGARDE AUTOMATIQUE =====
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  // ===== SCROLL EN HAUT AU CHANGEMENT D ETAPE =====
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  // ===== HELPERS =====
  const serviceConfig = form.service_type
    ? getServiceTypeConfig(form.service_type)
    : undefined;

  const updateField = <K extends keyof DemandeCompleteFormWithSource>(
    key: K,
    value: DemandeCompleteFormWithSource[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => ({ ...e, [key as string]: undefined }));
    }
  };

  const updateDetail = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));
  };

  // ===== VALIDATION PAR ETAPE =====
  const validateStep = (step: StepId): ValidationErrors => {
    const e: ValidationErrors = {};

    if (step === 1) {
      if (!form.nom_complet.trim()) e.nom_complet = "Nom complet requis";
      if (!form.email.trim()) e.email = "Email requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Email invalide";
      if (!form.telephone.trim()) e.telephone = "Téléphone requis";
      if (!form.pays.trim()) e.pays = "Pays requis";
      if (!form.ville.trim()) e.ville = "Ville requise";
    }

    if (step === 2) {
      if (!form.service_type) e.service_type = "Veuillez choisir un service";
    }

    if (step === 3) {
      if (!form.objet.trim()) e.objet = "Objet requis";
      else if (form.objet.length < 5)
        e.objet = "Objet trop court (min. 5 caractères)";
      if (!form.description.trim()) e.description = "Description requise";
      else if (form.description.length < 20)
        e.description = "Description trop courte (min. 20 caractères)";
    }

    // Etape 4 (Documents) : optionnel, aucune validation bloquante
    // Etape 5 (Recap) : consentements valides dans handleSubmit

    return e;
  };

  const goToStep = (step: StepId) => {
    // Autorise le retour en arriere librement
    if (step < currentStep) {
      setCurrentStep(step);
      setErrors({});
      return;
    }
    // Pour aller en avant : valider toutes les etapes precedentes
    for (let s = 1 as StepId; s < step; s = (s + 1) as StepId) {
      const err = validateStep(s);
      if (Object.keys(err).length > 0) {
        setErrors(err);
        setCurrentStep(s);
        toast.error(`Merci de compléter l'étape ${s} avant de continuer`);
        return;
      }
    }
    setCurrentStep(step);
    setErrors({});
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (Object.keys(err).length > 0) {
      setErrors(err);
      toast.error("Merci de corriger les champs indiqués");
      const firstError = Object.keys(err)[0];
      const el = document.querySelector(`[data-field="${firstError}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    if (currentStep < 5) {
      setCurrentStep((s) => (s + 1) as StepId);
    }
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as StepId);
    }
  };

  // ===== SOUMISSION =====
  const handleSubmit = async (prioritaire: boolean) => {
    const validation = validateDemandeForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Merci de corriger les champs indiqués");
      // Aller a la premiere etape contenant une erreur
      if (validation.nom_complet || validation.email || validation.telephone || validation.pays || validation.ville) {
        setCurrentStep(1);
      } else if (validation.service_type) {
        setCurrentStep(2);
      } else if (validation.objet || validation.description) {
        setCurrentStep(3);
      } else {
        setCurrentStep(5);
      }
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const serviceLabel = serviceConfig?.label || form.service_type;
      const demandeId = crypto.randomUUID();

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
        source: form.source || "formulaire_complet",
        details_service: form.details,
        consentement_examen: form.consentement_examen,
        consentement_documents: form.consentement_documents,
        consentement_recontact: form.consentement_recontact,
        statut: "nouveau",
      });

      if (insertError) throw insertError;

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

      // Nettoyage du brouillon local apres succes
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }

      toast.success(
        prioritaire
          ? "Demande prioritaire soumise ! Un conseiller vous appelle rapidement."
          : "Demande soumise ! Réponse sous 24 h."
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
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-elev-2 dark:bg-emerald-500/15">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-300" />
          </div>
        </div>
        <h1 className="font-display text-display-lg text-ink lg:text-display-xl">
          Demande enregistrée
        </h1>
        <p className="mt-4 text-body-lg text-ink-muted">
          Merci <strong className="text-ink">{form.nom_complet}</strong>.
          {success.prioritaire
            ? " Votre demande a été marquée comme prioritaire, un conseiller vous contacte dans les heures qui suivent."
            : " Un conseiller Nexus RCA étudie votre dossier et vous revient sous 24 h."}
        </p>
        <p className="mt-2 text-caption text-ink-muted">
          Référence :{" "}
          <span className="font-mono font-semibold text-ink">
            NX-{success.demandeId.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/dashboard" variant="secondary">
            Mon espace
          </Button>
          <Button
            href={whatsappLink(
              `Bonjour, je viens de soumettre ma demande NX-${success.demandeId.slice(0, 8).toUpperCase()} pour : ${serviceConfig?.label}`
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

  const isUploading = uploadProgress !== null;

  return (
    <div ref={topRef}>
      {/* ====== STEPPER ====== */}
      <Stepper currentStep={currentStep} onStepClick={goToStep} />

      {/* ====== Source IA (si venu depuis Nexus IA) ====== */}
      {form.source === "nexus_ia" && currentStep === 1 && (
        <div className="mb-6 rounded-2xl border border-brand/30 bg-gradient-to-r from-brand-subtle/60 to-nexus-blue-50/50 p-4 dark:to-blue-500/5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-brand" />
            <p className="text-body-sm text-ink">
              <strong>Conversation Nexus IA reprise.</strong> Nous avons
              pré-rempli la description, ajustez-la si besoin.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-6"
        >
        {/* ====== ÉTAPE 1 - IDENTITÉ ====== */}
        {currentStep === 1 && (
          <StepCard title="Vos informations" subtitle="Commençons par vous connaître. Tous les champs marqués d'un astérisque sont obligatoires.">
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
                  placeholder="Bangui, Paris, Montréal…"
                />
              </div>
              <Select
                label="Langue préférée"
                value={form.langue_preferee}
                onChange={(e) => updateField("langue_preferee", e.target.value)}
              >
                <option value="Francais">Français</option>
                <option value="English">English</option>
                <option value="Sango">Sango</option>
                <option value="Arabe">Arabe</option>
              </Select>
            </div>
          </StepCard>
        )}

        {/* ====== ETAPE 2 - SERVICE ====== */}
        {currentStep === 2 && (
          <StepCard title="Service demandé" subtitle="Quel service Nexus RCA vous intéresse ? Choisissez la catégorie la plus proche de votre besoin.">
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
                        setForm((f) => ({ ...f, details: {} }));
                      }}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-left transition-all",
                        selected
                          ? "border-brand bg-brand-subtle/60 shadow-elev-3"
                          : "border-line bg-surface-elevated hover:border-brand/40 hover:bg-surface-sunken"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{s.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink">
                            {s.label}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                            {s.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.service_type && (
                <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{errors.service_type}</p>
              )}
            </div>
          </StepCard>
        )}

        {/* ====== ETAPE 3 - DETAILS ====== */}
        {currentStep === 3 && (
          <StepCard title="Détails de votre demande" subtitle="Précisez ce dont vous avez besoin. Plus c'est clair, plus vite nous répondons.">
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
                  placeholder="Expliquez votre situation, vos objectifs, ce que vous avez déjà entrepris, et ce que vous attendez précisément de Nexus RCA…"
                />
                <p className="mt-1 text-caption text-ink-muted">
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
                  placeholder="ex : Canada, France…"
                />
                <Input
                  label="Destination (si voyage)"
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="ex : Montréal, Paris…"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Budget estimatif (si pertinent)"
                    value={form.budget_estimatif}
                    onChange={(e) =>
                      updateField("budget_estimatif", e.target.value)
                    }
                    placeholder="ex : 500 000 FCFA, 1000 EUR, flexible…"
                  />
                </div>
              </div>

              {/* Champs dynamiques selon service */}
              {form.service_type && serviceConfig?.hasDynamicFields && (
                <div className="pt-2">
                  <DynamicServiceFields
                    serviceType={form.service_type as ServiceType}
                    details={form.details}
                    onChange={updateDetail}
                  />
                </div>
              )}
            </div>
          </StepCard>
        )}

        {/* ====== ETAPE 4 - DOCUMENTS ====== */}
        {currentStep === 4 && (
          <StepCard title="Documents à joindre" subtitle="Joignez les documents utiles à votre dossier. Cette étape est optionnelle mais accélère le traitement." optional>
            {form.service_type && DOCUMENTS_CHECKLIST[form.service_type] && (
              <div className="mb-6 rounded-2xl border border-line bg-nexus-blue-50/60 p-5 dark:bg-blue-500/5">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-nexus-blue-700 dark:text-blue-300" />
                  <h3 className="text-title text-ink">
                    Documents recommandés pour ce service
                  </h3>
                </div>
                <ul className="space-y-2 text-body-sm text-ink">
                  {DOCUMENTS_CHECKLIST[form.service_type].map((doc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-caption text-ink-muted">
                  Ne pas avoir tous ces documents n'est pas bloquant. Vous
                  pourrez en ajouter plus tard.
                </p>
              </div>
            )}

            <p className="mb-4 text-body-sm text-ink-muted">
              Formats acceptés : PDF, JPG, PNG, DOC, DOCX. Taille max : 10 Mo
              par fichier. Tout est confidentiel.
            </p>
            <FileUploader files={files} onChange={setFiles} disabled={loading} />
          </StepCard>
        )}

        {/* ====== ETAPE 5 - RECAPITULATIF ====== */}
        {currentStep === 5 && (
          <StepCard title="Récapitulatif" subtitle="Vérifiez vos informations avant envoi. Vous pouvez encore modifier en cliquant sur une étape.">
            <div className="space-y-6">
              <SummaryBlock title="Vos informations" onEdit={() => goToStep(1)}>
                <SummaryRow label="Nom complet" value={form.nom_complet} />
                <SummaryRow label="Email" value={form.email} />
                <SummaryRow label="Téléphone" value={form.telephone} />
                <SummaryRow
                  label="Pays / Ville"
                  value={`${form.pays} / ${form.ville}`}
                />
                <SummaryRow label="Langue" value={form.langue_preferee} />
              </SummaryBlock>

              <SummaryBlock title="Service demandé" onEdit={() => goToStep(2)}>
                <SummaryRow
                  label="Service"
                  value={
                    serviceConfig
                      ? `${serviceConfig.icon} ${serviceConfig.label}`
                      : "Non défini"
                  }
                />
              </SummaryBlock>

              <SummaryBlock title="Détails" onEdit={() => goToStep(3)}>
                <SummaryRow label="Objet" value={form.objet} />
                <SummaryRow
                  label="Description"
                  value={form.description}
                  multiline
                />
                <SummaryRow label="Urgence" value={urgenceLabel(form.urgence)} />
                {form.date_souhaitee && (
                  <SummaryRow
                    label="Date souhaitée"
                    value={form.date_souhaitee}
                  />
                )}
                {form.pays_concerne && (
                  <SummaryRow label="Pays concerné" value={form.pays_concerne} />
                )}
                {form.destination && (
                  <SummaryRow label="Destination" value={form.destination} />
                )}
                {form.budget_estimatif && (
                  <SummaryRow label="Budget" value={form.budget_estimatif} />
                )}
                {form.details && Object.keys(form.details).length > 0 && (
                  <SummaryRow
                    label="Détails spécifiques"
                    value={formatDetails(form.details)}
                    multiline
                  />
                )}
              </SummaryBlock>

              <SummaryBlock title="Documents" onEdit={() => goToStep(4)}>
                {files.length === 0 ? (
                  <p className="text-body-sm italic text-ink-muted">
                    Aucun document joint
                  </p>
                ) : (
                  <ul className="space-y-1 text-body-sm text-ink-muted">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-ink-subtle" />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </SummaryBlock>

              {/* Consentements */}
              <div className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-elev-2">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-nexus-blue-700 dark:text-blue-300" />
                  <h3 className="text-title text-ink">Consentements</h3>
                </div>
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
                    label="Je comprends qu'aucun résultat (obtention de visa, bourse, financement…) n'est garanti et que Nexus RCA fournit un service d'accompagnement."
                  />
                  <ConsentCheckbox
                    checked={form.consentement_recontact}
                    onChange={(v) => updateField("consentement_recontact", v)}
                    label="Je souhaite être recontacté(e) par Nexus RCA pour suivre cette demande."
                  />
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="rounded-2xl border border-line bg-nexus-blue-50/50 p-4 dark:bg-blue-500/5">
                  <div className="flex items-center gap-2 text-body-sm font-medium text-ink">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                    Envoi des documents… {uploadProgress!.current} /{" "}
                    {uploadProgress!.total}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-brand transition-all"
                      style={{
                        width: `${(uploadProgress!.current / uploadProgress!.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Boutons submit */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 p-6 shadow-elev-4 sm:p-8">
                <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
                <div className="grain pointer-events-none absolute inset-0 opacity-15" />
                <div className="relative">
                  <h3 className="font-display text-display-sm text-white">
                    Prêt à envoyer votre demande ?
                  </h3>
                  <p className="mt-1 text-body-sm text-slate-300">
                    Un conseiller Nexus RCA revient vers vous sous 24 h. Besoin
                    d'une réponse plus rapide ? Choisissez le traitement
                    prioritaire.
                  </p>
                </div>

                <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => handleSubmit(false)}
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
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    variant="white"
                    size="lg"
                    className="flex-1"
                  >
                    {loading && form.traitement_prioritaire ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5 text-brand" />
                    )}
                    Traitement prioritaire
                  </Button>
                </div>
              </div>
            </div>
          </StepCard>
        )}
        </motion.div>
      </AnimatePresence>

      {/* ====== NAVIGATION PRÉCÉDENT / SUIVANT ====== */}
      {currentStep < 5 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink-muted transition hover:bg-surface-sunken hover:text-ink",
              currentStep === 1 && "invisible"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-3 text-body-sm font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
          >
            Continuer
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {currentStep === 5 && (
        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink-muted transition hover:bg-surface-sunken hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: StepId;
  onStepClick: (step: StepId) => void;
}) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Progress bar desktop */}
      <div className="relative hidden sm:block">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-line" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-brand transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
        <ol className="relative flex justify-between">
          {STEPS.map((step) => {
            const isComplete = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const Icon = step.icon;
            return (
              <li key={step.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isComplete &&
                      "border-brand bg-brand text-white shadow-elev-2",
                    isCurrent &&
                      "border-brand bg-surface-elevated text-brand shadow-glow-orange ring-4 ring-brand-subtle",
                    !isComplete &&
                      !isCurrent &&
                      "border-line-strong bg-surface-elevated text-ink-subtle hover:border-brand/40"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-caption font-semibold",
                    isCurrent ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {step.shortTitle}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Version mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-body-sm">
          <span className="font-semibold text-ink">
            Étape {currentStep} / {STEPS.length}
          </span>
          <span className="text-ink-muted">
            {STEPS.find((s) => s.id === currentStep)?.shortTitle}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  children,
  optional,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-display-sm text-ink">
          {title}
          {optional && (
            <span className="ml-2 text-body-sm font-normal text-ink-subtle">
              (optionnel)
            </span>
          )}
        </h2>
        {subtitle && <p className="mt-1 text-body-sm text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SummaryBlock({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-sunken p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-title text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-caption font-semibold text-brand hover:text-brand-hover"
        >
          Modifier
        </button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={cn("text-body-sm", multiline ? "block" : "flex gap-2")}>
      <span className="font-medium text-ink-muted">{label} :</span>
      <span
        className={cn("text-ink", multiline && "mt-1 block whitespace-pre-wrap")}
      >
        {value || <em className="text-ink-subtle">non renseigné</em>}
      </span>
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
        "flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 transition-colors",
        checked && "border-brand/40 bg-brand-subtle/40",
        disabled && "cursor-default opacity-80",
        error && "border-rose-400 bg-rose-50 dark:bg-rose-500/10"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-line-strong text-brand focus:ring-2 focus:ring-brand/30"
      />
      <span className="text-body-sm text-ink">{label}</span>
    </label>
  );
}

// ============================================================================
// HELPERS
// ============================================================================
function urgenceLabel(urgence: string): string {
  switch (urgence) {
    case "faible":
      return "Faible (plus d'un mois)";
    case "normale":
      return "Normale (quelques semaines)";
    case "elevee":
      return "Élevée (sous 2 semaines)";
    case "critique":
      return "Critique (urgent)";
    default:
      return urgence;
  }
}

function formatDetails(details: Record<string, unknown>): string {
  return Object.entries(details)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .map(([k, v]) => {
      const label = k
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `${label} : ${v}`;
    })
    .join("\n");
}
