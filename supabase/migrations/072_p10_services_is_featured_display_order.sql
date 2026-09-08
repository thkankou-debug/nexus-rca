-- 072 — P10 Étape 1 (E3) : colonnes is_featured/display_order exigées par
-- la feuille de route pour la grille des 8 pôles du site public, en anglais
-- conformément à la règle issue de D1 (services est une table créée en V3).
-- ordre_affichage/categorie/status (français) restent en place : aucun
-- renommage, colonnes additives uniquement.

ALTER TABLE public.services
  ADD COLUMN is_featured boolean NOT NULL DEFAULT true,
  ADD COLUMN display_order integer;

-- Backfill honnête : display_order reprend la valeur réelle déjà utilisée
-- par ordre_affichage, jamais une valeur inventée.
UPDATE public.services
SET display_order = ordre_affichage
WHERE display_order IS NULL;

-- Pour la livraison V3, "les huit sont affichés" (E3) : is_featured=true
-- par défaut pour toutes les lignes existantes, cohérent avec le DEFAULT
-- ci-dessus — aucune ligne n'est mise en avant plus qu'une autre à ce stade.
