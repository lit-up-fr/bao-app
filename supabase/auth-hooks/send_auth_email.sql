-- =============================================================================
-- Correctif : emails d'authentification (réinitialisation de mot de passe,
-- confirmation d'inscription, etc.) envoyés via Resend
-- =============================================================================
-- POURQUOI
--   Le mailer intégré de Supabase n'est pas configuré pour la production
--   (débit très limité, sans domaine vérifié) : ses emails n'arrivent pas /
--   finissent en spam. C'est pour ça que « mot de passe oublié » n'envoie rien,
--   et que les liens de confirmation d'inscription sont « souvent perdus ».
--
-- COMMENT
--   On active le « Send Email Hook » de Supabase Auth : à chaque email que
--   Supabase voudrait envoyer (recovery, signup, magiclink…), il appelle plutôt
--   la fonction Postgres ci-dessous, qui envoie le message via Resend — exactement
--   comme l'email de bienvenue (domaine vérifié noreply@lit-up.fr).
--
-- À FAIRE (3 étapes) :
--   1. Renseigner ta clé Resend ci-dessous (cherche « re_REMPLACE »).
--   2. Exécuter TOUT ce fichier dans : Dashboard Supabase → SQL Editor → Run.
--   3. Activer le hook dans le Dashboard (voir le bloc « ÉTAPE 3 » tout en bas).
-- =============================================================================


-- ─── 1) Extension pg_net : permet à Postgres d'appeler une API HTTP (Resend) ──
-- Généralement déjà activée sur Supabase ; « if not exists » la rend sans risque.
create extension if not exists pg_net;


-- ─── 2) Stocker la clé API Resend dans Vault (chiffrée, jamais en clair) ──────
-- ⚠️ Remplace re_REMPLACE_PAR_TA_CLE_RESEND par ta vraie clé Resend
--    (la même que celle utilisée par la fonction send-welcome-email).
-- Idempotent : crée la clé, ou la met à jour si elle existe déjà.
do $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'resend_api_key';
  if v_id is null then
    perform vault.create_secret('re_REMPLACE_PAR_TA_CLE_RESEND', 'resend_api_key');
  else
    perform vault.update_secret(v_id, 're_REMPLACE_PAR_TA_CLE_RESEND', 'resend_api_key');
  end if;
end $$;


-- ─── 3) La fonction appelée par Supabase Auth pour chaque email ───────────────
create or replace function public.send_auth_email(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email      text := event->'user'->>'email';
  v_data       jsonb := event->'email_data';
  v_action     text := v_data->>'email_action_type';
  v_token_hash text := v_data->>'token_hash';
  v_redirect   text := coalesce(v_data->>'redirect_to', 'https://bao.lit-up.fr');

  -- ⚠️ URL de TON projet Supabase (Settings → API → Project URL).
  --    Le lien de vérification doit pointer ici.
  v_supabase   text := 'https://odadaqpihvcnuprkdchr.supabase.co';

  v_resend_key text;
  v_link       text;
  v_subject    text;
  v_heading    text;
  v_intro      text;
  v_cta        text;
  v_note       text := '';
  v_html       text;
  v_status     bigint;
begin
  -- Lien de vérification, identique à celui que Supabase génère normalement.
  v_link := v_supabase
            || '/auth/v1/verify?token=' || v_token_hash
            || '&type=' || v_action
            || '&redirect_to=' || v_redirect;

  -- Libellés selon le type d'email.
  if v_action = 'recovery' then
    v_subject := 'Réinitialisation de votre mot de passe — Boîte à Outils Lit uP';
    v_heading := 'Réinitialisation de votre mot de passe';
    v_intro   := 'Vous avez demandé à réinitialiser le mot de passe de votre compte de la Boîte à Outils Lit uP. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.';
    v_cta     := 'Choisir un nouveau mot de passe';
    v_note    := 'Ce lien est valable une heure et à usage unique. Si vous n''êtes pas à l''origine de cette demande, ignorez cet email : votre mot de passe restera inchangé.';
  elsif v_action = 'signup' then
    v_subject := 'Confirmez votre adresse email — Boîte à Outils Lit uP';
    v_heading := 'Bienvenue sur la Boîte à Outils Lit uP';
    v_intro   := 'Merci pour votre inscription ! Confirmez votre adresse email en cliquant sur le bouton ci-dessous. Votre accès sera ensuite validé par notre équipe.';
    v_cta     := 'Confirmer mon adresse email';
  elsif v_action = 'magiclink' then
    v_subject := 'Votre lien de connexion — Boîte à Outils Lit uP';
    v_heading := 'Votre lien de connexion';
    v_intro   := 'Cliquez sur le bouton ci-dessous pour vous connecter à la Boîte à Outils Lit uP.';
    v_cta     := 'Me connecter';
  elsif v_action like 'email_change%' then
    v_subject := 'Confirmez votre nouvelle adresse email — Boîte à Outils Lit uP';
    v_heading := 'Confirmez votre nouvelle adresse email';
    v_intro   := 'Confirmez votre nouvelle adresse email pour la Boîte à Outils Lit uP en cliquant sur le bouton ci-dessous.';
    v_cta     := 'Confirmer';
  else
    v_subject := 'Confirmation — Boîte à Outils Lit uP';
    v_heading := 'Confirmation requise';
    v_intro   := 'Cliquez sur le bouton ci-dessous pour confirmer votre action sur la Boîte à Outils Lit uP.';
    v_cta     := 'Confirmer';
  end if;

  -- Corps HTML (même charte que l'email de bienvenue).
  v_html :=
    $html$<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
<img src="https://bao.lit-up.fr/logo-litup.png" alt="Lit uP" style="height: 32px; margin-bottom: 24px;" />
<h1 style="font-size: 22px; color: #2B3442; margin-bottom: 16px;">$html$
    || v_heading ||
    $html$</h1>
<p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">$html$
    || v_intro ||
    $html$</p>
<a href="$html$ || v_link || $html$" style="display: inline-block; padding: 14px 28px; background: #00989D; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">$html$
    || v_cta ||
    $html$</a>
<p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin-top: 24px;">$html$
    || v_note ||
    $html$</p>
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
<p style="font-size: 12px; color: #9ca3af;">L'équipe Lit uP<br /><a href="https://www.lit-up.fr" style="color: #00989D;">www.lit-up.fr</a></p>
</div>$html$;

  -- Récupère la clé Resend depuis Vault.
  select decrypted_secret into v_resend_key
  from vault.decrypted_secrets
  where name = 'resend_api_key';

  if v_resend_key is null then
    -- Clé absente : on signale l'erreur à Supabase Auth (visible dans les logs).
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 500,
        'message', 'Clé Resend introuvable dans Vault (resend_api_key).'
      )
    );
  end if;

  -- Envoi via l'API Resend (asynchrone via pg_net).
  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_resend_key
    ),
    body := jsonb_build_object(
      'from', 'Lit uP <noreply@lit-up.fr>',
      'to', jsonb_build_array(v_email),
      'subject', v_subject,
      'html', v_html
    )
  ) into v_status;

  -- Réponse vide = succès : Supabase Auth n'enverra pas son propre email.
  return '{}'::jsonb;

exception when others then
  -- On remonte l'erreur (visible dans les logs Auth) sans interrompre brutalement.
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 500,
      'message', SQLERRM
    )
  );
end;
$$;


-- ─── 4) Droits : seul Supabase Auth peut exécuter la fonction ─────────────────
grant usage on schema public to supabase_auth_admin;
grant execute on function public.send_auth_email(jsonb) to supabase_auth_admin;
revoke execute on function public.send_auth_email(jsonb) from anon, authenticated, public;


-- =============================================================================
-- ÉTAPE 3 — À FAIRE DANS LE DASHBOARD (une seule fois, pas en SQL)
-- =============================================================================
-- a) Authentication → Hooks → « Send Email Hook »
--      • Enable the hook : ON
--      • Hook type        : Postgres
--      • Schema           : public
--      • Function         : send_auth_email
--      • Save
--
-- b) Authentication → URL Configuration → Redirect URLs
--    Vérifier que cette URL est autorisée (sinon le lien de reset ne marchera pas) :
--      https://bao.lit-up.fr/connexion/nouveau-mot-de-passe
--
-- c) Tester : page « mot de passe oublié » → saisir une adresse inscrite →
--    l'email doit arriver depuis noreply@lit-up.fr.
--    En cas de souci, vérifier les envois dans : Resend → Logs, et côté base :
--      select * from net._http_response order by created desc limit 10;
-- =============================================================================
