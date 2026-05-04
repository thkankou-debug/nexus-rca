"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  FileText,
  Info,
  Languages,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  ADMINISTRATIF_FORM_STORAGE_KEY,
  DEFAULT_ADMINISTRATIF_FORM,
  DOCUMENTS_FOURNIS_OPTIONS,
  FORMATS_CV,
  LANGUES_OPTIONS,
  LIVRAISONS,
  OBJECTIFS_LETTRE,
  PRESTATIONS,
  TYPES_FORMULAIRE,
  TYPES_IMPRESSION,
  URGENCES,
  computeFaisabilite,
  faisabiliteLabel,
  formatCvLabel,
  generateChecklist,
  generateDelaiIndicatif,
  langueLabel,
  livraisonLabel,
  needsCv,
  needsForm,
  needsLetter,
  needsPrint,
  needsTranslation,
  objectifLettreLabel,
  prestationLabel,
  requiresSeniorAnalysis,
  typeFormulaireLabel,
  typeImpressionLabel,
  urgenceLabel,
  validateStep,
  type AdministratifFormData,
  type ValidationErrors,
} from "@/lib/administratif-form";
import { whatsappLink, cn } from "@/lib/utils";

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Demandeur", icon: User },
  { id: 2, title: "Prestation", icon: FileText },
  { id: 3, title: "Détails", icon: Edit3 },
  { id: 4, title: "Livraison", icon: Truck },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function AdministratifForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<AdministratifFormData>(
    DEFAULT_ADMINISTRATIF_FORM
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const draft = localStorage.getItem(ADMINISTRATIF_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<AdministratifFormData>;
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch {}

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
          email: f.email || profile.email || "",
          telephone: f.telephone || profile.telephone || "",
        }));
      }
    })();
  }, [supabase]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(
        ADMINISTRATIF_FORM_STORAGE_KEY,
        JSON.stringify(form)
      );
    } catch {}
  }, [form]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  const update = <K extends keyof AdministratifFormData>(
    key: K,
    value: AdministratifFormData[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const toggleDocument = (val: string) => {
    setForm((f) => {
      const has = f.documents_fournis.includes(val);
      return {
        ...f,
        documents_fournis: has
          ? f.documents_fournis.filter((d) => d !== val)
          : [...f.documents_fournis, val],
      };
    });
  };

  const handleNext = () => {
    if (typeof screen !== "number") return;
    const errs = validateStep(screen, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Merci de compléter les champs obligatoires");
      return;
    }
    setErrors({});
    if (screen < 5) setScreen((screen + 1) as Screen);
  };

  const handlePrev = () => {
    setErrors({});
    if (typeof screen === "number" && screen > 1) {
      setScreen((screen - 1) as Screen);
    }
  };

  const goToStep = (step: 1 | 2 | 3 | 4 | 5) => {
    if (typeof screen !== "number") return;
    if (step < screen) {
      setScreen(step);
      setErrors({});
      return;
    }
    for (let s = 1; s < step; s++) {
      const errs = validateStep(s as 1 | 2 | 3 | 4 | 5, form);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setScreen(s as Screen);
        toast.error(`Complétez d'abord l'étape ${s}`);
        return;
      }
    }
    setScreen(step);
    setErrors({});
  };

  const handleSubmit = async () => {
    const errs = validateStep(5, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Merci d'accepter les consentements");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fais = computeFaisabilite(form);
      const senior = requiresSeniorAnalysis(form);

      const objet = `Administratif — ${prestationLabel(form.prestation)}`;
      const description = buildSubmissionDescription(form);
      const demandeId = crypto.randomUUID();

      const { error } = await supabase.from("demandes").insert({
        id: demandeId,
        client_id: user?.id ?? null,
        nom_complet: form.nom_complet,
        email: form.email,
        telephone: form.telephone,
        pays: "RCA",
        ville: "Bangui",
        langue_preferee: "Francais",
        service: "Administratif",
        objet,
        description,
        urgence: senior
          ? "elevee"
          : form.urgence === "moins_24h"
            ? "elevee"
            : "normale",
        date_souhaitee: null,
        pays_concerne: "",
        destination: "",
        budget_estimatif: "",
        traitement_prioritaire: senior,
        source: "formulaire_administratif",
        details_service: {
          ...form,
          faisabilite_estimee: fais,
          requiert_analyse_senior: senior,
        },
        consentement_examen: form.consentement_examen,
        consentement_documents: form.consentement_traitement,
        consentement_recontact: true,
        statut: "nouveau",
      });

      if (error) throw error;

      try {
        localStorage.removeItem(ADMINISTRATIF_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-ADM-${demandeId.slice(0, 8).toUpperCase()}`);
      toast.success("Votre demande a bien été reçue.");
      setScreen("success");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la soumission. Réessayez ou contactez-nous."
      );
    } finally {
      setLoading(false);
    }
  };

  if (screen === "success") {
    return <SuccessScreen reference={reference} form={form} router={router} />;
  }

  if (screen === "intro") {
    return <IntroScreen onStart={() => setScreen(1)} />;
  }

  return (
    <div ref={topRef}>
      <Stepper currentStep={screen} onStepClick={goToStep} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {screen === 1 && <Step1 form={form} update={update} errors={errors} />}
          {screen === 2 && <Step2 form={form} update={update} errors={errors} />}
          {screen === 3 && <Step3 form={form} update={update} errors={errors} />}
          {screen === 4 && (
            <Step4
              form={form}
              update={update}
              errors={errors}
              toggleDocument={toggleDocument}
            />
          )}
          {screen === 5 && (
            <Step5
              form={form}
              update={update}
              errors={errors}
              loading={loading}
              onSubmit={handleSubmit}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {screen < 5 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={screen === 1}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink-muted transition hover:bg-surface-sunken hover:text-ink",
              screen === 1 && "invisible"
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

      {screen === 5 && (
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

// ─── Écran INTRO ────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-line bg-surface-elevated p-8 shadow-elev-2 sm:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 rounded-3xl bg-brand/30 blur-2xl" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand shadow-elev-2">
            <FileText className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">Service administratif</p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Devis documentaire — CV, lettres, traductions, formulaires
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 4 minutes. Vos réponses nous permettent de cadrer la
          prestation et de proposer un devis fixe avec délai annoncé. Un
          conseiller revient sous quelques heures ouvrées.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          <Pill icon={ShieldCheck} label="Confidentiel" />
          <Pill icon={CheckCircle2} label="Devis gratuit" />
          <Pill icon={Info} label="Sans engagement" />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
          >
            <FileText className="h-5 w-5" />
            Commencer ma demande
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-caption text-ink-muted">
            Vous préférez parler à quelqu'un d'abord ?{" "}
            <Link
              href="/rendez-vous?service=administratif"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              Prendre rendez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Pill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-surface-sunken px-3 py-2 text-caption font-semibold text-ink">
      <Icon className="h-3.5 w-3.5 text-brand" />
      {label}
    </span>
  );
}

// ─── Stepper ────────────────────────────────────────────────────────────────

function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: 1 | 2 | 3 | 4 | 5;
  onStepClick: (step: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="relative hidden sm:block">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-line" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-brand transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        <ol className="relative flex justify-between">
          {STEPS.map((step) => {
            const done = step.id < currentStep;
            const current = step.id === currentStep;
            const Icon = step.icon;
            return (
              <li key={step.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id as 1 | 2 | 3 | 4 | 5)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    done && "border-brand bg-brand text-white shadow-elev-2",
                    current &&
                      "border-brand bg-surface-elevated text-brand shadow-glow-orange ring-4 ring-brand-subtle",
                    !done &&
                      !current &&
                      "border-line-strong bg-surface-elevated text-ink-subtle hover:border-brand/40"
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-caption font-semibold",
                    current ? "text-ink" : "text-ink-muted"
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
        <div className="flex items-center justify-between text-body-sm">
          <span className="font-semibold text-ink">
            Étape {currentStep} / {STEPS.length}
          </span>
          <span className="text-ink-muted">
            {STEPS.find((s) => s.id === currentStep)?.title}
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
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-display-sm text-ink">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-body-sm text-ink-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "info" | "warn" | "neutral";
  children: React.ReactNode;
}) {
  const styles =
    tone === "info"
      ? "border-emerald-200/60 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
      : tone === "warn"
        ? "border-amber-200/60 bg-amber-50/60 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
        : "border-line bg-surface-sunken text-ink-muted";
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border p-4", styles)}>
      <Info className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-body-sm">{children}</div>
    </div>
  );
}

// ─── Étape 1 — Demandeur ────────────────────────────────────────────────────

function Step1({
  form,
  update,
  errors,
}: {
  form: AdministratifFormData;
  update: <K extends keyof AdministratifFormData>(
    k: K,
    v: AdministratifFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  return (
    <StepCard
      title="Vos coordonnées"
      subtitle="Personne de contact pour le devis et la livraison."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Nom complet *"
          value={form.nom_complet}
          onChange={(e) => update("nom_complet", e.target.value)}
          error={errors.nom_complet}
          placeholder="Prénom NOM"
        />
        <Input
          label="E-mail *"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          placeholder="vous@exemple.com"
        />
        <div className="sm:col-span-2">
          <Input
            label="Téléphone / WhatsApp *"
            value={form.telephone}
            onChange={(e) => update("telephone", e.target.value)}
            error={errors.telephone}
            placeholder="+236 ..."
          />
        </div>
      </div>
    </StepCard>
  );
}

// ─── Étape 2 — Prestation ───────────────────────────────────────────────────

function Step2({
  form,
  update,
  errors,
}: {
  form: AdministratifFormData;
  update: <K extends keyof AdministratifFormData>(
    k: K,
    v: AdministratifFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const showShortDelay = form.urgence === "moins_24h";

  return (
    <StepCard
      title="Type de prestation"
      subtitle="Choisissez le besoin principal et l'urgence."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Prestation *"
            value={form.prestation}
            onChange={(e) =>
              update("prestation", e.target.value as typeof form.prestation)
            }
            error={errors.prestation}
          >
            <option value="">Sélectionner…</option>
            {PRESTATIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <Select
          label="Urgence *"
          value={form.urgence}
          onChange={(e) =>
            update("urgence", e.target.value as typeof form.urgence)
          }
          error={errors.urgence}
        >
          <option value="">Sélectionner…</option>
          {URGENCES.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Textarea
            label="Précisions sur le besoin (optionnel)"
            rows={3}
            value={form.precisions_besoin}
            onChange={(e) => update("precisions_besoin", e.target.value)}
            placeholder="Ex : candidature à telle université, dossier IRCC pour permis d'études, traduction d'un acte de naissance…"
          />
        </div>
      </div>

      {showShortDelay && (
        <div className="mt-6">
          <Notice tone="warn">
            <strong>Délai très court.</strong> Sous 24 heures, le périmètre
            doit être validé rapidement. Selon la prestation, une analyse
            senior peut être nécessaire avant engagement de délai.
          </Notice>
        </div>
      )}
    </StepCard>
  );
}

// ─── Étape 3 — Détails (variables) ──────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
}: {
  form: AdministratifFormData;
  update: <K extends keyof AdministratifFormData>(
    k: K,
    v: AdministratifFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const cv = needsCv(form.prestation);
  const letter = needsLetter(form.prestation);
  const translation = needsTranslation(form.prestation);
  const formo = needsForm(form.prestation);
  const print = needsPrint(form.prestation);

  return (
    <StepCard
      title="Détails de la prestation"
      subtitle="Précisez le format cible, l'objectif ou le type de document selon votre prestation."
    >
      <div className="space-y-6">
        {cv && (
          <Select
            label="Format de CV cible *"
            value={form.format_cv}
            onChange={(e) =>
              update("format_cv", e.target.value as typeof form.format_cv)
            }
            error={errors.format_cv}
          >
            <option value="">Sélectionner…</option>
            {FORMATS_CV.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        )}

        {letter && (
          <Select
            label="Objectif de la lettre *"
            value={form.objectif_lettre}
            onChange={(e) =>
              update(
                "objectif_lettre",
                e.target.value as typeof form.objectif_lettre
              )
            }
            error={errors.objectif_lettre}
          >
            <option value="">Sélectionner…</option>
            {OBJECTIFS_LETTRE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}

        {translation && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Langue source *"
              value={form.langue_source}
              onChange={(e) =>
                update(
                  "langue_source",
                  e.target.value as typeof form.langue_source
                )
              }
              error={errors.langue_source}
            >
              <option value="">Sélectionner…</option>
              {LANGUES_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <Select
              label="Langue cible *"
              value={form.langue_cible}
              onChange={(e) =>
                update(
                  "langue_cible",
                  e.target.value as typeof form.langue_cible
                )
              }
              error={errors.langue_cible}
            >
              <option value="">Sélectionner…</option>
              {LANGUES_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-2">
              <Input
                label="Volume estimé (nb de pages, optionnel)"
                value={form.pages_traduction}
                onChange={(e) => update("pages_traduction", e.target.value)}
                placeholder="Ex : 2, 5, 12…"
              />
            </div>
          </div>
        )}

        {formo && (
          <>
            <Select
              label="Type de formulaire *"
              value={form.type_formulaire}
              onChange={(e) =>
                update(
                  "type_formulaire",
                  e.target.value as typeof form.type_formulaire
                )
              }
              error={errors.type_formulaire}
            >
              <option value="">Sélectionner…</option>
              {TYPES_FORMULAIRE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Notice tone="info">
              <strong>Rappel.</strong> Le remplissage est préparé par notre
              équipe, mais la signature et la soumission officielle restent
              de votre responsabilité, pour des raisons légales.
            </Notice>
          </>
        )}

        {print && (
          <Select
            label="Type d'impression / scan *"
            value={form.type_impression}
            onChange={(e) =>
              update(
                "type_impression",
                e.target.value as typeof form.type_impression
              )
            }
            error={errors.type_impression}
          >
            <option value="">Sélectionner…</option>
            {TYPES_IMPRESSION.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        )}

        {!cv && !letter && !translation && !formo && !print && (
          <Notice tone="neutral">
            Aucun détail spécifique requis pour ce type de prestation. Passez à
            l'étape suivante.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 4 — Documents & livraison ────────────────────────────────────────

function Step4({
  form,
  update,
  errors,
  toggleDocument,
}: {
  form: AdministratifFormData;
  update: <K extends keyof AdministratifFormData>(
    k: K,
    v: AdministratifFormData[K]
  ) => void;
  errors: ValidationErrors;
  toggleDocument: (val: string) => void;
}) {
  return (
    <StepCard
      title="Documents fournis & livraison"
      subtitle="Indiquez ce que vous pouvez transmettre et comment vous voulez recevoir le livrable."
    >
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Documents que vous pouvez transmettre
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez ce que vous avez. Pas grave si vous n'avez rien — nous
            cadrerons ensemble.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DOCUMENTS_FOURNIS_OPTIONS.map((d) => (
              <CheckboxItem
                key={d.value}
                checked={form.documents_fournis.includes(d.value)}
                onChange={() => toggleDocument(d.value)}
                label={d.label}
              />
            ))}
          </div>
        </div>

        <Select
          label="Mode de livraison *"
          value={form.livraison}
          onChange={(e) =>
            update("livraison", e.target.value as typeof form.livraison)
          }
          error={errors.livraison}
        >
          <option value="">Sélectionner…</option>
          {LIVRAISONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Précisions sur la livraison (optionnel)"
          rows={3}
          value={form.precisions_livraison}
          onChange={(e) => update("precisions_livraison", e.target.value)}
          placeholder="Ex : récupération en agence par tel jour, envoi par e-mail à telle adresse, etc."
        />
      </div>
    </StepCard>
  );
}

// ─── Étape 5 — Synthèse ─────────────────────────────────────────────────────

function Step5({
  form,
  update,
  errors,
  loading,
  onSubmit,
}: {
  form: AdministratifFormData;
  update: <K extends keyof AdministratifFormData>(
    k: K,
    v: AdministratifFormData[K]
  ) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const fais = computeFaisabilite(form);
  const faisInfo = faisabiliteLabel(fais);
  const checklist = generateChecklist(form);
  const delai = generateDelaiIndicatif(form.prestation, form.urgence);

  const colorMap: Record<string, string> = {
    emerald:
      "border-emerald-200/60 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    amber:
      "border-amber-200/60 bg-amber-50/60 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    rose: "border-rose-200/60 bg-rose-50/60 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  };

  const showCv = needsCv(form.prestation);
  const showLetter = needsLetter(form.prestation);
  const showTranslation = needsTranslation(form.prestation);
  const showForm = needsForm(form.prestation);
  const showPrint = needsPrint(form.prestation);

  return (
    <StepCard
      title="Synthèse de votre demande"
      subtitle="Vérifiez les informations ci-dessous avant envoi. Vous pouvez revenir en arrière pour corriger une étape."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard title="Prestation">
            <SummaryLine
              label="Type"
              value={prestationLabel(form.prestation)}
            />
            <SummaryLine label="Urgence" value={urgenceLabel(form.urgence)} />
            <SummaryLine
              label="Livraison"
              value={livraisonLabel(form.livraison)}
            />
          </SummaryCard>

          <SummaryCard title="Détails">
            {showCv && (
              <SummaryLine
                label="Format CV"
                value={formatCvLabel(form.format_cv)}
              />
            )}
            {showLetter && (
              <SummaryLine
                label="Objectif lettre"
                value={objectifLettreLabel(form.objectif_lettre)}
              />
            )}
            {showTranslation && (
              <>
                <SummaryLine
                  label="Source → Cible"
                  value={`${langueLabel(form.langue_source)} → ${langueLabel(form.langue_cible)}`}
                />
                {form.pages_traduction && (
                  <SummaryLine
                    label="Volume"
                    value={`${form.pages_traduction} page(s)`}
                  />
                )}
              </>
            )}
            {showForm && (
              <SummaryLine
                label="Formulaire"
                value={typeFormulaireLabel(form.type_formulaire)}
              />
            )}
            {showPrint && (
              <SummaryLine
                label="Impression"
                value={typeImpressionLabel(form.type_impression)}
              />
            )}
            {!showCv &&
              !showLetter &&
              !showTranslation &&
              !showForm &&
              !showPrint && <SummaryLine label="—" value="—" />}
          </SummaryCard>
        </div>

        {/* Faisabilité */}
        <div
          className={cn("rounded-3xl border p-6 sm:p-7", colorMap[faisInfo.color])}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{faisInfo.emoji}</div>
            <div className="flex-1">
              <p className="text-overline opacity-80">
                Notre estimation préliminaire
              </p>
              <h3 className="mt-1 font-display text-display-sm">
                {faisInfo.label}
              </h3>
              <p className="mt-2 text-body-sm opacity-90">
                {faisInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Checklist + délai */}
        <div className="grid gap-4 lg:grid-cols-2">
          {checklist.length > 0 && (
            <div className="rounded-3xl border border-line bg-surface-sunken p-6">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-brand" />
                <h3 className="text-title text-ink">À prévoir</h3>
              </div>
              <ul className="space-y-2 text-body-sm text-ink-muted">
                {checklist.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {delai && (
            <div className="rounded-3xl border border-line bg-surface-sunken p-6">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-brand" />
                <h3 className="text-title text-ink">Délai indicatif</h3>
              </div>
              <p className="font-display text-body text-ink">{delai}</p>
              <p className="mt-2 text-caption text-ink-muted">
                Délai final confirmé dans le devis.
              </p>
            </div>
          )}
        </div>

        {/* Rappel */}
        <div className="rounded-3xl border border-line bg-surface-sunken p-6">
          <div className="mb-3 flex items-center gap-2">
            <Languages className="h-5 w-5 text-brand" />
            <h3 className="text-title text-ink">Relecture systématique</h3>
          </div>
          <p className="text-body-sm text-ink-muted">
            Quel que soit le livrable, il passe par une relecture avant
            livraison. Vous recevez un document propre, prêt à déposer.
          </p>
        </div>

        {/* Consentements */}
        <div className="rounded-3xl border border-line bg-surface-elevated p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="text-title text-ink">Consentements requis</h3>
          </div>
          <div className="space-y-3">
            <ConsentCheckbox
              checked={form.consentement_examen}
              onChange={(v) => update("consentement_examen", v)}
              error={errors.consentement_examen}
              label="J'accepte que Nexus RCA examine ma demande et établisse un devis fixe avec délai annoncé."
            />
            <ConsentCheckbox
              checked={form.consentement_traitement}
              onChange={(v) => update("consentement_traitement", v)}
              error={errors.consentement_traitement}
              label="J'autorise le traitement de mes données et documents pour produire le livrable demandé."
            />
            <ConsentCheckbox
              checked={form.consentement_confidentialite}
              onChange={(v) => update("consentement_confidentialite", v)}
              error={errors.consentement_confidentialite}
              label="Je reconnais que la signature et la soumission de tout document officiel restent de ma responsabilité."
            />
          </div>
        </div>

        {/* CTA submit */}
        <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-headline text-ink sm:text-display-sm">
              Prêt à recevoir votre devis ?
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Un conseiller Nexus revient sous quelques heures avec un
              périmètre clair, un délai et un prix fixe.
            </p>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            Envoyer ma demande de devis
          </button>
        </div>
      </div>
    </StepCard>
  );
}

// ─── Composants utilitaires ────────────────────────────────────────────────

function CheckboxItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
        checked
          ? "border-brand/40 bg-brand-subtle/40"
          : "border-line bg-surface-elevated hover:border-brand/40"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong text-brand focus:ring-brand/30"
      />
      <span className="text-body-sm text-ink">{label}</span>
    </label>
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
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        checked && "border-brand/40 bg-brand-subtle/40",
        !checked && !error && "border-line",
        disabled && "cursor-default opacity-80",
        error && "border-rose-400 bg-rose-50 dark:bg-rose-500/10"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-line-strong text-brand focus:ring-brand/30"
      />
      <span className="text-body-sm text-ink">{label}</span>
    </label>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-sunken p-5">
      <h3 className="text-title text-ink">{title}</h3>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-body-sm">
      <span className="font-medium text-ink-muted">{label}</span>
      <span className="text-right text-ink">{value || "—"}</span>
    </div>
  );
}

// ─── Construction de la description ───────────────────────────────────────

function buildSubmissionDescription(form: AdministratifFormData): string {
  const fais = computeFaisabilite(form);

  const lines = [
    `Demande Administratif — soumise via formulaire dédié.`,
    ``,
    `Prestation : ${prestationLabel(form.prestation)}`,
    `Urgence : ${urgenceLabel(form.urgence)}`,
    `Livraison : ${livraisonLabel(form.livraison)}`,
    ``,
  ];

  if (needsCv(form.prestation)) {
    lines.push(`CV — Format cible : ${formatCvLabel(form.format_cv)}`);
  }
  if (needsLetter(form.prestation)) {
    lines.push(`Lettre — Objectif : ${objectifLettreLabel(form.objectif_lettre)}`);
  }
  if (needsTranslation(form.prestation)) {
    lines.push(
      `Traduction : ${langueLabel(form.langue_source)} → ${langueLabel(form.langue_cible)}${form.pages_traduction ? ` (${form.pages_traduction} pages)` : ""}`
    );
  }
  if (needsForm(form.prestation)) {
    lines.push(`Formulaire : ${typeFormulaireLabel(form.type_formulaire)}`);
  }
  if (needsPrint(form.prestation)) {
    lines.push(`Impression : ${typeImpressionLabel(form.type_impression)}`);
  }

  if (form.precisions_besoin) {
    lines.push(``, `Précisions besoin : ${form.precisions_besoin}`);
  }

  if (form.documents_fournis.length > 0) {
    lines.push(``, `Documents disponibles : ${form.documents_fournis.join(", ")}`);
  }

  if (form.precisions_livraison) {
    lines.push(``, `Précisions livraison : ${form.precisions_livraison}`);
  }

  lines.push(``, `Estimation préliminaire (auto) : ${faisabiliteLabel(fais).label}`);

  return lines.join("\n");
}

// ─── Écran SUCCESS ──────────────────────────────────────────────────────────

function SuccessScreen({
  reference,
  form,
  router,
}: {
  reference: string;
  form: AdministratifFormData;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface-elevated p-8 shadow-elev-3 sm:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-elev-2 dark:bg-emerald-500/15">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-300" />
          </div>
        </div>

        <h1 className="font-display text-display-md text-ink sm:text-display-lg">
          Votre demande a été reçue.
        </h1>
        <p className="mt-4 text-body-lg text-ink-muted">
          Merci <strong className="text-ink">{form.nom_complet}</strong>. Un
          conseiller Nexus prépare votre devis fixe avec périmètre et délai
          annoncés.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken px-4 py-2">
          <span className="text-overline text-ink-muted">Référence</span>
          <span className="font-mono text-body-sm font-semibold text-ink">
            {reference}
          </span>
        </div>

        <p className="mt-4 text-caption text-ink-muted">
          Un récapitulatif vous a été envoyé par e-mail.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-brand-hover hover:shadow-glow-orange"
          >
            Mon espace client
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-surface-elevated px-6 py-3 text-body-sm font-semibold text-ink transition hover:bg-surface-sunken"
          >
            Retour à l'accueil
          </button>
        </div>

        <p className="mt-8 text-caption text-ink-muted">
          Une question ?{" "}
          <a
            href={whatsappLink(
              `Bonjour Nexus, je viens de soumettre ma demande Administratif ${reference}.`
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand underline-offset-4 hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Contactez-nous sur WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
