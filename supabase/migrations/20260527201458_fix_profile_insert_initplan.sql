-- Fix final : la policy "Users can insert own profile" creee dans la migration
-- security_warnings_fix utilisait auth.uid() non wrappe. On rebascule en
-- (select auth.uid()) pour eviter le re-eval par ligne.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = (select auth.uid()));
