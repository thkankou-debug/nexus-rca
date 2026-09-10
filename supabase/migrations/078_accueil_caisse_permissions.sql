-- ============================================================================
-- 078 — NEXUS_RCA_DASHBOARD_ADMINISTRATION.md, Partie 5 étape 1 (suite) :
-- permissions du rôle accueil_caisse (§3.5 du document).
--
-- Accordées : client.read, client.create, client.update.contact,
-- dossier.read.limited, dossier.create, dossier.orient, document.upload,
-- document.request, paiement.record, caisse.session.open,
-- caisse.reconcile.submit, rdv.create, rdv.read.
--
-- Explicitement refusées (absence = refus, rien à insérer) :
-- paiement.validate, caisse.close, note_interne.read, finance.report.read,
-- dossier.status.change, facture.validate.
--
-- Plusieurs de ces permissions sont de nouvelles chaînes, distinctes du
-- catalogue existant (ex. client.update.contact vs client.update déjà
-- utilisée par admin/agent pour une mise à jour complète ; dossier.orient
-- vs dossier.assign ; rdv.read sans portée .own/.all comme les autres
-- rôles). Aucun mapping vers les conventions existantes n'a été inventé —
-- reprises telles quelles depuis le document. Ni le RLS, ni
-- has_permission(), ni aucun écran ne sont modifiés dans cette migration :
-- uniquement le rôle et son catalogue de permissions déclaratif.
-- ============================================================================

INSERT INTO public.role_permissions (role, permission) VALUES
  ('accueil_caisse', 'client.read'),
  ('accueil_caisse', 'client.create'),
  ('accueil_caisse', 'client.update.contact'),
  ('accueil_caisse', 'dossier.read.limited'),
  ('accueil_caisse', 'dossier.create'),
  ('accueil_caisse', 'dossier.orient'),
  ('accueil_caisse', 'document.upload'),
  ('accueil_caisse', 'document.request'),
  ('accueil_caisse', 'paiement.record'),
  ('accueil_caisse', 'caisse.session.open'),
  ('accueil_caisse', 'caisse.reconcile.submit'),
  ('accueil_caisse', 'rdv.create'),
  ('accueil_caisse', 'rdv.read')
ON CONFLICT DO NOTHING;
