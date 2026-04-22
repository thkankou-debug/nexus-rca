import { ShieldCheck, User, UserCog, Crown } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const ROLES = [
  {
    name: "Client",
    icon: User,
    color: "from-blue-400 to-blue-600",
    perms: [
      "Créer des demandes de service",
      "Voir uniquement ses propres demandes",
      "Prendre rendez-vous",
      "Modifier son profil",
    ],
  },
  {
    name: "Agent",
    icon: UserCog,
    color: "from-emerald-400 to-emerald-600",
    perms: [
      "Voir toutes les demandes",
      "Mettre à jour le statut des demandes",
      "Ajouter des notes internes",
      "Consulter les profils clients",
    ],
  },
  {
    name: "Admin",
    icon: ShieldCheck,
    color: "from-amber-400 to-amber-600",
    perms: [
      "Tous les droits d'un agent",
      "Voir les statistiques globales",
      "Supprimer des demandes",
      "Consulter tous les utilisateurs",
    ],
  },
  {
    name: "Super admin",
    icon: Crown,
    color: "from-rose-400 to-rose-600",
    perms: [
      "Tous les droits d'un admin",
      "Modifier les rôles des utilisateurs",
      "Supprimer des comptes utilisateurs",
      "Accès complet à la base de données",
    ],
  },
];

export default async function RolesPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Gestion des rôles
        </h1>
        <p className="mt-1 text-slate-600">
          Vue d'ensemble des rôles disponibles et de leurs permissions.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {ROLES.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${r.color} text-white shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-nexus-blue-950">
                  {r.name}
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                {r.perms.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-nexus-orange-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm text-amber-900">
          <strong>Pour changer le rôle d'un utilisateur :</strong> allez dans{" "}
          <em>Utilisateurs</em> et sélectionnez le nouveau rôle dans le menu déroulant. Les règles RLS Supabase appliquent automatiquement les nouvelles permissions.
        </p>
      </div>
    </DashboardShell>
  );
}
