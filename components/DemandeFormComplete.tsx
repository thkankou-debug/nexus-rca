"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  LogIn,
  Paperclip,
  Trash2,
  Upload,
  User,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORIES_PAR_SERVICE,
  DEFAULT_FORM_VALUES_COMPLETE,
  DOCUMENT_CATEGORIES,
  getPasswordStrength,
  NIVEAUX_ETUDES,
  SERVICES_COMPLETS,
  SEXES,
  SITUATIONS_MATRIMONIALES,
  validateFinal,
  validateSection,
  type DemandeCompletePayload,
  type DocumentCategorie,
  type PasswordStrength,
  type ServiceComplet,
  type ValidationErrors,
} from "@/lib/demande-complete-form";

const STORAGE_KEY = "nexus_demande_complete_v4";

// 7 sections : 0 (identification), 1 (personnel), 2 (demande), 3 (spécifique),
// 4 (documents), 5 (complémentaires), 6 (validation)
type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const SECTIONS: Array<{
  id: StepId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
}> = [
  {
    id: 0,
    number: "00",
    title: "Identification",
    shortTitle: "Identification",
    description: "Êtes-vous déjà client de Nexus RCA ?",
  },
  {
    id: 1,
    number: "01",
    title: "Identification du demandeur",
    shortTitle: "Personnel",
    description: "Renseignez les coordonnées du demandeur principal.",
  },
  {
    id: 2,
    number: "02",
    title: "Type de demande",
    shortTitle: "Demande",
    description: "Sélectionnez le service et précisez le contexte de votre demande.",
  },
  {
    id: 3,
    number: "03",
    title: "Informations spécifiques",
    shortTitle: "Spécifique",
    description: "Précisions complémentaires liées au service demandé.",
  },
  {
    id: 4,
    number: "04",
    title: "Documents",
    shortTitle: "Documents",
    description:
      "Joignez les pièces utiles à votre dossier. Aucune catégorie n'est obligatoire.",
  },
  {
    id: 5,
    number: "05",
    title: "Informations complémentaires",
    shortTitle: "Notes",
    description: "Toute information utile au traitement de votre dossier.",
  },
  {
    id: 6,
    number: "06",
    title: "Validation",
    shortTitle: "Validation",
    description: "Vérification du dossier et acceptation des conditions.",
  },
];

type FilesByCategory = Record<DocumentCategorie, File[]>;
const EMPTY_FILES: FilesByCategory = {
  piece_identite: [],
  passeport: [],
  diplomes: [],
  documents_financiers: [],
  documents_administratifs: [],
  lettre_invitation: [],
  photos_identite: [],
  documents_complementaires: [],
};

export function DemandeFormComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabaseClient = createClient();

  const [currentStep, setCurrentStep] = useState<StepId>(0);
  const [form, setForm] = useState<DemandeCompletePayload>(
    DEFAULT_FORM_VALUES_COMPLETE
  );
  const [filesByCategory, setFilesByCategory] =
    useState<FilesByCategory>(EMPTY_FILES);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  // Détection client déjà authentifié → skip Section 00 + cache email/password
  const [clientAuthenticated, setClientAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const hydratedRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // ===== Détection auth + auto-fill profile =====
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) {
        // Récupérer le profile pour auto-fill
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("nom, prenom, email, telephone, pays")
          .eq("id", user.id)
          .single();
        setClientAuthenticated(true);
        setForm((f) => ({
          ...f,
          identification_mode: "deja_client",
          email: profile?.email || user.email || f.email,
          nom_complet:
            profile && (profile.prenom || profile.nom)
              ? `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim()
              : f.nom_complet,
          telephone: profile?.telephone || f.telephone,
          pays: profile?.pays || f.pays,
        }));
        // Skip Section 00 directement à Section 01
        setCurrentStep(1);
      }
      setAuthChecked(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Hydratation localStorage =====
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<DemandeCompletePayload>;
        // Ne jamais restaurer le mot de passe depuis localStorage (sécurité)
        delete parsed.password;
        delete parsed.password_confirm;
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch {
      /* ignore */
    }

    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      const service = SERVICES_COMPLETS.find((s) =>
        s.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (service) {
        setForm((f) => ({ ...f, service }));
      }
    }
  }, [searchParams]);

  // ===== Sauvegarde auto (sans le mot de passe) =====
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const safeForm = { ...form, password: "", password_confirm: "" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeForm));
    } catch {
      /* ignore */
    }
  }, [form]);

  // ===== Scroll en haut au changement de section =====
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const update = <K extends keyof DemandeCompletePayload>(
    key: K,
    value: DemandeCompletePayload[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => ({ ...e, [key as string]: undefined }));
    }
  };

  const updateDetail = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, details_service: { ...f.details_service, [key]: value } }));
  };

  const handleNext = () => {
    const err = validateSection(currentStep, form);
    if (Object.keys(err).length > 0) {
      setErrors(err);
      toast.error("Merci de corriger les champs indiqués");
      const firstError = Object.keys(err)[0];
      const el = document.querySelector(`[data-field="${firstError}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Étape 0 : si "déjà client" → redirect /login
    if (currentStep === 0 && form.identification_mode === "deja_client") {
      router.push("/login?redirectTo=/demande/complet");
      return;
    }

    setErrors({});
    if (currentStep < 6) {
      setCurrentStep((s) => (s + 1) as StepId);
    }
  };

  const handlePrev = () => {
    setErrors({});
    // Si client authentifié, on ne redescend jamais à Section 00
    const minStep: StepId = clientAuthenticated ? 1 : 0;
    if (currentStep > minStep) {
      setCurrentStep((s) => (s - 1) as StepId);
    }
  };

  // ===== Submission =====
  const handleSubmit = async () => {
    const err = validateFinal(form);
    if (Object.keys(err).length > 0) {
      setErrors(err);
      toast.error("Merci de corriger les champs indiqués");
      // Routing vers la première section avec erreur
      if (
        err.identification_mode
      ) {
        setCurrentStep(0);
      } else if (
        err.nom_complet ||
        err.sexe ||
        err.date_naissance ||
        err.nationalite ||
        err.pays ||
        err.ville ||
        err.adresse ||
        err.telephone ||
        err.email ||
        err.situation_matrimoniale ||
        err.profession ||
        err.niveau_etudes
      ) {
        setCurrentStep(1);
      } else if (
        err.service ||
        err.categorie_demande ||
        err.pays_concerne ||
        err.type_procedure ||
        err.date_souhaitee ||
        err.numero_dossier_existant
      ) {
        setCurrentStep(2);
      } else {
        setCurrentStep(6);
      }
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("payload", JSON.stringify(form));

    // Append files par catégorie
    for (const cat of DOCUMENT_CATEGORIES) {
      for (const f of filesByCategory[cat.value]) {
        formData.append(`documents_${cat.value}`, f);
      }
    }

    try {
      const res = await fetch("/api/demandes/complete", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Cas spécial : email déjà utilisé → 409
        if (res.status === 409 && data.error?.includes("déjà associé")) {
          toast.error(data.error);
          setErrors({ email: data.error });
          setCurrentStep(1);
        } else {
          throw new Error(data.error || "Erreur lors de la soumission");
        }
        setLoading(false);
        return;
      }

      // Si compte créé : on connecte le client immédiatement avec ses identifiants
      if (data.account_created && form.password) {
        const { error: signInErr } =
          await supabaseClient.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });
        if (signInErr) {
          console.warn(
            "[DEMANDE_COMPLETE] auto-login failed:",
            signInErr.message
          );
          // On continue quand même — le dossier est créé
        }
      }

      // Nettoyage du brouillon
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }

      toast.success(
        data.account_created
          ? "Dossier soumis. Votre compte Nexus Connect est créé."
          : "Dossier soumis avec succès."
      );

      // Redirect vers Nexus Connect (page détail dossier)
      router.push(`/dashboard/client/demandes/${data.demande_id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la soumission";
      toast.error(message);
      setLoading(false);
    }
  };

  const currentSection = SECTIONS.find((s) => s.id === currentStep)!;
  const totalFiles = Object.values(filesByCategory).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div ref={topRef} className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ─── Colonne formulaire (8/12) ─── */}
      <div className="lg:col-span-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.20)]">
          {/* Stepper compact */}
          <SectionStepper currentStep={currentStep} />

          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Header section */}
            <SectionHeader
              number={currentSection.number}
              title={currentSection.title}
              description={currentSection.description}
            />

            {/* ===== Section 00 — Identification ===== */}
            {currentStep === 0 && (
              <div className="space-y-3" data-field="identification_mode">
                <RadioCard
                  selected={form.identification_mode === "deja_client"}
                  onClick={() => update("identification_mode", "deja_client")}
                  icon={LogIn}
                  title="Je suis déjà client Nexus RCA"
                  description="Vous serez redirigé vers la page de connexion."
                />
                <RadioCard
                  selected={form.identification_mode === "nouveau"}
                  onClick={() => update("identification_mode", "nouveau")}
                  icon={UserPlus}
                  title="Je suis un nouveau demandeur"
                  description="Un compte sera automatiquement créé pour vous à la soumission de votre dossier."
                />
                {errors.identification_mode && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.identification_mode}
                  </p>
                )}
              </div>
            )}

            {/* ===== Section 01 — Identification du demandeur ===== */}
            {currentStep === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Nom complet *"
                  error={errors.nom_complet}
                  dataField="nom_complet"
                >
                  <PremiumInput
                    value={form.nom_complet}
                    onChange={(v) => update("nom_complet", v)}
                    placeholder="Jean Dupont"
                  />
                </FormField>
                <FormField label="Sexe *" error={errors.sexe} dataField="sexe">
                  <PremiumSelect
                    value={form.sexe}
                    onChange={(v) => update("sexe", v as DemandeCompletePayload["sexe"])}
                    options={["", ...SEXES]}
                    optionLabels={{ "": "— Sélectionnez —" }}
                  />
                </FormField>
                <FormField
                  label="Date de naissance *"
                  error={errors.date_naissance}
                  dataField="date_naissance"
                >
                  <PremiumInput
                    type="date"
                    value={form.date_naissance}
                    onChange={(v) => update("date_naissance", v)}
                  />
                </FormField>
                <FormField
                  label="Nationalité *"
                  error={errors.nationalite}
                  dataField="nationalite"
                >
                  <PremiumInput
                    value={form.nationalite}
                    onChange={(v) => update("nationalite", v)}
                    placeholder="ex : Centrafricaine"
                  />
                </FormField>
                <FormField
                  label="Pays de résidence *"
                  error={errors.pays}
                  dataField="pays"
                >
                  <PremiumInput
                    value={form.pays}
                    onChange={(v) => update("pays", v)}
                  />
                </FormField>
                <FormField label="Ville *" error={errors.ville} dataField="ville">
                  <PremiumInput
                    value={form.ville}
                    onChange={(v) => update("ville", v)}
                    placeholder="Bangui"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    label="Adresse complète *"
                    error={errors.adresse}
                    dataField="adresse"
                  >
                    <PremiumInput
                      value={form.adresse}
                      onChange={(v) => update("adresse", v)}
                      placeholder="Quartier, rue, repère…"
                    />
                  </FormField>
                </div>
                <FormField
                  label="Téléphone / WhatsApp *"
                  error={errors.telephone}
                  dataField="telephone"
                >
                  <PremiumInput
                    value={form.telephone}
                    onChange={(v) => update("telephone", v)}
                    placeholder="+236 ..."
                  />
                </FormField>
                {/* Email — masqué si déjà authentifié (auto-fill) */}
                {!clientAuthenticated && (
                  <FormField label="Email *" error={errors.email} dataField="email">
                    <PremiumInput
                      type="email"
                      value={form.email}
                      onChange={(v) => update("email", v)}
                      placeholder="vous@exemple.com"
                    />
                  </FormField>
                )}
                {clientAuthenticated && (
                  <FormField label="Email (compte connecté)">
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{form.email}</span>
                    </div>
                  </FormField>
                )}
                {/* Mots de passe — uniquement pour mode "nouveau" */}
                {form.identification_mode === "nouveau" &&
                  !clientAuthenticated && (
                    <>
                      <div className="sm:col-span-2">
                        <PasswordHelpBox />
                      </div>
                      <FormField
                        label="Mot de passe *"
                        error={errors.password}
                        dataField="password"
                      >
                        <PasswordField
                          value={form.password}
                          onChange={(v) => update("password", v)}
                          placeholder="Minimum 8 caractères"
                          showStrength
                        />
                      </FormField>
                      <FormField
                        label="Confirmer le mot de passe *"
                        error={errors.password_confirm}
                        dataField="password_confirm"
                      >
                        <PasswordField
                          value={form.password_confirm}
                          onChange={(v) => update("password_confirm", v)}
                          placeholder="Saisissez à nouveau"
                          matchValue={form.password}
                        />
                      </FormField>
                    </>
                  )}
                <FormField
                  label="Situation matrimoniale *"
                  error={errors.situation_matrimoniale}
                  dataField="situation_matrimoniale"
                >
                  <PremiumSelect
                    value={form.situation_matrimoniale}
                    onChange={(v) =>
                      update("situation_matrimoniale", v as DemandeCompletePayload["situation_matrimoniale"])
                    }
                    options={["", ...SITUATIONS_MATRIMONIALES]}
                    optionLabels={{ "": "— Sélectionnez —" }}
                  />
                </FormField>
                <FormField
                  label="Profession actuelle *"
                  error={errors.profession}
                  dataField="profession"
                >
                  <PremiumInput
                    value={form.profession}
                    onChange={(v) => update("profession", v)}
                    placeholder="ex : Ingénieur logiciel"
                  />
                </FormField>
                <FormField label="Employeur / établissement (optionnel)">
                  <PremiumInput
                    value={form.employeur}
                    onChange={(v) => update("employeur", v)}
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    label="Niveau d'études *"
                    error={errors.niveau_etudes}
                    dataField="niveau_etudes"
                  >
                    <PremiumSelect
                      value={form.niveau_etudes}
                      onChange={(v) =>
                        update("niveau_etudes", v as DemandeCompletePayload["niveau_etudes"])
                      }
                      options={["", ...NIVEAUX_ETUDES]}
                      optionLabels={{ "": "— Sélectionnez —" }}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* ===== Section 02 — Type de demande ===== */}
            {currentStep === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField
                    label="Service demandé *"
                    error={errors.service}
                    dataField="service"
                  >
                    <PremiumSelect
                      value={form.service}
                      onChange={(v) => {
                        update("service", v as ServiceComplet);
                        update("categorie_demande", "");
                      }}
                      options={["", ...SERVICES_COMPLETS]}
                      optionLabels={{ "": "— Sélectionnez —" }}
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField
                    label="Catégorie de demande *"
                    error={errors.categorie_demande}
                    dataField="categorie_demande"
                  >
                    <PremiumSelect
                      value={form.categorie_demande}
                      onChange={(v) => update("categorie_demande", v)}
                      options={[
                        "",
                        ...(form.service
                          ? CATEGORIES_PAR_SERVICE[form.service as ServiceComplet]
                          : []),
                      ]}
                      optionLabels={{
                        "": form.service
                          ? "— Sélectionnez —"
                          : "— Choisissez d'abord un service —",
                      }}
                      disabled={!form.service}
                    />
                  </FormField>
                </div>
                <FormField
                  label="Pays concerné *"
                  error={errors.pays_concerne}
                  dataField="pays_concerne"
                >
                  <PremiumInput
                    value={form.pays_concerne}
                    onChange={(v) => update("pays_concerne", v)}
                    placeholder="ex : Canada, France…"
                  />
                </FormField>
                <FormField
                  label="Type de procédure *"
                  error={errors.type_procedure}
                  dataField="type_procedure"
                >
                  <PremiumInput
                    value={form.type_procedure}
                    onChange={(v) => update("type_procedure", v)}
                    placeholder="ex : Première demande / renouvellement"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    label="Date prévue du projet ou déplacement *"
                    error={errors.date_souhaitee}
                    dataField="date_souhaitee"
                  >
                    <PremiumInput
                      type="date"
                      value={form.date_souhaitee}
                      onChange={(v) => update("date_souhaitee", v)}
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Avez-vous déjà effectué cette démarche auparavant ?">
                    <div className="flex gap-2">
                      <YesNoButton
                        label="Non"
                        selected={!form.dossier_existant}
                        onClick={() => update("dossier_existant", false)}
                      />
                      <YesNoButton
                        label="Oui"
                        selected={form.dossier_existant}
                        onClick={() => update("dossier_existant", true)}
                      />
                    </div>
                  </FormField>
                </div>
                {form.dossier_existant && (
                  <div className="sm:col-span-2">
                    <FormField
                      label="Numéro de dossier existant *"
                      error={errors.numero_dossier_existant}
                      dataField="numero_dossier_existant"
                    >
                      <PremiumInput
                        value={form.numero_dossier_existant}
                        onChange={(v) =>
                          update("numero_dossier_existant", v)
                        }
                        placeholder="Référence du dossier précédent"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            )}

            {/* ===== Section 03 — Informations spécifiques ===== */}
            {currentStep === 3 && (
              <DynamicFields
                service={form.service}
                details={form.details_service}
                onChange={updateDetail}
              />
            )}

            {/* ===== Section 04 — Documents ===== */}
            {currentStep === 4 && (
              <DocumentsUpload
                filesByCategory={filesByCategory}
                onChange={setFilesByCategory}
              />
            )}

            {/* ===== Section 05 — Informations complémentaires ===== */}
            {currentStep === 5 && (
              <FormField
                label="Informations complémentaires relatives à votre demande"
                dataField="informations_complementaires"
              >
                <PremiumTextarea
                  value={form.informations_complementaires}
                  onChange={(v) => update("informations_complementaires", v)}
                  rows={6}
                  placeholder="Précisez ici toute information utile au traitement de votre dossier (numéros de référence, contacts antérieurs, contraintes particulières, etc.)"
                />
                <p className="mt-2 text-[11px] text-white/55">
                  Optionnel — vous pouvez compléter ces informations plus tard
                  depuis votre espace Nexus Connect.
                </p>
              </FormField>
            )}

            {/* ===== Section 06 — Validation ===== */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-md sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-nexus-orange-300" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                      Récapitulatif
                    </h3>
                  </div>
                  <RecapBlock title="Identification">
                    <RecapRow label="Nom" value={form.nom_complet} />
                    <RecapRow label="Email" value={form.email} />
                    <RecapRow label="Téléphone" value={form.telephone} />
                    <RecapRow
                      label="Adresse"
                      value={`${form.ville}, ${form.pays}`}
                    />
                  </RecapBlock>
                  <RecapBlock title="Demande">
                    <RecapRow label="Service" value={form.service} />
                    <RecapRow label="Catégorie" value={form.categorie_demande} />
                    <RecapRow label="Pays concerné" value={form.pays_concerne} />
                    <RecapRow label="Date prévue" value={form.date_souhaitee} />
                  </RecapBlock>
                  <RecapBlock title="Documents joints">
                    <p className="text-sm text-white/85">
                      {totalFiles === 0
                        ? "Aucun document joint pour le moment"
                        : `${totalFiles} fichier(s) joint(s)`}
                    </p>
                  </RecapBlock>
                </div>

                <div className="space-y-2.5">
                  <ConsentCheckbox
                    checked={form.consentement_examen}
                    onChange={(v) => update("consentement_examen", v)}
                    error={errors.consentement_examen}
                    label="Je certifie l'exactitude des informations fournies."
                  />
                  <ConsentCheckbox
                    checked={form.consentement_documents}
                    onChange={(v) => update("consentement_documents", v)}
                    error={errors.consentement_documents}
                    label="J'autorise Nexus RCA à traiter mon dossier et les documents joints."
                  />
                  <ConsentCheckbox
                    checked={form.consentement_recontact}
                    onChange={(v) => update("consentement_recontact", v)}
                    error={errors.consentement_recontact}
                    label="J'accepte d'être contacté par Nexus RCA concernant ma demande."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-7 py-4 text-base font-bold text-white shadow-[0_12px_32px_-10px_rgba(255,102,0,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:from-nexus-orange-600 hover:to-nexus-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Soumission en cours…
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Soumettre la demande complète
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ===== Navigation ===== */}
            {currentStep < 6 && (
              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-40",
                    currentStep === 0 && "invisible"
                  )}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Section précédente
                </button>
                <p className="text-center text-[11px] uppercase tracking-[0.16em] text-white/55 sm:flex-1 sm:px-6">
                  Section {currentSection.number} / 06
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-nexus-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600"
                >
                  {currentStep === 0 &&
                  form.identification_mode === "deja_client"
                    ? "Aller à la connexion"
                    : "Section suivante"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </button>
              </div>
            )}

            {currentStep === 6 && (
              <div className="mt-8 flex justify-start border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Section précédente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Sidebar (4/12 desktop) ─── */}
      <aside className="hidden lg:col-span-4 lg:block">
        <div className="lg:sticky lg:top-24">
          <ResumeSidebar
            currentStep={currentStep}
            form={form}
            totalFiles={totalFiles}
          />
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function SectionStepper({ currentStep }: { currentStep: StepId }) {
  return (
    <div className="border-b border-white/10 px-6 py-3 sm:px-8">
      <div className="hidden items-center gap-1 sm:flex">
        {SECTIONS.map((s, i) => {
          const state =
            s.id < currentStep ? "done" : s.id === currentStep ? "active" : "todo";
          return (
            <div key={s.id} className="flex items-center gap-1">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] transition-all",
                  state === "active"
                    ? "bg-nexus-orange-500 text-white shadow-[0_0_18px_-2px_rgba(255,102,0,0.7)]"
                    : state === "done"
                      ? "bg-white/15 text-white"
                      : "bg-white/[0.04] text-white/35 ring-1 ring-white/10"
                )}
              >
                {state === "done" ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  s.number
                )}
              </span>
              {i < SECTIONS.length - 1 && (
                <span
                  className={cn(
                    "h-px w-2 transition-colors",
                    s.id < currentStep
                      ? "bg-nexus-orange-400/60"
                      : "bg-white/10"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-nexus-orange-300">
            {SECTIONS.find((s) => s.id === currentStep)?.number} / 06
          </span>
          <span className="font-semibold text-white/85">
            {SECTIONS.find((s) => s.id === currentStep)?.shortTitle}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 shadow-[0_0_12px_-2px_rgba(255,102,0,0.6)] transition-all duration-500"
            style={{ width: `${((currentStep + 1) / 7) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-3xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(251,146,60,0.4)] sm:text-4xl">
          {number}
        </span>
        <span className="text-xl font-thin text-nexus-orange-400/40 sm:text-2xl">
          —
        </span>
        <h2 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
        {description}
      </p>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-nexus-orange-400/40 via-white/10 to-transparent" />
    </div>
  );
}

function RadioCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof User;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl border p-5 text-left backdrop-blur-md transition-all duration-200",
        selected
          ? "border-nexus-orange-400/60 bg-nexus-orange-500/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(255,102,0,0.30)]"
          : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all",
          selected
            ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white"
            : "bg-white/[0.04] text-white/60 ring-1 ring-white/10"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-display text-base font-bold leading-tight",
            selected ? "text-white" : "text-white/85"
          )}
        >
          {title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
      <div
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          selected
            ? "border-nexus-orange-400 bg-nexus-orange-500 text-white"
            : "border-white/20 bg-transparent"
        )}
      >
        {selected && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}

function FormField({
  label,
  children,
  error,
  dataField,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  dataField?: string;
}) {
  return (
    <div data-field={dataField}>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

function PremiumInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-nexus-blue-950/40 px-4 py-2.5 text-sm text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1 focus:ring-nexus-orange-500/30 [color-scheme:dark]"
    />
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  showStrength,
  matchValue,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  matchValue?: string;
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;
  const matches = matchValue !== undefined && value && value === matchValue;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-nexus-blue-950/40 py-2.5 pl-4 pr-11 text-sm text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1 focus:ring-nexus-orange-500/30 [color-scheme:dark]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-white/55 transition-colors hover:text-white/85"
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Indicateur de force */}
      {showStrength && value && strength && (
        <PasswordStrengthBar strength={strength} />
      )}

      {/* Match feedback (champ confirm) */}
      {matchValue !== undefined && value && (
        <p
          className={cn(
            "flex items-center gap-1 text-[11px]",
            matches ? "text-emerald-300" : "text-rose-300"
          )}
        >
          {matches ? (
            <>
              <Check className="h-3 w-3" />
              Les mots de passe correspondent
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3" />
              Les mots de passe ne correspondent pas
            </>
          )}
        </p>
      )}
    </div>
  );
}

function PasswordStrengthBar({ strength }: { strength: PasswordStrength }) {
  const config: Record<
    PasswordStrength,
    { label: string; color: string; width: string }
  > = {
    vide: { label: "—", color: "bg-white/10", width: "w-0" },
    faible: { label: "Faible", color: "bg-rose-400", width: "w-1/3" },
    moyen: { label: "Moyen", color: "bg-amber-400", width: "w-2/3" },
    fort: { label: "Fort", color: "bg-emerald-400", width: "w-full" },
  };
  const c = config[strength];
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            c.color,
            c.width
          )}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.14em]",
          strength === "faible" && "text-rose-300",
          strength === "moyen" && "text-amber-300",
          strength === "fort" && "text-emerald-300"
        )}
      >
        {c.label}
      </span>
    </div>
  );
}

function PasswordHelpBox() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-nexus-orange-400/25 bg-nexus-orange-500/8 p-3 text-xs leading-relaxed text-nexus-orange-100">
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-300" />
      <span>
        <strong>Minimum 8 caractères.</strong> Vous utiliserez ce mot de passe
        pour accéder à votre espace Nexus Connect et suivre votre dossier.
      </span>
    </div>
  );
}

function PremiumTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-white/10 bg-nexus-blue-950/40 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/35 backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1 focus:ring-nexus-orange-500/30"
    />
  );
}

function PremiumSelect({
  value,
  onChange,
  options,
  optionLabels,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-white/10 bg-nexus-blue-950/40 px-4 py-2.5 text-sm text-white backdrop-blur-md transition-all duration-200 focus:border-nexus-orange-400/60 focus:bg-nexus-blue-950/60 focus:outline-none focus:ring-1 focus:ring-nexus-orange-500/30 disabled:opacity-50 [color-scheme:dark]"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-nexus-blue-950 text-white">
          {optionLabels?.[o] || o}
        </option>
      ))}
    </select>
  );
}

function YesNoButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-200",
        selected
          ? "border-nexus-orange-400/60 bg-nexus-orange-500/10 text-white"
          : "border-white/10 bg-white/[0.04] text-white/85 hover:border-white/20 hover:bg-white/[0.07]"
      )}
    >
      {label}
    </button>
  );
}

function DynamicFields({
  service,
  details,
  onChange,
}: {
  service: string;
  details: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  if (!service) {
    return (
      <p className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-white/55">
        Sélectionnez d&rsquo;abord un service à la section 02 pour afficher les
        champs spécifiques.
      </p>
    );
  }

  // Visa
  if (service === "Visa & e-Visa") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Type de passeport">
          <PremiumSelect
            value={(details.type_passeport as string) || ""}
            onChange={(v) => onChange("type_passeport", v)}
            options={["", "Ordinaire", "Diplomatique", "Service"]}
            optionLabels={{ "": "— Sélectionnez —" }}
          />
        </FormField>
        <FormField label="Numéro de passeport">
          <PremiumInput
            value={(details.numero_passeport as string) || ""}
            onChange={(v) => onChange("numero_passeport", v)}
          />
        </FormField>
        <FormField label="Date d'expiration du passeport">
          <PremiumInput
            type="date"
            value={(details.expiration_passeport as string) || ""}
            onChange={(v) => onChange("expiration_passeport", v)}
          />
        </FormField>
        <FormField label="Motif du voyage">
          <PremiumSelect
            value={(details.motif_voyage as string) || ""}
            onChange={(v) => onChange("motif_voyage", v)}
            options={["", "Tourisme", "Affaires", "Études", "Médical", "Famille", "Autre"]}
            optionLabels={{ "": "— Sélectionnez —" }}
          />
        </FormField>
        <FormField label="Durée prévue du séjour (jours)">
          <PremiumInput
            type="number"
            value={(details.duree_sejour_jours as string) || ""}
            onChange={(v) => onChange("duree_sejour_jours", v)}
          />
        </FormField>
        <FormField label="Refus de visa antérieur ?">
          <PremiumSelect
            value={(details.refus_visa_anterieur as string) || ""}
            onChange={(v) => onChange("refus_visa_anterieur", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
        {details.refus_visa_anterieur === "oui" && (
          <>
            <FormField label="Pays du refus">
              <PremiumInput
                value={(details.pays_refus as string) || ""}
                onChange={(v) => onChange("pays_refus", v)}
              />
            </FormField>
            <FormField label="Date approximative du refus">
              <PremiumInput
                type="date"
                value={(details.date_refus as string) || ""}
                onChange={(v) => onChange("date_refus", v)}
              />
            </FormField>
          </>
        )}
        <div className="sm:col-span-2">
          <FormField label="Pays déjà visités">
            <PremiumTextarea
              value={(details.pays_visites as string) || ""}
              onChange={(v) => onChange("pays_visites", v)}
              rows={2}
              placeholder="Liste des pays visités au cours des 5 dernières années"
            />
          </FormField>
        </div>
        <FormField label="Avez-vous une personne invitante ?">
          <PremiumSelect
            value={(details.invitant as string) || ""}
            onChange={(v) => onChange("invitant", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
        {details.invitant === "oui" && (
          <FormField label="Nom de l'invitant">
            <PremiumInput
              value={(details.nom_invitant as string) || ""}
              onChange={(v) => onChange("nom_invitant", v)}
            />
          </FormField>
        )}
      </div>
    );
  }

  // Études
  if (service === "Études à l'étranger") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Dernier diplôme obtenu">
          <PremiumInput
            value={(details.dernier_diplome as string) || ""}
            onChange={(v) => onChange("dernier_diplome", v)}
            placeholder="ex : Bac, Licence en informatique…"
          />
        </FormField>
        <FormField label="Domaine d'études">
          <PremiumInput
            value={(details.domaine_etudes as string) || ""}
            onChange={(v) => onChange("domaine_etudes", v)}
            placeholder="ex : Informatique, Médecine…"
          />
        </FormField>
        <FormField label="Niveau recherché">
          <PremiumSelect
            value={(details.niveau_recherche as string) || ""}
            onChange={(v) => onChange("niveau_recherche", v)}
            options={["", "Licence", "Master", "Doctorat", "Formation pro"]}
            optionLabels={{ "": "— Sélectionnez —" }}
          />
        </FormField>
        <FormField label="Établissement ciblé">
          <PremiumInput
            value={(details.etablissement_cible as string) || ""}
            onChange={(v) => onChange("etablissement_cible", v)}
            placeholder="Nom de l'université ou de l'école"
          />
        </FormField>
        <FormField label="Admission déjà obtenue ?">
          <PremiumSelect
            value={(details.admission_obtenue as string) || ""}
            onChange={(v) => onChange("admission_obtenue", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
        <FormField label="Passeport disponible ?">
          <PremiumSelect
            value={(details.passeport_disponible as string) || ""}
            onChange={(v) => onChange("passeport_disponible", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Niveau linguistique (FR / EN / autre)">
            <PremiumInput
              value={(details.niveau_linguistique as string) || ""}
              onChange={(v) => onChange("niveau_linguistique", v)}
              placeholder="ex : FR natif, EN B2, TCF NCLC 7…"
            />
          </FormField>
        </div>
        <FormField label="Besoin de bourse ?">
          <PremiumSelect
            value={(details.besoin_bourse as string) || ""}
            onChange={(v) => onChange("besoin_bourse", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
      </div>
    );
  }

  // Business / Incubateur
  if (service === "Incubateur & Financement") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nom de l'entreprise / projet">
          <PremiumInput
            value={(details.nom_projet as string) || ""}
            onChange={(v) => onChange("nom_projet", v)}
          />
        </FormField>
        <FormField label="Secteur d'activité">
          <PremiumInput
            value={(details.secteur as string) || ""}
            onChange={(v) => onChange("secteur", v)}
          />
        </FormField>
        <FormField label="Pays d'activité">
          <PremiumInput
            value={(details.pays_activite as string) || ""}
            onChange={(v) => onChange("pays_activite", v)}
          />
        </FormField>
        <FormField label="Stade du projet">
          <PremiumSelect
            value={(details.stade_projet as string) || ""}
            onChange={(v) => onChange("stade_projet", v)}
            options={["", "Idée", "Prototype", "Lancé", "En croissance"]}
            optionLabels={{ "": "— Sélectionnez —" }}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Type d'accompagnement recherché">
            <PremiumTextarea
              value={(details.type_accompagnement as string) || ""}
              onChange={(v) => onChange("type_accompagnement", v)}
              rows={3}
            />
          </FormField>
        </div>
        <FormField label="Société enregistrée ?">
          <PremiumSelect
            value={(details.societe_enregistree as string) || ""}
            onChange={(v) => onChange("societe_enregistree", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
      </div>
    );
  }

  // Administratif / Recouvrement
  if (
    service === "Recouvrement de documents" ||
    service === "Autre service administratif"
  ) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Type de document demandé">
          <PremiumInput
            value={(details.type_document as string) || ""}
            onChange={(v) => onChange("type_document", v)}
          />
        </FormField>
        <FormField label="Organisme concerné">
          <PremiumInput
            value={(details.organisme_concerne as string) || ""}
            onChange={(v) => onChange("organisme_concerne", v)}
          />
        </FormField>
        <FormField label="Document déjà disponible ?">
          <PremiumSelect
            value={(details.document_disponible as string) || ""}
            onChange={(v) => onChange("document_disponible", v)}
            options={["", "non", "oui"]}
            optionLabels={{ "": "— Sélectionnez —", non: "Non", oui: "Oui" }}
          />
        </FormField>
        <FormField label="Date limite si applicable">
          <PremiumInput
            type="date"
            value={(details.date_limite as string) || ""}
            onChange={(v) => onChange("date_limite", v)}
          />
        </FormField>
      </div>
    );
  }

  // Default — pas de champs dynamiques pour billet/transferts/autre
  return (
    <p className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-white/65">
      Aucune information spécifique requise pour ce service. Vous pouvez
      passer à la section suivante.
    </p>
  );
}

function DocumentsUpload({
  filesByCategory,
  onChange,
}: {
  filesByCategory: FilesByCategory;
  onChange: (f: FilesByCategory) => void;
}) {
  const handleFiles = (cat: DocumentCategorie, fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    onChange({
      ...filesByCategory,
      [cat]: [...filesByCategory[cat], ...newFiles],
    });
  };

  const removeFile = (cat: DocumentCategorie, index: number) => {
    onChange({
      ...filesByCategory,
      [cat]: filesByCategory[cat].filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-nexus-orange-400/25 bg-nexus-orange-500/10 p-4 text-sm text-nexus-orange-100">
        <p>
          <strong>Aucune catégorie n&rsquo;est obligatoire.</strong> Vous
          pourrez ajouter ou compléter vos documents après soumission depuis
          votre espace Nexus Connect.
        </p>
      </div>
      {DOCUMENT_CATEGORIES.map((cat) => {
        const files = filesByCategory[cat.value];
        return (
          <div
            key={cat.value}
            className="rounded-lg border border-white/10 bg-nexus-blue-950/40 p-4 backdrop-blur-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-nexus-orange-300" />
                <p className="text-sm font-semibold text-white">{cat.label}</p>
                {files.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                    <Check className="h-2.5 w-2.5" />
                    {files.length} fichier(s)
                  </span>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/85 transition-colors hover:border-nexus-orange-400/40 hover:text-white">
                <Upload className="h-3 w-3" />
                Ajouter
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(cat.value, e.target.files)}
                />
              </label>
            </div>
            {files.length > 0 && (
              <ul className="space-y-1.5">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-200"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Paperclip className="h-3 w-3 shrink-0 text-nexus-orange-300" />
                      <span className="truncate">{f.name}</span>
                      <span className="shrink-0 text-[10px] text-white/45">
                        ({(f.size / 1024).toFixed(0)} Ko)
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(cat.value, i)}
                      className="text-rose-300 transition-colors hover:text-rose-200"
                      aria-label="Supprimer le fichier"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RecapBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5 py-3 last:border-0 last:pb-0">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </span>
      <span className="flex-1 text-right text-white/85">
        {value || <em className="text-white/40">non renseigné</em>}
      </span>
    </div>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 backdrop-blur-md transition-colors",
          checked
            ? "border-nexus-orange-400/40 bg-nexus-orange-500/10"
            : error
              ? "border-rose-400/40 bg-rose-500/10"
              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/30 bg-transparent accent-nexus-orange-500"
        />
        <span className="text-xs leading-relaxed text-slate-200 sm:text-sm">
          {label}
        </span>
      </label>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function ResumeSidebar({
  currentStep,
  form,
  totalFiles,
}: {
  currentStep: StepId;
  form: DemandeCompletePayload;
  totalFiles: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-2xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
          Résumé du dossier
        </p>
        <p className="mt-1 text-[11px] text-white/55">
          Mis à jour en temps réel
        </p>
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Progression
        </p>
        <p className="mt-1.5 text-sm font-semibold text-white">
          Section {SECTIONS.find((s) => s.id === currentStep)?.number} / 06
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / 7) * 100}%` }}
          />
        </div>
      </div>

      {form.nom_complet && (
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            Demandeur
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {form.nom_complet}
          </p>
          {form.email && (
            <p className="mt-0.5 text-xs text-slate-400">{form.email}</p>
          )}
        </div>
      )}

      {form.service && (
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
            Service
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {form.service}
          </p>
          {form.categorie_demande && (
            <p className="mt-0.5 text-xs text-slate-400">
              {form.categorie_demande}
            </p>
          )}
        </div>
      )}

      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          Documents joints
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {totalFiles} fichier(s)
        </p>
      </div>

      <div className="bg-gradient-to-br from-nexus-orange-500/10 via-nexus-orange-500/5 to-transparent px-5 py-4">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-nexus-orange-300" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
            Espace sécurisé
          </p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          Toutes vos informations et documents sont chiffrés. Vous pourrez
          compléter votre dossier à tout moment depuis Nexus Connect.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-nexus-orange-300 transition-colors hover:text-nexus-orange-200"
        >
          <LogIn className="h-3 w-3" />
          Accéder à mon espace existant
        </Link>
      </div>
    </div>
  );
}
