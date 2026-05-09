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
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
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
