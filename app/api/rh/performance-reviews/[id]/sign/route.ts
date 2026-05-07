import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PerformanceReview } from "@/types";

interface SignBody {
  role: "employee" | "manager";
}

// POST — signature digitale (employee ou manager).
// Si les 2 signatures sont presentes : passage statut = signe
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: SignBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!["employee", "manager"].includes(body.role)) {
    return NextResponse.json({ success: false, error: "role invalide" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("performance_reviews")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: "Review introuvable" }, { status: 404 });
  }
  const typed = existing as PerformanceReview;

  const update: Record<string, unknown> = {};
  const now = new Date().toISOString();

  if (body.role === "employee") {
    update.signed_employee_at = now;
  } else {
    update.signed_manager_at = now;
  }

  // Si les 2 signent → statut: signe
  const otherSigned =
    body.role === "employee"
      ? typed.signed_manager_at !== null
      : typed.signed_employee_at !== null;
  if (otherSigned) {
    update.statut = "signe";
  }

  const { data, error } = await supabase
    .from("performance_reviews")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, review: data });
}
