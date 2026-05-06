"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { DESTINATIONS, TYPES_VISA_OPTIONS } from "@/lib/visa-form";
import { cn } from "@/lib/utils";

// ─── VisaExpressForm ────────────────────────────────────────────────────────
// Formulaire express Premium embarqué dans /services/visa.
// Découplé de VisaForm.tsx (qui reste sur /services/visa/demarrer).
// 7 champs : nom, email, whatsapp, pays, type, urgence, notes + upload (5 max).

const URGENCE_OPTIONS = [
  {
    value: "normal",
    label: "Normal",
    sub: "Sous 3 jours",
    accent: "emerald",
  },
  {
    value: "urgent",
    label: "Urgent",
    sub: "Sous 48 h",
    accent: "amber",
  },
  {
    value: "critique",
    label: "Critique",
    sub: "Sous 24 h",
    accent: "rose",
  },
] as const;

type Urgence = (typeof URGENCE_OPTIONS)[number]["value"];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXT = ".pdf,.jpg,.jpeg,.png";

export function VisaExpressForm() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pays, setPays] = useState("");
  const [type, setType] = useState("");
  const [urgence, setUrgence] = useState<Urgence>("normal");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.append("nom_complet", nom);
    fd.append("email", email);
    fd.append("whatsapp", whatsapp);
    fd.append("pays_destination", pays);
    fd.append("type_visa", type);
    fd.append("urgence", urgence);
    fd.append("notes", notes);
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
        toast.error(data.error || "Échec de l'envoi");
        return;
      }
      setSuccess(data.reference || "—");
      toast.success("Demande envoyée — un conseiller revient vers vous");
    } catch (err) {
      console.error("[VISA_EXPRESS_FORM]", err);
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-10 text-center shadow-sm sm:p-14">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
          Demande envoyée
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          Votre référence :{" "}
          <span className="font-mono font-bold text-nexus-orange-600">{success}</span>
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Un conseiller Nexus revient vers vous via e-mail et WhatsApp dans les
          délais indiqués.
        </p>
        <a
          href="https://wa.me/23673269692"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
        >
          <MessageCircle className="h-4 w-4" />
          Nous joindre sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
    >
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Soumission express
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Démarrez votre dossier
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Réponse sous 24 h à 3 jours selon urgence — gratuit, sans engagement.
          </p>
        </div>
      </div>

      {/* Identité */}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <Field
          id="vef-nom"
          label="Nom complet"
          value={nom}
          onChange={setNom}
          required
          placeholder="Marc Ouattara"
          autoComplete="name"
        />
        <Field
          id="vef-email"
          label="E-mail"
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="vous@email.com"
          autoComplete="email"
        />
        <Field
          id="vef-whatsapp"
          label="WhatsApp"
          value={whatsapp}
          onChange={setWhatsapp}
          required
          placeholder="+236 …"
          autoComplete="tel"
          hint="Avec indicatif pays"
        />
        <SelectField
          id="vef-pays"
          label="Destination"
          value={pays}
          onChange={setPays}
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
          value={type}
          onChange={setType}
          required
        >
          <option value="">Motif du voyage…</option>
          {TYPES_VISA_OPTIONS.filter((t) => t.value !== "autre").map((t) => (
            <option key={t.value} value={t.label}>
              {t.label}
            </option>
          ))}
          <option value="Autre">Autre (préciser dans les notes)</option>
        </SelectField>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Niveau d'urgence
          </label>
          <div className="flex gap-2">
            {URGENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUrgence(opt.value)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-left transition",
                  urgence === opt.value
                    ? "border-nexus-orange-500 bg-nexus-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold",
                    urgence === opt.value
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
      </fieldset>

      {/* Notes */}
      <div className="mt-8">
        <label
          htmlFor="vef-notes"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600"
        >
          Notes additionnelles{" "}
          <span className="font-normal lowercase text-slate-400">(facultatif)</span>
        </label>
        <textarea
          id="vef-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Date de voyage prévue, contexte particulier, refus antérieurs, …"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
        />
        <p className="mt-1 text-right text-[10px] text-slate-400">
          {notes.length} / 1000
        </p>
      </div>

      {/* Upload */}
      <div className="mt-8">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Pièces jointes{" "}
          <span className="font-normal lowercase text-slate-400">
            (facultatif · {MAX_FILES} max · 5 MB · PDF/JPG/PNG)
          </span>
        </label>

        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
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
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-nexus-blue-950 shadow-sm transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
          >
            <Paperclip className="h-4 w-4" />
            Ajouter des fichiers
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Passeport, photos d'identité, justificatifs déjà scannés
          </p>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
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

      {/* Submit */}
      <div className="mt-10 flex flex-col-reverse gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
          Vos données restent strictement confidentielles
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-nexus-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-9"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              Envoyer ma demande
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────────────

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
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
        {required && <span className="ml-1 text-nexus-orange-600">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
      />
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
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
        {required && <span className="ml-1 text-nexus-orange-600">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
      >
        {children}
      </select>
    </div>
  );
}
