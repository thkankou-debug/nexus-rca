import Link from "next/link";
import { ArrowLeft, MessageCircle, Wrench } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Messagerie | Admin",
};

export const dynamic = "force-dynamic";

// ─── PLACEHOLDER ──────────────────────────────────────────────────────────────
// Le module de messagerie a été désactivé volontairement. Implémentation
// backend prévue en Feature 6 (table messages + API + Realtime Supabase).
// ──────────────────────────────────────────────────────────────────────────────

export default async function AdminMessageriePage() {
  const profile = await requireProfile(["admin", "super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-nexus-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-nexus-orange-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-2xl">
            <MessageCircle className="h-10 w-10" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-nexus-orange-300">
              <Wrench className="h-3 w-3" />
              En développement
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Messagerie — bientôt disponible
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Le module de messagerie interne est en cours de développement. Disponible prochainement.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="mx-auto max-w-md text-sm text-slate-600">
          Vous serez notifié dès que la messagerie sera prête. En attendant, contactez votre équipe
          via WhatsApp ou e-mail.
        </p>
        <Link
          href="/dashboard/admin"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </div>
    </DashboardShell>
  );
}
