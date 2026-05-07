import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { Payslip } from "@/types";

// Super-admin refuse une fiche en attente.
// en_attente_validation → brouillon (modifiable à nouveau par admin)
// Historique conservé.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  let body: { note?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* note optionnelle mais recommandée */
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("payslips")
    .select("statut")
    .eq("id", params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ success: false, error: "Fiche introuvable" }, { status: 404 });
  }

  if ((existing as Payslip).statut !== "en_attente_validation") {
    return NextResponse.json(
      {
        success: false,
        error: `Statut actuel : ${(existing as Payslip).statut}. Seules les fiches en attente peuvent être refusées.`,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("payslips")
    .update({
      statut: "brouillon",
      submitted_at: null,
      notes_super_admin: body.note ?? null,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("[RH_PAYSLIPS_REJECT]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await supabase.from("payslip_validation_history").insert({
    payslip_id: params.id,
    action: "rejected",
    performed_by: profile.id,
    note: body.note ?? null,
  });

  return NextResponse.json({ success: true, payslip: data });
}
