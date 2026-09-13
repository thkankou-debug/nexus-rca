-- 070 — P9 Lot 2 : le client peut consulter (SELECT uniquement) sa propre
-- facture et ses lignes. Meme schema que la migration 069 (devis).
CREATE POLICY "Client can read own factures" ON public.factures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = factures.client_record_id
        AND c.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Client can read own facture_lignes" ON public.facture_lignes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.factures f
      JOIN public.clients c ON c.id = f.client_record_id
      WHERE f.id = facture_lignes.facture_id
        AND c.profile_id = (SELECT auth.uid())
    )
  );
