import { NextRequest, NextResponse } from "next/server";
import { embedNexusLogo } from "@/lib/pdf-logo";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  getServiceSteps,
  getCurrentStepLabel,
} from "@/lib/demande-status";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sanitizeForPdf(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/⁠/g, "")
    .replace(/[      ]/g, " ")
    .replace(/é/g, "e").replace(/è/g, "e").replace(/ê/g, "e").replace(/ë/g, "e")
    .replace(/à/g, "a").replace(/â/g, "a").replace(/ä/g, "a")
    .replace(/î/g, "i").replace(/ï/g, "i")
    .replace(/ô/g, "o").replace(/ö/g, "o")
    .replace(/ù/g, "u").replace(/û/g, "u").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/œ/g, "oe").replace(/æ/g, "ae")
    .replace(/É/g, "E").replace(/È/g, "E").replace(/Ê/g, "E")
    .replace(/À/g, "A").replace(/Â/g, "A")
    .replace(/Î/g, "I").replace(/Ï/g, "I")
    .replace(/Ô/g, "O").replace(/Ö/g, "O")
    .replace(/Ù/g, "U").replace(/Û/g, "U")
    .replace(/Ç/g, "C")
    .replace(/[^\x20-\x7E]/g, "?");
}

function formatDate(s?: string | null): string {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(s);
  }
}

export async function GET(
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", user.id)
      .single();
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil introuvable" },
        { status: 401 }
      );
    }

    const admin = getAdminClient();
    const { data: demande } = await admin
      .from("demandes")
      .select("*")
      .eq("id", params.id)
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
      (demande as { client_id?: string }).client_id === user.id ||
      ((profile as { email?: string }).email &&
        (demande as { email?: string }).email?.toLowerCase().trim() ===
          (profile as { email: string }).email.toLowerCase().trim());

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Documents
    const { data: docs } = await admin
      .from("demande_documents")
      .select("file_name, file_size_bytes, categorie, created_at")
      .eq("demande_id", params.id)
      .order("created_at", { ascending: true });

    const d = demande as Record<string, unknown>;

    // ─── Génération PDF ───
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const nexusBlue = rgb(0.047, 0.11, 0.251);
    const nexusOrange = rgb(1, 0.4, 0);
    const grayDark = rgb(0.15, 0.2, 0.3);
    const grayMid = rgb(0.4, 0.45, 0.5);
    const grayLight = rgb(0.9, 0.92, 0.95);
    const white = rgb(1, 1, 1);

    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN_X = 40;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H;

    const ensureSpace = (needed: number) => {
      if (y - needed < 50) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - 30;
      }
    };

    const drawText = (
      text: string,
      x: number,
      yPos: number,
      opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}
    ) => {
      page.drawText(sanitizeForPdf(text), {
        x,
        y: yPos,
        size: opts.size || 10,
        font: opts.bold ? helveticaBold : helvetica,
        color: opts.color || grayDark,
      });
    };

    // ─── HEADER ───
    page.drawRectangle({
      x: 0,
      y: PAGE_H - 100,
      width: PAGE_W,
      height: 100,
      color: nexusBlue,
    });
    const nexusLogo = await embedNexusLogo(pdfDoc);
    if (nexusLogo) page.drawImage(nexusLogo, { x: MARGIN_X, y: PAGE_H - 66, width: 36, height: 36 });
    drawText("NEXUS RCA", MARGIN_X + 46, PAGE_H - 35, {
      size: 18,
      bold: true,
      color: white,
    });
    drawText("Recapitulatif de dossier", MARGIN_X + 46, PAGE_H - 56, {
      size: 11,
      color: rgb(0.7, 0.75, 0.85),
    });
    drawText(
      `Reference : ${(d.reference as string) || "-"}`,
      MARGIN_X,
      PAGE_H - 78,
      { size: 11, bold: true, color: nexusOrange }
    );
    drawText(
      `Genere le ${formatDate(new Date().toISOString())}`,
      PAGE_W - MARGIN_X - 200,
      PAGE_H - 78,
      { size: 9, color: rgb(0.7, 0.75, 0.85) }
    );

    y = PAGE_H - 130;

    // Helper pour titre de section
    const drawSection = (title: string) => {
      ensureSpace(40);
      page.drawRectangle({
        x: MARGIN_X,
        y: y - 18,
        width: PAGE_W - 2 * MARGIN_X,
        height: 22,
        color: grayLight,
      });
      drawText(title, MARGIN_X + 8, y - 12, {
        size: 10,
        bold: true,
        color: nexusBlue,
      });
      y -= 32;
    };

    // Helper pour ligne label / valeur
    const drawRow = (label: string, value: string) => {
      if (!value) return;
      ensureSpace(16);
      drawText(label, MARGIN_X, y, { size: 9, bold: true, color: grayMid });
      // Wrap simple (1 ligne max 70 char ~)
      const text = value.length > 70 ? value.slice(0, 67) + "..." : value;
      drawText(text, MARGIN_X + 150, y, { size: 9, color: grayDark });
      y -= 14;
    };

    // ─── CURRENT STATUS ───
    drawSection("Statut actuel");
    const currentStep = (d.current_step as number) || 1;
    const stepLabel = getCurrentStepLabel(
      (d.service as string) || "",
      currentStep
    );
    const steps = getServiceSteps((d.service as string) || "");
    drawRow("Etape en cours", `${currentStep}/6 - ${stepLabel}`);
    drawRow("Statut admin", String(d.statut || "-"));
    drawRow("Soumis le", formatDate(d.created_at as string));

    y -= 6;
    drawText("Parcours du dossier :", MARGIN_X, y, {
      size: 9,
      bold: true,
      color: grayMid,
    });
    y -= 14;
    steps.forEach((label, i) => {
      ensureSpace(12);
      const stepNum = i + 1;
      const isDone = stepNum < currentStep;
      const isActive = stepNum === currentStep;
      const marker = isDone ? "[OK]" : isActive ? "[..]" : "[  ]";
      drawText(`  ${marker} ${stepNum}. ${label}`, MARGIN_X, y, {
        size: 9,
        color: isActive ? nexusOrange : isDone ? grayDark : grayMid,
        bold: isActive,
      });
      y -= 12;
    });
    y -= 8;

    // ─── SECTION 01 ───
    drawSection("01. Identification du demandeur");
    drawRow("Nom complet", String(d.nom_complet || "-"));
    drawRow("Sexe", String(d.sexe || "-"));
    drawRow("Date de naissance", formatDate(d.date_naissance as string));
    drawRow("Nationalite", String(d.nationalite || "-"));
    drawRow("Email", String(d.email || "-"));
    drawRow("Telephone", String(d.telephone || "-"));
    drawRow(
      "Adresse",
      [d.adresse, d.ville, d.pays].filter(Boolean).join(", ") || "-"
    );
    drawRow("Situation matrim.", String(d.situation_matrimoniale || "-"));
    drawRow("Profession", String(d.profession || "-"));
    drawRow("Employeur", String(d.employeur || "-"));
    drawRow("Niveau d'etudes", String(d.niveau_etudes || "-"));
    drawRow("Langue preferee", String(d.langue_preferee || "fr"));

    // ─── SECTION 02 ───
    drawSection("02. Type de demande");
    drawRow("Service", String(d.service || "-"));
    drawRow("Categorie", String(d.categorie_demande || "-"));
    drawRow("Pays concerne", String(d.pays_concerne || "-"));
    drawRow("Type procedure", String(d.type_procedure || "-"));
    drawRow("Date prevue", formatDate(d.date_souhaitee as string));
    drawRow("Demarche existante", d.dossier_existant ? "Oui" : "Non");
    if (d.numero_dossier_existant) {
      drawRow("N. dossier precedent", String(d.numero_dossier_existant));
    }

    // ─── SECTION 03 ───
    const detailsService = (d.details_service as Record<string, unknown>) || {};
    if (Object.keys(detailsService).length > 0) {
      drawSection("03. Informations specifiques");
      Object.entries(detailsService).forEach(([key, value]) => {
        drawRow(
          key.replace(/_/g, " "),
          String(value || "-").slice(0, 120)
        );
      });
    }

    // ─── SECTION 04 ───
    drawSection("04. Documents fournis");
    if (!docs || docs.length === 0) {
      drawText("Aucun document fourni.", MARGIN_X, y, {
        size: 9,
        color: grayMid,
      });
      y -= 14;
    } else {
      docs.forEach((doc) => {
        ensureSpace(12);
        const dd = doc as { file_name: string; categorie: string | null; file_size_bytes: number };
        const sizeKb = Math.round(dd.file_size_bytes / 1024);
        drawText(
          `  - [${dd.categorie || "autre"}] ${dd.file_name} (${sizeKb} ko)`,
          MARGIN_X,
          y,
          { size: 9, color: grayDark }
        );
        y -= 12;
      });
    }

    // ─── SECTION 05 ───
    if (d.informations_complementaires) {
      drawSection("05. Informations complementaires");
      const text = String(d.informations_complementaires);
      const lines: string[] = [];
      let current = "";
      text.split(/\s+/).forEach((word) => {
        if ((current + " " + word).length > 95) {
          lines.push(current);
          current = word;
        } else {
          current = current ? current + " " + word : word;
        }
      });
      if (current) lines.push(current);
      lines.slice(0, 25).forEach((line) => {
        ensureSpace(12);
        drawText(line, MARGIN_X, y, { size: 9, color: grayDark });
        y -= 12;
      });
    }

    // ─── SECTION 06 ───
    drawSection("06. Validation et consentements");
    drawRow("Exactitude certifiee", d.consentement_examen ? "Oui" : "Non");
    drawRow("Traitement autorise", d.consentement_documents ? "Oui" : "Non");
    drawRow("Acceptation contact", d.consentement_recontact ? "Oui" : "Non");

    // ─── FOOTER ───
    const totalPages = pdfDoc.getPageCount();
    pdfDoc.getPages().forEach((p, idx) => {
      p.drawText(
        sanitizeForPdf(
          `NEXUS RCA - ${(d.reference as string) || ""} - Page ${idx + 1}/${totalPages}`
        ),
        {
          x: MARGIN_X,
          y: 25,
          size: 8,
          font: helvetica,
          color: grayMid,
        }
      );
      p.drawText(sanitizeForPdf("contact@nexusrca.com - +236 73 26 96 92"), {
        x: PAGE_W - MARGIN_X - 220,
        y: 25,
        size: 8,
        font: helvetica,
        color: grayMid,
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="dossier-${(d.reference as string) || params.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[DEMANDE_PDF] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
