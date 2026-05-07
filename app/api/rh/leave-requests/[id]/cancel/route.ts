import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LeaveRequest } from "@/types";

// Annulation d une demande en attente (par l employe lui-meme via RLS,
// ou par admin/super_admin). Si valide deja : on libere le solde.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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

  if (typed.statut === "annule" || typed.statut === "refuse") {
    return NextResponse.json(
      { success: false, error: "Demande déjà annulée ou refusée" },
      { status: 400 }
    );
  }

  // Si la demande etait validee, on libere le solde
  if (typed.statut === "valide") {
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
        .update({
          used_days: Math.max(0, Number(balance.used_days) - Number(typed.total_days)),
        })
        .eq("id", balance.id);
    }
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .update({ statut: "annule" })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, request: data });
}
