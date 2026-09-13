import { requireProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import {
  InstructionsManager,
  type ReceivedInstruction,
  type SentInstruction,
  type StaffOption,
} from "@/components/instructions/InstructionsManager";
import { getFinanceAdminClient } from "@/lib/finance-server";

export const metadata = {
  title: "Instructions | Nexus RCA",
};

export const dynamic = "force-dynamic";

// Instructions (§10) — module unique pour tout le staff : chacun voit ce
// qu'il a reçu et ce qu'il a émis (même périmètre que la RLS de lecture).
// L'émission est réservée à instruction.create (dg, admin, chef_service —
// super_admin passe) ; l'agent, le comptable, la caissière… rendent compte.
export default async function InstructionsPage() {
  const profile = await requireProfile([
    "super_admin",
    "admin",
    "dg",
    "daf",
    "chef_service",
    "agent",
    "comptable",
    "moderateur",
    "accueil_caisse",
  ]);
  const admin = getFinanceAdminClient();

  const [receivedRes, sentRes, canCreate] = await Promise.all([
    admin
      .from("instruction_recipients")
      .select(
        "id, is_lead, acked_at, status, status_note, instructions(id, reference, subject, body, priority, due_date, requires_ack, status, created_at, author_role, profiles:author_id(nom, prenom))"
      )
      .eq("recipient_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(100),
    admin
      .from("instructions")
      .select(
        "id, reference, subject, body, priority, due_date, requires_ack, status, created_at, closed_at, close_note, instruction_recipients(id, recipient_id, is_lead, acked_at, status, status_note, profiles:recipient_id(nom, prenom))"
      )
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(100),
    hasPermission("instruction.create"),
  ]);

  let staff: StaffOption[] = [];
  if (canCreate) {
    const { data } = await admin
      .from("profiles")
      .select("id, nom, prenom, role")
      .in("role", ["admin", "dg", "daf", "chef_service", "agent", "comptable", "moderateur", "accueil_caisse"])
      .eq("actif", true)
      .eq("is_test", Boolean(profile.is_test))
      .neq("id", profile.id)
      .order("nom", { ascending: true });
    staff = (data || []) as StaffOption[];
  }

  const effectiveNav = await getEffectiveNav();

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Pilotage" }, { label: "Instructions" }]}
      title="Instructions"
      description="Décisions descendantes, accusés individuels et comptes-rendus — tracés de bout en bout."
    >
      <InstructionsManager
        received={(receivedRes.data || []) as unknown as ReceivedInstruction[]}
        sent={(sentRes.data || []) as unknown as SentInstruction[]}
        canCreate={canCreate}
        staff={staff}
      />
    </ModuleAdminShell>
  );
}
