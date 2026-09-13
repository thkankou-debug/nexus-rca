// ============================================================================
// API ROUTE — GET /api/accueil/factures/:id/pdf (cahier §8)
// Facture (ou avoir) PDF A4 professionnelle : identité Nexus RCA, référence
// unique, dates émission/échéance, client, tableau des prestations
// (désignation/qté/unité/PU/montant), TOTAL, réglé / reste dû, avoirs liés,
// conditions de règlement, mentions de pied. Pas de TVA ni taxe (décision
// 12/09/2026) ; NIF/RCCM omis tant que vides dans lib/facture-config.ts —
// aucune valeur inventée. Sanitize WinAnsi (accents conservés) ; jamais
// toLocaleString pour les nombres (bug espace insécable connu).
// ============================================================================

import { readFileSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import {
  getFactureAdminClient,
  getFactureActor,
  INVOICE_FIELDS,
  sumAvoirs,
  resteDu,
  type InvoiceRow,
} from "@/lib/facture-server";
import {
  FACTURE_IDENTITE,
  FACTURE_MENTIONS_PIED,
} from "@/lib/facture-config";

export const dynamic = "force-dynamic";

const NAVY = rgb(0.008, 0.027, 0.122); // nexus-blue-950
const GREY = rgb(0.35, 0.38, 0.45);
const LIGHT = rgb(0.85, 0.86, 0.88);

function nombre(n: number): string {
  const sign = n < 0 ? "-" : "";
  const s = Math.round(Math.abs(n)).toString();
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += " ";
    out += s[i];
  }
  return `${sign}${out} FCFA`;
}

function tk(text: string): string {
  return text
    .replace(/[    ]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^ -~À-ÿŒœ]/g, "?");
}

function wrap(font: PDFFont, text: string, maxWidth: number, size: number): string[] {
  const words = tk(text).split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) cur = test;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length > 0 ? lines : [""];
}

function dateFr(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" });
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("facture.read");
    const actor = await getFactureActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const admin = getFactureAdminClient();
    const { data } = await admin.from("invoices").select(INVOICE_FIELDS).eq("id", params.id).single();
    if (!data) return NextResponse.json({ success: false, error: "Facture introuvable" }, { status: 404 });
    const f = data as unknown as InvoiceRow;

    const [avoirsTotal, { data: avoirRows }] = await Promise.all([
      f.type === "facture" ? sumAvoirs(admin, f.id) : Promise.resolve(0),
      f.type === "facture"
        ? admin
            .from("invoices")
            .select("reference, motif, total, emitted_at")
            .eq("parent_id", f.id)
            .eq("type", "avoir")
            .not("emitted_at", "is", null)
        : Promise.resolve({ data: [] as { reference: string; motif: string | null; total: number; emitted_at: string }[] }),
    ]);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Logo officiel Nexus RCA (demande Thierry 12/09) — même fichier que le
    // BrandMark de l'interface ; si la lecture échoue, la facture sort sans
    // logo (jamais bloquant).
    let logo: Awaited<ReturnType<typeof pdf.embedPng>> | null = null;
    try {
      logo = await pdf.embedPng(
        readFileSync(path.join(process.cwd(), "public", "icones", "icon-192.png"))
      );
    } catch {
      logo = null;
    }

    let page: PDFPage = pdf.addPage([595, 842]);
    const M = 50;
    const RIGHT = 545;
    let y = 792;

    const ensure = (needed: number) => {
      if (y - needed < 60) {
        page = pdf.addPage([595, 842]);
        y = 792;
      }
    };
    const text = (
      t: string,
      opts: { b?: boolean; size?: number; color?: ReturnType<typeof rgb>; x?: number; right?: boolean } = {}
    ) => {
      const fnt = opts.b ? bold : font;
      const size = opts.size ?? 10;
      const safe = tk(t);
      const x = opts.right ? RIGHT - fnt.widthOfTextAtSize(safe, size) : opts.x ?? M;
      page.drawText(safe, { x, y, size, font: fnt, color: opts.color ?? NAVY });
    };
    const nl = (h = 14) => {
      y -= h;
    };

    // ── En-tête (logo + identité décalée quand le logo est présent) ──
    const LOGO_SIZE = 46;
    const HX = logo ? M + LOGO_SIZE + 12 : M;
    if (logo) {
      page.drawImage(logo, { x: M, y: y - LOGO_SIZE + 16, width: LOGO_SIZE, height: LOGO_SIZE });
    }
    text(FACTURE_IDENTITE.raisonSociale, { b: true, size: 22, x: HX });
    text(f.type === "avoir" ? "AVOIR" : "FACTURE", { b: true, size: 22, right: true });
    nl(16);
    text("Agence Internationale", { size: 9, color: GREY, x: HX });
    text(f.reference, { b: true, size: 12, right: true });
    nl(12);
    for (const lineTxt of wrap(font, FACTURE_IDENTITE.adresse, 300, 8)) {
      text(lineTxt, { size: 8, color: GREY, x: HX });
      nl(10);
    }
    text(`Tél : ${FACTURE_IDENTITE.telephone} · ${FACTURE_IDENTITE.email}`, { size: 8, color: GREY, x: HX });
    nl(10);
    text(FACTURE_IDENTITE.siteWeb, { size: 8, color: GREY, x: HX });
    // NIF / RCCM : uniquement s'ils sont renseignés (jamais inventés).
    if (FACTURE_IDENTITE.nif || FACTURE_IDENTITE.rccm) {
      nl(10);
      text(
        [FACTURE_IDENTITE.nif && `NIF : ${FACTURE_IDENTITE.nif}`, FACTURE_IDENTITE.rccm && `RCCM : ${FACTURE_IDENTITE.rccm}`]
          .filter(Boolean)
          .join(" · "),
        { size: 8, color: GREY }
      );
    }
    nl(20);
    page.drawLine({ start: { x: M, y }, end: { x: RIGHT, y }, thickness: 1.2, color: NAVY });
    nl(20);

    // ── Bloc dates + client ──
    text(`Date d'émission : ${dateFr(f.emitted_at)}`, { size: 10 });
    nl(14);
    if (f.type === "facture") {
      text(`Échéance : ${f.echeance ? dateFr(f.echeance) : "payable à réception"}`, { size: 10 });
      nl(14);
    }
    if (f.type === "avoir" && f.parent_id) {
      text(`Corrige la facture liée — motif : ${f.motif || "—"}`, { size: 10 });
      nl(14);
    }
    nl(4);
    text("FACTURÉ À", { b: true, size: 9, color: GREY });
    nl(13);
    text(f.client_nom, { b: true, size: 12 });
    nl(14);
    if (f.client_coordonnees) {
      for (const lineTxt of wrap(font, f.client_coordonnees, 400, 9)) {
        text(lineTxt, { size: 9, color: GREY });
        nl(11);
      }
    }
    nl(12);

    // ── Tableau des prestations ──
    const COLS = { designation: M, qte: 350, unite: 390, pu: 470, montant: RIGHT };
    page.drawRectangle({ x: M - 6, y: y - 4, width: RIGHT - M + 12, height: 18, color: NAVY });
    text("Désignation", { b: true, size: 9, color: rgb(1, 1, 1) });
    text("Qté", { b: true, size: 9, color: rgb(1, 1, 1), x: COLS.qte });
    text("Unité", { b: true, size: 9, color: rgb(1, 1, 1), x: COLS.unite });
    text("P.U.", { b: true, size: 9, color: rgb(1, 1, 1), x: COLS.pu - 30 });
    const mHead = "Montant";
    page.drawText(tk(mHead), {
      x: RIGHT - bold.widthOfTextAtSize(mHead, 9),
      y,
      size: 9,
      font: bold,
      color: rgb(1, 1, 1),
    });
    nl(22);

    for (const l of f.lignes) {
      ensure(30);
      const lignesTexte = wrap(font, l.designation, 280, 9.5);
      const montant = Number(l.quantite) * Number(l.prix_unitaire);
      text(lignesTexte[0], { size: 9.5 });
      text(String(l.quantite), { size: 9.5, x: COLS.qte });
      text(l.unite || "—", { size: 9.5, x: COLS.unite });
      page.drawText(tk(nombre(Number(l.prix_unitaire)).replace(" FCFA", "")), {
        x: COLS.pu - font.widthOfTextAtSize(tk(nombre(Number(l.prix_unitaire)).replace(" FCFA", "")), 9.5),
        y,
        size: 9.5,
        font,
        color: NAVY,
      });
      page.drawText(tk(nombre(montant).replace(" FCFA", "")), {
        x: RIGHT - font.widthOfTextAtSize(tk(nombre(montant).replace(" FCFA", "")), 9.5),
        y,
        size: 9.5,
        font,
        color: NAVY,
      });
      nl(13);
      for (const suite of lignesTexte.slice(1)) {
        ensure(13);
        text(suite, { size: 9.5 });
        nl(13);
      }
      if (l.description) {
        for (const desc of wrap(font, l.description, 280, 8)) {
          ensure(11);
          text(desc, { size: 8, color: GREY });
          nl(11);
        }
      }
      page.drawLine({ start: { x: M, y: y + 4 }, end: { x: RIGHT, y: y + 4 }, thickness: 0.5, color: LIGHT });
      nl(6);
    }

    // ── Totaux ──
    ensure(90);
    nl(6);
    text(`TOTAL (${f.type === "avoir" ? "avoir" : "à payer"})`, { b: true, size: 12, x: 330 });
    text(nombre(Number(f.total)), { b: true, size: 12, right: true });
    nl(16);
    if (f.type === "facture" && f.emitted_at) {
      text("Réglé à ce jour", { size: 10, x: 330, color: GREY });
      text(nombre(Number(f.total_regle)), { size: 10, right: true });
      nl(14);
      if (avoirsTotal > 0) {
        text("Avoirs émis", { size: 10, x: 330, color: GREY });
        text(`- ${nombre(avoirsTotal)}`, { size: 10, right: true });
        nl(14);
      }
      text("RESTE DÛ", { b: true, size: 11, x: 330 });
      text(nombre(resteDu(Number(f.total), Number(f.total_regle), avoirsTotal)), { b: true, size: 11, right: true });
      nl(16);
    }

    // ── Avoirs liés (traçabilité) ──
    const avoirsList = (avoirRows || []) as { reference: string; motif: string | null; total: number; emitted_at: string }[];
    if (avoirsList.length > 0) {
      ensure(20 + avoirsList.length * 12);
      text("Avoirs rattachés :", { b: true, size: 9, color: GREY });
      nl(12);
      for (const a of avoirsList) {
        text(`${a.reference} du ${dateFr(a.emitted_at)} — ${a.motif || ""}`, { size: 8.5, color: GREY });
        text(`- ${nombre(Number(a.total))}`, { size: 8.5, right: true, color: GREY });
        nl(11);
      }
    }

    // ── Conditions de règlement ──
    if (f.conditions) {
      ensure(40);
      nl(8);
      text("CONDITIONS DE RÈGLEMENT", { b: true, size: 9, color: GREY });
      nl(12);
      for (const cond of f.conditions.split("\n")) {
        for (const lineTxt of wrap(font, `• ${cond}`, RIGHT - M, 8)) {
          ensure(10);
          text(lineTxt, { size: 8, color: GREY });
          nl(10);
        }
      }
    }

    // ── Pied ──
    ensure(30);
    nl(10);
    page.drawLine({ start: { x: M, y }, end: { x: RIGHT, y }, thickness: 0.7, color: LIGHT });
    nl(12);
    for (const lineTxt of wrap(font, FACTURE_MENTIONS_PIED, RIGHT - M, 7.5)) {
      text(lineTxt, { size: 7.5, color: GREY });
      nl(9);
    }

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${f.reference}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] PDF EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
