import { Bell } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { NotificationsManager } from "@/components/dashboard/NotificationsManager";

export const metadata = {
  title: "Notifications | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const profile = await requireProfile(["admin", "super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Notifications
          </h1>
          <p className="mt-1 text-slate-600">
            Historique complet de vos notifications.
          </p>
        </div>
      </div>

      <NotificationsManager />
    </DashboardShell>
  );
}
