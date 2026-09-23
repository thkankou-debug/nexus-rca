import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireProfile } from "@/lib/auth";

// Le cadre vit dans le layout pour rester monté pendant le chargement
// d'une rubrique. Chaque page garde son propre requireProfile, plus étroit.
const ROLES = [
  "super_admin",
  "admin",
  "agent",
  "accueil_caisse",
  "dg",
  "daf",
] as const;

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile([...ROLES]);
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
