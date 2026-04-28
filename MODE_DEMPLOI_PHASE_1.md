# 🚀 BAO V6 — Mode d'emploi de la phase 1

> Tu as récupéré l'archive `bao-app.zip`. Voici les étapes pour lancer ton premier déploiement.

---

## Étape A — Sécurité d'abord (3 min)

Avant tout, **régénère ta Secret key Supabase** (celle que tu m'avais transmise) :

1. Va sur https://supabase.com/dashboard/project/odadaqpihvcnuprkdchr/settings/api-keys
2. Section **Secret keys**
3. Si la clé `default` (`sb_secret_dy9...`) est encore là, clique sur **« + New secret key »**, donne-lui un nom (ex : `bao-app`), copie-la et **note-la précieusement dans ton gestionnaire de mots de passe**
4. Supprime ensuite l'ancienne clé `default` (les 3 points → Delete API key)

⚠️ **Cette nouvelle clé, tu la garderas pour toi.** Tu la colleras dans Vercel un peu plus tard, dans une variable d'environnement chiffrée.

---

## Étape B — Décompresser et préparer le projet (10 min)

### B.1 — Décompresser

Décompresse `bao-app.zip` quelque part de propre. **Mon conseil** : à côté de ton dossier BAO actuel.

```
~/Projets/
├── bao-litup-v5/      ← l'ancienne BAO (toujours en ligne)
└── bao-app/           ← le nouveau (à créer)
```

### B.2 — Ouvrir le Terminal dans le nouveau dossier

```bash
cd ~/Projets/bao-app
pwd
```

→ Doit répondre `/Users/laetitiadeborde/Projets/bao-app`

### B.3 — Créer le fichier `.env.local`

Dans le dossier, tu vas trouver un fichier `.env.local.example`. **Ne touche pas à celui-là**, fais une copie :

```bash
cp .env.local.example .env.local
```

Puis ouvre-le avec TextEdit :

```bash
open -a TextEdit .env.local
```

Tu verras quelque chose comme :

```
NEXT_PUBLIC_SUPABASE_URL=https://odadaqpihvcnuprkdchr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_DXipUH_l-lPFooIK509GHA_cXR9Gsq3
SUPABASE_SECRET_KEY=sb_secret_REMPLACE_PAR_TA_NOUVELLE_CLE
```

**Remplace** la 3ème ligne par ta vraie nouvelle Secret key (celle que tu as régénérée à l'étape A). Sauvegarde (Cmd+S) et ferme.

### B.4 — Installer les dépendances

```bash
npm install
```

→ Patience 2-3 min. Tu verras des messages s'afficher, c'est normal. À la fin, tu auras quelque chose comme `added 350 packages`.

⚠️ Si tu as une erreur **« command not found: npm »** : il te faut installer Node.js. Va sur https://nodejs.org → télécharge la version LTS → double-clique sur le `.pkg` téléchargé → suis l'installation. Reviens ensuite ici et relance `npm install`.

### B.5 — Tester en local

```bash
npm run dev
```

Une fois que tu vois le message :
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in 2s
```

→ Ouvre http://localhost:3000 dans ton navigateur.

Tu devrais voir une page avec :
- Bandeau turquoise « Lit uP — la boîte à outils »
- Un titre « BAO V6 — Phase 1 ✓ »
- Trois indicateurs verts : Frontend Next.js ✅, Variables d'environnement ✅, Connexion Supabase ✅

Si tout est vert, **c'est gagné en local** ! Tu peux fermer le terminal avec `Ctrl+C`.

---

## Étape C — Push sur GitHub (15 min)

### C.1 — Initialiser Git

Toujours dans le dossier `bao-app/` :

```bash
git init
git add .
git commit -m "Phase 1 : squelette Next.js + connexion Supabase"
```

### C.2 — Connecter au dépôt GitHub

```bash
git branch -M main
git remote add origin https://github.com/lit-up-fr/bao-app.git
git push -u origin main
```

GitHub te demandera tes identifiants. Si tu as un Personal Access Token (PAT) configuré, ça passera tout seul. Sinon, suis les instructions à l'écran.

### C.3 — Vérifier sur GitHub

Va sur https://github.com/lit-up-fr/bao-app

Tu devrais voir tes fichiers : `app/`, `lib/`, `package.json`, `README.md`, etc.

---

## Étape D — Déployer sur Vercel (15 min)

### D.1 — Importer le projet

1. Va sur https://vercel.com/dashboard
2. Clique sur **Add New...** → **Project**
3. Vercel liste tes dépôts GitHub. Cherche **`bao-app`** et clique sur **Import**

### D.2 — Configurer le projet

Vercel détecte automatiquement que c'est un projet Next.js. Tu peux laisser tous les paramètres par défaut. **Mais avant de cliquer Deploy**, il y a une chose importante à faire :

### D.3 — Ajouter les variables d'environnement

Dans la section **Environment Variables**, ajoute les **3 variables** :

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://odadaqpihvcnuprkdchr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_DXipUH_l-lPFooIK509GHA_cXR9Gsq3` |
| `SUPABASE_SECRET_KEY` | TA NOUVELLE Secret key (celle régénérée à l'étape A) |

### D.4 — Lancer le déploiement

Clique sur **Deploy**. Vercel va :
1. Cloner ton dépôt
2. Installer les dépendances
3. Lancer le build
4. Déployer

Compte 2-3 minutes. Tu verras une animation avec des feux d'artifices à la fin si tout va bien.

### D.5 — Visiter ta nouvelle BAO

Vercel te donne une URL temporaire du genre `bao-app-xxxx.vercel.app`. Clique dessus !

Tu devrais voir la même page que tu avais en local, mais cette fois en ligne, accessible depuis n'importe quel ordinateur dans le monde. 🌍

---

## ✅ Si tout est vert : phase 1 terminée

À ce stade :
- ✅ Vercel héberge ton frontend
- ✅ Supabase héberge ta base de données
- ✅ Les deux communiquent
- ✅ La page de test affiche 3 indicateurs verts

**Tu m'envoies une capture d'écran** de la page de test en ligne, et on passe à la phase 2 (migration du contenu).

---

## 🆘 Si quelque chose ne marche pas

### Page de test affiche un ❌ rouge

→ Copie-colle moi le message d'erreur affiché et je te débloque.

### `npm install` échoue

→ Vérifie que Node.js est installé : `node --version` (doit afficher v20 ou plus)
→ Si pas installé : https://nodejs.org → version LTS

### `git push` est rejeté

→ Comme la dernière fois : `git pull origin main --allow-unrelated-histories` puis re-push

### Vercel build échoue

→ Va dans Vercel → ton projet → Deployments → clique sur celui qui a échoué → onglet **Build Logs** → copie-colle moi les dernières lignes rouges

### Erreur CORS / Auth

→ Les politiques RLS de Supabase peuvent bloquer la connexion. Je te dirai quoi vérifier dans le SQL editor.

---

## 📅 Prochaines phases (rappel)

- **Phase 2** : Migration du contenu (30 fiches en base, 30 PDF dans Supabase Storage)
- **Phase 3** : Authentification (formulaire d'inscription, magic link, mot de passe)
- **Phase 4** : Dashboard administrateur
- **Phase 5** : Domaine personnalisé bao.lit-up.fr

Bon courage ! Tu n'es plus très loin de voir ton premier déploiement. 🚀
