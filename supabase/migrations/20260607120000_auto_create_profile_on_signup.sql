-- =============================================================================
-- Création automatique du profil public à l'inscription (côté serveur)
-- =============================================================================
-- Contexte / bug corrigé :
--   L'inscription créait le profil en deux temps : supabase.auth.signUp() PUIS
--   un INSERT direct dans public.profiles depuis le navigateur.
--   La policy RLS de profiles est « FOR INSERT TO authenticated
--   WITH CHECK (id = auth.uid()) ». Or, quand la confirmation d'email est
--   activée, auth.signUp() ne renvoie PAS de session : le client reste en rôle
--   « anon » et l'INSERT est refusé par le RLS -> l'écran de validation
--   affichait « Une erreur est survenue ».
--
-- Solution (pattern recommandé par Supabase) :
--   Un trigger SECURITY DEFINER sur auth.users crée le profil avec les droits
--   du propriétaire (contourne le RLS), à partir des métadonnées passées via
--   options.data lors du signUp. Fonctionne que la confirmation d'email soit
--   activée ou non.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (
      id, email, prenom, nom, telephone, structure, poste, code_postal,
      categorie_pro, categorie_pro_autre, region, tranche_age, public_accompagne,
      newsletter_consent, cgu_accepted_at, privacy_accepted_at, status, is_admin
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
      COALESCE(NEW.raw_user_meta_data->>'nom', ''),
      NULLIF(NEW.raw_user_meta_data->>'telephone', ''),
      NULLIF(NEW.raw_user_meta_data->>'structure', ''),
      NULLIF(NEW.raw_user_meta_data->>'poste', ''),
      NULLIF(NEW.raw_user_meta_data->>'code_postal', ''),
      COALESCE(NEW.raw_user_meta_data->>'categorie_pro', ''),
      NULLIF(NEW.raw_user_meta_data->>'categorie_pro_autre', ''),
      NULLIF(NEW.raw_user_meta_data->>'region', ''),
      NULLIF(NEW.raw_user_meta_data->>'tranche_age', ''),
      NULLIF(NEW.raw_user_meta_data->>'public_accompagne', ''),
      COALESCE((NEW.raw_user_meta_data->>'newsletter_consent')::boolean, false),
      now(),
      now(),
      'en_attente',
      false
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ne jamais bloquer la création du compte auth si l'insertion du profil
    -- échoue : on trace simplement l'erreur. Le profil pourra être complété
    -- par l'upsert client (cf. lib/auth.ts) lorsqu'une session est disponible.
    RAISE WARNING 'handle_new_user a échoué pour %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Cette fonction n'a pas vocation à être appelée via l'API REST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
