import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UsersManager, type UsersFilter } from "@/components/dashboard/UsersManager";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: { filter?: string };
}

export default async function SuperAdminUsersPage({ searchParams }: PageProps) {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const users = (data || []) as Profile[];

  // Lecture du filtre depuis l URL (?filter=clients ou ?filter=staff)
  const rawFilter = searchParams?.filter;
  const initialFilter: UsersFilter =
    rawFilter === "clients" || rawFilter === "staff" ? rawFilter : "all";

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Gestion des utilisateurs
        </h1>
        <p className="mt-1 text-slate-600">
          Modifiez les rôles, désactivez ou supprimez des comptes. Les changements sont instantanés.
        </p>
      </div>
      <UsersManager
        initialUsers={users}
        canChangeRoles
        currentUserId={profile.id}
        canDeleteUsers
        initialFilter={initialFilter}
      />
    </DashboardShell>
  );
}
