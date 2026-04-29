import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

interface CreateTeamMemberBody {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role: "agent" | "admin" | "super_admin";
  poste?: string;
  notes_internes?: string;
  send_invitation: boolean;
  temporary_password?: string;
}

const ALLOWED_ROLES = ["agent", "admin", "super_admin"] as const;

// URL de base de production - utilisee pour les redirections d invitation
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // ========================================================================
    // 1. AUTHENTIFICATION
    // ========================================================================
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // ========================================================================
    // 2. VERIFIER QUE C EST UN SUPER_ADMIN
    // ========================================================================
    const { data: callerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !callerProfile) {
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 403 }
      );
    }

    if (callerProfile.role !== "super_admin") {
      console.warn(
        `Tentative non autorisee de creation employe par ${user.email} (role: ${callerProfile.role})`
      );
      return NextResponse.json(
        {
          error:
            "Accès refusé : seuls les super-admins peuvent créer des employés Nexus",
        },
        { status: 403 }
      );
    }

    // ========================================================================
    // 3. VALIDATION
    // ========================================================================
    const body = (await request.json()) as CreateTeamMemberBody;

    if (!body.prenom?.trim() || !body.nom?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: "Prénom, nom et email sont obligatoires" },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(body.role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    if (!body.send_invitation) {
      if (!body.temporary_password || body.temporary_password.length < 8) {
        return NextResponse.json(
          {
            error: "Mot de passe temporaire requis (minimum 8 caractères)",
          },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // 4. CLIENT ADMIN
    // ========================================================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY manquante");
      return NextResponse.json(
        {
          error:
            "Configuration serveur incomplète. Contactez l'administrateur technique.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ========================================================================
    // 5. VERIFIER UNICITE EMAIL
    // ========================================================================
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("email", body.email.trim().toLowerCase())
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json(
        {
          error: `Cet email est déjà utilisé (rôle actuel : ${existingProfiles[0].role})`,
        },
        { status: 409 }
      );
    }

    // ========================================================================
    // 6. CREATION COMPTE AUTH
    // ========================================================================
    let userId: string;

    if (body.send_invitation) {
      // ⭐ CORRECTION : ajout de redirectTo pour pointer vers la page accept-invite
      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(
          body.email.trim().toLowerCase(),
          {
            redirectTo: `${SITE_URL}/auth/accept-invite`,
            data: {
              prenom: body.prenom.trim(),
              nom: body.nom.trim(),
              role: body.role,
            },
          }
        );

      if (inviteError || !inviteData?.user) {
        console.error("Erreur invitation :", inviteError);
        return NextResponse.json(
          {
            error:
              "Erreur lors de la création : " +
              (inviteError?.message || "Inconnue"),
          },
          { status: 500 }
        );
      }

      userId = inviteData.user.id;
    } else {
      const { data: createData, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: body.email.trim().toLowerCase(),
          password: body.temporary_password!,
          email_confirm: true,
          user_metadata: {
            prenom: body.prenom.trim(),
            nom: body.nom.trim(),
            role: body.role,
          },
        });

      if (createError || !createData?.user) {
        console.error("Erreur creation :", createError);
        return NextResponse.json(
          {
            error:
              "Erreur lors de la création : " +
              (createError?.message || "Inconnue"),
          },
          { status: 500 }
        );
      }

      userId = createData.user.id;
    }

    // ========================================================================
    // 7. CREATION DU PROFIL
    // ========================================================================
    const profilePayload = {
      id: userId,
      email: body.email.trim().toLowerCase(),
      prenom: body.prenom.trim(),
      nom: body.nom.trim(),
      telephone: body.telephone?.trim() || null,
      role: body.role,
      poste: body.poste?.trim() || null,
      notes_internes: body.notes_internes?.trim() || null,
      actif: true,
    };

    const { error: profileUpsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileUpsertError) {
      console.error("Erreur creation profil :", profileUpsertError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        {
          error:
            "Erreur création profil : " + profileUpsertError.message,
        },
        { status: 500 }
      );
    }

    // ========================================================================
    // 8. EMAIL DE BIENVENUE (mode mot de passe temporaire)
    // ========================================================================
    if (!body.send_invitation && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fullName = `${body.prenom.trim()} ${body.nom.trim()}`;
        const roleLabel =
          body.role === "super_admin"
            ? "Super-admin"
            : body.role === "admin"
            ? "Administrateur"
            : "Agent";

        await resend.emails.send({
          from: "Nexus RCA <noreply@nexusrca.com>",
          to: body.email.trim().toLowerCase(),
          subject: "Bienvenue dans l'équipe Nexus RCA",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #FF6600; padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">NEXUS RCA</h1>
                <p style="color: white; margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Bienvenue dans l'équipe</p>
              </div>
              <div style="background: white; padding: 30px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="color: #0C1C40; font-size: 16px;">Bonjour ${fullName},</p>
                <p style="color: #475569; line-height: 1.6;">
                  Votre compte employé Nexus RCA a été créé. Vous avez été ajouté en tant que <strong>${roleLabel}</strong>.
                </p>
                <div style="background: #FFF7ED; border: 1px solid #FFD4A8; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0; color: #64748B; font-size: 12px; text-transform: uppercase; font-weight: bold;">Vos identifiants</p>
                  <p style="margin: 8px 0 4px 0; color: #0C1C40; font-size: 14px;"><strong>Email :</strong> ${body.email.trim().toLowerCase()}</p>
                  <p style="margin: 4px 0; color: #0C1C40; font-size: 14px;"><strong>Mot de passe temporaire :</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">${body.temporary_password}</code></p>
                </div>
                <p style="color: #475569; line-height: 1.6;">
                  ⚠️ <strong>Important :</strong> changez votre mot de passe lors de votre première connexion.
                </p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${SITE_URL}/connexion" style="background: #FF6600; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Se connecter</a>
                </p>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
                <p style="color: #94A3B8; font-size: 12px; text-align: center;">
                  Nexus RCA · Bangui, RCA · contact@nexusrca.com
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Erreur envoi email bienvenue :", emailError);
      }
    }

    // ========================================================================
    // 9. SUCCES
    // ========================================================================
    return NextResponse.json({
      success: true,
      user_id: userId,
      message: body.send_invitation
        ? `Invitation envoyée à ${body.email}. L'employé recevra un email pour activer son compte.`
        : `Compte créé avec succès. Identifiants envoyés à ${body.email}.`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("Erreur create-member :", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
