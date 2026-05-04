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
  FileText,
  GraduationCap,
  Globe,
  Info,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  ANGLAIS_LEVELS,
  BOURSES_FORM_STORAGE_KEY,
  CALENDRIERS,
  DEFAULT_BOURSES_FORM,
  DIPLOMES_OPTIONS,
  DOCUMENTS_OPTIONS,
  DOMAINES,
  FINANCEMENT_OPTIONS,
  FRANCAIS_LEVELS,
  MOYENNES,
  NIVEAUX_ACTUELS,
  NIVEAUX_VISES,
  PAYS_RESIDENCE_OPTIONS,
  PROVINCES,
  TRANCHES_AGE,
  anglaisLabel,
  calendrierLabel,
  computeFaisabilite,
  domaineLabel,
  faisabiliteLabel,
  financementLabel,
  francaisLabel,
  generateChecklist,
  generateDelaiIndicatif,
  moyenneLabel,
  niveauActuelLabel,
  niveauViseLabel,
  provinceLabel,
  requiresSeniorAnalysis,
  trancheAgeLabel,
  validateStep,
  type BoursesFormData,
  type ValidationErrors,
} from "@/lib/bourses-form";
import { whatsappLink, cn } from "@/lib/utils";

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Profil", icon: User },
  { id: 2, title: "Projet", icon: GraduationCap },
  { id: 3, title: "Parcours", icon: ClipboardCheck },
  { id: 4, title: "Situation", icon: FileText },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function BoursesForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<BoursesFormData>(DEFAULT_BOURSES_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const draft = localStorage.getItem(BOURSES_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<BoursesFormData>;
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
      localStorage.setItem(BOURSES_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  const update = <K extends keyof BoursesFormData>(
    key: K,
    value: BoursesFormData[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const toggleArray = (
    key: "diplomes_obtenus" | "documents_disponibles",
    val: string
  ) => {
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

      const objet = `Études Canada — ${niveauViseLabel(form.niveau_vise)} en ${domaineLabel(form.domaine)}`;
      const description = buildSubmissionDescription(form);
      const demandeId = crypto.randomUUID();

      const { error } = await supabase.from("demandes").insert({
        id: demandeId,
        client_id: user?.id ?? null,
        nom_complet: form.nom_complet,
        email: form.email,
        telephone: form.telephone,
        pays: form.pays_residence,
        ville: "",
        langue_preferee: "Francais",
        service: "Etudes Canada",
        objet,
        description,
        urgence: senior ? "elevee" : "normale",
        date_souhaitee: form.rentree_souhaitee
          ? `${form.rentree_souhaitee}-01`
          : null,
        pays_concerne: "Canada",
        destination: provinceLabel(form.province_cible),
        budget_estimatif: form.budget_annuel || "",
        traitement_prioritaire: senior,
        source: "formulaire_bourses",
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
        localStorage.removeItem(BOURSES_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-CAN-${demandeId.slice(0, 8).toUpperCase()}`);
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
            <GraduationCap className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">Service études Canada</p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Étude de faisabilité — Études au Canada
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 7 minutes. Vos réponses nous permettent d'établir un bilan
          de faisabilité honnête de votre projet d'études. Un conseiller Nexus
          reprend contact sous 24 heures ouvrées.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          <Pill icon={ShieldCheck} label="Confidentiel" />
          <Pill icon={CheckCircle2} label="Gratuit" />
          <Pill icon={Info} label="Sans engagement" />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-body font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
          >
            <FileText className="h-5 w-5" />
            Commencer l'analyse
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-caption text-ink-muted">
            Vous préférez parler à quelqu'un d'abord ?{" "}
            <Link
              href="/rendez-vous?service=bourses"
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

// ─── Card commune ───────────────────────────────────────────────────────────

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

// ─── Étape 1 — Profil ───────────────────────────────────────────────────────

function Step1({
  form,
  update,
  errors,
}: {
  form: BoursesFormData;
  update: <K extends keyof BoursesFormData>(
    k: K,
    v: BoursesFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  return (
    <StepCard
      title="Votre profil"
      subtitle="Informations de contact et niveau d'études actuel."
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
        <Select
          label="Pays de résidence *"
          value={form.pays_residence}
          onChange={(e) =>
            update(
              "pays_residence",
              e.target.value as typeof form.pays_residence
            )
          }
          error={errors.pays_residence}
        >
          <option value="">Sélectionner…</option>
          {PAYS_RESIDENCE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select
          label="Tranche d'âge *"
          value={form.tranche_age}
          onChange={(e) =>
            update("tranche_age", e.target.value as typeof form.tranche_age)
          }
          error={errors.tranche_age}
        >
          <option value="">Sélectionner…</option>
          {TRANCHES_AGE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select
          label="Niveau d'études actuel *"
          value={form.niveau_actuel}
          onChange={(e) =>
            update(
              "niveau_actuel",
              e.target.value as typeof form.niveau_actuel
            )
          }
          error={errors.niveau_actuel}
        >
          <option value="">Sélectionner…</option>
          {NIVEAUX_ACTUELS.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </Select>
      </div>
    </StepCard>
  );
}

// ─── Étape 2 — Projet ───────────────────────────────────────────────────────

function Step2({
  form,
  update,
  errors,
}: {
  form: BoursesFormData;
  update: <K extends keyof BoursesFormData>(
    k: K,
    v: BoursesFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const showShortDelay = form.calendrier === "moins_3_mois";
  const showLongRunway = form.calendrier === "plus_12_mois";
  const showQuebecHint = form.province_cible === "quebec";
  const showDoctoratHint =
    form.niveau_vise === "doctorat" &&
    form.niveau_actuel !== "" &&
    form.niveau_actuel !== "master" &&
    form.niveau_actuel !== "doctorat";

  return (
    <StepCard
      title="Votre projet d'études"
      subtitle="Niveau visé, domaine et calendrier cible."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Niveau visé *"
          value={form.niveau_vise}
          onChange={(e) =>
            update("niveau_vise", e.target.value as typeof form.niveau_vise)
          }
          error={errors.niveau_vise}
        >
          <option value="">Sélectionner…</option>
          {NIVEAUX_VISES.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </Select>
        <Select
          label="Domaine d'études *"
          value={form.domaine}
          onChange={(e) =>
            update("domaine", e.target.value as typeof form.domaine)
          }
          error={errors.domaine}
        >
          <option value="">Sélectionner…</option>
          {DOMAINES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
        <Select
          label="Province cible *"
          value={form.province_cible}
          onChange={(e) =>
            update(
              "province_cible",
              e.target.value as typeof form.province_cible
            )
          }
          error={errors.province_cible}
        >
          <option value="">Sélectionner…</option>
          {PROVINCES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select
          label="Calendrier avant la rentrée *"
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
        <Input
          label="Mois de rentrée souhaité"
          type="month"
          value={form.rentree_souhaitee}
          onChange={(e) => update("rentree_souhaitee", e.target.value)}
        />
      </div>

      <div className="mt-6 space-y-3">
        {showShortDelay && (
          <Notice tone="warn">
            <strong>Calendrier très serré.</strong> Une admission au Canada
            demande généralement 6 à 12 mois de préparation. Un conseiller
            étudiera la faisabilité réelle et proposera une rentrée ajustée si
            nécessaire.
          </Notice>
        )}
        {showLongRunway && (
          <Notice tone="info">
            <strong>Calendrier confortable.</strong> Vous disposez du temps
            nécessaire pour une stratégie d'établissement multiple, la
            recherche d'aides financières et la préparation linguistique
            (TCF/IELTS).
          </Notice>
        )}
        {showQuebecHint && (
          <Notice tone="neutral">
            <strong>Spécificité Québec.</strong> Le Québec délivre un{" "}
            <strong>CAQ</strong> (Certificat d'acceptation) en plus du permis
            d'études IRCC. Nous prenons en charge les deux.
          </Notice>
        )}
        {showDoctoratHint && (
          <Notice tone="warn">
            <strong>Doctorat sans master déclaré.</strong> Un doctorat exige
            généralement un master préalable. Le conseiller validera ce point
            lors de l'analyse de faisabilité.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 3 — Parcours académique ──────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
  toggleArray,
}: {
  form: BoursesFormData;
  update: <K extends keyof BoursesFormData>(
    k: K,
    v: BoursesFormData[K]
  ) => void;
  errors: ValidationErrors;
  toggleArray: (
    key: "diplomes_obtenus" | "documents_disponibles",
    val: string
  ) => void;
}) {
  const showLowGradeFlag = form.derniere_moyenne === "moins_10";
  const showLanguageFlag =
    form.francais_niveau !== "" &&
    form.francais_niveau !== "natif" &&
    form.francais_niveau !== "courant_b2_c1" &&
    form.tcf_passe !== "oui";

  return (
    <StepCard
      title="Votre parcours académique"
      subtitle="Diplômes obtenus, niveau de langue, résultats récents."
    >
      <div className="space-y-6">
        <Select
          label="Moyenne de votre dernier cycle *"
          value={form.derniere_moyenne}
          onChange={(e) =>
            update(
              "derniere_moyenne",
              e.target.value as typeof form.derniere_moyenne
            )
          }
          error={errors.derniere_moyenne}
        >
          <option value="">Sélectionner…</option>
          {MOYENNES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Diplômes obtenus
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez tous les diplômes que vous avez déjà obtenus.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DIPLOMES_OPTIONS.map((d) => (
              <CheckboxItem
                key={d.value}
                checked={form.diplomes_obtenus.includes(d.value)}
                onChange={() => toggleArray("diplomes_obtenus", d.value)}
                label={d.label}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Niveau de français *"
            value={form.francais_niveau}
            onChange={(e) =>
              update(
                "francais_niveau",
                e.target.value as typeof form.francais_niveau
              )
            }
            error={errors.francais_niveau}
          >
            <option value="">Sélectionner…</option>
            {FRANCAIS_LEVELS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <Select
            label="Niveau d'anglais"
            value={form.anglais_niveau}
            onChange={(e) =>
              update(
                "anglais_niveau",
                e.target.value as typeof form.anglais_niveau
              )
            }
          >
            <option value="">Sélectionner…</option>
            {ANGLAIS_LEVELS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Avez-vous passé le TCF Canada ? *
          </p>
          <RadioGroup
            name="tcf_passe"
            value={form.tcf_passe}
            onChange={(v) =>
              update("tcf_passe", v as typeof form.tcf_passe)
            }
            options={[
              { value: "oui", label: "Oui, déjà passé" },
              { value: "prevu", label: "Prévu prochainement" },
              { value: "non", label: "Non, jamais passé" },
            ]}
            error={errors.tcf_passe}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {showLowGradeFlag && (
          <Notice tone="warn">
            <strong>Niveau académique à analyser.</strong> Les établissements
            canadiens ont des seuils d'admission. Un conseiller senior étudiera
            les options réalistes pour votre profil avant tout engagement.
          </Notice>
        )}
        {showLanguageFlag && (
          <Notice tone="info">
            <strong>Préparation linguistique recommandée.</strong> Sans
            certification de français reconnue, l'admission peut être limitée.
            Notre service{" "}
            <Link
              href="/services/tcf"
              className="font-semibold underline underline-offset-4"
            >
              Préparation TCF Canada
            </Link>{" "}
            peut être un prérequis utile.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 4 — Situation ────────────────────────────────────────────────────

function Step4({
  form,
  update,
  errors,
  toggleArray,
}: {
  form: BoursesFormData;
  update: <K extends keyof BoursesFormData>(
    k: K,
    v: BoursesFormData[K]
  ) => void;
  errors: ValidationErrors;
  toggleArray: (
    key: "diplomes_obtenus" | "documents_disponibles",
    val: string
  ) => void;
}) {
  const showBourseHint = form.financement_source === "bourse_indispensable";

  return (
    <StepCard
      title="Votre situation"
      subtitle="Financement prévu, ancrage RCA, motivation et documents disponibles."
    >
      <div className="space-y-6">
        <Select
          label="Source de financement principale *"
          value={form.financement_source}
          onChange={(e) =>
            update(
              "financement_source",
              e.target.value as typeof form.financement_source
            )
          }
          error={errors.financement_source}
        >
          <option value="">Sélectionner…</option>
          {FINANCEMENT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>

        <Input
          label="Budget annuel disponible (FCFA, optionnel)"
          value={form.budget_annuel}
          onChange={(e) => update("budget_annuel", e.target.value)}
          placeholder="ex : 5 millions FCFA, ou plage"
        />

        <Textarea
          label="Lien avec la RCA / preuve d'ancrage *"
          rows={3}
          value={form.ancrage_rca}
          onChange={(e) => update("ancrage_rca", e.target.value)}
          error={errors.ancrage_rca}
          placeholder="Ex : famille proche en RCA, propriété, futur retour prévu, etc."
        />
        <p className="-mt-3 text-caption text-ink-muted">
          IRCC apprécie les profils dont le retour au pays est crédible.
        </p>

        <Textarea
          label="Pourquoi le Canada ? Pourquoi ce programme ? *"
          rows={4}
          value={form.raison_choix_canada}
          onChange={(e) => update("raison_choix_canada", e.target.value)}
          error={errors.raison_choix_canada}
          placeholder="Précisez votre motivation : projet professionnel, intérêt académique, lien avec votre parcours actuel."
        />

        {showBourseHint && (
          <Notice tone="warn">
            <strong>Bourse indispensable au projet.</strong> Les bourses
            complètes sont rares. Nous évaluerons les options réalistes
            (bourses partielles, programmes ciblés) selon votre profil et nous
            vous dirons honnêtement la viabilité du projet.
          </Notice>
        )}

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Documents déjà disponibles
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez ce que vous avez. Pas grave si vous n'avez rien — nous vous
            accompagnons.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DOCUMENTS_OPTIONS.map((d) => (
              <CheckboxItem
                key={d.value}
                checked={form.documents_disponibles.includes(d.value)}
                onChange={() => toggleArray("documents_disponibles", d.value)}
                label={d.label}
              />
            ))}
          </div>
        </div>
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
  form: BoursesFormData;
  update: <K extends keyof BoursesFormData>(
    k: K,
    v: BoursesFormData[K]
  ) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const fais = computeFaisabilite(form);
  const faisInfo = faisabiliteLabel(fais);
  const checklist = generateChecklist(form.niveau_vise, form.province_cible);
  const delai = generateDelaiIndicatif(form.calendrier, form.niveau_vise);

  const colorMap: Record<string, string> = {
    emerald:
      "border-emerald-200/60 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    amber:
      "border-amber-200/60 bg-amber-50/60 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    rose: "border-rose-200/60 bg-rose-50/60 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  };

  return (
    <StepCard
      title="Synthèse de votre projet"
      subtitle="Vérifiez les informations ci-dessous avant envoi. Vous pouvez revenir en arrière pour corriger une étape."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard title="Votre projet">
            <SummaryLine
              label="Niveau visé"
              value={niveauViseLabel(form.niveau_vise)}
            />
            <SummaryLine
              label="Domaine"
              value={domaineLabel(form.domaine)}
            />
            <SummaryLine
              label="Province"
              value={provinceLabel(form.province_cible)}
            />
            <SummaryLine
              label="Calendrier"
              value={calendrierLabel(form.calendrier)}
            />
            <SummaryLine
              label="Rentrée"
              value={form.rentree_souhaitee || "À définir"}
            />
          </SummaryCard>

          <SummaryCard title="Votre profil">
            <SummaryLine
              label="Niveau actuel"
              value={niveauActuelLabel(form.niveau_actuel)}
            />
            <SummaryLine
              label="Moyenne"
              value={moyenneLabel(form.derniere_moyenne)}
            />
            <SummaryLine
              label="Français"
              value={francaisLabel(form.francais_niveau)}
            />
            <SummaryLine
              label="Anglais"
              value={anglaisLabel(form.anglais_niveau)}
            />
            <SummaryLine
              label="TCF Canada"
              value={form.tcf_passe || "—"}
            />
            <SummaryLine
              label="Financement"
              value={financementLabel(form.financement_source)}
            />
          </SummaryCard>
        </div>

        {/* Faisabilité */}
        <div className={cn("rounded-3xl border p-6 sm:p-7", colorMap[faisInfo.color])}>
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
                <h3 className="text-title text-ink">Documents à préparer</h3>
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
              <p className="font-display text-headline text-ink">{delai}</p>
              <p className="mt-2 text-caption text-ink-muted">
                Cette estimation sera affinée par votre conseiller après
                l'analyse complète.
              </p>
            </div>
          )}
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
              label="J'accepte que Nexus RCA examine mon projet d'études et mes documents."
            />
            <ConsentCheckbox
              checked={form.consentement_traitement}
              onChange={(v) => update("consentement_traitement", v)}
              error={errors.consentement_traitement}
              label="J'autorise le traitement de mes données personnelles dans le cadre de cette demande."
            />
            <ConsentCheckbox
              checked={true}
              onChange={() => {}}
              disabled
              label="Je reconnais qu'aucune obtention d'admission, de bourse ou de visa n'est garantie et que Nexus RCA fournit un service d'accompagnement professionnel."
            />
          </div>
        </div>

        {/* CTA submit */}
        <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-headline text-ink sm:text-display-sm">
              Prêt à soumettre votre projet ?
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Un conseiller Nexus reprend contact sous 24 heures ouvrées avec
              le bilan de faisabilité complet et la suite du processus.
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
            Envoyer ma demande pour étude
          </button>
        </div>
      </div>
    </StepCard>
  );
}

// ─── Composants utilitaires ────────────────────────────────────────────────

function RadioGroup({
  name,
  value,
  onChange,
  options,
  error,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors",
              value === o.value
                ? "border-brand bg-brand-subtle/50"
                : "border-line bg-surface-elevated hover:border-brand/40"
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="h-4 w-4 shrink-0 cursor-pointer text-brand focus:ring-brand/30"
            />
            <span className="text-body-sm text-ink">{o.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-caption text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </>
  );
}

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

function buildSubmissionDescription(form: BoursesFormData): string {
  const fais = computeFaisabilite(form);

  const lines = [
    `Demande Études Canada — soumise via formulaire dédié.`,
    ``,
    `Projet :`,
    `- Niveau visé : ${niveauViseLabel(form.niveau_vise)}`,
    `- Domaine : ${domaineLabel(form.domaine)}`,
    `- Province : ${provinceLabel(form.province_cible)}`,
    `- Calendrier : ${calendrierLabel(form.calendrier)}`,
    `- Rentrée souhaitée : ${form.rentree_souhaitee || "À définir"}`,
    ``,
    `Profil :`,
    `- Niveau actuel : ${niveauActuelLabel(form.niveau_actuel)}`,
    `- Moyenne dernier cycle : ${moyenneLabel(form.derniere_moyenne)}`,
    `- Français : ${francaisLabel(form.francais_niveau)}`,
    `- Anglais : ${anglaisLabel(form.anglais_niveau)}`,
    `- TCF passé : ${form.tcf_passe}`,
    `- Diplômes obtenus : ${form.diplomes_obtenus.join(", ") || "aucun"}`,
    ``,
    `Situation :`,
    `- Financement principal : ${financementLabel(form.financement_source)}`,
    form.budget_annuel ? `- Budget annuel : ${form.budget_annuel}` : "",
    `- Ancrage RCA : ${form.ancrage_rca}`,
    `- Motivation : ${form.raison_choix_canada}`,
    `- Documents disponibles : ${form.documents_disponibles.join(", ") || "aucun"}`,
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
  form: BoursesFormData;
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
          conseiller Nexus étudie votre projet selon notre méthodologie. Si
          votre dossier correspond à nos critères, nous vous proposons un
          accompagnement et un devis fixe. Sinon, nous vous le disons
          franchement et vous orientons.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken px-4 py-2">
          <span className="text-overline text-ink-muted">Référence</span>
          <span className="font-mono text-body-sm font-semibold text-ink">
            {reference}
          </span>
        </div>

        <p className="mt-4 text-caption text-ink-muted">
          Un récapitulatif vous a été envoyé par e-mail. Délai de prise de
          contact : 24 heures ouvrées.
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
              `Bonjour Nexus, je viens de soumettre ma demande Études Canada ${reference}.`
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
