// ============================================================================
// REÇU 80 mm — page Encaissement libre (instruction Thierry §11, 12/09/2026).
// Largeur 80 mm, hauteur variable, JAMAIS une mise en page A4 réduite.
// - Accents correctement imprimés : sanitize LOCALE qui préserve le
//   Latin-1 (WinAnsi encode é è à ç…), contrairement à lib/pdf-layout dont
//   la sanitize historique translittère en ASCII. Seuls les caractères
//   hors WinAnsi (espaces fines U+202F — le bug d'origine —, symboles
//   exotiques) sont remplacés.
// - Coordonnées VALIDÉES par l'instruction : Croisement Marabena, route de
//   l'aéroport, P.O. Box 1204, Bangui, RCA · +236 70 21 95 25 ·
//   www.nexusrca.com. Date et heure locales de Bangui (Africa/Bangui).
// - Identification de la caisse et de l'opératrice ; unité par ligne ;
//   PAYÉ / RESTE DÛ ; remis/monnaie ; caution à part ; DUPLICATA identifié.
// - Mode TEST : document clairement marqué, aucune transaction.
// ============================================================================

import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { mm } from "@/lib/pdf-layout";

export interface PosTicketLine {
  label: string;
  quantite: number;
  unite?: string | null;
  prix_unitaire: number;
  montant_total: number;
  caution?: boolean;
}

export interface PosTicketData {
  reference: string;
  date: Date;
  clientNom?: string | null;
  dossierReference?: string | null;
  lignes: PosTicketLine[];
  total: number;
  devise: string;
  modePaiement: string;
  montantRecu?: number | null;
  monnaieRendue?: number | null;
  caissiereNom?: string | null;
  caisseLabel?: string | null;
  duplicata?: boolean;
  acompte?: { paye: number; resteDu: number } | null;
  cautionTotal?: number | null;
  /** Règlement complémentaire : distinguer le paiement du jour (§11). */
  reglementsPrecedents?: number | null;
  /** Document de test imprimante — aucune transaction (§10). */
  test?: boolean;
}

// Sanitize LOCALE : préserve les accents (Latin-1/WinAnsi), remplace
// uniquement ce que WinAnsi ne sait pas encoder.
function tk(text: string): string {
  return (text || "")
    .replace(/[     ]/g, " ")
    .replace(/⁠/g, "")
    .replace(/[—–]/g, "-")
    .replace(/•/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/€/g, "EUR")
    // WinAnsi : ASCII imprimable + Latin-1 (accents preserves). Reste -> ?
    .replace(/[^ -~À-ÿŒœ]/g, "?")
}

const WIDTH_MM = 80;
const MARGIN_MM = 5;

// Logo officiel Nexus RCA (demande Thierry 12/09 : « le logo sur les
// factures et PDF ») — même fichier que le BrandMark de l'interface.
// Chargé une fois côté navigateur ; en cas d'échec (offline), le reçu se
// génère SANS logo : l'impression n'est jamais bloquée.
const LOGO_URL = "/icones/icon-192.png";
let logoCache: Uint8Array | null | undefined;

async function loadLogo(): Promise<Uint8Array | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    const res = await fetch(LOGO_URL);
    logoCache = res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    logoCache = null;
  }
  return logoCache;
}

function txt(
  page: PDFPage | null,
  pageHeight: number,
  font: PDFFont,
  text: string,
  xMm: number,
  topYMm: number,
  size: number,
  align: "left" | "right" | "center" = "left"
) {
  if (!page) return;
  const safe = tk(text);
  const width = font.widthOfTextAtSize(safe, size);
  const x = align === "right" ? mm(xMm) - width : align === "center" ? mm(xMm) - width / 2 : mm(xMm);
  page.drawText(safe, { x, y: pageHeight - mm(topYMm), size, font, color: rgb(0, 0, 0) });
}

function wrap(font: PDFFont, text: string, maxWidthPt: number, size: number): string[] {
  const words = tk(text).split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidthPt && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function dash(page: PDFPage | null, pageHeight: number, topYMm: number) {
  if (!page) return;
  page.drawLine({
    start: { x: mm(MARGIN_MM), y: pageHeight - mm(topYMm) },
    end: { x: mm(WIDTH_MM - MARGIN_MM), y: pageHeight - mm(topYMm) },
    thickness: 0.85,
    color: rgb(0, 0, 0),
    dashArray: [2.8, 2.8],
  });
}

function fcfa(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

export async function generatePosTicketPdf(data: PosTicketData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Logo en tête (facultatif : jamais bloquant pour l'impression).
  let logo: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
  try {
    const logoBytes = await loadLogo();
    if (logoBytes) logo = await pdfDoc.embedPng(logoBytes);
  } catch {
    logo = null;
  }

  const cx = WIDTH_MM / 2;
  const m = MARGIN_MM;
  const innerPt = mm(WIDTH_MM - 2 * m);

  // DEUX PASSES (retour Thierry 12/09 : montants coupés en bas du reçu) :
  // 1) mesure — mêmes instructions, page null, on obtient la hauteur EXACTE
  //    (les libellés longs ajoutent des lignes que l'estimation ratait) ;
  // 2) dessin — page créée à la hauteur mesurée + marge basse.
  const renderAll = (page: PDFPage | null, pageHeight: number): number => {
  let y = 8;

  // ── En-tête institutionnel (coordonnées validées §11) ──
  if (logo) {
    if (page) {
      page.drawImage(logo, {
        x: mm(cx - 6),
        y: pageHeight - mm(y + 12),
        width: mm(12),
        height: mm(12),
      });
    }
    y += 13;
  }
  txt(page, pageHeight, bold, "NEXUS RCA", cx, y, 15, "center");
  y += 5;
  txt(page, pageHeight, helvetica, "Agence Internationale", cx, y, 8, "center");
  y += 3.6;
  txt(page, pageHeight, helvetica, "Croisement Marabena, route de l'aéroport", cx, y, 7, "center");
  y += 3.4;
  txt(page, pageHeight, helvetica, "P.O. Box 1204, Bangui, République centrafricaine", cx, y, 7, "center");
  y += 3.4;
  txt(page, pageHeight, helvetica, "Tél : +236 70 21 95 25 · www.nexusrca.com", cx, y, 7, "center");

  y += 4.5;
  dash(page, pageHeight, y);
  y += 5;

  if (data.test) {
    txt(page, pageHeight, bold, "*** TEST IMPRIMANTE ***", cx, y, 11, "center");
    y += 5;
    txt(page, pageHeight, bold, "AUCUNE TRANSACTION FINANCIÈRE", cx, y, 8, "center");
    y += 5;
    dash(page, pageHeight, y);
    y += 5;
  }

  txt(page, pageHeight, bold, "REÇU DE PAIEMENT", cx, y, 10, "center");
  if (data.duplicata) {
    y += 4.5;
    txt(page, pageHeight, bold, "*** DUPLICATA - RÉIMPRESSION ***", cx, y, 8, "center");
  }
  y += 4.5;
  txt(page, pageHeight, courier, data.reference, cx, y, 8, "center");
  y += 4;
  // Heure locale de Bangui (§11) — quel que soit le fuseau du serveur/poste.
  const dateStr = data.date.toLocaleString("fr-FR", {
    timeZone: "Africa/Bangui",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  txt(page, pageHeight, helvetica, dateStr, cx, y, 8, "center");
  y += 3.8;
  txt(
    page,
    pageHeight,
    helvetica,
    `Caisse : ${data.caisseLabel || "Réception"}${data.caissiereNom ? ` · Opératrice : ${data.caissiereNom}` : ""}`,
    cx,
    y,
    7,
    "center"
  );

  y += 4;
  dash(page, pageHeight, y);

  if (data.clientNom) {
    y += 4.2;
    txt(page, pageHeight, helvetica, `Client : ${data.clientNom}`, m, y, 8);
  }
  if (data.dossierReference) {
    y += 3.8;
    txt(page, pageHeight, helvetica, `Dossier : ${data.dossierReference}`, m, y, 7);
  }
  if (data.clientNom || data.dossierReference) {
    y += 3.5;
    dash(page, pageHeight, y);
  }

  // ── Lignes : libellé (retour à la ligne), puis "qté unité × PU" et total
  //    sur une ligne dédiée — les montants ne sont jamais coupés (§11). ──
  for (const ligne of data.lignes) {
    y += 4.6;
    const label = (ligne.caution ? "Caution - " : "") + ligne.label;
    for (const l of wrap(bold, label, innerPt, 8)) {
      txt(page, pageHeight, bold, l, m, y, 8);
      y += 3.4;
    }
    txt(
      page,
      pageHeight,
      helvetica,
      `${ligne.quantite} ${ligne.unite || "prestation"} × ${Math.round(ligne.prix_unitaire).toLocaleString("fr-FR")}`,
      m,
      y,
      7.5
    );
    txt(page, pageHeight, helvetica, fcfa(ligne.montant_total), WIDTH_MM - m, y, 8, "right");
    y += 1.2;
  }

  y += 3.6;
  dash(page, pageHeight, y);
  y += 5;
  txt(page, pageHeight, bold, "TOTAL", m, y, 11);
  txt(page, pageHeight, bold, fcfa(data.total), WIDTH_MM - m, y, 11, "right");

  if (data.cautionTotal && data.cautionTotal > 0) {
    y += 4.2;
    txt(page, pageHeight, helvetica, `dont caution remboursable : ${fcfa(data.cautionTotal)}`, m, y, 7);
  }
  if (data.reglementsPrecedents && data.reglementsPrecedents > 0) {
    y += 4.2;
    txt(page, pageHeight, helvetica, `Règlements précédents : ${fcfa(data.reglementsPrecedents)}`, m, y, 7.5);
  }
  if (data.acompte) {
    y += 4.6;
    txt(page, pageHeight, bold, `PAYÉ CE JOUR : ${fcfa(data.acompte.paye)}`, m, y, 9);
    y += 4.2;
    txt(page, pageHeight, bold, `RESTE DÛ : ${fcfa(data.acompte.resteDu)}`, WIDTH_MM - m, y, 9, "right");
  }

  y += 4.6;
  txt(page, pageHeight, helvetica, `Mode de paiement : ${data.modePaiement}`, m, y, 7.5);
  if (data.montantRecu !== null && data.montantRecu !== undefined) {
    y += 3.8;
    txt(page, pageHeight, helvetica, `Remis : ${fcfa(data.montantRecu)}`, m, y, 7.5);
    if (data.monnaieRendue !== null && data.monnaieRendue !== undefined && data.monnaieRendue > 0) {
      txt(page, pageHeight, helvetica, `Monnaie rendue : ${fcfa(data.monnaieRendue)}`, WIDTH_MM - m, y, 7.5, "right");
    }
  }

  y += 5;
  dash(page, pageHeight, y);
  y += 4.6;
  txt(page, pageHeight, helvetica, "Merci de votre confiance !", cx, y, 8.5, "center");


  return y;
  };

  const measuredMm = renderAll(null, 0);
  const pageHeight = mm(measuredMm + 8);
  const page = pdfDoc.addPage([mm(WIDTH_MM), pageHeight]);
  renderAll(page, pageHeight);

  return pdfDoc.save();
}

/** Ouvre le PDF dans un onglet et déclenche la boîte d'impression du poste. */
export function openPdfForPrint(bytes: Uint8Array): boolean {
  const buffer = new Uint8Array(bytes).buffer as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => win.print());
    return true;
  }
  return false;
}

export function pdfBlobUrl(bytes: Uint8Array): string {
  const buffer = new Uint8Array(bytes).buffer as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const a = document.createElement("a");
  a.href = pdfBlobUrl(bytes);
  a.download = filename;
  a.click();
}
