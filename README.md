# 💇‍♀️ Sheba Admin - Backoffice de Gestion Capillaire

![version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![next](https://img.shields.io/badge/next-16.1.1-black.svg)
![react](https://img.shields.io/badge/react-19.2.3-blue.svg)
![typescript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

Sheba Admin est l'interface d'administration de la plateforme Sheba, une application complète de gestion capillaire et de soins personnels. Cette interface permet aux administrateurs de gérer les utilisateurs, produits, services, boutiques, catégories et tous les aspects de la plateforme à travers une interface web moderne et intuitive.

## 📋 Description

Sheba Admin est le backoffice de l'application Sheba, développé avec Next.js 16 et React 19. Cette application permet de gérer tous les aspects de la plateforme de gestion capillaire, depuis l'administration des utilisateurs jusqu'à la gestion des boutiques, produits, services et paiements.

### ✨ Fonctionnalités principales

#### Gestion des utilisateurs

- **Administration complète** : Gestion des utilisateurs avec rôles (admin, user, provider)
- **Profils utilisateurs** : Gestion des profils avec habilitations et période d'activité
- **Suivi capillaire** : Suivi de la longueur des cheveux, âge des cheveux, profils capillaires
- **Gestion des rôles** : Attribution et gestion des permissions par rôle

#### Gestion commerciale

- **Boutiques et Salons** : Gestion complète des boutiques/salons de coiffure
- **Produits** : Catalogue de produits capillaires
- **Services** : Gestion des soins et traitements
- **Catégories** : Système de catégories hiérarchiques
- **Packs** : Gestion des packs (produit, outil, service) avec système d'achat

#### Gestion des paiements

- **Intégration CinetPay** : Paiements en ligne pour packs et abonnements
- **Achats** : Suivi des achats de packs et abonnements
- **Abonnements** : Gestion des abonnements mensuels/annuels pour les prestataires
- **Webhooks** : Gestion des notifications de paiement

#### Autres fonctionnalités

- **Favoris** : Système de favoris générique pour tous types d'éléments
- **Visites clients** : Gestion de l'historique des visites
- **Notifications** : Système d'alertes et rappels automatiques
- **OTP** : Gestion des codes OTP pour authentification

## 🛠️ Technologies utilisées

### Frontend

- **Next.js 16.1.1** : Framework React avec App Router et Turbopack
- **React 19.2.3** : Bibliothèque UI
- **TypeScript 5.9.3** : Typage statique
- **Material-UI (MUI) 7.3.6** : Composants UI
- **Tailwind CSS 4.1.17** : Framework CSS utilitaire
- **Emotion** : CSS-in-JS pour le styling
- **React Perfect Scrollbar** : Scrollbar personnalisée
- **React Toastify** : Notifications toast

### Authentification

- **JWT** : Tokens d'accès et de rafraîchissement
- **HttpOnly Cookies** : Stockage sécurisé des tokens
- **Rôles** : Système de rôles (admin, user, provider)
- **OTP** : Codes à usage unique pour authentification

### Architecture

- **App Router** : Routing basé sur le système de fichiers
- **Server Components** : Composants serveur pour les performances
- **Server Actions** : Actions serveur pour les mutations
- **Middleware** : Protection des routes et gestion des rôles

### API Backend

- **Fastify** : Framework web rapide et performant
- **Swagger** : Documentation API interactive
- **Socket.io** : Communication temps réel
- **Kafka** : Messagerie et événements distribués
- **CinetPay** : Intégration paiements en ligne

## 📦 Installation

### Prérequis

- Node.js 18+
- Yarn (recommandé) ou npm
- Accès à l'API backend Sheba

### Étapes d'installation

1. **Cloner le dépôt** (si applicable)

```bash
git clone <repository-url>
cd sheba-admin
```

2. **Installer les dépendances**

```bash
yarn install
# ou
npm install
```

3. **Configurer les variables d'environnement**

```bash
cp .env.example .env.local
```

Éditez `.env.local` et configurez :

```env
# App
NEXT_PUBLIC_APP_TITLE=Sheba Admin
NEXT_PUBLIC_APP_URL=http://localhost:3081
BASEPATH=

# API
NEXT_PUBLIC_API_URL=http://localhost:6000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_PATH=sheba
NEXT_PUBLIC_API_KEY=your_api_key_here

# Google OAuth (optionnel)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

4. **Lancer le serveur de développement**

```bash
yarn dev
# ou
npm run dev
```

L'application sera accessible sur [http://localhost:3081](http://localhost:3081)

## ⚙️ Configuration

### Variables d'environnement

| Variable                       | Description                            | Requis |
| ------------------------------ | -------------------------------------- | ------ |
| `NEXT_PUBLIC_APP_TITLE`        | Titre de l'application                 | ✅     |
| `NEXT_PUBLIC_APP_URL`          | URL de base de l'application           | ✅     |
| `BASEPATH`                     | Chemin de base (optionnel)             | ⚠️     |
| `NEXT_PUBLIC_API_URL`          | URL de l'API backend                   | ✅     |
| `NEXT_PUBLIC_API_VERSION`      | Version de l'API                       | ✅     |
| `NEXT_PUBLIC_API_PATH`         | Chemin de base de l'API (ex: `/sheba`) | ✅     |
| `NEXT_PUBLIC_API_KEY`          | Clé API publique                       | ✅     |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ID client Google OAuth (optionnel)     | ⚠️     |

## 🚀 Scripts disponibles

```bash
# Développement
yarn dev          # Lance le serveur de développement sur le port 3081 avec Turbopack

# Production
yarn build        # Compile l'application pour la production
yarn start        # Lance le serveur de production

# Linting & Formatting
yarn lint         # Vérifie le code avec ESLint
yarn lint:fix     # Corrige automatiquement les erreurs ESLint
yarn format       # Formate le code avec Prettier

# Utilitaires
yarn build:icons  # Génère les icônes CSS depuis Iconify
yarn clean        # Supprime le dossier .next
yarn clear        # Supprime node_modules et .next
```

## 📁 Structure du projet

```
sheba-admin/
├── app/                          # Pages et routes (App Router)
│   ├── (blank-layout-pages)/    # Pages sans layout (login, etc.)
│   │   └── login/               # Page de connexion
│   ├── (dashboard)/             # Dashboard protégé
│   │   ├── layout.tsx          # Layout avec AuthGuard
│   │   └── dashboard/          # Tableau de bord
│   └── layout.tsx               # Layout racine
│
├── src/
│   ├── @core/                  # Code core (types, utils, components)
│   ├── @layouts/               # Layouts (Vertical, Horizontal, Blank)
│   ├── @menu/                  # Configuration des menus
│   ├── @assets/                # Assets statiques
│   ├── @components/            # Composants réutilisables
│   ├── @configs/               # Configuration (theme, constants)
│   │
│   ├── components/             # Composants React
│   │   └── layout/            # Composants de layout
│   │       ├── vertical/      # Navigation verticale
│   │       └── horizontal/    # Header horizontal
│   │
│   ├── services/               # Services API
│   │   ├── api.client.ts      # Client API pour Client Components
│   │   ├── api.server.ts      # Client API pour Server Components
│   │   ├── user.service.ts    # Service utilisateur
│   │   └── session.service.ts # Service de session
│   │
│   ├── contexts/               # Contextes React
│   │   └── intersectionContext.tsx
│   │
│   ├── hooks/                  # Hooks personnalisés
│   │   └── useIntersection.ts
│   │
│   ├── hocs/                   # Higher-Order Components
│   │   ├── AuthGuard.tsx      # Protection des routes
│   │   └── GuestOnlyRoute.tsx # Routes pour invités uniquement
│   │
│   ├── data/                   # Données statiques
│   │   └── menu.ts             # Configuration du menu
│   │
│   ├── middleware.ts           # Middleware Next.js (protection routes)
│   └── app/                    # Actions serveur
│       └── actions/
│           └── auth.actions.ts
│
└── public/                      # Fichiers statiques
```

## 🔐 Authentification et sécurité

### Système de rôles

- **admin** : Accès complet à toutes les fonctionnalités d'administration
- **user** : Accès utilisateur standard
- **provider** : Accès prestataire (boutiques, salons)

### Protection des routes

- **Middleware** : Vérification de l'authentification et des rôles
- **AuthGuard** : HOC pour protéger les routes du dashboard
- **GuestOnlyRoute** : HOC pour les pages publiques (login, register)

### Stockage des tokens

- **HttpOnly Cookies** : Pour les Server Components/Actions
- **Cookies standards** : Pour la compatibilité
- **Public Token** : Pour les requêtes non authentifiées

### Méthodes d'authentification

- **Connexion classique** : Email/username et mot de passe
- **OAuth 2.0** : Connexion avec Google
- **OTP** : Codes à usage unique pour authentification

## 📡 API Endpoints

### Authentification

- `POST /login` - Connexion et obtention d'un token JWT
- `POST /login/admin` - Connexion administrateur
- `POST /otp/send` - Envoi d'un code OTP
- `POST /otp/verify` - Vérification d'un code OTP
- Routes protégées nécessitent le header `Authorization: Bearer <token>`

### Gestion des Utilisateurs

- `GET /user` - Liste paginée des utilisateurs
- `POST /user` - Création d'un nouvel utilisateur
- `GET /user/details/:id` - Détails d'un utilisateur spécifique
- `GET /user/me` - Profil de l'utilisateur connecté
- `PUT /user/me` - Mise à jour du profil utilisateur connecté
- `PUT /user/:id` - Mise à jour d'un utilisateur (admin)
- `DELETE /user/:id` - Suppression d'un utilisateur

### Profils et Habilitations

- `GET /profile` - Liste paginée des profils avec filtres (status, habilitation)
- `POST /profile` - Création d'un nouveau profil
- `GET /profile/:id` - Détails d'un profil avec vérification d'activité
- `PUT /profile/:id` - Mise à jour d'un profil
- `DELETE /profile/:id` - Suppression logique d'un profil

### Boutiques et Salons

- `GET /store` - Liste paginée des boutiques/salons
- `POST /store` - Création d'une boutique/salon (provider uniquement)
- `GET /store/:id` - Détails d'une boutique/salon
- `GET /store/me` - Liste de mes boutiques (provider)
- `DELETE /store/me/:id` - Supprimer ma boutique (provider)

### Catégories

- `GET /category` - Liste paginée des catégories avec filtres (status, parent, slug)
- `POST /category` - Création d'une catégorie
- `GET /category/:id` - Détails d'une catégorie
- `GET /category/slug/:slug` - Récupération d'une catégorie par son slug
- `PUT /category/:id` - Mise à jour d'une catégorie
- `DELETE /category/:id` - Suppression logique d'une catégorie

### Packs

- `GET /pack` - Liste paginée des packs avec filtres (status, type)
- `POST /pack` - Création d'un pack (admin)
- `GET /pack/:id` - Détails d'un pack
- `PUT /pack/:id` - Mise à jour d'un pack
- `DELETE /pack/:id` - Suppression logique d'un pack
- `GET /pack/me/purchases` - Mes achats de packs (provider)
- `GET /pack/me/can-publish` - Vérifier si je peux publier un élément (provider)

### Achats et Paiements

- `GET /purchase` - Liste paginée des achats (admin)
- `GET /purchase/me` - Liste de mes achats
- `POST /purchase/pack` - Acheter un pack (initialise automatiquement le paiement CinetPay)
- `POST /purchase/subscription` - Acheter un abonnement (initialise automatiquement le paiement CinetPay)
- `GET /purchase/me/subscription` - Mon abonnement actif
- `POST /purchase/initialize` - Initialiser un paiement CinetPay pour un achat existant
- `GET /purchase/check` - Vérifier le statut d'un paiement
- `PUT /purchase/payment-status` - Mettre à jour le statut de paiement (webhook)

### Favoris

- `GET /favoris` - Liste paginée des favoris (admin)
- `GET /favoris/me` - Liste de mes favoris
- `GET /favoris/me/:type` - Liste de mes favoris par type (produit, outil, service, etc.)
- `POST /favoris` - Ajouter un élément aux favoris
- `GET /favoris/me/check` - Vérifier si un élément est dans mes favoris
- `DELETE /favoris/me/:id` - Supprimer un de mes favoris
- `DELETE /favoris/me/item` - Supprimer un favori par élément

### Gestion des Visites

- `GET /visit` - Liste des visites
- `POST /visit` - Création d'une nouvelle visite
- `GET /visit/:id` - Détails d'une visite
- `PUT /visit/:id` - Mise à jour d'une visite
- `DELETE /visit/:id` - Suppression d'une visite

### Notifications

- `GET /notification` - Liste des notifications
- `POST /notification` - Création d'une notification
- `PUT /notification/:id/read` - Marquer une notification comme lue
- `DELETE /notification/:id` - Suppression d'une notification

### Documentation API

- `GET /sheba/v1` - Documentation Swagger interactive (authentification Basic requise)

## 🎨 Thème et personnalisation

L'application utilise Material-UI avec support du mode clair et sombre :

- **Thème MUI** : Configuration dans `src/configs/themeConfig.ts`
- **Tailwind CSS** : Classes utilitaires pour le styling
- **Emotion** : CSS-in-JS pour les composants MUI
- **Mode clair/sombre** : Toggle disponible dans l'interface

## 📱 Support des plateformes

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Chrome Mobile)
- ✅ Tablette
- ✅ Mode responsive

## 🔧 Configuration ESLint

Le projet utilise ESLint avec configuration TypeScript pour la résolution des alias :

- **Résolution des alias** : Configuration dans `.eslintrc.js`
- **Import order** : Ordre automatique des imports
- **TypeScript** : Vérification de types avec ESLint

## 💇‍♀️ Fonctionnalités Métier

### Fonctionnalités Implémentées

#### Authentification et Utilisateurs

- ✅ Authentification JWT avec gestion des tokens
- ✅ Connexion administrateur
- ✅ Gestion des utilisateurs (CRUD complet)
- ✅ Gestion des profils utilisateurs avec habilitations et période d'activité
- ✅ Système de rôles (admin, user, provider)
- ✅ Suivi capillaire (longueur cheveux, âge cheveux)
- ✅ Système de notifications
- ✅ Gestion des codes OTP
- ✅ Gestion des visites clients

#### Gestion Commerciale

- ✅ **Boutiques et Salons** : Gestion complète des boutiques/salons pour les providers
- ✅ **Catégories** : Système de catégories hiérarchiques avec catégories prédéfinies
- ✅ **Packs** : Gestion des packs (produit, outil, service) avec système d'achat et consommation
- ✅ **Achats** : Système d'achat pour packs et abonnements
- ✅ **Favoris** : Système de favoris générique pour tous types d'éléments

#### Paiements

- ✅ **Intégration CinetPay** : Paiements en ligne pour packs et abonnements
- ✅ **Initialisation de paiement** : Génération automatique d'URL de paiement
- ✅ **Vérification de statut** : Vérification du statut des transactions
- ✅ **Webhooks** : Gestion des notifications de paiement

### Fonctionnalités à Implémenter

#### Gestion Capillaire

- [ ] **Fiches capillaires** : Profils capillaires détaillés des clients
- [ ] **Routines d'entretien** : Programmes personnalisés de soins
- [ ] **Routines de restructuration** : Plans de traitement spécialisés

#### Gestion Commerciale

- [ ] **Produits** : Catalogue de produits capillaires
- [ ] **Services** : Gestion des soins et traitements
- [ ] **Outils** : Catalogue d'outils capillaires
- [ ] **Clients** : Base de données clientèle complète
- [ ] **Fournisseurs** : Gestion des partenaires commerciaux

#### Fonctionnalités Avancées

- [ ] Statistiques détaillées (graphiques, rapports)
- [ ] Export de données (PDF, Excel)
- [ ] Application mobile
- [ ] Système de recherche avancée
- [ ] Gestion des stocks pour les produits

## 📝 Conventions

### Code

- **TypeScript strict** : Mode strict activé
- **Prettier** : Formatage automatique du code
- **Architecture modulaire** : Services indépendants et réutilisables
- **API RESTful** : Respect des conventions REST
- **Documentation Swagger** : Toutes les routes documentées

### Base de Données

- **Tables préfixées** : `sgmp_` pour toutes les tables
- **Colonnes en français** : Nommage des colonnes en français
- **ID** : Format `NomTable_id` (ex: `utilisateur_id`)
- **Dates** : Préfixe `date_` (ex: `date_creation`)
- **Références** : Préfixe `ref_` (ex: `ref_role`)
- **Libellés** : Préfixe `lib_`
- **Statut** : Colonne statut (Actif, Inactif, etc.)
- **Audit** : Colonnes de traçabilité (date création, date modification, id utilisateur création, id utilisateur modification)

## 📄 Licence

MIT

## 📞 Contact

- **Email** : grebejordan@gmail.com
- **Téléphone** : +225 22 22 22 22
- **Adresse** : Abidjan, Côte d'Ivoire
- **Heures** : Lun-Ven 08:00-17:00

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Material-UI](https://mui.com/) - Composants UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Iconify](https://iconify.design/) - Icônes
- [Fastify](https://www.fastify.io/) - Framework backend
- [CinetPay](https://cinetpay.com/) - Paiements en ligne

---

**Version** : 1.0.1  
**Dernière mise à jour** : 2025

**Sheba Admin** - Backoffice de gestion capillaire professionnelle. Bon développement ! 💇‍♀️✨
