import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

export async function requireProfile(
  allowed: UserRole[]
): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  // R22 : un compte désactivé (actif === false) n'accède à aucune page
  // gardée — défense en profondeur, en plus du middleware.
  if ((profile as { actif?: boolean | null }).actif === false) {
    redirect("/login?disabled=1");
  }
  if (!allowed.includes(profile.role as UserRole)) {
    redirect("/dashboard");
  }
  return profile as Profile;
}
