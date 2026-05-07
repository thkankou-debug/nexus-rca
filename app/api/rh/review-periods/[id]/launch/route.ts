import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// POST — lance la campagne d evaluation : creee une performance_review
// pour chaque employe actif. Marque la periode en "en_cours".
export async function POST(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["super_admin"]);
  const supabase = createClient();

  // 1. Verify period exists
  const { data: period, error: periodErr } = await supabase
    .from("review_periods")
    .select("*")
    .eq("id", params.id)
    .single();

  if (periodErr || !period) {
    return NextResponse.json({ success: false, error: "Période introuvable" }, { status: 404 });
  }

  // 2. Fetch employees actifs
  const { data: employees, error: empErr } = await supabase
    .from("employees")
    .select("id")
    .eq("statut", "actif");

  if (empErr) {
    return NextResponse.json({ success: false, error: empErr.message }, { status: 500 });
  }

  if (!employees || employees.length === 0) {
    return NextResponse.json(
      { success: false, error: "Aucun employé actif à évaluer" },
      { status: 400 }
    );
  }

  // 3. Check existing reviews pour eviter doublons (UNIQUE employee_id, period_id)
  const { data: existing } = await supabase
    .from("performance_reviews")
    .select("employee_id")
    .eq("period_id", params.id);

  const existingSet = new Set((existing ?? []).map((r) => r.employee_id as string));
  const toCreate = employees.filter((e) => !existingSet.has(e.id));

  if (toCreate.length === 0) {
    // Toutes les reviews existent deja — on bascule juste la periode en "en_cours"
    await supabase
      .from("review_periods")
      .update({ statut: "en_cours" })
      .eq("id", params.id);
    return NextResponse.json({
      success: true,
      created: 0,
      message: "Toutes les évaluations existent déjà — période passée à 'en_cours'",
    });
  }

  // 4. Insert reviews en lot
  const rows = toCreate.map((e) => ({
    employee_id: e.id,
    period_id: params.id,
    statut: "programme",
  }));

  const { error: insertErr } = await supabase
    .from("performance_reviews")
    .insert(rows);

  if (insertErr) {
    return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
  }

  // 5. Bascule periode en "en_cours"
  await supabase
    .from("review_periods")
    .update({ statut: "en_cours" })
    .eq("id", params.id);

  return NextResponse.json({
    success: true,
    created: toCreate.length,
    total_employees: employees.length,
  });
}
