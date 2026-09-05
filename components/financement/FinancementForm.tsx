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
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HandCoins,
  Handshake,
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
  APPORTS,
  DEFAULT_FINANCEMENT_FORM,
  DOCUMENTS_OPTIONS,
  ENGAGEMENTS,
  EQUIPES,
  EXPERIENCES_SECTEUR,
  FINANCEMENT_FORM_STORAGE_KEY,
  MONTANTS,
  PAYS_RESIDENCE_OPTIONS,
  PROFILS_PORTEUR,
  SECTEURS,
  STADES,
  STRUCTURES,
  apportLabel,
  computeFaisabilite,
  engagementLabel,
  equipeLabel,
  experienceLabel,
  faisabiliteLabel,
  generateChecklist,
  generateDelaiIndicatif,
  montantLabel,
  profilPorteurLabel,
  requiresSeniorAnalysis,
  secteurLabel,
  stadeLabel,
  structureLabel,
  validateStep,
  type FinancementFormData,
  type ValidationErrors,
} from "@/lib/financement-form";
import { whatsappLink, cn } from "@/lib/utils";

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Porteur", icon: User },
  { id: 2, title: "Projet", icon: Briefcase },
  { id: 3, title: "Engagement", icon: Handshake },
  { id: 4, title: "Situation", icon: FileText },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function FinancementForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<FinancementFormData>(
    DEFAULT_FINANCEMENT_FORM
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
      const draft = localStorage.getItem(FINANCEMENT_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<FinancementFormData>;
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
      localStorage.setItem(FINANCEMENT_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  const update = <K extends keyof FinancementFormData>(
    key: K,
    value: FinancementFormData[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const toggleDocument = (val: string) => {
    setForm((f) => {
      const has = f.documents_disponibles.includes(val);
      return {
        ...f,
        documents_disponibles: has
          ? f.documents_disponibles.filter((d) => d !== val)
          : [...f.documents_disponibles, val],
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

      const objet = `Financement & partenariat — ${form.nom_projet} (${secteurLabel(form.secteur)})`;
      const description = buildSubmissionDescription(form);
      const demandeId = crypto.randomUUID();

      const { error } = await supabase.from("demandes").insert({
        id: demandeId,
        client_id: user?.id ?? null,
        nom_complet: form.nom_complet,
        email: form.email,
        telephone: form.telephone,
        pays: form.pays_residence,
        ville: form.localisation_projet || "",
        langue_preferee: "Francais",
        service: "Financement",
        objet,
        description,
        urgence: senior ? "elevee" : "normale",
        date_souhaitee: null,
        pays_concerne: "RCA",
        destination: form.localisation_projet || "",
        budget_estimatif: montantLabel(form.montant_recherche),
        traitement_prioritaire: senior,
        source: "formulaire_financement",
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
        localStorage.removeItem(FINANCEMENT_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-FIN-${demandeId.slice(0, 8).toUpperCase()}`);
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
            <HandCoins className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">
          Service financement & partenariat
        </p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Étude de faisabilité — Cofinancement de projet
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 6 minutes. Vos réponses nous permettent d'évaluer la
          cohérence de votre projet et de nous prononcer honnêtement sur la
          possibilité d'un partenariat. Un conseiller Nexus reprend contact
          sous 24 heures ouvrées.
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
            Soumettre mon projet
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-caption text-ink-muted">
            Vous préférez parler à quelqu'un d'abord ?{" "}
            <Link
              href="/rendez-vous?service=financement"
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

// ─── Étape 1 — Porteur ──────────────────────────────────────────────────────

function Step1({
  form,
  update,
  errors,
}: {
  form: FinancementFormData;
  update: <K extends keyof FinancementFormData>(
    k: K,
    v: FinancementFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const showDiasporaHint = form.profil_porteur === "diaspora_investisseur";

  return (
    <StepCard
      title="Le porteur du projet"
      subtitle="Identité, contact et profil de la personne ou du groupe à l'origine du projet."
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
        <div className="sm:col-span-2">
          <Select
            label="Profil du porteur *"
            value={form.profil_porteur}
            onChange={(e) =>
              update(
                "profil_porteur",
                e.target.value as typeof form.profil_porteur
              )
            }
            error={errors.profil_porteur}
          >
            <option value="">Sélectionner…</option>
            {PROFILS_PORTEUR.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {showDiasporaHint && (
        <div className="mt-6">
          <Notice tone="info">
            <strong>Porteur en diaspora.</strong> Un projet porté à distance
            exige un référent ou un opérateur local crédible. Nous le validerons
            ensemble lors de l'analyse — c'est un point déterminant pour
            l'acceptation du dossier.
          </Notice>
        </div>
      )}
    </StepCard>
  );
}

// ─── Étape 2 — Projet ───────────────────────────────────────────────────────

function Step2({
  form,
  update,
  errors,
}: {
  form: FinancementFormData;
  update: <K extends keyof FinancementFormData>(
    k: K,
    v: FinancementFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const showIdeaWarning =
    form.stade === "idee" &&
    (form.montant_recherche === "50_100m" ||
      form.montant_recherche === "100m_plus");
  const showSmallAmountInfo = form.montant_recherche === "moins_5m";
  const showEstablishedActivity = form.stade === "active_etablie";

  return (
    <StepCard
      title="Votre projet"
      subtitle="Nature du projet, secteur, stade d'avancement et fourchette de financement."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Nom du projet *"
            value={form.nom_projet}
            onChange={(e) => update("nom_projet", e.target.value)}
            error={errors.nom_projet}
            placeholder="Ex : Ferme avicole Boali, Restaurant La Sangha…"
          />
        </div>
        <Select
          label="Secteur d'activité *"
          value={form.secteur}
          onChange={(e) =>
            update("secteur", e.target.value as typeof form.secteur)
          }
          error={errors.secteur}
        >
          <option value="">Sélectionner…</option>
          {SECTEURS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select
          label="Stade du projet *"
          value={form.stade}
          onChange={(e) =>
            update("stade", e.target.value as typeof form.stade)
          }
          error={errors.stade}
        >
          <option value="">Sélectionner…</option>
          {STADES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Input
          label="Localisation du projet *"
          value={form.localisation_projet}
          onChange={(e) => update("localisation_projet", e.target.value)}
          error={errors.localisation_projet}
          placeholder="Ville / quartier en RCA"
        />
        <Select
          label="Fourchette de financement recherché *"
          value={form.montant_recherche}
          onChange={(e) =>
            update(
              "montant_recherche",
              e.target.value as typeof form.montant_recherche
            )
          }
          error={errors.montant_recherche}
        >
          <option value="">Sélectionner…</option>
          {MONTANTS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Textarea
            label="Description courte du projet *"
            rows={4}
            value={form.description_courte}
            onChange={(e) => update("description_courte", e.target.value)}
            error={errors.description_courte}
            placeholder="Décrivez en quelques phrases votre projet : activité prévue, clients ciblés, ce que le financement permettra de faire."
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {showIdeaWarning && (
          <Notice tone="warn">
            <strong>Idée + montant élevé.</strong> Nexus n'engage pas de
            cofinancement sur des idées non structurées au-delà de 50 millions
            FCFA. Une phase préalable de structuration (6 à 12 mois) sera
            proposée avant tout engagement financier.
          </Notice>
        )}
        {showSmallAmountInfo && (
          <Notice tone="info">
            <strong>Petit ticket.</strong> Les projets de moins de 5 millions
            FCFA sont étudiés selon des critères allégés. Notre accompagnement
            reste exigeant sur l'engagement du porteur et la viabilité.
          </Notice>
        )}
        {showEstablishedActivity && (
          <Notice tone="info">
            <strong>Activité établie.</strong> Pour les projets en
            développement, les états financiers et la situation des dettes
            seront déterminants. Préparez ces éléments à l'étape suivante.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 3 — Engagement ───────────────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
}: {
  form: FinancementFormData;
  update: <K extends keyof FinancementFormData>(
    k: K,
    v: FinancementFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const showLowApportFlag = form.apport_personnel === "moins_5_pct";
  const showNoExpFlag =
    form.experience_secteur === "aucune" &&
    (form.montant_recherche === "50_100m" ||
      form.montant_recherche === "100m_plus");
  const showPartialEngagement =
    form.engagement_porteur === "non_defini" &&
    form.montant_recherche !== "moins_5m" &&
    form.montant_recherche !== "";

  return (
    <StepCard
      title="Votre engagement personnel"
      subtitle="Apport, équipe, niveau d'implication et expérience dans le secteur."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Apport personnel disponible *"
          value={form.apport_personnel}
          onChange={(e) =>
            update(
              "apport_personnel",
              e.target.value as typeof form.apport_personnel
            )
          }
          error={errors.apport_personnel}
        >
          <option value="">Sélectionner…</option>
          {APPORTS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </Select>
        <Select
          label="Configuration de l'équipe *"
          value={form.equipe}
          onChange={(e) =>
            update("equipe", e.target.value as typeof form.equipe)
          }
          error={errors.equipe}
        >
          <option value="">Sélectionner…</option>
          {EQUIPES.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </Select>
        <Select
          label="Niveau d'engagement personnel *"
          value={form.engagement_porteur}
          onChange={(e) =>
            update(
              "engagement_porteur",
              e.target.value as typeof form.engagement_porteur
            )
          }
          error={errors.engagement_porteur}
        >
          <option value="">Sélectionner…</option>
          {ENGAGEMENTS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </Select>
        <Select
          label="Expérience dans ce secteur *"
          value={form.experience_secteur}
          onChange={(e) =>
            update(
              "experience_secteur",
              e.target.value as typeof form.experience_secteur
            )
          }
          error={errors.experience_secteur}
        >
          <option value="">Sélectionner…</option>
          {EXPERIENCES_SECTEUR.map((x) => (
            <option key={x.value} value={x.value}>
              {x.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {showLowApportFlag && (
          <Notice tone="warn">
            <strong>Apport personnel faible.</strong> Sans apport significatif,
            l'engagement du porteur est jugé insuffisant. Ce point sera étudié
            par un conseiller senior — il peut être bloquant pour un
            cofinancement classique.
          </Notice>
        )}
        {showNoExpFlag && (
          <Notice tone="warn">
            <strong>Premier projet sur un montant élevé.</strong> Sans
            expérience préalable, un projet à 50M+ FCFA exige un mentor ou un
            opérationnel expérimenté. Ce point devra être clarifié pour
            envisager un partenariat.
          </Notice>
        )}
        {showPartialEngagement && (
          <Notice tone="warn">
            <strong>Engagement non défini.</strong> Pour un projet à ce niveau
            de financement, Nexus a besoin d'un porteur engagé à temps plein ou
            à minima d'une équipe opérationnelle dédiée. Précisez ce point lors
            de l'entretien.
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
  toggleDocument,
}: {
  form: FinancementFormData;
  update: <K extends keyof FinancementFormData>(
    k: K,
    v: FinancementFormData[K]
  ) => void;
  errors: ValidationErrors;
  toggleDocument: (val: string) => void;
}) {
  const showInformalHint = form.structure_existante === "personne_physique";

  return (
    <StepCard
      title="Votre situation et votre vision"
      subtitle="Structure juridique, ancrage local, vision long terme et documents disponibles."
    >
      <div className="space-y-6">
        <Select
          label="Structure juridique actuelle *"
          value={form.structure_existante}
          onChange={(e) =>
            update(
              "structure_existante",
              e.target.value as typeof form.structure_existante
            )
          }
          error={errors.structure_existante}
        >
          <option value="">Sélectionner…</option>
          {STRUCTURES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Lien avec la RCA / ancrage local *"
          rows={3}
          value={form.ancrage_rca}
          onChange={(e) => update("ancrage_rca", e.target.value)}
          error={errors.ancrage_rca}
          placeholder="Ex : famille à Bangui, terrain à Bossangoa, présence physique régulière, équipe locale, etc."
        />
        <p className="-mt-3 text-caption text-ink-muted">
          Un ancrage local crédible est déterminant pour Nexus. Nous
          n'accompagnons pas de projets à distance sans relais opérationnel
          réel.
        </p>

        <Textarea
          label="Vision à long terme du projet *"
          rows={4}
          value={form.vision_long_terme}
          onChange={(e) => update("vision_long_terme", e.target.value)}
          error={errors.vision_long_terme}
          placeholder="Quelle est l'ambition à 3-5 ans ? Quel impact pour vos clients, vos employés, votre territoire ?"
        />

        {showInformalHint && (
          <Notice tone="info">
            <strong>Personne physique.</strong> Pas de souci à ce stade —
            l'immatriculation peut faire partie de l'accompagnement. Précisez
            simplement votre vision juridique pour la suite.
          </Notice>
        )}

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Documents déjà disponibles
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez ce que vous avez déjà préparé. Pas grave si vous n'avez
            rien — nous vous accompagnons dans la structuration.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DOCUMENTS_OPTIONS.map((d) => (
              <CheckboxItem
                key={d.value}
                checked={form.documents_disponibles.includes(d.value)}
                onChange={() => toggleDocument(d.value)}
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
  form: FinancementFormData;
  update: <K extends keyof FinancementFormData>(
    k: K,
    v: FinancementFormData[K]
  ) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const fais = computeFaisabilite(form);
  const faisInfo = faisabiliteLabel(fais);
  const checklist = generateChecklist(form.stade, form.structure_existante);
  const delai = generateDelaiIndicatif(form.stade, form.montant_recherche);

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
          <SummaryCard title="Le projet">
            <SummaryLine label="Nom" value={form.nom_projet} />
            <SummaryLine label="Secteur" value={secteurLabel(form.secteur)} />
            <SummaryLine label="Stade" value={stadeLabel(form.stade)} />
            <SummaryLine
              label="Localisation"
              value={form.localisation_projet}
            />
            <SummaryLine
              label="Montant"
              value={montantLabel(form.montant_recherche)}
            />
          </SummaryCard>

          <SummaryCard title="Le porteur">
            <SummaryLine
              label="Profil"
              value={profilPorteurLabel(form.profil_porteur)}
            />
            <SummaryLine
              label="Apport"
              value={apportLabel(form.apport_personnel)}
            />
            <SummaryLine
              label="Équipe"
              value={equipeLabel(form.equipe)}
            />
            <SummaryLine
              label="Engagement"
              value={engagementLabel(form.engagement_porteur)}
            />
            <SummaryLine
              label="Expérience"
              value={experienceLabel(form.experience_secteur)}
            />
            <SummaryLine
              label="Structure"
              value={structureLabel(form.structure_existante)}
            />
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

        {/* Rappel modèle */}
        <div className="rounded-3xl border border-line bg-surface-sunken p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            <h3 className="text-title text-ink">
              Rappel — Nous ne sommes pas une banque
            </h3>
          </div>
          <p className="text-body-sm text-ink-muted">
            Nexus n'octroie pas de prêts. Si votre dossier est retenu, nous
            structurons un partenariat avec apport personnel, accompagnement
            opérationnel et partage des résultats — pas de dette à rembourser
            avec intérêts.
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
              label="J'accepte que Nexus RCA examine mon projet et les documents que je transmettrai."
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
              label="Je reconnais que la soumission ne vaut pas engagement de cofinancement et que Nexus RCA reste libre d'accepter ou non le partenariat après étude."
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
              le bilan de faisabilité et la suite du processus.
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

function buildSubmissionDescription(form: FinancementFormData): string {
  const fais = computeFaisabilite(form);

  const lines = [
    `Demande Financement & partenariat — soumise via formulaire dédié.`,
    ``,
    `Projet :`,
    `- Nom : ${form.nom_projet}`,
    `- Secteur : ${secteurLabel(form.secteur)}`,
    `- Stade : ${stadeLabel(form.stade)}`,
    `- Localisation : ${form.localisation_projet}`,
    `- Montant recherché : ${montantLabel(form.montant_recherche)}`,
    `- Description : ${form.description_courte}`,
    ``,
    `Porteur :`,
    `- Profil : ${profilPorteurLabel(form.profil_porteur)}`,
    `- Apport personnel : ${apportLabel(form.apport_personnel)}`,
    `- Équipe : ${equipeLabel(form.equipe)}`,
    `- Engagement : ${engagementLabel(form.engagement_porteur)}`,
    `- Expérience secteur : ${experienceLabel(form.experience_secteur)}`,
    ``,
    `Situation :`,
    `- Structure : ${structureLabel(form.structure_existante)}`,
    `- Ancrage RCA : ${form.ancrage_rca}`,
    `- Vision long terme : ${form.vision_long_terme}`,
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
  form: FinancementFormData;
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
          conseiller Nexus étudie votre dossier selon notre méthodologie. Si
          votre projet correspond à nos critères, nous vous proposons un
          accompagnement et le cadre du partenariat. Sinon, nous vous le disons
          franchement et expliquons pourquoi.
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
              `Bonjour Nexus, je viens de soumettre mon projet de financement ${reference}.`
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
