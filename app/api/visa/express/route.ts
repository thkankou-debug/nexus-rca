import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendWhatsAppMulti } from "@/lib/whatsapp";
import { tplVisaExpressStaff } from "@/lib/whatsapp-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const STORAGE_BUCKET = "visa-uploads";
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const VALID_URGENCE = ["normal", "urgent", "critique"] as const;
const STAFF_EMAIL = "contact@nexusrca.com";

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
  // NX-VISA-XXXXXX (6 hex chars)
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `NX-VISA-${rand}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const URGENCE_LABEL: Record<string, string> = {
  normal: "Normal",
  urgent: "Urgent (sous 7 jours)",
  critique: "Critique (sous 48 h)",
};

const URGENCE_EMOJI: Record<string, string> = {
  normal: "🟢",
  urgent: "🟠",
  critique: "🔴",
};

interface SubmitResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SubmitResult>> {
  console.log("===== [VISA_EXPRESS] START =====");

  try {
    const formData = await request.formData();

    // ─── Validation des champs texte ───────────────────────────────────
    const nom = (formData.get("nom_complet") as string | null)?.trim() || "";
    const email = (formData.get("email") as string | null)?.trim() || "";
    const whatsapp = (formData.get("whatsapp") as string | null)?.trim() || "";
    const pays = (formData.get("pays_destination") as string | null)?.trim() || "";
    const type_visa = (formData.get("type_visa") as string | null)?.trim() || "";
    const urgence = ((formData.get("urgence") as string | null) || "normal").trim();
    const notes = ((formData.get("notes") as string | null) || "").trim();

    if (!nom || nom.length < 3) {
      return NextResponse.json(
        { success: false, error: "Nom requis (3 caractères min.)" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "E-mail invalide" },
        { status: 400 }
      );
    }
    if (!whatsapp || whatsapp.length < 6) {
      return NextResponse.json(
        { success: false, error: "Numéro WhatsApp requis" },
        { status: 400 }
      );
    }
    if (!pays) {
      return NextResponse.json(
        { success: false, error: "Pays de destination requis" },
        { status: 400 }
      );
    }
    if (!type_visa) {
      return NextResponse.json(
        { success: false, error: "Type de visa requis" },
        { status: 400 }
      );
    }
    if (!VALID_URGENCE.includes(urgence as (typeof VALID_URGENCE)[number])) {
      return NextResponse.json(
        { success: false, error: "Niveau d'urgence invalide" },
        { status: 400 }
      );
    }

    // ─── Validation des fichiers ───────────────────────────────────────
    const files = formData.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_FILES} fichiers` },
        { status: 400 }
      );
    }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `${f.name} dépasse ${MAX_FILE_SIZE / 1024 / 1024} MB`,
          },
          { status: 400 }
        );
      }
      if (!ALLOWED_MIME.includes(f.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `${f.name} : format non accepté (PDF, JPG ou PNG uniquement)`,
          },
          { status: 400 }
        );
      }
    }

    const reference = generateReference();
    const admin = getAdminClient();
    console.log(`[VISA_EXPRESS] reference=${reference} files=${files.length} urgence=${urgence}`);

    // ─── Upload Storage ────────────────────────────────────────────────
    const uploadedPaths: string[] = [];
    for (const f of files) {
      const ext = f.name.split(".").pop() || "bin";
      const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
      const path = `${reference}/${Date.now()}-${safeName}`;
      const buffer = Buffer.from(await f.arrayBuffer());

      const { error: upErr } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(path, buffer, {
          contentType: f.type,
          upsert: false,
        });

      if (upErr) {
        console.error("[VISA_EXPRESS] upload error:", upErr.message);
        return NextResponse.json(
          { success: false, error: `Upload échoué : ${upErr.message}` },
          { status: 500 }
        );
      }
      uploadedPaths.push(path);
    }

    // ─── Insert en DB ──────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const ua = request.headers.get("user-agent") || null;

    const { error: insertErr } = await admin
      .from("visa_express_requests")
      .insert({
        reference,
        nom_complet: nom,
        email,
        whatsapp,
        pays_destination: pays,
        type_visa,
        urgence,
        notes: notes || null,
        document_paths: uploadedPaths,
        ip,
        user_agent: ua,
      });

    if (insertErr) {
      console.error("[VISA_EXPRESS] insert error:", insertErr.message);
      return NextResponse.json(
        { success: false, error: `Enregistrement échoué : ${insertErr.message}` },
        { status: 500 }
      );
    }

    // ─── Génération signed URLs (7 jours) pour le mail staff ──────────
    const signedUrls: { name: string; url: string }[] = [];
    for (const path of uploadedPaths) {
      const { data: urlData } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, 7 * 24 * 60 * 60);
      if (urlData?.signedUrl) {
        signedUrls.push({ name: path.split("/").pop() || path, url: urlData.signedUrl });
      }
    }

    // ─── Emails ────────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const staffHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:24px 32px;">
            <p style="margin:0;color:#FF6600;font-size:11px;font-weight:700;letter-spacing:0.1em;">${URGENCE_EMOJI[urgence]} URGENCE ${URGENCE_LABEL[urgence].toUpperCase()}</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:20px;">Demande visa express — ${escapeHtml(reference)}</h1>
          </td></tr>
          <tr><td style="padding:24px 32px;">
            <table cellspacing="0" cellpadding="6" border="0" width="100%" style="font-size:14px;">
              <tr><td style="color:#64748b;width:120px;">Nom</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(nom)}</td></tr>
              <tr><td style="color:#64748b;">Email</td><td style="color:#0C1C40;"><a href="mailto:${escapeHtml(email)}" style="color:#FF6600;">${escapeHtml(email)}</a></td></tr>
              <tr><td style="color:#64748b;">WhatsApp</td><td style="color:#0C1C40;"><a href="https://wa.me/${escapeHtml(whatsapp.replace(/[^0-9]/g, ""))}" style="color:#FF6600;">${escapeHtml(whatsapp)}</a></td></tr>
              <tr><td style="color:#64748b;">Destination</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(pays)}</td></tr>
              <tr><td style="color:#64748b;">Type visa</td><td style="color:#0C1C40;">${escapeHtml(type_visa)}</td></tr>
              <tr><td style="color:#64748b;vertical-align:top;">Notes</td><td style="color:#475569;">${notes ? escapeHtml(notes).replace(/\n/g, "<br>") : "<em>—</em>"}</td></tr>
            </table>
            ${signedUrls.length > 0 ? `<div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;">📎 PIÈCES JOINTES (${signedUrls.length}) — liens valides 7 jours</p>${signedUrls.map((u) => `<div style="margin:4px 0;"><a href="${u.url}" style="color:#FF6600;font-size:13px;">📄 ${escapeHtml(u.name)}</a></div>`).join("")}</div>` : ""}
          </td></tr>
          <tr><td style="background:#0C1C40;padding:14px 32px;text-align:center;font-size:11px;color:#94a3b8;">NEXUS RCA — Bangui</td></tr>
        </table>
      </body></html>`;

      try {
        const r = await resend.emails.send({
          from: FROM_PRIMARY,
          to: STAFF_EMAIL,
          subject: `${URGENCE_EMOJI[urgence]} Visa express ${reference} — ${nom} → ${pays}`,
          html: staffHtml,
        });
        if (r.error) {
          console.error("[VISA_EXPRESS] email staff primary error:", r.error);
          await resend.emails.send({
            from: FROM_FALLBACK,
            to: STAFF_EMAIL,
            subject: `${URGENCE_EMOJI[urgence]} Visa express ${reference}`,
            html: staffHtml,
          });
        }
      } catch (e) {
        console.error("[VISA_EXPRESS] email staff exception:", e);
      }

      // Accusé réception client
      const clientHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;">Demande reçue ✓</h1>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Référence : <strong style="color:#FF6600;">${escapeHtml(reference)}</strong></p>
          </td></tr>
          <tr><td style="padding:28px 32px;color:#0C1C40;">
            <p style="margin:0 0 14px;">Bonjour <strong>${escapeHtml(nom)}</strong>,</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">Nous avons bien reçu votre demande visa express pour <strong>${escapeHtml(pays)}</strong>. Un conseiller Nexus revient vers vous ${urgence === "critique" ? "<strong>sous 24 h ouvrées</strong>" : urgence === "urgent" ? "sous 48 h ouvrées" : "sous 3 jours ouvrés"}.</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">Vous pouvez nous joindre à tout moment via WhatsApp au <a href="https://wa.me/23673269692" style="color:#FF6600;">+236 73 26 96 92</a> en mentionnant votre référence.</p>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:18px 32px;text-align:center;color:#94a3b8;font-size:12px;">NEXUS RCA · contact@nexusrca.com · +236 73 26 96 92</td></tr>
        </table>
      </body></html>`;

      try {
        await resend.emails.send({
          from: FROM_PRIMARY,
          to: email,
          subject: `Demande visa reçue — ${reference}`,
          html: clientHtml,
        });
      } catch (e) {
        console.error("[VISA_EXPRESS] email client exception:", e);
      }
    } else {
      console.warn("[VISA_EXPRESS] RESEND_API_KEY absente, skip emails");
    }

    console.log(`[VISA_EXPRESS] ✅ ${reference}`);

    // ─── WHATSAPP — alerte staff (best-effort silencieux) ────────────────
    const staffWhatsApp = (
      process.env.WHATSAPP_STAFF_RECIPIENTS || "+23673269692"
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    void sendWhatsAppMulti(
      staffWhatsApp,
      tplVisaExpressStaff({
        nomClient: nom,
        pays,
        typeVisa: type_visa,
        urgence,
        reference,
        whatsappClient: whatsapp,
      }),
      "visa-express-staff"
    );

    return NextResponse.json({ success: true, reference });
  } catch (err) {
    console.error("[VISA_EXPRESS] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
