-- ============================================================================
-- 089 — PRESTATIONS DE PROXIMITÉ (rejet de l'interface « encaissement
-- libre » par Thierry, 12/09/2026 : la caisse professionnelle doit couvrir
-- toutes les prestations au premier plan, pas via un formulaire caché).
--
-- Les 8 prestations créées ici sont EXACTEMENT celles listées par Thierry
-- dans son instruction « Caisse ouverte » (§1 de l'addendum) — aucune
-- prestation ni tarification inventée par le développement :
-- tarif_type='sur_devis' (prix saisi à l'encaissement) tant que Thierry ne
-- fixe pas les tarifs dans « Services et tarifs » ; dès qu'un tarif fixe
-- est renseigné, il se pré-remplit à la caisse.
--
-- visibilite_publique = false (G5) : vendables au POS, JAMAIS publiées sur
-- le site. Catégorie « Services de proximite » (hors des 8 pôles — même
-- statut que « transverse », voir POLE_TO_CATEGORIES qui la mappe à []).
-- ordre_affichage négatif : ces tuiles du quotidien s'affichent EN PREMIER
-- à la caisse. Idempotent par slug.
-- ============================================================================

INSERT INTO public.services (slug, nom, categorie, tarif_type, status, visibilite_publique, ordre_affichage)
VALUES
  ('pressing',              'Pressing',                      'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('pressing-repassage',    'Pressing avec repassage',       'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('photocopies',           'Photocopies',                   'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('scan-numerisation',     'Scan et numérisation',          'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('saisie-textes',         'Saisie et mise en forme de textes', 'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('traduction',            'Traduction',                    'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('plastification',        'Plastification',                'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('location-materiel',     'Location de matériel',          'Services de proximite', 'sur_devis', 'actif', false, -10)
ON CONFLICT (slug) DO NOTHING;
