import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// GET — liste tous les reviews avec employee + period
// Query params : period_id, statut, employee_id
// Agent : la RLS filtre automatiquement sur ses propres reviews (self_select).
export async function GET(req: Request) {
  await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const url = new URL(req.url);
  const periodId = url.searchParams.get("period_id");
  const statut = url.searchParams.get("statut");
  const employeeId = url.searchParams.get("employee_id");

  let query = supabase
    .from("performance_reviews")
    .select(
      "*, employees(id, nom_complet, poste, departement, email), review_periods(id, year, label, statut)"
    )
    .order("created_at", { ascending: false });

  if (periodId) query = query.eq("period_id", periodId);
  if (statut) query = query.eq("statut", statut);
  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, reviews: data });
}
