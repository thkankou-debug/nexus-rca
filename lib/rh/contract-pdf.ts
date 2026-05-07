// ============================================================================
// CONTRACT PDF — Génération contrat de travail server-side via pdf-lib
// ----------------------------------------------------------------------------
// Pattern projet : sanitizeForPdf systématique, format FCFA sans espace
// insécable, A4, navy/orange Nexus, 2 espaces signature.
// ============================================================================

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Employee } from "@/types";

export type ContractType = "CDI" | "CDD" | "Stage" | "Freelance";

export interface BuildContractOptions {
  employee: Employee;
  contractType: ContractType;
  cddEndDate?: string;       // requis si CDD
  lieuTravail?: string;      // default "Bangui, RCA"
  reference: string;         // ex: CONTRAT-2026-001
  generatedAt?: string;      // ISO date, default now
}

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

const MOIS_FR = [
  "janvier", "fevrier", "mars", "avril", "mai", "juin",
  "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
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

// ─── Period d'essai par type contrat ──────────────────────────────────────
function periodEssai(type: ContractType): string {
  switch (type) {
    case "CDI": return "3 mois renouvelables une fois";
    case "CDD": return "1 mois";
    case "Stage": return "15 jours";
    case "Freelance": return "Sans periode d essai (mission)";
  }
}

// ─── Génération PDF ────────────────────────────────────────────────────────
export async function buildContractPdf(opts: BuildContractOptions): Promise<Uint8Array> {
  const { employee, contractType, cddEndDate, lieuTravail, reference, generatedAt } = opts;
  const dateGen = generatedAt ?? new Date().toISOString();
  const lieu = lieuTravail ?? "Bangui, Republique Centrafricaine";

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const nexusBlue = rgb(0.047, 0.11, 0.251);
  const nexusOrange = rgb(1, 0.4, 0);
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
  drawRect(0, PAGE_H - 110, 6, 110, nexusOrange);

  drawText("NEXUS RCA", {
    x: MARGIN_X,
    y: PAGE_H - 50,
    size: 22,
    font: helveticaBold,
    color: white,
  });
  drawText("Agence internationale - Bangui, Republique Centrafricaine", {
    x: MARGIN_X,
    y: PAGE_H - 70,
    size: 9,
    color: rgb(0.7, 0.78, 0.9),
  });
  drawText("Relais Sica, vers Hopital General - contact@nexusrca.com", {
    x: MARGIN_X,
    y: PAGE_H - 84,
    size: 8,
    color: rgb(0.7, 0.78, 0.9),
  });

  // Reference + date top right
  drawText(reference, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 50,
    size: 11,
    font: helveticaBold,
    color: white,
  });
  drawText(`Etabli le ${formatDate(dateGen)}`, {
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
    CDI: "CONTRAT A DUREE INDETERMINEE",
    CDD: "CONTRAT A DUREE DETERMINEE",
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
  drawRect(MARGIN_X, cursorY, 60, 2, nexusOrange);
  cursorY -= 30;

  // ─── Bloc Entre les soussignes ───────────────────────────────────────────
  drawText("ENTRE LES SOUSSIGNES :", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
  });
  cursorY -= 18;

  // Employeur
  drawText("L EMPLOYEUR", {
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
    "Societe a responsabilite limitee de droit centrafricain. Siege social : Relais Sica, vers Hopital General, Bangui, Republique Centrafricaine. Representee par sa Direction.",
    { size: 9, color: grayDark }
  );
  cursorY -= 6;
  drawText("Ci-apres designee \"l Employeur\".", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    color: grayMid,
    font: helvetica,
  });
  cursorY -= 22;

  // Salarie
  drawText("LE SALARIE", {
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
  infoLine("Telephone :", employee.telephone);
  if (employee.numero_cni) infoLine("N CNI :", employee.numero_cni);
  if (employee.date_naissance) infoLine("Date de naissance :", formatDate(employee.date_naissance));
  if (employee.adresse) infoLine("Adresse :", employee.adresse);
  cursorY -= 6;
  drawText("Ci-apres designe(e) \"le Salarie\".", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    color: grayMid,
  });
  cursorY -= 22;

  drawText("IL A ETE CONVENU CE QUI SUIT :", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
  });
  cursorY -= 22;

  // ─── Helpers articles ────────────────────────────────────────────────────
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
    drawRect(MARGIN_X, cursorY, 40, 1, nexusOrange);
    cursorY -= 14;
  };

  // ─── Article 1 — Engagement et fonctions ─────────────────────────────────
  drawArticle("1", "Engagement et fonctions");
  drawParagraph(
    `L Employeur engage le Salarie en qualite de ${employee.poste}, au sein du departement ${employee.departement}.`,
    { size: 10 }
  );
  cursorY -= 4;
  drawParagraph(
    `Le lieu de travail est fixe a ${lieu}. Le Salarie pourra etre amene a effectuer des deplacements professionnels en RCA et a l international, dans le cadre de ses missions.`,
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 2 — Nature et duree du contrat ──────────────────────────────
  drawArticle("2", "Nature et duree du contrat");
  if (contractType === "CDI") {
    drawParagraph(
      `Le present contrat est conclu pour une duree indeterminee a compter du ${formatDateLong(employee.date_embauche)}.`,
      { size: 10 }
    );
  } else if (contractType === "CDD" && cddEndDate) {
    drawParagraph(
      `Le present contrat est conclu pour une duree determinee a compter du ${formatDateLong(employee.date_embauche)} jusqu au ${formatDateLong(cddEndDate)}.`,
      { size: 10 }
    );
  } else if (contractType === "Stage") {
    drawParagraph(
      `La presente convention de stage est conclue a compter du ${formatDateLong(employee.date_embauche)}, dans le cadre du parcours de formation du Stagiaire.`,
      { size: 10 }
    );
  } else if (contractType === "Freelance") {
    drawParagraph(
      `Le present contrat de prestation prend effet a compter du ${formatDateLong(employee.date_embauche)}. Le Prestataire intervient en qualite de travailleur independant.`,
      { size: 10 }
    );
  }
  cursorY -= 16;

  // ─── Article 3 — Periode d essai ─────────────────────────────────────────
  drawArticle("3", "Periode d essai");
  drawParagraph(
    `Le contrat comporte une periode d essai de ${periodEssai(contractType)}, durant laquelle chaque partie peut rompre le contrat sans indemnite, sous reserve du respect des delais de prevenance prevus par la legislation centrafricaine en vigueur.`,
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 4 — Remuneration ────────────────────────────────────────────
  drawArticle("4", "Remuneration");
  const rem = contractType === "Stage"
    ? `Une gratification mensuelle de ${formatMoney(employee.salaire_base)} sera versee au Stagiaire, conformement aux usages en vigueur.`
    : `Le Salarie percevra une remuneration brute de ${formatMoney(employee.salaire_base)} par periode (frequence : ${employee.frequence_paie}), payable selon les modalites en vigueur a la societe.`;
  drawParagraph(rem, { size: 10 });
  cursorY -= 4;
  drawParagraph(
    "Cette remuneration pourra etre revisee selon les performances et l evolution du poste, dans le respect des dispositions legales et conventionnelles applicables.",
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 5 — Duree du travail ────────────────────────────────────────
  drawArticle("5", "Duree du travail");
  drawParagraph(
    "La duree de travail hebdomadaire est fixee selon les usages applicables a la societe et la legislation centrafricaine en vigueur. Les heures supplementaires eventuelles seront traitees conformement au cadre legal et conventionnel.",
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 6 — Confidentialite ─────────────────────────────────────────
  drawArticle("6", "Confidentialite et loyaute");
  drawParagraph(
    "Le Salarie s engage a observer la plus stricte confidentialite sur les informations, dossiers, et donnees clients dont il aurait connaissance dans le cadre de ses fonctions, pendant la duree du contrat et apres sa cessation. Il s interdit notamment toute exploitation directe ou indirecte d informations sensibles relatives aux clients, partenaires et prestations de l Employeur.",
    { size: 10 }
  );
  cursorY -= 16;

  // ─── Article 7 — Loi applicable ──────────────────────────────────────────
  drawArticle("7", "Loi applicable et juridiction");
  drawParagraph(
    "Le present contrat est regi par le droit de la Republique Centrafricaine. Tout litige relatif a son execution, son interpretation ou sa resiliation sera soumis a la juridiction competente de Bangui, apres tentative prealable de reglement amiable entre les parties.",
    { size: 10 }
  );
  cursorY -= 24;

  // ─── Signatures ──────────────────────────────────────────────────────────
  newPageIfNeeded(120);
  drawText(`Fait a ${lieu.split(",")[0]}, le ${formatDate(dateGen)}`, {
    x: MARGIN_X,
    y: cursorY,
    size: 10,
    color: grayDark,
  });
  cursorY -= 24;

  drawText("En double exemplaire, dont un remis a chaque partie.", {
    x: MARGIN_X,
    y: cursorY,
    size: 9,
    color: grayMid,
  });
  cursorY -= 30;

  // Deux blocs signature cote a cote
  const sigBoxW = (TEXT_WIDTH - 30) / 2;
  const sigY = cursorY;

  // Employeur
  drawText("L EMPLOYEUR", {
    x: MARGIN_X,
    y: sigY,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
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

  // Salarie
  const xR = MARGIN_X + sigBoxW + 30;
  drawText("LE SALARIE", {
    x: xR,
    y: sigY,
    size: 9,
    font: helveticaBold,
    color: nexusOrange,
  });
  drawText(employee.nom_complet, {
    x: xR,
    y: sigY - 14,
    size: 10,
    font: helveticaBold,
    color: nexusBlue,
  });
  drawText('"Lu et approuve" + signature', {
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
