"use client";

// ============================================================================
// LIB — Logo officiel Nexus RCA pour les PDF générés CÔTÉ NAVIGATEUR.
// Même fichier que le serveur (public/brand/nexus-mark.png).
// JAMAIS bloquant : hors ligne ou en cas d'échec, le PDF sort sans logo.
// ============================================================================

import type { PDFDocument, PDFImage } from "pdf-lib";
import { NEXUS_LOGO_MARK_URL } from "@/lib/brand-logo";

let cache: Uint8Array | null | undefined;

async function loadBytes(): Promise<Uint8Array | null> {
  if (cache !== undefined) return cache;
  try {
    const res = await fetch(NEXUS_LOGO_MARK_URL);
    cache = res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    cache = null;
  }
  return cache;
}

/** Embarque le logo — l'image est entièrement chargée avant le retour. */
export async function embedNexusLogoClient(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const bytes = await loadBytes();
    return bytes ? await pdfDoc.embedPng(bytes) : null;
  } catch {
    return null;
  }
}
