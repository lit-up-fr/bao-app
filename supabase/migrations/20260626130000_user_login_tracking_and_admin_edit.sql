-- =============================================================================
-- Section Utilisateurs : suivi des connexions + édition des profils par l'admin
-- =============================================================================
-- Ajoute :
--   1) Le suivi du nombre de connexions (login_count) et de la dernière
--      connexion, alimentés automatiquement à chaque connexion réelle via un
--      trigger sur auth.users.last_sign_in_at.
--   2) Une fonction is_super_admin() (la détection super-admin n'existait que
--      côté client jusqu'ici).
--   3) Le droit pour un admin d'éditer les infos des utilisateurs SIMPLES
--      (non-admins) ; seul le super-admin peut éditer un autre admin.
-- Idempotent.
-- =============================================================================


-- =============================================================================
-- 1) Suivi des connexions
-- =============================================================================
-- last_seen_at existe déjà (mis à jour au signIn) et sert de « dernière
-- connexion ». On ajoute un compteur de connexions.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;

-- Trigger : à chaque connexion, GoTrue met à jour auth.users.last_sign_in_at.
-- On incrémente alors login_count et on rafraîchit last_seen_at côté profil.
-- SECURITY DEFINER (s'exécute en tant que propriétaire) + garde-fou : une erreur
-- ici ne doit JAMAIS bloquer la connexion de l'utilisateur.
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at
     AND NEW.last_sign_in_at IS NOT NULL THEN
    BEGIN
      UPDATE public.profiles
         SET login_count = COALESCE(login_count, 0) + 1,
             last_seen_at = NEW.last_sign_in_at
       WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_user_login a échoué pour %: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Pas d'exposition via l'API REST.
REVOKE EXECUTE ON FUNCTION public.handle_user_login() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

-- Backfill : on ne peut pas reconstituer l'historique (GoTrue ne stocke pas de
-- compteur). On initialise à 1 les comptes ayant déjà une connexion connue, pour
-- que l'affichage ne parte pas à 0 pour des utilisateurs actifs. Le compteur
-- devient ensuite exact à chaque nouvelle connexion.
UPDATE public.profiles p
SET login_count = 1
FROM auth.users u
WHERE u.id = p.id
  AND u.last_sign_in_at IS NOT NULL
  AND COALESCE(p.login_count, 0) = 0;


-- =============================================================================
-- 2) is_super_admin() : reflète la logique côté client
-- =============================================================================
-- Super-admin si l'utilisateur courant est admin ET :
--   - 'super_admin' figure dans admin_roles[], OU
--   - admin_role = 'super_admin' (legacy), OU
--   - aucun rôle explicite n'est défini (admin « historique » = super-admin,
--     cf. app/admin/utilisateurs/page.tsx).
-- SECURITY DEFINER : lit profiles sans être bloquée par le RLS (même motif que
-- is_admin(), pas de récursion car le propriétaire contourne le RLS).
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_admin = true
      AND (
        'super_admin' = ANY (COALESCE(admin_roles, ARRAY[]::text[]))
        OR admin_role = 'super_admin'
        OR (
          (admin_roles IS NULL OR cardinality(admin_roles) = 0)
          AND admin_role IS NULL
        )
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, anon;


-- =============================================================================
-- 3) profiles : édition par l'admin
-- =============================================================================
-- Règle :
--   - chacun édite son propre profil ;
--   - un super-admin édite n'importe quel profil ;
--   - un admin « simple » édite uniquement les profils NON-admin
--     (il ne peut pas modifier un autre admin).
-- Le trigger prevent_profile_privilege_escalation continue de réserver la
-- modification de is_admin / admin_role(s) / status aux admins ; et le WITH CHECK
-- ci-dessous empêche un admin simple de promouvoir quelqu'un admin (is_admin
-- devenant true -> seul un super-admin passe le contrôle).
DROP POLICY IF EXISTS "Update profiles" ON public.profiles;
CREATE POLICY "Update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
  id = (select auth.uid())
  OR public.is_super_admin()
  OR (public.is_admin() AND is_admin = false)
)
WITH CHECK (
  id = (select auth.uid())
  OR public.is_super_admin()
  OR (public.is_admin() AND is_admin = false)
);
