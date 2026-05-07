import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  COVERAGE_LABELS,
  URGENCY_LABELS,
  type CoverageType,
  type QuoteFormData,
  type Urgency,
} from "@/lib/insurance/types";
import { computeDurationDays, estimate, formatRange } from "@/lib/insurance/pricing";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const STAFF_EMAIL = "contact@nexusrca.com";
const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";

const VALID_URGENCY: Urgency[] = ["normal", "urgent", "tres_urgent"];
const VALID_COVERAGES: CoverageType[] = [
  "schengen",
  "voyage_intl",
  "sante_intl",
  "etudes",
  "business",
];

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

const URGENCY_EMOJI: Record<Urgency, string> = {
  normal: "🟢",
  urgent: "🟠",
  tres_urgent: "🔴",
};

interface SubmitResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitResult>> {
  console.log("===== [INSURANCE_QUOTE] START =====");

  try {
    const body = (await request.json()) as Partial<QuoteFormData>;

    // ─── Validation ─────────────────────────────────────────────────────
    const full_name = (body.full_name || "").trim();
    const email = (body.email || "").trim();
    const whatsapp = (body.whatsapp || "").trim();
    const country_residence = (body.country_residence || "").trim();
    const destination = (body.destination || "").trim();
    const date_depart = (body.date_depart || "").trim();
    const date_retour = (body.date_retour || "").trim();
    const num_travelers = Number(body.num_travelers || 1);
    const traveler_ages = Array.isArray(body.traveler_ages)
      ? body.traveler_ages.map(Number).filter((n) => !isNaN(n))
      : [];
    const coverage_types = Array.isArray(body.coverage_types)
      ? body.coverage_types.filter((c): c is CoverageType =>
          VALID_COVERAGES.includes(c as CoverageType)
        )
      : [];
    const visa_certificate_required = Boolean(body.visa_certificate_required);
    const urgency: Urgency = VALID_URGENCY.includes(body.urgency as Urgency)
      ? (body.urgency as Urgency)
      : "normal";
    const comments = (body.comments || "").trim();

    if (!full_name || full_name.length < 3) {
      return NextResponse.json(
        { success: false, error: "Nom complet requis (3 caractères min.)" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email invalide" },
        { status: 400 }
      );
    }
    if (whatsapp.length < 6) {
      return NextResponse.json(
        { success: false, error: "Numéro WhatsApp requis" },
        { status: 400 }
      );
    }
    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination requise" },
        { status: 400 }
      );
    }
    if (num_travelers < 1 || num_travelers > 50) {
      return NextResponse.json(
        { success: false, error: "Nombre de voyageurs invalide" },
        { status: 400 }
      );
    }
    if (coverage_types.length === 0) {
      return NextResponse.json(
        { success: false, error: "Au moins un type de couverture requis" },
        { status: 400 }
      );
    }

    // ─── Calculs dérivés ────────────────────────────────────────────────
    const duration_days = computeDurationDays(date_depart, date_retour);
    const formData: QuoteFormData = {
      full_name,
      email,
      whatsapp,
      country_residence,
      destination,
      date_depart,
      date_retour,
      num_travelers,
      traveler_ages,
      coverage_types,
      visa_certificate_required,
      urgency,
      comments,
      acceptation: true,
    };
    const est = estimate(formData);

    // ─── Insert Supabase ────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const ua = request.headers.get("user-agent") || null;
    const referer = request.headers.get("referer") || null;

    const admin = getAdminClient();
    const { data: inserted, error: insertErr } = await admin
      .from("insurance_quotes")
      .insert({
        full_name,
        email,
        whatsapp,
        country_residence: country_residence || null,
        destination,
        date_depart: date_depart || null,
        date_retour: date_retour || null,
        duration_days,
        num_travelers,
        traveler_ages,
        coverage_types,
        visa_certificate_required,
        urgency,
        comments: comments || null,
        estimate_min: est?.min || null,
        estimate_max: est?.max || null,
        estimate_currency: est?.currency || "EUR",
        status: "recu",
        source_ip: ip,
        source_url: referer,
        user_agent: ua,
      })
      .select("reference")
      .single();

    if (insertErr || !inserted?.reference) {
      console.error("[INSURANCE_QUOTE] insert error:", insertErr?.message);
      return NextResponse.json(
        {
          success: false,
          error: `Enregistrement échoué : ${insertErr?.message || "inconnu"}`,
        },
        { status: 500 }
      );
    }

    const reference = inserted.reference as string;
    console.log(`[INSURANCE_QUOTE] ✅ ${reference}`);

    // ─── Emails Resend ───────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const coverageList = coverage_types
        .map((c) => COVERAGE_LABELS[c])
        .join(" · ");

      // ─── Email staff ────────────────────────────────────────────────
      const staffHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:24px 32px;">
            <p style="margin:0;color:#FF6600;font-size:11px;font-weight:700;letter-spacing:0.1em;">${URGENCY_EMOJI[urgency]} URGENCE ${URGENCY_LABELS[urgency].split(" — ")[0].toUpperCase()}</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:20px;">Nouveau devis assurance — ${escapeHtml(reference)}</h1>
          </td></tr>
          <tr><td style="padding:24px 32px;">
            <table cellspacing="0" cellpadding="6" border="0" width="100%" style="font-size:14px;">
              <tr><td style="color:#64748b;width:140px;">Nom</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(full_name)}</td></tr>
              <tr><td style="color:#64748b;">Email</td><td style="color:#0C1C40;"><a href="mailto:${escapeHtml(email)}" style="color:#FF6600;">${escapeHtml(email)}</a></td></tr>
              <tr><td style="color:#64748b;">WhatsApp</td><td style="color:#0C1C40;"><a href="https://wa.me/${escapeHtml(whatsapp.replace(/[^0-9]/g, ""))}" style="color:#FF6600;">${escapeHtml(whatsapp)}</a></td></tr>
              <tr><td style="color:#64748b;">Pays résidence</td><td style="color:#0C1C40;">${escapeHtml(country_residence || "—")}</td></tr>
              <tr><td style="color:#64748b;">Destination</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(destination)}</td></tr>
              <tr><td style="color:#64748b;">Période</td><td style="color:#0C1C40;">${escapeHtml(date_depart || "—")} → ${escapeHtml(date_retour || "—")}${duration_days ? ` (${duration_days} j)` : ""}</td></tr>
              <tr><td style="color:#64748b;">Voyageurs</td><td style="color:#0C1C40;">${num_travelers} (${traveler_ages.join(", ")} ans)</td></tr>
              <tr><td style="color:#64748b;vertical-align:top;">Couvertures</td><td style="color:#0C1C40;">${escapeHtml(coverageList)}</td></tr>
              <tr><td style="color:#64748b;">Certificat visa</td><td style="color:#0C1C40;">${visa_certificate_required ? "Oui" : "Non"}</td></tr>
              <tr><td style="color:#64748b;">Estimation</td><td style="color:#0C1C40;font-weight:600;">${est ? escapeHtml(formatRange(est)) : "—"}</td></tr>
              ${comments ? `<tr><td style="color:#64748b;vertical-align:top;">Commentaires</td><td style="color:#475569;">${escapeHtml(comments).replace(/\n/g, "<br>")}</td></tr>` : ""}
            </table>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:14px 32px;text-align:center;font-size:11px;color:#94a3b8;">NEXUS RCA — Bangui · Cabinet de courtage assurance</td></tr>
        </table>
      </body></html>`;

      try {
        const r = await resend.emails.send({
          from: FROM_PRIMARY,
          to: STAFF_EMAIL,
          subject: `${URGENCY_EMOJI[urgency]} Devis assurance ${reference} — ${full_name} → ${destination}`,
          html: staffHtml,
        });
        if (r.error) {
          console.error("[INSURANCE_QUOTE] email staff primary error:", r.error);
          await resend.emails.send({
            from: FROM_FALLBACK,
            to: STAFF_EMAIL,
            subject: `${URGENCY_EMOJI[urgency]} Devis assurance ${reference}`,
            html: staffHtml,
          });
        }
      } catch (e) {
        console.error("[INSURANCE_QUOTE] email staff exception:", e);
      }

      // ─── Email client ────────────────────────────────────────────────
      const clientHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:32px;text-align:center;">
            <div style="display:inline-block;padding:8px 16px;background:rgba(255,102,0,0.15);border:1px solid rgba(255,102,0,0.4);border-radius:999px;color:#FF6600;font-size:10px;font-weight:700;letter-spacing:0.18em;">PROTECTION INTERNATIONALE</div>
            <h1 style="margin:18px 0 0;color:#fff;font-size:24px;">Devis assurance reçu ✓</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Référence : <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(reference)}</strong></p>
          </td></tr>
          <tr><td style="padding:28px 32px;color:#0C1C40;">
            <p style="margin:0 0 14px;">Bonjour <strong>${escapeHtml(full_name)}</strong>,</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
              Votre dossier a été enregistré dans notre système et est désormais en cours de traitement par notre cabinet de courtage assurance.
            </p>
            <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#64748b;">RÉCAPITULATIF DU DOSSIER</p>
                <table cellspacing="0" cellpadding="4" border="0" width="100%" style="font-size:13px;">
                  <tr><td style="color:#64748b;width:140px;">Destination</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(destination)}</td></tr>
                  ${date_depart && date_retour ? `<tr><td style="color:#64748b;">Période</td><td style="color:#0C1C40;">${escapeHtml(date_depart)} → ${escapeHtml(date_retour)}</td></tr>` : ""}
                  <tr><td style="color:#64748b;">Voyageurs</td><td style="color:#0C1C40;">${num_travelers}</td></tr>
                  <tr><td style="color:#64748b;vertical-align:top;">Couvertures</td><td style="color:#0C1C40;">${escapeHtml(coverageList)}</td></tr>
                  <tr><td style="color:#64748b;">Estimation indicative</td><td style="color:#FF6600;font-weight:700;">${est ? escapeHtml(formatRange(est)) : "Sur étude"}</td></tr>
                </table>
              </td></tr>
            </table>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
              <strong>Prochaines étapes :</strong> nos courtiers vont analyser votre profil et sélectionner les assureurs partenaires les plus adaptés. Un devis détaillé vous sera transmis ${urgency === "tres_urgent" ? "<strong>sous 24 h ouvrées</strong>" : urgency === "urgent" ? "<strong>sous 48 h ouvrées</strong>" : "<strong>sous 3 jours ouvrés</strong>"}.
            </p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
              Vous pouvez suivre l'avancement de votre dossier à tout moment :
            </p>
            <p style="margin:0 0 24px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com"}/services/assurance/devis/${escapeHtml(reference)}" style="display:inline-block;padding:12px 24px;background:#FF6600;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Suivre mon dossier →</a>
            </p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
              Pour toute question : <a href="https://wa.me/23673269692?text=R%C3%A9f%20${encodeURIComponent(reference)}" style="color:#FF6600;">WhatsApp +236 73 26 96 92</a> · <a href="mailto:contact@nexusrca.com" style="color:#FF6600;">contact@nexusrca.com</a>
            </p>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:18px 32px;text-align:center;color:#94a3b8;font-size:11px;line-height:1.5;">
            NEXUS RCA · Cabinet de courtage assurance · Bangui<br/>
            Le tarif définitif sera communiqué après étude du dossier.
          </td></tr>
        </table>
      </body></html>`;

      try {
        await resend.emails.send({
          from: FROM_PRIMARY,
          to: email,
          subject: `Devis assurance reçu — ${reference}`,
          html: clientHtml,
        });
      } catch (e) {
        console.error("[INSURANCE_QUOTE] email client exception:", e);
      }
    } else {
      console.warn("[INSURANCE_QUOTE] RESEND_API_KEY absente, skip emails");
    }

    return NextResponse.json({ success: true, reference });
  } catch (err) {
    console.error("[INSURANCE_QUOTE] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
