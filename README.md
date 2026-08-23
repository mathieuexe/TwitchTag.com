# TwitchTag - Générateur de Pseudo Twitch

![TwitchTag](https://img.shields.io/badge/TwitchTag-v1.0.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-cyan)

TwitchTag est un générateur de pseudos et vérificateur de disponibilité pour Twitch. Il permet aux streamers de trouver le pseudo parfait pour leur chaîne.

## 🚀 Fonctionnalités

- **Générateur de Pseudos** : Créez des pseudos uniques avec des options personnalisables
- **Vérificateur Twitch** : Vérifiez la disponibilité des pseudos en temps réel via l'API Twitch
- **Compteurs Live** : Statistiques en temps réel des pseudos générés et visites
- **Système de Dons** : Intégration Stripe pour soutenir le projet
- **Espace Admin** : Dashboard complet pour gérer le site

## 🛠️ Stack Technique

- **Frontend** : Next.js 14, React 18, TypeScript
- **Styling** : Tailwind CSS, CSS personnalisé (thème Twitch)
- **Backend** : Next.js API Routes
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : NextAuth.js
- **Paiements** : Stripe
- **API externe** : Twitch Helix API

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Stripe (pour les dons)
- Application Twitch Developer

### Configuration

1. **Cloner le repository**
   ```bash
   git clone https://github.com/yourusername/twitchtag.git
   cd twitchtag/my-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Copiez le fichier `.env.example` vers `.env.local` et remplissez les valeurs :
   
   ```bash
   cp .env.example .env.local
   ```
   
   Variables requises :
   - `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` : Clé service Supabase
   - `NEXTAUTH_SECRET` : Secret pour NextAuth
   - `TWITCH_CLIENT_ID` : ID client Twitch
   - `TWITCH_CLIENT_SECRET` : Secret client Twitch
   - `STRIPE_SECRET_KEY` : Clé secrète Stripe
   - `STRIPE_WEBHOOK_SECRET` : Secret webhook Stripe

4. **Configurer Supabase**
   
   Suivez les instructions dans `SupabaseSetup.md` pour créer les tables et configurer la base de données.

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Accéder à l'application**
   
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🚀 Déploiement

### Vercel (Recommandé)

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Déployer**
   ```bash
   vercel
   ```

3. **Configurer les variables d'environnement** dans le dashboard Vercel

### Autres plateformes

Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js :
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 📁 Structure du projet

```
my-app/
├── app/                      # Next.js App Router
│   ├── (main)/              # Groupe de routes principales
│   │   ├── page.tsx         # Page d'accueil
│   │   ├── verifier/        # Vérificateur de pseudo
│   │   └── donation/        # Page de dons
│   ├── admin/               # Espace admin
│   │   ├── page.tsx         # Dashboard admin
│   │   ├── layout.tsx       # Layout admin
│   │   └── ...
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentification
│   │   ├── generate-pseudo/# Génération de pseudos
│   │   ├── check-username/ # Vérification Twitch
│   │   ├── stats/          # Statistiques
│   │   ├── stripe/         # Paiements Stripe
│   │   └── admin/          # API Admin
│   ├── layout.tsx          # Layout racine
│   └── globals.css         # Styles globaux
├── components/             # Composants React
│   ├── layout/            # Composants de layout
│   ├── generator/         # Composants du générateur
│   ├── verifier/          # Composants du vérificateur
│   ├── stats/             # Composants des statistiques
│   ├── donation/          # Composants des dons
│   └── admin/             # Composants admin
├── lib/                   # Bibliothèques et utilitaires
│   ├── supabase/         # Client et types Supabase
│   ├── stripe/           # Configuration Stripe
│   ├── twitch/           # API Twitch
│   ├── utils/            # Utilitaires
│   └── auth/             # Configuration auth
├── types/                # Types TypeScript
├── public/               # Fichiers statiques
├── .env.local           # Variables d'environnement
├── next.config.js       # Configuration Next.js
├── tailwind.config.ts   # Configuration Tailwind
└── package.json         # Dépendances
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Twitch](https://twitch.tv) pour leur API
- [Supabase](https://supabase.io) pour leur base de données
- [Stripe](https://stripe.com) pour les paiements
- [Vercel](https://vercel.com) pour l'hébergement

---

Développé avec ❤️ par l'équipe TwitchTag
