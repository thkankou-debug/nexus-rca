"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileCheck2,
  FileSignature,
  FileText,
  Globe2,
  Loader2,
  Lock,
  MessageCircle,
  Paperclip,
  Plane,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { DESTINATIONS, TYPES_VISA_OPTIONS } from "@/lib/visa-form";
import { cn } from "@/lib/utils";

// ─── VisaExpressForm ────────────────────────────────────────────────────────
// Wizard multi-step premium cabinet exécutif (4 étapes).
// 1. Identité · 2. Projet visa · 3. Pièces & informations · 4. Confirmation.
// Récap dynamique sticky (desktop) + accordéon (mobile).
// Compatible API existante /api/visa/express : payload final concatène les
// nouveaux champs dans le champ "notes" structuré.

// ─── Constantes & options ───────────────────────────────────────────────────

const URGENCE_OPTIONS = [
  { value: "normal", label: "Normal", sub: "Sous 3 jours" },
  { value: "urgent", label: "Urgent", sub: "Sous 48 h" },
  { value: "critique", label: "Critique", sub: "Sous 24 h" },
] as const;

type Urgence = (typeof URGENCE_OPTIONS)[number]["value"];

const PASSEPORT_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
  { value: "en_cours", label: "En cours d'obtention" },
] as const;

type PasseportStatus = "" | (typeof PASSEPORT_OPTIONS)[number]["value"];

const RESERVATION_OPTIONS = [
  { value: "deja", label: "Déjà réservé" },
  { value: "nexus", label: "À organiser via Nexus" },
  { value: "non_decide", label: "Pas encore décidé" },
] as const;

type ReservationStatus = "" | (typeof RESERVATION_OPTIONS)[number]["value"];

const INVITATION_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
  { value: "na", label: "Pas applicable" },
] as const;

type InvitationStatus = "" | (typeof INVITATION_OPTIONS)[number]["value"];

interface DocumentOption {
  value: string;
  label: string;
}

const DOCUMENTS_DISPONIBLES: DocumentOption[] = [
  { value: "acte_naissance", label: "Acte de naissance" },
  { value: "revenus", label: "Justificatifs de revenus (3 derniers bulletins / avis d'imposition)" },
  { value: "hebergement", label: "Justificatif d'hébergement (attestation, réservation hôtel)" },
  { value: "invitation", label: "Lettre d'invitation" },
  { value: "etudes", label: "Justificatif d'études (attestation scolarité, diplôme)" },
  { value: "vol", label: "Réservation de vol" },
  { value: "assurance", label: "Assurance voyage" },
  { value: "cni", label: "Carte d'identité" },
];

const STEPS = [
  { id: 1, label: "Identité", icon: User },
  { id: 2, label: "Projet", icon: Plane },
  { id: 3, label: "Pièces", icon: FileCheck2 },
  { id: 4, label: "Confirmation", icon: ClipboardCheck },
] as const;

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXT = ".pdf,.jpg,.jpeg,.png";

// ─── Types ──────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface FormState {
  // Step 1
  nom: string;
  email: string;
  whatsapp: string;
  pays: string;
  // Step 2
  destination: string;
  typeVisa: string;
  dateDepart: string;
  dateRetour: string;
  motif: string;
  // Step 3
  passeportDispo: PasseportStatus;
  numPasseport: string;
  expPasseport: string;
  documentsDispo: string[];
  reservationVolHotel: ReservationStatus;
  lettreInvitation: InvitationStatus;
  // Step 4
  commentaires: string;
  urgence: Urgence;
  acceptation: boolean;
}

const INITIAL_STATE: FormState = {
  nom: "",
  email: "",
  whatsapp: "",
  pays: "",
  destination: "",
  typeVisa: "",
  dateDepart: "",
  dateRetour: "",
  motif: "",
  passeportDispo: "",
  numPasseport: "",
  expPasseport: "",
  documentsDispo: [],
  reservationVolHotel: "",
  lettreInvitation: "",
  commentaires: "",
  urgence: "normal",
  acceptation: false,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function destinationLabel(value: string): string {
  const d = DESTINATIONS.find((x) => x.label === value);
  return d ? `${d.emoji} ${d.label}` : value;
}

function reservationLabel(v: ReservationStatus): string {
  return RESERVATION_OPTIONS.find((o) => o.value === v)?.label || "—";
}

function invitationLabel(v: InvitationStatus): string {
  return INVITATION_OPTIONS.find((o) => o.value === v)?.label || "—";
}

function passeportLabel(v: PasseportStatus): string {
  return PASSEPORT_OPTIONS.find((o) => o.value === v)?.label || "—";
}

function documentsLabels(values: string[]): string[] {
  return values
    .map((v) => DOCUMENTS_DISPONIBLES.find((d) => d.value === v)?.label || v);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function buildNotesPayload(form: FormState, files: File[]): string {
  const lines: string[] = [];
  lines.push(`Motif du voyage : ${form.motif || "—"}`);
  lines.push(
    `Dates : ${formatDate(form.dateDepart) || "—"}${
      form.dateRetour ? ` → ${formatDate(form.dateRetour)}` : ""
    }`
  );

  let passeportLine = `Passeport : ${passeportLabel(form.passeportDispo)}`;
  if (form.passeportDispo === "oui") {
    const details: string[] = [];
    if (form.numPasseport) details.push(`n° ${form.numPasseport}`);
    if (form.expPasseport) details.push(`expire ${formatDate(form.expPasseport)}`);
    if (details.length) passeportLine += ` (${details.join(", ")})`;
  }
  lines.push(passeportLine);

  lines.push(
    `Documents disponibles : ${
      form.documentsDispo.length
        ? documentsLabels(form.documentsDispo).join(", ")
        : "Aucun précisé"
    }`
  );
  lines.push(`Réservation vol/hôtel : ${reservationLabel(form.reservationVolHotel)}`);
  lines.push(`Lettre d'invitation : ${invitationLabel(form.lettreInvitation)}`);

  if (files.length) {
    lines.push(`Pièces jointes transmises : ${files.length} fichier(s)`);
  }

  if (form.commentaires.trim()) {
    lines.push("");
    lines.push("Commentaires :");
    lines.push(form.commentaires.trim());
  }

  return lines.join("\n");
}

// ─── Validation par étape ───────────────────────────────────────────────────

function validateStep(step: Step, form: FormState): string | null {
  if (step === 1) {
    if (!form.nom.trim() || form.nom.trim().length < 3)
      return "Nom complet requis (3 caractères min.)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "E-mail invalide";
    if (!form.whatsapp.trim() || form.whatsapp.trim().length < 6)
      return "Numéro WhatsApp requis";
    if (!form.pays.trim()) return "Pays de résidence requis";
    return null;
  }
  if (step === 2) {
    if (!form.destination) return "Destination requise";
    if (!form.typeVisa) return "Type de visa requis";
    if (!form.dateDepart) return "Date de départ requise";
    if (!form.motif.trim() || form.motif.trim().length < 10)
      return "Motif détaillé requis (10 caractères min.)";
    return null;
  }
  if (step === 3) {
    if (!form.passeportDispo)
      return "Indiquez si vous avez un passeport";
    if (!form.reservationVolHotel)
      return "Indiquez le statut de votre réservation vol/hôtel";
    if (!form.lettreInvitation)
      return "Indiquez le statut de la lettre d'invitation";
    return null;
  }
  if (step === 4) {
    if (!form.acceptation)
      return "Vous devez accepter les conditions pour soumettre";
    return null;
  }
  return null;
}

// ─── Composant principal ────────────────────────────────────────────────────

export function VisaExpressForm() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Helpers state ────────────────────────────────────────────────────────

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDocument = (val: string) => {
    setForm((prev) => ({
      ...prev,
      documentsDispo: prev.documentsDispo.includes(val)
        ? prev.documentsDispo.filter((v) => v !== val)
        : [...prev.documentsDispo, val],
    }));
  };

  const handleAddFiles = (input: FileList | null) => {
    if (!input) return;
    const incoming = Array.from(input);
    const valid: File[] = [];
    for (const f of incoming) {
      if (!ALLOWED_MIME.includes(f.type)) {
        toast.error(`${f.name} : format non accepté`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} dépasse 5 MB`);
        continue;
      }
      valid.push(f);
    }
    setFiles((prev) => {
      const merged = [...prev, ...valid];
      if (merged.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} fichiers`);
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    const err = validateStep(step, form);
    if (err) {
      toast.error(err);
      setError(err);
      return;
    }
    setError(null);
    if (step < 4) setStep(((step + 1) as Step));
  };

  const goPrev = () => {
    setError(null);
    if (step > 1) setStep(((step - 1) as Step));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validation finale (toutes les étapes)
    for (const s of [1, 2, 3, 4] as Step[]) {
      const err = validateStep(s, form);
      if (err) {
        setStep(s);
        setError(err);
        toast.error(err);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("nom_complet", form.nom);
    fd.append("email", form.email);
    fd.append("whatsapp", form.whatsapp);
    fd.append("pays_destination", form.destination);
    fd.append("type_visa", form.typeVisa);
    fd.append("urgence", form.urgence);
    fd.append("notes", buildNotesPayload(form, files));
    for (const f of files) fd.append("documents", f);

    try {
      const res = await fetch("/api/visa/express", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        reference?: string;
        error?: string;
      };
      if (!res.ok || !data.success) {
        const msg = data.error || "Échec de l'envoi";
        setError(msg);
        toast.error(msg);
        return;
      }
      setSuccess(data.reference || "—");
      toast.success("Demande reçue — un expert revient vers vous");
    } catch (err) {
      console.error("[VISA_EXPRESS_FORM]", err);
      const msg = "Erreur réseau. Réessayez ou contactez-nous via WhatsApp.";
      setError(msg);
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Récap completion (pour affichage progression "▶ Section") ────────────

  const completion = useMemo(
    () => ({
      identite: !validateStep(1, form),
      projet: !validateStep(2, form),
      pieces: !validateStep(3, form),
      confirmation: form.acceptation,
    }),
    [form]
  );

  // ─── Etat succès ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-nexus-orange-200/70 bg-gradient-to-br from-white via-nexus-orange-50/40 to-white p-10 text-center shadow-[0_24px_48px_-16px_rgba(255,102,0,0.18)] sm:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-[100px]"
        />
        <div className="relative">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
            Dossier enregistré
          </p>
          <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-nexus-blue-950 sm:text-3xl">
            Demande reçue.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Un expert vous contactera sous 48–72 h ouvrées.
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Référence
            </span>
            <span className="font-mono text-sm font-bold text-nexus-orange-600">
              {success}
            </span>
          </div>
          <a
            href="https://wa.me/23673269692"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" />
            Nous joindre sur WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ─── Render principal — wizard 2 colonnes ─────────────────────────────────

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ─── Colonne gauche — wizard ─────────────────────────────────────── */}
      <div className="lg:col-span-7">
        {/* Récap accordéon mobile */}
        <div className="mb-6 lg:hidden">
          <button
            type="button"
            onClick={() => setRecapOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-nexus-orange-500/20 bg-white/[0.04] px-4 py-3 text-left text-white backdrop-blur-md ring-1 ring-white/5"
          >
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-nexus-orange-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
                Votre dossier
              </span>
            </span>
            {recapOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-300" />
            )}
          </button>
          {recapOpen && (
            <div className="mt-3">
              <RecapCard form={form} files={files} completion={completion} />
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/[0.95] p-6 shadow-[0_24px_48px_-16px_rgba(12,28,64,0.20)] ring-1 ring-slate-100/80 backdrop-blur-xl sm:p-10"
        >
          {/* Bordure éclairée orange en haut */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/50 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />

          {/* ─── Header ─────────────────────────────────────────────────── */}
          <div className="relative mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-900 text-nexus-orange-400 shadow-[0_10px_28px_-10px_rgba(12,28,64,0.6)] ring-1 ring-white/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/20 bg-nexus-orange-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-500" />
                  </span>
                  Étape {step} sur 4
                </span>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-2xl">
                  {STEPS[step - 1].label}
                </h3>
              </div>
            </div>
          </div>

          {/* ─── Stepper ────────────────────────────────────────────────── */}
          <Stepper currentStep={step} />

          {/* ─── Erreur ─────────────────────────────────────────────────── */}
          {error && (
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Champ manquant
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-rose-900">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  aria-label="Fermer"
                  className="rounded-md p-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Contenu d'étape avec animation ─────────────────────────── */}
          <div key={step} className="relative mt-8 animate-step-in">
            {step === 1 && <StepIdentite form={form} update={update} />}
            {step === 2 && <StepProjet form={form} update={update} />}
            {step === 3 && (
              <StepPieces
                form={form}
                update={update}
                toggleDocument={toggleDocument}
              />
            )}
            {step === 4 && (
              <StepConfirmation
                form={form}
                update={update}
                files={files}
                fileInputRef={fileInputRef}
                handleAddFiles={handleAddFiles}
                removeFile={removeFile}
              />
            )}
          </div>

          {/* ─── Boutons navigation ─────────────────────────────────────── */}
          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={goPrev}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-nexus-blue-950 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" />
                Étape précédente
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                Continuer
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Transmission en cours…
                  </>
                ) : (
                  <>
                    Soumettre mon dossier
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {submitting && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-500" />
              </span>
              Chiffrement et transmission sécurisée…
            </div>
          )}
        </form>
      </div>

      {/* ─── Colonne droite — récap sticky desktop ───────────────────────── */}
      <aside className="hidden lg:col-span-5 lg:block">
        <div className="lg:sticky lg:top-24">
          <RecapCard form={form} files={files} completion={completion} />
        </div>
      </aside>

      {/* Animation CSS — slide entre étapes */}
      <style jsx>{`
        @keyframes step-in {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        :global(.animate-step-in) {
          animation: step-in 250ms ease-out both;
        }
      `}</style>
    </div>
  );
}

// ─── Stepper ────────────────────────────────────────────────────────────────

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <ol className="relative mt-2 flex items-center justify-between">
      {STEPS.map((s, idx) => {
        const isCompleted = currentStep > s.id;
        const isActive = currentStep === s.id;
        const Icon = s.icon;
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={s.id} className="relative flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xs font-bold transition-all duration-300",
                  isCompleted &&
                    "border-emerald-500 bg-emerald-500 text-white shadow-[0_8px_22px_-8px_rgba(16,185,129,0.6)]",
                  isActive &&
                    "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700 shadow-[0_8px_22px_-8px_rgba(255,102,0,0.5)]",
                  !isCompleted &&
                    !isActive &&
                    "border-slate-200 bg-white text-slate-400"
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-xl bg-nexus-orange-500/20"
                  />
                )}
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-[10px] font-bold uppercase tracking-[0.16em] sm:inline-block",
                  (isActive || isCompleted)
                    ? "bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent"
                    : "text-slate-400"
                )}
              >
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 sm:mx-4">
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-500",
                    isCompleted
                      ? "w-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : isActive
                      ? "w-1/2 bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-500"
                      : "w-0"
                  )}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Step 1 — Identité ──────────────────────────────────────────────────────

function StepIdentite({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <section>
      <HelperBanner
        icon={Lock}
        text="Coordonnées du demandeur. Confidentialité absolue garantie."
      />
      <fieldset className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          id="vef-nom"
          label="Nom complet"
          value={form.nom}
          onChange={(v) => update("nom", v)}
          required
          placeholder="Marc Ouattara"
          autoComplete="name"
        />
        <Field
          id="vef-email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(v) => update("email", v)}
          required
          placeholder="vous@email.com"
          autoComplete="email"
        />
        <Field
          id="vef-whatsapp"
          label="WhatsApp"
          value={form.whatsapp}
          onChange={(v) => update("whatsapp", v)}
          required
          placeholder="+236 …"
          autoComplete="tel"
          hint="Avec indicatif pays"
        />
        <Field
          id="vef-pays"
          label="Pays de résidence"
          value={form.pays}
          onChange={(v) => update("pays", v)}
          required
          placeholder="République Centrafricaine"
          autoComplete="country-name"
        />
      </fieldset>
    </section>
  );
}

// ─── Step 2 — Projet ────────────────────────────────────────────────────────

function StepProjet({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <section>
      <HelperBanner
        icon={Globe2}
        text="Plus votre projet est précis, plus notre étude de faisabilité est rapide et juste."
      />
      <fieldset className="mt-6 grid gap-5 sm:grid-cols-2">
        <SelectField
          id="vef-destination"
          label="Destination"
          value={form.destination}
          onChange={(v) => update("destination", v)}
          required
        >
          <option value="">Choisir un pays…</option>
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.label}>
              {d.emoji} {d.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="vef-type"
          label="Type de visa"
          value={form.typeVisa}
          onChange={(v) => update("typeVisa", v)}
          required
        >
          <option value="">Motif du voyage…</option>
          {TYPES_VISA_OPTIONS.filter((t) => t.value !== "autre").map((t) => (
            <option key={t.value} value={t.label}>
              {t.label}
            </option>
          ))}
          <option value="Autre">Autre (préciser dans les commentaires)</option>
        </SelectField>
        <Field
          id="vef-date-depart"
          label="Date de départ souhaitée"
          type="date"
          value={form.dateDepart}
          onChange={(v) => update("dateDepart", v)}
          required
        />
        <Field
          id="vef-date-retour"
          label="Date de retour estimée"
          type="date"
          value={form.dateRetour}
          onChange={(v) => update("dateRetour", v)}
          hint="Optionnel"
        />
      </fieldset>

      <div className="mt-5">
        <label
          htmlFor="vef-motif"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
        >
          Motif détaillé du voyage
          <span className="ml-1 text-nexus-orange-600">*</span>
        </label>
        <textarea
          id="vef-motif"
          value={form.motif}
          onChange={(e) => update("motif", e.target.value)}
          rows={4}
          maxLength={1000}
          required
          placeholder="Décrivez en quelques lignes l'objet du voyage : motif, durée, contexte."
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 transition focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
        />
        <p className="mt-1 text-right text-[10px] text-slate-400">
          {form.motif.length} / 1000
        </p>
      </div>
    </section>
  );
}

// ─── Step 3 — Pièces & informations ────────────────────────────────────────

function StepPieces({
  form,
  update,
  toggleDocument,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleDocument: (val: string) => void;
}) {
  return (
    <section>
      <HelperBanner
        icon={FileCheck2}
        text="Indiquez ce que vous avez déjà. Nous identifierons ce qui manque dans le bilan écrit."
      />

      {/* Passeport */}
      <div className="mt-6">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Passeport disponible
          <span className="ml-1 text-nexus-orange-600">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {PASSEPORT_OPTIONS.map((opt) => (
            <RadioPill
              key={opt.value}
              label={opt.label}
              active={form.passeportDispo === opt.value}
              onClick={() => update("passeportDispo", opt.value)}
            />
          ))}
        </div>
      </div>

      {form.passeportDispo === "oui" && (
        <fieldset className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            id="vef-num-passeport"
            label="N° passeport"
            value={form.numPasseport}
            onChange={(v) => update("numPasseport", v)}
            placeholder="ex. 12AB34567"
            hint="Optionnel"
          />
          <Field
            id="vef-exp-passeport"
            label="Date d'expiration"
            type="date"
            value={form.expPasseport}
            onChange={(v) => update("expPasseport", v)}
            hint="Optionnel"
          />
        </fieldset>
      )}

      {/* Documents disponibles */}
      <div className="mt-8">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Documents disponibles
          <span className="ml-1 font-normal lowercase text-slate-400">
            (optionnel — cochez ce que vous avez)
          </span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {DOCUMENTS_DISPONIBLES.map((doc) => {
            const checked = form.documentsDispo.includes(doc.value);
            return (
              <button
                key={doc.value}
                type="button"
                onClick={() => toggleDocument(doc.value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 px-3 py-3 text-left transition",
                  checked
                    ? "border-nexus-orange-500 bg-nexus-orange-50/60 ring-2 ring-nexus-orange-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition",
                    checked
                      ? "border-nexus-orange-500 bg-nexus-orange-500 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <span
                  className={cn(
                    "text-xs leading-snug",
                    checked
                      ? "font-semibold text-nexus-orange-800"
                      : "text-nexus-blue-950"
                  )}
                >
                  {doc.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Réservation vol/hôtel */}
      <div className="mt-8">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Réservation vol / hôtel
          <span className="ml-1 text-nexus-orange-600">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {RESERVATION_OPTIONS.map((opt) => (
            <RadioPill
              key={opt.value}
              label={opt.label}
              active={form.reservationVolHotel === opt.value}
              onClick={() => update("reservationVolHotel", opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Lettre d'invitation */}
      <div className="mt-6">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Lettre d&apos;invitation requise ?
          <span className="ml-1 text-nexus-orange-600">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {INVITATION_OPTIONS.map((opt) => (
            <RadioPill
              key={opt.value}
              label={opt.label}
              active={form.lettreInvitation === opt.value}
              onClick={() => update("lettreInvitation", opt.value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Step 4 — Confirmation ──────────────────────────────────────────────────

function StepConfirmation({
  form,
  update,
  files,
  fileInputRef,
  handleAddFiles,
  removeFile,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  files: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAddFiles: (input: FileList | null) => void;
  removeFile: (idx: number) => void;
}) {
  return (
    <section>
      <HelperBanner
        icon={ShieldCheck}
        text="Tout sera utilisé exclusivement pour préparer votre bilan de faisabilité. Confidentialité absolue."
      />

      {/* Commentaires */}
      <div className="mt-6">
        <label
          htmlFor="vef-commentaires"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
        >
          Commentaires détaillés
          <span className="ml-1 font-normal lowercase text-slate-400">
            (optionnel)
          </span>
        </label>
        <textarea
          id="vef-commentaires"
          value={form.commentaires}
          onChange={(e) => update("commentaires", e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Précisions, contexte personnel, situations particulières, contraintes calendaires, refus antérieurs, etc."
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 transition focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
        />
        <p className="mt-1 text-right text-[10px] text-slate-400">
          {form.commentaires.length} / 2000
        </p>
      </div>

      {/* Niveau d'urgence */}
      <div className="mt-8">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Niveau d&apos;urgence
          <span className="ml-1 text-nexus-orange-600">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {URGENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("urgence", opt.value)}
              className={cn(
                "rounded-xl border-2 px-3 py-3 text-left transition",
                form.urgence === opt.value
                  ? "border-nexus-orange-500 bg-nexus-orange-50 shadow-sm ring-2 ring-nexus-orange-200"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold",
                  form.urgence === opt.value
                    ? "text-nexus-orange-700"
                    : "text-nexus-blue-950"
                )}
              >
                {opt.label}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pièces jointes */}
      <div className="mt-8">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Pièces jointes
          <span className="ml-1 font-normal lowercase text-slate-400">
            (optionnel — {MAX_FILES} max · 5 MB · PDF/JPG/PNG)
          </span>
        </label>
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50/30">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_EXT}
            onChange={(e) => handleAddFiles(e.target.files)}
            className="hidden"
            id="vef-files"
          />
          <label
            htmlFor="vef-files"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-nexus-blue-950 shadow-sm transition hover:-translate-y-0.5 hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
          >
            <Paperclip className="h-4 w-4" />
            Ajouter des fichiers
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Passeport, photos d&apos;identité, justificatifs déjà scannés
          </p>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-nexus-orange-600" />
                <span className="min-w-0 flex-1 truncate text-sm text-nexus-blue-950">
                  {f.name}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {(f.size / 1024).toFixed(0)} kB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Retirer ${f.name}`}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acceptation */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.acceptation}
            onChange={(e) => update("acceptation", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-nexus-orange-500 focus:ring-2 focus:ring-nexus-orange-200"
          />
          <span className="text-xs leading-relaxed text-slate-700">
            Je confirme l&apos;exactitude des informations transmises et accepte
            que <strong>Nexus RCA</strong> établisse un bilan de faisabilité
            écrit avant tout engagement.
          </span>
        </label>
      </div>
    </section>
  );
}

// ─── Récap dynamique ────────────────────────────────────────────────────────

function RecapCard({
  form,
  files,
  completion,
}: {
  form: FormState;
  files: File[];
  completion: { identite: boolean; projet: boolean; pieces: boolean; confirmation: boolean };
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-nexus-orange-400/15 backdrop-blur-xl sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-nexus-orange-500/15 blur-[80px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-px w-8 bg-gradient-to-r from-nexus-orange-500/60 to-transparent"
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
            Votre dossier
          </span>
        </div>
        <h4 className="mt-2 font-display text-xl font-bold leading-tight text-white">
          Récapitulatif{" "}
          <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
            en direct
          </span>
        </h4>

        <div className="mt-6 space-y-5">
          <RecapSection
            label="Demandeur"
            filled={completion.identite}
          >
            <RecapLine value={form.nom} placeholder="Nom à renseigner" strong />
            <RecapLine value={form.email} placeholder="E-mail à renseigner" />
            <RecapLine value={form.whatsapp} placeholder="WhatsApp à renseigner" />
            <RecapLine
              value={form.pays}
              placeholder="Pays de résidence à renseigner"
              prefix="📍"
            />
          </RecapSection>

          <RecapSection label="Projet" filled={completion.projet}>
            <RecapLine
              value={
                form.destination || form.typeVisa
                  ? `${destinationLabel(form.destination) || "—"}${
                      form.typeVisa ? ` · ${form.typeVisa}` : ""
                    }`
                  : ""
              }
              placeholder="Destination & type à renseigner"
              strong
            />
            <RecapLine
              value={
                form.dateDepart || form.dateRetour
                  ? `Du ${formatDate(form.dateDepart) || "?"}${
                      form.dateRetour
                        ? ` au ${formatDate(form.dateRetour)}`
                        : ""
                    }`
                  : ""
              }
              placeholder="Dates à renseigner"
              prefix="📅"
            />
            <RecapLine
              value={form.motif}
              placeholder="Motif à décrire"
              quote
              clamp
            />
          </RecapSection>

          <RecapSection label="Documents" filled={completion.pieces}>
            {form.passeportDispo ? (
              <RecapLine
                value={`Passeport : ${passeportLabel(form.passeportDispo)}`}
              />
            ) : (
              <RecapLine value="" placeholder="Statut passeport à renseigner" />
            )}
            {form.documentsDispo.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {documentsLabels(form.documentsDispo)
                  .slice(0, 4)
                  .map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-xs text-slate-300"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                      <span className="leading-snug">{d}</span>
                    </li>
                  ))}
                {form.documentsDispo.length > 4 && (
                  <li className="pl-4 text-[10px] italic text-slate-400">
                    + {form.documentsDispo.length - 4} autre(s)
                  </li>
                )}
              </ul>
            ) : (
              <RecapLine value="" placeholder="Aucun document coché" />
            )}
            {form.reservationVolHotel && (
              <RecapLine
                value={`Vol / hôtel : ${reservationLabel(
                  form.reservationVolHotel
                )}`}
                warn={form.reservationVolHotel === "non_decide"}
              />
            )}
            {form.lettreInvitation && (
              <RecapLine
                value={`Invitation : ${invitationLabel(form.lettreInvitation)}`}
              />
            )}
            {files.length > 0 && (
              <RecapLine
                value={`${files.length} pièce(s) jointe(s) prête(s)`}
                prefix="📎"
              />
            )}
          </RecapSection>

          <RecapSection
            label="Délai souhaité"
            filled={completion.confirmation}
          >
            <RecapLine
              value={
                URGENCE_OPTIONS.find((u) => u.value === form.urgence)?.label +
                " · " +
                URGENCE_OPTIONS.find((u) => u.value === form.urgence)?.sub
              }
              strong
            />
          </RecapSection>
        </div>

        {/* Footer trust */}
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_22px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
            <FileSignature className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-tight text-white">
              Bilan écrit gratuit avant engagement
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
              Étude initiale sans frais. Devis fixe communiqué. Confidentialité
              absolue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecapSection({
  label,
  filled,
  children,
}: {
  label: string;
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition",
            filled
              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
              : "bg-white/5 text-slate-500 ring-1 ring-white/10"
          )}
          aria-hidden
        >
          {filled ? <Check className="h-2.5 w-2.5" /> : "▶"}
        </span>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            filled ? "text-white" : "text-slate-400"
          )}
        >
          {label}
        </span>
      </div>
      <div className="ml-6 space-y-1">{children}</div>
    </div>
  );
}

function RecapLine({
  value,
  placeholder,
  prefix,
  strong,
  quote,
  clamp,
  warn,
}: {
  value: string | undefined;
  placeholder?: string;
  prefix?: string;
  strong?: boolean;
  quote?: boolean;
  clamp?: boolean;
  warn?: boolean;
}) {
  const empty = !value || !value.trim();
  if (empty && !placeholder) return null;
  return (
    <p
      className={cn(
        "text-xs leading-relaxed",
        empty
          ? "italic text-slate-500"
          : strong
          ? "font-semibold text-white"
          : warn
          ? "text-amber-300"
          : "text-slate-300",
        clamp && "line-clamp-2"
      )}
    >
      {prefix && !empty && <span className="mr-1">{prefix}</span>}
      {empty
        ? placeholder
        : quote
        ? `« ${value} »`
        : value}
    </p>
  );
}

// ─── Sous-composants UI ─────────────────────────────────────────────────────

function HelperBanner({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-nexus-orange-200/70 bg-gradient-to-br from-nexus-orange-50/80 to-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-nexus-orange-600 shadow-sm ring-1 ring-nexus-orange-200/60">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">{text}</p>
    </div>
  );
}

function RadioPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition",
        active
          ? "border-nexus-orange-500 bg-nexus-orange-50 text-nexus-orange-700 shadow-sm ring-2 ring-nexus-orange-200"
          : "border-slate-200 bg-white text-nexus-blue-950 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
      >
        {label}
        {required && <span className="ml-1 text-nexus-orange-600">*</span>}
      </label>
      <div className="relative">
        {type === "date" && (
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-xl border-2 border-slate-200 bg-white py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 transition focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200",
            type === "date" ? "pl-9 pr-4" : "px-4"
          )}
        />
      </div>
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  required = false,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
      >
        {label}
        {required && <span className="ml-1 text-nexus-orange-600">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 transition focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
      >
        {children}
      </select>
    </div>
  );
}
