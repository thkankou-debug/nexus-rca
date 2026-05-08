"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Hash,
  HeartHandshake,
  Lock,
  Search,
  Clock,
  AlertCircle,
} from "lucide-react";
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
// TYPE LOCAL — étend DemandeCompleteForm avec source optionnel
// ============================================================================
type DemandeCompleteFormWithSource = DemandeCompleteForm & {
  source?: string;
};

// ============================================================================
// CONFIG ÉTAPES — 5 → 3 (regroupement Service+Détails+Documents = "Dossier")
// ============================================================================
type StepId = 1 | 2 | 3;

const STEPS: Array<{
  id: StepId;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 1, title: "Vos informations", shortTitle: "Identité", icon: User },
  { id: 2, title: "Votre dossier", shortTitle: "Dossier", icon: FileText },
  {
    id: 3,
    title: "Confirmation",
    shortTitle: "Confirmation",
    icon: ClipboardCheck,
  },
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

// Clé localStorage (inchangée)
const STORAGE_KEY = "nexus_demande_draft_v1";

// Génère une référence prévisionnelle pour la sidebar (display only)
function generatePreviewRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 8999);
  return `NX-DEM-${year}-${rand}`;
}

// ============================================================================
// COMPOSANT PRINCIPAL — logique 100% préservée, restyle premium navy
// ============================================================================
export function DemandeFormComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [form, setForm] = useState<DemandeCompleteFormWithSource>(
    DEFAULT_FORM_VALUES
  );
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
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const hydratedRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const previewRef = useMemo(() => generatePreviewRef(), []);

  // ===== HYDRATATION (inchangée) =====
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(
          draft
        ) as Partial<DemandeCompleteFormWithSource>;
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch {
      /* ignore */
    }

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

  // ===== SAUVEGARDE AUTO (inchangée) =====
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  // ===== SCROLL EN HAUT AU CHANGEMENT D'ÉTAPE =====
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

  // ===== VALIDATION ADAPTÉE 5→3 ÉTAPES =====
  const validateStep = (step: StepId): ValidationErrors => {
    const e: ValidationErrors = {};

    if (step === 1) {
      // Identité (= ancienne étape 1)
      if (!form.nom_complet.trim()) e.nom_complet = "Nom complet requis";
      if (!form.email.trim()) e.email = "Email requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Email invalide";
      if (!form.telephone.trim()) e.telephone = "Téléphone requis";
      if (!form.pays.trim()) e.pays = "Pays requis";
      if (!form.ville.trim()) e.ville = "Ville requise";
    }

    if (step === 2) {
      // Dossier = Service + Détails (Documents reste optionnel)
      if (!form.service_type) e.service_type = "Veuillez choisir un service";
      if (!form.objet.trim()) e.objet = "Objet requis";
      else if (form.objet.length < 5)
        e.objet = "Objet trop court (min. 5 caractères)";
      if (!form.description.trim()) e.description = "Description requise";
      else if (form.description.length < 20)
        e.description = "Description trop courte (min. 20 caractères)";
    }

    // Étape 3 (Confirmation) : consentements validés dans handleSubmit
    return e;
  };

  const goToStep = (step: StepId) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setErrors({});
      return;
    }
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
    if (currentStep < 3) {
      setCurrentStep((s) => (s + 1) as StepId);
    }
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as StepId);
    }
  };

  // ===== SOUMISSION (logique Supabase inchangée) =====
  const handleSubmit = async (prioritaire: boolean) => {
    const validation = validateDemandeForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Merci de corriger les champs indiqués");
      // Routing erreur vers étape concernée (adapté au mapping 5→3)
      if (
        validation.nom_complet ||
        validation.email ||
        validation.telephone ||
        validation.pays ||
        validation.ville
      ) {
        setCurrentStep(1);
      } else if (
        validation.service_type ||
        validation.objet ||
        validation.description
      ) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
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

  // ============================================================================
  // ÉCRAN DE SUCCÈS — premium navy
  // ============================================================================
  if (success) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] p-8 ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.20)] sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 ring-1 ring-emerald-400/40 shadow-[0_18px_40px_-12px_rgba(52,211,153,0.4)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300 backdrop-blur-md">
            <Check className="h-3 w-3" />
            Dossier enregistré
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Demande enregistrée
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Merci <strong className="text-white">{form.nom_complet}</strong>.
            {success.prioritaire
              ? " Votre demande a été marquée comme prioritaire — un conseiller vous contacte dans les heures qui suivent."
              : " Un conseiller Nexus RCA étudie votre dossier et vous revient sous 24 h."}
          </p>

          <div className="mt-8 rounded-2xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
              Référence dossier
            </p>
            <p className="mt-2 break-all font-mono text-2xl font-bold leading-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-500 bg-clip-text text-transparent">
                NX-{success.demandeId.slice(0, 8).toUpperCase()}
              </span>
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              Mon espace
            </Link>
            <a
              href={whatsappLink(
                `Bonjour, je viens de soumettre ma demande NX-${success.demandeId.slice(0, 8).toUpperCase()} pour : ${serviceConfig?.label}`
              )}
              target="_blank"
              rel="noreferrer"
              className="group/wa relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(52,211,153,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              <MessageCircle className="h-4 w-4" />
              Suivre sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isUploading = uploadProgress !== null;

  // ============================================================================
  // FORMULAIRE — wizard 3 étapes + sidebar dossier
  // ============================================================================
  return (
    <div ref={topRef} className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ─── Colonne formulaire (8/12) ─── */}
      <div className="lg:col-span-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.20)] sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
          />

          <div className="relative">
            {/* ====== STEPPER ====== */}
            <Stepper currentStep={currentStep} onStepClick={goToStep} />

            {/* Bandeau Nexus IA si applicable */}
            {form.source === "nexus_ia" && currentStep === 1 && (
              <div className="mb-6 rounded-2xl border border-nexus-orange-400/30 bg-nexus-orange-500/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-nexus-orange-300" />
                  <p className="text-sm text-white">
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
                className="space-y-7"
              >
                {/* ====== ÉTAPE 1 — IDENTITÉ ====== */}
                {currentStep === 1 && (
                  <div className="space-y-7">
                    <StepHeader
                      icon={User}
                      eyebrow="Étape 01"
                      title="Vos informations"
                      subtitle="Commençons par vous connaître. Tous les champs marqués d'un astérisque sont obligatoires."
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        label="Nom complet *"
                        error={errors.nom_complet}
                        dataField="nom_complet"
                      >
                        <PremiumInput
                          value={form.nom_complet}
                          onChange={(v) => updateField("nom_complet", v)}
                          placeholder="Jean Dupont"
                        />
                      </FormField>
                      <FormField
                        label="Email *"
                        error={errors.email}
                        dataField="email"
                      >
                        <PremiumInput
                          type="email"
                          value={form.email}
                          onChange={(v) => updateField("email", v)}
                          placeholder="vous@exemple.com"
                        />
                      </FormField>
                      <FormField
                        label="Téléphone / WhatsApp *"
                        error={errors.telephone}
                        dataField="telephone"
                      >
                        <PremiumInput
                          value={form.telephone}
                          onChange={(v) => updateField("telephone", v)}
                          placeholder="+236 ..."
                        />
                      </FormField>
                      <FormField
                        label="Pays de résidence *"
                        error={errors.pays}
                        dataField="pays"
                      >
                        <PremiumInput
                          value={form.pays}
                          onChange={(v) => updateField("pays", v)}
                        />
                      </FormField>
                      <FormField
                        label="Ville *"
                        error={errors.ville}
                        dataField="ville"
                      >
                        <PremiumInput
                          value={form.ville}
                          onChange={(v) => updateField("ville", v)}
                          placeholder="Bangui, Paris, Montréal…"
                        />
                      </FormField>
                      <FormField label="Langue préférée">
                        <PremiumSelect
                          value={form.langue_preferee}
                          onChange={(v) => updateField("langue_preferee", v)}
                          options={["Francais", "English", "Sango", "Arabe"]}
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* ====== ÉTAPE 2 — DOSSIER (Service + Détails + Documents) ====== */}
                {currentStep === 2 && (
                  <div className="space-y-10">
                    <StepHeader
                      icon={FileText}
                      eyebrow="Étape 02"
                      title="Votre dossier"
                      subtitle="Service souhaité, détails du besoin et documents éventuels. Tout ce qu'il faut pour que notre conseiller traite votre dossier efficacement."
                    />

                    {/* ─── Sous-section A : Service ─── */}
                    <SubSection
                      number="A"
                      title="Service demandé"
                      description="Choisissez la catégorie la plus proche de votre besoin."
                    >
                      <div data-field="service_type">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {SERVICE_TYPES.map((s) => {
                            const selected = form.service_type === s.value;
                            return (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => {
                                  updateField(
                                    "service_type",
                                    s.value as ServiceType
                                  );
                                  setForm((f) => ({ ...f, details: {} }));
                                }}
                                className={cn(
                                  "rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-200",
                                  selected
                                    ? "border-nexus-orange-400/60 bg-nexus-orange-500/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(255,102,0,0.30)]"
                                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl leading-none">
                                    {s.icon}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={cn(
                                        "font-display text-sm font-bold leading-tight",
                                        selected ? "text-white" : "text-white/85"
                                      )}
                                    >
                                      {s.label}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                                      {s.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {errors.service_type && (
                          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.service_type}
                          </p>
                        )}
                      </div>
                    </SubSection>

                    {/* ─── Sous-section B : Détails ─── */}
                    <SubSection
                      number="B"
                      title="Détails de votre demande"
                      description="Plus c'est clair, plus vite nous répondons."
                    >
                      <div className="space-y-5">
                        <FormField
                          label="Objet de la demande *"
                          error={errors.objet}
                          dataField="objet"
                        >
                          <PremiumInput
                            value={form.objet}
                            onChange={(v) => updateField("objet", v)}
                            placeholder="ex : Visa étudiant Canada pour rentrée septembre"
                          />
                        </FormField>

                        <FormField
                          label="Description détaillée *"
                          error={errors.description}
                          dataField="description"
                        >
                          <PremiumTextarea
                            value={form.description}
                            onChange={(v) => updateField("description", v)}
                            rows={5}
                            placeholder="Expliquez votre situation, vos objectifs, ce que vous avez déjà entrepris, et ce que vous attendez précisément de Nexus RCA…"
                            hasError={!!errors.description}
                          />
                          <p
                            className={cn(
                              "mt-1.5 text-xs",
                              form.description.length >= 20
                                ? "text-emerald-300"
                                : "text-white/55"
                            )}
                          >
                            {form.description.length} / min. 20 caractères
                          </p>
                        </FormField>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <FormField label="Niveau d'urgence">
                            <PremiumSelect
                              value={form.urgence}
                              onChange={(v) =>
                                updateField("urgence", v as UrgenceLevel)
                              }
                              options={[
                                "faible",
                                "normale",
                                "elevee",
                                "critique",
                              ]}
                              optionLabels={{
                                faible: "Faible (plus d'un mois)",
                                normale: "Normale (quelques semaines)",
                                elevee: "Élevée (sous 2 semaines)",
                                critique: "Critique (urgent)",
                              }}
                            />
                          </FormField>
                          <FormField label="Date souhaitée (si pertinent)">
                            <PremiumInput
                              type="date"
                              value={form.date_souhaitee}
                              onChange={(v) =>
                                updateField("date_souhaitee", v)
                              }
                            />
                          </FormField>
                          <FormField label="Pays concerné">
                            <PremiumInput
                              value={form.pays_concerne}
                              onChange={(v) =>
                                updateField("pays_concerne", v)
                              }
                              placeholder="ex : Canada, France…"
                            />
                          </FormField>
                          <FormField label="Destination (si voyage)">
                            <PremiumInput
                              value={form.destination}
                              onChange={(v) => updateField("destination", v)}
                              placeholder="ex : Montréal, Paris…"
                            />
                          </FormField>
                          <div className="sm:col-span-2">
                            <FormField label="Budget estimatif (si pertinent)">
                              <PremiumInput
                                value={form.budget_estimatif}
                                onChange={(v) =>
                                  updateField("budget_estimatif", v)
                                }
                                placeholder="ex : 500 000 FCFA, 1000 EUR, flexible…"
                              />
                            </FormField>
                          </div>
                        </div>

                        {/* Champs dynamiques selon service */}
                        {form.service_type &&
                          serviceConfig?.hasDynamicFields && (
                            <div className="rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-5 backdrop-blur-md sm:p-6">
                              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                                Précisions spécifiques au service
                              </p>
                              <div className="text-white">
                                <DynamicServiceFields
                                  serviceType={
                                    form.service_type as ServiceType
                                  }
                                  details={form.details}
                                  onChange={updateDetail}
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    </SubSection>

                    {/* ─── Sous-section C : Documents (optionnel) ─── */}
                    <SubSection
                      number="C"
                      title="Documents à joindre"
                      description="Optionnel. Joindre vos pièces justificatives accélère le traitement."
                      optional
                    >
                      {form.service_type &&
                        DOCUMENTS_CHECKLIST[form.service_type] && (
                          <div className="mb-5 rounded-2xl border border-nexus-orange-400/25 bg-gradient-to-br from-nexus-orange-500/8 via-white/[0.03] to-transparent p-5 backdrop-blur-md">
                            <div className="mb-3 flex items-center gap-2">
                              <ClipboardCheck className="h-4 w-4 text-nexus-orange-300" />
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                                Documents recommandés pour ce service
                              </p>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-200">
                              {DOCUMENTS_CHECKLIST[form.service_type].map(
                                (doc, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-300" />
                                    <span>{doc}</span>
                                  </li>
                                )
                              )}
                            </ul>
                            <p className="mt-3 text-xs text-slate-400">
                              Ne pas avoir tous ces documents n&rsquo;est pas
                              bloquant. Vous pourrez en ajouter plus tard.
                            </p>
                          </div>
                        )}

                      <div className="rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-5 backdrop-blur-md sm:p-6">
                        <p className="mb-4 text-xs leading-relaxed text-slate-400">
                          Formats acceptés : PDF, JPG, PNG, DOC, DOCX. Taille
                          max 10 Mo par fichier. Confidentialité garantie.
                        </p>
                        <FileUploader
                          files={files}
                          onChange={setFiles}
                          disabled={loading}
                        />
                      </div>
                    </SubSection>
                  </div>
                )}

                {/* ====== ÉTAPE 3 — CONFIRMATION ====== */}
                {currentStep === 3 && (
                  <div className="space-y-7">
                    <StepHeader
                      icon={ClipboardCheck}
                      eyebrow="Étape 03"
                      title="Récapitulatif & confirmation"
                      subtitle="Vérifiez vos informations avant envoi. Vous pouvez encore modifier en cliquant sur une étape."
                    />

                    <div className="space-y-5">
                      <SummaryBlock
                        title="Vos informations"
                        onEdit={() => goToStep(1)}
                      >
                        <SummaryRow label="Nom" value={form.nom_complet} />
                        <SummaryRow label="Email" value={form.email} />
                        <SummaryRow label="Téléphone" value={form.telephone} />
                        <SummaryRow
                          label="Pays / Ville"
                          value={`${form.pays} / ${form.ville}`}
                        />
                        <SummaryRow
                          label="Langue"
                          value={form.langue_preferee}
                        />
                      </SummaryBlock>

                      <SummaryBlock
                        title="Service demandé"
                        onEdit={() => goToStep(2)}
                      >
                        <SummaryRow
                          label="Service"
                          value={
                            serviceConfig
                              ? `${serviceConfig.icon} ${serviceConfig.label}`
                              : "Non défini"
                          }
                        />
                      </SummaryBlock>

                      <SummaryBlock title="Détails" onEdit={() => goToStep(2)}>
                        <SummaryRow label="Objet" value={form.objet} />
                        <SummaryRow
                          label="Description"
                          value={form.description}
                          multiline
                        />
                        <SummaryRow
                          label="Urgence"
                          value={urgenceLabel(form.urgence)}
                        />
                        {form.date_souhaitee && (
                          <SummaryRow
                            label="Date souhaitée"
                            value={form.date_souhaitee}
                          />
                        )}
                        {form.pays_concerne && (
                          <SummaryRow
                            label="Pays concerné"
                            value={form.pays_concerne}
                          />
                        )}
                        {form.destination && (
                          <SummaryRow
                            label="Destination"
                            value={form.destination}
                          />
                        )}
                        {form.budget_estimatif && (
                          <SummaryRow
                            label="Budget"
                            value={form.budget_estimatif}
                          />
                        )}
                        {form.details &&
                          Object.keys(form.details).length > 0 && (
                            <SummaryRow
                              label="Précisions"
                              value={formatDetails(form.details)}
                              multiline
                            />
                          )}
                      </SummaryBlock>

                      <SummaryBlock
                        title="Documents"
                        onEdit={() => goToStep(2)}
                      >
                        {files.length === 0 ? (
                          <p className="text-sm italic text-white/55">
                            Aucun document joint
                          </p>
                        ) : (
                          <ul className="space-y-1.5 text-sm text-slate-200">
                            {files.map((f, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2"
                              >
                                <Paperclip className="h-3.5 w-3.5 text-nexus-orange-300" />
                                {f.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </SummaryBlock>

                      {/* Consentements */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md sm:p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-nexus-orange-300" />
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                            Consentements
                          </h3>
                        </div>
                        <div className="space-y-2.5">
                          <ConsentCheckbox
                            checked={form.consentement_examen}
                            onChange={(v) =>
                              updateField("consentement_examen", v)
                            }
                            error={errors.consentement_examen}
                            label="J'accepte que Nexus RCA examine ma demande et mes documents."
                          />
                          <ConsentCheckbox
                            checked={form.consentement_documents}
                            onChange={(v) =>
                              updateField("consentement_documents", v)
                            }
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
                            onChange={(v) =>
                              updateField("consentement_recontact", v)
                            }
                            label="Je souhaite être recontacté(e) par Nexus RCA pour suivre cette demande."
                          />
                        </div>
                      </div>

                      {/* Upload progress */}
                      {isUploading && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                          <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <Loader2 className="h-4 w-4 animate-spin text-nexus-orange-300" />
                            Envoi des documents… {uploadProgress!.current} /{" "}
                            {uploadProgress!.total}
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 transition-all"
                              style={{
                                width: `${(uploadProgress!.current / uploadProgress!.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Boutons submit premium */}
                      <div className="relative overflow-hidden rounded-3xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.05] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/25 blur-3xl"
                        />
                        <div className="relative">
                          <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                            Prêt à envoyer votre demande ?
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                            Un conseiller Nexus RCA revient vers vous sous 24
                            h. Besoin d&rsquo;une réponse plus rapide ?
                            Choisissez le traitement prioritaire.
                          </p>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => handleSubmit(false)}
                              disabled={loading}
                              className="group/cta relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <span
                                aria-hidden
                                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                              />
                              {loading && !form.traitement_prioritaire ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ArrowRight className="h-4 w-4" />
                              )}
                              Soumettre ma demande
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmit(true)}
                              disabled={loading}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {loading && form.traitement_prioritaire ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4 text-nexus-orange-300" />
                              )}
                              Traitement prioritaire
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ====== NAVIGATION ====== */}
            {currentStep < 3 && (
              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-40",
                    currentStep === 1 && "invisible"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </button>
                <p className="text-center text-xs text-white/55 sm:flex-1 sm:px-6 sm:text-left">
                  Étape {currentStep} sur 3 ·{" "}
                  <span className="font-semibold text-white/80">
                    {STEPS.find((s) => s.id === currentStep)?.title}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-nexus-orange-500 px-7 py-3 text-sm font-bold text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  Continuer
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mt-8 flex justify-start border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile : toggle sidebar */}
        <button
          type="button"
          onClick={() => setShowSidebarMobile((v) => !v)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-md lg:hidden"
        >
          {showSidebarMobile ? "Masquer" : "Afficher"} le suivi du dossier
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ─── Sidebar (4/12 desktop, collapsible mobile) ─── */}
      <aside
        className={cn(
          "lg:col-span-4",
          showSidebarMobile ? "block" : "hidden lg:block"
        )}
      >
        <div className="lg:sticky lg:top-24">
          <DossierSidebar
            previewRef={previewRef}
            currentStep={currentStep}
            form={form}
            files={files}
            serviceConfig={serviceConfig}
          />
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// SIDEBAR DOSSIER — dashboard premium
// ============================================================================
function DossierSidebar({
  previewRef,
  currentStep,
  form,
  files,
  serviceConfig,
}: {
  previewRef: string;
  currentStep: StepId;
  form: DemandeCompleteFormWithSource;
  files: File[];
  serviceConfig: ReturnType<typeof getServiceTypeConfig> | undefined;
}) {
  // Statut workflow client : 4 phases visibles
  const STATUS_PHASES = [
    { id: 1, label: "À démarrer", desc: "Identité à compléter" },
    { id: 2, label: "En préparation", desc: "Dossier en cours" },
    { id: 3, label: "À envoyer", desc: "Confirmation finale" },
    { id: 4, label: "Envoyé", desc: "Conseiller dédié assigné" },
  ];
  // Mapping currentStep → phase active
  const activePhase =
    currentStep === 1 ? 1 : currentStep === 2 ? 2 : 3;

  // Priorité affichée selon urgence
  const PRIORITY_MAP: Record<
    UrgenceLevel,
    { label: string; tone: string; estimate: string }
  > = {
    faible: {
      label: "Standard",
      tone: "border-slate-400/30 bg-slate-500/10 text-slate-200",
      estimate: "Sous 48 h ouvrées",
    },
    normale: {
      label: "Normal",
      tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
      estimate: "Sous 24-48 h ouvrées",
    },
    elevee: {
      label: "Élevée",
      tone: "border-amber-400/40 bg-amber-500/10 text-amber-200",
      estimate: "Sous 24 h ouvrées",
    },
    critique: {
      label: "Critique",
      tone: "border-rose-400/40 bg-rose-500/10 text-rose-200",
      estimate: "Traitement prioritaire immédiat",
    },
  };
  const priority = PRIORITY_MAP[form.urgence as UrgenceLevel] || PRIORITY_MAP.normale;

  // Documents requis
  const requiredDocs =
    form.service_type && DOCUMENTS_CHECKLIST[form.service_type]
      ? DOCUMENTS_CHECKLIST[form.service_type]
      : [];

  return (
    <div className="space-y-4">
      {/* ─── Bloc principal "Dossier actif" ─── */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/5 to-nexus-blue-500/15 opacity-70 blur-3xl"
        />
        <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.30)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
          />

          {/* En-tête : référence */}
          <div className="relative border-b border-white/10 p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 ring-1 ring-white/15 shadow-[0_8px_22px_-8px_rgba(255,102,0,0.7)]">
                <FileText className="h-4 w-4 text-white" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Dossier actif
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <Hash className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                Référence prévisionnelle
              </span>
            </div>
            <p className="mt-1 break-all font-mono text-xl font-bold leading-tight text-white sm:text-2xl">
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-500 bg-clip-text text-transparent">
                {previewRef}
              </span>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              En préparation · étape {currentStep} / 3
            </div>
          </div>

          {/* Statut workflow */}
          <div className="relative border-b border-white/10 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              Suivi du dossier
            </p>
            <ol className="mt-4 space-y-3">
              {STATUS_PHASES.map((phase) => {
                const state =
                  phase.id < activePhase
                    ? "done"
                    : phase.id === activePhase
                      ? "active"
                      : "todo";
                return (
                  <li key={phase.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 transition-all duration-500",
                        state === "done"
                          ? "bg-nexus-orange-500 text-white ring-nexus-orange-400/40 shadow-[0_0_18px_-4px_rgba(255,102,0,0.6)]"
                          : state === "active"
                            ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-nexus-orange-400/60 shadow-[0_0_22px_-4px_rgba(255,102,0,0.8)]"
                            : "bg-white/[0.04] text-white/40 ring-white/10"
                      )}
                    >
                      {state === "done" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">
                          {phase.id}
                        </span>
                      )}
                      {state === "active" && (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-nexus-orange-500/40 animate-ping"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p
                        className={cn(
                          "text-xs font-bold uppercase tracking-[0.18em]",
                          state === "todo"
                            ? "text-white/40"
                            : "text-nexus-orange-300"
                        )}
                      >
                        {phase.label}
                      </p>
                      {state !== "todo" && (
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                          {phase.desc}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Niveau de priorité */}
          <div className="relative border-b border-white/10 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              Niveau de priorité
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md",
                  priority.tone
                )}
              >
                <Zap className="h-3 w-3" />
                {priority.label}
              </span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-nexus-orange-300" />
              {priority.estimate}
            </div>
          </div>

          {/* Service sélectionné */}
          {serviceConfig && (
            <div className="relative border-b border-white/10 p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                Service ciblé
              </p>
              <div className="mt-3 flex items-start gap-3">
                <span className="text-2xl leading-none">
                  {serviceConfig.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-white">
                    {serviceConfig.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {serviceConfig.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Documents requis */}
          {requiredDocs.length > 0 && (
            <div className="relative border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Documents recommandés
                </p>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-white/70">
                  {files.length} / {requiredDocs.length}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs leading-tight text-slate-300">
                {requiredDocs.slice(0, 5).map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-nexus-orange-400/60" />
                    <span>{doc}</span>
                  </li>
                ))}
                {requiredDocs.length > 5 && (
                  <li className="text-[11px] italic text-white/40">
                    + {requiredDocs.length - 5} autres…
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Estimation traitement */}
          <div className="relative bg-gradient-to-br from-nexus-orange-500/10 via-nexus-orange-500/5 to-transparent p-6">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-nexus-orange-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                Délai estimé de traitement
              </p>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-white sm:text-xl">
              {priority.estimate}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
              Délai indicatif. Confirmé par le conseiller après prise en charge
              du dossier.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Trust signals — service humain premium ─── */}
      <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
          Notre engagement
        </p>
        <TrustSignal
          icon={HeartHandshake}
          label="Conseiller dédié"
          desc="Votre dossier est traité par un interlocuteur unique."
        />
        <TrustSignal
          icon={Lock}
          label="Documents protégés"
          desc="Stockage chiffré, accès restreint à votre conseiller."
        />
        <TrustSignal
          icon={Search}
          label="Analyse personnalisée"
          desc="Étude réelle de votre situation, pas de réponse générique."
        />
      </div>
    </div>
  );
}

function TrustSignal({
  icon: Icon,
  label,
  desc,
}: {
  icon: typeof HeartHandshake;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-nexus-orange-500/25 to-nexus-orange-700/15 ring-1 ring-nexus-orange-400/30">
        <Icon className="h-3.5 w-3.5 text-nexus-orange-300" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS UI — premium navy/glass
// ============================================================================

function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: StepId;
  onStepClick: (s: StepId) => void;
}) {
  return (
    <div className="mb-8">
      {/* Desktop stepper */}
      <div className="relative hidden sm:block">
        <div
          aria-hidden
          className="absolute inset-x-0 top-5 h-0.5 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute left-0 top-5 h-0.5 rounded-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 shadow-[0_0_18px_-2px_rgba(255,102,0,0.7)] transition-all duration-700 ease-out"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />
        <ol className="relative grid grid-cols-3 gap-2">
          {STEPS.map((step) => {
            const state =
              step.id < currentStep
                ? "done"
                : step.id === currentStep
                  ? "active"
                  : "todo";
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full ring-2 transition-all duration-500 sm:h-12 sm:w-12",
                    state === "done"
                      ? "bg-nexus-orange-500 text-white ring-nexus-orange-400/40 shadow-[0_0_24px_-4px_rgba(255,102,0,0.6)]"
                      : state === "active"
                        ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-nexus-orange-400/70 shadow-[0_0_28px_-4px_rgba(255,102,0,0.9)]"
                        : "bg-nexus-blue-950 text-white/40 ring-white/10 backdrop-blur-md hover:ring-white/20"
                  )}
                >
                  {state === "done" ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {state === "active" && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-nexus-orange-500/40 animate-ping"
                    />
                  )}
                </button>
                <span
                  className={cn(
                    "mt-3 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs",
                    state === "todo" ? "text-white/40" : "text-white/85"
                  )}
                >
                  {step.shortTitle}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
            Étape {currentStep} / {STEPS.length}
          </span>
          <span className="text-xs font-semibold text-white/85">
            {STEPS.find((s) => s.id === currentStep)?.shortTitle}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 shadow-[0_0_12px_-2px_rgba(255,102,0,0.6)] transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: typeof FileText;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
          <Icon className="h-5 w-5 text-nexus-orange-300" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function SubSection({
  number,
  title,
  description,
  optional,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-nexus-blue-950/40 p-6 ring-1 ring-white/5 backdrop-blur-md sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="font-display text-2xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(251,146,60,0.5)] sm:text-3xl">
            {number}
          </span>
          <div>
            <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
              {title}
              {optional && (
                <span className="ml-2 text-xs font-normal text-white/45">
                  (optionnel)
                </span>
              )}
            </h3>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function FormField({
  label,
  children,
  error,
  dataField,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  dataField?: string;
}) {
  return (
    <div data-field={dataField}>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

function PremiumInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-nexus-blue-950/40 px-4 py-3 text-sm text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20 [color-scheme:dark]"
    />
  );
}

function PremiumTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hasError?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full rounded-xl border bg-nexus-blue-950/40 px-4 py-3 text-sm text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-2",
        hasError
          ? "border-rose-400/40 focus:border-rose-400/70 focus:ring-rose-500/20"
          : "border-white/10 focus:border-nexus-orange-400/60 focus:ring-nexus-orange-500/20"
      )}
    />
  );
}

function PremiumSelect({
  value,
  onChange,
  options,
  optionLabels,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  optionLabels?: Record<string, string>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-nexus-blue-950/40 px-4 py-3 text-sm text-white backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20 [color-scheme:dark]"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-nexus-blue-950 text-white">
          {optionLabels?.[o] || o}
        </option>
      ))}
    </select>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-nexus-orange-300 transition-colors hover:text-nexus-orange-200"
        >
          Modifier
        </button>
      </div>
      <div className="space-y-2">{children}</div>
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
    <div
      className={cn(
        "text-sm",
        multiline ? "block" : "flex items-baseline gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0"
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </span>
      <span
        className={cn(
          "text-white/85",
          multiline
            ? "mt-1 block whitespace-pre-wrap"
            : "flex-1 text-right"
        )}
      >
        {value || (
          <em className="text-white/40">non renseigné</em>
        )}
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
    <div>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 backdrop-blur-md transition-colors",
          checked
            ? "border-nexus-orange-400/40 bg-nexus-orange-500/10"
            : error
              ? "border-rose-400/40 bg-rose-500/10"
              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]",
          disabled && "cursor-default opacity-80"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/30 bg-transparent accent-nexus-orange-500"
        />
        <span
          className={cn(
            "text-xs leading-relaxed sm:text-sm",
            checked ? "text-white" : "text-slate-200"
          )}
        >
          {label}
        </span>
      </label>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
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
