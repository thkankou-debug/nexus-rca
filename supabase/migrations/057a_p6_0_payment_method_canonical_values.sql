-- P6-0 etape 4, lot 4.1 : payment_method (partage entre mode_paiement et
-- method) manque une traduction canonique pour 'carte' et 'autre'. Les
-- autres valeurs francaises (cheque, western_union, moneygram,
-- mobile_money) sont deja des mots neutres reutilisables tels quels.

ALTER TYPE payment_method ADD VALUE 'card';
ALTER TYPE payment_method ADD VALUE 'other';
