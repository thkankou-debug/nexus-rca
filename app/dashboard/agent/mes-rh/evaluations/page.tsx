import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { MyEvaluationsView } from "@/components/dashboard/rh/MyEvaluationsView";

export const metadata = {
  title: "Mes évaluations | Agent",
};

export const dynamic = "force-dynamic";

export default async function MyEvaluationsPage() {
  const profile = await requireProfile(["agent"]);

  return (
    <>
      <BackButton
        fallbackHref="/dashboard/agent/mes-rh"
        label="Retour à mon espace RH"
      />
      <MyEvaluationsView basePath="/dashboard/agent/mes-rh/evaluations" />
    </>
  );
}
