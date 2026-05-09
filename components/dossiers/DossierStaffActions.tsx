"use client";

// ============================================================================
// COMPOSANT — Wrapper client qui orchestre :
//   - le bandeau staff (sélecteur d'étape)
//   - le modal "Assigner un agent" (admin/super_admin)
//   - le modal "Demander un document"
// Utilisé par les 3 pages détail staff (agent / admin / super-admin).
// ============================================================================

import { useState } from "react";
import { DossierStaffBanner } from "./DossierStaffBanner";
import { AssignAgentModal } from "./AssignAgentModal";
import { RequestDocumentModal } from "./RequestDocumentModal";
import type { CategorieDossierSlug, UserRole } from "@/types";

export function DossierStaffActions({
  demandeId,
  reference,
  currentStep,
  currentStepLabel,
  categorieSlug,
  role,
}: {
  demandeId: string;
  reference: string;
  currentStep: number;
  currentStepLabel: string | null;
  categorieSlug: CategorieDossierSlug;
  role: UserRole;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [docReqOpen, setDocReqOpen] = useState(false);

  return (
    <>
      <DossierStaffBanner
        demandeId={demandeId}
        reference={reference}
        currentStep={currentStep}
        currentStepLabel={currentStepLabel}
        categorieSlug={categorieSlug}
        role={role}
        onAssignAgent={() => setAssignOpen(true)}
        onRequestDocument={() => setDocReqOpen(true)}
      />
      <AssignAgentModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        demandeId={demandeId}
        reference={reference}
        categorieSlug={categorieSlug}
      />
      <RequestDocumentModal
        open={docReqOpen}
        onClose={() => setDocReqOpen(false)}
        demandeId={demandeId}
      />
    </>
  );
}
