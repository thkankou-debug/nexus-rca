import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/monthly-report-data";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "monthly-reports";

// ─── GET /api/monthly-reports ───────────────────────────────────────────────
// Retourne les 24 derniers rapports (super_admin / admin uniquement).
// Pour chaque rapport ayant un storage_path, génère une signed URL 1h.
export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { data: reports, error } = await supabase
      .from("monthly_reports")
      .select(
        "id, period_year, period_month, period_start, period_end, generated_at, status, storage_path, file_size_bytes, recipients, metrics, error_message, trigger"
      )
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false })
      .limit(24);

    if (error) {
      console.error("[MONTHLY_REPORTS GET] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Génère signed URL (1h) pour chaque rapport ayant un storage_path.
    const admin = getAdminSupabase();
    const enriched = await Promise.all(
      (reports || []).map(async (r) => {
        let download_url: string | null = null;
        if (r.storage_path) {
          const { data: urlData } = await admin.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(r.storage_path, 60 * 60);
          download_url = urlData?.signedUrl || null;
        }
        return { ...r, download_url };
      })
    );

    return NextResponse.json({ reports: enriched });
  } catch (err) {
    console.error("[MONTHLY_REPORTS GET] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
