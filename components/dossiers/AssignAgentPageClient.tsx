"use client";

// ============================================================================
// COMPOSANT — Page complète d'assignation (route dédiée /assigner)
// Réutilise AssignAgentModal mais en mode "page" (toujours ouvert, fermeture =
// retour vers le détail dossier).
// ============================================================================

import { useRouter } from "next/navigation";
import { AssignAgentModal } from "./AssignAgentModal";
import type { CategorieDossierSlug } from "@/types";

export function AssignAgentPageClient({
  demandeId,
  reference,
  categorieSlug,
  detailHref,
}: {
  demandeId: string;
  reference: string;
  categorieSlug: CategorieDossierSlug;
  detailHref: string;
}) {
  const router = useRouter();
  return (
    <AssignAgentModal
      open={true}
      onClose={() => router.push(detailHref)}
      demandeId={demandeId}
      reference={reference}
      categorieSlug={categorieSlug}
    />
  );
}
