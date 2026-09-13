"use client";

// ============================================================================
// LIB — Logo officiel Nexus RCA pour les PDF générés CÔTÉ NAVIGATEUR
// (demande Thierry 12/09/2026 : « le logo partout sur les fichiers PDF »).
// Même fichier que le BrandMark (public/icones/icon-192.png). JAMAIS
// bloquant : hors ligne ou en cas d'échec, le PDF sort sans logo.
// ============================================================================

import type { PDFDocument, PDFImage } from "pdf-lib";

const LOGO_URL = "/icones/icon-192.png";
let cache: Uint8Array | null | undefined;

async function loadBytes(): Promise<Uint8Array | null> {
  if (cache !== undefined) return cache;
  try {
    const res = await fetch(LOGO_URL);
    cache = res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    cache = null;
  }
  return cache;
}

/** Embarque le logo dans le document — null si indisponible (jamais d'erreur). */
export async function embedNexusLogoClient(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const bytes = await loadBytes();
    return bytes ? await pdfDoc.embedPng(bytes) : null;
  } catch {
    return null;
  }
}
