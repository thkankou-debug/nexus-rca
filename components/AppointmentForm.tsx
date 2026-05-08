"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  User,
  Calendar,
  Sparkles,
  ClipboardCheck,
  Check,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES — INCHANGÉS (ne pas modifier)
// ============================================================================
type StepId = 1 | 2 | 3;

type Urgency = "normal" | "prioritaire" | "tres_urgent";

interface AppointmentData {
  service: string;
  appointmentObject: string;
  meetingType: string;
  duration: string;
  urgency: Urgency;

  preferredDate: string;
  preferredTime: string;
  alternativeAvailability: string;
  timezone: string;

  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  language: string;
  specificSubject: string;
  situation: string;
  hasExistingFile: "oui" | "non" | "";
  fileNumber: string;
  hasDocumentsReady: "oui" | "non" | "";

  consentAccuracy: boolean;
  consentContact: boolean;
  consentValidation: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// OPTIONS — INCHANGÉES
// ============================================================================
const SERVICES = [
  "Financement business & partenariat",
  "Visa & e-Visa",
  "Preparation TCF Canada",
  "Bourses d'etudes Canada",
  "Services administratifs",
  "Billets d'avion & hotels",
  "Change de devises",
  "Transfert d'argent",
  "Nexus IA / orientation",
];

const OBJECTS = [
  "Information generale",
  "Ouverture de dossier",
  "Suivi de dossier",
  "Correction / mise a jour",
  "Orientation",
  "Paiement / documents",
  "Autre",
];

const MEETING_TYPES = [
  { value: "whatsapp", label: "Appel WhatsApp" },
  { value: "phone", label: "Appel telephonique" },
  { value: "video", label: "Visioconference" },
  { value: "onsite", label: "Rendez-vous sur place" },
];

const DURATIONS = ["15 min", "30 min", "45 min", "60 min"];

const URGENCY_OPTIONS: Array<{ value: Urgency; label: string; desc: string }> = [
  { value: "normal", label: "Normal", desc: "Quelques jours" },
  { value: "prioritaire", label: "Prioritaire", desc: "Dans la journee" },
  { value: "tres_urgent", label: "Tres urgent", desc: "Dans les heures" },
];

const LANGUAGES = ["Francais", "Anglais", "Sango"];

const STEPS = [
  { id: 1 as StepId, title: "Type de rendez-vous", icon: Sparkles },
  { id: 2 as StepId, title: "Disponibilite", icon: Calendar },
  { id: 3 as StepId, title: "Coordonnees", icon: User },
];

const DEFAULT_DATA: AppointmentData = {
  service: "",
  appointmentObject: "",
  meetingType: "",
  duration: "30 min",
  urgency: "normal",
  preferredDate: "",
  preferredTime: "",
  alternativeAvailability: "",
  timezone: "Africa/Bangui (GMT+1)",
  fullName: "",
  email: "",
  phone: "",
  country: "Centrafrique",
  city: "",
  language: "Francais",
  specificSubject: "",
  situation: "",
  hasExistingFile: "",
  fileNumber: "",
  hasDocumentsReady: "",
  consentAccuracy: false,
  consentContact: false,
  consentValidation: false,
};

const STORAGE_KEY = "nexus_rdv_draft_v1";

// ============================================================================
// COMPOSANT PRINCIPAL — logique métier 100% préservée
// ============================================================================
export function AppointmentForm() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [data, setData] = useState<AppointmentData>(DEFAULT_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ referenceId: string } | null>(null);

  const hydratedRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<AppointmentData>;
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const update = <K extends keyof AppointmentData>(
    key: K,
    value: AppointmentData[K]
  ) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => ({ ...e, [key as string]: undefined }));
    }
  };

  const validateStep = (step: StepId): ValidationErrors => {
    const e: ValidationErrors = {};

    if (step === 1) {
      if (!data.service) e.service = "Selectionnez un service";
      if (!data.appointmentObject) e.appointmentObject = "Selectionnez un objet";
      if (!data.meetingType) e.meetingType = "Choisissez un type de rendez-vous";
    }

    if (step === 2) {
      if (!data.preferredDate) e.preferredDate = "Date souhaitee requise";
      if (!data.preferredTime) e.preferredTime = "Heure souhaitee requise";
    }

    if (step === 3) {
      if (!data.fullName.trim()) e.fullName = "Nom complet requis";
      if (!data.email.trim()) e.email = "Email requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        e.email = "Email invalide";
      if (!data.phone.trim()) e.phone = "Telephone requis";
      if (!data.country.trim()) e.country = "Pays requis";
      if (!data.city.trim()) e.city = "Ville requise";
      if (!data.specificSubject.trim())
        e.specificSubject = "Objet precis requis";
      if (!data.situation.trim()) e.situation = "Description requise";
      else if (data.situation.length < 20)
        e.situation = "Decrivez votre situation (min. 20 caracteres)";
      if (data.hasExistingFile === "oui" && !data.fileNumber.trim())
        e.fileNumber = "Numero de dossier requis";
    }

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

  // ─── Soumission Supabase — logique 100% préservée ────────────────────
  const handleSubmit = async () => {
    const allErrors: ValidationErrors = {};
    [1, 2, 3].forEach((s) => {
      Object.assign(allErrors, validateStep(s as StepId));
    });

    if (!data.consentAccuracy)
      allErrors.consentAccuracy =
        "Vous devez confirmer l'exactitude des informations";
    if (!data.consentContact)
      allErrors.consentContact =
        "Vous devez autoriser Nexus RCA a vous contacter";
    if (!data.consentValidation)
      allErrors.consentValidation =
        "Vous devez confirmer la comprehension du processus";

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (
        allErrors.service ||
        allErrors.appointmentObject ||
        allErrors.meetingType
      ) {
        setCurrentStep(1);
      } else if (allErrors.preferredDate || allErrors.preferredTime) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      return;
    }

    setLoading(true);
    setSubmitError(null);

    const payload = {
      service: data.service,
      appointment_object: data.appointmentObject,
      meeting_type: data.meetingType,
      duration: data.duration,
      urgency: data.urgency,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      alternative_availability: data.alternativeAvailability || null,
      timezone: data.timezone,
      full_name: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      country: data.country.trim(),
      city: data.city.trim(),
      language: data.language,
      specific_subject: data.specificSubject.trim(),
      situation: data.situation.trim(),
      has_existing_file: data.hasExistingFile || null,
      file_number:
        data.hasExistingFile === "oui" ? data.fileNumber.trim() : null,
      has_documents_ready: data.hasDocumentsReady || null,
      consent_accuracy: data.consentAccuracy,
      consent_contact: data.consentContact,
      consent_validation: data.consentValidation,
    };

    const { data: inserted, error } = await supabase
      .from("appointment_requests")
      .insert(payload)
      .select("reference")
      .single();

    setLoading(false);

    if (error) {
      console.error("Erreur Supabase :", error);
      setSubmitError(
        "Une erreur est survenue lors de l'envoi. Verifiez votre connexion et reessayez, ou contactez-nous sur WhatsApp."
      );
      return;
    }

    if (!inserted?.reference) {
      setSubmitError(
        "Demande envoyee mais reference non recuperee. Contactez-nous sur WhatsApp pour confirmation."
      );
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }

    setSuccess({ referenceId: inserted.reference });
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

        <div className="relative mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 ring-1 ring-emerald-400/40 shadow-[0_18px_40px_-12px_rgba(52,211,153,0.4)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300 backdrop-blur-md">
            <Check className="h-3 w-3" />
            Demande enregistrée
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Demande de rendez-vous reçue
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Merci <strong className="text-white">{data.fullName}</strong>. Votre
            demande a bien été enregistrée.
          </p>

          <div className="mt-8 rounded-2xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
              Numéro de référence
            </p>
            <p className="mt-2 break-all font-mono text-2xl font-bold leading-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-500 bg-clip-text text-transparent">
                {success.referenceId}
              </span>
            </p>
          </div>

          <div className="mt-8 space-y-3 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              Prochaines étapes
            </p>
            <ul className="space-y-2.5">
              {[
                "Un conseiller Nexus RCA examine votre demande sous 24 h",
                `Vous recevez une confirmation par ${
                  data.meetingType === "whatsapp"
                    ? "WhatsApp"
                    : data.meetingType === "phone"
                      ? "téléphone"
                      : data.meetingType === "video"
                        ? "email (lien visio)"
                        : "email"
                }`,
                "Après vérification de disponibilité, votre rendez-vous est confirmé",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 text-xs font-bold text-nexus-orange-300">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              <Home className="h-4 w-4" />
              Retour à l&rsquo;accueil
            </Link>
            <a
              href={whatsappLink(
                `Bonjour, je viens de demander un rendez-vous (référence ${success.referenceId}).`
              )}
              target="_blank"
              rel="noreferrer"
              className="group/wa relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(52,211,153,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/wa:left-[120%] group-hover/wa:opacity-100"
              />
              <MessageCircle className="h-4 w-4" />
              Confirmer sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // FORMULAIRE — wizard 3 étapes premium navy
  // ============================================================================
  return (
    <div
      ref={topRef}
      className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.20)] sm:p-8 lg:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
      />

      <div className="relative">
        <Stepper currentStep={currentStep} onStepClick={goToStep} />

        {/* ETAPE 1 */}
        {currentStep === 1 && (
          <div
            className="space-y-7"
            style={{ animation: "step-in 0.4s ease-out" }}
          >
            <StepTitle
              title="Type de rendez-vous"
              subtitle="Dites-nous de quoi il s'agit pour vous orienter vers le bon conseiller."
            />

            <FieldGroup
              label="Service concerné *"
              error={errors.service}
              dataField="service"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <OptionCard
                    key={s}
                    label={s}
                    selected={data.service === s}
                    onClick={() => update("service", s)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup
              label="Objet du rendez-vous *"
              error={errors.appointmentObject}
              dataField="appointmentObject"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {OBJECTS.map((o) => (
                  <OptionCard
                    key={o}
                    label={o}
                    selected={data.appointmentObject === o}
                    onClick={() => update("appointmentObject", o)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup
              label="Type de rendez-vous *"
              error={errors.meetingType}
              dataField="meetingType"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {MEETING_TYPES.map((m) => (
                  <OptionCard
                    key={m.value}
                    label={m.label}
                    selected={data.meetingType === m.value}
                    onClick={() => update("meetingType", m.value)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Durée souhaitée">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DURATIONS.map((d) => (
                  <OptionCard
                    key={d}
                    label={d}
                    selected={data.duration === d}
                    onClick={() => update("duration", d)}
                    compact
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Niveau d'urgence">
              <div className="grid gap-2 sm:grid-cols-3">
                {URGENCY_OPTIONS.map((u) => (
                  <UrgencyCard
                    key={u.value}
                    selected={data.urgency === u.value}
                    onClick={() => update("urgency", u.value)}
                    label={u.label}
                    desc={u.desc}
                    value={u.value}
                  />
                ))}
              </div>
            </FieldGroup>
          </div>
        )}

        {/* ETAPE 2 */}
        {currentStep === 2 && (
          <div
            className="space-y-7"
            style={{ animation: "step-in 0.4s ease-out" }}
          >
            <StepTitle
              title="Disponibilité"
              subtitle="Proposez une date et une heure. Nous confirmerons après vérification."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FieldGroup
                label="Date souhaitée *"
                error={errors.preferredDate}
                dataField="preferredDate"
              >
                <PremiumInput
                  type="date"
                  value={data.preferredDate}
                  onChange={(v) => update("preferredDate", v)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FieldGroup>

              <FieldGroup
                label="Heure souhaitée *"
                error={errors.preferredTime}
                dataField="preferredTime"
              >
                <PremiumInput
                  type="time"
                  value={data.preferredTime}
                  onChange={(v) => update("preferredTime", v)}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Autres disponibilités (optionnel)">
              <PremiumTextarea
                value={data.alternativeAvailability}
                onChange={(v) => update("alternativeAvailability", v)}
                rows={3}
                placeholder="Ex : aussi disponible mardi matin et jeudi en fin de journée"
              />
            </FieldGroup>

            <FieldGroup label="Pays / Fuseau horaire">
              <PremiumInput
                value={data.timezone}
                onChange={(v) => update("timezone", v)}
                placeholder="Ex : Africa/Bangui (GMT+1)"
              />
              <p className="mt-1.5 text-xs text-white/55">
                Indiquez votre fuseau si vous êtes à l&rsquo;étranger.
              </p>
            </FieldGroup>
          </div>
        )}

        {/* ETAPE 3 */}
        {currentStep === 3 && (
          <div
            className="space-y-7"
            style={{ animation: "step-in 0.4s ease-out" }}
          >
            <StepTitle
              title="Coordonnées et contexte"
              subtitle="Ces informations nous permettront de vous rappeler et de préparer l'échange."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FieldGroup
                label="Nom complet *"
                error={errors.fullName}
                dataField="fullName"
              >
                <PremiumInput
                  value={data.fullName}
                  onChange={(v) => update("fullName", v)}
                  placeholder="Jean Dupont"
                />
              </FieldGroup>
              <FieldGroup
                label="Email *"
                error={errors.email}
                dataField="email"
              >
                <PremiumInput
                  type="email"
                  value={data.email}
                  onChange={(v) => update("email", v)}
                  placeholder="vous@exemple.com"
                />
              </FieldGroup>
              <FieldGroup
                label="Téléphone / WhatsApp *"
                error={errors.phone}
                dataField="phone"
              >
                <PremiumInput
                  value={data.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="+236 ..."
                />
              </FieldGroup>
              <FieldGroup
                label="Pays de résidence *"
                error={errors.country}
                dataField="country"
              >
                <PremiumInput
                  value={data.country}
                  onChange={(v) => update("country", v)}
                />
              </FieldGroup>
              <FieldGroup
                label="Ville *"
                error={errors.city}
                dataField="city"
              >
                <PremiumInput
                  value={data.city}
                  onChange={(v) => update("city", v)}
                  placeholder="Bangui, Paris, Montréal..."
                />
              </FieldGroup>
              <FieldGroup label="Langue préférée">
                <PremiumSelect
                  value={data.language}
                  onChange={(v) => update("language", v)}
                  options={LANGUAGES}
                />
              </FieldGroup>
            </div>

            <FieldGroup
              label="Objet précis du rendez-vous *"
              error={errors.specificSubject}
              dataField="specificSubject"
            >
              <PremiumInput
                value={data.specificSubject}
                onChange={(v) => update("specificSubject", v)}
                placeholder="Ex : Étude de mon profil pour une admission Canada rentrée septembre"
              />
            </FieldGroup>

            <FieldGroup
              label="Décrivez brièvement votre situation *"
              error={errors.situation}
              dataField="situation"
            >
              <PremiumTextarea
                value={data.situation}
                onChange={(v) => update("situation", v)}
                rows={4}
                placeholder="Expliquez votre situation actuelle, vos objectifs et ce que vous attendez du rendez-vous..."
                hasError={!!errors.situation}
              />
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  data.situation.length >= 20
                    ? "text-emerald-300"
                    : "text-white/55"
                )}
              >
                {data.situation.length} / min. 20 caractères
              </p>
            </FieldGroup>

            <FieldGroup label="Avez-vous déjà un dossier chez Nexus RCA ?">
              <div className="grid gap-2 sm:grid-cols-2">
                <YesNoButton
                  label="Oui"
                  selected={data.hasExistingFile === "oui"}
                  onClick={() => update("hasExistingFile", "oui")}
                />
                <YesNoButton
                  label="Non"
                  selected={data.hasExistingFile === "non"}
                  onClick={() => update("hasExistingFile", "non")}
                />
              </div>
            </FieldGroup>

            {data.hasExistingFile === "oui" && (
              <FieldGroup
                label="Numéro de dossier *"
                error={errors.fileNumber}
                dataField="fileNumber"
              >
                <PremiumInput
                  value={data.fileNumber}
                  onChange={(v) => update("fileNumber", v)}
                  placeholder="NX-2026-XXXXXX"
                />
              </FieldGroup>
            )}

            <FieldGroup label="Avez-vous déjà des documents prêts ?">
              <div className="grid gap-2 sm:grid-cols-2">
                <YesNoButton
                  label="Oui, je les ai"
                  selected={data.hasDocumentsReady === "oui"}
                  onClick={() => update("hasDocumentsReady", "oui")}
                />
                <YesNoButton
                  label="Pas encore"
                  selected={data.hasDocumentsReady === "non"}
                  onClick={() => update("hasDocumentsReady", "non")}
                />
              </div>
              {data.hasDocumentsReady === "oui" && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-nexus-orange-400/30 bg-nexus-orange-500/10 p-3 text-xs text-nexus-orange-200 backdrop-blur-md">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-300" />
                  <span>
                    Parfait ! Vous pourrez les transmettre lors du rendez-vous
                    ou via notre formulaire de dossier complet.
                  </span>
                </p>
              )}
            </FieldGroup>

            {/* Récap */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-nexus-orange-300" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                  Récapitulatif de votre demande
                </h3>
              </div>
              <dl className="space-y-2 text-sm">
                <SummaryRow label="Service" value={data.service} />
                <SummaryRow label="Objet" value={data.appointmentObject} />
                <SummaryRow
                  label="Type"
                  value={
                    MEETING_TYPES.find((m) => m.value === data.meetingType)
                      ?.label || "—"
                  }
                />
                <SummaryRow label="Durée" value={data.duration} />
                <SummaryRow
                  label="Date et heure"
                  value={
                    data.preferredDate && data.preferredTime
                      ? `${data.preferredDate} à ${data.preferredTime}`
                      : "—"
                  }
                />
                <SummaryRow
                  label="Urgence"
                  value={
                    URGENCY_OPTIONS.find((u) => u.value === data.urgency)
                      ?.label || "—"
                  }
                />
              </dl>
            </div>

            <div className="space-y-2.5">
              <ConsentBox
                checked={data.consentAccuracy}
                onChange={(v) => update("consentAccuracy", v)}
                error={errors.consentAccuracy}
                label="Je confirme que les informations fournies sont exactes."
              />
              <ConsentBox
                checked={data.consentContact}
                onChange={(v) => update("consentContact", v)}
                error={errors.consentContact}
                label="J'autorise Nexus RCA à me contacter pour confirmer ce rendez-vous."
              />
              <ConsentBox
                checked={data.consentValidation}
                onChange={(v) => update("consentValidation", v)}
                error={errors.consentValidation}
                label="Je comprends que le rendez-vous n'est confirmé qu'après validation par Nexus RCA."
              />
            </div>

            {submitError && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 backdrop-blur-md">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <div>
                  <p className="font-semibold text-rose-200">
                    Erreur lors de l&rsquo;envoi
                  </p>
                  <p className="mt-0.5 text-sm text-rose-200/85">
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-7 py-4 text-base font-bold text-white shadow-[0_12px_32px_-10px_rgba(255,102,0,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:from-nexus-orange-600 hover:to-nexus-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Demander mon rendez-vous
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="text-center text-xs text-white/55 sm:text-left sm:flex-1 sm:px-6">
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
          <div className="mt-6 flex justify-start">
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
  );
}

// ============================================================================
// SOUS-COMPOSANTS — refonte visuelle premium navy
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
      {/* Desktop : stepper horizontal premium */}
      <div className="relative hidden sm:block">
        <div
          aria-hidden
          className="absolute inset-x-0 top-5 h-0.5 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute left-0 top-5 h-0.5 rounded-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 shadow-[0_0_18px_-2px_rgba(255,102,0,0.7)] transition-all duration-700 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
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
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile : indicator + barre */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
            Étape {currentStep} / {STEPS.length}
          </span>
          <span className="text-xs font-semibold text-white/85">
            {STEPS.find((s) => s.id === currentStep)?.title}
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

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function FieldGroup({
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

function OptionCard({
  label,
  selected,
  onClick,
  compact,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border text-left font-medium backdrop-blur-md transition-all duration-200",
        compact
          ? "px-3 py-2.5 text-sm text-center"
          : "p-3.5 text-sm",
        selected
          ? "border-nexus-orange-400/60 bg-nexus-orange-500/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(255,102,0,0.30)]"
          : "border-white/10 bg-white/[0.04] text-white/85 hover:border-white/20 hover:bg-white/[0.07]"
      )}
    >
      {label}
    </button>
  );
}

function UrgencyCard({
  selected,
  onClick,
  label,
  desc,
  value,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  desc: string;
  value: Urgency;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left backdrop-blur-md transition-all duration-300",
        selected
          ? value === "tres_urgent"
            ? "border-rose-400/60 bg-rose-500/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_36px_-16px_rgba(244,63,94,0.30)]"
            : value === "prioritaire"
              ? "border-amber-400/60 bg-amber-500/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_36px_-16px_rgba(251,191,36,0.30)]"
              : "border-emerald-400/60 bg-emerald-500/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_36px_-16px_rgba(52,211,153,0.30)]"
          : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
      )}
    >
      <p
        className={cn(
          "font-display text-sm font-bold leading-tight",
          selected ? "text-white" : "text-white/85"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xs",
          selected ? "text-white/85" : "text-white/55"
        )}
      >
        {desc}
      </p>
    </button>
  );
}

function YesNoButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-sm font-semibold backdrop-blur-md transition-all duration-200",
        selected
          ? "border-nexus-orange-400/60 bg-nexus-orange-500/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          : "border-white/10 bg-white/[0.04] text-white/85 hover:border-white/20 hover:bg-white/[0.07]"
      )}
    >
      {label}
    </button>
  );
}

function PremiumInput({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
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
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-nexus-blue-950/40 px-4 py-3 text-sm text-white backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20 [color-scheme:dark]"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-nexus-blue-950 text-white">
          {o}
        </option>
      ))}
    </select>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </dt>
      <dd className="flex-1 text-right text-sm text-white/85">
        {value && value !== "—" ? (
          value
        ) : (
          <em className="text-white/40">non renseigné</em>
        )}
      </dd>
    </div>
  );
}

function ConsentBox({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
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
              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
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
