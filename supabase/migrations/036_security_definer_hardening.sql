-- ============================================================================
-- 036 — DURCISSEMENT DES FONCTIONS SECURITY DEFINER (Phase 1b, points 7 et 8)
-- Additive uniquement.
--
-- Point 8 — deux écarts volontaires par rapport au texte de la feuille de
-- route, vérifiés par grep sur le code applicatif avant d'écrire cette
-- migration (voir compte-rendu) :
--   - find_available_agent : CONSERVÉE exécutable par anon/authenticated.
--     Appelée en RPC réel depuis app/api/appointments/create/route.ts (prise
--     de RDV publique, sans authentification requise). La révoquer aurait
--     cassé la prise de RDV pour tout visiteur non connecté.
--   - gen_demande_ref : CONSERVÉE exécutable par anon/authenticated.
--     Appelée explicitement (pas déclenchée comme trigger) depuis
--     trigger_demande_ref, qui n'est PAS SECURITY DEFINER et s'exécute donc
--     avec les droits de l'appelant. Comme n'importe qui peut créer une
--     `demande` (policy INSERT WITH CHECK (true)), révoquer aurait cassé la
--     génération automatique de référence pour les demandes publiques.
-- Les autres fonctions listées sont soit de purs triggers (jamais appelés
-- explicitement, donc jamais soumis au contrôle EXECUTE lors de leur
-- déclenchement), soit déclenchées uniquement via une route déjà en
-- service_role (gen_insurance_quote_ref via trigger_insurance_quote_ref,
-- déclenché par app/api/assurance/devis/route.ts qui utilise déjà
-- getAdminClient()), soit non appelées du tout aujourd'hui (get_occupied_slots).
-- ============================================================================

-- ── 7. search_path fixé sur les 13 fonctions SECURITY DEFINER recensées ────

ALTER FUNCTION public.is_staff(uuid) SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.gen_demande_ref() SET search_path = public;
ALTER FUNCTION public.assign_demande_to_agent() SET search_path = public;
ALTER FUNCTION public.auto_link_appointment_to_client() SET search_path = public;
ALTER FUNCTION public.auto_link_demande_to_client() SET search_path = public;
ALTER FUNCTION public.auto_link_orphan_demandes_on_profile_creation() SET search_path = public;
ALTER FUNCTION public.find_available_agent(date) SET search_path = public;
ALTER FUNCTION public.get_occupied_slots(date) SET search_path = public;
ALTER FUNCTION public.gen_insurance_quote_ref() SET search_path = public;
ALTER FUNCTION public.notify_specialist_agents() SET search_path = public;

-- ── 8. Fermeture de l'exécution RPC directe pour les fonctions de trigger ──
-- (assign_demande_to_agent, auto_link_*, notify_specialist_agents,
--  handle_new_user, gen_insurance_quote_ref, get_occupied_slots)
-- is_staff / is_admin / get_user_role restent exécutables : des policies en
-- dépendent directement dans leur clause USING.
-- find_available_agent / gen_demande_ref restent exécutables : voir en-tête.

REVOKE EXECUTE ON FUNCTION public.assign_demande_to_agent() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_link_appointment_to_client() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_link_demande_to_client() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_link_orphan_demandes_on_profile_creation() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_specialist_agents() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_insurance_quote_ref() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_occupied_slots(date) FROM anon, authenticated;
