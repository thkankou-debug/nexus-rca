import { NextResponse } from "next/server";

// ============================================================================
// API : POST /api/payment-links/[reference]/declare
// Migration 034/P1b point 5 : route neutralisée en même temps que la page
// /payer/[reference]. Le flux de déclaration par référence est retiré : la
// référence séquentielle ne doit plus jamais déclencher d'écriture. Aucune
// requête base de données ici, volontairement — voir
// app/payer/[reference]/page.tsx pour le même principe côté lecture.
// Le nouveau flux vit sur /api/payment-links/t/[token]/declare.
// ============================================================================

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Ce mode de déclaration n'est plus disponible. Contactez votre conseiller Nexus RCA avec votre référence pour obtenir un nouveau lien de paiement.",
    },
    { status: 410 }
  );
}
