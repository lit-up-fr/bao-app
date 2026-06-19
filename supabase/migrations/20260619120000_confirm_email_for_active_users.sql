-- =============================================================================
-- Backfill : confirmer l'email Auth des comptes déjà validés par un admin
-- =============================================================================
-- Contexte / bug corrigé :
--   L'application a DEUX validations distinctes :
--     1. La confirmation d'email Supabase Auth (lien envoyé à l'inscription)
--     2. L'approbation admin (public.profiles.status -> 'active')
--   Quand l'admin approuve un compte, le statut passe à 'active' et un email
--   « accès validé, connectez-vous » est envoyé — MAIS l'email Auth n'était
--   jamais confirmé. Résultat : le compte affiche « Actif » côté admin mais
--   Supabase bloque la connexion avec « Email not confirmed ».
--
-- Correctif côté code :
--   La fonction edge send-welcome-email confirme désormais l'email au moment
--   de l'approbation (admin.updateUserById { email_confirm: true }).
--
-- Cette migration règle le cas des comptes DÉJÀ approuvés avant le correctif :
--   on confirme leur email pour les débloquer. Idempotent et sans effet sur les
--   comptes déjà confirmés.
-- =============================================================================

UPDATE auth.users u
SET email_confirmed_at = now()
FROM public.profiles p
WHERE p.id = u.id
  AND p.status = 'active'
  AND u.email_confirmed_at IS NULL;
