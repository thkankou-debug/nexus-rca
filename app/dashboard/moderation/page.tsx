import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { StatCard } from "@/components/admin/ui/StatCard";

export const metadata = {
  title: "Contenus | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// MODÉRATEUR — CONTENUS (§5.9). Réutilise les écrans P8 existants (contenus
// du site, FAQ, témoignages) : les API sont déjà gardées par
// cms.content.write / cms.faq.write, seedées pour moderateur+admin depuis
// P8 — il ne manquait que les pages accessibles au rôle. Aucun accès CRM,
// finance ou notes internes (§5.9). Une donnée modifiée perd sa
// vérification (triggers P8) : un champ non vérifié/publié n'apparaît pas
// sur le site.
// ============================================================================

export default async function ModerationHubPage() {
  const profile = await requireProfile(["moderateur", "admin", "super_admin"]);
  const supabase = createClient();

  const [contenus, faqs, temoignagesAVerifier, effectiveNav] = await Promise.all([
    supabase.from("contenus_site").select("id", { count: "exact", head: true }),
    supabase.from("faq").select("id", { count: "exact", head: true }),
    supabase
      .from("temoignages")
      .select("id", { count: "exact", head: true })
      .or("is_verified.eq.false,is_published.eq.false"),
    getEffectiveNav(),
  ]);

  const sections = [
    {
      href: "/dashboard/moderation/contenus",
      label: "Contenus du site",
      value: contenus.count ?? 0,
      hint: "Textes et blocs des pages publiques",
    },
    {
      href: "/dashboard/moderation/faq",
      label: "FAQ",
      value: faqs.count ?? 0,
      hint: "Questions fréquentes du site",
    },
    {
      href: "/dashboard/moderation/temoignages",
      label: "Témoignages à vérifier",
      value: temoignagesAVerifier.count ?? 0,
      hint: "Non vérifiés ou non publiés — invisibles du public",
    },
  ];

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Contenus" }, { label: "Modération" }]}
      title="Contenus"
      description="Rédiger, corriger, vérifier et publier — un champ non vérifié n'apparaît jamais sur le site."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <StatCard key={s.href} label={s.label} value={s.value} href={s.href} />
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center justify-between rounded-sm border border-line bg-surface-elevated px-4 py-3 transition-colors hover:border-line-strong"
            >
              <span>
                <span className="block text-body-sm font-semibold text-ink">{s.label}</span>
                <span className="block text-caption text-ink-muted">{s.hint}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-ink-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </ModuleAdminShell>
  );
}
