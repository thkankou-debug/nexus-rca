"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  MinusCircle,
  Phone,
  Plane,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import {
  COVERAGE_DESCRIPTIONS,
  COVERAGE_LABELS,
  FORM_INITIAL,
  URGENCY_LABELS,
  type CoverageType,
  type QuoteFormData,
  type Urgency,
} from "@/lib/insurance/types";
import { AssuranceQuoteSummary } from "./AssuranceQuoteSummary";

/**
 * Wizard 4 étapes premium pour le devis assurance.
 *
 * Étapes :
 *   1 — Identité & projet (nom, email, WhatsApp, pays résidence)
 *   2 — Voyage & destination (destination, dates, durée)
 *   3 — Voyageurs & couverture (nb, âges, types de couverture, certif visa)
 *   4 — Détails & confirmation (urgence, commentaires, acceptation)
 *
 * Caractéristiques :
 * - Référence prévisionnelle générée côté client (display only)
 *   pour donner sensation de "dossier actif"
 * - Validation par étape avec feedback visuel
 * - Transitions step-in fluides
 * - Sticky summary droite desktop + collapse mobile
 * - Submit POST /api/assurance/devis → redirection /[reference]
 */

const COVERAGE_ICONS: Record<CoverageType, typeof ShieldCheck> = {
  schengen: ShieldCheck,
  voyage_intl: Plane,
  sante_intl: Stethoscope,
  etudes: GraduationCap,
  business: Briefcase,
};

const URGENCY_OPTIONS: { value: Urgency; tone: string }[] = [
  { value: "normal", tone: "border-white/10 bg-white/[0.04]" },
  {
    value: "urgent",
    tone: "border-amber-400/40 bg-amber-500/10",
  },
  {
    value: "tres_urgent",
    tone: "border-rose-400/40 bg-rose-500/10",
  },
];

// Génère une référence prévisionnelle pour l'affichage pendant la saisie.
// Format identique à ce que la base produira : NX-ASS-{année}-XXXX (random)
function generatePreviewRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 8999);
  return `NX-ASS-${year}-${rand}`;
}

export function AssuranceQuoteWizard() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<QuoteFormData>(FORM_INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);

  const previewRef = useMemo(() => generatePreviewRef(), []);

  function update<K extends keyof QuoteFormData>(
    key: K,
    value: QuoteFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  // Quand on change le nombre de voyageurs, ajuste la liste des âges.
  useEffect(() => {
    setFormData((prev) => {
      const ages = [...prev.traveler_ages];
      while (ages.length < prev.num_travelers) ages.push(30);
      while (ages.length > prev.num_travelers) ages.pop();
      return { ...prev, traveler_ages: ages };
    });
  }, [formData.num_travelers]);

  function setAge(idx: number, age: number) {
    setFormData((prev) => {
      const ages = [...prev.traveler_ages];
      ages[idx] = Math.max(0, Math.min(110, age));
      return { ...prev, traveler_ages: ages };
    });
  }

  function toggleCoverage(c: CoverageType) {
    setFormData((prev) => {
      const exists = prev.coverage_types.includes(c);
      return {
        ...prev,
        coverage_types: exists
          ? prev.coverage_types.filter((x) => x !== c)
          : [...prev.coverage_types, c],
      };
    });
    setError(null);
  }

  function validateStep(s: 1 | 2 | 3 | 4): string | null {
    if (s === 1) {
      if (!formData.full_name.trim() || formData.full_name.trim().length < 3)
        return "Nom complet requis (3 caractères minimum)";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return "Email invalide";
      if (!formData.whatsapp.trim() || formData.whatsapp.trim().length < 6)
        return "Numéro WhatsApp requis";
      if (!formData.country_residence.trim())
        return "Pays de résidence requis";
    }
    if (s === 2) {
      if (!formData.destination.trim())
        return "Destination du voyage requise";
      if (!formData.date_depart) return "Date de départ requise";
      if (!formData.date_retour) return "Date de retour requise";
      const a = new Date(formData.date_depart);
      const b = new Date(formData.date_retour);
      if (b < a) return "La date de retour doit être après la date de départ";
    }
    if (s === 3) {
      if (formData.num_travelers < 1 || formData.num_travelers > 50)
        return "Le nombre de voyageurs doit être entre 1 et 50";
      if (formData.traveler_ages.some((a) => a < 0 || a > 110))
        return "Les âges doivent être entre 0 et 110";
      if (formData.coverage_types.length === 0)
        return "Sélectionnez au moins un type de couverture";
    }
    if (s === 4) {
      if (!formData.acceptation)
        return "Vous devez accepter les conditions pour soumettre le dossier";
    }
    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  }

  function handlePrev() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
  }

  async function handleSubmit() {
    const err = validateStep(4);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/assurance/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la soumission");
      }

      // Redirige vers la page confirmation publique
      router.push(`/services/assurance/devis/${data.reference}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      {/* ─── Wizard (gauche / 8 cols) ───────────────────────────────── */}
      <div className="lg:col-span-8">
        {/* Progress bar */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-x-0 top-5 h-0.5 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="absolute left-0 top-5 h-0.5 rounded-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 shadow-[0_0_18px_-2px_rgba(255,102,0,0.7)] transition-all duration-700 ease-out"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          <ol className="relative grid grid-cols-4 gap-2">
            {([
              { n: 1, label: "Identité" },
              { n: 2, label: "Voyage" },
              { n: 3, label: "Couverture" },
              { n: 4, label: "Confirmation" },
            ] as const).map((s) => {
              const state =
                s.n < step ? "done" : s.n === step ? "active" : "todo";
              return (
                <li
                  key={s.n}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full ring-2 transition-all duration-500 sm:h-12 sm:w-12 ${
                      state === "done"
                        ? "bg-nexus-orange-500 text-white ring-nexus-orange-400/40"
                        : state === "active"
                          ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-nexus-orange-400/70 shadow-[0_0_28px_-4px_rgba(255,102,0,0.9)]"
                          : "bg-nexus-blue-950 text-white/40 ring-white/10 backdrop-blur-md"
                    }`}
                  >
                    {state === "done" ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <span className="font-display text-sm font-bold sm:text-base">
                        0{s.n}
                      </span>
                    )}
                    {state === "active" && (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-nexus-orange-500/40 animate-ping"
                      />
                    )}
                  </div>
                  <p
                    className={`mt-3 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs ${
                      state === "todo" ? "text-white/40" : "text-white/85"
                    }`}
                  >
                    {s.label}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Card étape avec animation step-in */}
        <div
          key={step}
          className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-8 lg:p-10"
          style={{ animation: "step-in 0.4s ease-out" }}
        >
          {step === 1 && <Step1 formData={formData} update={update} />}
          {step === 2 && <Step2 formData={formData} update={update} />}
          {step === 3 && (
            <Step3
              formData={formData}
              update={update}
              setAge={setAge}
              toggleCoverage={toggleCoverage}
            />
          )}
          {step === 4 && <Step4 formData={formData} update={update} />}

          {error && (
            <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </button>

            <p className="text-center text-xs text-white/55 sm:text-left">
              Étape {step} sur 4 ·{" "}
              <span className="font-semibold text-white/80">
                {step === 1 && "Identité & projet"}
                {step === 2 && "Voyage & destination"}
                {step === 3 && "Voyageurs & couverture"}
                {step === 4 && "Confirmation finale"}
              </span>
            </p>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                Continuer
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !formData.acceptation}
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_-10px_rgba(255,102,0,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:from-nexus-orange-600 hover:to-nexus-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Soumission…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Soumettre mon dossier
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Toggle summary mobile */}
        <button
          type="button"
          onClick={() => setShowSummaryMobile((v) => !v)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-md lg:hidden"
        >
          {showSummaryMobile ? "Masquer" : "Afficher"} le récap dossier
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ─── Summary sticky (droite / 4 cols) ───────────────────────── */}
      <aside
        className={`lg:col-span-4 ${
          showSummaryMobile ? "block" : "hidden lg:block"
        }`}
      >
        <div className="lg:sticky lg:top-24">
          <AssuranceQuoteSummary
            reference={previewRef}
            formData={formData}
            step={step}
          />
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// Sous-composants : étapes du wizard
// ============================================================================

type StepProps = {
  formData: QuoteFormData;
  update: <K extends keyof QuoteFormData>(
    key: K,
    value: QuoteFormData[K]
  ) => void;
};

function StepHeader({ icon: Icon, eyebrow, title, description }: {
  icon: typeof ShieldCheck;
  eyebrow: string;
  title: string;
  description: string;
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
        {description}
      </p>
    </div>
  );
}

// ─── Étape 1 : Identité ─────────────────────────────────────────────────────
function Step1({ formData, update }: StepProps) {
  return (
    <div>
      <StepHeader
        icon={User}
        eyebrow="Étape 01"
        title="Vos coordonnées"
        description="Quelques informations pour ouvrir votre dossier de courtage. Nous restons votre interlocuteur unique du diagnostic à l'activation."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field
          label="Nom complet"
          required
          icon={User}
          value={formData.full_name}
          onChange={(v) => update("full_name", v)}
          placeholder="ex : Marie Yatola"
        />
        <Field
          label="Email"
          required
          type="email"
          icon={Mail}
          value={formData.email}
          onChange={(v) => update("email", v)}
          placeholder="vous@email.com"
        />
        <Field
          label="WhatsApp (avec indicatif)"
          required
          icon={Phone}
          value={formData.whatsapp}
          onChange={(v) => update("whatsapp", v)}
          placeholder="+236 73 26 96 92"
        />
        <Field
          label="Pays de résidence"
          required
          icon={MapPin}
          value={formData.country_residence}
          onChange={(v) => update("country_residence", v)}
          placeholder="ex : République Centrafricaine"
        />
      </div>
    </div>
  );
}

// ─── Étape 2 : Voyage ──────────────────────────────────────────────────────
function Step2({ formData, update }: StepProps) {
  return (
    <div>
      <StepHeader
        icon={Plane}
        eyebrow="Étape 02"
        title="Votre voyage"
        description="Pays de destination et période du séjour. Le tarif et les couvertures applicables dépendent de la durée et du type de séjour."
      />
      <div className="mt-8 space-y-4">
        <Field
          label="Destination du voyage"
          required
          icon={MapPin}
          value={formData.destination}
          onChange={(v) => update("destination", v)}
          placeholder="ex : France, Schengen, Canada, Maroc, etc."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date de départ"
            required
            type="date"
            icon={Calendar}
            value={formData.date_depart}
            onChange={(v) => update("date_depart", v)}
          />
          <Field
            label="Date de retour"
            required
            type="date"
            icon={Calendar}
            value={formData.date_retour}
            onChange={(v) => update("date_retour", v)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Étape 3 : Voyageurs & couverture ──────────────────────────────────────
function Step3({
  formData,
  update,
  setAge,
  toggleCoverage,
}: StepProps & {
  setAge: (i: number, age: number) => void;
  toggleCoverage: (c: CoverageType) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={Users}
        eyebrow="Étape 03"
        title="Voyageurs & couvertures"
        description="Profil des voyageurs et types de couverture envisagés. Vous pouvez sélectionner plusieurs univers — nous adapterons la combinaison à votre profil."
      />

      {/* Nb voyageurs + ages */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Nombre de voyageurs
        </p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              update("num_travelers", Math.max(1, formData.num_travelers - 1))
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/85 hover:border-nexus-orange-400/40"
            aria-label="Diminuer"
          >
            <MinusCircle className="h-4 w-4" />
          </button>
          <span className="font-display text-3xl font-bold text-white">
            {formData.num_travelers}
          </span>
          <button
            type="button"
            onClick={() =>
              update("num_travelers", Math.min(50, formData.num_travelers + 1))
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/85 hover:border-nexus-orange-400/40"
            aria-label="Augmenter"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          <span className="text-xs text-white/50">
            {formData.num_travelers > 1 ? "personnes" : "personne"}
          </span>
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Âge de chaque voyageur
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {formData.traveler_ages.map((age, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                #{i + 1}
              </span>
              <input
                type="number"
                min={0}
                max={110}
                value={age}
                onChange={(e) => setAge(i, parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
              />
              <span className="text-[10px] text-white/50">ans</span>
            </div>
          ))}
        </div>
      </div>

      {/* Types de couverture */}
      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Types de couverture envisagés (multi-sélection)
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(Object.keys(COVERAGE_LABELS) as CoverageType[]).map((c) => {
            const Icon = COVERAGE_ICONS[c];
            const selected = formData.coverage_types.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCoverage(c)}
                className={`group/cov text-left relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                  selected
                    ? "border-nexus-orange-400/60 bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/5 to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_18px_36px_-16px_rgba(255,102,0,0.30)]"
                    : "border-white/10 bg-white/[0.04] hover:border-nexus-orange-400/30 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      selected
                        ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-1 ring-white/15 shadow-[0_10px_24px_-8px_rgba(255,102,0,0.7)]"
                        : "bg-white/[0.04] text-white/60 ring-1 ring-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold leading-tight text-white sm:text-base">
                      {COVERAGE_LABELS[c]}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {COVERAGE_DESCRIPTIONS[c]}
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                      selected
                        ? "bg-nexus-orange-500 ring-1 ring-white/20"
                        : "border border-white/15"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Certificat visa */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-5">
        <p className="text-sm font-semibold text-white">
          Avez-vous besoin d&rsquo;une attestation pour un dossier visa ?
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Si oui, nous délivrerons une attestation conforme aux exigences
          consulaires (Schengen 30 000 € minimum).
        </p>
        <div className="mt-3 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => update("visa_certificate_required", true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              formData.visa_certificate_required
                ? "bg-nexus-orange-500 text-white shadow-[0_4px_14px_-4px_rgba(255,102,0,0.6)]"
                : "text-white/65 hover:text-white"
            }`}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => update("visa_certificate_required", false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !formData.visa_certificate_required
                ? "bg-white/10 text-white"
                : "text-white/65 hover:text-white"
            }`}
          >
            Non
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Étape 4 : Confirmation ─────────────────────────────────────────────────
function Step4({ formData, update }: StepProps) {
  return (
    <div>
      <StepHeader
        icon={ShieldCheck}
        eyebrow="Étape 04"
        title="Détails & confirmation"
        description="Niveau d'urgence et précisions complémentaires. Vous recevrez un email de confirmation immédiat avec votre référence."
      />

      {/* Urgence */}
      <div className="mt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Niveau d&rsquo;urgence
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {URGENCY_OPTIONS.map((opt) => {
            const selected = formData.urgency === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("urgency", opt.value)}
                className={`text-left rounded-2xl border p-4 transition-all duration-300 ${
                  selected
                    ? opt.value === "tres_urgent"
                      ? "border-rose-400/60 bg-rose-500/15 shadow-[0_18px_36px_-16px_rgba(244,63,94,0.30)]"
                      : opt.value === "urgent"
                        ? "border-amber-400/60 bg-amber-500/15 shadow-[0_18px_36px_-16px_rgba(251,191,36,0.30)]"
                        : "border-nexus-orange-400/60 bg-nexus-orange-500/10 shadow-[0_18px_36px_-16px_rgba(255,102,0,0.30)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Clock
                    className={`h-4 w-4 ${
                      selected ? "text-white" : "text-white/55"
                    }`}
                  />
                  {selected && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </div>
                <p
                  className={`mt-3 font-display text-base font-bold leading-tight ${
                    selected ? "text-white" : "text-white/85"
                  }`}
                >
                  {URGENCY_LABELS[opt.value].split(" — ")[0]}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    selected ? "text-white/85" : "text-slate-400"
                  }`}
                >
                  {URGENCY_LABELS[opt.value].split(" — ")[1]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commentaires */}
      <div className="mt-6">
        <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Commentaires & précisions complémentaires
        </label>
        <textarea
          rows={4}
          value={formData.comments}
          onChange={(e) => update("comments", e.target.value)}
          placeholder="ex : conditions médicales particulières, voyage avec sport extrême, exigences spécifiques de l'employeur, etc."
          className="mt-2 w-full rounded-xl border border-white/10 bg-nexus-blue-950/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-nexus-orange-400/40 focus:outline-none"
        />
      </div>

      {/* Acceptation */}
      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-4">
        <input
          type="checkbox"
          checked={formData.acceptation}
          onChange={(e) => update("acceptation", e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-nexus-orange-500"
        />
        <span className="text-xs leading-relaxed text-slate-300">
          J&rsquo;autorise Nexus RCA à traiter mes informations pour me
          fournir un devis personnalisé. Mes données sont confidentielles et
          uniquement utilisées dans le cadre de ce dossier de courtage. Je
          comprends que le tarif définitif sera communiqué après étude par le
          cabinet.
        </span>
      </label>
    </div>
  );
}

// ─── Sous-composant : Field réutilisable ───────────────────────────────────
type FieldProps = {
  label: string;
  required?: boolean;
  type?: string;
  icon?: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

function Field({
  label,
  required,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
        {required && <span className="ml-1 text-nexus-orange-400">*</span>}
      </span>
      <div className="relative mt-2">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-white/10 bg-nexus-blue-950/40 py-3 text-sm text-white placeholder:text-white/35 focus:border-nexus-orange-400/40 focus:outline-none ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </label>
  );
}
