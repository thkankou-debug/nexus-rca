-- 073 — P10 : descriptions reelles pour accompagnement-business et
-- reseau-international, cohérentes avec le contenu des pages publiques
-- livre le 07/09/2026 (validees par Thierry). Ne remplace pas une donnee
-- inconnue par une donnee inventee : les deux lignes existaient deja
-- (P8, 14 services), seule la valeur du champ description change.

UPDATE public.services
SET description = 'Diagnostic, planification stratégique et plans d''action pour structurer le développement de votre activité.'
WHERE slug = 'accompagnement-business';

UPDATE public.services
SET description = 'Mise en relation professionnelle, recherche de partenaires et coordination de projets entre Bangui, l''Europe et le Canada.'
WHERE slug = 'reseau-international';
