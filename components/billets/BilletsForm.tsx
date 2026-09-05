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
  Hotel,
  Info,
  Loader2,
  MessageCircle,
  Plane,
  Send,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  BILLETS_FORM_STORAGE_KEY,
  BUDGETS,
  CATEGORIES_HOTEL,
  CLASSES,
  COMPAGNIES,
  DEFAULT_BILLETS_FORM,
  FLEXIBILITES,
  MOTIFS_VOYAGE,
  PRESTATIONS,
  TYPES_VOL,
  URGENCES,
  ZONES_HOTEL,
  budgetLabel,
  categorieHotelLabel,
  classeLabel,
  compagnieLabel,
  computeFaisabilite,
  faisabiliteLabel,
  flexibiliteLabel,
  generateChecklist,
  generateDelaiIndicatif,
  motifVoyageLabel,
  prestationLabel,
  requiresSeniorAnalysis,
  typeVolLabel,
  urgenceLabel,
  validateStep,
  zoneHotelLabel,
  type BilletsFormData,
  type ValidationErrors,
} from "@/lib/billets-form";
import { whatsappLink, cn } from "@/lib/utils";

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Demandeur", icon: User },
  { id: 2, title: "Prestation", icon: ClipboardCheck },
  { id: 3, title: "Vol", icon: Plane },
  { id: 4, title: "Hôtel & budget", icon: Hotel },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function BilletsForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<BilletsFormData>(DEFAULT_BILLETS_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const draft = localStorage.getItem(BILLETS_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<BilletsFormData>;
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
      localStorage.setItem(BILLETS_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  const update = <K extends keyof BilletsFormData>(
    key: K,
    value: BilletsFormData[K]
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

      const objet = `Voyage — ${prestationLabel(form.prestation)}${form.ville_arrivee ? ` (${form.ville_arrivee})` : ""}`;
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
        service: "Billets",
        objet,
        description,
        urgence: senior
          ? "elevee"
          : form.urgence === "moins_72h"
            ? "elevee"
            : "normale",
        date_souhaitee: form.date_depart || form.date_arrivee_hotel || null,
        pays_concerne: "",
        destination: form.ville_arrivee || "",
        budget_estimatif: budgetLabel(form.budget),
        traitement_prioritaire: senior,
        source: "formulaire_billets",
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
        localStorage.removeItem(BILLETS_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-VOY-${demandeId.slice(0, 8).toUpperCase()}`);
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
          {screen === 4 && <Step4 form={form} update={update} errors={errors} />}
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
            <Plane className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">Service vols & hôtels</p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Devis voyage — vol, hôtel ou combiné
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 5 minutes. Vos réponses nous permettent de proposer 2 à 3
          options pertinentes. Un conseiller Nexus reprend contact sous 24
          heures ouvrées.
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
            Commencer ma demande
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-caption text-ink-muted">
            Vous préférez parler à quelqu'un d'abord ?{" "}
            <Link
              href="/rendez-vous?service=billets"
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
  form: BilletsFormData;
  update: <K extends keyof BilletsFormData>(
    k: K,
    v: BilletsFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  return (
    <StepCard
      title="Vos coordonnées"
      subtitle="Personne de contact pour le devis et les confirmations."
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
  form: BilletsFormData;
  update: <K extends keyof BilletsFormData>(
    k: K,
    v: BilletsFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const showShortDelay = form.urgence === "moins_72h";

  return (
    <StepCard
      title="Type de prestation"
      subtitle="Vol, hôtel ou combinaison, motif et urgence."
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
          label="Motif du voyage *"
          value={form.motif}
          onChange={(e) => update("motif", e.target.value as typeof form.motif)}
          error={errors.motif}
        >
          <option value="">Sélectionner…</option>
          {MOTIFS_VOYAGE.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
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
      </div>

      {showShortDelay && (
        <div className="mt-6">
          <Notice tone="warn">
            <strong>Délai très court.</strong> Les options seront plus
            réduites et les tarifs plus élevés à moins de 72 heures du
            départ. Le conseiller priorisera la disponibilité réelle plutôt
            que le meilleur prix.
          </Notice>
        </div>
      )}
    </StepCard>
  );
}

// ─── Étape 3 — Vol ──────────────────────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
}: {
  form: BilletsFormData;
  update: <K extends keyof BilletsFormData>(
    k: K,
    v: BilletsFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const skip = form.prestation === "hotel_seul";
  const isMulti = form.type_vol === "multi_villes";

  if (skip) {
    return (
      <StepCard
        title="Vol"
        subtitle="Vous avez choisi « Hôtel uniquement ». Cette étape est sans objet."
      >
        <Notice tone="info">
          Passez à l'étape suivante pour préciser votre besoin hôtel.
        </Notice>
      </StepCard>
    );
  }

  return (
    <StepCard
      title="Votre vol"
      subtitle="Type de vol, itinéraire, dates, voyageurs et préférences."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Type de vol *"
            value={form.type_vol}
            onChange={(e) =>
              update("type_vol", e.target.value as typeof form.type_vol)
            }
            error={errors.type_vol}
          >
            <option value="">Sélectionner…</option>
            {TYPES_VOL.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Ville de départ *"
          value={form.ville_depart}
          onChange={(e) => update("ville_depart", e.target.value)}
          error={errors.ville_depart}
          placeholder="Bangui"
        />
        <Input
          label="Destination *"
          value={form.ville_arrivee}
          onChange={(e) => update("ville_arrivee", e.target.value)}
          error={errors.ville_arrivee}
          placeholder="Ex : Paris, Casablanca, Dubaï…"
        />
        {isMulti && (
          <div className="sm:col-span-2">
            <Textarea
              label="Étapes intermédiaires"
              rows={3}
              value={form.villes_etapes}
              onChange={(e) => update("villes_etapes", e.target.value)}
              placeholder="Ex : Bangui → Paris (3 nuits) → Marrakech (5 nuits) → Bangui"
            />
          </div>
        )}
        <Input
          label="Date de départ *"
          type="date"
          value={form.date_depart}
          onChange={(e) => update("date_depart", e.target.value)}
          error={errors.date_depart}
        />
        {form.type_vol === "aller_retour" && (
          <Input
            label="Date de retour *"
            type="date"
            value={form.date_retour}
            onChange={(e) => update("date_retour", e.target.value)}
            error={errors.date_retour}
          />
        )}
        <Select
          label="Flexibilité dates *"
          value={form.flexibilite}
          onChange={(e) =>
            update("flexibilite", e.target.value as typeof form.flexibilite)
          }
          error={errors.flexibilite}
        >
          <option value="">Sélectionner…</option>
          {FLEXIBILITES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
        <Select
          label="Classe *"
          value={form.classe}
          onChange={(e) => update("classe", e.target.value as typeof form.classe)}
          error={errors.classe}
        >
          <option value="">Sélectionner…</option>
          {CLASSES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select
          label="Compagnie préférée"
          value={form.compagnie_pref}
          onChange={(e) =>
            update(
              "compagnie_pref",
              e.target.value as typeof form.compagnie_pref
            )
          }
        >
          <option value="">Indifférent — meilleur prix</option>
          {COMPAGNIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <Input
          label="Adultes (≥ 12 ans) *"
          type="number"
          min={1}
          max={9}
          value={form.nb_adultes}
          onChange={(e) =>
            update("nb_adultes", Number.parseInt(e.target.value) || 1)
          }
          error={errors.nb_adultes}
        />
        <Input
          label="Enfants"
          type="number"
          min={0}
          max={9}
          value={form.nb_enfants}
          onChange={(e) =>
            update("nb_enfants", Number.parseInt(e.target.value) || 0)
          }
        />
      </div>
    </StepCard>
  );
}

// ─── Étape 4 — Hôtel & budget ───────────────────────────────────────────────

function Step4({
  form,
  update,
  errors,
}: {
  form: BilletsFormData;
  update: <K extends keyof BilletsFormData>(
    k: K,
    v: BilletsFormData[K]
  ) => void;
  errors: ValidationErrors;
}) {
  const needHotel =
    form.prestation === "hotel_seul" || form.prestation === "vol_hotel";
  const tightBudget =
    form.budget === "moins_500k" &&
    (form.prestation === "vol_hotel" ||
      form.classe === "business" ||
      form.classe === "premiere");

  return (
    <StepCard
      title="Hôtel & budget"
      subtitle={
        needHotel
          ? "Précisez vos préférences d'hébergement et votre budget global."
          : "Indiquez votre budget global pour cette demande."
      }
    >
      {needHotel && (
        <div className="mb-6 grid gap-5 sm:grid-cols-2">
          <Input
            label="Date d'arrivée à l'hôtel *"
            type="date"
            value={form.date_arrivee_hotel}
            onChange={(e) => update("date_arrivee_hotel", e.target.value)}
            error={errors.date_arrivee_hotel}
          />
          <Input
            label="Date de départ de l'hôtel *"
            type="date"
            value={form.date_depart_hotel}
            onChange={(e) => update("date_depart_hotel", e.target.value)}
            error={errors.date_depart_hotel}
          />
          <Select
            label="Catégorie d'hôtel *"
            value={form.categorie_hotel}
            onChange={(e) =>
              update(
                "categorie_hotel",
                e.target.value as typeof form.categorie_hotel
              )
            }
            error={errors.categorie_hotel}
          >
            <option value="">Sélectionner…</option>
            {CATEGORIES_HOTEL.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select
            label="Zone souhaitée"
            value={form.zone_hotel}
            onChange={(e) =>
              update("zone_hotel", e.target.value as typeof form.zone_hotel)
            }
          >
            <option value="">Indifférent</option>
            {ZONES_HOTEL.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Input
              label="Nombre de chambres *"
              type="number"
              min={1}
              max={9}
              value={form.nb_chambres}
              onChange={(e) =>
                update("nb_chambres", Number.parseInt(e.target.value) || 1)
              }
              error={errors.nb_chambres}
            />
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-1">
        <Select
          label="Budget global *"
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
          label="Précisions (optionnel)"
          rows={3}
          value={form.precisions}
          onChange={(e) => update("precisions", e.target.value)}
          placeholder="Ex : régime alimentaire, accessibilité, étape spécifique souhaitée, contraintes pro…"
        />
      </div>

      {tightBudget && (
        <div className="mt-6">
          <Notice tone="warn">
            <strong>Budget vs prestation.</strong> Une combinaison vol + hôtel
            ou une classe supérieure dans cette tranche budgétaire est
            difficile. Le conseiller proposera les ajustements pour rester
            dans le budget.
          </Notice>
        </div>
      )}
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
  form: BilletsFormData;
  update: <K extends keyof BilletsFormData>(
    k: K,
    v: BilletsFormData[K]
  ) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const fais = computeFaisabilite(form);
  const faisInfo = faisabiliteLabel(fais);
  const checklist = generateChecklist(form);
  const delai = generateDelaiIndicatif(form.urgence, form.prestation);
  const needHotel =
    form.prestation === "hotel_seul" || form.prestation === "vol_hotel";
  const needVol =
    form.prestation === "vol_seul" || form.prestation === "vol_hotel";

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
          <SummaryCard title="Demande">
            <SummaryLine
              label="Prestation"
              value={prestationLabel(form.prestation)}
            />
            <SummaryLine
              label="Motif"
              value={motifVoyageLabel(form.motif)}
            />
            <SummaryLine label="Urgence" value={urgenceLabel(form.urgence)} />
            <SummaryLine label="Budget" value={budgetLabel(form.budget)} />
          </SummaryCard>

          {needVol && (
            <SummaryCard title="Vol">
              <SummaryLine
                label="Type"
                value={typeVolLabel(form.type_vol)}
              />
              <SummaryLine
                label="Itinéraire"
                value={`${form.ville_depart || "—"} → ${form.ville_arrivee || "—"}`}
              />
              <SummaryLine label="Départ" value={form.date_depart || "—"} />
              {form.type_vol === "aller_retour" && (
                <SummaryLine label="Retour" value={form.date_retour || "—"} />
              )}
              <SummaryLine
                label="Flexibilité"
                value={flexibiliteLabel(form.flexibilite)}
              />
              <SummaryLine label="Classe" value={classeLabel(form.classe)} />
              <SummaryLine
                label="Compagnie"
                value={compagnieLabel(form.compagnie_pref)}
              />
              <SummaryLine
                label="Voyageurs"
                value={`${form.nb_adultes} adulte(s)${form.nb_enfants > 0 ? ` + ${form.nb_enfants} enfant(s)` : ""}`}
              />
            </SummaryCard>
          )}

          {needHotel && (
            <SummaryCard title="Hôtel">
              <SummaryLine
                label="Arrivée"
                value={form.date_arrivee_hotel || "—"}
              />
              <SummaryLine
                label="Départ"
                value={form.date_depart_hotel || "—"}
              />
              <SummaryLine
                label="Catégorie"
                value={categorieHotelLabel(form.categorie_hotel)}
              />
              <SummaryLine
                label="Zone"
                value={zoneHotelLabel(form.zone_hotel)}
              />
              <SummaryLine
                label="Chambres"
                value={String(form.nb_chambres)}
              />
            </SummaryCard>
          )}
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
              label="J'accepte que Nexus RCA examine ma demande et propose des options de vol et/ou d'hôtel."
            />
            <ConsentCheckbox
              checked={form.consentement_traitement}
              onChange={(v) => update("consentement_traitement", v)}
              error={errors.consentement_traitement}
              label="J'autorise le traitement de mes données personnelles et celles des voyageurs pour réaliser les réservations."
            />
            <ConsentCheckbox
              checked={true}
              onChange={() => {}}
              disabled
              label="Je reconnais que les tarifs et disponibilités sont confirmés par les compagnies/plateformes au moment de l'émission, et peuvent évoluer."
            />
          </div>
        </div>

        {/* CTA submit */}
        <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-headline text-ink sm:text-display-sm">
              Prêt à recevoir vos options ?
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Un conseiller Nexus reprend contact sous 24 heures ouvrées avec
              2 à 3 options de voyage adaptées à votre projet.
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

function buildSubmissionDescription(form: BilletsFormData): string {
  const fais = computeFaisabilite(form);

  const lines = [
    `Demande Voyage (vols & hôtels) — soumise via formulaire dédié.`,
    ``,
    `Demande :`,
    `- Prestation : ${prestationLabel(form.prestation)}`,
    `- Motif : ${motifVoyageLabel(form.motif)}`,
    `- Urgence : ${urgenceLabel(form.urgence)}`,
    `- Budget : ${budgetLabel(form.budget)}`,
    ``,
  ];

  if (form.prestation === "vol_seul" || form.prestation === "vol_hotel") {
    lines.push(`Vol :`);
    lines.push(`- Type : ${typeVolLabel(form.type_vol)}`);
    lines.push(`- Itinéraire : ${form.ville_depart} → ${form.ville_arrivee}`);
    if (form.villes_etapes) {
      lines.push(`- Étapes : ${form.villes_etapes}`);
    }
    lines.push(`- Départ : ${form.date_depart}`);
    if (form.type_vol === "aller_retour") {
      lines.push(`- Retour : ${form.date_retour}`);
    }
    lines.push(`- Flexibilité : ${flexibiliteLabel(form.flexibilite)}`);
    lines.push(`- Classe : ${classeLabel(form.classe)}`);
    lines.push(`- Compagnie : ${compagnieLabel(form.compagnie_pref)}`);
    lines.push(
      `- Voyageurs : ${form.nb_adultes} adulte(s)${form.nb_enfants > 0 ? ` + ${form.nb_enfants} enfant(s)` : ""}`
    );
    lines.push(``);
  }

  if (form.prestation === "hotel_seul" || form.prestation === "vol_hotel") {
    lines.push(`Hôtel :`);
    lines.push(`- Arrivée : ${form.date_arrivee_hotel}`);
    lines.push(`- Départ : ${form.date_depart_hotel}`);
    lines.push(`- Catégorie : ${categorieHotelLabel(form.categorie_hotel)}`);
    lines.push(`- Zone : ${zoneHotelLabel(form.zone_hotel)}`);
    lines.push(`- Chambres : ${form.nb_chambres}`);
    lines.push(``);
  }

  if (form.precisions) {
    lines.push(`Précisions : ${form.precisions}`);
    lines.push(``);
  }

  lines.push(`Estimation préliminaire (auto) : ${faisabiliteLabel(fais).label}`);

  return lines.filter((l) => l !== undefined).join("\n");
}

// ─── Écran SUCCESS ──────────────────────────────────────────────────────────

function SuccessScreen({
  reference,
  form,
  router,
}: {
  reference: string;
  form: BilletsFormData;
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
          conseiller Nexus prépare 2 à 3 options de voyage et revient vers
          vous sous 24 heures ouvrées avec un devis précis.
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
              `Bonjour Nexus, je viens de soumettre ma demande de voyage ${reference}.`
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
