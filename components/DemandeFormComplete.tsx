"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
// CONFIG DES ETAPES
// ============================================================================
type StepId = 1 | 2 | 3 | 4 | 5;

const STEPS: Array<{
  id: StepId;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 1, title: "Vos informations", shortTitle: "Identite", icon: User },
  { id: 2, title: "Service demande", shortTitle: "Service", icon: Sparkles },
  { id: 3, title: "Details de la demande", shortTitle: "Details", icon: FileText },
  { id: 4, title: "Documents", shortTitle: "Documents", icon: Paperclip },
  { id: 5, title: "Recapitulatif", shortTitle: "Envoi", icon: ClipboardCheck },
];

// ============================================================================
// CHECKLIST DOCUMENTS PAR SERVICE
// ============================================================================
const DOCUMENTS_CHECKLIST: Record<string, string[]> = {
  visa: [
    "Passeport (copie de toutes les pages utiles)",
    "Photos d identite aux normes",
    "Justificatifs financiers (releves bancaires 3-6 mois)",
    "Justificatif de domicile",
    "Documents lies au motif du voyage (invitation, reservation)",
    "CV recent",
  ],
  billet: [
    "Copie du passeport (nom exact, expiration)",
    "Dates et villes precises du voyage",
  ],
  hotel: [
    "Copie du passeport",
    "Dates precises du sejour",
  ],
  tcf: [
    "Piece d identite en cours de validite",
    "Resultats de tests precedents (si applicable)",
  ],
  etudes: [
    "Diplomes et releves de notes",
    "CV academique",
    "Lettres de recommandation",
    "Preuve de niveau linguistique (TCF, IELTS)",
    "Passeport",
    "Justificatifs financiers",
  ],
  financement: [
    "Presentation du projet (pitch deck si disponible)",
    "Piece d identite du porteur",
    "Registre de commerce (si societe existe)",
    "Etats financiers (si applicable)",
    "CV de l equipe",
    "Devis fournisseurs, lettres d intention clients",
  ],
  partenariat: [
    "Presentation de votre activite",
    "Piece d identite",
    "Documents legaux de la societe",
    "Liste des partenaires recherches",
  ],
  administratif: [
    "Document source a traduire ou traiter",
    "Version precedente (si applicable)",
    "Piece d identite",
    "CV existant (si pertinent)",
  ],
  change_transfert: [
    "Piece d identite pour gros montants",
    "Coordonnees du beneficiaire (si transfert)",
  ],
  assistance: [
    "Tout document utile a votre demande",
  ],
  autre: [
    "Tout document utile pour clarifier votre demande",
  ],
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

  const hydratedRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // ===== HYDRATATION : URL + localStorage + profil =====
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    // 1. Restauration depuis localStorage
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<DemandeCompleteForm>;
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
        } as DemandeCompleteForm));
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

  // ===== VALIDATION PAR ETAPE =====
  const validateStep = (step: StepId): ValidationErrors => {
    const e: ValidationErrors = {};

    if (step === 1) {
      if (!form.nom_complet.trim()) e.nom_complet = "Nom complet requis";
      if (!form.email.trim()) e.email = "Email requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Email invalide";
      if (!form.telephone.trim()) e.telephone = "Telephone requis";
      if (!form.pays.trim()) e.pays = "Pays requis";
      if (!form.ville.trim()) e.ville = "Ville requise";
    }

    if (step === 2) {
      if (!form.service_type) e.service_type = "Veuillez choisir un service";
    }

    if (step === 3) {
      if (!form.objet.trim()) e.objet = "Objet requis";
      else if (form.objet.length < 5)
        e.objet = "Objet trop court (min. 5 caracteres)";
      if (!form.description.trim()) e.description = "Description requise";
      else if (form.description.length < 20)
        e.description = "Description trop courte (min. 20 caracteres)";
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
        toast.error(`Merci de completer l etape ${s} avant de continuer`);
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
      toast.error("Merci de corriger les champs indiques");
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
      toast.error("Merci de corriger les champs indiques");
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
        source: "formulaire_complet",
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
          : "Demande soumise ! Reponse sous 24h."
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

  // ===== ECRAN DE SUCCES =====
  if (success) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-display text-4xl font-bold text-nexus-blue-950">
          Demande enregistree
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Merci <strong>{form.nom_complet}</strong>.
          {success.prioritaire
            ? " Votre demande a ete marquee comme prioritaire, un conseiller vous contacte dans les heures qui suivent."
            : " Un conseiller Nexus RCA etudie votre dossier et vous revient sous 24h."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Reference : NX-{success.demandeId.slice(0, 8).toUpperCase()}
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
        <div className="mb-6 rounded-2xl border border-nexus-orange-200 bg-gradient-to-r from-nexus-orange-50 to-nexus-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-nexus-orange-600" />
            <p className="text-sm text-nexus-blue-900">
              <strong>Conversation Nexus IA reprise.</strong> Nous avons prerempli la description, ajustez-la si besoin.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* ====== ETAPE 1 — IDENTITE ====== */}
        {currentStep === 1 && (
          <StepCard title="Vos informations" subtitle="Commencons par vous connaitre. Tous les champs marques d un asterisque sont obligatoires.">
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
                  label="Telephone / WhatsApp *"
                  value={form.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                  error={errors.telephone}
                  placeholder="+236 ..."
                />
              </div>
              <div data-field="pays">
                <Input
                  label="Pays de residence *"
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
                  placeholder="Bangui, Paris, Montreal..."
                />
              </div>
              <Select
                label="Langue preferee"
                value={form.langue_preferee}
                onChange={(e) => updateField("langue_preferee", e.target.value)}
              >
                <option value="Francais">Francais</option>
                <option value="English">English</option>
                <option value="Sango">Sango</option>
                <option value="Arabe">Arabe</option>
              </Select>
            </div>
          </StepCard>
        )}

        {/* ====== ETAPE 2 — SERVICE ====== */}
        {currentStep === 2 && (
          <StepCard title="Service demande" subtitle="Quel service Nexus RCA vous interesse ? Choisissez la categorie la plus proche de votre besoin.">
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
                <p className="mt-3 text-sm text-red-600">{errors.service_type}</p>
              )}
            </div>
          </StepCard>
        )}

        {/* ====== ETAPE 3 — DETAILS ====== */}
        {currentStep === 3 && (
          <StepCard title="Details de votre demande" subtitle="Precisez ce dont vous avez besoin. Plus c est clair, plus vite nous repondons.">
            <div className="space-y-5">
              <div data-field="objet">
                <Input
                  label="Objet de la demande *"
                  value={form.objet}
                  onChange={(e) => updateField("objet", e.target.value)}
                  error={errors.objet}
                  placeholder="ex : Visa etudiant Canada pour rentree septembre"
                />
              </div>
              <div data-field="description">
                <Textarea
                  label="Description detaillee *"
                  rows={5}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  error={errors.description}
                  placeholder="Expliquez votre situation, vos objectifs, ce que vous avez deja entrepris, et ce que vous attendez precisement de Nexus RCA..."
                />
                <p className="mt-1 text-xs text-slate-500">
                  {form.description.length} / min. 20 caracteres
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Niveau d urgence"
                  value={form.urgence}
                  onChange={(e) => updateField("urgence", e.target.value as UrgenceLevel)}
                >
                  <option value="faible">Faible (plus d un mois)</option>
                  <option value="normale">Normale (quelques semaines)</option>
                  <option value="elevee">Elevee (sous 2 semaines)</option>
                  <option value="critique">Critique (urgent)</option>
                </Select>
                <Input
                  label="Date souhaitee (si pertinent)"
                  type="date"
                  value={form.date_souhaitee}
                  onChange={(e) => updateField("date_souhaitee", e.target.value)}
                />
                <Input
                  label="Pays concerne"
                  value={form.pays_concerne}
                  onChange={(e) => updateField("pays_concerne", e.target.value)}
                  placeholder="ex : Canada, France..."
                />
                <Input
                  label="Destination (si voyage)"
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="ex : Montreal, Paris..."
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Budget estimatif (si pertinent)"
                    value={form.budget_estimatif}
                    onChange={(e) => updateField("budget_estimatif", e.target.value)}
                    placeholder="ex : 500 000 FCFA, 1000 EUR, flexible..."
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

        {/* ====== ETAPE 4 — DOCUMENTS ====== */}
        {currentStep === 4 && (
          <StepCard title="Documents a joindre" subtitle="Joignez les documents utiles a votre dossier. Cette etape est optionnelle mais accelere le traitement." optional>
            {form.service_type && DOCUMENTS_CHECKLIST[form.service_type] && (
              <div className="mb-6 rounded-2xl border border-nexus-blue-200 bg-nexus-blue-50/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-nexus-blue-700" />
                  <h3 className="font-semibold text-nexus-blue-950">
                    Documents recommandes pour ce service
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-nexus-blue-900">
                  {DOCUMENTS_CHECKLIST[form.service_type].map((doc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-nexus-blue-700">
                  Ne pas avoir tous ces documents n est pas bloquant. Vous pourrez en ajouter plus tard.
                </p>
              </div>
            )}

            <p className="mb-4 text-sm text-slate-600">
              Formats acceptes : PDF, JPG, PNG, DOC, DOCX. Taille max : 10 Mo par fichier. Tout est confidentiel.
            </p>
            <FileUploader files={files} onChange={setFiles} disabled={loading} />
          </StepCard>
        )}

        {/* ====== ETAPE 5 — RECAPITULATIF ====== */}
        {currentStep === 5 && (
          <StepCard title="Recapitulatif" subtitle="Verifiez vos informations avant envoi. Vous pouvez encore modifier en cliquant sur une etape.">
            <div className="space-y-6">
              <SummaryBlock title="Vos informations" onEdit={() => goToStep(1)}>
                <SummaryRow label="Nom complet" value={form.nom_complet} />
                <SummaryRow label="Email" value={form.email} />
                <SummaryRow label="Telephone" value={form.telephone} />
                <SummaryRow label="Pays / Ville" value={`${form.pays} / ${form.ville}`} />
                <SummaryRow label="Langue" value={form.langue_preferee} />
              </SummaryBlock>

              <SummaryBlock title="Service demande" onEdit={() => goToStep(2)}>
                <SummaryRow
                  label="Service"
                  value={serviceConfig ? `${serviceConfig.icon} ${serviceConfig.label}` : "Non defini"}
                />
              </SummaryBlock>

              <SummaryBlock title="Details" onEdit={() => goToStep(3)}>
                <SummaryRow label="Objet" value={form.objet} />
                <SummaryRow label="Description" value={form.description} multiline />
                <SummaryRow label="Urgence" value={urgenceLabel(form.urgence)} />
                {form.date_souhaitee && <SummaryRow label="Date souhaitee" value={form.date_souhaitee} />}
                {form.pays_concerne && <SummaryRow label="Pays concerne" value={form.pays_concerne} />}
                {form.destination && <SummaryRow label="Destination" value={form.destination} />}
                {form.budget_estimatif && <SummaryRow label="Budget" value={form.budget_estimatif} />}
                {form.details && Object.keys(form.details).length > 0 && (
                  <SummaryRow
                    label="Details specifiques"
                    value={formatDetails(form.details)}
                    multiline
                  />
                )}
              </SummaryBlock>

              <SummaryBlock title="Documents" onEdit={() => goToStep(4)}>
                {files.length === 0 ? (
                  <p className="text-sm italic text-slate-500">Aucun document joint</p>
                ) : (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-slate-400" />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </SummaryBlock>

              {/* Consentements */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-nexus-blue-700" />
                  <h3 className="font-semibold text-nexus-blue-950">
                    Consentements
                  </h3>
                </div>
                <div className="space-y-3">
                  <ConsentCheckbox
                    checked={form.consentement_examen}
                    onChange={(v) => updateField("consentement_examen", v)}
                    error={errors.consentement_examen}
                    label="J accepte que Nexus RCA examine ma demande et mes documents."
                  />
                  <ConsentCheckbox
                    checked={form.consentement_documents}
                    onChange={(v) => updateField("consentement_documents", v)}
                    error={errors.consentement_documents}
                    label="J autorise Nexus RCA a traiter les documents transmis dans le cadre de ma demande."
                  />
                  <ConsentCheckbox
                    checked={true}
                    onChange={() => {}}
                    disabled
                    label="Je comprends qu aucun resultat (obtention de visa, bourse, financement...) n est garanti et que Nexus RCA fournit un service d accompagnement."
                  />
                  <ConsentCheckbox
                    checked={form.consentement_recontact}
                    onChange={(v) => updateField("consentement_recontact", v)}
                    label="Je souhaite etre recontacte(e) par Nexus RCA pour suivre cette demande."
                  />
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="rounded-xl border border-nexus-blue-200 bg-nexus-blue-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-nexus-blue-900">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi des documents... {uploadProgress!.current} / {uploadProgress!.total}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-nexus-blue-200">
                    <div
                      className="h-full bg-nexus-orange-500 transition-all"
                      style={{
                        width: `${(uploadProgress!.current / uploadProgress!.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Boutons submit */}
              <div className="rounded-3xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 p-6 shadow-xl sm:p-8">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Pret a envoyer votre demande ?
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    Un conseiller Nexus RCA revient vers vous sous 24h. Besoin d une reponse plus rapide ? Choisissez le traitement prioritaire.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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
                      <Zap className="h-5 w-5 text-nexus-orange-600" />
                    )}
                    Traitement prioritaire
                  </Button>
                </div>
              </div>
            </div>
          </StepCard>
        )}
      </div>

      {/* ====== NAVIGATION PRECEDENT / SUIVANT ====== */}
      {currentStep < 5 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50",
              currentStep === 1 && "invisible"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Precedent
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
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
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Precedent
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
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-nexus-orange-500 transition-all duration-500"
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
                      "border-nexus-orange-500 bg-nexus-orange-500 text-white",
                    isCurrent &&
                      "border-nexus-orange-500 bg-white text-nexus-orange-600 ring-4 ring-nexus-orange-100",
                    !isComplete && !isCurrent &&
                      "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
                  )}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </button>
                <span
                  className={cn(
                    "mt-2 text-xs font-semibold",
                    isCurrent ? "text-nexus-blue-950" : "text-slate-500"
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
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-nexus-blue-950">
            Etape {currentStep} / {STEPS.length}
          </span>
          <span className="text-slate-500">
            {STEPS.find((s) => s.id === currentStep)?.shortTitle}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-nexus-orange-500 transition-all duration-500"
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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-nexus-blue-950">
          {title}
          {optional && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              (optionnel)
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        )}
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-nexus-blue-950">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
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
    <div className={cn("text-sm", multiline ? "block" : "flex gap-2")}>
      <span className="font-medium text-slate-500">{label} :</span>
      <span className={cn("text-slate-800", multiline && "mt-1 block whitespace-pre-wrap")}>
        {value || <em className="text-slate-400">non renseigne</em>}
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

// ============================================================================
// HELPERS
// ============================================================================
function urgenceLabel(urgence: string): string {
  switch (urgence) {
    case "faible":
      return "Faible (plus d un mois)";
    case "normale":
      return "Normale (quelques semaines)";
    case "elevee":
      return "Elevee (sous 2 semaines)";
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