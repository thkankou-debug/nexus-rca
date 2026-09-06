// ============================================================================
// PAYSLIP PDF — Génération fiche de paie server-side via pdf-lib
// ----------------------------------------------------------------------------
// Pattern projet : sanitizeForPdf systématique, pas de toLocaleString fr-FR.
// Couleurs Nexus (navy + orange). A4.
// ============================================================================

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Employee, Payslip, PayslipLigne } from "@/types";

// ─── Sanitize WinAnsi ──────────────────────────────────────────────────────
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return text
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/⁠/g, "")
    .replace(/é/g, "e").replace(/è/g, "e").replace(/ê/g, "e").replace(/ë/g, "e")
    .replace(/à/g, "a").replace(/â/g, "a").replace(/ä/g, "a")
    .replace(/î/g, "i").replace(/ï/g, "i")
    .replace(/ô/g, "o").replace(/ö/g, "o")
    .replace(/ù/g, "u").replace(/û/g, "u").replace(/ü/g, "u")
    .replace(/ç/g, "c")
    .replace(/É/g, "E").replace(/À/g, "A").replace(/Ç/g, "C").replace(/Ê/g, "E")
    .replace(/[^\x20-\x7E]/g, "?");
}

function formatMoney(amount: number, currency = "FCFA"): string {
  const intPart = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart} ${currency}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export interface BuildPayslipOptions {
  employee: Pick<
    Employee,
    | "nom_complet"
    | "email"
    | "poste"
    | "departement"
    | "date_embauche"
    | "type_contrat"
    | "numero_cni"
    | "telephone"
  >;
  payslip: Pick<
    Payslip,
    | "reference"
    | "mois_libelle"
    | "periode_debut"
    | "periode_fin"
    | "salaire_brut"
    | "salaire_net"
    | "details_lignes"
    | "cotisations"
  >;
  validatedAt?: string | null;
}

export async function buildPayslipPdf(opts: BuildPayslipOptions): Promise<Uint8Array> {
  const { employee, payslip, validatedAt } = opts;

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const nexusBlue = rgb(0.047, 0.11, 0.251);
  const nexusOrange = rgb(1, 0.4, 0);
  const grayDark = rgb(0.15, 0.2, 0.3);
  const grayMid = rgb(0.4, 0.45, 0.5);
  const grayLight = rgb(0.85, 0.87, 0.9);
  const white = rgb(1, 1, 1);
  const rowAlt = rgb(0.97, 0.98, 0.99);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN_X = 40;

  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  const drawText = (
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      font?: typeof helvetica;
      color?: ReturnType<typeof rgb>;
    }
  ) => {
    page.drawText(sanitizeForPdf(text), {
      x: options.x,
      y: options.y,
      size: options.size,
      font: options.font ?? helvetica,
      color: options.color ?? grayDark,
    });
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: ReturnType<typeof rgb>
  ) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  // ─── Header navy ───────────────────────────────────────────────────────
  drawRect(0, PAGE_H - 130, PAGE_W, 130, nexusBlue);
  drawRect(0, PAGE_H - 130, 6, 130, nexusOrange);

  drawText("NEXUS RCA", {
    x: MARGIN_X,
    y: PAGE_H - 55,
    size: 22,
    font: helveticaBold,
    color: white,
  });
  drawText("Agence internationale - Bangui, RCA", {
    x: MARGIN_X,
    y: PAGE_H - 75,
    size: 9,
    color: rgb(0.7, 0.78, 0.9),
  });

  drawText("FICHE DE PAIE", {
    x: MARGIN_X,
    y: PAGE_H - 110,
    size: 18,
    font: helveticaBold,
    color: white,
  });

  // Référence + période en haut droite
  drawText(payslip.reference, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 55,
    size: 11,
    font: helveticaBold,
    color: white,
  });
  drawText(payslip.mois_libelle, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 75,
    size: 10,
    color: rgb(0.7, 0.78, 0.9),
  });

  let y = PAGE_H - 170;

  // ─── Bloc employé ────────────────────────────────────────────────────────
  drawText("EMPLOYE", {
    x: MARGIN_X,
    y,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
  });
  y -= 18;

  drawText(employee.nom_complet, {
    x: MARGIN_X,
    y,
    size: 14,
    font: helveticaBold,
    color: nexusBlue,
  });
  y -= 18;

  drawText(`${employee.poste}  -  ${employee.departement}`, {
    x: MARGIN_X,
    y,
    size: 10,
    color: grayMid,
  });
  y -= 14;

  const infoRow = (label: string, value: string | null | undefined, yPos: number) => {
    if (!value) return;
    drawText(label, { x: MARGIN_X, y: yPos, size: 9, color: grayMid });
    drawText(value, { x: MARGIN_X + 110, y: yPos, size: 9, color: grayDark });
  };

  infoRow("Email :", employee.email, y);
  y -= 13;
  infoRow("Telephone :", employee.telephone, y);
  if (employee.telephone) y -= 13;
  infoRow("N CNI :", employee.numero_cni, y);
  if (employee.numero_cni) y -= 13;
  infoRow("Embauche :", formatDate(employee.date_embauche), y);
  y -= 13;
  if (employee.type_contrat) {
    infoRow("Contrat :", employee.type_contrat, y);
    y -= 13;
  }

  y -= 12;

  // ─── Bloc période ────────────────────────────────────────────────────────
  drawRect(MARGIN_X, y - 38, PAGE_W - 2 * MARGIN_X, 36, rgb(0.97, 0.98, 0.99));
  drawText("PERIODE DE PAIE", {
    x: MARGIN_X + 12,
    y: y - 14,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
  });
  drawText(
    `Du ${formatDate(payslip.periode_debut)} au ${formatDate(payslip.periode_fin)}`,
    {
      x: MARGIN_X + 12,
      y: y - 30,
      size: 11,
      font: helveticaBold,
      color: nexusBlue,
    }
  );

  y -= 60;

  // ─── Tableau rémunération ────────────────────────────────────────────────
  drawText("REMUNERATION", {
    x: MARGIN_X,
    y,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
  });
  y -= 14;

  // Header tableau
  drawRect(MARGIN_X, y - 22, PAGE_W - 2 * MARGIN_X, 22, nexusBlue);
  drawText("Designation", {
    x: MARGIN_X + 10,
    y: y - 15,
    size: 10,
    font: helveticaBold,
    color: white,
  });
  drawText("Montant", {
    x: PAGE_W - MARGIN_X - 110,
    y: y - 15,
    size: 10,
    font: helveticaBold,
    color: white,
  });

  y -= 22;

  const drawTableRow = (label: string, montant: number, alt: boolean) => {
    if (alt) {
      drawRect(MARGIN_X, y - 22, PAGE_W - 2 * MARGIN_X, 22, rowAlt);
    }
    drawText(label, {
      x: MARGIN_X + 10,
      y: y - 15,
      size: 10,
      color: grayDark,
    });
    drawText(formatMoney(montant), {
      x: PAGE_W - MARGIN_X - 110,
      y: y - 15,
      size: 10,
      color: grayDark,
    });
    y -= 22;
  };

  // Salaire base = brut - somme(lignes positives) côté admin
  const lignes: PayslipLigne[] = Array.isArray(payslip.details_lignes)
    ? payslip.details_lignes
    : [];

  const sommeLignes = lignes.reduce((acc, l) => acc + (Number(l.montant) || 0), 0);
  const salaireBase = Number(payslip.salaire_brut) - sommeLignes;

  drawTableRow("Salaire de base", salaireBase, false);

  let altIdx = 1;
  for (const ligne of lignes) {
    drawTableRow(ligne.label, Number(ligne.montant) || 0, altIdx % 2 === 1);
    altIdx += 1;
  }

  // Total brut
  drawRect(MARGIN_X, y - 26, PAGE_W - 2 * MARGIN_X, 26, rgb(0.93, 0.95, 0.98));
  drawText("TOTAL BRUT", {
    x: MARGIN_X + 10,
    y: y - 17,
    size: 11,
    font: helveticaBold,
    color: nexusBlue,
  });
  drawText(formatMoney(payslip.salaire_brut), {
    x: PAGE_W - MARGIN_X - 110,
    y: y - 17,
    size: 11,
    font: helveticaBold,
    color: nexusBlue,
  });
  y -= 26;

  // Cotisations (Phase C — affichées seulement si présentes)
  const cotisations = payslip.cotisations || {};
  const cotisationsEntries = Object.entries(cotisations).filter(
    ([, v]) => typeof v === "number" && v > 0
  );

  if (cotisationsEntries.length > 0) {
    y -= 14;
    drawText("COTISATIONS", {
      x: MARGIN_X,
      y,
      size: 9,
      font: helveticaBold,
      color: nexusOrange,
    });
    y -= 14;

    altIdx = 0;
    for (const [key, value] of cotisationsEntries) {
      drawTableRow(key.toUpperCase(), -Math.abs(Number(value)), altIdx % 2 === 0);
      altIdx += 1;
    }
  }

  // ─── Net à payer ─────────────────────────────────────────────────────────
  y -= 14;
  drawRect(MARGIN_X, y - 36, PAGE_W - 2 * MARGIN_X, 36, nexusOrange);
  drawText("NET A PAYER", {
    x: MARGIN_X + 12,
    y: y - 24,
    size: 13,
    font: helveticaBold,
    color: white,
  });
  drawText(formatMoney(payslip.salaire_net), {
    x: PAGE_W - MARGIN_X - 160,
    y: y - 24,
    size: 14,
    font: helveticaBold,
    color: white,
  });
  y -= 50;

  // ─── Validation / signature ──────────────────────────────────────────────
  if (validatedAt) {
    drawText(`Document valide le ${formatDate(validatedAt)}`, {
      x: MARGIN_X,
      y,
      size: 9,
      color: grayMid,
    });
    y -= 12;
  }

  // ─── Footer ──────────────────────────────────────────────────────────────
  drawRect(0, 0, PAGE_W, 50, rgb(0.97, 0.98, 0.99));
  drawText("Nexus RCA - Croisement Marabena, Route de l'Aeroport, Bangui, RCA", {
    x: MARGIN_X,
    y: 30,
    size: 8,
    color: grayMid,
  });
  drawText("contact@nexusrca.com  -  +236 73 26 96 92  -  www.nexusrca.com", {
    x: MARGIN_X,
    y: 18,
    size: 8,
    color: grayMid,
  });

  return await pdfDoc.save();
}
