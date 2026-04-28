# Boîte à outils Lit uP — Application web

> Application web de la BAO Lit uP : inscription, parcours guidés et fiches pédagogiques pour les pros de l'accompagnement de jeunes 14-25 ans.

## 🏗️ Architecture

- **Frontend** : Next.js 14 (App Router) + React 18
- **Style** : Tailwind CSS avec charte Lit uP officielle
- **Backend** : Supabase (PostgreSQL + Auth + RLS)
- **Hébergement** : Vercel (frontend) + Supabase (backend)
- **Langue** : TypeScript

## 🚀 Démarrage local

### Prérequis
- Node.js 20+ (vérifier avec `node --version`)
- npm 10+ (livré avec Node.js)
- Un compte Supabase et Vercel (déjà configurés pour Lit uP)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/lit-up-fr/bao-app.git
cd bao-app

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# → Édite .env.local avec tes vraies clés Supabase

# 4. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur http://localhost:3000

## 📁 Structure des dossiers

```
bao-app/
├── app/                    # Pages et routes (Next.js App Router)
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Page d'accueil (test de connexion)
│   └── globals.css        # Styles globaux
├── components/             # Composants React réutilisables
├── lib/
│   └── supabase/          # Clients Supabase (browser + server)
├── public/                 # Fichiers statiques (images, PDF)
├── .env.local.example     # Modèle pour les variables d'env
├── .gitignore             # Fichiers à ne pas commiter
└── package.json           # Dépendances et scripts
```

## 🔐 Variables d'environnement

| Variable | Description | Sensibilité |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Publique |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase | Publique |
| `SUPABASE_SECRET_KEY` | Clé admin Supabase | ⚠️ Secrète |

**À NE JAMAIS COMMITER** : le fichier `.env.local`. Il est dans `.gitignore`.

## 📅 Phases de développement

- [x] **Phase 1** — Infrastructure (Vercel + Supabase + tables)
- [ ] **Phase 2** — Migration du contenu (30 fiches, 30 PDF, parcours)
- [ ] **Phase 3** — Authentification (magic link + mot de passe)
- [ ] **Phase 4** — Dashboard administrateur
- [ ] **Phase 5** — Domaine personnalisé bao.lit-up.fr

## 🤝 Contribution

Ce projet est édité par l'Association Lit uP (loi 1901).  
Contact : contact@lit-up.fr

## 📜 Licence

MIT — Voir le fichier LICENSE.
