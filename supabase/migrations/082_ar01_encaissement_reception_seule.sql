-- ============================================================================
-- 082 — AR-01 (décision Thierry, 12/09/2026) : la réception habilitée est le
-- SEUL point d'encaissement humain au comptoir (cahier des charges EX-06,
-- §6.2 : « retirer un bouton ne suffit pas : toutes les routes
-- d'encaissement existantes doivent être inventoriées puis protégées »).
--
-- Canaux inventoriés (docs/AUDIT_CDC.md §1 EX-06) :
-- 1. POST /api/accueil/pos — canal LÉGITIME (service-role gardé par
--    assertPermission('paiement.record') + session ouverte) : inchangé.
-- 2. Insertion directe quick_sales par agent/admin (QuickSaleForm, RLS) :
--    RETIRÉE ici — les deux policies INSERT sont supprimées. Les policies
--    de LECTURE et UPDATE restent (consultation, reçus, exports).
-- 3. PaymentForm/`payments` : ce n'est PAS un encaissement comptoir mais la
--    saisie de la chaîne §4.3 (déclaré → rapproché → validé) — hors AR-01.
-- 4. Liens de paiement publics : canal en ligne, hors AR-01.
--
-- « Super admin full access on quick_sales » (FOR ALL) est volontairement
-- conservée : c'est le patron RLS super_admin de tout le schéma. Le retrait
-- de l'encaissement super-admin est appliqué au niveau interface (bouton
-- retiré) et reste tracé — le supprimer en RLS casserait les corrections
-- d'exploitation légitimes.
-- ============================================================================

DROP POLICY IF EXISTS "Agent can insert own quick_sales" ON public.quick_sales;
DROP POLICY IF EXISTS "Admin can insert quick_sales" ON public.quick_sales;
