import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { deleteFromStorage, HR_DOCUMENTS_BUCKET } from "@/lib/rh/storage";
import type { HrDocument } from "@/types";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  // Récupère le storage_path avant suppression DB
  const { data: doc, error: fetchErr } = await supabase
    .from("hr_documents")
    .select("storage_path")
    .eq("id", params.id)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json({ success: false, error: "Document introuvable" }, { status: 404 });
  }

  const { error } = await supabase.from("hr_documents").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Supprime aussi du Storage (best-effort)
  try {
    await deleteFromStorage(HR_DOCUMENTS_BUCKET, (doc as Pick<HrDocument, "storage_path">).storage_path);
  } catch (err) {
    console.error("[RH_DOCUMENTS_DELETE_STORAGE]", err);
    // On ne fail pas la suppression DB pour ça
  }

  return NextResponse.json({ success: true });
}
