"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { cn, formatShortDate } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

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
}: {
  initialUsers: Profile[];
  canChangeRoles: boolean;
  currentUserId: string;
}) {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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
      toast.error("Changement refusé (vérifiez vos permissions)");
      return;
    }
    setUsers((list) =>
      list.map((u) => (u.id === id ? { ...u, role } : u))
    );
    toast.success("Rôle mis à jour");
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
                <Th>Téléphone</Th>
                <Th>Rôle</Th>
                <Th>Inscrit le</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
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
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {formatShortDate(u.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            Aucun utilisateur trouvé.
          </p>
        )}
      </div>
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
