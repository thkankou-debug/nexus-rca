-- ============================================================================
-- 096 — AUDIT LOG IMMUABLE (cahier Administration §15, SEC-06, 12/09/2026)
-- « Le journal d'audit n'est modifiable par aucun rôle applicatif. »
-- Jusqu'ici la garantie n'existait qu'en creux (aucun écran n'y touche) ;
-- elle devient structurelle : trigger BEFORE UPDATE OR DELETE qui refuse
-- TOUTE modification ou suppression d'une entrée d'audit — y compris via
-- la clé service_role (le trigger s'exécute quel que soit l'appelant).
-- L'INSERT reste libre pour les routes (logAudit). Aucune donnée modifiée.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_log_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUABLE: le journal d''audit ne se modifie ni ne se supprime';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON public.audit_log;
CREATE TRIGGER trg_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_immutable();
