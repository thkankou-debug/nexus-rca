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
  ShieldCheck,
  Lock,
  Eye,
  FileSignature,
} from "lucide-react";
import toast from "react-hot-toast";
import { DESTINATIONS, TYPES_VISA_OPTIONS } from "@/lib/visa-form";
import { cn } from "@/lib/utils";

// ─── VisaExpressForm ────────────────────────────────────────────────────────
// Formulaire express Premium embarqué dans /services/visa.
// Refonte cabinet exécutif premium : confiance, sophistication, expertise.
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

const FORM_TRUST_CHIPS = [
  { icon: Lock, label: "Confidentialité absolue" },
  { icon: FileSignature, label: "Bilan écrit" },
  { icon: ShieldCheck, label: "Réponse 48–72 h" },
  { icon: Eye, label: "Sans engagement" },
];

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
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

  // ─── Etat succès — card glass orange premium ────────────────────────────
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

  // ─── Etat principal — formulaire cabinet exécutif ──────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/[0.95] p-8 shadow-[0_24px_48px_-16px_rgba(12,28,64,0.20)] ring-1 ring-slate-100/80 backdrop-blur-xl sm:p-12"
    >
      {/* Bordure éclairée orange en haut */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/50 to-transparent"
      />
      {/* Halo orange discret */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/8 blur-[100px]"
      />

      {/* ─── Header form premium ──────────────────────────────────────── */}
      <div className="relative mb-10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-900 text-nexus-orange-400 shadow-[0_10px_28px_-10px_rgba(12,28,64,0.6)] ring-1 ring-white/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/20 bg-nexus-orange-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-500" />
              </span>
              Demande officielle
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-3xl">
              Soumettre votre dossier
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Un conseiller expert revient sous 48–72 h ouvrées.
            </p>
          </div>
        </div>
        {/* Séparateur fin sous header */}
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
        />
      </div>

      {/* ─── Etat erreur ──────────────────────────────────────────────── */}
      {error && (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Erreur
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

      {/* ─── Section 01 — Identité ────────────────────────────────────── */}
      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text font-display text-lg font-bold text-transparent">
            01
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Identité
          </span>
        </div>

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
        </fieldset>
      </div>

      {/* ─── Section 02 — Projet ──────────────────────────────────────── */}
      <div className="relative mt-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text font-display text-lg font-bold text-transparent">
            02
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Projet
          </span>
        </div>

        <fieldset className="grid gap-5 sm:grid-cols-2">
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
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Niveau d&apos;urgence
              <span className="ml-1 text-nexus-orange-600">*</span>
            </label>
            <div className="flex gap-2">
              {URGENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgence(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl border-2 px-3 py-2.5 text-left transition",
                    urgence === opt.value
                      ? "border-nexus-orange-500 bg-nexus-orange-50 shadow-sm ring-2 ring-nexus-orange-200"
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
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Notes */}
        <div className="mt-5">
          <label
            htmlFor="vef-notes"
            className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
          >
            Notes additionnelles{" "}
            <span className="font-normal lowercase text-slate-400">
              (facultatif)
            </span>
          </label>
          <textarea
            id="vef-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Date de voyage prévue, contexte particulier, refus antérieurs, …"
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 transition focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {notes.length} / 1000
          </p>
        </div>
      </div>

      {/* ─── Section 03 — Pièces jointes ──────────────────────────────── */}
      <div className="relative mt-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text font-display text-lg font-bold text-transparent">
            03
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Pièces jointes
            <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">
              (facultatif)
            </span>
          </span>
        </div>

        <p className="mb-3 text-xs text-slate-500">
          {MAX_FILES} fichiers max · 5 MB · PDF / JPG / PNG
        </p>

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

      {/* ─── CTA principal — orange shimmer ────────────────────────────── */}
      <div className="mt-10 border-t border-slate-200 pt-8">
        <button
          type="submit"
          disabled={submitting}
          className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {/* Shimmer sweep */}
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
              Soumettre ma demande
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
            </>
          )}
        </button>

        {/* État loading skeleton premium */}
        {submitting && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-500" />
            </span>
            Chiffrement et transmission sécurisée…
          </div>
        )}
      </div>

      {/* ─── Footer trust chips ─────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {FORM_TRUST_CHIPS.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-nexus-orange-600" />
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                {c.label}
              </span>
            </div>
          );
        })}
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
        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
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
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-nexus-blue-950 placeholder:text-slate-400 transition focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
      />
      {hint && (
        <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
      )}
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
