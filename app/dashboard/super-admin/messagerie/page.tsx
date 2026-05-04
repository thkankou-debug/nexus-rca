import { Send, Sparkles, MessageSquare } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";

export const metadata = {
  title: "Messagerie | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminMessageriePage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Messagerie — supervision
          </h1>
          <p className="mt-1 text-slate-600">
            Modération + accès complet à toutes les conversations.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border-2 border-dashed border-line bg-surface-elevated p-10 text-center shadow-elev-1">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
          <MessageSquare className="h-7 w-7" />
        </div>
        <h2 className="font-display text-display-sm text-ink">
          Module en préparation
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-body-sm text-ink-muted">
          Phase 6 du roadmap : threads par dossier (client ↔ agent assigné),
          threads d'équipe (agents ↔ admin), notifications e-mail (Resend) +
          WhatsApp Business (urgences). Le super-admin a un accès en lecture
          complet et la modération de tout thread.
        </p>
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-2 text-caption font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Phase 6 — threads + modération + RLS
        </div>
      </section>
    </DashboardShell>
  );
}
