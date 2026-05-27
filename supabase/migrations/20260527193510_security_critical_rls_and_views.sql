-- =============================================================================
-- ETAPE 1 / 3 : Erreurs critiques de securite Supabase
-- =============================================================================
-- Corrige :
--   * 6 tables publiques sans RLS active (policies existent deja mais ignorees)
--   * 4 vues definies en SECURITY DEFINER (bypass RLS de l appelant)
-- =============================================================================

-- 1. Activer RLS sur les 6 tables publiques manquantes.
-- Les policies SELECT publique existent deja (lecture libre), on ne touche pas
-- au comportement actuel : on active juste le RLS pour qu elles soient evaluees.
ALTER TABLE public.cles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiches_cles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapes_parcours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcours_fiches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcours_guides ENABLE ROW LEVEL SECURITY;

-- 2. Recreer les 4 vues en security_invoker = true (Postgres 15+).
-- Sans cela, la vue s execute avec les droits de son owner (postgres) et
-- contourne le RLS de l utilisateur appelant.

CREATE OR REPLACE VIEW public.analytics_fiches
WITH (security_invoker = true) AS
SELECT
    f.id AS fiche_id,
    f.nom,
    f.format,
    f.etape_id,
    count(DISTINCT c.user_id)   AS nb_consultants,
    count(c.id)                 AS nb_consultations,
    count(DISTINCT fav.user_id) AS nb_favoris,
    count(DISTINCT r.id)        AS nb_retours,
    round(avg(r.note), 1)       AS note_moyenne
FROM public.fiches f
LEFT JOIN public.consultations c   ON c.fiche_id   = f.id
LEFT JOIN public.favoris       fav ON fav.fiche_id = f.id
LEFT JOIN public.retours       r   ON r.fiche_id   = f.id
WHERE f.publie = true
GROUP BY f.id, f.nom, f.format, f.etape_id;

CREATE OR REPLACE VIEW public.analytics_users_categorie
WITH (security_invoker = true) AS
SELECT
    categorie_pro,
    count(*)                                  AS nb_users,
    count(*) FILTER (WHERE status = 'active') AS nb_actifs
FROM public.profiles
WHERE is_admin = false
GROUP BY categorie_pro;

CREATE OR REPLACE VIEW public.analytics_users_region
WITH (security_invoker = true) AS
SELECT
    region,
    count(*)                                  AS nb_users,
    count(*) FILTER (WHERE status = 'active') AS nb_actifs
FROM public.profiles
WHERE is_admin = false
GROUP BY region;

CREATE OR REPLACE VIEW public.user_segments
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.prenom,
    p.nom,
    p.email,
    p.categorie_pro,
    p.structure,
    p.region,
    p.created_at AS inscrit_le,
    p.last_seen_at,
    count(DISTINCT u.id)       FILTER (WHERE u.event_type = 'session_start' AND u.occurred_at > (now() - interval '30 days')) AS sessions_30j,
    count(DISTINCT u.fiche_id) FILTER (WHERE u.event_type = 'fiche_view'    AND u.occurred_at > (now() - interval '30 days')) AS fiches_uniques_30j,
    count(*)                   FILTER (WHERE u.event_type = 'pdf_download'  AND u.occurred_at > (now() - interval '30 days')) AS pdf_telecharges_30j,
    CASE
        WHEN count(DISTINCT u.id) FILTER (WHERE u.event_type = 'session_start' AND u.occurred_at > (now() - interval '30 days')) >= 10 THEN 'Très actif'
        WHEN count(DISTINCT u.id) FILTER (WHERE u.event_type = 'session_start' AND u.occurred_at > (now() - interval '30 days')) >= 3  THEN 'Actif'
        WHEN count(DISTINCT u.id) FILTER (WHERE u.event_type = 'session_start' AND u.occurred_at > (now() - interval '30 days')) >= 1  THEN 'Occasionnel'
        ELSE 'Dormant'
    END AS segment
FROM public.profiles p
LEFT JOIN public.usage_log u ON u.user_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.prenom, p.nom, p.email, p.categorie_pro, p.structure, p.region, p.created_at, p.last_seen_at;
