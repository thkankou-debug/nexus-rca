import { UserCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { UsersManager } from "@/components/dashboard/UsersManager";
import type { Profile } from "@/types";

export const metadata = {
  title: "Comptes clients | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function ComptesClientsPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // On charge UNIQUEMENT les comptes clients (role = client)
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement clients :", error);
  }
  const clients = (data || []) as Profile[];

  // Stats
  const counts = {
    total: clients.length,
    actifs: clients.filter(
      (u) => (u as Profile & { actif?: boolean }).actif !== false
    ).length,
    desactives: clients.filter(
      (u) => (u as Profile & { actif?: boolean }).actif === false
    ).length,
  };

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-lg">
          <UserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
            Comptes clients
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Comptes utilisateurs des clients ayant créé un compte sur le site.
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total comptes"
          value={counts.total}
          accent="from-blue-400 to-indigo-600"
        />
        <StatCard
          label="Actifs"
          value={counts.actifs}
          accent="from-emerald-400 to-emerald-600"
        />
        <StatCard
          label="Désactivés"
          value={counts.desactives}
          accent="from-slate-400 to-slate-600"
        />
      </div>

      {/* Bandeau d'info */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>⚠️ Comptes utilisateurs ≠ Fiches clients :</strong> cette page
        affiche les <strong>comptes</strong> que les clients ont créés sur le
        site (pour suivre leurs demandes). Pour gérer les{" "}
        <strong>fiches CRM</strong> (paiements, historique, contact), va dans{" "}
        <Link
          href="/dashboard/super-admin/clients"
          className="font-semibold underline hover:text-amber-700"
        >
          Clients (CRM)
        </Link>
        .
      </div>

      {/* Liste */}
      <UsersManager
        initialUsers={clients}
        canChangeRoles={profile.role === "super_admin"}
        canDeleteUsers={profile.role === "super_admin"}
        currentUserId={profile.id}
        initialFilter="clients"
      />
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-nexus-blue-950">
        {value}
      </p>
      <div
        className={`mt-3 h-1 w-12 rounded-full bg-gradient-to-r ${accent}`}
      />
    </div>
  );
}
