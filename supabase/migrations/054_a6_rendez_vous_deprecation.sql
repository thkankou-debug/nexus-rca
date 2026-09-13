-- A6 Lot 4, decision D3 : rendez_vous est obsolete (0 ligne, appointments
-- est la table canonique). Ecritures bloquees, aucune suppression -
-- suppression seulement sur autorisation explicite de Thierry (D3).

DROP POLICY IF EXISTS "Clients can create own rdv" ON rendez_vous;
DROP POLICY IF EXISTS "Staff can manage rdv" ON rendez_vous;

COMMENT ON TABLE rendez_vous IS 'OBSOLETE (D3, 05/09/2026) : remplacee par appointments. Ecritures bloquees (policies INSERT/UPDATE retirees). Conservee en lecture seule, suppression seulement sur autorisation explicite de Thierry.';
