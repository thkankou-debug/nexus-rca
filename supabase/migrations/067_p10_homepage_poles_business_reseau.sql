-- ============================================================================
-- 067 — P10 : ajoute 2 lignes `services` pour les poles "Accompagnement
-- business" et "Reseau international", jusque-la absents de la table et
-- donc affiches en dur sur la Homepage (retour Thierry 06/09/2026 : "les 8
-- expertises doivent provenir du CMS, pas de cartes codees en dur").
--
-- Description reprise mot pour mot du texte deja publie sur le site
-- (ServicesGrid.tsx, PILIERS_FALLBACK) - aucun contenu invente.
-- Ces 2 poles n'ont pas de page /services/<slug> dediee : le slug sert
-- uniquement de cle CMS pour le titre/la description, le lien reel de la
-- carte homepage reste gere cote composant (financement / a-propos).
-- ============================================================================

INSERT INTO public.services (slug, nom, categorie, description, tarif_type, ordre_affichage) VALUES
  ('accompagnement-business', 'Accompagnement business', 'Accompagnement business',
   'Strategie, partenariats, entree de marche. Pour entrepreneurs et entreprises ambitieuses.', 'sur_devis', 13),
  ('reseau-international', 'Reseau international', 'Reseau international',
   'Trois poles actifs : Bangui (siege), Europe, Canada. Une equipe, une methode, partout.', 'sur_devis', 14)
ON CONFLICT (slug) DO NOTHING;
