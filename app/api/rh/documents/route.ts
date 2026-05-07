import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { uploadHrDocument } from "@/lib/rh/storage";
import type { HrDocumentType } from "@/types";

const ALLOWED_TYPES: HrDocumentType[] = ["contrat", "diplome", "piece_identite", "autre"];
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const profile = await requireProfile(["admin", "super_admin"]);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const employeeId = formData.get("employee_id") as string | null;
  const type = formData.get("type") as HrDocumentType | null;
  const subcategory = (formData.get("subcategory") as string | null) ?? null;
  const nom = (formData.get("nom") as string | null) ?? null;
  const description = (formData.get("description") as string | null) ?? null;

  if (!file) {
    return NextResponse.json({ success: false, error: "Fichier manquant" }, { status: 400 });
  }
  if (!employeeId) {
    return NextResponse.json({ success: false, error: "employee_id manquant" }, { status: 400 });
  }
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ success: false, error: "Type invalide" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Format non supporté (PDF, JPG, PNG, WebP)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: "Fichier trop volumineux (max 10 MB)" },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();

  let storagePath: string;
  try {
    const uploaded = await uploadHrDocument({
      employeeId,
      file: buffer,
      fileName: file.name,
      mimeType: file.type,
    });
    storagePath = uploaded.path;
  } catch (err) {
    console.error("[RH_DOCUMENTS_UPLOAD]", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("hr_documents")
    .insert({
      employee_id: employeeId,
      type,
      subcategory,
      nom: nom ?? file.name,
      description,
      storage_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      uploaded_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[RH_DOCUMENTS_INSERT]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, document: data });
}

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const employeeId = url.searchParams.get("employee_id");

  let query = supabase
    .from("hr_documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, documents: data });
}
