-- ============================================================================
-- 041 — CLOTURE P1b POINT 8 : REVOKE EXECUTE FROM PUBLIC sur fonctions trigger
--
-- La migration 036 a fait REVOKE EXECUTE ... FROM anon, authenticated, mais
-- PUBLIC accorde l'execution par defaut a toute fonction Postgres et n'avait
-- jamais ete revoque : le revoke n'avait donc aucun effet reel (tout role
-- est implicitement membre de PUBLIC). Verifie le 05/09/2026 :
-- has_function_privilege('public', <oid>, 'EXECUTE') = true sur les 5
-- fonctions ci-dessous avant cette migration.
--
-- Ces 5 fonctions ont RETURNS trigger : Postgres refuse nativement de les
-- appeler hors du mecanisme de trigger, donc le trou n'etait pas exploitable
-- via un appel RPC direct. Correctif de rigueur, pas de vulnerabilite active.
--
-- find_available_agent (RETURNS uuid, reellement appelable en RPC) reste
-- volontairement non revoque, decision documentee en P1b : necessaire aux
-- parcours publics.
-- ============================================================================

REVOKE EXECUTE ON FUNCTION public.assign_demande_to_agent() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_link_appointment_to_client() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_link_demande_to_client() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_link_orphan_demandes_on_profile_creation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_specialist_agents() FROM PUBLIC;
