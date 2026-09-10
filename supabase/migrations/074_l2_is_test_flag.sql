-- ============================================================================
-- 074 — L2 : indicateur is_test (NEXUS_RCA_SPECIFICATION_COMPLETE.md,
-- Decision #9 ; detail dans BRIEF_L2_L3_POUR_CLAUDE_CODE.md, lot L2).
--
-- Additif uniquement : NOT NULL DEFAULT false, aucune valeur existante
-- modifiee. Permet de creer des comptes/donnees TEST_ qui ne faussent
-- jamais un compteur reel (filtrage cote application, voir
-- lib/exclude-test-data.ts).
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.demandes ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.payments ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.payment_links ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.expenses ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.appointments ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.employees ADD COLUMN is_test boolean NOT NULL DEFAULT false;

CREATE INDEX idx_profiles_is_test ON public.profiles (is_test) WHERE is_test = false;
CREATE INDEX idx_clients_is_test ON public.clients (is_test) WHERE is_test = false;
CREATE INDEX idx_demandes_is_test ON public.demandes (is_test) WHERE is_test = false;
CREATE INDEX idx_payments_is_test ON public.payments (is_test) WHERE is_test = false;
CREATE INDEX idx_payment_links_is_test ON public.payment_links (is_test) WHERE is_test = false;
CREATE INDEX idx_expenses_is_test ON public.expenses (is_test) WHERE is_test = false;
CREATE INDEX idx_appointments_is_test ON public.appointments (is_test) WHERE is_test = false;
CREATE INDEX idx_employees_is_test ON public.employees (is_test) WHERE is_test = false;

COMMENT ON COLUMN public.profiles.is_test IS 'Compte TEST_ (L2) : exclu par defaut de tout compteur/rapport/export. Ne jamais recevoir d''email/SMS/WhatsApp reel.';
COMMENT ON COLUMN public.clients.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
COMMENT ON COLUMN public.demandes.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
COMMENT ON COLUMN public.payments.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
COMMENT ON COLUMN public.payment_links.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
COMMENT ON COLUMN public.expenses.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
COMMENT ON COLUMN public.appointments.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
COMMENT ON COLUMN public.employees.is_test IS 'Donnee de demonstration (L2) : exclue par defaut de tout compteur/rapport/export.';
