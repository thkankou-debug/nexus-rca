import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { Payslip } from "@/types";

// Admin soumet une fiche brouillon pour validation par super-admin.
// brouillon → en_attente_validation
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data: existing, error: fetchErr } = await supabase
    .from("payslips")
    .select("statut")
    .eq("id", params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ success: false, error: "Fiche introuvable" }, { status: 404 });
  }

  if ((existing as Payslip).statut !== "brouillon") {
    return NextResponse.json(
      { success: false, error: "Seules les fiches en brouillon peuvent être soumises" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("payslips")
    .update({
      statut: "en_attente_validation",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("[RH_PAYSLIPS_SUBMIT]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await supabase.from("payslip_validation_history").insert({
    payslip_id: params.id,
    action: "submitted",
    performed_by: profile.id,
  });

  return NextResponse.json({ success: true, payslip: data });
}
