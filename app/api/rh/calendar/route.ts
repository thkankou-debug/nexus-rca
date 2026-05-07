import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Vue agregee du calendrier RH : conges valides + jours feries +
// anniversaires + fins de contrat (CDD).
// Query params : start (ISO date) end (ISO date)
export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const start = url.searchParams.get("start") ?? new Date(new Date().getFullYear(), 0, 1).toISOString();
  const end = url.searchParams.get("end") ?? new Date(new Date().getFullYear(), 11, 31).toISOString();

  const [leavesRes, holidaysRes, employeesRes] = await Promise.all([
    supabase
      .from("leave_requests")
      .select(
        "id, employee_id, start_date, end_date, total_days, statut, employees(nom_complet, poste), leave_types(label, color_hex)"
      )
      .eq("statut", "valide")
      .gte("start_date", start.split("T")[0])
      .lte("end_date", end.split("T")[0]),
    supabase
      .from("holidays_car")
      .select("*")
      .gte("date", start.split("T")[0])
      .lte("date", end.split("T")[0]),
    supabase
      .from("employees")
      .select("id, nom_complet, date_naissance, date_embauche, type_contrat, poste, statut")
      .eq("statut", "actif"),
  ]);

  if (leavesRes.error || holidaysRes.error || employeesRes.error) {
    return NextResponse.json(
      {
        success: false,
        error:
          leavesRes.error?.message ||
          holidaysRes.error?.message ||
          employeesRes.error?.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    events: {
      leaves: leavesRes.data ?? [],
      holidays: holidaysRes.data ?? [],
      employees: employeesRes.data ?? [],
    },
    range: { start, end },
  });
}
