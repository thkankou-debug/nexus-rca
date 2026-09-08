// ============================================================================
// CONTRACT PDF — Génération contrat de travail server-side via pdf-lib
// ----------------------------------------------------------------------------
// Helvetica utilise WinAnsi (cp1252) qui supporte tous les accents français.
// Sanitize retire seulement les caractères unicode invisibles ou hors
// WinAnsi, mais PRESERVE les accents (é è à ç ô etc.) et apostrophes.
// ============================================================================

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Employee } from "@/types";

export type ContractType = "CDI" | "CDD" | "Stage" | "Freelance";

export interface BuildContractOptions {
  employee: Employee;
  contractType: ContractType;
  cddEndDate?: string;
  lieuTravail?: string;
  reference: string;
  generatedAt?: string;
}

// ─── Sanitize WinAnsi-friendly mais avec accents ────────────────────────────
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  // 1. Espaces unicode problematiques (narrow no-break, etc.) -> espace ASCII
  let out = text.replace(/[  -   ]/g, " ");
  // 2. Caracteres invisibles -> suppression
  out = out.replace(/[​-‍⁠﻿]/g, "");
  // 3. Smart quotes -> ASCII
  out = out.replace(/[‘’‚‛]/g, "'");
  out = out.replace(/[“”„‟]/g, '"');
  // 4. Tirets unicode -> ASCII
  out = out.replace(/[–—]/g, "-");
  out = out.replace(/…/g, "...");
  // 5. Bullets et autres ponctuations exotiques -> ASCII
  out = out.replace(/•/g, "-");
  // 6. Tout caractere hors ASCII (0x20-0x7E) ET Latin-1 supp (0xA0-0xFF)
  //    -> "?". Cela PRESERVE tous les accents francais (e a i o u c et
  //    leurs majuscules), mais retire emoji, ideogrammes, etc.
  out = out.replace(/[^\x20-\x7E -ÿ]/g, "?");
  return out;
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

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Word wrap helper ──────────────────────────────────────────────────────
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    const width = font.widthOfTextAtSize(sanitizeForPdf(test), size);
    if (width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function periodEssai(type: ContractType): string {
  switch (type) {
    case "CDI": return "3 mois renouvelables une fois";
    case "CDD": return "1 mois";
    case "Stage": return "15 jours";
    case "Freelance": return "Sans période d'essai (mission)";
  }
}

// ─── Génération PDF ────────────────────────────────────────────────────────
export async function buildContractPdf(opts: BuildContractOptions): Promise<Uint8Array> {
  const { employee, contractType, cddEndDate, lieuTravail, reference, generatedAt } = opts;
  const dateGen = generatedAt ?? new Date().toISOString();
  const lieu = lieuTravail ?? "Bangui, République Centrafricaine";

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const nexusBlue = rgb(0.047, 0.11, 0.251);
  // M12-bis (08/09) : l'orange ne subsiste sur aucun PDF (seul le logo le
  // conserve). Or en remplissage/filet uniquement ; le texte reste en
  // bleu nuit, jamais en or (meme regle de contraste qu'a l'ecran, A1).
  const nexusGold = rgb(0.725, 0.592, 0.376);
  const grayDark = rgb(0.15, 0.2, 0.3);
  const grayMid = rgb(0.4, 0.45, 0.5);
  const grayLight = rgb(0.85, 0.87, 0.9);
  const white = rgb(1, 1, 1);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN_X = 50;
  const TEXT_WIDTH = PAGE_W - 2 * MARGIN_X;

  let page: PDFPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let cursorY = PAGE_H;

  const drawText = (
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      font?: PDFFont;
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

  const newPageIfNeeded = (need: number) => {
    if (cursorY - need < 80) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      cursorY = PAGE_H - 50;
    }
  };

  const drawParagraph = (
    text: string,
    options: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      x?: number;
      maxWidth?: number;
    } = {}
  ) => {
    const size = options.size ?? 10;
    const lineHeight = options.lineHeight ?? size * 1.5;
    const x = options.x ?? MARGIN_X;
    const maxWidth = options.maxWidth ?? TEXT_WIDTH;
    const font = options.font ?? helvetica;
    const color = options.color ?? grayDark;

    const lines = wrapText(text, font, size, maxWidth);
    for (const line of lines) {
      newPageIfNeeded(lineHeight);
      drawText(line, { x, y: cursorY - size, size, font, color });
      cursorY -= lineHeight;
    }
  };

  // ─── Header navy ───────────────────────────────────────────────────────
  drawRect(0, PAGE_H - 110, PAGE_W, 110, nexusBlue);
  drawRect(0, PAGE_H - 110, 6, 110, nexusGold);

  drawText("NEXUS RCA", {
    x: MARGIN_X,
    y: PAGE_H - 50,
    size: 22,
    font: helveticaBold,
    color: white,
  });
  drawText("Agence internationale - Bangui, République Centrafricaine", {
    x: MARGIN_X,
    y: PAGE_H - 70,
    size: 9,
    color: rgb(0.7, 0.78, 0.9),
  });
  drawText("Croisement Marabena, Route de l'Aéroport - contact@nexusrca.com", {
    x: MARGIN_X,
    y: PAGE_H - 84,
    size: 8,
    color: rgb(0.7, 0.78, 0.9),
  });

  drawText(reference, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 50,
    size: 11,
    font: helveticaBold,
    color: white,
  });
  drawText(`Établi le ${formatDate(dateGen)}`, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 68,
    size: 9,
    color: rgb(0.7, 0.78, 0.9),
  });
  drawText(lieu, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 82,
    size: 8,
    color: rgb(0.7, 0.78, 0.9),
  });

  cursorY = PAGE_H - 150;

  // ─── Titre principal ─────────────────────────────────────────────────────
  const typeLabel = {
    CDI: "CONTRAT À DURÉE INDÉTERMINÉE",
    CDD: "CONTRAT À DURÉE DÉTERMINÉE",
    Stage: "CONVENTION DE STAGE",
    Freelance: "CONTRAT DE PRESTATION (FREELANCE)",
  }[contractType];

  drawText(typeLabel, {
    x: MARGIN_X,
    y: cursorY,
    size: 16,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 8;
  drawRect(MARGIN_X, cursorY, 60, 2, nexusGold);
  cursorY -= 30;

  // ─── Bloc Entre les soussignés ───────────────────────────────────────────
  drawText("ENTRE LES SOUSSIGNÉS :", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 18;

  drawText("L'EMPLOYEUR", {
    x: MARGIN_X,
    y: cursorY,
    size: 8,
    font: helveticaBold,
    color: grayMid,
  });
  cursorY -= 14;
  drawText("NEXUS RCA SARL", {
    x: MARGIN_X,
    y: cursorY,
    size: 11,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 14;
  drawParagraph(
    "Société à responsabilité limitée de droit centrafricain. Siège social : Croisement Marabena, Route de l'Aéroport, PO.BOX 1204, Bangui, République Centrafricaine. Représentée par sa Direction.",
    { size: 9, color: grayDark }
  );
  cursorY -= 6;
  drawText("Ci-après désignée \"l'Employeur\".", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    color: grayMid,
    font: helvetica,
  });
  cursorY -= 22;

  drawText("LE SALARIÉ", {
    x: MARGIN_X,
    y: cursorY,
    size: 8,
    font: helveticaBold,
    color: grayMid,
  });
  cursorY -= 14;
  drawText(employee.nom_complet, {
    x: MARGIN_X,
    y: cursorY,
    size: 11,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 16;

  const infoLine = (label: string, value: string | null | undefined) => {
    if (!value) return;
    newPageIfNeeded(13);
    drawText(label, { x: MARGIN_X, y: cursorY, size: 9, color: grayMid });
    drawText(value, { x: MARGIN_X + 110, y: cursorY, size: 9, color: grayDark });
    cursorY -= 13;
  };
  infoLine("Email :", employee.email);
  infoLine("Téléphone :", employee.telephone);
  if (employee.numero_cni) infoLine("N° CNI :", employee.numero_cni);
  if (employee.date_naissance) infoLine("Date de naissance :", formatDate(employee.date_naissance));
  if (employee.adresse) infoLine("Adresse :", employee.adresse);
  cursorY -= 6;
  drawText("Ci-après désigné(e) \"le Salarié\".", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    color: grayMid,
  });
  cursorY -= 22;

  drawText("IL A ÉTÉ CONVENU CE QUI SUIT :", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 22;

  const drawArticle = (num: string, title: string) => {
    newPageIfNeeded(40);
    drawText(`Article ${num} - ${title}`, {
      x: MARGIN_X,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: nexusBlue,
    });
    cursorY -= 6;
    drawRect(MARGIN_X, cursorY, 40, 1, nexusGold);
    cursorY -= 14;
  };

  // ─── Article 1 — Engagement ─────────────────────────────────────────────
  drawArticle("1", "Engagement et fonctions");
  drawParagraph(
    `L'Employeur engage le Salarié en qualité de ${employee.poste}, au sein du département ${employee.departement}.`,
    { size: 10 }
  );
  cursorY -= 4;
  drawParagraph(
    `Le lieu de travail est fixé à ${lieu}. Le Salarié pourra être amené à effectuer des déplacements professionnels en RCA et à l'international, dans le cadre de ses missions.`,
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 2 — Nature et durée ─────────────────────────────────────────
  drawArticle("2", "Nature et durée du contrat");
  if (contractType === "CDI") {
    drawParagraph(
      `Le présent contrat est conclu pour une durée indéterminée à compter du ${formatDateLong(employee.date_embauche)}.`,
      { size: 10 }
    );
  } else if (contractType === "CDD" && cddEndDate) {
    drawParagraph(
      `Le présent contrat est conclu pour une durée déterminée à compter du ${formatDateLong(employee.date_embauche)} jusqu'au ${formatDateLong(cddEndDate)}.`,
      { size: 10 }
    );
  } else if (contractType === "Stage") {
    drawParagraph(
      `La présente convention de stage est conclue à compter du ${formatDateLong(employee.date_embauche)}, dans le cadre du parcours de formation du Stagiaire.`,
      { size: 10 }
    );
  } else if (contractType === "Freelance") {
    drawParagraph(
      `Le présent contrat de prestation prend effet à compter du ${formatDateLong(employee.date_embauche)}. Le Prestataire intervient en qualité de travailleur indépendant.`,
      { size: 10 }
    );
  }
  cursorY -= 16;

  // ─── Article 3 — Période d'essai ─────────────────────────────────────────
  drawArticle("3", "Période d'essai");
  drawParagraph(
    `Le contrat comporte une période d'essai de ${periodEssai(contractType)}, durant laquelle chaque partie peut rompre le contrat sans indemnité, sous réserve du respect des délais de prévenance prévus par la législation centrafricaine en vigueur.`,
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 4 — Rémunération ────────────────────────────────────────────
  drawArticle("4", "Rémunération");
  const rem = contractType === "Stage"
    ? `Une gratification mensuelle de ${formatMoney(employee.salaire_base)} sera versée au Stagiaire, conformément aux usages en vigueur.`
    : `Le Salarié percevra une rémunération brute de ${formatMoney(employee.salaire_base)} par période (fréquence : ${employee.frequence_paie}), payable selon les modalités en vigueur à la société.`;
  drawParagraph(rem, { size: 10 });
  cursorY -= 4;
  drawParagraph(
    "Cette rémunération pourra être révisée selon les performances et l'évolution du poste, dans le respect des dispositions légales et conventionnelles applicables.",
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 5 — Durée du travail ────────────────────────────────────────
  drawArticle("5", "Durée du travail");
  drawParagraph(
    "La durée de travail hebdomadaire est fixée selon les usages applicables à la société et la législation centrafricaine en vigueur. Les heures supplémentaires éventuelles seront traitées conformément au cadre légal et conventionnel.",
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 6 — Confidentialité ─────────────────────────────────────────
  drawArticle("6", "Confidentialité et loyauté");
  drawParagraph(
    "Le Salarié s'engage à observer la plus stricte confidentialité sur les informations, dossiers et données clients dont il aurait connaissance dans le cadre de ses fonctions, pendant la durée du contrat et après sa cessation. Il s'interdit notamment toute exploitation directe ou indirecte d'informations sensibles relatives aux clients, partenaires et prestations de l'Employeur.",
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 7 — Loi applicable ──────────────────────────────────────────
  drawArticle("7", "Loi applicable et juridiction");
  drawParagraph(
    "Le présent contrat est régi par le droit de la République Centrafricaine. Tout litige relatif à son exécution, son interprétation ou sa résiliation sera soumis à la juridiction compétente de Bangui, après tentative préalable de règlement amiable entre les parties.",
    { size: 10 }
  );
  cursorY -= 24;

  // ─── Signatures ──────────────────────────────────────────────────────────
  newPageIfNeeded(120);
  drawText(`Fait à ${lieu.split(",")[0]}, le ${formatDate(dateGen)}`, {
    x: MARGIN_X,
    y: cursorY,
    size: 10,
    color: grayDark,
  });
  cursorY -= 24;

  drawText("En double exemplaire, dont un remis à chaque partie.", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    color: grayMid,
  });
  cursorY -= 30;

  const sigBoxW = (TEXT_WIDTH - 30) / 2;
  const sigY = cursorY;

  drawText("L'EMPLOYEUR", {
    x: MARGIN_X,
    y: sigY,
    size: 9,
    font: helveticaBold,
    color: nexusBlue,
  });
  drawText("NEXUS RCA SARL", {
    x: MARGIN_X,
    y: sigY - 14,
    size: 10,
    font: helveticaBold,
    color: nexusBlue,
  });
  drawRect(MARGIN_X, sigY - 90, sigBoxW, 1, grayLight);
  drawText("Signature et cachet", {
    x: MARGIN_X,
    y: sigY - 100,
    size: 8,
    color: grayMid,
  });

  const xR = MARGIN_X + sigBoxW + 30;
  drawText("LE SALARIÉ", {
    x: xR,
    y: sigY,
    size: 9,
    font: helveticaBold,
    color: nexusBlue,
  });
  drawText(employee.nom_complet, {
    x: xR,
    y: sigY - 14,
    size: 10,
    font: helveticaBold,
    color: nexusBlue,
  });
  drawText('"Lu et approuvé" + signature', {
    x: xR,
    y: sigY - 30,
    size: 8,
    color: grayMid,
  });
  drawRect(xR, sigY - 90, sigBoxW, 1, grayLight);
  drawText("Signature", {
    x: xR,
    y: sigY - 100,
    size: 8,
    color: grayMid,
  });

  // ─── Footer ──────────────────────────────────────────────────────────────
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_W,
      height: 28,
      color: rgb(0.97, 0.98, 0.99),
    });
    p.drawText(
      sanitizeForPdf(
        "Nexus RCA SARL - Bangui, RCA - contact@nexusrca.com - +236 73 26 96 92"
      ),
      {
        x: MARGIN_X,
        y: 11,
        size: 8,
        font: helvetica,
        color: grayMid,
      }
    );
    p.drawText(`Page ${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN_X - 50,
      y: 11,
      size: 8,
      font: helvetica,
      color: grayMid,
    });
  }

  return await pdfDoc.save();
}
