"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  UserPlus,
  Shield,
  Mail,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

type Role = "agent" | "admin" | "super_admin";

const ROLE_OPTIONS: {
  value: Role;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: "agent",
    label: "Agent",
    description:
      "Encaisse les paiements, traite les demandes, gère ses clients. Voit uniquement ses propres données.",
    color: "border-emerald-300 bg-emerald-50",
  },
  {
    value: "admin",
    label: "Admin",
    description:
      "Voit toutes les données opérationnelles, valide les transferts et dépenses, mais ne peut pas créer d'employés.",
    color: "border-amber-300 bg-amber-50",
  },
  {
    value: "super_admin",
    label: "Super admin",
    description:
      "Accès total. Peut créer des employés, changer les rôles, supprimer des comptes. ⚠️ À donner avec précaution.",
    color: "border-rose-300 bg-rose-50",
  },
];

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const symbols = "!@#$%&*";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
  return pwd;
}

export default function NewTeamMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    role: "agent" as Role,
    poste: "",
    notes_internes: "",
    send_invitation: true, // par defaut, on envoie une invitation
    temporary_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    message: string;
    password?: string;
  } | null>(null);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const handleGeneratePassword = () => {
    const newPwd = generatePassword();
    setForm((prev) => ({ ...prev, temporary_password: newPwd }));
    setShowPassword(true);
    toast.success("Mot de passe généré");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim()) {
      toast.error("Prénom, nom et email sont obligatoires");
      return;
    }

    if (!form.send_invitation && form.temporary_password.length < 8) {
      toast.error("Mot de passe temporaire requis (minimum 8 caractères)");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/team/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim() || undefined,
          role: form.role,
          poste: form.poste.trim() || undefined,
          notes_internes: form.notes_internes.trim() || undefined,
          send_invitation: form.send_invitation,
          temporary_password: form.send_invitation
            ? undefined
            : form.temporary_password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur");
      }

      // Succes : afficher confirmation
      setSuccess({
        message: result.message,
        password: form.send_invitation ? undefined : form.temporary_password,
      });
      toast.success("Employé créé avec succès");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ECRAN DE SUCCES
  if (success) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-nexus-blue-950">
            Employé créé avec succès
          </h1>
          <p className="mt-2 text-sm text-slate-600">{success.message}</p>

          {success.password && (
            <div className="mt-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-900">
                    Mot de passe temporaire à transmettre
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Donne ce mot de passe à l'employé en personne. Il devra le
                    changer à sa première connexion.
                  </p>
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-white p-2 font-mono text-sm">
                    <code className="flex-1">{success.password}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(success.password!);
                        toast.success("Copié dans le presse-papier");
                      }}
                      className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/super-admin/equipe"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retour à l'équipe
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                setForm({
                  prenom: "",
                  nom: "",
                  email: "",
                  telephone: "",
                  role: "agent",
                  poste: "",
                  notes_internes: "",
                  send_invitation: true,
                  temporary_password: "",
                });
              }}
              className="rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-orange-600"
            >
              Créer un autre employé
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/super-admin/equipe"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'équipe Nexus
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <UserPlus className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
            Créer un employé Nexus
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ajoute un nouveau membre à ton équipe interne.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {/* IDENTITE */}
        <Section title="Identité">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom *">
              <input
                type="text"
                required
                value={form.prenom}
                onChange={(e) => handleChange("prenom", e.target.value)}
                className={inputClass}
                placeholder="Ex : Marie"
              />
            </Field>
            <Field label="Nom *">
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                className={inputClass}
                placeholder="Ex : Doe"
              />
            </Field>
            <Field label="Email professionnel *">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClass}
                placeholder="prenom.nom@nexusrca.com"
              />
            </Field>
            <Field label="Téléphone">
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => handleChange("telephone", e.target.value)}
                className={inputClass}
                placeholder="+236 ..."
              />
            </Field>
          </div>
        </Section>

        {/* ROLE */}
        <Section title="Rôle et permissions">
          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
                  form.role === opt.value
                    ? opt.color + " shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={form.role === opt.value}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-nexus-blue-950">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {opt.description}
                  </p>
                </div>
                {opt.value === "super_admin" && form.role === "super_admin" && (
                  <Shield className="h-5 w-5 shrink-0 text-rose-600" />
                )}
              </label>
            ))}
          </div>
        </Section>

        {/* INFOS INTERNES */}
        <Section title="Informations internes (optionnel)">
          <div className="grid gap-4">
            <Field label="Poste / fonction">
              <input
                type="text"
                value={form.poste}
                onChange={(e) => handleChange("poste", e.target.value)}
                className={inputClass}
                placeholder="Ex : Agent commercial visa, Responsable comptabilité"
              />
            </Field>
            <Field label="Notes internes (visibles uniquement par les super-admins)">
              <textarea
                rows={2}
                value={form.notes_internes}
                onChange={(e) =>
                  handleChange("notes_internes", e.target.value)
                }
                className={inputClass}
                placeholder="Date d'embauche, conditions particulières, etc."
              />
            </Field>
          </div>
        </Section>

        {/* ACCES */}
        <Section title="Accès au compte">
          <div className="space-y-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
                form.send_invitation
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                checked={form.send_invitation}
                onChange={() => handleChange("send_invitation", true)}
                className="mt-1"
              />
              <Mail className="h-5 w-5 shrink-0 text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-nexus-blue-950">
                  Envoyer une invitation par email
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  L'employé reçoit un email avec un lien pour activer son
                  compte et choisir son mot de passe. Recommandé.
                </p>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
                !form.send_invitation
                  ? "border-amber-300 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                checked={!form.send_invitation}
                onChange={() => handleChange("send_invitation", false)}
                className="mt-1"
              />
              <Key className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="font-semibold text-nexus-blue-950">
                  Mot de passe temporaire
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Tu génères un mot de passe à donner en personne à l'employé.
                  Utile si l'email professionnel n'est pas encore prêt.
                </p>
              </div>
            </label>

            {/* Champ mot de passe (si selectionne) */}
            {!form.send_invitation && (
              <div className="ml-8 mt-3">
                <Field label="Mot de passe temporaire *">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.temporary_password}
                        onChange={(e) =>
                          handleChange("temporary_password", e.target.value)
                        }
                        className={inputClass + " pr-10"}
                        placeholder="Minimum 8 caractères"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Générer
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    L'employé devra changer ce mot de passe à sa première
                    connexion.
                  </p>
                </Field>
              </div>
            )}
          </div>
        </Section>

        {/* WARNING SECURITE pour super_admin */}
        {form.role === "super_admin" && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-4">
            <Shield className="h-5 w-5 shrink-0 text-rose-700" />
            <div>
              <p className="text-sm font-bold text-rose-900">
                Attention : tu vas créer un Super-admin
              </p>
              <p className="mt-1 text-xs text-rose-800">
                Cette personne aura les mêmes pouvoirs que toi : créer/supprimer
                des comptes, valider tous les transferts, voir toutes les
                données financières. Ne donne ce rôle qu'aux personnes de
                confiance absolue.
              </p>
            </div>
          </div>
        )}

        {/* BOUTONS */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/super-admin/equipe"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Créer l'employé
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
