import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl, COMPANY_DOCUMENTS_BUCKET } from "@/lib/rh/storage";
import type { CompanyDocument } from "@/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: doc, error } = await supabase
    .from("company_documents")
    .select("storage_path, mime_type")
    .eq("id", params.id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ success: false, error: "Document introuvable" }, { status: 404 });
  }

  try {
    const signedUrl = await getSignedUrl(
      COMPANY_DOCUMENTS_BUCKET,
      (doc as Pick<CompanyDocument, "storage_path">).storage_path,
      600
    );
    return NextResponse.json({ success: true, url: signedUrl });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
