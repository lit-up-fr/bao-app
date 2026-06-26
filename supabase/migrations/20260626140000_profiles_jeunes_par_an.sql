-- =============================================================================
-- profiles : estimation du nombre de jeunes accompagnés par an (fourchette)
-- =============================================================================
-- Collecté à l'inscription (« entre ___ et ___ jeunes par an »). Sert à estimer
-- la PORTÉE INDIRECTE de la Boîte à Outils (jeunes touchés via les pros), pour
-- la mesure d'impact financeurs. Deux entiers nullables (fourchette basse/haute).
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS jeunes_par_an_min integer,
  ADD COLUMN IF NOT EXISTS jeunes_par_an_max integer;


-- Le profil est créé côté serveur par le trigger on_auth_user_created à partir
-- des métadonnées d'inscription. On met la fonction à jour pour récupérer les
-- deux nouveaux champs (passés via options.data lors du signUp).
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
      jeunes_par_an_min, jeunes_par_an_max,
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
      NULLIF(NEW.raw_user_meta_data->>'jeunes_par_an_min', '')::integer,
      NULLIF(NEW.raw_user_meta_data->>'jeunes_par_an_max', '')::integer,
      COALESCE((NEW.raw_user_meta_data->>'newsletter_consent')::boolean, false),
      now(),
      now(),
      'en_attente',
      false
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ne jamais bloquer la création du compte auth si l'insertion du profil
    -- échoue : on trace simplement l'erreur.
    RAISE WARNING 'handle_new_user a échoué pour %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;
