"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Employee,
  EmployeeFrequencePaie,
  EmployeeStatut,
  EmployeeTypeContrat,
} from "@/types";

interface EmployeeFormProps {
  /** Si fourni → mode édition (PATCH), sinon création (POST) */
  employee?: Employee;
  onSuccess: (employee: Employee) => void;
  /** Affiche ou non le champ notes_internes (super_admin uniquement) */
  canSeeNotes?: boolean;
  /** Texte du bouton de soumission */
  submitLabel?: string;
}

const DEPARTEMENTS = [
  "Direction",
  "Operations",
  "Comptabilité",
  "Communication",
  "Sécurité",
  "Autre",
];

const TYPES_CONTRAT: EmployeeTypeContrat[] = ["CDI", "CDD", "Stage", "Freelance"];

const STATUTS: { value: EmployeeStatut; label: string }[] = [
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
  { value: "suspendu", label: "Suspendu" },
  { value: "parti", label: "Parti" },
];

const FREQUENCES: { value: EmployeeFrequencePaie; label: string }[] = [
  { value: "mensuel", label: "Mensuel" },
  { value: "bi-mensuel", label: "Bi-mensuel" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
];

interface AvailableProfile {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string;
  role: string;
}

export function EmployeeForm({
  employee,
  onSuccess,
  canSeeNotes = false,
  submitLabel,
}: EmployeeFormProps) {
  const isEdit = Boolean(employee);

  const [nomComplet, setNomComplet] = useState(employee?.nom_complet ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [telephone, setTelephone] = useState(employee?.telephone ?? "");
  const [adresse, setAdresse] = useState(employee?.adresse ?? "");
  const [dateNaissance, setDateNaissance] = useState(
    employee?.date_naissance ?? ""
  );
  const [numeroCni, setNumeroCni] = useState(employee?.numero_cni ?? "");
  const [poste, setPoste] = useState(employee?.poste ?? "");
  const [departement, setDepartement] = useState(
    employee?.departement ?? "Operations"
  );
  const [dateEmbauche, setDateEmbauche] = useState(
    employee?.date_embauche ?? ""
  );
  const [typeContrat, setTypeContrat] = useState<string>(
    employee?.type_contrat ?? "CDI"
  );
  const [statut, setStatut] = useState<EmployeeStatut>(
    employee?.statut ?? "actif"
  );
  const [salaireBase, setSalaireBase] = useState<string>(
    employee ? String(employee.salaire_base) : ""
  );
  const [frequencePaie, setFrequencePaie] = useState<EmployeeFrequencePaie>(
    employee?.frequence_paie ?? "mensuel"
  );
  const [profileId, setProfileId] = useState<string>(employee?.profile_id ?? "");
  const [notesInternes, setNotesInternes] = useState(
    employee?.notes_internes ?? ""
  );

  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const params = new URLSearchParams();
        if (employee?.profile_id) {
          params.set("include", employee.profile_id);
        }
        const res = await fetch(
          `/api/rh/available-agents${params.size ? `?${params.toString()}` : ""}`
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setAvailableProfiles(json.profiles ?? []);
        }
      } catch (e) {
        console.error("[RH_EMPLOYEE_FORM] fetch profiles", e);
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    };
    fetchProfiles();
    return () => {
      cancelled = true;
    };
  }, [employee?.profile_id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const salaire = Number(salaireBase);
    if (!Number.isFinite(salaire) || salaire < 0) {
      setError("Salaire de base invalide");
      return;
    }

    const payload: Partial<Employee> = {
      nom_complet: nomComplet.trim(),
      email: email.trim(),
      telephone: telephone.trim() || null,
      adresse: adresse.trim() || null,
      date_naissance: dateNaissance || null,
      numero_cni: numeroCni.trim() || null,
      poste: poste.trim(),
      departement,
      date_embauche: dateEmbauche,
      type_contrat: typeContrat,
      statut,
      salaire_base: salaire,
      frequence_paie: frequencePaie,
      profile_id: profileId || null,
    };

    if (canSeeNotes) {
      payload.notes_internes = notesInternes.trim() || null;
    }

    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/rh/employees/${employee!.id}`
        : "/api/rh/employees";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Erreur lors de l'enregistrement");
      }
      onSuccess(json.employee as Employee);
    } catch (err) {
      console.error("[RH_EMPLOYEE_FORM] submit", err);
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="font-display text-lg font-bold text-nexus-blue-950">
          {isEdit ? "Modifier l'employé" : "Nouvel employé"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Toutes les informations marquées d'une astérisque sont obligatoires.
        </p>
      </div>

      {/* Identité */}
      <Section title="Identité">
        <Field
          label="Nom complet *"
          input={
            <input
              type="text"
              required
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="Email *"
          input={
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="Téléphone"
          input={
            <input
              type="tel"
              value={telephone ?? ""}
              onChange={(e) => setTelephone(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="N° CNI / Pièce d'identité"
          input={
            <input
              type="text"
              value={numeroCni ?? ""}
              onChange={(e) => setNumeroCni(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="Date de naissance"
          input={
            <input
              type="date"
              value={dateNaissance ?? ""}
              onChange={(e) => setDateNaissance(e.target.value)}
              className={inputClass}
            />
          }
        />
        <div className="sm:col-span-2">
          <Field
            label="Adresse"
            input={
              <textarea
                rows={2}
                value={adresse ?? ""}
                onChange={(e) => setAdresse(e.target.value)}
                className={inputClass}
              />
            }
          />
        </div>
      </Section>

      {/* Poste */}
      <Section title="Poste & contrat">
        <Field
          label="Poste *"
          input={
            <input
              type="text"
              required
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="Département *"
          input={
            <select
              required
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              className={inputClass}
            >
              {DEPARTEMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          }
        />
        <Field
          label="Date d'embauche *"
          input={
            <input
              type="date"
              required
              value={dateEmbauche}
              onChange={(e) => setDateEmbauche(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="Type de contrat"
          input={
            <select
              value={typeContrat}
              onChange={(e) => setTypeContrat(e.target.value)}
              className={inputClass}
            >
              {TYPES_CONTRAT.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          }
        />
        <Field
          label="Statut"
          input={
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as EmployeeStatut)}
              className={inputClass}
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          }
        />
      </Section>

      {/* Rémunération */}
      <Section title="Rémunération">
        <Field
          label="Salaire de base (FCFA) *"
          input={
            <input
              type="number"
              required
              min={0}
              step={1}
              value={salaireBase}
              onChange={(e) => setSalaireBase(e.target.value)}
              className={inputClass}
            />
          }
        />
        <Field
          label="Fréquence de paie"
          input={
            <select
              value={frequencePaie}
              onChange={(e) =>
                setFrequencePaie(e.target.value as EmployeeFrequencePaie)
              }
              className={inputClass}
            >
              {FREQUENCES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          }
        />
      </Section>

      {/* Lien compte */}
      <Section title="Compte applicatif">
        <div className="sm:col-span-2">
          <Field
            label="Profil lié (optionnel — agent connecté à l'app)"
            input={
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className={inputClass}
                disabled={loadingProfiles}
              >
                <option value="">Aucun (employé sans accès app)</option>
                {availableProfiles.map((p) => {
                  const display =
                    [p.prenom, p.nom].filter(Boolean).join(" ") || p.email;
                  return (
                    <option key={p.id} value={p.id}>
                      {display} · {p.email} ({p.role})
                    </option>
                  );
                })}
              </select>
            }
            hint={
              loadingProfiles
                ? "Chargement des profils disponibles…"
                : "Seuls les profils non déjà liés à un employé sont affichés."
            }
          />
        </div>
      </Section>

      {canSeeNotes && (
        <Section title="Notes internes (super-admin uniquement)">
          <div className="sm:col-span-2">
            <Field
              label="Notes confidentielles"
              input={
                <textarea
                  rows={4}
                  value={notesInternes ?? ""}
                  onChange={(e) => setNotesInternes(e.target.value)}
                  className={inputClass}
                />
              }
              hint="Visible uniquement par le super-admin."
            />
          </div>
        </Section>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {submitting
            ? "Enregistrement…"
            : (submitLabel ?? (isEdit ? "Enregistrer" : "Créer l'employé"))}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm transition focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  input,
  hint,
}: {
  label: string;
  input: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      {input}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}
