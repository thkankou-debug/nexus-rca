import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl, PAYSLIPS_BUCKET } from "@/lib/rh/storage";
import type { Payslip } from "@/types";

// GET — retourne une signed URL temporaire (10 min) pour télécharger le PDF.
// Accessible à : super_admin, admin, et l'employé propriétaire (via RLS).
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // RLS s'occupe de filtrer : si l'utilisateur n'a pas le droit de voir cette fiche,
  // single() retournera erreur.
  const { data: payslip, error } = await supabase
    .from("payslips")
    .select("pdf_url, statut, employee_id")
    .eq("id", params.id)
    .single();

  if (error || !payslip) {
    return NextResponse.json({ success: false, error: "Fiche introuvable" }, { status: 404 });
  }

  const typed = payslip as Pick<Payslip, "pdf_url" | "statut" | "employee_id">;

  if (!typed.pdf_url || typed.statut !== "validee") {
    return NextResponse.json(
      { success: false, error: "PDF non disponible (fiche non validée)" },
      { status: 404 }
    );
  }

  try {
    const signedUrl = await getSignedUrl(PAYSLIPS_BUCKET, typed.pdf_url, 600);
    return NextResponse.json({ success: true, url: signedUrl });
  } catch (err) {
    console.error("[RH_PAYSLIPS_PDF_URL]", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
