-- ============================================================================
-- 040 — PERFORMANCE DES POLICIES : auth.uid()/email()/role()/jwt() nus → (select ...)
-- (P1c point 3)
--
-- Ne retranscrit aucune policy à la main : ce bloc lit le texte réel de
-- chaque policy depuis pg_policies, applique une substitution regex ciblée
-- (seuls les appels auth.<fn>() NON déjà enveloppés dans un SELECT sont
-- touchés), puis DROP + CREATE avec le texte reconstruit. Sémantique
-- strictement identique : Postgres recalculera le même résultat, mais une
-- seule fois par requête au lieu d'une fois par ligne.
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
  new_qual text;
  new_check text;
  roles_clause text;
  sql_stmt text;
  pattern text := '(?<!SELECT )auth\.(uid|email|role|jwt)\(\)';
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual IS NOT NULL AND qual ~ pattern)
        OR (with_check IS NOT NULL AND with_check ~ pattern)
      )
  LOOP
    new_qual := CASE WHEN pol.qual IS NOT NULL
      THEN regexp_replace(pol.qual, pattern, '(SELECT auth.\1())', 'g')
      ELSE NULL END;
    new_check := CASE WHEN pol.with_check IS NOT NULL
      THEN regexp_replace(pol.with_check, pattern, '(SELECT auth.\1())', 'g')
      ELSE NULL END;

    IF pol.roles = ARRAY['public']::name[] THEN
      roles_clause := '';
    ELSE
      roles_clause := ' TO ' || array_to_string(pol.roles, ', ');
    END IF;

    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    sql_stmt := format('CREATE POLICY %I ON %I.%I FOR %s%s',
      pol.policyname, pol.schemaname, pol.tablename, pol.cmd, roles_clause);
    IF new_qual IS NOT NULL THEN
      sql_stmt := sql_stmt || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      sql_stmt := sql_stmt || format(' WITH CHECK (%s)', new_check);
    END IF;

    EXECUTE sql_stmt;
  END LOOP;
END $$;
