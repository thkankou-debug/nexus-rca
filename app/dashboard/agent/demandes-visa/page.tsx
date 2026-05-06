import { Plane } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  VisaExpressManager,
  type VisaExpressRow,
} from "@/components/dashboard/VisaExpressManager";

export const metadata = {
  title: "Demandes visa express | Agent",
};

export const dynamic = "force-dynamic";

export default async function AgentDemandesVisaPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("visa_express_requests")
    .select(
      "id, reference, nom_complet, email, whatsapp, pays_destination, type_visa, urgence, notes, document_paths, status, ip, user_agent, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[demandes-visa agent] error:", error.message);
  }

  const rows = (data || []) as VisaExpressRow[];

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent"
        label="Retour au tableau de bord"
      />

      <header className="mb-10 flex flex-wrap items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
          <Plane className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Pipeline visa
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Demandes visa express
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultation des demandes — la modification du statut est réservée
            à l&apos;équipe admin.
          </p>
        </div>
      </header>

      <VisaExpressManager initialRows={rows} readOnly />
    </DashboardShell>
  );
}
