// ============================================================================
// API ROUTE — POST/DELETE /api/partenaires/:id/logo
// P8, lot Upload logo. Téléversement réel (FormData) dans le bucket public
// 'partenaires-logos' (migration 066) — remplace le champ URL en texte
// libre. L'écriture dans logo_url déclenche le trigger de réinitialisation
// de is_verified (migration 063) : un nouveau logo doit être revérifié.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "partenaires-logos";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function extractStoragePath(logoUrl: string | null): string | null {
  if (!logoUrl) return null;
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = logoUrl.indexOf(marker);
  if (idx === -1) return null;
  return logoUrl.slice(idx + marker.length);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.partenaire.write");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    const { data: partenaire } = await admin.from("partenaires").select("id, logo_url").eq("id", params.id).single();
    if (!partenaire) {
      return NextResponse.json({ success: false, error: "Partenaire introuvable" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: "Fichier manquant" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "Fichier trop volumineux (max 2 Mo)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format non supporté (PNG, JPEG, WebP ou SVG uniquement)" },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${params.id}/${crypto.randomUUID()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[PARTENAIRES_LOGO] upload error:", uploadError.message);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const newLogoUrl = publicUrlData.publicUrl;

    const { error: updateError } = await admin
      .from("partenaires")
      .update({ logo_url: newLogoUrl })
      .eq("id", params.id);

    if (updateError) {
      await admin.storage.from(STORAGE_BUCKET).remove([path]);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Supprime l'ancien fichier une fois le nouveau enregistré (best-effort).
    const oldPath = extractStoragePath((partenaire as { logo_url: string | null }).logo_url);
    if (oldPath) {
      await admin.storage.from(STORAGE_BUCKET).remove([oldPath]);
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "partenaire.logo.televerse",
      entityType: "partenaires",
      entityId: params.id,
      newValue: { logo_url: newLogoUrl },
    });

    return NextResponse.json({ success: true, logo_url: newLogoUrl });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PARTENAIRES_LOGO] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.partenaire.write");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    const { data: partenaire } = await admin.from("partenaires").select("logo_url").eq("id", params.id).single();
    if (!partenaire) {
      return NextResponse.json({ success: false, error: "Partenaire introuvable" }, { status: 404 });
    }

    const path = extractStoragePath((partenaire as { logo_url: string | null }).logo_url);
    if (path) {
      await admin.storage.from(STORAGE_BUCKET).remove([path]);
    }

    const { error: updateError } = await admin.from("partenaires").update({ logo_url: null }).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "partenaire.logo.supprime",
      entityType: "partenaires",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PARTENAIRES_LOGO] DELETE EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
