-- =============================================================================
-- ETAPE 2 / 3 : Warnings de securite Supabase
-- =============================================================================
-- Corrige :
--   * Storage : policies bucket-agnostic remplacees par des policies scopees
--   * RLS policies "always true" sur objectifs / objectifs_fiches / profiles
--   * Fonctions SECURITY DEFINER : revoke EXECUTE aux roles publics + search_path
-- A faire dans le dashboard (non gerable en SQL) :
--   * Auth > Password protection : activer "Leaked password protection"
-- =============================================================================


-- =============================================================================
-- A. STORAGE : nettoyer les policies trop larges
-- =============================================================================

-- A.1 Supprimer les policies sans filtre bucket (donnaient tout droit sur tous
-- les buckets a tout authenticated, et SELECT public sur tout).
DROP POLICY IF EXISTS "Allow authenticated uploads donthr_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads donthr_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads donthr_2" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads donthr_3" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads zzm4zf_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads zzm4zf_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads zzm4zf_2" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads zzm4zf_3" ON storage.objects;
DROP POLICY IF EXISTS "Public read access zzm4zf_0" ON storage.objects;


-- A.2 fiches-pdf : lecture publique deja couverte par "Public read access".
-- Ecriture (upsert = INSERT + SELECT + UPDATE) reservee aux admins.

CREATE POLICY "fiches-pdf admin select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fiches-pdf' AND public.is_admin());

CREATE POLICY "fiches-pdf admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fiches-pdf' AND public.is_admin());

CREATE POLICY "fiches-pdf admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'fiches-pdf' AND public.is_admin())
WITH CHECK (bucket_id = 'fiches-pdf' AND public.is_admin());

CREATE POLICY "fiches-pdf admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'fiches-pdf' AND public.is_admin());


-- A.3 fiches-images : pas de policy SELECT publique dediee actuellement
-- (la policy "Public read access zzm4zf_0" qui couvrait tout vient d etre droppee).
-- On la cree, scopee au bucket.

CREATE POLICY "fiches-images public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'fiches-images');

CREATE POLICY "fiches-images admin select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fiches-images' AND public.is_admin());

CREATE POLICY "fiches-images admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fiches-images' AND public.is_admin());

CREATE POLICY "fiches-images admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'fiches-images' AND public.is_admin())
WITH CHECK (bucket_id = 'fiches-images' AND public.is_admin());

CREATE POLICY "fiches-images admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'fiches-images' AND public.is_admin());


-- A.4 avatars : SELECT publique deja OK ("Avatars are public"). INSERT scope au
-- folder de l user existe ("Users can upload own avatar"). On complete avec
-- UPDATE + DELETE + SELECT authenticated pour permettre l upsert.

CREATE POLICY "Users can select own avatar"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);


-- =============================================================================
-- B. RLS POLICIES "ALWAYS TRUE" : restreindre aux admins / au bon user
-- =============================================================================

-- B.1 objectifs : write reserve aux admins
DROP POLICY IF EXISTS "Admin delete objectifs" ON public.objectifs;
DROP POLICY IF EXISTS "Admin insert objectifs" ON public.objectifs;
DROP POLICY IF EXISTS "Admin update objectifs" ON public.objectifs;

CREATE POLICY "Admin delete objectifs"
ON public.objectifs FOR DELETE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin insert objectifs"
ON public.objectifs FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin update objectifs"
ON public.objectifs FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- B.2 objectifs_fiches : pareil
DROP POLICY IF EXISTS "Admin delete objectifs_fiches" ON public.objectifs_fiches;
DROP POLICY IF EXISTS "Admin insert objectifs_fiches" ON public.objectifs_fiches;
DROP POLICY IF EXISTS "Admin update objectifs_fiches" ON public.objectifs_fiches;

CREATE POLICY "Admin delete objectifs_fiches"
ON public.objectifs_fiches FOR DELETE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin insert objectifs_fiches"
ON public.objectifs_fiches FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin update objectifs_fiches"
ON public.objectifs_fiches FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- B.3 profiles : un user ne peut creer qu un profil avec son propre auth.uid()
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());


-- =============================================================================
-- C. FONCTIONS SECURITY DEFINER : revoke EXECUTE aux roles publics + search_path
-- =============================================================================

-- C.1 delete_user_completely : reservee a service_role (sinon n importe quel
-- authenticated peut supprimer n importe quel user).
REVOKE EXECUTE ON FUNCTION public.delete_user_completely(uuid)
  FROM PUBLIC, anon, authenticated;

-- C.2 notify_new_registration : trigger function, n a pas a etre exposee via REST.
-- search_path mutable -> fixer pour eviter les attaques par schema squatting.
ALTER FUNCTION public.notify_new_registration() SET search_path = public, pg_temp;
REVOKE EXECUTE ON FUNCTION public.notify_new_registration()
  FROM PUBLIC, anon, authenticated;

-- C.3 rls_auto_enable : event trigger function, jamais appelee via REST.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

-- C.4 set_updated_at : trigger function, fixer son search_path.
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
REVOKE EXECUTE ON FUNCTION public.set_updated_at()
  FROM PUBLIC, anon, authenticated;

-- Note : is_admin() et is_current_user_admin() sont volontairement laissees
-- accessibles aux roles authenticated / anon. Elles sont utilisees dans les
-- policies RLS et ne revelent que l etat admin de l user connecte (true/false).
