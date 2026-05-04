import { Globe, Sparkles, Languages } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";

export const metadata = {
  title: "Multi-langue | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminI18nPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Multi-langue
          </h1>
          <p className="mt-1 text-slate-600">
            Configuration des langues et gestion des traductions.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border-2 border-dashed border-line bg-surface-elevated p-10 text-center shadow-elev-1">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand">
          <Languages className="h-7 w-7" />
        </div>
        <h2 className="font-display text-display-sm text-ink">
          Module en préparation
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-body-sm text-ink-muted">
          Phase 7 du roadmap : intégration <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-caption">next-intl</code>{" "}
          ou <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-caption">i18next</code>,
          switcher dans la Navbar publique et dashboards, préférence
          stockée sur <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-caption">profile.langue_preferee</code>.
          Couverture cible : FR + EN. Sango selon décision validée.
        </p>
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-2 text-caption font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Phase 7 — i18n FR/EN + scope (UI / e-mails / PDF)
        </div>
      </section>
    </DashboardShell>
  );
}
