import { ShieldAlert, Sparkles, Lock, Activity } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";

export const metadata = {
  title: "Audit log | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminAuditLogPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Audit log
          </h1>
          <p className="mt-1 text-slate-600">
            Traçabilité des actions sensibles sur le système.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border-2 border-dashed border-line bg-surface-elevated p-10 text-center shadow-elev-1">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
          <Activity className="h-7 w-7" />
        </div>
        <h2 className="font-display text-display-sm text-ink">
          Module en préparation
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-body-sm text-ink-muted">
          Création de la table <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-caption">audit_log</code>{" "}
          + writers sur les actions sensibles : <em>role_change</em>,{" "}
          <em>dossier_assign</em>, <em>paiement_void</em>,{" "}
          <em>dossier_force_close</em>, <em>user_disable</em>,{" "}
          <em>login_admin</em>. Lecture super-admin (full), admin
          (équipe), aucun pour agent/client. RLS strict.
        </p>
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-2 text-caption font-semibold text-brand">
          <Lock className="h-3.5 w-3.5" />
          Sécurité — table audit_log + RLS strict + writers ciblés
        </div>
      </section>
    </DashboardShell>
  );
}
