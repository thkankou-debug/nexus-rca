-- 069 — P9 Lot 1 : le client peut consulter (SELECT uniquement) son propre
-- devis et ses lignes. Jointure client_record_id -> clients.profile_id =
-- auth.uid(), coherente avec D7 (clients = entite personne canonique).
-- Aucune policy INSERT/UPDATE/DELETE pour le client : la seule ecriture
-- possible pour ce role passe par POST /api/devis/:id/accept (service_role,
-- avec ses propres controles applicatifs).
CREATE POLICY "Client can read own devis" ON public.devis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = devis.client_record_id
        AND c.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Client can read own devis_lignes" ON public.devis_lignes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.devis d
      JOIN public.clients c ON c.id = d.client_record_id
      WHERE d.id = devis_lignes.devis_id
        AND c.profile_id = (SELECT auth.uid())
    )
  );
