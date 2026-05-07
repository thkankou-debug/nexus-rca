"use client";

import { useRouter } from "next/navigation";
import { EmployeeForm } from "./EmployeeForm";

interface Props {
  basePath: string;
  canSeeNotes: boolean;
}

export function NewEmployeeClient({ basePath, canSeeNotes }: Props) {
  const router = useRouter();
  return (
    <EmployeeForm
      canSeeNotes={canSeeNotes}
      onSuccess={(e) => {
        router.push(`${basePath}/employes/${e.id}`);
        router.refresh();
      }}
      submitLabel="Créer l'employé"
    />
  );
}
