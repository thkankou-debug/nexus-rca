import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { LeaveRequest } from "@/types";

// Super-admin / admin valide une demande de conge.
// en_attente -> valide, increment leave_balance.used_days
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  let body: { note?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* note optionnelle */
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ success: false, error: "Demande introuvable" }, { status: 404 });
  }
  const typed = existing as LeaveRequest;
  if (typed.statut !== "en_attente") {
    return NextResponse.json(
      { success: false, error: `Statut actuel : ${typed.statut}` },
      { status: 400 }
    );
  }

  // 1. Update statut
  const { data: updated, error: updateErr } = await supabase
    .from("leave_requests")
    .update({
      statut: "valide",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_notes: body.note ?? null,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (updateErr) {
    console.error("[RH_LEAVES_APPROVE]", updateErr);
    return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
  }

  // 2. Update leave_balance — upsert (si pas de balance pour cet employe/annee/type, on cree)
  const year = new Date(typed.start_date).getFullYear();
  const { data: balance } = await supabase
    .from("leave_balances")
    .select("*")
    .eq("employee_id", typed.employee_id)
    .eq("year", year)
    .eq("leave_type_id", typed.leave_type_id)
    .maybeSingle();

  if (balance) {
    await supabase
      .from("leave_balances")
      .update({ used_days: Number(balance.used_days) + Number(typed.total_days) })
      .eq("id", balance.id);
  } else {
    // Pas de balance — on initialise avec used_days only (acquired sera ajuste plus tard)
    await supabase.from("leave_balances").insert({
      employee_id: typed.employee_id,
      year,
      leave_type_id: typed.leave_type_id,
      acquired_days: 0,
      used_days: typed.total_days,
    });
  }

  return NextResponse.json({ success: true, request: updated });
}
