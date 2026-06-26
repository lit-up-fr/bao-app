# Mesure d'impact BAO — feuille de route & décisions

> Mémo de continuité (juin 2026). But : objectiver l'impact pour les financeurs
> (Fondation Pierre Bellon) + améliorer la BAO via l'observation des usages.
> Branche de travail : `claude/charming-noether-dbppod`. Workflow habituel :
> code → SQL appliqué (via MCP Supabase une fois connecté, sinon SQL fourni à
> exécuter) → merge sur `main` (Vercel déploie).

## Déjà livré (sur `main`)

- Emails de réinitialisation de mot de passe via Resend (Send Email Hook).
- Analytics réparé (lecture admin des consultations/favoris — RLS).
- Section Utilisateurs : colonnes « dernière connexion » + « nombre de
  connexions », et édition des profils (admin → non-admins ; super-admin → tous).
- Collecte « nombre de jeunes accompagnés / an » (fourchette) à l'inscription.
- **Phase 1** : table `analytics_events` + suivi `session_start`, `pdf_download`,
  `search` (helper `lib/analytics.ts`).
- **Phase 4** : tableau de bord d'impact `/admin/impact`.

## Décisions validées — intégration Airtable

- **Enquêtes (#4/#5/#6)** : collecte **in-app** dans la BAO (meilleur taux de
  réponse + la BAO sait qui a répondu), PUIS **transfert des réponses vers
  Airtable**. Questions calquées sur les champs Airtable existants pour
  consolidation propre.
- **Synchro BAO → Airtable** : via **Make** (webhook depuis la BAO → Make
  upsert Airtable, matching par email ; aucun secret Airtable dans l'app).
- **Cible Airtable** : base **« Base de données Professionnels »**
  (`appaXNMwXTOXWC3Bg`), table **Professionnels** (`tblPoDAu8nllhe5oh`,
  clé de rapprochement = champ **« Votre adresse email »**) + **nouvelle table
  « Usages BAO »**.
  - Champs #4 déjà présents côté Airtable : `Auto-positionnement - Conception
    d'atelier / Animation en collectif / Adaptation - Initial` **et** `Final` ;
    `QI - …` (questionnaire initial), `QF TOUS - …` (final) ; suivi `statut
    envoi +6M/+12M`.

## Ordre d'implémentation (bricks)

1. **Synchro Make portée/usages** + création de la table « Usages BAO ».
   (Vérifier d'abord si une connexion Airtable + Supabase existe déjà dans le
   compte Make.)
2. **Bouton « J'ai utilisé cet outil avec X jeunes »** — dans la fiche outil
   (FicheModal + `/bao/[slug]`), mis en avant après un téléchargement PDF →
   enregistre l'usage réel (outil + nb jeunes + date) → alimente la synchro.
3. **Enquêtes in-app (#4/#5/#6)** dans « Mon espace » :
   - baseline (« avant ») une fois, à la première arrivée ;
   - relance (« après ») ~3-4 semaines + après usage (≥3 consultations) ;
   - non bloquant, fermable ; réponses synchronisées vers Airtable.

## Reste à faire (autres phases évoquées)

- Réel par outil (= brick 2) ; rétention/cohortes dans le tableau de bord une
  fois les `session_start` accumulés ; export annuel pour la Fondation.

## Pour reprendre (nouvelle session)

1. Vérifier que le serveur MCP **supabase** est « running » (app Mac →
   Développeur → Serveurs MCP locaux).
2. Dire à Claude : « reprends la mesure d'impact, lis
   `docs/mesure-impact-roadmap.md` (branche `claude/charming-noether-dbppod`) »
   puis « démarre la brique 1 ».
