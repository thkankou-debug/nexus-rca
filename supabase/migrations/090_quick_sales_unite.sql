-- ============================================================================
-- 090 — Page Encaissement libre (maquette « page d'encaissement libre.png »,
-- instruction Thierry §5, 12/09/2026) : chaque ligne de prestation porte son
-- UNITÉ (prestation, page, pièce, heure, jour…). Additif, texte libre avec
-- défaut — la liste des unités proposées vit dans l'interface, la colonne
-- n'impose pas d'enum pour rester extensible (« ou unité configurée »).
-- ============================================================================

ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS unite text NOT NULL DEFAULT 'prestation';
