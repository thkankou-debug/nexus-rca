"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Paperclip,
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
  Briefcase,
  Layers,
  Folder,
  PenLine,
  Sparkles,
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
// TYPE LOCAL — étend DemandeCompleteForm avec 4 textareas section 5 + source
// (les 4 textareas sont concaténées dans `description` au submit Supabase)
// ============================================================================
type DemandeCompleteFormWithSource = DemandeCompleteForm & {
  source?: string;
  // Section 05 — 4 zones structurées (concat dans description au submit)
  description_situation?: string;
  description_entrepris?: string;
  description_difficultes?: string;
  description_attendu?: string;
};

// ============================================================================
// SECTIONS — 6 sections numérotées style dossier administratif
// ============================================================================
type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const SECTIONS: Array<{
  id: StepId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 1,
    number: "01",
    title: "Informations personnelles",
    shortTitle: "Informations",
    description: "Renseignez les coordonnées du demandeur principal.",
    icon: User,
  },
  {
    id: 2,
    number: "02",
    title: "Nature de la demande",
    shortTitle: "Demande",
    description:
      "Sélectionnez le service concerné et précisez l'objet de votre demande.",
    icon: Briefcase,
  },
  {
    id: 3,
    number: "03",
    title: "Contexte du dossier",
    shortTitle: "Contexte",
    description:
      "Précisions complémentaires : urgence, dates, pays concernés, budget.",
    icon: Layers,
  },
  {
    id: 4,
    number: "04",
    title: "Documents justificatifs",
    shortTitle: "Documents",
    description:
      "Joignez les pièces utiles à votre dossier. Confidentialité garantie.",
    icon: Folder,
  },
  {
    id: 5,
    number: "05",
    title: "Description détaillée",
    shortTitle: "Description",
    description:
      "Quatre questions structurées pour permettre une analyse adaptée.",
    icon: PenLine,
  },
  {
    id: 6,
    number: "06",
    title: "Confirmation",
    shortTitle: "Confirmation",
    description:
      "Vérification du dossier et acceptation des conditions de traitement.",
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

const STORAGE_KEY = "nexus_demande_draft_v1";

function generatePreviewRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 8999);
  return `NX-DEM-${year}-${rand}`;
}

// Construit la description finale Supabase à partir des 4 zones structurées
function buildStructuredDescription(
  form: DemandeCompleteFormWithSource
): string {
  const blocks = [
    form.description_situation?.trim()
      ? `SITUATION ACTUELLE :\n${form.description_situation.trim()}`
      : null,
    form.description_entrepris?.trim()
      ? `DÉMARCHES DÉJÀ ENTREPRISES :\n${form.description_entrepris.trim()}`
      : null,
    form.description_difficultes?.trim()
      ? `DIFFICULTÉS RENCONTRÉES :\n${form.description_difficultes.trim()}`
      : null,
    form.description_attendu?.trim()
      ? `RÉSULTAT ATTENDU DE NEXUS RCA :\n${form.description_attendu.trim()}`
      : null,
  ].filter(Boolean);

  if (blocks.length === 0) return form.description || "";
  return blocks.join("\n\n");
}

// ============================================================================
// COMPOSANT PRINCIPAL — 6 sections, logique Supabase 100% préservée
// ============================================================================
export function DemandeFormComplete() {
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
          description_situation: f.description_situation || decoded,
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

  // ===== VALIDATION PAR SECTION (6 étapes) =====
  const validateStep = (step: StepId): ValidationErrors => {
    const e: ValidationErrors = {};

    if (step === 1) {
      // Section 01 — Informations personnelles
      if (!form.nom_complet.trim()) e.nom_complet = "Nom complet requis";
      if (!form.email.trim()) e.email = "Email requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Email invalide";
      if (!form.telephone.trim()) e.telephone = "Téléphone requis";
      if (!form.pays.trim()) e.pays = "Pays requis";
      if (!form.ville.trim()) e.ville = "Ville requise";
    }

    if (step === 2) {
      // Section 02 — Nature de la demande
      if (!form.service_type) e.service_type = "Veuillez sélectionner un service";
      if (!form.objet.trim()) e.objet = "Objet de la demande requis";
      else if (form.objet.length < 5)
        e.objet = "Objet trop court (min. 5 caractères)";
    }

    // Section 03 — Contexte : tous champs optionnels
    // Section 04 — Documents : optionnel

    if (step === 5) {
      // Section 05 — Description détaillée : situation et attendu requis
      if (!form.description_situation?.trim())
        e.description_situation = "Description de votre situation requise";
      else if ((form.description_situation || "").length < 20)
        e.description_situation =
          "Description trop courte (min. 20 caractères)";
      if (!form.description_attendu?.trim())
        e.description_attendu = "Précisez le résultat attendu";
    }

    // Section 06 — Consentements : validés dans handleSubmit
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
        toast.error(
          `Merci de compléter la section ${s.toString().padStart(2, "0")} avant de continuer`
        );
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
    if (currentStep < 6) {
      setCurrentStep((s) => (s + 1) as StepId);
    }
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as StepId);
    }
  };

  // ===== SOUMISSION (Supabase intacte — description construite à partir des 4 zones) =====
  const handleSubmit = async (prioritaire: boolean) => {
    // Construire la description finale à partir des 4 zones structurées
    const structuredDescription = buildStructuredDescription(form);
    const formForValidation = {
      ...form,
      description: structuredDescription || form.description,
    };

    const validation = validateDemandeForm(formForValidation);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Merci de corriger les champs indiqués");
      // Routing vers section concernée
      if (
        validation.nom_complet ||
        validation.email ||
        validation.telephone ||
        validation.pays ||
        validation.ville
      ) {
        setCurrentStep(1);
      } else if (validation.service_type || validation.objet) {
        setCurrentStep(2);
      } else if (validation.description) {
        setCurrentStep(5);
      } else {
        setCurrentStep(6);
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
        description: structuredDescription || form.description, // ← description structurée
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
          ? "Dossier prioritaire soumis. Un conseiller vous contactera rapidement."
          : "Dossier soumis avec succès. Réponse sous 24 h ouvrées."
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
  // ÉCRAN DE SUCCÈS
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
              ? " Votre dossier a été marqué comme prioritaire. Un conseiller vous contactera dans les heures qui suivent."
              : " Un conseiller Nexus RCA examine votre dossier et vous revient sous 24 h ouvrées."}
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
                `Bonjour, je viens de soumettre mon dossier NX-${success.demandeId.slice(0, 8).toUpperCase()} pour : ${serviceConfig?.label}`
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
  const currentSection = SECTIONS.find((s) => s.id === currentStep)!;

  // ============================================================================
  // FORMULAIRE — wizard 6 sections style dossier admin + sidebar
  // ============================================================================
  return (
    <div ref={topRef} className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ─── Colonne formulaire (8/12) ─── */}
      <div className="lg:col-span-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.20)]">
          {/* En-tête avec stepper compact */}
          <SectionStepper currentStep={currentStep} onStepClick={goToStep} />

          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Bandeau Nexus IA si applicable */}
            {form.source === "nexus_ia" && currentStep === 1 && (
              <div className="mb-6 rounded-xl border border-nexus-orange-400/30 bg-nexus-orange-500/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-nexus-orange-300" />
                  <p className="text-sm text-white">
                    <strong>Conversation Nexus IA reprise.</strong> Nous avons
                    pré-rempli votre situation, ajustez-la si besoin.
                  </p>
                </div>
              </div>
            )}

            {/* En-tête section : "01 — Titre" */}
            <SectionHeader
              number={currentSection.number}
              title={currentSection.title}
              description={currentSection.description}
            />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* ====== 01 — INFORMATIONS PERSONNELLES ====== */}
                {currentStep === 1 && (
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
                      label="Adresse email *"
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
                )}

                {/* ====== 02 — NATURE DE LA DEMANDE ====== */}
                {currentStep === 2 && (
                  <div className="space-y-7">
                    <FormField
                      label="Service concerné *"
                      error={errors.service_type}
                      dataField="service_type"
                    >
                      <ServiceVerticalList
                        services={SERVICE_TYPES}
                        value={form.service_type}
                        onChange={(v) => {
                          updateField("service_type", v as ServiceType);
                          setForm((f) => ({ ...f, details: {} }));
                        }}
                      />
                    </FormField>

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

                    {/* Champs dynamiques selon service */}
                    {form.service_type && serviceConfig?.hasDynamicFields && (
                      <div className="rounded-xl border border-white/10 bg-nexus-blue-950/40 p-5 backdrop-blur-md sm:p-6">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                          Précisions spécifiques au service
                        </p>
                        <div className="text-white">
                          <DynamicServiceFields
                            serviceType={form.service_type as ServiceType}
                            details={form.details}
                            onChange={updateDetail}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ====== 03 — CONTEXTE DU DOSSIER ====== */}
                {currentStep === 3 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Niveau d'urgence">
                      <PremiumSelect
                        value={form.urgence}
                        onChange={(v) =>
                          updateField("urgence", v as UrgenceLevel)
                        }
                        options={["faible", "normale", "elevee", "critique"]}
                        optionLabels={{
                          faible: "Faible (plus d'un mois)",
                          normale: "Normale (quelques semaines)",
                          elevee: "Élevée (sous 2 semaines)",
                          critique: "Critique (urgent)",
                        }}
                      />
                    </FormField>
                    <FormField label="Date souhaitée">
                      <PremiumInput
                        type="date"
                        value={form.date_souhaitee}
                        onChange={(v) => updateField("date_souhaitee", v)}
                      />
                    </FormField>
                    <FormField label="Pays concerné">
                      <PremiumInput
                        value={form.pays_concerne}
                        onChange={(v) => updateField("pays_concerne", v)}
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
                      <FormField label="Budget estimatif">
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
                )}

                {/* ====== 04 — DOCUMENTS JUSTIFICATIFS ====== */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    {form.service_type &&
                      DOCUMENTS_CHECKLIST[form.service_type] && (
                        <div className="rounded-xl border border-nexus-orange-400/25 bg-gradient-to-br from-nexus-orange-500/8 via-white/[0.03] to-transparent p-5 backdrop-blur-md">
                          <div className="mb-3 flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-nexus-orange-300" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                              Documents recommandés
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
                            Optionnel à ce stade. Les documents manquants
                            pourront être transmis ultérieurement.
                          </p>
                        </div>
                      )}

                    <div className="rounded-xl border border-white/10 bg-nexus-blue-950/40 p-5 backdrop-blur-md sm:p-6">
                      <p className="mb-4 text-xs leading-relaxed text-slate-400">
                        Formats acceptés : PDF, JPG, PNG, DOC, DOCX. Taille
                        max 10 Mo par fichier. Tous les fichiers sont stockés
                        de manière confidentielle.
                      </p>
                      <FileUploader
                        files={files}
                        onChange={setFiles}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* ====== 05 — DESCRIPTION DÉTAILLÉE ====== */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <DetailedField
                      number="1"
                      label="Expliquez votre situation actuelle *"
                      error={errors.description_situation}
                      dataField="description_situation"
                      value={form.description_situation || ""}
                      onChange={(v) => updateField("description_situation", v)}
                      placeholder="Décrivez le contexte général : votre projet, votre situation personnelle ou professionnelle, le besoin précis…"
                      rows={4}
                      minLength={20}
                    />
                    <DetailedField
                      number="2"
                      label="Démarches déjà entreprises"
                      value={form.description_entrepris || ""}
                      onChange={(v) => updateField("description_entrepris", v)}
                      placeholder="Décrivez ce que vous avez déjà fait ou tenté (recherches, contacts, démarches administratives, etc.)"
                      rows={3}
                    />
                    <DetailedField
                      number="3"
                      label="Difficultés rencontrées"
                      value={form.description_difficultes || ""}
                      onChange={(v) =>
                        updateField("description_difficultes", v)
                      }
                      placeholder="Quels obstacles ou points de blocage avez-vous rencontrés ?"
                      rows={3}
                    />
                    <DetailedField
                      number="4"
                      label="Résultat attendu de Nexus RCA *"
                      error={errors.description_attendu}
                      dataField="description_attendu"
                      value={form.description_attendu || ""}
                      onChange={(v) => updateField("description_attendu", v)}
                      placeholder="Que souhaitez-vous précisément obtenir grâce à notre accompagnement ?"
                      rows={3}
                    />
                  </div>
                )}

                {/* ====== 06 — CONFIRMATION ====== */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    {/* Récapitulatif */}
                    <SummaryBlock
                      title="Informations personnelles"
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
                      title="Nature de la demande"
                      onEdit={() => goToStep(2)}
                    >
                      <SummaryRow
                        label="Service"
                        value={serviceConfig?.label || "Non défini"}
                      />
                      <SummaryRow label="Objet" value={form.objet} />
                    </SummaryBlock>

                    <SummaryBlock
                      title="Contexte du dossier"
                      onEdit={() => goToStep(3)}
                    >
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
                    </SummaryBlock>

                    <SummaryBlock
                      title="Documents joints"
                      onEdit={() => goToStep(4)}
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

                    <SummaryBlock
                      title="Description détaillée"
                      onEdit={() => goToStep(5)}
                    >
                      <SummaryParagraph
                        label="Situation actuelle"
                        value={form.description_situation || ""}
                      />
                      <SummaryParagraph
                        label="Démarches déjà entreprises"
                        value={form.description_entrepris || ""}
                      />
                      <SummaryParagraph
                        label="Difficultés rencontrées"
                        value={form.description_difficultes || ""}
                      />
                      <SummaryParagraph
                        label="Résultat attendu"
                        value={form.description_attendu || ""}
                      />
                    </SummaryBlock>

                    {/* Consentements */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md sm:p-6">
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
                          label="J'accepte que Nexus RCA examine mon dossier et les documents transmis."
                        />
                        <ConsentCheckbox
                          checked={form.consentement_documents}
                          onChange={(v) =>
                            updateField("consentement_documents", v)
                          }
                          error={errors.consentement_documents}
                          label="J'autorise Nexus RCA à traiter les documents joints dans le cadre de ma demande."
                        />
                        <ConsentCheckbox
                          checked={true}
                          onChange={() => {}}
                          disabled
                          label="Je comprends que Nexus RCA fournit un service d'accompagnement et qu'aucun résultat n'est garanti."
                        />
                        <ConsentCheckbox
                          checked={form.consentement_recontact}
                          onChange={(v) =>
                            updateField("consentement_recontact", v)
                          }
                          label="J'accepte d'être recontacté(e) par Nexus RCA pour le suivi de ma demande."
                        />
                      </div>
                    </div>

                    {/* Upload progress */}
                    {isUploading && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
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

                    {/* Submit */}
                    <div className="rounded-xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/12 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl sm:p-7">
                      <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                        Prêt à soumettre votre dossier ?
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        Un conseiller examine votre dossier et vous revient
                        sous 24 h ouvrées. Pour une réponse plus rapide,
                        sélectionnez le traitement prioritaire.
                      </p>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleSubmit(false)}
                          disabled={loading}
                          className="group/cta relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-nexus-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                          Soumettre ma demande complète
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmit(true)}
                          disabled={loading}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 6 && (
              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-40",
                    currentStep === 1 && "invisible"
                  )}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Section précédente
                </button>
                <p className="text-center text-[11px] uppercase tracking-[0.16em] text-white/55 sm:flex-1 sm:px-6">
                  Section {currentStep.toString().padStart(2, "0")} / 06
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-nexus-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600"
                >
                  Section suivante
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </button>
              </div>
            )}

            {currentStep === 6 && (
              <div className="mt-8 flex justify-start border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Section précédente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile : toggle sidebar */}
        <button
          type="button"
          onClick={() => setShowSidebarMobile((v) => !v)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-md lg:hidden"
        >
          {showSidebarMobile ? "Masquer" : "Afficher"} le résumé du dossier
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ─── Sidebar (4/12 desktop) ─── */}
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
// SOUS-COMPOSANTS
// ============================================================================

function SectionStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: StepId;
  onStepClick: (s: StepId) => void;
}) {
  return (
    <div className="border-b border-white/10 px-6 py-4 sm:px-8">
      {/* Desktop : compteur sections cliquables */}
      <ol className="hidden items-center gap-1 sm:flex">
        {SECTIONS.map((section, i) => {
          const state =
            section.id < currentStep
              ? "done"
              : section.id === currentStep
                ? "active"
                : "todo";
          return (
            <li key={section.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onStepClick(section.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
                  state === "active"
                    ? "text-nexus-orange-300"
                    : state === "done"
                      ? "text-white/85 hover:text-white"
                      : "text-white/35"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] transition-all",
                    state === "active"
                      ? "bg-nexus-orange-500 text-white shadow-[0_0_18px_-2px_rgba(255,102,0,0.7)]"
                      : state === "done"
                        ? "bg-white/15 text-white"
                        : "bg-white/[0.04] text-white/35 ring-1 ring-white/10"
                  )}
                >
                  {state === "done" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    section.number
                  )}
                </span>
                <span className="hidden lg:inline">{section.shortTitle}</span>
              </button>
              {i < SECTIONS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-3 transition-colors",
                    section.id < currentStep
                      ? "bg-nexus-orange-400/60"
                      : "bg-white/10"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-nexus-orange-300">
            {SECTIONS.find((s) => s.id === currentStep)?.number} / 06
          </span>
          <span className="font-semibold text-white/85">
            {SECTIONS.find((s) => s.id === currentStep)?.shortTitle}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 shadow-[0_0_12px_-2px_rgba(255,102,0,0.6)] transition-all duration-500"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-3xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(251,146,60,0.4)] sm:text-4xl">
          {number}
        </span>
        <span className="text-xl font-thin text-nexus-orange-400/40 sm:text-2xl">
          —
        </span>
        <h2 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
        {description}
      </p>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-nexus-orange-400/40 via-white/10 to-transparent" />
    </div>
  );
}

function ServiceVerticalList({
  services,
  value,
  onChange,
}: {
  services: typeof SERVICE_TYPES;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-nexus-blue-950/40 backdrop-blur-md">
      <ul role="radiogroup" className="divide-y divide-white/5">
        {services.map((s) => {
          const selected = value === s.value;
          return (
            <li key={s.value}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(s.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-white/[0.03]",
                  selected && "bg-nexus-orange-500/10"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      selected ? "text-white" : "text-white/85"
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {s.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    selected
                      ? "border-nexus-orange-400 bg-nexus-orange-500 text-white"
                      : "border-white/20 bg-transparent"
                  )}
                >
                  {selected && <Check className="h-3 w-3" />}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
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

function DetailedField({
  number,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  dataField,
  minLength,
}: {
  number: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  dataField?: string;
  minLength?: number;
}) {
  return (
    <div data-field={dataField}>
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-mono text-xs font-bold text-nexus-orange-300">
          {number}.
        </span>
        <label className="text-sm font-semibold text-white/90">{label}</label>
      </div>
      <PremiumTextarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        hasError={!!error}
      />
      {minLength !== undefined && (
        <p
          className={cn(
            "mt-1.5 text-[11px]",
            value.length >= minLength
              ? "text-emerald-300"
              : "text-white/55"
          )}
        >
          {value.length} / min. {minLength} caractères
        </p>
      )}
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
      className="w-full rounded-lg border border-white/10 bg-nexus-blue-950/40 px-4 py-2.5 text-sm text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1 focus:ring-nexus-orange-500/30 [color-scheme:dark]"
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
        "w-full rounded-lg border bg-nexus-blue-950/40 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1",
        hasError
          ? "border-rose-400/40 focus:border-rose-400/70 focus:ring-rose-500/30"
          : "border-white/10 focus:border-nexus-orange-400/60 focus:ring-nexus-orange-500/30"
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
      className="w-full rounded-lg border border-white/10 bg-nexus-blue-950/40 px-4 py-2.5 text-sm text-white backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1 focus:ring-nexus-orange-500/30 [color-scheme:dark]"
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-nexus-orange-300 transition-colors hover:text-nexus-orange-200"
        >
          Modifier
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-white/5 pb-2 text-sm last:border-0 last:pb-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </span>
      <span className="flex-1 text-right text-white/85">
        {value || <em className="text-white/40">non renseigné</em>}
      </span>
    </div>
  );
}

function SummaryParagraph({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
        {value || <em className="text-white/40">non renseigné</em>}
      </p>
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
          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 backdrop-blur-md transition-colors",
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
// SIDEBAR — Résumé du dossier
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
  const priority =
    PRIORITY_MAP[form.urgence as UrgenceLevel] || PRIORITY_MAP.normale;

  const requiredDocs =
    form.service_type && DOCUMENTS_CHECKLIST[form.service_type]
      ? DOCUMENTS_CHECKLIST[form.service_type]
      : [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.20)]">
        {/* En-tête */}
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
            Résumé du dossier
          </p>
          <p className="mt-1 text-[11px] text-white/55">
            Mis à jour en temps réel
          </p>
        </div>

        {/* Référence */}
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-baseline gap-2">
            <Hash className="h-3 w-3 text-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              Référence prévisionnelle
            </span>
          </div>
          <p className="mt-1 break-all font-mono text-base font-bold text-white">
            <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-500 bg-clip-text text-transparent">
              {previewRef}
            </span>
          </p>
        </div>

        {/* Progression */}
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            Progression
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white">
            Section {currentStep.toString().padStart(2, "0")} sur 06
          </p>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 transition-all duration-500"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Service */}
        {serviceConfig && (
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              Service ciblé
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {serviceConfig.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {serviceConfig.description}
            </p>
          </div>
        )}

        {/* Priorité */}
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            Niveau de priorité
          </p>
          <span
            className={cn(
              "mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md",
              priority.tone
            )}
          >
            <Zap className="h-3 w-3" />
            {priority.label}
          </span>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3 w-3 text-nexus-orange-300" />
            {priority.estimate}
          </div>
        </div>

        {/* Documents */}
        {requiredDocs.length > 0 && (
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                Documents recommandés
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-white/70">
                {files.length} / {requiredDocs.length}
              </span>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[11px] leading-tight text-slate-300">
              {requiredDocs.slice(0, 4).map((doc, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-nexus-orange-400/60" />
                  <span>{doc}</span>
                </li>
              ))}
              {requiredDocs.length > 4 && (
                <li className="text-[10px] italic text-white/40">
                  + {requiredDocs.length - 4} autres…
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Délai */}
        <div className="bg-gradient-to-br from-nexus-orange-500/10 via-nexus-orange-500/5 to-transparent px-5 py-4">
          <div className="flex items-center gap-1.5">
            <Search className="h-3 w-3 text-nexus-orange-300" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
              Délai estimé
            </p>
          </div>
          <p className="mt-1.5 font-display text-base font-bold text-white">
            {priority.estimate}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Délai indicatif. Confirmé par le conseiller après prise en charge.
          </p>
        </div>
      </div>

      {/* Trust signals */}
      <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 ring-1 ring-white/5 backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
          Notre engagement
        </p>
        <TrustSignal
          icon={HeartHandshake}
          label="Conseiller dédié"
          desc="Un interlocuteur unique pour votre dossier."
        />
        <TrustSignal
          icon={Lock}
          label="Documents protégés"
          desc="Stockage chiffré, accès restreint."
        />
        <TrustSignal
          icon={Search}
          label="Analyse personnalisée"
          desc="Étude réelle de votre situation."
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
    <div className="flex items-start gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-nexus-orange-500/25 to-nexus-orange-700/15 ring-1 ring-nexus-orange-400/30">
        <Icon className="h-3 w-3 text-nexus-orange-300" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
          {desc}
        </p>
      </div>
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
