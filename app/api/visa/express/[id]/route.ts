import { NextRequest, NextResponse } from "next/server";
import { createClient as createSsrClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "visa-uploads";
const VALID_STATUS = ["nouveau", "en_cours", "traite", "annule"] as const;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── GET /api/visa/express/[id] ────────────────────────────────────────────
// Retourne la demande complète + signed URLs (1h) pour chaque document.
// Accessible à tous les staff (agent + admin + super_admin) via RLS.
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSsrClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (
      !profile ||
      !["agent", "admin", "super_admin"].includes(profile.role as string)
    ) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { data: req, error } = await supabase
      .from("visa_express_requests")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !req) {
      return NextResponse.json(
        { error: "Demande introuvable" },
        { status: 404 }
      );
    }

    const admin = getAdminClient();
    const documents: { name: string; url: string }[] = [];
    for (const path of (req.document_paths as string[]) || []) {
      const { data: urlData } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, 60 * 60);
      if (urlData?.signedUrl) {
        documents.push({
          name: path.split("/").pop() || path,
          url: urlData.signedUrl,
        });
      }
    }

    return NextResponse.json({ ...req, documents });
  } catch (err) {
    console.error("[VISA_EXPRESS GET] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH /api/visa/express/[id] ──────────────────────────────────────────
// Change le statut. Réservé admin + super_admin (RLS).
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSsrClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (
      !profile ||
      !["admin", "super_admin"].includes(profile.role as string)
    ) {
      return NextResponse.json(
        { error: "Seuls les admin/super_admin peuvent modifier le statut" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const status = String(body.status || "").trim();
    if (!VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const { error } = await supabase
      .from("visa_express_requests")
      .update({ status })
      .eq("id", params.id);

    if (error) {
      console.error("[VISA_EXPRESS PATCH] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[VISA_EXPRESS PATCH] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
