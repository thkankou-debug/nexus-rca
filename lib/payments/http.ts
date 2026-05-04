// ============================================================================
// lib/payments/http.ts — Helpers HTTP pour les routes /api/payments/*
// Standardise l'authentification, les erreurs et les réponses JSON.
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";
import { roleAtLeast } from "@/lib/rbac";
import { TransitionError } from "./rules";
import { StripeNotConfiguredError, StripeWebhookError } from "./stripe";

// ─── Erreurs typées ────────────────────────────────────────────────────────

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const errors = {
  unauthorized: () => new HttpError(401, "UNAUTHORIZED", "Authentication required"),
  forbidden: (reason = "Insufficient permissions") =>
    new HttpError(403, "FORBIDDEN", reason),
  notFound: (entity: string) =>
    new HttpError(404, "NOT_FOUND", `${entity} not found`),
  badRequest: (reason: string, code = "BAD_REQUEST") =>
    new HttpError(400, code, reason),
  conflict: (reason: string, code = "CONFLICT") =>
    new HttpError(409, code, reason),
  internal: (reason = "Internal server error") =>
    new HttpError(500, "INTERNAL", reason),
};

// ─── Authentification + chargement profile ─────────────────────────────────

export interface AuthenticatedContext {
  userId: string;
  role: UserRole;
}

/**
 * Charge l'utilisateur authentifié + son rôle. Throw HttpError 401 si pas
 * de session, ou 403 si pas de profile/role.
 */
export async function requireAuthenticated(): Promise<AuthenticatedContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw errors.unauthorized();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) {
    throw errors.forbidden("No role assigned to this user");
  }

  return {
    userId: user.id,
    role: profile.role as UserRole,
  };
}

/**
 * Comme requireAuthenticated() mais throw 403 si rôle < min.
 */
export async function requireRole(min: UserRole): Promise<AuthenticatedContext> {
  const ctx = await requireAuthenticated();
  if (!roleAtLeast(ctx.role, min)) {
    throw errors.forbidden(
      `Role '${ctx.role}' insufficient — requires '${min}' or higher`
    );
  }
  return ctx;
}

// ─── Conversion erreurs → réponse JSON ─────────────────────────────────────

/**
 * Convertit toute erreur en réponse JSON standardisée.
 * À utiliser dans le catch de chaque route handler.
 */
export function toErrorResponse(err: unknown): NextResponse {
  // HttpError direct
  if (err instanceof HttpError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }

  // Erreurs de transition du state machine
  if (err instanceof TransitionError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }

  // Stripe non configuré
  if (err instanceof StripeNotConfiguredError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }

  // Erreur de signature webhook Stripe
  if (err instanceof StripeWebhookError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }

  // Tout autre cas : 500 + log côté serveur
  console.error("[API/payments] Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json(
    { error: message, code: "INTERNAL" },
    { status: 500 }
  );
}

// ─── Wrapper succès JSON ───────────────────────────────────────────────────

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
