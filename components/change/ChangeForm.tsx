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
  Coins,
  FileText,
  Info,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  CHANGE_FORM_STORAGE_KEY,
  DEFAULT_CHANGE_FORM,
  DEVISES,
  MOTIFS,
  QUAND_OPTIONS,
  SENS_OPTIONS,
  TRANCHES,
  TYPES_PIECE,
  computeFaisabilite,
  deviseLabel,
  faisabiliteLabel,
  generateChecklist,
  generateDelaiIndicatif,
  motifLabel,
  quandLabel,
  requiresSeniorAnalysis,
  sensLabel,
  trancheLabel,
  typePieceLabel,
  validateStep,
  type ChangeFormData,
  type ValidationErrors,
} from "@/lib/change-form";
import { whatsappLink, cn } from "@/lib/utils";

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Identité", icon: User },
  { id: 2, title: "Opération", icon: Coins },
  { id: 3, title: "Montant", icon: Wallet },
  { id: 4, title: "Précisions", icon: FileText },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function ChangeForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<ChangeFormData>(DEFAULT_CHANGE_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const draft = localStorage.getItem(CHANGE_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<ChangeFormData>;
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
      localStorage.setItem(CHANGE_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  const update = <K extends keyof ChangeFormData>(
    key: K,
    value: ChangeFormData[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
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

      const objet = `Change — ${deviseLabel(form.devise_depart)} → ${deviseLabel(form.devise_arrivee)} (${trancheLabel(form.tranche)})`;
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
        service: "Change",
        objet,
        description,
        urgence: senior ? "elevee" : form.quand === "aujourd_hui" ? "elevee" : "normale",
        date_souhaitee: null,
        pays_concerne: "RCA",
        destination: "Bangui",
        budget_estimatif: trancheLabel(form.tranche),
        traitement_prioritaire: senior,
        source: "formulaire_change",
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
        localStorage.removeItem(CHANGE_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-CHG-${demandeId.slice(0, 8).toUpperCase()}`);
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
          {screen === 4 && <Step4 form={form} update={update} />}
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
            <Coins className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">Service change de devises</p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Devis de change — taux du jour annoncé avant déplacement
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 3 minutes. Vos réponses nous permettent d&apos;établir un devis
          précis avec le taux du jour. Un conseiller Nexus reprend contact
          sous 30 minutes en heures ouvrées.
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
            Demander mon devis
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-caption text-ink-muted">
            Vous préférez parler à quelqu&apos;un d&apos;abord ?{" "}
            <Link
              href="/rendez-vous?service=change"
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

// ─── Étape 1 — Identité ─────────────────────────────────────────────────────

function Step1({
  form,
  update,
  errors,
}: {
  form: ChangeFormData;
  update: <K extends keyof ChangeFormData>(k: K, v: ChangeFormData[K]) => void;
  errors: ValidationErrors;
}) {
  return (
    <StepCard
      title="Vos coordonnées"
      subtitle="Identité pour le devis et type de pièce que vous présenterez le cas échéant."
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
          label="Type de pièce d'identité *"
          value={form.type_piece}
          onChange={(e) =>
            update("type_piece", e.target.value as typeof form.type_piece)
          }
          error={errors.type_piece}
        >
          <option value="">Sélectionner…</option>
          {TYPES_PIECE.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        <Notice tone="neutral">
          <strong>Information.</strong> Une pièce d&apos;identité est requise au-delà
          du seuil réglementaire applicable. Pour les petites transactions
          courantes, ce n&apos;est généralement pas exigé.
        </Notice>
      </div>
    </StepCard>
  );
}

// ─── Étape 2 — Opération ────────────────────────────────────────────────────

function Step2({
  form,
  update,
  errors,
}: {
  form: ChangeFormData;
  update: <K extends keyof ChangeFormData>(k: K, v: ChangeFormData[K]) => void;
  errors: ValidationErrors;
}) {
  const showSameDeviseHint =
    form.devise_depart !== "" &&
    form.devise_arrivee !== "" &&
    form.devise_depart === form.devise_arrivee;
  const showInvestmentHint = form.motif === "investissement";

  return (
    <StepCard
      title="L'opération"
      subtitle="Sens du change, devises concernées et motif."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Sens du change *"
            value={form.sens}
            onChange={(e) => update("sens", e.target.value as typeof form.sens)}
            error={errors.sens}
          >
            <option value="">Sélectionner…</option>
            {SENS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <Select
          label="Devise de départ *"
          value={form.devise_depart}
          onChange={(e) =>
            update("devise_depart", e.target.value as typeof form.devise_depart)
          }
          error={errors.devise_depart}
        >
          <option value="">Sélectionner…</option>
          {DEVISES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
        <Select
          label="Devise d'arrivée *"
          value={form.devise_arrivee}
          onChange={(e) =>
            update(
              "devise_arrivee",
              e.target.value as typeof form.devise_arrivee
            )
          }
          error={errors.devise_arrivee}
        >
          <option value="">Sélectionner…</option>
          {DEVISES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Select
            label="Motif du change *"
            value={form.motif}
            onChange={(e) =>
              update("motif", e.target.value as typeof form.motif)
            }
            error={errors.motif}
          >
            <option value="">Sélectionner…</option>
            {MOTIFS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {showSameDeviseHint && (
          <Notice tone="warn">
            <strong>Devise identique.</strong> La devise de départ et d&apos;arrivée
            doivent être différentes pour une opération de change.
          </Notice>
        )}
        {showInvestmentHint && (
          <Notice tone="info">
            <strong>Investissement.</strong> Pour ce motif, des justificatifs
            renforcés peuvent être demandés selon le montant. Le conseiller
            précisera après le devis.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 3 — Montant & timing ─────────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
}: {
  form: ChangeFormData;
  update: <K extends keyof ChangeFormData>(k: K, v: ChangeFormData[K]) => void;
  errors: ValidationErrors;
}) {
  const showLargeAmountWarning =
    form.tranche === "10m_plus" || form.tranche === "5m_10m";
  const showSameDayLargeWarning =
    form.quand === "aujourd_hui" &&
    (form.tranche === "5m_10m" || form.tranche === "10m_plus");

  return (
    <StepCard
      title="Montant & timing"
      subtitle="Tranche indicative et quand vous souhaitez réaliser l'opération."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Tranche de montant *"
            value={form.tranche}
            onChange={(e) =>
              update("tranche", e.target.value as typeof form.tranche)
            }
            error={errors.tranche}
          >
            <option value="">Sélectionner…</option>
            {TRANCHES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Montant indicatif (optionnel)"
          value={form.montant_indicatif}
          onChange={(e) => update("montant_indicatif", e.target.value)}
          placeholder="Ex : 1 500 € ou 800 000 FCFA"
        />
        <Select
          label="Quand souhaitez-vous opérer ? *"
          value={form.quand}
          onChange={(e) => update("quand", e.target.value as typeof form.quand)}
          error={errors.quand}
        >
          <option value="">Sélectionner…</option>
          {QUAND_OPTIONS.map((q) => (
            <option key={q.value} value={q.value}>
              {q.label}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors border-line bg-surface-elevated hover:border-brand/40">
            <input
              type="checkbox"
              checked={form.rdv_souhaite}
              onChange={(e) => update("rdv_souhaite", e.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong text-brand focus:ring-brand/30"
            />
            <span className="text-body-sm text-ink">
              Je souhaite un rendez-vous (recommandé pour les gros montants)
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {showLargeAmountWarning && (
          <Notice tone="warn">
            <strong>Montant élevé.</strong> Préparation du cash et
            justificatifs renforcés requis. Un rendez-vous est fortement
            conseillé pour fluidifier la transaction.
          </Notice>
        )}
        {showSameDayLargeWarning && (
          <Notice tone="warn">
            <strong>Gros montant + aujourd&apos;hui.</strong> La disponibilité du
            cash en agence n&apos;est pas toujours immédiate sur ces tranches. Le
            conseiller vous confirmera la faisabilité dans la journée.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 4 — Précisions ───────────────────────────────────────────────────

function Step4({
  form,
  update,
}: {
  form: ChangeFormData;
  update: <K extends keyof ChangeFormData>(k: K, v: ChangeFormData[K]) => void;
}) {
  return (
    <StepCard
      title="Précisions"
      subtitle="Ajoutez tout détail utile au conseiller (optionnel)."
    >
      <Textarea
        label="Précisions ou contraintes"
        rows={5}
        value={form.precisions}
        onChange={(e) => update("precisions", e.target.value)}
        placeholder="Ex : voyage prévu telle date, devises souhaitées en grosses ou petites coupures, contraintes d'agenda…"
      />
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
  form: ChangeFormData;
  update: <K extends keyof ChangeFormData>(k: K, v: ChangeFormData[K]) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const fais = computeFaisabilite(form);
  const faisInfo = faisabiliteLabel(fais);
  const checklist = generateChecklist(form.tranche, form.motif);
  const delai = generateDelaiIndicatif(form.tranche, form.quand);

  const colorMap: Record<string, string> = {
    emerald:
      "border-emerald-200/60 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    amber:
      "border-amber-200/60 bg-amber-50/60 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    rose: "border-rose-200/60 bg-rose-50/60 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  };

  return (
    <StepCard
      title="Synthèse de votre demande"
      subtitle="Vérifiez les informations ci-dessous avant envoi. Vous pouvez revenir en arrière pour corriger une étape."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard title="Opération">
            <SummaryLine label="Sens" value={sensLabel(form.sens)} />
            <SummaryLine
              label="Devises"
              value={`${deviseLabel(form.devise_depart)} → ${deviseLabel(form.devise_arrivee)}`}
            />
            <SummaryLine label="Motif" value={motifLabel(form.motif)} />
            <SummaryLine label="Tranche" value={trancheLabel(form.tranche)} />
            {form.montant_indicatif && (
              <SummaryLine label="Montant" value={form.montant_indicatif} />
            )}
            <SummaryLine label="Quand" value={quandLabel(form.quand)} />
            <SummaryLine
              label="Rendez-vous"
              value={form.rdv_souhaite ? "Souhaité" : "Non requis"}
            />
          </SummaryCard>

          <SummaryCard title="Vos coordonnées">
            <SummaryLine label="Nom" value={form.nom_complet} />
            <SummaryLine label="E-mail" value={form.email} />
            <SummaryLine label="Téléphone" value={form.telephone} />
            <SummaryLine
              label="Pièce"
              value={typePieceLabel(form.type_piece)}
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
                Le délai final est confirmé dans le devis.
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
              label="J'accepte que Nexus RCA examine ma demande et établisse un devis avec le taux du jour."
            />
            <ConsentCheckbox
              checked={form.consentement_origine_fonds}
              onChange={(v) => update("consentement_origine_fonds", v)}
              error={errors.consentement_origine_fonds}
              label="Je certifie que les fonds proviennent d'une source légale et m'engage à fournir un justificatif si demandé."
            />
            <ConsentCheckbox
              checked={form.consentement_traitement}
              onChange={(v) => update("consentement_traitement", v)}
              error={errors.consentement_traitement}
              label="J'autorise le traitement de mes données dans le respect de la réglementation BEAC/COBAC."
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
              Un conseiller Nexus revient sous 30 minutes ouvrées avec le taux
              du jour et le montant exact.
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

function buildSubmissionDescription(form: ChangeFormData): string {
  const fais = computeFaisabilite(form);

  const lines = [
    `Demande Change de devises — soumise via formulaire dédié.`,
    ``,
    `Opération :`,
    `- Sens : ${sensLabel(form.sens)}`,
    `- Devise départ : ${deviseLabel(form.devise_depart)}`,
    `- Devise arrivée : ${deviseLabel(form.devise_arrivee)}`,
    `- Motif : ${motifLabel(form.motif)}`,
    `- Tranche : ${trancheLabel(form.tranche)}`,
    form.montant_indicatif ? `- Montant indicatif : ${form.montant_indicatif}` : "",
    `- Quand : ${quandLabel(form.quand)}`,
    `- Rendez-vous souhaité : ${form.rdv_souhaite ? "Oui" : "Non"}`,
    ``,
    `Identité :`,
    `- Pièce : ${typePieceLabel(form.type_piece)}`,
    ``,
    form.precisions ? `Précisions : ${form.precisions}` : "",
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
  form: ChangeFormData;
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
          conseiller Nexus prépare votre devis avec le taux du jour et le
          montant exact à recevoir.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken px-4 py-2">
          <span className="text-overline text-ink-muted">Référence</span>
          <span className="font-mono text-body-sm font-semibold text-ink">
            {reference}
          </span>
        </div>

        <p className="mt-4 text-caption text-ink-muted">
          Un récapitulatif vous a été envoyé par e-mail. Délai de prise de
          contact : 30 minutes ouvrées.
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
            Retour à l&apos;accueil
          </button>
        </div>

        <p className="mt-8 text-caption text-ink-muted">
          Une question ?{" "}
          <a
            href={whatsappLink(
              `Bonjour Nexus, je viens de soumettre ma demande de change ${reference}.`
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
