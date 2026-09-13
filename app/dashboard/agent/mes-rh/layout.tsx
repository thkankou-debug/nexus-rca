import { requireProfile } from "@/lib/auth";

// L7 posait ici ModuleAdminShell ; depuis le rhabillage complet de l'espace
// agent (12/09/2026), le shell vit dans app/dashboard/agent/layout.tsx —
// ce layout ne garde que la restriction de rôle (Mes RH = agent uniquement,
// comme avant), sans double shell.
export default async function MesRhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile(["agent"]);
  return <>{children}</>;
}
