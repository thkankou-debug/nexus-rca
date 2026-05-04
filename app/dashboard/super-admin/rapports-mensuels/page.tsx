import { CalendarClock, FileBarChart, Sparkles, Mail } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";

export const metadata = {
  title: "Rapports mensuels (CRON) | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminRapportsMensuelsPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Rapports mensuels — automatiques
          </h1>
          <p className="mt-1 text-slate-600">
            Génération PDF + envoi e-mail le 1er de chaque mois.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border-2 border-dashed border-line bg-surface-elevated p-10 text-center shadow-elev-1">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
          <FileBarChart className="h-7 w-7" />
        </div>
        <h2 className="font-display text-display-sm text-ink">
          Module en préparation
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-body-sm text-ink-muted">
          Phase 8 du roadmap : <strong>CRON Vercel</strong> déclenche le 1er
          du mois la génération d'un PDF synthèse (revenus, nombre de
          dossiers, performance agents, activité globale), envoi via{" "}
          <strong>Resend</strong> aux super-admins et admins, archive
          consultable depuis cette page. Distinct de{" "}
          <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-caption">/rapports</code>{" "}
          (analytique financière temps réel).
        </p>
        <div className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-brand-subtle px-4 py-2 text-caption font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Phase 8 — CRON + Puppeteer/react-pdf + Resend
        </div>

        <div className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-3 text-overline">
          <div className="rounded-xl bg-surface-sunken p-3 text-ink-muted">
            CRON 1er du mois 06:00
          </div>
          <div className="rounded-xl bg-surface-sunken p-3 text-ink-muted">
            PDF + Storage
          </div>
          <div className="rounded-xl bg-surface-sunken p-3 text-ink-muted">
            <Mail className="mx-auto mb-1 h-3.5 w-3.5" />
            Email destinataires
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
