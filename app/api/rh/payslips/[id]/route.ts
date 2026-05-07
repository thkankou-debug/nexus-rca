import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { Payslip, PayslipLigne } from "@/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data: payslip, error } = await supabase
    .from("payslips")
    .select("*, employees(id, nom_complet, email, poste, departement, type_contrat, date_embauche, telephone, numero_cni)")
    .eq("id", params.id)
    .single();

  if (error || !payslip) {
    return NextResponse.json({ success: false, error: error?.message ?? "Not found" }, { status: 404 });
  }

  const { data: history } = await supabase
    .from("payslip_validation_history")
    .select("*, profiles(id, nom, prenom, email)")
    .eq("payslip_id", params.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ success: true, payslip, history: history ?? [] });
}

interface UpdatePayslipBody {
  salaire_brut?: number;
  salaire_net?: number;
  details_lignes?: PayslipLigne[];
  notes_admin?: string;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);

  let body: UpdatePayslipBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("payslips")
    .select("statut")
    .eq("id", params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ success: false, error: "Fiche introuvable" }, { status: 404 });
  }

  // Seules les fiches en brouillon sont modifiables (par admin ou super-admin)
  if ((existing as Payslip).statut !== "brouillon") {
    return NextResponse.json(
      { success: false, error: "Cette fiche n'est plus modifiable (statut : " + (existing as Payslip).statut + ")" },
      { status: 403 }
    );
  }

  const update: Record<string, unknown> = {};
  if (body.salaire_brut !== undefined) update.salaire_brut = body.salaire_brut;
  if (body.salaire_net !== undefined) update.salaire_net = body.salaire_net;
  if (body.details_lignes !== undefined) update.details_lignes = body.details_lignes;
  if (body.notes_admin !== undefined) update.notes_admin = body.notes_admin;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, error: "Aucune modification" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("payslips")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("[RH_PAYSLIPS_PATCH]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await supabase.from("payslip_validation_history").insert({
    payslip_id: params.id,
    action: "edited",
    performed_by: profile.id,
  });

  return NextResponse.json({ success: true, payslip: data });
}
