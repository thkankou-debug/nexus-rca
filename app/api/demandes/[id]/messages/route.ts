import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { content?: string };
    const content = (body.content || "").trim();
    if (!content) {
      return NextResponse.json(
        { success: false, error: "Message vide" },
        { status: 400 }
      );
    }
    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Message trop long (max 1000 caractères)" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, nom, prenom, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil introuvable" },
        { status: 401 }
      );
    }

    const admin = getAdminClient();
    const demandeId = params.id;

    // Verify access
    const { data: demande } = await admin
      .from("demandes")
      .select("id, reference, client_id, agent_id, email, nom_complet")
      .eq("id", demandeId)
      .single();

    if (!demande) {
      return NextResponse.json(
        { success: false, error: "Demande introuvable" },
        { status: 404 }
      );
    }

    const role = (profile as { role: string }).role;
    const isStaff = role === "agent" || role === "admin" || role === "super_admin";
    const isOwner =
      demande.client_id === user.id ||
      (demande.email &&
        (profile as { email?: string }).email?.toLowerCase().trim() ===
          (demande as { email: string }).email.toLowerCase().trim());

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    const authorName =
      [
        (profile as { prenom?: string }).prenom,
        (profile as { nom?: string }).nom,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      (profile as { email?: string }).email ||
      "Utilisateur";

    const { data: message, error: insertErr } = await admin
      .from("demande_messages")
      .insert({
        demande_id: demandeId,
        author_id: user.id,
        author_name: authorName,
        author_role: role,
        content,
      })
      .select("id, created_at")
      .single();

    if (insertErr || !message) {
      console.error("[MESSAGES] insert error:", insertErr?.message);
      return NextResponse.json(
        { success: false, error: insertErr?.message || "Erreur d'enregistrement" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "message_sent",
      entityType: "demande_messages",
      entityId: (message as { id: string }).id,
      newValue: { demande_id: demandeId, author_name: authorName, content },
    });

    // Notify the other party via Resend (best-effort)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";

        let recipientEmail: string | null = null;
        let recipientLink = `${siteUrl}/dashboard/client/demandes/${demandeId}`;

        if (isStaff) {
          // Staff sent → notify client
          recipientEmail = (demande as { email: string }).email;
          recipientLink = `${siteUrl}/dashboard/client/demandes/${demandeId}`;
        } else {
          // Client sent → notify assigned agent (or generic staff inbox)
          if ((demande as { agent_id?: string }).agent_id) {
            const { data: agent } = await admin
              .from("profiles")
              .select("email")
              .eq("id", (demande as { agent_id: string }).agent_id)
              .single();
            recipientEmail = (agent as { email?: string } | null)?.email || null;
          }
          if (!recipientEmail) recipientEmail = "contact@nexusrca.com";
          recipientLink = `${siteUrl}/dashboard/agent/demandes`;
        }

        if (recipientEmail) {
          const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
            <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
              <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:24px 32px;">
                <p style="margin:0;color:#FF6600;font-size:11px;font-weight:700;letter-spacing:0.18em;">💬 NOUVEAU MESSAGE</p>
                <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">Dossier <strong style="color:#FF6600;font-family:monospace;">${escapeHtml((demande as { reference: string }).reference)}</strong></p>
              </td></tr>
              <tr><td style="padding:24px 32px;color:#0C1C40;">
                <p style="margin:0 0 14px;font-size:14px;">De <strong>${escapeHtml(authorName)}</strong> :</p>
                <div style="margin:14px 0;padding:14px 18px;background:#f8fafc;border-left:4px solid #FF6600;border-radius:6px;font-size:14px;line-height:1.6;color:#334155;">
                  ${escapeHtml(content).replace(/\n/g, "<br>")}
                </div>
                <p style="margin:18px 0 0;text-align:center;">
                  <a href="${recipientLink}" style="display:inline-block;padding:10px 22px;background:#FF6600;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px;">Répondre →</a>
                </p>
              </td></tr>
              <tr><td style="background:#0C1C40;padding:14px 32px;text-align:center;font-size:11px;color:#94a3b8;">NEXUS RCA — Messagerie dossier</td></tr>
            </table>
          </body></html>`;
          const subj = `💬 Message ${(demande as { reference: string }).reference} — ${authorName}`;
          const r = await resend.emails.send({
            from: FROM_PRIMARY,
            to: recipientEmail,
            subject: subj,
            html,
          });
          if (r.error) {
            await resend.emails.send({
              from: FROM_FALLBACK,
              to: recipientEmail,
              subject: subj,
              html,
            });
          }
        }
      } catch (e) {
        console.error("[MESSAGES] notify exception:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message_id: (message as { id: string }).id,
      created_at: (message as { created_at: string }).created_at,
    });
  } catch (err) {
    console.error("[MESSAGES] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
