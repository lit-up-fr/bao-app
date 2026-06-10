-- =============================================================================
-- Durcissement sécurité : anti-escalade de privilèges + RLS analyses
-- =============================================================================
-- Corrige :
--   * profiles : un utilisateur peut mettre à jour SA propre ligne
--     (policy "Update profiles" : id = auth.uid()) sans restriction de colonne.
--     Comme is_admin / admin_role / admin_roles / status vivent dans cette
--     table, un utilisateur lambda pouvait s'auto-promouvoir admin ou
--     s'auto-valider (status = 'active'). On ajoute un garde-fou côté serveur.
--   * diagnostic_analyses / analyses_cache : tables alimentées côté serveur
--     (service_role, qui contourne le RLS). On s'assure que le RLS est actif
--     pour qu'aucune clé anon/authenticated ne puisse les lire librement.
-- Idempotent : ré-exécutable sans risque.
-- =============================================================================


-- =============================================================================
-- 1) profiles : empêcher la modification des champs privilégiés par un non-admin
-- =============================================================================
-- On compare les champs sensibles via to_jsonb(...) ->> 'champ' : cette forme
-- renvoie NULL (sans erreur) si la colonne n'existe pas, ce qui rend le trigger
-- robuste quelle que soit la présence exacte de admin_role / admin_roles.

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() AND (
       to_jsonb(NEW) ->> 'is_admin'    IS DISTINCT FROM to_jsonb(OLD) ->> 'is_admin'
    OR to_jsonb(NEW) ->> 'admin_role'  IS DISTINCT FROM to_jsonb(OLD) ->> 'admin_role'
    OR to_jsonb(NEW) ->> 'admin_roles' IS DISTINCT FROM to_jsonb(OLD) ->> 'admin_roles'
    OR to_jsonb(NEW) ->> 'status'      IS DISTINCT FROM to_jsonb(OLD) ->> 'status'
  ) THEN
    RAISE EXCEPTION 'Modification d''un champ privilégié (is_admin / admin_role(s) / status) réservée aux administrateurs';
  END IF;
  RETURN NEW;
END;
$$;

-- Fonction trigger : pas d'exposition via l'API REST.
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_profile_priv_esc ON public.profiles;
CREATE TRIGGER trg_prevent_profile_priv_esc
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();


-- =============================================================================
-- 2) diagnostic_analyses : données personnelles (email, contexte d'atelier).
--    Écrite par le serveur (service_role) ; lue par l'admin côté navigateur.
--    RLS actif + lecture réservée aux admins.
-- =============================================================================
ALTER TABLE IF EXISTS public.diagnostic_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read diagnostic_analyses" ON public.diagnostic_analyses;
CREATE POLICY "Admins read diagnostic_analyses"
  ON public.diagnostic_analyses FOR SELECT TO authenticated
  USING (public.is_admin());


-- =============================================================================
-- 3) analyses_cache : manipulée uniquement côté serveur (service_role).
--    RLS actif sans policy => inaccessible via anon/authenticated, le
--    service_role continue de fonctionner (il contourne le RLS).
-- =============================================================================
ALTER TABLE IF EXISTS public.analyses_cache ENABLE ROW LEVEL SECURITY;
