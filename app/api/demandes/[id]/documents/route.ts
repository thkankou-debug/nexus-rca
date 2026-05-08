import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_CATEGORIES } from "@/lib/demande-complete-form";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STORAGE_BUCKET = "demande-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

const VALID_CATEGORIES: string[] = DOCUMENT_CATEGORIES.map((c) => c.value);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function checkAccess(
  demandeId: string,
  userId: string,
  userEmail: string | null,
  userRole: string
): Promise<{ ok: boolean; demande?: Record<string, unknown> }> {
  const admin = getAdminClient();
  const { data: demande } = await admin
    .from("demandes")
    .select("id, client_id, email")
    .eq("id", demandeId)
    .single();

  if (!demande) return { ok: false };

  const isStaff =
    userRole === "agent" || userRole === "admin" || userRole === "super_admin";
  const isOwner =
    (demande as { client_id?: string }).client_id === userId ||
    (userEmail &&
      (demande as { email?: string }).email?.toLowerCase().trim() ===
        userEmail.toLowerCase().trim());

  return { ok: isStaff || !!isOwner, demande };
}

// ======================== POST — upload ========================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil introuvable" },
        { status: 401 }
      );
    }

    const access = await checkAccess(
      params.id,
      user.id,
      (profile as { email?: string }).email || null,
      (profile as { role: string }).role
    );

    if (!access.ok) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const categorie = (formData.get("categorie") as string | null) || null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Fichier manquant" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Fichier trop volumineux (max 10 Mo)" },
        { status: 400 }
      );
    }
    if (!categorie || !VALID_CATEGORIES.includes(categorie)) {
      return NextResponse.json(
        { success: false, error: "Catégorie invalide" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${params.id}/${categorie}/${crypto.randomUUID()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (upErr) {
      console.error("[DOCUMENTS] upload error:", upErr.message);
      return NextResponse.json(
        { success: false, error: upErr.message },
        { status: 500 }
      );
    }

    const { data: doc, error: insErr } = await admin
      .from("demande_documents")
      .insert({
        demande_id: params.id,
        uploaded_by: user.id,
        storage_path: path,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || "application/octet-stream",
        categorie,
      })
      .select("id")
      .single();

    if (insErr || !doc) {
      // Rollback storage upload
      await admin.storage.from(STORAGE_BUCKET).remove([path]);
      return NextResponse.json(
        { success: false, error: insErr?.message || "Insert échoué" },
        { status: 500 }
      );
    }

    // Mark fulfilled requests
    await admin
      .from("demande_documents_requests")
      .update({
        statut: "fourni",
        fulfilled_by_document_id: (doc as { id: string }).id,
        fulfilled_at: new Date().toISOString(),
      })
      .eq("demande_id", params.id)
      .eq("statut", "en_attente")
      .ilike("type_document", `%${categorie.replace(/_/g, " ")}%`);

    return NextResponse.json({
      success: true,
      document_id: (doc as { id: string }).id,
    });
  } catch (err) {
    console.error("[DOCUMENTS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ======================== DELETE — supprimer ========================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", user.id)
      .single();
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil introuvable" },
        { status: 401 }
      );
    }

    const access = await checkAccess(
      params.id,
      user.id,
      (profile as { email?: string }).email || null,
      (profile as { role: string }).role
    );
    if (!access.ok) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    const docId = request.nextUrl.searchParams.get("doc_id");
    if (!docId) {
      return NextResponse.json(
        { success: false, error: "doc_id requis" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data: doc } = await admin
      .from("demande_documents")
      .select("id, storage_path, demande_id, uploaded_by")
      .eq("id", docId)
      .single();

    if (!doc || (doc as { demande_id: string }).demande_id !== params.id) {
      return NextResponse.json(
        { success: false, error: "Document introuvable" },
        { status: 404 }
      );
    }

    const role = (profile as { role: string }).role;
    const isStaff = role === "agent" || role === "admin" || role === "super_admin";
    const isUploader = (doc as { uploaded_by?: string }).uploaded_by === user.id;
    if (!isStaff && !isUploader) {
      return NextResponse.json(
        { success: false, error: "Vous ne pouvez supprimer que vos propres documents" },
        { status: 403 }
      );
    }

    // Delete storage + DB row
    await admin.storage
      .from(STORAGE_BUCKET)
      .remove([(doc as { storage_path: string }).storage_path]);

    const { error: delErr } = await admin
      .from("demande_documents")
      .delete()
      .eq("id", docId);

    if (delErr) {
      return NextResponse.json(
        { success: false, error: delErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DOCUMENTS] DELETE EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
