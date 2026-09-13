import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { homeForRole, requiredPermissionForPath } from "@/lib/rbac";
import type { UserRole } from "@/types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1) Pas de session sur /dashboard ou /api/{role} → /login
  const requiresAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/super-admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/agent");

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 2) Connecté + sur /login ou /register → /dashboard (redispatch par rôle si possible)
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 3) Gating par rôle sur les routes RBAC-protégées
  if (user) {
    const allowedRoles = requiredPermissionForPath(pathname);
    if (allowedRoles) {
      // Charger le rôle (table profiles). Léger : 1 select indexé par PK.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, actif")
        .eq("id", user.id)
        .single();

      const userRole = (profile?.role as UserRole | undefined) ?? null;

      // R22 (cahier des charges §18) : un compte désactivé perd l'accès aux
      // routes gardées immédiatement — pas seulement à la prochaine
      // connexion. `actif === false` uniquement : NULL (comptes historiques
      // sans valeur) reste traité comme actif, aucun blocage rétroactif.
      if ((profile as { actif?: boolean | null } | null)?.actif === false) {
        if (pathname.startsWith("/api/")) {
          return new NextResponse(JSON.stringify({ error: "Compte désactivé" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          });
        }
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("disabled", "1");
        return NextResponse.redirect(url);
      }

      // Pas de profil ou rôle non autorisé → redirect vers son home dashboard
      if (!userRole || !allowedRoles.includes(userRole)) {
        // API protégée → renvoyer 403 plutôt que rediriger
        if (pathname.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden", required: allowedRoles }),
            { status: 403, headers: { "content-type": "application/json" } }
          );
        }
        const url = request.nextUrl.clone();
        url.pathname = userRole ? homeForRole(userRole) : "/dashboard";
        return NextResponse.redirect(url);
      }

      // Injecter le rôle dans un header pour les server components qui veulent l'utiliser
      // (évite un re-fetch profiles dans la même requête)
      response.headers.set("x-user-role", userRole);
    }
  }

  return response;
}
