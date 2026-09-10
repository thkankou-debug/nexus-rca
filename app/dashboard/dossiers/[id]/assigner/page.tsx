import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { DossiersAdminShell } from "@/components/dossiers/DossiersAdminShell";
import { AssignAgentPageClient } from "@/components/dossiers/AssignAgentPageClient";
import { isCategorieDossier } from "@/lib/demande-categories";

export const dynamic = "force-dynamic";

// L3 Étape 2b : réservé admin/super_admin, comme le "Assigner" de
// DossiersListClient (canAssign) et la route API /assign elle-même — pas de
// changement de permission ici, juste l'unification de la page.
export default async function DossierUniqueAssignerPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["admin", "super_admin"]);

  const supabase = createClient();
  const { data: demandeRow } = await supabase
    .from("demandes")
    .select("id, reference, service, categorie_dossier")
    .eq("id", params.id)
    .single();

  if (!demandeRow) notFound();
  const demande = demandeRow as {
    id: string;
    reference: string | null;
    service: string;
    categorie_dossier: string | null;
  };
  const rawCategorie = demande.categorie_dossier || "";
  const categorieSlug = isCategorieDossier(rawCategorie) ? rawCategorie : "autres";

  const detailHref = `/dashboard/dossiers/${params.id}`;
  const effectiveNav = await getEffectiveNav();

  return (
    <DossiersAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Dossiers", href: "/dashboard/dossiers" },
        { label: demande.reference || demande.id.slice(0, 8).toUpperCase(), href: detailHref },
        { label: "Assigner" },
      ]}
      showHeader={false}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Assignation
        </p>
        <p>
          Sélection du conseiller pour le dossier{" "}
          <strong className="font-mono text-nexus-blue-950">
            {demande.reference || demande.id.slice(0, 8).toUpperCase()}
          </strong>
          {" — "}
          <span className="text-nexus-blue-950">{demande.service}</span>.
        </p>
      </div>

      <AssignAgentPageClient
        demandeId={demande.id}
        reference={demande.reference || demande.id.slice(0, 8).toUpperCase()}
        categorieSlug={categorieSlug}
        detailHref={detailHref}
      />
    </DossiersAdminShell>
  );
}
