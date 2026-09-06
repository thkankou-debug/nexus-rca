import type { PDFPage, PDFFont } from "pdf-lib";
import { rgb } from "pdf-lib";

// P6, D5 : sanitize partagee pour tout texte dessine via pdf-lib. Remplace
// les caracteres hors WinAnsi (espaces insecables Unicode issus de
// toLocaleString("fr-FR"), accents) qui font planter pdf-lib. Meme logique
// que celle deja utilisee dans app/api/payment-links/[reference]/verify/
// route.ts (seul consommateur pdf-lib existant avant P6), extraite ici en
// utilitaire partage pour ne pas la dupliquer dans les fichiers migres.
export function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u202f/g, " ") // espace insecable etroit (le bug)
    .replace(/\u00a0/g, " ") // espace insecable normal
    .replace(/\u2009/g, " ") // espace fin
    .replace(/\u200a/g, " ") // espace tres fin
    .replace(/\u2007/g, " ") // espace de chiffre
    .replace(/\u2060/g, "") // word joiner
    .replace(/\u00e9/g, "e") // e accent aigu
    .replace(/\u00e8/g, "e") // e accent grave
    .replace(/\u00ea/g, "e") // e accent circonflexe
    .replace(/\u00eb/g, "e") // e trema
    .replace(/\u00e0/g, "a") // a accent grave
    .replace(/\u00e2/g, "a") // a accent circonflexe
    .replace(/\u00ee/g, "i") // i accent circonflexe
    .replace(/\u00ef/g, "i") // i trema
    .replace(/\u00f4/g, "o") // o accent circonflexe
    .replace(/\u00f6/g, "o") // o trema
    .replace(/\u00f9/g, "u") // u accent grave
    .replace(/\u00fb/g, "u") // u accent circonflexe
    .replace(/\u00fc/g, "u") // u trema
    .replace(/\u00e7/g, "c") // c cedille
    .replace(/\u00c9/g, "E") // E accent aigu majuscule
    .replace(/\u00c8/g, "E") // E accent grave majuscule
    .replace(/\u00ca/g, "E") // E accent circonflexe majuscule
    .replace(/\u00c0/g, "A") // A accent grave majuscule
    .replace(/\u00c7/g, "C") // C cedille majuscule
    // Filtre tout autre caractere non-ASCII restant
    .replace(/[^\x20-\x7E]/g, "?");
}

// P6, D5 : helpers de dessin pdf-lib partages entre les fichiers migres.
// pdf-lib mesure depuis le bas a gauche (jsPDF depuis le haut a gauche) :
// topY se comporte comme le y de jsPDF (croissant vers le bas), converti
// uniquement au moment de dessiner via pageHeight. sanitizeForPdf()
// applique systematiquement sur tout texte dessine.
export function drawText(
  page: PDFPage,
  pageHeight: number,
  font: PDFFont,
  text: string,
  x: number,
  topY: number,
  size: number,
  color: ReturnType<typeof rgb>,
  align: "left" | "right" = "left"
) {
  const safe = sanitizeForPdf(text);
  const width = font.widthOfTextAtSize(safe, size);
  const drawX = align === "right" ? x - width : x;
  page.drawText(safe, { x: drawX, y: pageHeight - topY, size, font, color });
}

export function drawFilledRect(
  page: PDFPage,
  pageHeight: number,
  x: number,
  topY: number,
  width: number,
  height: number,
  color: ReturnType<typeof rgb>
) {
  page.drawRectangle({ x, y: pageHeight - topY - height, width, height, color });
}