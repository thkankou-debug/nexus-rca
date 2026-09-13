// ============================================================================
// LIB — Logo officiel Nexus RCA pour les PDF générés CÔTÉ SERVEUR
// (demande Thierry 12/09/2026 : « le logo partout sur les fichiers PDF »).
// Même fichier que le BrandMark de l'interface (public/icones/icon-192.png),
// aucune ressource graphique inventée. JAMAIS bloquant : si la lecture ou
// l'embarquement échoue, le PDF sort sans logo.
// Pour les PDF générés côté navigateur, voir lib/pdf-logo-client.ts.
// ============================================================================

import { readFileSync } from "fs";
import path from "path";
import type { PDFDocument, PDFImage } from "pdf-lib";

let cache: Uint8Array | null | undefined;

export function getLogoBytes(): Uint8Array | null {
  if (cache !== undefined) return cache;
  try {
    cache = new Uint8Array(
      readFileSync(path.join(process.cwd(), "public", "icones", "icon-192.png"))
    );
  } catch {
    cache = null;
  }
  return cache;
}

/** Embarque le logo dans le document — null si indisponible (jamais d'erreur). */
export async function embedNexusLogo(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const bytes = getLogoBytes();
    return bytes ? await pdfDoc.embedPng(bytes) : null;
  } catch {
    return null;
  }
}
