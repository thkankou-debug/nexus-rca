import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/BackButton";
import { AnnuaireView } from "@/components/dashboard/rh/AnnuaireView";
import type { Employee } from "@/types";

export const metadata = {
  title: "RH — Annuaire | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function AnnuairePage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("statut", "actif")
    .order("nom_complet", { ascending: true });

  if (error) {
    console.error("[RH_ANNUAIRE]", error);
  }

  const employees = (data ?? []) as Employee[];

  // Stats
  const departements = new Set(employees.map((e) => e.departement).filter(Boolean));
  const ancArr = employees
    .map((e) => {
      if (!e.date_embauche) return null;
      const d = new Date(e.date_embauche);
      if (Number.isNaN(d.getTime())) return null;
      return (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    })
    .filter((v): v is number => v !== null);
  const ancMoy =
    ancArr.length > 0 ? ancArr.reduce((s, v) => s + v, 0) / ancArr.length : null;
  const ancMoyLabel =
    ancMoy === null ? "—" : `${ancMoy.toFixed(1)} an${ancMoy >= 2 ? "s" : ""}`;

  return (
    <>
      <BackButton fallbackHref="/dashboard/super-admin/rh" label="Retour RH" />

      {/* Hero compact */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Équipe Nexus RCA
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Annuaire
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tous les membres actifs de l&apos;équipe, leurs postes et leurs
          contacts.
        </p>

        {/* Stats top */}
        <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          <span className="font-display tabular-nums text-nexus-blue-950">
            {employees.length}
          </span>
          <span className="text-slate-400">collaborateurs</span>
          <span className="text-slate-300">·</span>
          <span className="font-display tabular-nums text-nexus-blue-950">
            {departements.size}
          </span>
          <span className="text-slate-400">département{departements.size > 1 ? "s" : ""}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">Ancienneté moy.</span>
          <span className="font-display tabular-nums text-nexus-blue-950">
            {ancMoyLabel}
          </span>
        </div>
      </div>

      <AnnuaireView
        employees={employees}
        basePath="/dashboard/super-admin/rh"
      />
    </>
  );
}
