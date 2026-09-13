-- ============================================================================
-- 063 — P8 : is_verified/is_published sur agency_settings, temoignages,
-- partenaires (regle P8 : un champ institutionnel/temoignage/partenaire ne
-- s'affiche que renseigne + verifie + publie ; toute modification de la
-- valeur remet is_verified a false, par trigger DB).
--
-- Les trois tables sont a 0 ligne (verifie avant migration) : aucun
-- backfill a risque, aucun consommateur public existant ne lit encore ces
-- tables (temoignages/partenaires publics sont pour l'instant en dur dans
-- les composants de la page d'accueil — le branchement au CMS est P10).
-- ============================================================================

ALTER TABLE public.agency_settings
  ADD COLUMN is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN is_published boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.reset_agency_settings_verification()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF NEW.valeur IS DISTINCT FROM OLD.valeur THEN
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_agency_settings_reset_verification
  BEFORE UPDATE ON public.agency_settings
  FOR EACH ROW EXECUTE FUNCTION reset_agency_settings_verification();

-- temoignages : ajoute is_verified/is_published a cote de `verifie`/`status`
-- existants (conserves, legacy). La policy publique passe desormais par
-- is_verified + is_published, seule source de verite pour l'affichage.
ALTER TABLE public.temoignages
  ADD COLUMN is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN is_published boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.temoignages.verifie IS 'Legacy (P3) — remplace par is_verified (P8). Conserve, non supprime.';
COMMENT ON COLUMN public.temoignages.status IS 'Legacy (P3) — remplace par is_published (P8). Conserve, non supprime.';

DROP POLICY IF EXISTS "Public can read active verified temoignages" ON public.temoignages;
CREATE POLICY "Public can read verified published temoignages" ON public.temoignages
  FOR SELECT USING (is_verified = true AND is_published = true);

CREATE OR REPLACE FUNCTION public.reset_temoignage_verification()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF NEW.auteur_nom IS DISTINCT FROM OLD.auteur_nom
     OR NEW.auteur_role IS DISTINCT FROM OLD.auteur_role
     OR NEW.contenu IS DISTINCT FROM OLD.contenu
     OR NEW.note IS DISTINCT FROM OLD.note THEN
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_temoignages_reset_verification
  BEFORE UPDATE ON public.temoignages
  FOR EACH ROW EXECUTE FUNCTION reset_temoignage_verification();

-- partenaires : aucune notion de verification n'existait avant P8.
ALTER TABLE public.partenaires
  ADD COLUMN is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN is_published boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Public can read active partenaires" ON public.partenaires;
CREATE POLICY "Public can read verified published partenaires" ON public.partenaires
  FOR SELECT USING (is_verified = true AND is_published = true);

CREATE OR REPLACE FUNCTION public.reset_partenaire_verification()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF NEW.nom IS DISTINCT FROM OLD.nom
     OR NEW.logo_url IS DISTINCT FROM OLD.logo_url
     OR NEW.site_url IS DISTINCT FROM OLD.site_url
     OR NEW.description IS DISTINCT FROM OLD.description THEN
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_partenaires_reset_verification
  BEFORE UPDATE ON public.partenaires
  FOR EACH ROW EXECUTE FUNCTION reset_partenaire_verification();

-- ============================================================================
-- Peuplement de `services` — 12 pages reelles /services/*, inventoriees et
-- confirmees par Thierry le 06/09/2026 (voir docs/DETTE.md #15) :
-- - etudes et bourses restent 2 services distincts malgre le chevauchement
--   thematique (Etudes au Canada), meme pole.
-- - billets -> Assurance et voyage ; change/transfert -> Reseau international.
-- - nexus-ia hors des 8 poles officiels (categorie 'transverse').
-- - Pole "Accompagnement business" volontairement sans service pour
--   l'instant : aucune page reelle n'y correspond, pas de ligne inventee.
-- description reprise du texte deja publie (lib/services.ts / metadata des
-- pages), jamais de texte invente. delai_indicatif laisse NULL partout :
-- aucune valeur consolidee et verifiee n'existe aujourd'hui par service
-- (regle du chiffre honnete, §I.6).
-- ============================================================================

INSERT INTO public.services (slug, nom, categorie, description, tarif_type, ordre_affichage) VALUES
  ('visa', 'Visa & e-Visa', 'Visa et mobilite',
   'Canada, Europe, Etats-Unis — les bons papiers, au bon format, au bon moment.', 'sur_devis', 1),
  ('administratif', 'Services administratifs', 'Services administratifs',
   'CV, traductions, formulaires — la paperasse faite proprement et vite.', 'sur_devis', 2),
  ('financement', 'Incubateur & Financement en partenariat', 'Financement et incubation',
   'Partenariat direct, accompagnement et investissement dans des projets selectionnes.', 'sur_devis', 3),
  ('digitalisation', 'Digital & developpement d''activite', 'Digitalisation et technologie',
   'Sites web, WhatsApp Business, visibilite — donnez a votre activite la presence digitale qu''elle merite.', 'sur_devis', 4),
  ('assurance', 'Assurance & mobilite internationale', 'Assurance et voyage',
   'Cabinet de courtage assurance Nexus RCA — voyage, visa Schengen, sante internationale, etudes et mobilite business.', 'sur_devis', 5),
  ('billets', 'Billet d''avion & Hotels', 'Assurance et voyage',
   'Comparez, reservez, voyagez — directement via les meilleures plateformes mondiales.', 'sur_devis', 6),
  ('etudes', 'Etudes au Canada — admission & permis', 'Etudes internationales',
   'Acces structure aux etablissements canadiens et securisation du permis d''etudes.', 'sur_devis', 7),
  ('bourses', 'Bourses d''etudes Canada', 'Etudes internationales',
   'De la recherche de l''universite a la lettre d''admission — nous gerons tout.', 'sur_devis', 8),
  ('tcf', 'Preparation TCF Canada', 'Etudes internationales',
   'Le test de francais qui fait la difference pour votre dossier d''immigration.', 'sur_devis', 9),
  ('change', 'Change de devises', 'Reseau international',
   'FCFA, EUR, USD, CAD — des taux competitifs et des transactions securisees.', 'sur_devis', 10),
  ('transfert', 'Transfert d''argent', 'Reseau international',
   'Western Union, MoneyGram, Ria — vos transferts partent et arrivent vite.', 'sur_devis', 11),
  ('nexus-ia', 'Nexus IA', 'transverse',
   'Un assistant intelligent pour repondre a vos questions a toute heure.', 'sur_devis', 12)
ON CONFLICT (slug) DO NOTHING;
