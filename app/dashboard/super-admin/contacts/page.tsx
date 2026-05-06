import { Inbox } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  ContactsManager,
  type ContactRow,
} from "@/components/dashboard/ContactsManager";

export const metadata = {
  title: "Messages contact | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminContactsPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, reference, nom, email, telephone, sujet, message, status, source, notes_internes, processed_at, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[contacts super-admin] error:", error.message);
  }

  const rows = (data || []) as ContactRow[];

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <header className="mb-10 flex flex-wrap items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
          <Inbox className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Boîte de réception
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Messages contact
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Messages reçus via le formulaire public — supervision et suivi.
          </p>
        </div>
      </header>

      <ContactsManager initialRows={rows} />
    </DashboardShell>
  );
}
