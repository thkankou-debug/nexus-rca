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
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
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
  DEFAULT_VISA_FORM,
  DESTINATIONS,
  DOCUMENTS_OPTIONS,
  DUREES,
  PAYS_RESIDENCE_OPTIONS,
  PROFILS_PRO,
  REFUS_OPTIONS,
  RESSOURCES_OPTIONS,
  TRANCHES_AGE,
  TYPES_VISA_OPTIONS,
  VOYAGES_OPTIONS,
  VISA_FORM_STORAGE_KEY,
  computeFaisabilite,
  dureeLabel,
  faisabiliteLabel,
  generateChecklist,
  generateDelaiIndicatif,
  getDestination,
  getTypeVisa,
  profilProLabel,
  refusLabel,
  requiresSeniorAnalysis,
  ressourcesLabel,
  trancheAgeLabel,
  validateStep,
  voyagesLabel,
  type TypeVisa,
  type ValidationErrors,
  type VisaFormData,
} from "@/lib/visa-form";
import { whatsappLink, cn } from "@/lib/utils";

// ─── Types screens ──────────────────────────────────────────────────────────

type Screen = "intro" | 1 | 2 | 3 | 4 | 5 | "success";

const STEPS = [
  { id: 1, title: "Profil", icon: User },
  { id: 2, title: "Projet", icon: Globe },
  { id: 3, title: "Historique", icon: ClipboardCheck },
  { id: 4, title: "Situation", icon: FileText },
  { id: 5, title: "Synthèse", icon: ShieldCheck },
] as const;

// ─── Composant principal ────────────────────────────────────────────────────

export function VisaForm() {
  const router = useRouter();
  const supabase = createClient();
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<VisaFormData>(DEFAULT_VISA_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string>("");
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Hydratation depuis localStorage + profil Supabase
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    try {
      const draft = localStorage.getItem(VISA_FORM_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<VisaFormData>;
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

  // Sauvegarde locale auto
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(VISA_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  // Scroll top à chaque écran
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  // Helpers
  const update = <K extends keyof VisaFormData>(
    key: K,
    value: VisaFormData[K]
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
    if (screen < 5) {
      setScreen((screen + 1) as Screen);
    }
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
    // Pour avancer : valider toutes les étapes précédentes
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

      const dest = getDestination(form.pays_destination);
      const typeVisa = getTypeVisa(form.type_visa);
      const faisabilite = computeFaisabilite(form);
      const senior = requiresSeniorAnalysis(form);

      const objet = `Visa ${dest?.label ?? form.pays_destination} — ${typeVisa?.label ?? form.type_visa}`;
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
        service: "Visa",
        objet,
        description,
        urgence: senior ? "elevee" : "normale",
        date_souhaitee: form.date_voyage || null,
        pays_concerne: dest?.label ?? form.pays_destination,
        destination: dest?.label ?? null,
        budget_estimatif: ressourcesLabel(form.ressources_range),
        traitement_prioritaire: senior,
        source: "formulaire_visa",
        details_service: {
          ...form,
          faisabilite_estimee: faisabilite,
          requiert_analyse_senior: senior,
        },
        consentement_examen: form.consentement_examen,
        consentement_documents: form.consentement_traitement,
        consentement_recontact: true,
        statut: "nouvelle_demande",
      });

      if (error) throw error;

      try {
        localStorage.removeItem(VISA_FORM_STORAGE_KEY);
      } catch {}

      setReference(`NX-VISA-${demandeId.slice(0, 8).toUpperCase()}`);
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

  // ─── Écran : SUCCESS ──────────────────────────────────────────────────────
  if (screen === "success") {
    return <SuccessScreen reference={reference} form={form} router={router} />;
  }

  // ─── Écran : INTRO ────────────────────────────────────────────────────────
  if (screen === "intro") {
    return <IntroScreen onStart={() => setScreen(1)} />;
  }

  // ─── Écrans : ÉTAPES ──────────────────────────────────────────────────────
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
          {screen === 1 && (
            <Step1 form={form} update={update} errors={errors} />
          )}
          {screen === 2 && (
            <Step2 form={form} update={update} errors={errors} />
          )}
          {screen === 3 && (
            <Step3 form={form} update={update} errors={errors} />
          )}
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
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>

        <p className="text-overline text-brand">Service visa</p>
        <h2 className="mt-3 font-display text-display-md text-ink sm:text-display-lg">
          Étude de faisabilité visa
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-muted">
          Environ 5 minutes. Vos réponses nous permettent d'établir un bilan de
          faisabilité honnête. Un conseiller Nexus reprend contact sous
          24 heures ouvrées.
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
              href="/rendez-vous?service=visa"
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
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
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
  form: VisaFormData;
  update: <K extends keyof VisaFormData>(k: K, v: VisaFormData[K]) => void;
  errors: ValidationErrors;
}) {
  const showRemoteNotice =
    form.pays_residence !== "" && form.pays_residence !== "RCA";

  return (
    <StepCard
      title="Votre profil"
      subtitle="Informations de contact et situation personnelle. Tous les champs marqués d'un astérisque sont obligatoires."
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
            update("pays_residence", e.target.value as typeof form.pays_residence)
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
          label="Profil professionnel *"
          value={form.profil_pro}
          onChange={(e) =>
            update("profil_pro", e.target.value as typeof form.profil_pro)
          }
          error={errors.profil_pro}
        >
          <option value="">Sélectionner…</option>
          {PROFILS_PRO.map((p) => (
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
      </div>

      {showRemoteNotice && (
        <div className="mt-6">
          <Notice tone="info">
            <strong>Service basé à Bangui.</strong> Accompagnement à distance
            disponible. Précisez votre situation à l'étape suivante.
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
  form: VisaFormData;
  update: <K extends keyof VisaFormData>(k: K, v: VisaFormData[K]) => void;
  errors: ValidationErrors;
}) {
  const dest = getDestination(form.pays_destination);
  const showEVisaInfo = dest?.hasEVisa;
  const showEtudesRedirect = form.type_visa === "etudes";
  const showShortDelay =
    form.date_voyage &&
    new Date(form.date_voyage).getTime() - Date.now() < 10 * 24 * 60 * 60 * 1000 &&
    new Date(form.date_voyage).getTime() > Date.now();

  return (
    <StepCard
      title="Votre projet"
      subtitle="Le visa que vous souhaitez obtenir et les paramètres de votre voyage."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Pays de destination *"
          value={form.pays_destination}
          onChange={(e) => update("pays_destination", e.target.value)}
          error={errors.pays_destination}
        >
          <option value="">Sélectionner…</option>
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.emoji} {d.label}
            </option>
          ))}
        </Select>
        <Select
          label="Type de visa *"
          value={form.type_visa}
          onChange={(e) =>
            update("type_visa", e.target.value as TypeVisa)
          }
          error={errors.type_visa}
        >
          <option value="">Sélectionner…</option>
          {TYPES_VISA_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Input
          label="Date de voyage souhaitée"
          type="date"
          value={form.date_voyage}
          onChange={(e) => update("date_voyage", e.target.value)}
        />
        <Select
          label="Durée prévue *"
          value={form.duree_sejour}
          onChange={(e) =>
            update("duree_sejour", e.target.value as typeof form.duree_sejour)
          }
          error={errors.duree_sejour}
        >
          <option value="">Sélectionner…</option>
          {DUREES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-caption font-semibold text-ink">
          Première fois dans ce pays ? *
        </p>
        <RadioGroup
          name="premiere_fois_pays"
          value={form.premiere_fois_pays}
          onChange={(v) =>
            update("premiere_fois_pays", v as typeof form.premiere_fois_pays)
          }
          options={[
            { value: "oui", label: "Oui" },
            { value: "non", label: "Non, j'y suis déjà allé(e)" },
          ]}
          error={errors.premiere_fois_pays}
        />
      </div>

      <div className="mt-6 space-y-3">
        {showEVisaInfo && (
          <Notice tone="info">
            <strong>Ce pays propose un e-Visa.</strong> Procédure 100 % en
            ligne, pas de biométrie à Yaoundé. Délai habituel : 48 h à 5 jours
            ouvrés.
          </Notice>
        )}
        {dest?.requiresBiometrieYaounde && (
          <Notice tone="neutral">
            <strong>Biométrie à Yaoundé requise.</strong> Pour ce pays, un
            déplacement à Yaoundé (centre VFS/TLS) est nécessaire pour le
            dépôt biométrique. Nexus organise le rendez-vous.
          </Notice>
        )}
        {showEtudesRedirect && (
          <Notice tone="info">
            <strong>Projet d'études ?</strong> Notre service{" "}
            <Link
              href="/services/bourses"
              className="font-semibold underline underline-offset-4"
            >
              Études Canada / Bourses
            </Link>{" "}
            peut être plus adapté pour un accompagnement complet.
          </Notice>
        )}
        {showShortDelay && (
          <Notice tone="warn">
            <strong>Délai très court.</strong> Un conseiller analysera la
            faisabilité en priorité — certains visas (Schengen, Canada) ont
            besoin de plusieurs semaines.
          </Notice>
        )}
      </div>
    </StepCard>
  );
}

// ─── Étape 3 — Historique ───────────────────────────────────────────────────

function Step3({
  form,
  update,
  errors,
}: {
  form: VisaFormData;
  update: <K extends keyof VisaFormData>(k: K, v: VisaFormData[K]) => void;
  errors: ValidationErrors;
}) {
  const showRefusFlag = form.nb_refus === "3_plus";
  const showNoTravelFlag =
    form.voyages_internationaux === "aucun" &&
    (form.pays_destination === "schengen" ||
      form.pays_destination === "canada");
  const askMotif = form.nb_refus && form.nb_refus !== "aucun";

  return (
    <StepCard
      title="Votre historique"
      subtitle="Ces informations nous permettent d'anticiper les exigences spécifiques de votre dossier."
    >
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Avez-vous déjà obtenu un visa pour ce pays ? *
          </p>
          <RadioGroup
            name="visa_obtenu_avant"
            value={form.visa_obtenu_avant}
            onChange={(v) =>
              update(
                "visa_obtenu_avant",
                v as typeof form.visa_obtenu_avant
              )
            }
            options={[
              { value: "non", label: "Non" },
              { value: "oui_expire", label: "Oui, mais expiré" },
              { value: "oui_valide", label: "Oui, encore valide" },
            ]}
            error={errors.visa_obtenu_avant}
          />
        </div>

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Avez-vous déjà reçu un refus de visa ? *
          </p>
          <RadioGroup
            name="nb_refus"
            value={form.nb_refus}
            onChange={(v) => update("nb_refus", v as typeof form.nb_refus)}
            options={REFUS_OPTIONS.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
            error={errors.nb_refus}
          />
        </div>

        {askMotif && (
          <div>
            <Textarea
              label="Motif du refus (s'il vous a été communiqué)"
              rows={3}
              value={form.motif_refus}
              onChange={(e) => update("motif_refus", e.target.value)}
              placeholder="Recopiez le motif tel qu'il apparaît sur la décision, si vous l'avez reçu."
            />
          </div>
        )}

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Combien de pays internationaux avez-vous visités ? *
          </p>
          <RadioGroup
            name="voyages_internationaux"
            value={form.voyages_internationaux}
            onChange={(v) =>
              update(
                "voyages_internationaux",
                v as typeof form.voyages_internationaux
              )
            }
            options={VOYAGES_OPTIONS.map((v) => ({
              value: v.value,
              label: v.label,
            }))}
            error={errors.voyages_internationaux}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {showRefusFlag && (
          <Notice tone="warn">
            <strong>Votre situation nécessite une analyse approfondie.</strong>{" "}
            Un conseiller senior étudiera votre dossier avant tout
            engagement. Le formulaire reste accessible — votre demande sera
            traitée en priorité.
          </Notice>
        )}
        {showNoTravelFlag && (
          <Notice tone="warn">
            <strong>
              Première demande Schengen / Canada sans historique de voyage.
            </strong>{" "}
            Cette configuration est exigeante. Nous vous orienterons
            honnêtement après analyse de votre profil complet.
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
  form: VisaFormData;
  update: <K extends keyof VisaFormData>(k: K, v: VisaFormData[K]) => void;
  errors: ValidationErrors;
  toggleDocument: (val: string) => void;
}) {
  return (
    <StepCard
      title="Votre situation"
      subtitle="Ressources, lien avec la RCA et documents disponibles. Plus vous êtes précis, plus l'analyse de faisabilité est juste."
    >
      <div className="space-y-6">
        <Select
          label="Niveau de ressources mensuelles *"
          value={form.ressources_range}
          onChange={(e) =>
            update(
              "ressources_range",
              e.target.value as typeof form.ressources_range
            )
          }
          error={errors.ressources_range}
        >
          <option value="">Sélectionner…</option>
          {RESSOURCES_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Lien avec la RCA / preuve de retour *"
          rows={3}
          value={form.ancrage_rca}
          onChange={(e) => update("ancrage_rca", e.target.value)}
          error={errors.ancrage_rca}
          placeholder="Ex : propriétaire à Bangui, salarié dans une entreprise locale, famille proche restée, étudiant en cours, etc."
        />
        <p className="-mt-3 text-caption text-ink-muted">
          Pour de nombreux visas, montrer un lien fort avec la RCA rassure le
          consulat sur votre intention de retour.
        </p>

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Documents déjà disponibles
          </p>
          <p className="mb-3 text-caption text-ink-muted">
            Cochez ce que vous avez déjà. Pas grave si vous n'avez rien — nous
            vous accompagnons dans la constitution.
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

        <div>
          <p className="mb-2 text-caption font-semibold text-ink">
            Avez-vous une invitation, admission ou contrat dans le pays ? *
          </p>
          <RadioGroup
            name="invitation_admission"
            value={form.invitation_admission}
            onChange={(v) =>
              update(
                "invitation_admission",
                v as typeof form.invitation_admission
              )
            }
            options={[
              { value: "oui", label: "Oui" },
              { value: "non", label: "Non" },
            ]}
            error={errors.invitation_admission}
          />
          {form.invitation_admission === "oui" && (
            <div className="mt-4">
              <Textarea
                label="Précisez (organisme, type de document, date)"
                rows={2}
                value={form.invitation_admission_detail}
                onChange={(e) =>
                  update("invitation_admission_detail", e.target.value)
                }
                placeholder="Ex : invitation de Madame X pour visite familiale du 15 mars au 30 mars."
              />
            </div>
          )}
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
  form: VisaFormData;
  update: <K extends keyof VisaFormData>(k: K, v: VisaFormData[K]) => void;
  errors: ValidationErrors;
  loading: boolean;
  onSubmit: () => void;
}) {
  const dest = getDestination(form.pays_destination);
  const typeVisa = getTypeVisa(form.type_visa);
  const faisabilite = computeFaisabilite(form);
  const fais = faisabiliteLabel(faisabilite);
  const checklist = generateChecklist(form.type_visa, form.pays_destination);
  const delai = generateDelaiIndicatif(form.type_visa, form.pays_destination);

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
        {/* Récap */}
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard title="Votre projet">
            <SummaryLine
              label="Pays"
              value={`${dest?.emoji ?? ""} ${dest?.label ?? form.pays_destination}`}
            />
            <SummaryLine
              label="Type de visa"
              value={typeVisa?.label ?? form.type_visa}
            />
            <SummaryLine
              label="Durée"
              value={dureeLabel(form.duree_sejour)}
            />
            <SummaryLine
              label="Date prévue"
              value={form.date_voyage || "À définir"}
            />
          </SummaryCard>

          <SummaryCard title="Votre profil">
            <SummaryLine
              label="Profil"
              value={profilProLabel(form.profil_pro)}
            />
            <SummaryLine
              label="Âge"
              value={trancheAgeLabel(form.tranche_age)}
            />
            <SummaryLine label="Résidence" value={form.pays_residence || "—"} />
            <SummaryLine
              label="Voyages"
              value={voyagesLabel(form.voyages_internationaux)}
            />
            <SummaryLine label="Refus" value={refusLabel(form.nb_refus)} />
          </SummaryCard>
        </div>

        {/* Faisabilité estimée */}
        <div
          className={cn(
            "rounded-3xl border p-6 sm:p-7",
            colorMap[fais.color]
          )}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{fais.emoji}</div>
            <div className="flex-1">
              <p className="text-overline opacity-80">
                Notre estimation préliminaire
              </p>
              <h3 className="mt-1 font-display text-display-sm">
                {fais.label}
              </h3>
              <p className="mt-2 text-body-sm opacity-90">{fais.description}</p>
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
                <h3 className="text-title text-ink">Délai indicatif</h3>
              </div>
              <p className="font-display text-display-sm text-ink">{delai}</p>
              <p className="mt-2 text-caption text-ink-muted">
                Cette estimation est donnée à titre indicatif. Le conseiller
                Nexus confirmera après analyse complète de votre dossier.
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
              label="J'accepte que Nexus RCA examine mon projet et mes documents."
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
              label="Je reconnais qu'aucune obtention de visa n'est garantie et que Nexus RCA fournit un service d'accompagnement professionnel."
            />
          </div>
        </div>

        {/* CTA submit */}
        <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-headline text-ink sm:text-display-sm">
              Prêt à soumettre votre demande ?
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
      <div className="grid gap-2 sm:grid-cols-2">
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

// ─── Construction de la description pour le conseiller ──────────────────────

function buildSubmissionDescription(form: VisaFormData): string {
  const dest = getDestination(form.pays_destination);
  const typeVisa = getTypeVisa(form.type_visa);
  const fais = computeFaisabilite(form);

  const lines = [
    `Demande visa — soumise via formulaire dédié.`,
    ``,
    `Destination : ${dest?.label ?? form.pays_destination}`,
    `Type : ${typeVisa?.label ?? form.type_visa}`,
    `Durée : ${dureeLabel(form.duree_sejour)}`,
    `Date prévue : ${form.date_voyage || "À définir"}`,
    `Première fois : ${form.premiere_fois_pays}`,
    ``,
    `Profil : ${profilProLabel(form.profil_pro)}, ${trancheAgeLabel(form.tranche_age)}`,
    `Résidence : ${form.pays_residence}`,
    ``,
    `Historique :`,
    `- Visa antérieur pour ce pays : ${form.visa_obtenu_avant}`,
    `- Refus : ${refusLabel(form.nb_refus)}`,
    form.motif_refus ? `- Motif refus : ${form.motif_refus}` : "",
    `- Voyages internationaux : ${voyagesLabel(form.voyages_internationaux)}`,
    ``,
    `Situation :`,
    `- Ressources : ${ressourcesLabel(form.ressources_range)}`,
    `- Ancrage RCA : ${form.ancrage_rca}`,
    `- Documents disponibles : ${form.documents_disponibles.join(", ") || "aucun"}`,
    `- Invitation/admission : ${form.invitation_admission}${form.invitation_admission_detail ? ` (${form.invitation_admission_detail})` : ""}`,
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
  form: VisaFormData;
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
          conseiller Nexus étudie votre dossier selon notre méthodologie. Si
          votre projet correspond à nos critères, nous vous proposons un
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
              `Bonjour Nexus, je viens de soumettre ma demande visa ${reference}.`
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
