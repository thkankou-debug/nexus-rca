import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

interface PatchBody {
  completed?: boolean;
  notes?: string;
}

// PATCH — toggle completion d une task. Recalcule auto completion_pct
// du parent employee_onboarding.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Fetch task pour avoir l onboarding parent
  const { data: existing, error: fetchErr } = await supabase
    .from("onboarding_tasks")
    .select("id, employee_onboarding_id")
    .eq("id", params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ success: false, error: "Task introuvable" }, { status: 404 });
  }

  // 2. Update task
  const update: Record<string, unknown> = {};
  if (body.completed === true) {
    update.completed_at = new Date().toISOString();
    update.completed_by = profile.id;
  } else if (body.completed === false) {
    update.completed_at = null;
    update.completed_by = null;
  }
  if (body.notes !== undefined) {
    update.notes = body.notes;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { success: false, error: "Aucune modification fournie" },
      { status: 400 }
    );
  }

  const { error: updateErr } = await supabase
    .from("onboarding_tasks")
    .update(update)
    .eq("id", params.id);

  if (updateErr) {
    return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
  }

  // 3. Recalcul completion_pct du parent
  const { data: tasks } = await supabase
    .from("onboarding_tasks")
    .select("completed_at")
    .eq("employee_onboarding_id", existing.employee_onboarding_id);

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = (tasks ?? []).filter((t) => t.completed_at).length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 10000) / 100 : 0;

  const updateOnboarding: Record<string, unknown> = { completion_pct: pct };
  if (pct === 100) {
    updateOnboarding.completed_at = new Date().toISOString();
  } else {
    updateOnboarding.completed_at = null;
  }

  await supabase
    .from("employee_onboarding")
    .update(updateOnboarding)
    .eq("id", existing.employee_onboarding_id);

  // 4. Renvoie la task mise a jour
  const { data: refreshed } = await supabase
    .from("onboarding_tasks")
    .select("*")
    .eq("id", params.id)
    .single();

  return NextResponse.json({
    success: true,
    task: refreshed,
    completion_pct: pct,
  });
}
