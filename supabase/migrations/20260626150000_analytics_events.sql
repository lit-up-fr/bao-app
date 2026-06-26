-- =============================================================================
-- analytics_events : journal d'événements d'usage (fondation de tracking)
-- =============================================================================
-- Capture les comportements non couverts par consultations/favoris/retours :
--   - session_start : une visite (1 par session de navigation) -> sessions,
--     rétention, cohortes, utilisateurs actifs dans le temps.
--   - pdf_download  : téléchargement d'une fiche PDF -> intention d'usage réel.
--   - search        : recherche effectuée (+ requête et nb de résultats) ->
--     lacunes de contenu (recherches sans résultat), besoins exprimés.
-- Extensible via la colonne metadata (jsonb).
--
-- NB : remplace la table usage_log (jamais alimentée). Le tableau de bord
-- d'impact lira directement analytics_events.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- on conserve l'événement même si le compte est supprimé (historique d'impact)
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type  text NOT NULL,
  fiche_id    uuid,
  metadata    jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Écriture : un utilisateur connecté ne peut journaliser que ses propres events.
DROP POLICY IF EXISTS "Users insert own events" ON public.analytics_events;
CREATE POLICY "Users insert own events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Lecture : l'admin voit tout (analytics), l'utilisateur voit les siens.
DROP POLICY IF EXISTS "Read events" ON public.analytics_events;
CREATE POLICY "Read events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.is_admin() OR (select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type     ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user     ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred ON public.analytics_events (occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_fiche    ON public.analytics_events (fiche_id);
