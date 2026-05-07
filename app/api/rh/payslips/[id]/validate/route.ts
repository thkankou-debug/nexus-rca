import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { buildPayslipPdf } from "@/lib/rh/payslip-pdf";
import { uploadPayslipPdf } from "@/lib/rh/storage";
import type { Employee, Payslip } from "@/types";

// Super-admin valide une fiche en attente.
// en_attente_validation → validee
// Génère le PDF, upload dans bucket employee-payslips, lock la fiche.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  let body: { note?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* note optionnelle */
  }

  // 1. Fetch fiche + employé en une requête
  const { data: payslip, error: fetchErr } = await supabase
    .from("payslips")
    .select("*, employees(*)")
    .eq("id", params.id)
    .single();

  if (fetchErr || !payslip) {
    return NextResponse.json({ success: false, error: "Fiche introuvable" }, { status: 404 });
  }

  const typed = payslip as Payslip & { employees: Employee };

  if (typed.statut !== "en_attente_validation") {
    return NextResponse.json(
      {
        success: false,
        error: `Statut actuel : ${typed.statut}. Seules les fiches en attente peuvent être validées.`,
      },
      { status: 400 }
    );
  }

  // 2. Génère le PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildPayslipPdf({
      employee: typed.employees,
      payslip: typed,
      validatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[RH_PAYSLIPS_VALIDATE_PDF]", err);
    return NextResponse.json(
      { success: false, error: "Échec génération PDF : " + (err as Error).message },
      { status: 500 }
    );
  }

  // 3. Upload dans Storage
  let pdfPath: string;
  try {
    const uploaded = await uploadPayslipPdf({
      employeeId: typed.employee_id,
      payslipId: typed.id,
      reference: typed.reference,
      pdfBytes,
    });
    pdfPath = uploaded.path;
  } catch (err) {
    console.error("[RH_PAYSLIPS_VALIDATE_UPLOAD]", err);
    return NextResponse.json(
      { success: false, error: "Échec upload PDF : " + (err as Error).message },
      { status: 500 }
    );
  }

  // 4. Update fiche → validee
  const { data: updated, error: updateErr } = await supabase
    .from("payslips")
    .update({
      statut: "validee",
      validated_by: profile.id,
      validated_at: new Date().toISOString(),
      pdf_url: pdfPath,
      notes_super_admin: body.note ?? null,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (updateErr) {
    console.error("[RH_PAYSLIPS_VALIDATE_UPDATE]", updateErr);
    return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
  }

  await supabase.from("payslip_validation_history").insert({
    payslip_id: params.id,
    action: "validated",
    performed_by: profile.id,
    note: body.note ?? null,
  });

  return NextResponse.json({ success: true, payslip: updated });
}
