// ============================================================================
// LIB — Logo officiel Nexus RCA pour les PDF générés CÔTÉ SERVEUR.
// Fichier : public/brand/nexus-mark.png — rastérisation de
// components/ui/NexusLogoMark.tsx (HomePage). Jamais public/icones (lettre N).
// JAMAIS bloquant : si la lecture échoue, le PDF sort sans logo.
// ============================================================================

import { readFileSync } from "fs";
import path from "path";
import type { PDFDocument, PDFImage } from "pdf-lib";
import { NEXUS_LOGO_MARK_PATH } from "@/lib/brand-logo";

let cache: Uint8Array | null | undefined;

export function getLogoBytes(): Uint8Array | null {
  if (cache !== undefined) return cache;
  try {
    cache = new Uint8Array(readFileSync(path.join(process.cwd(), NEXUS_LOGO_MARK_PATH)));
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
