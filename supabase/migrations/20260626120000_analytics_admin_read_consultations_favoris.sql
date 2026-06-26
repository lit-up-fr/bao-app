-- =============================================================================
-- Analytics : autoriser les admins à lire TOUTES les consultations et favoris
-- =============================================================================
-- Bug corrigé :
--   Dans la page Analytics, le compteur global « Consultations » affichait un
--   nombre (ex. 210) mais les « Classements outils » et « Activité utilisateurs »
--   restaient à zéro.
--
-- Cause :
--   Les politiques RLS de `consultations` et `favoris` n'autorisaient QUE la
--   lecture de ses propres lignes — y compris pour un administrateur :
--       USING ((select auth.uid()) = user_id)
--   Contrairement à `profiles` et `retours`, qui ont déjà une lecture admin
--   (public.is_admin()). Or la page Analytics lit les lignes brutes de
--   consultations/favoris côté client puis les croise avec les profils
--   non-admin. Un admin ne voyant que SES propres consultations (et son profil
--   admin étant exclu du croisement), aucune ligne ne correspondait → classements
--   et activité à zéro. Le compteur global, lui, est un COUNT : il renvoyait le
--   nombre de consultations de l'admin connecté (≈ 210), d'où l'incohérence.
--
-- Correctif :
--   Ajouter une lecture admin sur `consultations` et `favoris`, en miroir du
--   motif déjà en place pour `retours`/`profiles`. Les écritures restent
--   strictement limitées au propriétaire de la ligne. Une seule policy par
--   commande (évite le warning multiple_permissive_policies). Idempotent.
-- =============================================================================


-- ─── consultations ───────────────────────────────────────────────────────────
-- Remplace l'ancienne policy FOR ALL « propres lignes » par des policies par
-- commande : SELECT = admin OU propriétaire ; écritures = propriétaire seul.
DROP POLICY IF EXISTS "Users can manage own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Read consultations"                 ON public.consultations;
DROP POLICY IF EXISTS "Users insert own consultations"     ON public.consultations;
DROP POLICY IF EXISTS "Users update own consultations"     ON public.consultations;
DROP POLICY IF EXISTS "Users delete own consultations"     ON public.consultations;

CREATE POLICY "Read consultations"
ON public.consultations FOR SELECT TO authenticated
USING (public.is_admin() OR (select auth.uid()) = user_id);

CREATE POLICY "Users insert own consultations"
ON public.consultations FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own consultations"
ON public.consultations FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own consultations"
ON public.consultations FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);


-- ─── favoris ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own favoris" ON public.favoris;
DROP POLICY IF EXISTS "Read favoris"                 ON public.favoris;
DROP POLICY IF EXISTS "Users insert own favoris"     ON public.favoris;
DROP POLICY IF EXISTS "Users update own favoris"     ON public.favoris;
DROP POLICY IF EXISTS "Users delete own favoris"     ON public.favoris;

CREATE POLICY "Read favoris"
ON public.favoris FOR SELECT TO authenticated
USING (public.is_admin() OR (select auth.uid()) = user_id);

CREATE POLICY "Users insert own favoris"
ON public.favoris FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own favoris"
ON public.favoris FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own favoris"
ON public.favoris FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);
