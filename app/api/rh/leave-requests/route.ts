import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Calcule le nombre de jours ouvres entre 2 dates (inclus), avec support
// demi-journees au debut/fin. Pour Phase B on calcule simplement les jours
// calendaires (les jours feries seront soustraits cote affichage).
function calcTotalDays(start: string, end: string, halfStart: boolean, halfEnd: boolean): number {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
  let total = days;
  if (halfStart) total -= 0.5;
  if (halfEnd) total -= 0.5;
  return Math.max(0, total);
}

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statut = url.searchParams.get("statut");
  const employeeId = url.searchParams.get("employee_id");

  let query = supabase
    .from("leave_requests")
    .select("*, employees(id, nom_complet, poste, departement, email), leave_types(id, code, label, color_hex, paid)")
    .order("requested_at", { ascending: false });

  if (statut) query = query.eq("statut", statut);
  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, requests: data });
}

interface CreateBody {
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  half_day_start?: boolean;
  half_day_end?: boolean;
  reason?: string;
  doc_url?: string;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const required: Array<keyof CreateBody> = [
    "employee_id",
    "leave_type_id",
    "start_date",
    "end_date",
  ];
  for (const k of required) {
    if (!body[k]) {
      return NextResponse.json(
        { success: false, error: `Champ requis : ${k}` },
        { status: 400 }
      );
    }
  }
  if (new Date(body.end_date) < new Date(body.start_date)) {
    return NextResponse.json(
      { success: false, error: "Date de fin antérieure à la date de début" },
      { status: 400 }
    );
  }

  const totalDays = calcTotalDays(
    body.start_date,
    body.end_date,
    !!body.half_day_start,
    !!body.half_day_end
  );

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      employee_id: body.employee_id,
      leave_type_id: body.leave_type_id,
      start_date: body.start_date,
      end_date: body.end_date,
      total_days: totalDays,
      half_day_start: !!body.half_day_start,
      half_day_end: !!body.half_day_end,
      reason: body.reason ?? null,
      doc_url: body.doc_url ?? null,
      statut: "en_attente",
      requested_by: user.id,
    })
    .select("*, employees(id, nom_complet), leave_types(label, color_hex)")
    .single();

  if (error) {
    console.error("[RH_LEAVES_POST]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, request: data });
}
