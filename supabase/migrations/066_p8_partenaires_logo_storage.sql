-- ============================================================================
-- 066 — P8 : bucket de stockage pour les logos de partenaires
--
-- Bucket public (logos affiches sur le site public, pas de donnee privee) —
-- la lecture publique est geree par Supabase Storage directement (drapeau
-- `public`), aucune policy SELECT necessaire pour ca. Ecriture reservee
-- admin/super_admin, memes acteurs que cms.partenaire.write.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partenaires-logos', 'partenaires-logos', true, 2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "partenaires_logos_admin_write" ON storage.objects;
CREATE POLICY "partenaires_logos_admin_write" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'partenaires-logos'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    bucket_id = 'partenaires-logos'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );
