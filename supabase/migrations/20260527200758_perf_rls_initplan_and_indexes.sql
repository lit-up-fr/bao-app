-- =============================================================================
-- ETAPE 3 / 3 : Perf RLS + indexes + nettoyage doublons de policies
-- =============================================================================
-- Corrige :
--   * 17 auth_rls_initplan : wrap auth.uid() dans (select auth.uid())
--   * 84 multiple_permissive_policies : fusion ou suppression des doublons
--   * 7 unindexed_foreign_keys : creation des index manquants
--   * 3 public_bucket_allows_listing : suppression des SELECT publiques sur
--     buckets publics (URLs publiques continuent de marcher sans RLS)
-- Non traite : 17 unused_index (laisses : indexes preventifs pour futur volume)
-- =============================================================================


-- =============================================================================
-- A. NETTOYAGE DES DOUBLONS "Public read X" / "Lecture publique X"
-- =============================================================================

-- A.1 cles, etapes_parcours, fiches_cles, parcours_fiches, parcours_guides :
-- les 2 policies ont USING=true et le meme effet. On garde "Lecture publique X"
-- et on droppe le doublon "Public read X".
DROP POLICY IF EXISTS "Public read cles"            ON public.cles;
DROP POLICY IF EXISTS "Public read etapes_parcours" ON public.etapes_parcours;
DROP POLICY IF EXISTS "Public read fiches_cles"     ON public.fiches_cles;
DROP POLICY IF EXISTS "Public read parcours_fiches" ON public.parcours_fiches;
DROP POLICY IF EXISTS "Public read parcours_guides" ON public.parcours_guides;

-- A.2 fiches : "Public read fiches" (USING true) doublonne ET CONTOURNE
-- "Lecture publique fiches publiees" (USING publie=true). On le supprime, et
-- on remplace par une SELECT unique qui couvre les 2 cas : non-admin voit les
-- fiches publiees, admin voit tout.
DROP POLICY IF EXISTS "Public read fiches"               ON public.fiches;
DROP POLICY IF EXISTS "Lecture publique fiches publiees" ON public.fiches;

CREATE POLICY "Lecture fiches"
ON public.fiches FOR SELECT TO public
USING (publie = true OR public.is_admin());


-- =============================================================================
-- B. WRAP auth.uid() DANS (select auth.uid()) + FUSION POLICIES DOUBLONNES
-- =============================================================================

-- B.1 admin_alerts : "Admins manage alerts" (ALL) — remplacer EXISTS par is_admin()
DROP POLICY IF EXISTS "Admins manage alerts" ON public.admin_alerts;
CREATE POLICY "Admins manage alerts"
ON public.admin_alerts FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- B.2 analyses : wrap (select auth.uid())
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can read own analyses"   ON public.analyses;

CREATE POLICY "Users can delete own analyses"
ON public.analyses FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own analyses"
ON public.analyses FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can read own analyses"
ON public.analyses FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);


-- B.3 besoins : "Admins ecriture besoins" en ALL doublonne le SELECT public.
-- On le scinde en INSERT/UPDATE/DELETE.
DROP POLICY IF EXISTS "Admins ecriture besoins" ON public.besoins;

CREATE POLICY "Admins insert besoins"
ON public.besoins FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins update besoins"
ON public.besoins FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete besoins"
ON public.besoins FOR DELETE TO authenticated
USING (public.is_admin());


-- B.4 consultations : wrap (select auth.uid())
DROP POLICY IF EXISTS "Users can manage own consultations" ON public.consultations;
CREATE POLICY "Users can manage own consultations"
ON public.consultations FOR ALL TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);


-- B.5 favoris : wrap (select auth.uid())
DROP POLICY IF EXISTS "Users can manage own favoris" ON public.favoris;
CREATE POLICY "Users can manage own favoris"
ON public.favoris FOR ALL TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);


-- B.6 profiles : fusionner admin + user en une seule policy par cmd
DROP POLICY IF EXISTS "Admins can read all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"   ON public.profiles;

CREATE POLICY "Read profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin() OR id = (select auth.uid()));

CREATE POLICY "Update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin() OR id = (select auth.uid()))
WITH CHECK (public.is_admin() OR id = (select auth.uid()));


-- B.7 propositions : fusionner admin + user sur SELECT
DROP POLICY IF EXISTS "Admins can read all propositions"   ON public.propositions;
DROP POLICY IF EXISTS "Users can read own propositions"    ON public.propositions;
DROP POLICY IF EXISTS "Users can insert own propositions"  ON public.propositions;

CREATE POLICY "Read propositions"
ON public.propositions FOR SELECT TO authenticated
USING (public.is_admin() OR (select auth.uid()) = user_id);

CREATE POLICY "Users can insert own propositions"
ON public.propositions FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);


-- B.8 retours : fusionner admin + user sur SELECT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admins can delete all retours"   ON public.retours;
DROP POLICY IF EXISTS "Admins can read all retours"     ON public.retours;
DROP POLICY IF EXISTS "Admins can update all retours"   ON public.retours;
DROP POLICY IF EXISTS "Anyone can read visible retours" ON public.retours;
DROP POLICY IF EXISTS "Users can delete own retours"    ON public.retours;
DROP POLICY IF EXISTS "Users can insert own retours"    ON public.retours;
DROP POLICY IF EXISTS "Users can update own retours"    ON public.retours;

CREATE POLICY "Read retours"
ON public.retours FOR SELECT TO public
USING (
  is_visible = true
  OR public.is_admin()
  OR (select auth.uid()) = user_id
);

CREATE POLICY "Users can insert own retours"
ON public.retours FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Update retours"
ON public.retours FOR UPDATE TO authenticated
USING (public.is_admin() OR (select auth.uid()) = user_id)
WITH CHECK (public.is_admin() OR (select auth.uid()) = user_id);

CREATE POLICY "Delete retours"
ON public.retours FOR DELETE TO authenticated
USING (public.is_admin() OR (select auth.uid()) = user_id);


-- B.9 usage_log : fusionner admin + user sur SELECT
DROP POLICY IF EXISTS "Admins can view all events" ON public.usage_log;
DROP POLICY IF EXISTS "Users view own events"      ON public.usage_log;
DROP POLICY IF EXISTS "Users insert own events"    ON public.usage_log;

CREATE POLICY "Read usage_log"
ON public.usage_log FOR SELECT TO authenticated
USING (public.is_admin() OR (select auth.uid()) = user_id);

CREATE POLICY "Users insert own events"
ON public.usage_log FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);


-- =============================================================================
-- C. INDEXES SUR FOREIGN KEYS MANQUANTES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_admin_alerts_user_id
  ON public.admin_alerts (user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id
  ON public.analyses (user_id);

CREATE INDEX IF NOT EXISTS idx_corpus_contributions_diagnostic_id
  ON public.corpus_contributions (diagnostic_id);

CREATE INDEX IF NOT EXISTS idx_favoris_fiche_id
  ON public.favoris (fiche_id);

CREATE INDEX IF NOT EXISTS idx_fiches_created_by
  ON public.fiches (created_by);

CREATE INDEX IF NOT EXISTS idx_fiches_updated_by
  ON public.fiches (updated_by);

CREATE INDEX IF NOT EXISTS idx_objectifs_fiches_fiche_id
  ON public.objectifs_fiches (fiche_id);


-- =============================================================================
-- D. STORAGE : supprimer les policies SELECT publiques (les URLs publiques
--    `/storage/v1/object/public/<bucket>/<path>` continuent de marcher sans
--    RLS sur les buckets publics).
-- =============================================================================
DROP POLICY IF EXISTS "Avatars are public"        ON storage.objects;
DROP POLICY IF EXISTS "Public read access"        ON storage.objects;
DROP POLICY IF EXISTS "fiches-images public read" ON storage.objects;
