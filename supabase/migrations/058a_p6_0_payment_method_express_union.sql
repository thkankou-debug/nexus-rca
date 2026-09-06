-- P6-0 etape 4, lot 4.2 : payment_links.methode_choisie peut valoir
-- 'express_union' (service mobile local RCA, distinct de Western Union -
-- voir CLAUDE.md, 6 methodes Orange/MTN/Express RCA/Virement/Especes/
-- Stripe) -- absent de l'enum payment_method partage. Trouve en
-- preparant la correction de payment-links/[reference]/verify/route.ts.

ALTER TYPE payment_method ADD VALUE 'express_union';
