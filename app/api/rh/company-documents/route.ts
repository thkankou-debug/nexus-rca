import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { uploadCompanyDocument } from "@/lib/rh/storage";
import type { CompanyDocumentType, CompanyDocumentVisibility } from "@/types";

const ALLOWED_TYPES: CompanyDocumentType[] = [
  "reglement_interieur",
  "charte",
  "convention_collective",
  "guide",
  "proces_verbal",
  "autre",
];
const ALLOWED_VISIBILITIES: CompanyDocumentVisibility[] = ["tous", "staff", "super_admin"];
const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("company_documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[RH_COMPANY_DOCS_GET]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, documents: data });
}

export async function POST(req: Request) {
  const profile = await requireProfile(["super_admin"]);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as CompanyDocumentType | null;
  const name = (formData.get("name") as string | null) ?? null;
  const description = (formData.get("description") as string | null) ?? null;
  const version = (formData.get("version") as string | null) ?? null;
  const visibleToRaw = (formData.get("visible_to") as string | null) ?? "staff";

  if (!file) {
    return NextResponse.json({ success: false, error: "Fichier manquant" }, { status: 400 });
  }
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ success: false, error: "Type invalide" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Format non supporté (PDF, JPG, PNG, WebP, DOCX, XLSX)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: "Fichier trop volumineux (max 20 MB)" },
      { status: 400 }
    );
  }
  const visibleTo = ALLOWED_VISIBILITIES.includes(visibleToRaw as CompanyDocumentVisibility)
    ? (visibleToRaw as CompanyDocumentVisibility)
    : "staff";

  const buffer = await file.arrayBuffer();

  let storagePath: string;
  try {
    const uploaded = await uploadCompanyDocument({
      file: buffer,
      fileName: file.name,
      mimeType: file.type,
    });
    storagePath = uploaded.path;
  } catch (err) {
    console.error("[RH_COMPANY_DOCS_UPLOAD]", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("company_documents")
    .insert({
      type,
      name: name ?? file.name,
      description,
      version,
      visible_to: visibleTo,
      storage_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      uploaded_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[RH_COMPANY_DOCS_INSERT]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, document: data });
}
