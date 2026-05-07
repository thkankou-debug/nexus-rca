import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// Liste tous les onboardings avec employe + completion
export async function GET() {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employee_onboarding")
    .select(
      "*, employees(id, nom_complet, poste, departement, type_contrat, date_embauche), onboarding_templates(name)"
    )
    .order("started_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, onboardings: data });
}
