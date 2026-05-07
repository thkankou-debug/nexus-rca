import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET soldes conges pour un employe (annee courante par defaut, ou ?year=XXXX)
export async function GET(
  req: Request,
  { params }: { params: { employeeId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get("year") || `${new Date().getFullYear()}`, 10);

  const { data, error } = await supabase
    .from("leave_balances")
    .select("*, leave_types(id, code, label, max_days_year, color_hex, paid)")
    .eq("employee_id", params.employeeId)
    .eq("year", year);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, balances: data, year });
}
