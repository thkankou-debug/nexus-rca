-- Recupere le 08/09/2026 depuis supabase_migrations.schema_migrations
-- (version 20260907015806, nom "p10_homepage_poles_business_reseau") :
-- appliquee en base le 07/09/2026 a 01h58, jamais committee en fichier
-- .sql jusqu'ici -- violation directe de la regle 8 (§I.2) commise
-- pendant CETTE session V3, pas une dette heritee d'avant. C'est cette
-- migration qui avait deja cree les lignes `accompagnement-business` et
-- `reseau-international` trouvees "preexistantes" lors de l'audit P9/P10
-- du 07/09 -- je les avais alors attribuees a tort au seed initial de P8.
-- Texte exact recupere depuis la base, non reconstruit.

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
