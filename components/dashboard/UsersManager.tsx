"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2, UserX, UserCheck, MoreVertical, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatShortDate } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

// Type local pour gerer la colonne 'actif' qui peut ne pas etre dans le type Profile global
type ProfileWithActif = Profile & { actif?: boolean };

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: "client", label: "Client", color: "bg-blue-100 text-blue-700" },
  { value: "agent", label: "Agent", color: "bg-emerald-100 text-emerald-700" },
  { value: "admin", label: "Admin", color: "bg-amber-100 text-amber-700" },
  { value: "super_admin", label: "Super admin", color: "bg-rose-100 text-rose-700" },
];

export function UsersManager({
  initialUsers,
  canChangeRoles,
  currentUserId,
  canDeleteUsers = false,
}: {
  initialUsers: Profile[];
  canChangeRoles: boolean;
  currentUserId: string;
  canDeleteUsers?: boolean;
}) {
  const supabase = createClient();
  const [users, setUsers] = useState<ProfileWithActif[]>(
    initialUsers as ProfileWithActif[]
  );
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProfileWithActif | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q) ||
      (u.prenom || "").toLowerCase().includes(q)
    );
  });

  const updateRole = async (id: string, role: UserRole) => {
    setSavingId(id);
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);
    setSavingId(null);

    if (error) {
      toast.error("Changement refuse (verifiez vos permissions)");
      return;
    }
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role mis a jour");
  };

  const toggleActif = async (user: ProfileWithActif) => {
    const newActif = !(user.actif ?? true);
    setSavingId(user.id);
    const { error } = await supabase
      .from("profiles")
      .update({ actif: newActif })
      .eq("id", user.id);
    setSavingId(null);
    setOpenMenuId(null);

    if (error) {
      toast.error(
        newActif
          ? "Impossible de reactiver (verifiez vos permissions)"
          : "Impossible de desactiver (verifiez vos permissions)"
      );
      return;
    }
    setUsers((list) =>
      list.map((u) => (u.id === user.id ? { ...u, actif: newActif } : u))
    );
    toast.success(newActif ? "Utilisateur reactive" : "Utilisateur desactive");
  };

  const deleteUser = async (user: ProfileWithActif) => {
    setSavingId(user.id);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);
    setSavingId(null);
    setConfirmDelete(null);
    setOpenMenuId(null);

    if (error) {
      toast.error(`Suppression refusee : ${error.message}`);
      return;
    }
    setUsers((list) => list.filter((u) => u.id !== user.id));
    toast.success("Utilisateur supprime");
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>Utilisateur</Th>
                <Th>Email</Th>
                <Th>Telephone</Th>
                <Th>Role</Th>
                <Th>Statut</Th>
                <Th>Inscrit le</Th>
                {canDeleteUsers && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                const isActive = u.actif ?? true;
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "hover:bg-slate-50",
                      !isActive && "bg-slate-50 opacity-60"
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-xs font-bold text-white">
                          {(u.prenom?.[0] || "") + (u.nom?.[0] || "")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-nexus-blue-950">
                            {u.prenom} {u.nom}
                          </p>
                          {isSelf && (
                            <p className="text-xs text-slate-400">(vous)</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {u.telephone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {canChangeRoles && !isSelf ? (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateRole(u.id, e.target.value as UserRole)
                          }
                          disabled={savingId === u.id}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            ROLE_OPTIONS.find((r) => r.value === u.role)?.color
                          )}
                        >
                          {ROLE_OPTIONS.find((r) => r.value === u.role)?.label}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Desactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {formatShortDate(u.created_at)}
                    </td>
                    {canDeleteUsers && (
                      <td className="relative whitespace-nowrap px-4 py-3 text-sm">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(openMenuId === u.id ? null : u.id)
                              }
                              disabled={savingId === u.id}
                              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                              aria-label="Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openMenuId === u.id && (
                              <>
                                {/* Backdrop pour fermer au clic exterieur */}
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                {/* Menu */}
                                <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => toggleActif(u)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    {isActive ? (
                                      <>
                                        <UserX className="h-4 w-4 text-amber-600" />
                                        Desactiver
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 text-green-600" />
                                        Reactiver
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmDelete(u);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            Aucun utilisateur trouve.
          </p>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Supprimer cet utilisateur ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Vous allez supprimer{" "}
                  <strong className="text-nexus-blue-950">
                    {confirmDelete.prenom} {confirmDelete.nom}
                  </strong>{" "}
                  ({confirmDelete.email}).
                </p>
                <p className="mt-2 text-xs text-red-600">
                  Cette action est irreversible. Toutes les donnees liees a ce
                  compte seront supprimees (demandes, rendez-vous, etc.).
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Astuce : si vous voulez juste empecher l acces, utilisez plutot
                  &quot;Desactiver&quot;.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteUser(confirmDelete)}
                disabled={savingId === confirmDelete.id}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingId === confirmDelete.id
                  ? "Suppression..."
                  : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}
