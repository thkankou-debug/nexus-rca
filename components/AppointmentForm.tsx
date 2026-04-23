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

// ============================================================================
// TYPES
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
// OPTIONS
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
// COMPOSANT PRINCIPAL
// ============================================================================
export function AppointmentForm() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [data, setData] = useState<AppointmentData>(DEFAULT_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ referenceId: string } | null>(null);

  const hydratedRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

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
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const referenceId = `RDV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 900000 + 100000
    )}`;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }

    setLoading(false);
    setSuccess({ referenceId });
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-12">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
            Demande de rendez-vous recue
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Merci <strong>{data.fullName}</strong>. Votre demande a bien ete
            enregistree.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Numero de reference
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-nexus-blue-950">
              {success.referenceId}
            </p>
          </div>

          <div className="mt-8 space-y-3 text-left">
            <h3 className="font-semibold text-nexus-blue-950">
              Prochaines etapes :
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nexus-orange-100 text-xs font-bold text-nexus-orange-700">
                  1
                </div>
                <span>
                  Un conseiller Nexus RCA examine votre demande sous 24h
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nexus-orange-100 text-xs font-bold text-nexus-orange-700">
                  2
                </div>
                <span>
                  Vous recevez une confirmation par{" "}
                  {data.meetingType === "whatsapp"
                    ? "WhatsApp"
                    : data.meetingType === "phone"
                    ? "telephone"
                    : data.meetingType === "video"
                    ? "email (lien visio)"
                    : "email"}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nexus-orange-100 text-xs font-bold text-nexus-orange-700">
                  3
                </div>
                <span>
                  Apres verification de disponibilite, votre rendez-vous est
                  confirme
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-blue-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-nexus-blue-900"
            >
              <Home className="h-4 w-4" />
              Retour a l'accueil
            </Link>
            <a
              href={whatsappLink(
                `Bonjour, je viens de demander un rendez-vous (reference ${success.referenceId}).`
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              Confirmer sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <Stepper currentStep={currentStep} onStepClick={goToStep} />

      {/* ETAPE 1 */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <StepTitle
            title="Type de rendez-vous"
            subtitle="Dites-nous de quoi il s'agit pour vous orienter vers le bon conseiller."
          />

          <FieldGroup label="Service concerne *" error={errors.service} dataField="service">
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

          <FieldGroup label="Duree souhaitee">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
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
                <button
                  key={u.value}
                  type="button"
                  onClick={() => update("urgency", u.value)}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-left transition-all",
                    data.urgency === u.value
                      ? u.value === "tres_urgent"
                        ? "border-red-500 bg-red-50"
                        : u.value === "prioritaire"
                        ? "border-nexus-orange-500 bg-nexus-orange-50"
                        : "border-nexus-blue-500 bg-nexus-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <p className="font-semibold text-nexus-blue-950">{u.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{u.desc}</p>
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>
      )}

      {/* ETAPE 2 */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <StepTitle
            title="Disponibilite"
            subtitle="Proposez une date et une heure. Nous confirmerons apres verification."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup
              label="Date souhaitee *"
              error={errors.preferredDate}
              dataField="preferredDate"
            >
              <input
                type="date"
                value={data.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20"
              />
            </FieldGroup>

            <FieldGroup
              label="Heure souhaitee *"
              error={errors.preferredTime}
              dataField="preferredTime"
            >
              <input
                type="time"
                value={data.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20"
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Autres disponibilites (optionnel)">
            <textarea
              value={data.alternativeAvailability}
              onChange={(e) =>
                update("alternativeAvailability", e.target.value)
              }
              rows={3}
              placeholder="Ex: aussi disponible mardi matin et jeudi en fin de journee"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20"
            />
          </FieldGroup>

          <FieldGroup label="Pays / Fuseau horaire">
            <input
              type="text"
              value={data.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              placeholder="Ex: Africa/Bangui (GMT+1)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              Indiquez votre fuseau si vous etes a l'etranger.
            </p>
          </FieldGroup>
        </div>
      )}

      {/* ETAPE 3 */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <StepTitle
            title="Coordonnees et contexte"
            subtitle="Ces informations nous permettront de vous rappeler et de preparer l'echange."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup label="Nom complet *" error={errors.fullName} dataField="fullName">
              <TextInput
                value={data.fullName}
                onChange={(v) => update("fullName", v)}
                placeholder="Jean Dupont"
              />
            </FieldGroup>
            <FieldGroup label="Email *" error={errors.email} dataField="email">
              <TextInput
                type="email"
                value={data.email}
                onChange={(v) => update("email", v)}
                placeholder="vous@exemple.com"
              />
            </FieldGroup>
            <FieldGroup
              label="Telephone / WhatsApp *"
              error={errors.phone}
              dataField="phone"
            >
              <TextInput
                value={data.phone}
                onChange={(v) => update("phone", v)}
                placeholder="+236 ..."
              />
            </FieldGroup>
            <FieldGroup label="Pays de residence *" error={errors.country} dataField="country">
              <TextInput
                value={data.country}
                onChange={(v) => update("country", v)}
              />
            </FieldGroup>
            <FieldGroup label="Ville *" error={errors.city} dataField="city">
              <TextInput
                value={data.city}
                onChange={(v) => update("city", v)}
                placeholder="Bangui, Paris, Montreal..."
              />
            </FieldGroup>
            <FieldGroup label="Langue preferee">
              <select
                value={data.language}
                onChange={(e) => update("language", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div>

          <FieldGroup
            label="Objet precis du rendez-vous *"
            error={errors.specificSubject}
            dataField="specificSubject"
          >
            <TextInput
              value={data.specificSubject}
              onChange={(v) => update("specificSubject", v)}
              placeholder="Ex: Etude de mon profil pour une admission Canada rentree septembre"
            />
          </FieldGroup>

          <FieldGroup
            label="Decrivez brievement votre situation *"
            error={errors.situation}
            dataField="situation"
          >
            <textarea
              value={data.situation}
              onChange={(e) => update("situation", e.target.value)}
              rows={4}
              placeholder="Expliquez votre situation actuelle, vos objectifs et ce que vous attendez du rendez-vous..."
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2",
                errors.situation
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-nexus-orange-500 focus:ring-nexus-orange-500/20"
              )}
            />
            <p className="mt-1 text-xs text-slate-500">
              {data.situation.length} / min. 20 caracteres
            </p>
          </FieldGroup>

          <FieldGroup label="Avez-vous deja un dossier chez Nexus RCA ?">
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
              label="Numero de dossier *"
              error={errors.fileNumber}
              dataField="fileNumber"
            >
              <TextInput
                value={data.fileNumber}
                onChange={(v) => update("fileNumber", v)}
                placeholder="NX-2026-XXXXXX"
              />
            </FieldGroup>
          )}

          <FieldGroup label="Avez-vous deja des documents prets ?">
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
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-nexus-blue-50 p-3 text-xs text-nexus-blue-900">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-nexus-blue-700" />
                <span>
                  Parfait ! Vous pourrez les transmettre lors du rendez-vous ou
                  via notre formulaire de dossier complet.
                </span>
              </p>
            )}
          </FieldGroup>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-nexus-blue-700" />
              <h3 className="font-semibold text-nexus-blue-950">
                Recapitulatif de votre demande
              </h3>
            </div>
            <dl className="space-y-2 text-sm">
              <SummaryRow label="Service" value={data.service} />
              <SummaryRow label="Objet" value={data.appointmentObject} />
              <SummaryRow
                label="Type"
                value={
                  MEETING_TYPES.find((m) => m.value === data.meetingType)
                    ?.label || "-"
                }
              />
              <SummaryRow label="Duree" value={data.duration} />
              <SummaryRow
                label="Date et heure"
                value={
                  data.preferredDate && data.preferredTime
                    ? `${data.preferredDate} a ${data.preferredTime}`
                    : "-"
                }
              />
              <SummaryRow
                label="Urgence"
                value={
                  URGENCY_OPTIONS.find((u) => u.value === data.urgency)
                    ?.label || "-"
                }
              />
            </dl>
          </div>

          <div className="space-y-3">
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
              label="J'autorise Nexus RCA a me contacter pour confirmer ce rendez-vous."
            />
            <ConsentBox
              checked={data.consentValidation}
              onChange={(v) => update("consentValidation", v)}
              error={errors.consentValidation}
              label="Je comprends que le rendez-vous n'est confirme qu'apres validation par Nexus RCA."
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Envoi en cours...
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

      {currentStep < 3 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400",
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

      {currentStep === 3 && (
        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
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
  onStepClick: (s: StepId) => void;
}) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-8">
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
                    !isComplete &&
                      !isCurrent &&
                      "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
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
                    "mt-2 text-xs font-semibold",
                    isCurrent ? "text-nexus-blue-950" : "text-slate-500"
                  )}
                >
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-nexus-blue-950">
            Etape {currentStep} / {STEPS.length}
          </span>
          <span className="text-slate-500">
            {STEPS.find((s) => s.id === currentStep)?.title}
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

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-nexus-blue-950">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
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
      <label className="mb-2 block text-sm font-semibold text-nexus-blue-950">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
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
        "rounded-2xl border-2 text-left font-medium transition-all",
        compact ? "px-3 py-2.5 text-sm text-center" : "p-4 text-sm",
        selected
          ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-blue-950"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      )}
    >
      {label}
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
        "rounded-xl border-2 p-3 text-sm font-semibold transition-all",
        selected
          ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-blue-950"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}

function TextInput({
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
      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/20"
    />
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium text-slate-500">{label} :</dt>
      <dd className="text-slate-800">
        {value || <em className="text-slate-400">non renseigne</em>}
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
          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
          checked
            ? "border-nexus-orange-300 bg-nexus-orange-50/50"
            : "border-slate-200",
          error && "border-red-400 bg-red-50"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-nexus-orange-600 focus:ring-2 focus:ring-nexus-orange-500/30"
        />
        <span className="text-sm text-nexus-blue-950">{label}</span>
      </label>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
