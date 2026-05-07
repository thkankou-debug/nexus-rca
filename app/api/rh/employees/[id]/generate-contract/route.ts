import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { buildContractPdf, type ContractType } from "@/lib/rh/contract-pdf";
import { uploadHrDocument } from "@/lib/rh/storage";
import type { Employee } from "@/types";

interface Body {
  contract_type: ContractType;
  cdd_end_date?: string;
  lieu_travail?: string;
}

const ALLOWED: ContractType[] = ["CDI", "CDD", "Stage", "Freelance"];

function buildReference(employeeId: string): string {
  const year = new Date().getFullYear();
  const short = employeeId.slice(0, 8).toUpperCase();
  return `CONTRAT-${year}-${short}`;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.contract_type || !ALLOWED.includes(body.contract_type)) {
    return NextResponse.json(
      { success: false, error: "Type de contrat invalide" },
      { status: 400 }
    );
  }
  if (body.contract_type === "CDD" && !body.cdd_end_date) {
    return NextResponse.json(
      { success: false, error: "Date de fin requise pour un CDD" },
      { status: 400 }
    );
  }

  // 1. Fetch employee
  const { data: employee, error: empErr } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single();

  if (empErr || !employee) {
    return NextResponse.json({ success: false, error: "Employé introuvable" }, { status: 404 });
  }
  const typed = employee as Employee;

  const reference = buildReference(typed.id);

  // 2. Generate PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildContractPdf({
      employee: typed,
      contractType: body.contract_type,
      cddEndDate: body.cdd_end_date,
      lieuTravail: body.lieu_travail,
      reference,
    });
  } catch (err) {
    console.error("[RH_CONTRACT_GEN_PDF]", err);
    return NextResponse.json(
      { success: false, error: "Échec génération PDF : " + (err as Error).message },
      { status: 500 }
    );
  }

  // 3. Upload to hr-documents bucket
  const fileName = `${reference}.pdf`;
  let storagePath: string;
  try {
    const uploaded = await uploadHrDocument({
      employeeId: typed.id,
      file: pdfBytes,
      fileName,
      mimeType: "application/pdf",
    });
    storagePath = uploaded.path;
  } catch (err) {
    console.error("[RH_CONTRACT_UPLOAD]", err);
    return NextResponse.json(
      { success: false, error: "Échec upload PDF : " + (err as Error).message },
      { status: 500 }
    );
  }

  // 4. Create hr_documents row (type=contrat, subcategory=type)
  const { data: doc, error: insertErr } = await supabase
    .from("hr_documents")
    .insert({
      employee_id: typed.id,
      type: "contrat",
      subcategory: body.contract_type,
      nom: `Contrat de travail - ${body.contract_type}`,
      description: `Contrat ${body.contract_type} généré automatiquement le ${new Date().toLocaleDateString("fr-FR")}.`,
      storage_path: storagePath,
      file_size_bytes: pdfBytes.length,
      mime_type: "application/pdf",
      uploaded_by: profile.id,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("[RH_CONTRACT_INSERT]", insertErr);
    return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, document: doc, reference });
}
