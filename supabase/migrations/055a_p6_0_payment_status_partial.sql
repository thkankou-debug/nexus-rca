-- P6-0 etape 2, decision D6 : payment_status (partage entre statut et status)
-- n'a pas de valeur anglaise pour "partiellement paye" -- ecart reel trouve
-- en analysant les 3 paiements existants (2/3 avaient status='paid' alors
-- que montant_recu < montant_total). validated/failed restent dans le type,
-- jamais supprimes, simplement plus utilises (meme principe que P3).

ALTER TYPE payment_status ADD VALUE 'partial';
