import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["super_admin"]);
  const supabase = createClient();

  // Soft delete (active=false) pour preserver historique des onboardings
  // qui referencent ce template
  const { error } = await supabase
    .from("onboarding_templates")
    .update({ active: false })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
