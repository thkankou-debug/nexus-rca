import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import NewAppointmentForm from "@/components/dashboard/NewAppointmentForm";

export const metadata = {
  title: "Réserver un RDV - NEXUS CONNECT",
};

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage() {
  const profile = await requireProfile([
    "client",
    "agent",
    "admin",
    "super_admin",
  ]);

  const fullName =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") ||
    profile.email ||
    "";

  return (
    <DashboardShell profile={profile}>
      <NewAppointmentForm
        initialName={fullName}
        initialEmail={profile.email || ""}
        initialPhone={profile.telephone || ""}
      />
    </DashboardShell>
  );
}
