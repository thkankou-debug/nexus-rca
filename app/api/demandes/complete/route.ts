import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { rateLimitOrNull } from "@/lib/rate-limit";
import {
  DEFAULT_FORM_VALUES_COMPLETE,
  DOCUMENT_CATEGORIES,
  validateFinal,
  type DemandeCompletePayload,
  type DocumentCategorie,
} from "@/lib/demande-complete-form";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STAFF_EMAIL = "contact@nexusrca.com";
const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";
const STORAGE_BUCKET = "demande-documents";

const VALID_CATEGORIES = DOCUMENT_CATEGORIES.map((c) => c.value) as DocumentCategorie[];

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

interface SubmitResult {
  success: boolean;
  reference?: string;
  demande_id?: string;
  account_created?: boolean;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitResult>> {
  console.log("===== [DEMANDE_COMPLETE] START =====");

  const limited = await rateLimitOrNull(request, "demandes-complete");
  if (limited) return limited;

  try {
    const formData = await request.formData();
    const payloadJson = formData.get("payload") as string | null;
    if (!payloadJson) {
      return NextResponse.json(
        { success: false, error: "Payload manquant" },
        { status: 400 }
      );
    }

    let payload: DemandeCompletePayload;
    try {
      payload = JSON.parse(payloadJson) as DemandeCompletePayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Payload JSON invalide" },
        { status: 400 }
      );
    }

    // Merge avec defaults pour s'assurer que toutes les clés existent
    const form: DemandeCompletePayload = {
      ...DEFAULT_FORM_VALUES_COMPLETE,
      ...payload,
    };

    // Validation finale
    const errors = validateFinal(form);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      return NextResponse.json(
        { success: false, error: firstError || "Champs invalides" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // ─── Création/récupération du compte client ────────────────────────────
    let clientProfileId: string | null = null;
    let accountCreated = false;

    if (form.identification_mode === "nouveau") {
      // Vérifier si l'email existe déjà dans auth.users (via profiles qui sync)
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("email", form.email.toLowerCase().trim())
        .maybeSingle();

      if (existing) {
        // Email déjà associé à un compte → erreur explicite 409
        return NextResponse.json(
          {
            success: false,
            error:
              "Cet email est déjà associé à un compte. Veuillez vous connecter.",
          },
          { status: 409 }
        );
      }

      // Vérifier que le mot de passe est fourni (sécurité côté serveur)
      if (!form.password || form.password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "Mot de passe requis (minimum 8 caractères).",
          },
          { status: 400 }
        );
      }

      // Création compte via service_role (admin API — pas de confirmation email)
      // avec le mot de passe choisi par le client lui-même
      const splitName = form.nom_complet.trim().split(/\s+/);
      const prenom = splitName.length > 1 ? splitName.slice(0, -1).join(" ") : "";
      const nom = splitName.length > 1 ? splitName[splitName.length - 1] : form.nom_complet;

      const { data: newUser, error: signupErr } =
        await admin.auth.admin.createUser({
          email: form.email.toLowerCase().trim(),
          password: form.password,
          email_confirm: true,
          user_metadata: { nom, prenom },
        });

      if (signupErr || !newUser?.user) {
        console.error("[DEMANDE_COMPLETE] signup error:", signupErr?.message);
        return NextResponse.json(
          {
            success: false,
            error: `Création de compte échouée : ${signupErr?.message || "inconnu"}`,
          },
          { status: 500 }
        );
      }

      clientProfileId = newUser.user.id;
      accountCreated = true;

      // Mettre à jour le profile avec téléphone et pays (le trigger Supabase
      // a déjà créé une ligne profiles via handle_new_user)
      await admin
        .from("profiles")
        .update({
          telephone: form.telephone,
          pays: form.pays,
        })
        .eq("id", clientProfileId);

      // Créer l'entrée `clients` (table métier B2B/particulier)
      await admin.from("clients").insert({
        type: "particulier",
        nom,
        prenom,
        email: form.email.toLowerCase().trim(),
        telephone: form.telephone,
        adresse: form.adresse,
        ville: form.ville,
        pays: form.pays,
        profile_id: clientProfileId,
      });
    } else if (form.identification_mode === "deja_client") {
      // Récupérer l'utilisateur authentifié via les cookies (createServerClient)
      // Pour simplifier, on cherche par email
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", form.email.toLowerCase().trim())
        .maybeSingle();
      if (existingProfile) {
        clientProfileId = existingProfile.id;
      }
    }

    // ─── Insert dans `demandes` (référence auto via trigger SQL) ───────────
    const { data: inserted, error: insertErr } = await admin
      .from("demandes")
      .insert({
        client_id: clientProfileId,
        nom_complet: form.nom_complet,
        sexe: form.sexe || null,
        date_naissance: form.date_naissance || null,
        nationalite: form.nationalite || null,
        pays: form.pays,
        ville: form.ville || null,
        adresse: form.adresse || null,
        telephone: form.telephone,
        email: form.email.toLowerCase().trim(),
        situation_matrimoniale: form.situation_matrimoniale || null,
        profession: form.profession || null,
        employeur: form.employeur || null,
        niveau_etudes: form.niveau_etudes || null,
        service: form.service,
        categorie_demande: form.categorie_demande || null,
        pays_concerne: form.pays_concerne || null,
        type_procedure: form.type_procedure || null,
        date_souhaitee: form.date_souhaitee || null,
        dossier_existant: form.dossier_existant,
        numero_dossier_existant: form.dossier_existant
          ? form.numero_dossier_existant
          : null,
        details_service: form.details_service,
        informations_complementaires: form.informations_complementaires || null,
        objet: `${form.service} — ${form.categorie_demande}`,
        description: form.informations_complementaires || form.type_procedure,
        urgence: "normale",
        source: "formulaire_complet_v4",
        consentement_examen: form.consentement_examen,
        consentement_documents: form.consentement_documents,
        consentement_recontact: form.consentement_recontact,
        statut: "nouveau",
      })
      .select("id, reference")
      .single();

    if (insertErr || !inserted) {
      console.error("[DEMANDE_COMPLETE] insert error:", insertErr?.message);
      return NextResponse.json(
        {
          success: false,
          error: `Enregistrement échoué : ${insertErr?.message || "inconnu"}`,
        },
        { status: 500 }
      );
    }

    const demandeId = inserted.id as string;
    const reference = inserted.reference as string;
    console.log(`[DEMANDE_COMPLETE] ✅ ${reference} (id=${demandeId})`);

    // ─── Upload documents par catégorie ────────────────────────────────────
    const uploadErrors: string[] = [];
    let totalUploaded = 0;

    for (const cat of VALID_CATEGORIES) {
      const files = formData.getAll(`documents_${cat}`).filter(
        (f): f is File => f instanceof File && f.size > 0
      );
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
        const path = `${demandeId}/${cat}/${crypto.randomUUID()}-${safeName}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: upErr } = await admin.storage
          .from(STORAGE_BUCKET)
          .upload(path, buffer, {
            contentType: file.type || undefined,
            upsert: false,
          });

        if (upErr) {
          console.error("[DEMANDE_COMPLETE] upload error:", upErr.message);
          uploadErrors.push(`${file.name} : ${upErr.message}`);
          continue;
        }

        await admin.from("demande_documents").insert({
          demande_id: demandeId,
          uploaded_by: clientProfileId,
          storage_path: path,
          file_name: file.name,
          file_size_bytes: file.size,
          mime_type: file.type || "application/octet-stream",
          categorie: cat,
        });

        totalUploaded++;
      }
    }

    // ─── Logs anti-spam ────────────────────────────────────────────────────
    if (ip) {
      console.log(`[DEMANDE_COMPLETE] from IP ${ip} — ${totalUploaded} files`);
    }

    // ─── Emails Resend ──────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";

      // ─── Email client ─────────────────────────────────────────────────
      const accountInfoBlock = accountCreated
        ? `<table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;background:#ecfdf5;border-radius:12px;border:1px solid #a7f3d0;">
              <tr><td style="padding:18px 20px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#065f46;">VOTRE COMPTE NEXUS CONNECT</p>
                <p style="margin:0 0 6px;font-size:13px;color:#064e3b;">Votre compte a été créé. Connectez-vous avec l'email et le mot de passe que vous avez choisis.</p>
                <p style="margin:8px 0 0;font-size:12px;color:#064e3b;"><strong>Email :</strong> ${escapeHtml(form.email)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#065f46;">Vous êtes déjà connecté depuis le formulaire — vous pouvez fermer cet onglet ou vous reconnecter via <a href="${siteUrl}/login" style="color:#065f46;">${siteUrl}/login</a>.</p>
              </td></tr>
            </table>`
        : "";

      const clientHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:32px;text-align:center;">
            <div style="display:inline-block;padding:6px 14px;background:rgba(255,102,0,0.15);border:1px solid rgba(255,102,0,0.4);border-radius:999px;color:#FF6600;font-size:10px;font-weight:700;letter-spacing:0.18em;">DOSSIER ENREGISTRÉ</div>
            <h1 style="margin:18px 0 0;color:#fff;font-size:22px;">Demande reçue</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Référence : <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(reference)}</strong></p>
          </td></tr>
          <tr><td style="padding:28px 32px;color:#0C1C40;">
            <p style="margin:0 0 14px;">Bonjour <strong>${escapeHtml(form.nom_complet)}</strong>,</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
              Votre dossier a été enregistré dans notre système. Un conseiller Nexus RCA va l'examiner et vous reviendra sous 24 h ouvrées.
            </p>
            ${accountInfoBlock}
            <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#64748b;">RÉCAPITULATIF</p>
                <table cellspacing="0" cellpadding="4" border="0" width="100%" style="font-size:13px;">
                  <tr><td style="color:#64748b;width:140px;">Service</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(form.service)}</td></tr>
                  <tr><td style="color:#64748b;">Catégorie</td><td style="color:#0C1C40;">${escapeHtml(form.categorie_demande || "—")}</td></tr>
                  <tr><td style="color:#64748b;">Pays concerné</td><td style="color:#0C1C40;">${escapeHtml(form.pays_concerne || "—")}</td></tr>
                  <tr><td style="color:#64748b;">Documents</td><td style="color:#0C1C40;">${totalUploaded} fichier(s) joint(s)</td></tr>
                </table>
              </td></tr>
            </table>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
              Vous pouvez compléter votre dossier ou ajouter des documents à tout moment depuis votre espace Nexus Connect.
            </p>
            <p style="margin:0 0 20px;text-align:center;">
              <a href="${siteUrl}/dashboard/client/demandes/${demandeId}" style="display:inline-block;padding:12px 24px;background:#FF6600;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Suivre mon dossier →</a>
            </p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
              Pour toute question : <a href="https://wa.me/23673269692?text=R%C3%A9f%20${encodeURIComponent(reference)}" style="color:#FF6600;">WhatsApp +236 73 26 96 92</a> · <a href="mailto:contact@nexusrca.com" style="color:#FF6600;">contact@nexusrca.com</a>
            </p>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:18px 32px;text-align:center;color:#94a3b8;font-size:11px;line-height:1.5;">
            NEXUS RCA · Bangui, République Centrafricaine<br/>
            Suivi de dossier 24/7 sur Nexus Connect
          </td></tr>
        </table>
      </body></html>`;

      try {
        const r = await resend.emails.send({
          from: FROM_PRIMARY,
          to: form.email,
          subject: `Dossier reçu — ${reference}`,
          html: clientHtml,
        });
        if (r.error) {
          console.error("[DEMANDE_COMPLETE] email client primary error:", r.error);
          await resend.emails.send({
            from: FROM_FALLBACK,
            to: form.email,
            subject: `Dossier reçu — ${reference}`,
            html: clientHtml,
          });
        }
      } catch (e) {
        console.error("[DEMANDE_COMPLETE] email client exception:", e);
      }

      // ─── Email staff ──────────────────────────────────────────────────
      const staffHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:24px 32px;">
            <p style="margin:0;color:#FF6600;font-size:11px;font-weight:700;letter-spacing:0.1em;">🔔 NOUVEAU DOSSIER</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:20px;">${escapeHtml(reference)}</h1>
          </td></tr>
          <tr><td style="padding:24px 32px;">
            <table cellspacing="0" cellpadding="6" border="0" width="100%" style="font-size:14px;">
              <tr><td style="color:#64748b;width:140px;">Référence</td><td style="color:#0C1C40;font-family:monospace;font-weight:600;">${escapeHtml(reference)}</td></tr>
              <tr><td style="color:#64748b;">Demandeur</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(form.nom_complet)}</td></tr>
              <tr><td style="color:#64748b;">Email</td><td style="color:#0C1C40;"><a href="mailto:${escapeHtml(form.email)}" style="color:#FF6600;">${escapeHtml(form.email)}</a></td></tr>
              <tr><td style="color:#64748b;">Téléphone</td><td style="color:#0C1C40;"><a href="https://wa.me/${escapeHtml(form.telephone.replace(/[^0-9]/g, ""))}" style="color:#FF6600;">${escapeHtml(form.telephone)}</a></td></tr>
              <tr><td style="color:#64748b;">Pays / Ville</td><td style="color:#0C1C40;">${escapeHtml(form.pays)} / ${escapeHtml(form.ville)}</td></tr>
              <tr><td style="color:#64748b;">Service</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(form.service)}</td></tr>
              <tr><td style="color:#64748b;">Catégorie</td><td style="color:#0C1C40;">${escapeHtml(form.categorie_demande || "—")}</td></tr>
              <tr><td style="color:#64748b;">Pays concerné</td><td style="color:#0C1C40;">${escapeHtml(form.pays_concerne || "—")}</td></tr>
              <tr><td style="color:#64748b;">Type procédure</td><td style="color:#0C1C40;">${escapeHtml(form.type_procedure || "—")}</td></tr>
              <tr><td style="color:#64748b;">Date prévue</td><td style="color:#0C1C40;">${escapeHtml(form.date_souhaitee || "—")}</td></tr>
              <tr><td style="color:#64748b;">Documents</td><td style="color:#0C1C40;font-weight:600;">${totalUploaded} fichier(s)</td></tr>
              <tr><td style="color:#64748b;">Compte créé</td><td style="color:#0C1C40;">${accountCreated ? "Oui (nouveau client)" : "Non (déjà client ou anonyme)"}</td></tr>
              ${form.informations_complementaires ? `<tr><td style="color:#64748b;vertical-align:top;">Notes</td><td style="color:#475569;">${escapeHtml(form.informations_complementaires).replace(/\n/g, "<br>")}</td></tr>` : ""}
            </table>
            <p style="margin:20px 0 0;text-align:center;">
              <a href="${siteUrl}/dashboard/admin/demandes" style="display:inline-block;padding:10px 20px;background:#0C1C40;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Ouvrir le dossier dans l'admin →</a>
            </p>
          </td></tr>
          <tr><td style="background:#0C1C40;padding:14px 32px;text-align:center;font-size:11px;color:#94a3b8;">NEXUS RCA — Notifications dossier</td></tr>
        </table>
      </body></html>`;

      try {
        const r = await resend.emails.send({
          from: FROM_PRIMARY,
          to: STAFF_EMAIL,
          subject: `🔔 Nouveau dossier ${reference} — ${form.service} (${form.nom_complet})`,
          html: staffHtml,
        });
        if (r.error) {
          await resend.emails.send({
            from: FROM_FALLBACK,
            to: STAFF_EMAIL,
            subject: `🔔 Nouveau dossier ${reference}`,
            html: staffHtml,
          });
        }
      } catch (e) {
        console.error("[DEMANDE_COMPLETE] email staff exception:", e);
      }
    } else {
      console.warn("[DEMANDE_COMPLETE] RESEND_API_KEY absente, skip emails");
    }

    return NextResponse.json({
      success: true,
      reference,
      demande_id: demandeId,
      account_created: accountCreated,
    });
  } catch (err) {
    console.error("[DEMANDE_COMPLETE] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
