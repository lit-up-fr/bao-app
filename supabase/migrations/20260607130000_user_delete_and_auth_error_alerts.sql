-- =============================================================================
-- 1) Réparer la suppression d'utilisateur depuis l'admin
-- =============================================================================
-- La migration de sécurité du 27/05 a révoqué l'EXECUTE de
-- delete_user_completely() pour tout le monde sauf service_role, ce qui casse
-- le bouton « Supprimer définitivement » de l'admin (appelé côté navigateur en
-- tant qu'utilisateur authenticated -> refusé).
--
-- On expose un wrapper SECURITY DEFINER qui (a) vérifie que l'appelant est admin
-- et (b) délègue à delete_user_completely. Le wrapper s'exécute avec les droits
-- de son propriétaire, qui conserve l'EXECUTE sur delete_user_completely.

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Action réservée aux administrateurs';
  END IF;

  PERFORM public.delete_user_completely(target_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;


-- =============================================================================
-- 2) Alertes admin : journaliser les erreurs d'inscription / connexion
-- =============================================================================
-- Table de journal. is_system = true pour les erreurs anormales (RLS, base,
-- profil manquant, serveur...) qui doivent déclencher une alerte ; false pour
-- les cas normaux (mauvais mot de passe, email déjà utilisé...).

CREATE TABLE IF NOT EXISTS public.auth_error_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       text NOT NULL,                 -- 'signup' | 'login'
  email      text,
  message    text,
  is_system  boolean NOT NULL DEFAULT false,
  seen       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_error_logs_created_at_idx
  ON public.auth_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS auth_error_logs_alert_idx
  ON public.auth_error_logs (is_system, seen);

ALTER TABLE public.auth_error_logs ENABLE ROW LEVEL SECURITY;

-- Lecture / mise à jour (marquer comme lu) / suppression réservées aux admins.
DROP POLICY IF EXISTS "Admins read auth_error_logs"   ON public.auth_error_logs;
DROP POLICY IF EXISTS "Admins update auth_error_logs" ON public.auth_error_logs;
DROP POLICY IF EXISTS "Admins delete auth_error_logs" ON public.auth_error_logs;

CREATE POLICY "Admins read auth_error_logs"
  ON public.auth_error_logs FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins update auth_error_logs"
  ON public.auth_error_logs FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete auth_error_logs"
  ON public.auth_error_logs FOR DELETE TO authenticated
  USING (public.is_admin());

-- Pas de policy INSERT : l'écriture passe uniquement par la fonction ci-dessous
-- (SECURITY DEFINER), pour qu'un visiteur non connecté puisse journaliser une
-- erreur sans pouvoir écrire n'importe quoi directement dans la table.
CREATE OR REPLACE FUNCTION public.log_auth_error(
  p_kind      text,
  p_email     text,
  p_message   text,
  p_is_system boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.auth_error_logs (kind, email, message, is_system)
  VALUES (
    left(coalesce(p_kind, 'unknown'), 20),
    left(p_email, 320),
    left(p_message, 1000),
    coalesce(p_is_system, false)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_auth_error(text, text, text, boolean)
  TO anon, authenticated;
