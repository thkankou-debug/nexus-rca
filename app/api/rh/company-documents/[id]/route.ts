import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { deleteFromStorage, COMPANY_DOCUMENTS_BUCKET } from "@/lib/rh/storage";
import type { CompanyDocument } from "@/types";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["super_admin"]);
  const supabase = createClient();

  const { data: doc, error: fetchErr } = await supabase
    .from("company_documents")
    .select("storage_path")
    .eq("id", params.id)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json({ success: false, error: "Document introuvable" }, { status: 404 });
  }

  const { error } = await supabase.from("company_documents").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  try {
    await deleteFromStorage(
      COMPANY_DOCUMENTS_BUCKET,
      (doc as Pick<CompanyDocument, "storage_path">).storage_path
    );
  } catch (err) {
    console.error("[RH_COMPANY_DOCS_DELETE_STORAGE]", err);
  }

  return NextResponse.json({ success: true });
}
