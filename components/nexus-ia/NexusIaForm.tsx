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
  Bot,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  FileText,
  Info,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  BUDGETS,
  CALENDRIERS,
  CANAUX,
  DEFAULT_NEXUS_IA_FORM,
  LANGUES_OPTIONS,
  NEXUS_IA_FORM_STORAGE_KEY,
  SOURCES_CONTENU_OPTIONS,
  TYPES_PROJET,
  TYPES_STRUCTURE,
  VOLUMES,
  budgetLabel,
  calendrierLabel,
  computeFaisabilite,
  faisabiliteLabel,
  generateChecklist,
  generateDelaiIndicatif,
  langueLabel,
  requiresSeniorAnalysis,
  typeProjetLabel,
  typeStructureLabel,
  validateStep,
  volumeLabel,
  type NexusIaFormData,
  type ValidationErrors,
} from "@/lib/nexus-ia-form";
import { whatsappLink, cn } from "@/lib/utils";

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Demandeur", icon: User },
  { id: 2, title: "Activité", icon: Briefcase },
  { id: 3, title: "Projet IA", icon: Cpu },
  { id: 4, title: "Contenus", icon: ClipboardCheck },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function NexusIaForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<NexusIaFormData>(DEFAULT_NEXUS_IA_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const draft = localStorage.getItem(NEXUS_IA_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<NexusIaFormData>;
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
      localStorage.setItem(NEXUS_IA_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  const update = <K extends keyof NexusIaFormData>(
    key: K,
    value: NexusIaFormData[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const toggleArray = (key: "canaux" | "sources_contenu", val: string) => {
    setForm((f) => {
      const has = f[key].includes(val);
      return {
        ...f,
        [key]: has ? f[key].filter((d) => d !== val) : [...f[key], val],
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

      const objet = `Nexus IA — ${typeProjetLabel(form.type_projet)} pour ${form.nom_structure}`;
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
        service: "Nexus IA",
        objet,
        description,
        urgence: senior ? "elevee" : "normale",
        date_souhaitee: null,
        pays_concerne: "RCA",
        destination: "Bangui",
        budget_estimatif: budgetLabel(form.budget),
        traitement_prioritaire: senior,
        source: "formulaire_nexus_ia",
        details_service: {
          ...form,
          faisabilite_estimee: fais,
          requiert_analyse_senior: senior,
        },
        consentement_examen: form.consentement_examen,
        consentement_documents: form.consentement_traitement,
        consentement_recontact: true,
        statut: "nouvelle_demande",
      });

      if (error) throw error;

      try {
        localStorage.removeItem(NEXUS_IA_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-IA-${demandeId.slice(0, 8).toUpperCase()}`);
      toast.success("Votre projet a bien été reçu.");
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
          {screen === 3 && (
            <Step3
              form={form}
              update={update}
              errors={errors}
              toggleArray={toggleArray}
            />
          )}
          {screen === 4 && (
            <Step4
              form={form}
              update={update}
              errors={errors}
              toggleArray={toggleArray}
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
            <Bot className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">
          Service Nexus IA — Assistant dédié
        </p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Cadrage projet — assistant IA pour votre activité
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 6 minutes. Vos réponses nous permettent de cadrer le cas
          d'usage, le périmètre et la faisabilité d'un assistant IA dédié.
          Démo + devis sous 48 heures ouvrées.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          <Pill icon={ShieldCheck} label="Confidentiel" />
          <Pill icon={CheckCircle2} label="Cadrage gratuit" />
          <Pill icon={Sparkles} label="Démo personnalisée" />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
          >
            <FileText className="h-5 w-5" />
            Commencer le cadrage
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-caption text-ink-muted">
            Vous voulez juste discuter avec Nexus IA ?{" "}
            <Link
              href="/services/nexus-ia#chat"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              Ouvrir le chat public
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
  form: NexusIaFormData;
  update: <K extends keyof NexusIaFormData>(
    k: K,
    v: NexusIaFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  return (
    <StepCard
      title="Vos coordonnées"
      subtitle="Personne de contact et nom de la structure pour laquelle vous soumettez le projet."
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
        <Input
          label="Téléphone / WhatsApp *"
          value={form.telephone}
          onChange={(e) => update("telephone", e.target.value)}
          error={errors.telephone}
          placeholder="+236 ..."
        />
        <Input
          label="Nom de la structure *"
          value={form.nom_structure}
          onChange={(e) => update("nom_structure", e.target.value)}
          error={errors.nom_structure}
          placeholder="Ex : Cabinet Sangha Conseil, Boutique Boali…"
        />
      </div>
    </StepCard>
  );
}

// ─── Étape 2 — Activité ─────────────────────────────────────────────────────

function Step2({
  form,
  update,
  errors,
}: {
  form: NexusIaFormData;
  update: <K extends keyof NexusIaFormData>(
    k: K,
    v: NexusIaFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  return (
    <StepCard
      title="Votre activité"
      subtitle="Type de structure, description courte et audience que l'IA devra servir."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Type de structure *"
            value={form.type_structure}
            onChange={(e) =>
              update(
                "type_structure",
                e.target.value as typeof form.type_structure
              )
            }
            error={errors.type_structure}
          >
            <option value="">Sélectionner…</option>
            {TYPES_STRUCTURE.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Description courte de votre activité *"
            rows={3}
            value={form.description_activite}
            onChange={(e) => update("description_activite", e.target.value)}
            error={errors.description_activite}
            placeholder="Ex : Cabinet de conseil en formation continue, 5 consultants, 200 clients/an dont diaspora et entreprises locales."
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Audience que l'IA devra servir *"
            rows={3}
            value={form.audience_cible}
            onChange={(e) => update("audience_cible", e.target.value)}
            error={errors.audience_cible}
            placeholder="Ex : prospects qui découvrent nos formations, clients existants qui veulent un suivi, équipe interne pour FAQ procédures."
          />
        </div>
      </div>
    </StepCard>
  );
}

// ─── Étape 3 — Projet IA ────────────────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
  toggleArray,
}: {
  form: NexusIaFormData;
  update: <K extends keyof NexusIaFormData>(
    k: K,
    v: NexusIaFormData[K]
  ) => void;
  errors: ValidationErrors;
  toggleArray: (key: "canaux" | "sources_contenu", val: string) => void;
}) {
  const showSupportN1Hint = form.type_projet === "support_n1";
  const showSangoHint = form.langues === "francais_sango";

  return (
    <StepCard
      title="Le projet IA"
      subtitle="Type d'usage, canaux de déploiement, langues et cas concret cible."
    >
      <div className="space-y-5">
        <Select
          label="Type de projet IA *"
          value={form.type_projet}
          onChange={(e) =>
            update("type_projet", e.target.value as typeof form.type_projet)
          }
          error={errors.type_projet}
        >
          <option value="">Sélectionner…</option>
          {TYPES_PROJET.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Select
          label="Langues *"
          value={form.langues}
          onChange={(e) => update("langues", e.target.value as typeof form.langues)}
          error={errors.langues}
        >
          <option value="">Sélectionner…</option>
          {LANGUES_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Canaux de déploiement
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez les canaux où l'assistant doit être disponible.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CANAUX.map((c) => (
              <CheckboxItem
                key={c.value}
                checked={form.canaux.includes(c.value)}
                onChange={() => toggleArray("canaux", c.value)}
                label={c.label}
              />
            ))}
          </div>
        </div>

        <Textarea
          label="Décrivez un cas d'usage concret *"
          rows={4}
          value={form.cas_usage}
          onChange={(e) => update("cas_usage", e.target.value)}
          error={errors.cas_usage}
          placeholder="Ex : un prospect arrive sur notre site, demande nos tarifs et délais. L'IA répond avec les infos clés, qualifie le besoin et propose un RDV avec un consultant."
        />
      </div>

      <div className="mt-6 space-y-3">
        {showSupportN1Hint && (
          <Notice tone="info">
            <strong>Support de niveau 1.</strong> L'IA traite les questions
            répétitives ; les cas non standards basculent vers un humain. La
            procédure d'escalade sera cadrée ensemble.
          </Notice>
        )}
        {showSangoHint && (
          <Notice tone="warn">
            <strong>Sango.</strong> Le sango est une langue avec des
            ressources IA limitées. La qualité d'une IA en sango est
            moindre qu'en français/anglais. Le cadrage senior validera la
            faisabilité.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 4 — Contenus & calendrier ────────────────────────────────────────

function Step4({
  form,
  update,
  errors,
  toggleArray,
}: {
  form: NexusIaFormData;
  update: <K extends keyof NexusIaFormData>(
    k: K,
    v: NexusIaFormData[K]
  ) => void;
  errors: ValidationErrors;
  toggleArray: (key: "canaux" | "sources_contenu", val: string) => void;
}) {
  const showNoContentHint =
    form.sources_contenu.includes("rien_a_construire") &&
    form.sources_contenu.length === 1;
  const showShortDelayBigVolume =
    form.calendrier === "moins_4_semaines" && form.volume_mensuel === "plus_2000";

  return (
    <StepCard
      title="Contenus, volume & calendrier"
      subtitle="Sur quoi l'IA s'appuiera, combien de demandes attendues, quel délai."
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Sources de contenu disponibles
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez ce qui pourra alimenter la connaissance de l'assistant.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SOURCES_CONTENU_OPTIONS.map((s) => (
              <CheckboxItem
                key={s.value}
                checked={form.sources_contenu.includes(s.value)}
                onChange={() => toggleArray("sources_contenu", s.value)}
                label={s.label}
              />
            ))}
          </div>
        </div>

        <Select
          label="Volume mensuel attendu *"
          value={form.volume_mensuel}
          onChange={(e) =>
            update("volume_mensuel", e.target.value as typeof form.volume_mensuel)
          }
          error={errors.volume_mensuel}
        >
          <option value="">Sélectionner…</option>
          {VOLUMES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </Select>

        <Select
          label="Calendrier souhaité *"
          value={form.calendrier}
          onChange={(e) =>
            update("calendrier", e.target.value as typeof form.calendrier)
          }
          error={errors.calendrier}
        >
          <option value="">Sélectionner…</option>
          {CALENDRIERS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        <Select
          label="Budget envisagé *"
          value={form.budget}
          onChange={(e) => update("budget", e.target.value as typeof form.budget)}
          error={errors.budget}
        >
          <option value="">Sélectionner…</option>
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Précisions ou contraintes (optionnel)"
          rows={3}
          value={form.precisions}
          onChange={(e) => update("precisions", e.target.value)}
          placeholder="Ex : intégration nécessaire avec notre CRM, contraintes RGPD, process d'escalade vers tel canal…"
        />
      </div>

      <div className="mt-6 space-y-3">
        {showNoContentHint && (
          <Notice tone="warn">
            <strong>Aucune source de contenu.</strong> Sans base existante,
            la phase de cadrage des contenus ajoute du temps au projet. Pour
            un cas sérieux, prévoyez un calendrier confortable.
          </Notice>
        )}
        {showShortDelayBigVolume && (
          <Notice tone="warn">
            <strong>Volume élevé + délai court.</strong> Plus de 2 000
            conversations / mois en moins de 4 semaines exige des contenus
            prêts et une équipe disponible pour le cadrage. Faisabilité
            validée en cadrage senior.
          </Notice>
        )}
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
  form: NexusIaFormData;
  update: <K extends keyof NexusIaFormData>(
    k: K,
    v: NexusIaFormData[K]
  ) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const fais = computeFaisabilite(form);
  const faisInfo = faisabiliteLabel(fais);
  const checklist = generateChecklist(form);
  const delai = generateDelaiIndicatif(
    form.type_projet,
    form.calendrier,
    form.sources_contenu
  );

  const colorMap: Record<string, string> = {
    emerald:
      "border-emerald-200/60 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    amber:
      "border-amber-200/60 bg-amber-50/60 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    rose: "border-rose-200/60 bg-rose-50/60 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  };

  const canauxLabels = form.canaux
    .map((c) => CANAUX.find((x) => x.value === c)?.label)
    .filter(Boolean)
    .join(", ");

  const sourcesLabels = form.sources_contenu
    .map((s) => SOURCES_CONTENU_OPTIONS.find((x) => x.value === s)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <StepCard
      title="Synthèse de votre projet"
      subtitle="Vérifiez les informations ci-dessous avant envoi. Vous pouvez revenir en arrière pour corriger une étape."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard title="Structure & activité">
            <SummaryLine label="Structure" value={form.nom_structure} />
            <SummaryLine
              label="Type"
              value={typeStructureLabel(form.type_structure)}
            />
          </SummaryCard>

          <SummaryCard title="Projet IA">
            <SummaryLine
              label="Cas d'usage"
              value={typeProjetLabel(form.type_projet)}
            />
            <SummaryLine label="Langues" value={langueLabel(form.langues)} />
            <SummaryLine
              label="Volume / mois"
              value={volumeLabel(form.volume_mensuel)}
            />
            <SummaryLine
              label="Calendrier"
              value={calendrierLabel(form.calendrier)}
            />
            <SummaryLine label="Budget" value={budgetLabel(form.budget)} />
          </SummaryCard>
        </div>

        {(canauxLabels || sourcesLabels) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {canauxLabels && (
              <div className="rounded-2xl border border-line bg-surface-sunken p-5">
                <p className="text-caption font-semibold text-ink">Canaux</p>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {canauxLabels}
                </p>
              </div>
            )}
            {sourcesLabels && (
              <div className="rounded-2xl border border-line bg-surface-sunken p-5">
                <p className="text-caption font-semibold text-ink">
                  Sources de contenu
                </p>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {sourcesLabels}
                </p>
              </div>
            )}
          </div>
        )}

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
                <h3 className="text-title text-ink">Calendrier indicatif</h3>
              </div>
              <p className="font-display text-body text-ink">{delai}</p>
              <p className="mt-2 text-caption text-ink-muted">
                Calendrier final confirmé après cadrage senior.
              </p>
            </div>
          )}
        </div>

        {/* Rappel */}
        <div className="rounded-3xl border border-line bg-surface-sunken p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            <h3 className="text-title text-ink">L'IA augmente, ne remplace pas</h3>
          </div>
          <p className="text-body-sm text-ink-muted">
            L'assistant IA prend en charge les tâches répétitives. Pour les
            cas sensibles ou complexes, l'escalade vers un humain est
            systématique et clairement visible.
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
              label="J'accepte que Nexus RCA examine mon projet IA et propose une démo + un devis fixe."
            />
            <ConsentCheckbox
              checked={form.consentement_donnees}
              onChange={(v) => update("consentement_donnees", v)}
              error={errors.consentement_donnees}
              label="Je m'engage à fournir uniquement des contenus dont j'ai les droits d'utilisation pour l'entraînement / l'alimentation de l'assistant."
            />
            <ConsentCheckbox
              checked={form.consentement_traitement}
              onChange={(v) => update("consentement_traitement", v)}
              error={errors.consentement_traitement}
              label="J'autorise le traitement de mes données et celles de ma structure dans le cadre de cette demande."
            />
          </div>
        </div>

        {/* CTA submit */}
        <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-headline text-ink sm:text-display-sm">
              Prêt à recevoir une démo ?
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Un conseiller Nexus revient sous 48 heures ouvrées avec une
              démo et un devis fixe pour votre assistant IA dédié.
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
            Envoyer ma demande pour cadrage
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

function buildSubmissionDescription(form: NexusIaFormData): string {
  const fais = computeFaisabilite(form);

  const canauxLabels = form.canaux
    .map((c) => CANAUX.find((x) => x.value === c)?.label)
    .filter(Boolean)
    .join(", ");

  const sourcesLabels = form.sources_contenu
    .map((s) => SOURCES_CONTENU_OPTIONS.find((x) => x.value === s)?.label)
    .filter(Boolean)
    .join(", ");

  const lines = [
    `Demande Nexus IA — assistant dédié — soumise via formulaire.`,
    ``,
    `Structure :`,
    `- Nom : ${form.nom_structure}`,
    `- Type : ${typeStructureLabel(form.type_structure)}`,
    `- Activité : ${form.description_activite}`,
    `- Audience : ${form.audience_cible}`,
    ``,
    `Projet IA :`,
    `- Type : ${typeProjetLabel(form.type_projet)}`,
    `- Langues : ${langueLabel(form.langues)}`,
    canauxLabels ? `- Canaux : ${canauxLabels}` : "",
    `- Cas d'usage : ${form.cas_usage}`,
    ``,
    `Production :`,
    sourcesLabels ? `- Sources : ${sourcesLabels}` : "",
    `- Volume mensuel : ${volumeLabel(form.volume_mensuel)}`,
    `- Calendrier : ${calendrierLabel(form.calendrier)}`,
    `- Budget : ${budgetLabel(form.budget)}`,
    form.precisions ? `- Précisions : ${form.precisions}` : "",
    ``,
    `Estimation préliminaire (auto) : ${faisabiliteLabel(fais).label}`,
  ];

  return lines.filter(Boolean).join("\n");
}

// ─── Écran SUCCESS ──────────────────────────────────────────────────────────

function SuccessScreen({
  reference,
  form,
  router,
}: {
  reference: string;
  form: NexusIaFormData;
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
          Votre projet a été reçu.
        </h1>
        <p className="mt-4 text-body-lg text-ink-muted">
          Merci <strong className="text-ink">{form.nom_complet}</strong>. Un
          conseiller Nexus prépare votre cadrage et une démo personnalisée
          de l'assistant IA pour <strong className="text-ink">{form.nom_structure}</strong>.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken px-4 py-2">
          <span className="text-overline text-ink-muted">Référence</span>
          <span className="font-mono text-body-sm font-semibold text-ink">
            {reference}
          </span>
        </div>

        <p className="mt-4 text-caption text-ink-muted">
          Un récapitulatif vous a été envoyé par e-mail. Délai de prise de
          contact : 48 heures ouvrées.
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
              `Bonjour Nexus, je viens de soumettre mon projet Nexus IA ${reference}.`
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
