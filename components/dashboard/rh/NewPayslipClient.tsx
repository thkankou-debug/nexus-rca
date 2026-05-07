"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PayslipForm } from "./PayslipForm";

interface Props {
  basePath: string;
}

export function NewPayslipClient({ basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employee_id") ?? undefined;

  return (
    <PayslipForm
      defaultEmployeeId={employeeId}
      onSuccess={(p) => {
        router.push(`${basePath}/paie/${p.id}`);
        router.refresh();
      }}
      submitLabel="Créer le brouillon"
    />
  );
}
