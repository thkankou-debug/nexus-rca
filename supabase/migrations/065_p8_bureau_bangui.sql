-- ============================================================================
-- 065 — P8 : bureau de Bangui (donnee reelle fournie par Thierry le
-- 06/09/2026), remplace l'ancienne adresse "Relais Sica, vers Hopital
-- General" corrigee dans les 21 fichiers qui la dupliquaient en dur (voir
-- docs/DETTE.md #16).
-- ============================================================================

INSERT INTO public.bureaux (nom, adresse, ville, pays, telephone, email, horaires, status)
VALUES (
  'Siège social — Bangui',
  'Croisement Marabena, Route de l''Aéroport, PO.BOX 1204',
  'Bangui',
  'République Centrafricaine',
  '+236 73 26 96 92',
  'contact@nexusrca.com',
  'Sur rendez-vous uniquement',
  'actif'
);
