"use client";

// ============================================================================
// HABILITATIONS — gestion des comptes staff par le super-admin (demande
// Thierry 13/09/2026 : « créer le compte de chaque membre de l'équipe et
// leur donner l'accréditation »).
// - Création d'un compte (10 rôles staff) : invitation e-mail OU mot de
//   passe provisoire — POST /api/team/create-member (existant, étendu).
// - Changement de rôle et activation/désactivation — PATCH /api/team/[id]
//   (protections serveur : jamais soi-même, jamais le dernier super-admin).
// Les comptes « client » ne sont pas listés ici.
// ============================================================================

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { ROLE_LABELS_FR } from "@/lib/rbac";
import type { UserRole } from "@/types";

const STAFF_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "dg",
  "daf",
  "chef_service",
  "agent",
  "comptable",
  "moderateur",
  "partenaire",
  "accueil_caisse",
];

export interface StaffAccount {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  telephone: string | null;
  role: UserRole;
  actif: boolean;
  is_test: boolean | null;
  created_at: string;
}

const inputRow = "grid gap-3 sm:grid-cols-2";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand transition-colors duration-150 hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50";
const btnNeutral =
  "inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface px-3 py-1.5 text-caption font-semibold text-ink transition-colors duration-150 hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50";

export function HabilitationsManager({
  accounts,
  selfId,
}: {
  accounts: StaffAccount[];
  selfId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirm, setConfirm] = useState<{
    account: StaffAccount;
    action: "desactiver" | "reactiver" | "role";
    newRole?: UserRole;
  } | null>(null);

  // Formulaire de création
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    role: "agent" as UserRole,
    mode: "invitation" as "invitation" | "password",
    password: "",
  });
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      [a.prenom, a.nom, a.email, ROLE_LABELS_FR[a.role]]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [accounts, query]);

  const fullName = (a: StaffAccount) =>
    [a.prenom, a.nom].filter(Boolean).join(" ") || a.email;

  async function patchAccount(
    account: StaffAccount,
    payload: { role?: UserRole; actif?: boolean }
  ) {
    setBusyId(account.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/team/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setPendingRoles((p) => {
        const next = { ...p };
        delete next[account.id];
        return next;
      });
      setMessage({
        kind: "ok",
        text:
          payload.actif === false
            ? `${fullName(account)} désactivé — connexion refusée dès maintenant.`
            : payload.actif === true
            ? `${fullName(account)} réactivé.`
            : `Rôle de ${fullName(account)} : ${ROLE_LABELS_FR[payload.role!]}.`,
      });
      router.refresh();
    } catch (e) {
      setMessage({ kind: "err", text: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/team/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          telephone: form.telephone || undefined,
          role: form.role,
          send_invitation: form.mode === "invitation",
          temporary_password: form.mode === "password" ? form.password : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setMessage({ kind: "ok", text: data.message || "Compte créé." });
      setForm({ prenom: "", nom: "", email: "", telephone: "", role: "agent", mode: "invitation", password: "" });
      setFormOpen(false);
      router.refresh();
    } catch (e) {
      setMessage({ kind: "err", text: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher nom, e-mail, rôle…"
            className="w-64 rounded-sm border border-line bg-surface py-1.5 pl-8 pr-3 text-body-sm text-ink placeholder:text-ink-subtle focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
          />
        </div>
        <button type="button" className={btnPrimary} onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Nouvel employé
        </button>
      </div>

      {message && (
        <p
          className={
            message.kind === "ok"
              ? "rounded-sm border border-status-success/30 bg-status-success/10 px-3 py-2 text-body-sm text-ink"
              : "rounded-sm border border-status-failure/30 bg-status-failure/10 px-3 py-2 text-body-sm text-ink"
          }
        >
          {message.text}
        </p>
      )}

      {/* Formulaire de création */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-sm border border-line bg-surface-elevated p-4"
        >
          <h2 className="font-display text-title text-ink">Créer un compte employé</h2>
          <div className={inputRow}>
            <Input
              required
              placeholder="Prénom"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
            <Input
              required
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <Input
              required
              type="email"
              placeholder="adresse@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Téléphone (facultatif)"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              aria-label="Rôle du nouvel employé"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS_FR[r]}
                </option>
              ))}
            </Select>
            <Select
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value as "invitation" | "password" })
              }
              aria-label="Mode d'activation du compte"
            >
              <option value="invitation">Invitation par e-mail</option>
              <option value="password">Mot de passe provisoire</option>
            </Select>
            {form.mode === "password" && (
              <Input
                required
                type="text"
                minLength={8}
                placeholder="Mot de passe provisoire (8 caractères min.)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            )}
          </div>
          <p className="text-caption text-ink-muted">
            Invitation : l&rsquo;employé reçoit un e-mail pour activer son compte et
            choisir son mot de passe. Mot de passe provisoire : le compte est actif
            immédiatement, les identifiants sont envoyés par e-mail.
          </p>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimary} disabled={creating}>
              {creating ? "Création…" : "Créer le compte"}
            </button>
            <button type="button" className={btnNeutral} onClick={() => setFormOpen(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Tableau des comptes */}
      <div className="overflow-x-auto rounded-sm border border-line bg-surface-elevated">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-surface-sunken">
              {["Employé", "E-mail", "Rôle (accréditation)", "Statut", "Créé le", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-body-sm text-ink-muted">
                  Aucun compte ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {filtered.map((a) => {
              const isSelf = a.id === selfId;
              const pending = pendingRoles[a.id];
              const roleChanged = pending !== undefined && pending !== a.role;
              return (
                <tr key={a.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2.5">
                    <p className="text-body-sm font-semibold text-ink">
                      {fullName(a)}
                      {isSelf && (
                        <span className="ml-2 text-caption font-normal text-ink-muted">(vous)</span>
                      )}
                      {a.is_test && (
                        <span className="ml-2 rounded-sm bg-status-inert/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                          Test
                        </span>
                      )}
                    </p>
                    {a.telephone && <p className="text-caption text-ink-muted">{a.telephone}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-body-sm text-ink-muted">{a.email}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={pending ?? a.role}
                      disabled={isSelf || busyId === a.id}
                      onChange={(e) =>
                        setPendingRoles((p) => ({ ...p, [a.id]: e.target.value as UserRole }))
                      }
                      className="rounded-sm border border-line bg-surface px-2 py-1 text-body-sm text-ink focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Rôle de ${fullName(a)}`}
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS_FR[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        a.actif
                          ? "inline-flex items-center gap-1.5 text-body-sm text-ink"
                          : "inline-flex items-center gap-1.5 text-body-sm text-ink-muted"
                      }
                    >
                      <span
                        className={
                          a.actif
                            ? "h-1.5 w-1.5 rounded-full bg-status-success"
                            : "h-1.5 w-1.5 rounded-full bg-status-failure"
                        }
                      />
                      {a.actif ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                    {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {roleChanged && (
                        <button
                          type="button"
                          className={btnNeutral}
                          disabled={busyId === a.id}
                          onClick={() =>
                            setConfirm({ account: a, action: "role", newRole: pending })
                          }
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Appliquer le rôle
                        </button>
                      )}
                      {!isSelf &&
                        (a.actif ? (
                          <button
                            type="button"
                            className={btnNeutral}
                            disabled={busyId === a.id}
                            onClick={() => setConfirm({ account: a, action: "desactiver" })}
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Désactiver
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={btnNeutral}
                            disabled={busyId === a.id}
                            onClick={() => setConfirm({ account: a, action: "reactiver" })}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Réactiver
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-caption text-ink-muted">
        Votre propre compte n&rsquo;est pas modifiable ici, et le dernier super
        administrateur actif ne peut être ni rétrogradé ni désactivé. Chaque
        changement est tracé dans le journal d&rsquo;audit.
      </p>

      {confirm && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const c = confirm;
            setConfirm(null);
            if (c.action === "role" && c.newRole) {
              void patchAccount(c.account, { role: c.newRole });
            } else {
              void patchAccount(c.account, { actif: c.action === "reactiver" });
            }
          }}
          title={
            confirm.action === "role"
              ? "Changer l'accréditation"
              : confirm.action === "desactiver"
              ? "Désactiver ce compte"
              : "Réactiver ce compte"
          }
          description={
            confirm.action === "role"
              ? `${fullName(confirm.account)} passera de « ${ROLE_LABELS_FR[confirm.account.role]} » à « ${ROLE_LABELS_FR[confirm.newRole!]} ». Ses accès changent immédiatement.`
              : confirm.action === "desactiver"
              ? `${fullName(confirm.account)} ne pourra plus se connecter, immédiatement. Ses données et son historique sont conservés.`
              : `${fullName(confirm.account)} pourra à nouveau se connecter avec ses identifiants.`
          }
          confirmLabel={
            confirm.action === "role"
              ? "Changer le rôle"
              : confirm.action === "desactiver"
              ? "Désactiver"
              : "Réactiver"
          }
          destructive={confirm.action === "desactiver"}
        />
      )}
    </div>
  );
}
