import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { rateLimitOrNull } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Destinataires officiels (cohérent avec le brief produit du rapport mensuel) :
// super_admin + email principal de l'entreprise.
const STAFF_RECIPIENTS = ["tkankou@gmail.com", "contact@nexusrca.com"];

const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function generateReference(): string {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `NX-MSG-${rand}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface SubmitResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitResult>> {
  console.log("===== [CONTACT] START =====");

  const limited = await rateLimitOrNull(request, "contact");
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));

    const nom = String(body.nom || "").trim();
    const email = String(body.email || "").trim();
    const telephone = String(body.telephone || "").trim();
    const sujet = String(body.sujet || "").trim();
    const message = String(body.message || "").trim();

    // Honeypot (champ caché côté client) — silencieusement OK pour ne pas
    // donner d'indice aux bots, mais on n'enregistre rien.
    const honeypot = String(body.website || "").trim();
    if (honeypot) {
      console.warn("[CONTACT] honeypot triggered, silent OK");
      return NextResponse.json({ success: true, reference: "—" });
    }

    if (!nom || nom.length < 2) {
      return NextResponse.json(
        { success: false, error: "Nom requis (2 caractères min.)" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "E-mail invalide" },
        { status: 400 }
      );
    }
    if (!sujet || sujet.length < 3) {
      return NextResponse.json(
        { success: false, error: "Sujet requis (3 caractères min.)" },
        { status: 400 }
      );
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { success: false, error: "Message requis (10 caractères min.)" },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Message trop long (5000 caractères max.)" },
        { status: 400 }
      );
    }

    const reference = generateReference();
    const admin = getAdminClient();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const ua = request.headers.get("user-agent") || null;

    // ─── Insert DB (service_role, bypass RLS) ──────────────────────────
    const { error: insertErr } = await admin.from("contacts").insert({
      reference,
      nom,
      email,
      telephone: telephone || null,
      sujet,
      message,
      ip,
      user_agent: ua,
      source: "site_web",
    });

    if (insertErr) {
      console.error("[CONTACT] insert error:", insertErr.message);
      return NextResponse.json(
        { success: false, error: `Enregistrement échoué : ${insertErr.message}` },
        { status: 500 }
      );
    }

    // ─── Emails ────────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Email staff
      const staffHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:24px 32px;">
            <p style="margin:0;color:#FF6600;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">📩 Nouveau message contact</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700;">${escapeHtml(sujet)}</h1>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">Référence : <strong style="color:#FF6600;">${escapeHtml(reference)}</strong></p>
          </td></tr>
          <tr><td style="padding:24px 32px;">
            <table cellspacing="0" cellpadding="6" border="0" width="100%" style="font-size:14px;">
              <tr><td style="color:#64748b;width:120px;">De</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(nom)}</td></tr>
              <tr><td style="color:#64748b;">Email</td><td><a href="mailto:${escapeHtml(email)}" style="color:#FF6600;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
              ${telephone ? `<tr><td style="color:#64748b;">Téléphone</td><td><a href="tel:${escapeHtml(telephone)}" style="color:#FF6600;text-decoration:none;">${escapeHtml(telephone)}</a></td></tr>` : ""}
            </table>
            <div style="margin-top:18px;padding:16px;background:#f8fafc;border-left:3px solid #FF6600;border-radius:8px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
              <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(message)}</p>
            </div>
            <div style="margin-top:24px;text-align:center;">
              <a href="mailto:${escapeHtml(email)}?subject=Re:%20${encodeURIComponent(sujet)}" style="display:inline-block;background:#FF6600;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Répondre par e-mail</a>
            </div>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:14px 32px;text-align:center;font-size:11px;color:#94a3b8;">NEXUS RCA · Bangui · ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>
        </table>
      </body></html>`;

      try {
        const r = await resend.emails.send({
          from: FROM_PRIMARY,
          to: STAFF_RECIPIENTS,
          replyTo: email,
          subject: `[Contact] ${sujet} — ${nom}`,
          html: staffHtml,
        });
        if (r.error) {
          console.error("[CONTACT] email staff primary error:", r.error);
          await resend.emails.send({
            from: FROM_FALLBACK,
            to: STAFF_RECIPIENTS,
            replyTo: email,
            subject: `[Contact] ${sujet} — ${nom}`,
            html: staffHtml,
          });
        }
      } catch (e) {
        console.error("[CONTACT] email staff exception:", e);
      }

      // Accusé réception client
      const clientHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Message bien reçu</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Référence : <strong style="color:#FF6600;">${escapeHtml(reference)}</strong></p>
          </td></tr>
          <tr><td style="padding:28px 32px;color:#0C1C40;">
            <p style="margin:0 0 14px;font-size:15px;">Bonjour <strong>${escapeHtml(nom)}</strong>,</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#475569;">Nous accusons bonne réception de votre message. Un conseiller Nexus RCA examine votre demande et vous répondra <strong>sous 24 à 48 h ouvrées</strong>.</p>
            <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Sujet</p>
              <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(sujet)}</p>
            </div>
            <p style="margin:0 0 6px;font-size:14px;line-height:1.65;color:#475569;">Pour une question urgente, vous pouvez aussi nous joindre :</p>
            <ul style="margin:0;padding-left:20px;font-size:14px;color:#475569;line-height:1.8;">
              <li>WhatsApp : <a href="https://wa.me/23673269692" style="color:#FF6600;text-decoration:none;">+236 73 26 96 92</a></li>
              <li>Téléphone Canada : <a href="tel:+15873276344" style="color:#FF6600;text-decoration:none;">+1 587 327 6344</a></li>
              <li>Email : <a href="mailto:contact@nexusrca.com" style="color:#FF6600;text-decoration:none;">contact@nexusrca.com</a></li>
            </ul>
            <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">Mentionnez votre référence <strong style="color:#FF6600;">${escapeHtml(reference)}</strong> lors de tout échange.</p>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:18px 32px;text-align:center;color:#94a3b8;font-size:12px;">NEXUS RCA · Bangui, République Centrafricaine<br/><span style="color:#64748b;font-size:11px;">Relais Sica, vers Hôpital Général · Sur rendez-vous</span></td></tr>
        </table>
      </body></html>`;

      try {
        const r = await resend.emails.send({
          from: FROM_PRIMARY,
          to: email,
          subject: `Votre message a bien été reçu — ${reference}`,
          html: clientHtml,
        });
        if (r.error) {
          console.error("[CONTACT] email client primary error:", r.error);
          await resend.emails.send({
            from: FROM_FALLBACK,
            to: email,
            subject: `Votre message a bien été reçu — ${reference}`,
            html: clientHtml,
          });
        }
      } catch (e) {
        console.error("[CONTACT] email client exception:", e);
      }
    } else {
      console.warn("[CONTACT] RESEND_API_KEY absente, skip emails");
    }

    console.log(`[CONTACT] ✅ ${reference} — ${nom} <${email}>`);
    return NextResponse.json({ success: true, reference });
  } catch (err) {
    console.error("[CONTACT] EXCEPTION:", err);
    const errMsg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
