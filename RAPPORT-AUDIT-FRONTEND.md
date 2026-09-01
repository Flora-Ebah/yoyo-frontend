# 📋 Rapport d'audit — Frontend yoyo-admin

_Audit réalisé sur `yoyo-admin-main` (Next.js App Router, React, MUI + template Materio)._

## 🎯 Verdict global
Le front est **plus mûr que prévu côté fonctionnel** : ~24 pages, presque toutes redesignées et **branchées sur de vraies API**. Les vrais chantiers sont ailleurs : **sécurité (fail-open + token exposé)**, **2-3 zones encore en mock/stub**, **dette de design** (kit UI adopté par seulement 3 pages), et **qualité** (0 test, lint désactivé, `.env` commité).

| Axe | État |
|---|---|
| Couverture fonctionnelle des pages | 🟢 Très bon (24 routes, réelles) |
| Branchement API | 🟢 Bon (23 services branchés, 1 stub, 1 vide) |
| Sécurité / RBAC front | 🔴 Fragile (cosmétique + failles) |
| Cohérence design / kit UI | 🟠 Moyen (kit propre mais peu adopté) |
| Qualité (tests, lint, i18n) | 🔴 Faible |

---

## ✅ Ce qui est DÉJÀ BON

**Pages & fonctionnel**
- **Aucune page vide/placeholder** : `products, packs, stores, soins, documents, categories, routine-soin-subtypes, user, purchases` sont tous **complets et branchés API réelle** (pattern PageContainer + hooks + Table + Dialog).
- Modules monitoring aboutis : `dashboard` (charts Nivo + carte CIV), `clients`, `pros`, `transactions`, `moderation`, `admins`, `account-settings` — tous sur API réelle, avec filtres, pagination, master-detail.
- Auth complète : `/login`, `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password` branchés (OTP réel).

**Couche technique**
- **23 services sur 25 branchés** sur le backend.
- Client API maison propre : `apiClient` (client) + `apiServer` (server), **refresh token 401 avec file d'attente** anti-duplication, déballage `data.data`, gestion 204.
- **Le RBAC vient d'une vraie source** : `GET /admin/me` → `profile.ability`.
- Cookies `auth_token` et `refresh_token` en **httpOnly** (bien).

**Design (le noyau)**
- Kit UI propre et cohérent : `StatCard, StatCardGrid, StatusPill, SectionCard, DataTable, FilterBar, Field`.
- Thème conforme à la règle d'arrondis : `card.ts`=5px, `dialog.ts`=0, contrôles 6px, tableaux/modals carrés.

---

## 🔴 CE QUI MANQUE / À CORRIGER

### 1. Sécurité front — priorité haute
1. **Token d'accès exposé au JS** : le cookie `user` est **non-httpOnly** et **contient le token en clair** (`session.service.ts:139-144`), relu via `document.cookie` dans `api.client.ts`. → vol de token trivial par XSS (annule le bénéfice du `auth_token` httpOnly).
2. **RBAC purement cosmétique** : les `ability` masquent l'UI mais **ne gardent aucune route**. Le seul garde est `role==='admin'` dans `(admin)/layout.tsx`. Un admin restreint (ex. commercial) peut atteindre `/admins`, `/transactions`, `/moderation`… **en tapant l'URL**.
3. **Fail-open** : `ability` vide ⇒ `true` (`permissions.ts:63`), échec `/admin/me` ⇒ tout ouvert, fallback `can: () => true`. Devrait être **fail-closed**.
4. **Session falsifiable côté client** : `expiresAt` et `role` sont dans le cookie `user` éditable (non signé) → élévation de privilège possible côté layout.
5. **`.env` commité avec secrets** : `NEXT_PUBLIC_API_KEY`, Google client ID, clé reCAPTCHA. `NEXT_PUBLIC_*` ⇒ exposé au bundle client.
6. **Pas de `middleware.ts`** : aucun garde centralisé route→permission.
7. `ensureValidSession()` ne **rafraîchit pas** quand la session est proche d'expirer (déconnexions prématurées).

### 2. Zones fictives à brancher au backend
- **Onboarding marchand** : `merchant-onboarding.service.ts` = **STUB** (`POST /partners/onboard` commenté, `setTimeout` + IDs `sim_...`). Le formulaire "crée" des marchands inexistants.
- **`/commercial` et `/enrolments`** : 100 % **mock** (`enrolments.mock.ts`, `CURRENT_COMMERCIAL_ID='com-1'`), aucun filtrage serveur.
- **Notifications commercial** : `commercial-notifications.mock.ts` — 3 notifs fictives **fusionnées avec les vraies** dans la navbar (affichées en prod).
- `event.service.ts` = classe vide (aucun appel).
> Documenté dans `CONTRAT-API-ONBOARDING-MARCHAND.md` (déjà envoyé au backend).

### 3. Dette de design (kit UI peu adopté)
- Kit pleinement utilisé par **3 pages** (`admins`, `commercial`, `enrolments`). `clients/moderation/transactions/notifications` = partiel (StatCard seul).
- **9 entités CRUD** (`categories, documents, packs, products, purchases, routine-soin-subtypes, soins, stores, user`) recodent chacune leur `*Table.tsx`, `*Filters.tsx`, `*FormDialog.tsx` **à la main** → duplication.
- **Pas d'override `MuiTable` dans le thème** : style tableau uniquement dans `DataTable.tsx`, non appliqué aux 10 tables manuelles.
- Incohérences d'arrondis résiduelles : `NotificationHeader.tsx` (2/3/4), `UserFormDialog.tsx` (`borderRadius:2` ×9), `SubTypeFormDialog`, `products/[id]`.
- **Code mort** : `components/StatCard.tsx` (jamais importé), imports MUI `Table*` inutilisés dans `admins/clients/transactions/pros`, `StatusPill` réimplémenté inline (`admins:300`), template `components/layout/front-pages/*` mort.

### 4. Qualité
- **0 test** (aucun jest/vitest/playwright).
- **Lint désactivé au build** : `"lint": "echo Lint disabled"`. Pas de script `typecheck`.
- **Pas d'i18n** : tout en dur, mélange FR/EN résiduel, **mojibake** dans `RichTextEditor.tsx`, `ProductFormDialog.tsx` ("CrÃ¨me", "IngrÃ©dient").
- **Accessibilité** : `alt-text`/`no-img-element` désactivés ; inputs de recherche natifs sans `aria-label`.
- Legacy à finir : `/user/profile` (doublon de `/user/me`, accents cassés, sections "à venir"), onglets "Teams/Projects à venir", bouton "Modifier le profil (bientôt)".

---

## 🗺️ Priorisation recommandée

**P0 — avant prod (sécurité)**
1. Retirer le token du cookie `user` (proxifier via Server Actions) + fail-closed.
2. Ajouter `middleware.ts` + gardes de page réels (route→permission).
3. Sortir `.env` du repo, passer `API_KEY` côté serveur.
4. Garde serveur + filtrage réel pour `/commercial`.

**P1 — fonctionnel**
5. Brancher onboarding (`/partners/onboard`), enrolments, notifications commercial (retirer les mocks).
6. Corriger `ensureValidSession` (refresh).

**P2 — dette/qualité**
7. Override `MuiTable` au thème + migrer les 9 CRUD vers le kit.
8. Réactiver ESLint + script `typecheck`, corriger le mojibake.
9. Nettoyer le code mort.
10. Amorcer des tests (auth + permissions + un CRUD).

---

## 📌 Suivi des corrections

### P0 — Sécurité (en cours)
- [x] 1. **Token hors du JS** — FAIT. Route Handler `src/app/api/proxy/[...path]/route.ts` : tous les appels de `apiClient` passent par `/api/proxy` (même origine), qui injecte le Bearer depuis le cookie **httpOnly** `auth_token` côté serveur (+ refresh 401 transparent). `apiClient` ne lit plus aucun token (ni `document.cookie`, ni localStorage), et le token a été **retiré du cookie `user`** (`session.service`). Bonus : la clé API n'est plus envoyée par le client (ajoutée par le proxy). _Note : re-login requis une fois pour purger le `token` résiduel des sessions déjà ouvertes._
- [x] 2. **Gardes de route** — `PermissionGuard` (UI, par `ability`) ajouté + `proxy.ts` (Next 16) garde déjà auth + rôle admin de façon centralisée.
- [x] 3. **Fail-closed** — `abilityAllows([]) ⇒ false`, `usePermissions` fallback `can: () => false` + flag `error` (ne bloque pas sur panne réseau).
- [x] 4. **Session non falsifiable (rôle)** — le layout `(admin)` vérifie le rôle admin **de façon autoritaire via `GET /admin/me`** (token httpOnly validé par le backend), `apiServer.verifyAdmin()` sans effet de bord ; repli sur le cookie uniquement si backend injoignable (réseau/5xx), jamais sur un rejet 401/403. Le cookie `user` éditable n'est plus l'autorité pour l'accès admin.
- [x] 5. **Clé API hors du bundle** — `.env` : `NEXT_PUBLIC_API_KEY` → **`API_KEY`** (serveur-only). Toutes les références client retirées (`api.client`, `configs/constants`, `document.service` — dont l'upload de fichier passe désormais par le proxy). Ne reste qu'en fallback dans des fichiers serveur (non bundlés). **À faire côté toi : redémarrer `yarn dev` (relecture du `.env`) + FAIRE TOURNER la clé côté backend** (l'ancienne a été exposée).
- [x] 6. **Garde centralisé** — `proxy.ts` (remplace `middleware.ts` en Next 16) : routes protégées + admin, `/commercial` & `/enrolments` ajoutées, `console.log` de debug (fuite cookie) retiré.
- [x] 7. **`ensureValidSession`** — ne déconnecte plus qu'à l'expiration réelle (le refresh se fait au prochain 401).

### P2 — Dette / qualité (en cours)
- [~] 7bis. **Tables** — override thème `MuiTable` ajouté (`@core/theme/overrides/table.ts` : en-tête cohérent, bordures divider, additif/non cassant) harmonisant TOUTES les tables. ⏳ Reste : migrer les **9 CRUD** (`categories, documents, packs, products, purchases, routine-soin-subtypes, soins, stores, user`) vers `DataTable`/`FilterBar`/`Field` (gros chantier, à faire incrémentalement).
- [x] 8. **Scripts qualité** — `lint`/`lint:fix` réactivés (eslint), `typecheck` (`tsc --noEmit`) ajouté. **Mojibake corrigé** (double-encodage UTF-8) sur ~14 fichiers (é/è/à/ç/ê/…). _Note : `yarn lint` va révéler des soucis préexistants à traiter au fil de l'eau._
- [x] 9. **Code mort supprimé** — `components/StatCard.tsx` (jamais importé), `components/layout/front-pages/*` (template mort), imports MUI `Table*` inutilisés dans `admins`.
- [x] 11. **Paramètres restructuré en hub** — `/account-settings` = liste de cartes → chacune sa page : `Mon profil` (`/account-settings/profil`), `Rôles & permissions` (`/account-settings/roles`, gardé par `roles:read`), `Catégories` (`/categories`, API backend disponible). Constat : sur les 9 CRUD, **seul `categories` a une API backend** — les 8 autres (`documents, packs, products, purchases, routine-soin-subtypes, soins, stores, user`) n'ont **aucune route backend** (vérifié sur `main`/`yoyo-back-flo1`) → non branchés, à décider (besoin backend / masquer / autre service).
- [x] 10. **Tests amorcés** — Vitest ajouté (`vitest.config.ts`, scripts `test`/`test:watch`). Tests : `configs/permissions.test.ts` (fail-closed RBAC — garde-fou de la sécu), `data/enrolments.mock.test.ts` (récap commercial). Fichiers de test exclus du `tsconfig` app. **À faire côté toi : `yarn install`** (ajoute Vitest) puis `yarn test`.
