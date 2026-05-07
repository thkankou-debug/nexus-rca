import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function GET() {
  await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("review_periods")
    .select("*")
    .order("year", { ascending: false })
    .order("start_date", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, periods: data });
}

interface CreateBody {
  year: number;
  label: string;
  description?: string;
  start_date: string;
  end_date: string;
}

export async function POST(req: Request) {
  const profile = await requireProfile(["super_admin"]);

  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const required: Array<keyof CreateBody> = ["year", "label", "start_date", "end_date"];
  for (const k of required) {
    if (!body[k]) {
      return NextResponse.json(
        { success: false, error: `Champ requis : ${k}` },
        { status: 400 }
      );
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("review_periods")
    .insert({
      year: body.year,
      label: body.label,
      description: body.description ?? null,
      start_date: body.start_date,
      end_date: body.end_date,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, period: data });
}
