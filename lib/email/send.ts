// ============================================================================
// LIB — Wrapper Resend avec fallback FROM (noreply@nexusrca.com → onboarding@resend.dev)
// Centralise l'envoi pour les nouveaux templates de la refonte 032.
// Les routes API existantes (qui ont leur HTML inline) restent inchangées.
// ============================================================================

import { Resend } from "resend";

const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Étiquette pour les logs (ex: "[STATUS_CHANGE]") */
  tag?: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Envoi non-bloquant. En cas d'échec sur le from primaire (domaine pas vérifié,
 * email rejeté, etc.), retente avec le from fallback Resend onboarding.
 * N'élève jamais d'exception : log et retourne success=false pour qu'un appelant
 * métier puisse continuer son flux.
 */
// ── OUTBOX (§10, lot G3 — 13/09/2026) ────────────────────────────────────────
// Chaque envoi est journalisé dans `outbox` (pending → sent/failed) ; les
// échecs sont rejoués par le cron quotidien via retryFailedOutbox(). La
// journalisation n'est JAMAIS bloquante : si l'écriture outbox échoue,
// l'e-mail est tenté quand même (comportement historique préservé).

function getOutboxAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // Import différé pour ne pas alourdir les chemins sans Supabase.
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Tentative brute (sans journalisation) — utilisée par l'envoi ET le rejeu. */
async function attemptSend(params: SendEmailParams): Promise<SendEmailResult> {
  const tag = params.tag ?? "[EMAIL]";

  if (!process.env.RESEND_API_KEY) {
    console.warn(`${tag} RESEND_API_KEY absente, envoi ignoré`);
    return { success: false, error: "RESEND_API_KEY manquante" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const r = await resend.emails.send({
      from: FROM_PRIMARY,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (!r.error) {
      console.log(`${tag} OK → ${Array.isArray(params.to) ? params.to.join(",") : params.to}`);
      return { success: true };
    }

    console.warn(`${tag} primary failed (${r.error.message}), retry fallback`);
    const r2 = await resend.emails.send({
      from: FROM_FALLBACK,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (r2.error) {
      console.error(`${tag} fallback failed:`, r2.error.message);
      return { success: false, error: r2.error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error(`${tag} exception:`, message);
    return { success: false, error: message };
  }
}

/**
 * Envoi journalisé : enregistre dans `outbox`, tente l'envoi, marque le
 * résultat. Même signature qu'avant — aucun appelant à modifier.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const admin = getOutboxAdmin();
  let outboxId: string | null = null;
  if (admin) {
    try {
      const { data } = await admin
        .from("outbox")
        .insert({
          kind: "email",
          payload: { to: params.to, subject: params.subject, html: params.html },
          tag: params.tag ?? null,
          status: "pending",
        })
        .select("id")
        .single();
      outboxId = (data as { id: string } | null)?.id ?? null;
    } catch {
      outboxId = null;
    }
  }

  const result = await attemptSend(params);

  if (admin && outboxId) {
    try {
      await admin
        .from("outbox")
        .update({
          status: result.success ? "sent" : "failed",
          attempts: 1,
          last_error: result.success ? null : result.error ?? "inconnu",
          sent_at: result.success ? new Date().toISOString() : null,
        })
        .eq("id", outboxId);
    } catch {
      // journalisation best effort — l'envoi a déjà eu lieu
    }
  }
  return result;
}

const OUTBOX_MAX_ATTEMPTS = 5;

/**
 * Rejeu des e-mails en échec (§10) — appelé par le cron quotidien.
 * 5 tentatives maximum par message ; renvoie le nombre re-livrés.
 */
export async function retryFailedOutbox(): Promise<{ retried: number; delivered: number }> {
  const admin = getOutboxAdmin();
  if (!admin) return { retried: 0, delivered: 0 };

  const { data: rows } = await admin
    .from("outbox")
    .select("id, payload, tag, attempts")
    .in("status", ["failed", "pending"])
    .lt("attempts", OUTBOX_MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(50);

  let retried = 0;
  let delivered = 0;
  for (const row of (rows || []) as {
    id: string;
    payload: { to: string | string[]; subject: string; html: string };
    tag: string | null;
    attempts: number;
  }[]) {
    retried++;
    const result = await attemptSend({
      to: row.payload.to,
      subject: row.payload.subject,
      html: row.payload.html,
      tag: row.tag ?? "[OUTBOX-RETRY]",
    });
    if (result.success) delivered++;
    await admin
      .from("outbox")
      .update({
        status: result.success ? "sent" : "failed",
        attempts: row.attempts + 1,
        last_error: result.success ? null : result.error ?? "inconnu",
        sent_at: result.success ? new Date().toISOString() : null,
      })
      .eq("id", row.id);
  }
  return { retried, delivered };
}
