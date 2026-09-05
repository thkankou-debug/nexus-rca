import { requireProfile } from "@/lib/auth";
import { DesignSystemShowcase } from "./DesignSystemShowcase";

// Vitrine interne du design system admin (Phase A2). Réservée super_admin.
// À retirer en P12 une fois la migration des pages admin terminée.
export default async function DesignSystemPage() {
  const profile = await requireProfile(["super_admin"]);
  return <DesignSystemShowcase profile={profile} />;
}
