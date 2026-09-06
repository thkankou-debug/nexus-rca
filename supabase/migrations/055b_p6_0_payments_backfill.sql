-- P6-0 etape 2 : backfill controle, ligne par ligne, valeurs tranchees a la
-- main (pas de regle automatique) apres verification individuelle contre
-- montant_recu/montant_total reels. amount doit representer ce qui a ete
-- reellement encaisse (montant_recu), pas le prix total (montant_total) --
-- c'etait l'erreur des 2 lignes partielles avant cette migration.

-- PAY-2026-77FC62 : partiel, 100 000 recus sur 250 000
UPDATE payments
SET status = 'partial', amount = 100000, amount_xaf = 100000
WHERE id = '4d484752-5875-454a-b1df-f84c392f3ea6';

-- PAY-2026-A05289 : partiel, 150 000 recus sur 400 000
UPDATE payments
SET status = 'partial', amount = 150000, amount_xaf = 150000
WHERE id = 'a3946546-0ee3-4af4-86df-332f46a154da';

-- PAY-2026-A86BE5 : deja correct (150 000 = 150 000), pas de changement de
-- valeur necessaire, mais confirmee explicitement plutot que laissee de cote.
UPDATE payments
SET status = 'paid', amount = 150000, amount_xaf = 150000
WHERE id = 'd7d403fe-473c-4875-9df9-264d03775636';

ALTER TABLE payments
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL;
