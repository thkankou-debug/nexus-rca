// ────────────────────────────────────────────────────────────────────────────
// Helper WhatsApp via Twilio API REST (sans SDK npm — fetch direct).
// Pattern best-effort : try/catch silencieux. Une notif KO ne fait JAMAIS
// échouer l'action métier (paiement, RDV, etc.).
//
// Variables d'env requises (Vercel Settings → Environment Variables) :
//   - TWILIO_ACCOUNT_SID
//   - TWILIO_AUTH_TOKEN
//   - TWILIO_WHATSAPP_FROM  (ex: "whatsapp:+14155238886" pour la sandbox)
//
// Sandbox Twilio :
//   Chaque destinataire doit envoyer "join {sandbox-keyword}" au numéro
//   sandbox depuis son WhatsApp avant de pouvoir recevoir des messages.
//   En production : numéro vérifié + templates approuvés Meta.
// ────────────────────────────────────────────────────────────────────────────

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01/Accounts";

/** Normalise un numéro brut en format Twilio whatsapp:+E.164 */
export function formatWhatsAppNumber(raw: string): string {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  return `whatsapp:+${cleaned}`;
}

/** Envoie un message WhatsApp à un destinataire. Best-effort silencieux. */
export async function sendWhatsApp(
  to: string,
  body: string,
  context?: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const tag = context ? `[WHATSAPP:${context}]` : "[WHATSAPP]";

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !from) {
      console.warn(`${tag} variables d'env Twilio manquantes, skip envoi`);
      return { success: false, error: "Twilio config manquante" };
    }

    const formattedTo = to.startsWith("whatsapp:")
      ? to
      : formatWhatsAppNumber(to);

    if (!formattedTo) {
      console.warn(`${tag} numéro destinataire vide`);
      return { success: false, error: "Numéro destinataire invalide" };
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(`${TWILIO_API_BASE}/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: formattedTo,
        Body: body,
      }).toString(),
    });

    const data = (await res.json().catch(() => ({}))) as {
      sid?: string;
      message?: string;
      code?: number;
    };

    if (!res.ok) {
      console.error(
        `${tag} Twilio error ${res.status}: ${data.message || "?"} (code ${data.code})`
      );
      return { success: false, error: data.message || `HTTP ${res.status}` };
    }

    console.log(`${tag} ✅ envoyé sid=${data.sid} to=${formattedTo}`);
    return { success: true, sid: data.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "exception inconnue";
    console.error(`${tag} EXCEPTION:`, msg);
    return { success: false, error: msg };
  }
}

/** Envoie un message WhatsApp à plusieurs destinataires (broadcast). */
export async function sendWhatsAppMulti(
  recipients: string[],
  body: string,
  context?: string
): Promise<void> {
  await Promise.all(recipients.map((to) => sendWhatsApp(to, body, context)));
}
