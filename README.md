# 🎨 Al Karim Vision - Frontend Web Application

Application web e-commerce réactive, moderne et animée, conçue pour les clients de **Al Karim Vision** et dotée d'une interface d'administration complète.

---

## ✨ Fonctionnalités Majeures

*   **Expérience Client Moderne** :
    *   **Catalogue Interactif** : Navigation par catégories (lunettes, parfums, montres) et filtres dynamiques.
    *   **Panier Fluide** : Panier d'achat coulissant (*Cart Drawer*) avec persistence locale du panier.
    *   **Avis & Notations** : Lecture et soumission d'avis produits sécurisés et limités par IP.
    *   **Animations Premium** : Transitions d'écrans et micro-interactions fluides développées avec Framer Motion.
*   **Interface d'Administration Intégrée (`/admin`)** :
    *   **Tableau de Bord Analytics** : Graphiques de ventes mensuelles, répartition par catégories et indicateurs de performance (KPIs) en temps réel avec Recharts.
    *   **Gestion du Catalogue** : CRUD complet des produits (avec prévisualisation d'images) et création de catégories à la volée.
    *   **Gestion des Commandes** : Suivi, filtrage et mise à jour des statuts de commandes.
    *   **Contrôle de la Boutique** : Activation du mode maintenance global, personnalisation des slides de la page d'accueil et gestion des coupons de réduction.
    *   **Notifications en Temps Réel** : Système de notifications administratives instantanées basées sur Server-Sent Events (SSE).
*   **PWA (Progressive Web App)** :
    *   Prise en charge de l'installation de l'application sur mobile et bureau grâce à des invites d'installation personnalisées (*PWA Install Prompt*).
*   **Tracking Responsable** :
    *   Enregistrement anonyme des pages visitées à des fins analytiques pour le commerçant.

---

## 🛠️ Stack Technique

*   **Framework** : React v19 + Vite
*   **Styles & UI** : Tailwind CSS v3 + Framer Motion (animations) + Lucide React (icones)
*   **Gestion d'État (State Management)** : Zustand (Authentification, Panier, Produits)
*   **Graphiques** : Recharts
*   **Client API** : Axios
*   **Tests** : Vitest + React Testing Library

---

## 📂 Structure du Code Source

```bash
frontend/
├── public/             # Fichiers statiques et icônes PWA
├── src/
│   ├── __tests__/      # Fichiers de tests unitaires et de sécurité (Vitest)
│   ├── assets/         # Images et styles globaux
│   ├── components/     # Composants réutilisables (Navbar, CartDrawer, TrackingManager...)
│   ├── data/           # Données de secours (starterProducts pour mode démo)
│   ├── pages/          # Pages principales (Home, Shop, Admin, ProductPage, Maintenance...)
│   ├── store/          # Stores globaux Zustand (useAuthStore, useCartStore, useProductStore)
│   ├── App.jsx         # Composant racine et routage
│   └── main.jsx        # Point d'entrée React
├── index.html          # Template HTML principal
├── tailwind.config.js  # Configuration Tailwind CSS
└── vite.config.js      # Configuration Vite et du plugin PWA
```

---

## 🔑 Variables d'Environnement (`.env`)

Créez un fichier `.env` à la racine du dossier `frontend/` :

```env
# URL de l'API Backend
VITE_API_URL=http://localhost:5000/api

# Désactivation/activation du mode de démonstration hors ligne (mock)
# Mettre 'false' en développement connecté à l'API ou en production.
VITE_MOCK_MODE=false
```

---

## ⚙️ Démarrage Local

### 1. Installation des Dépendances
Installez les paquets requis. Si vous rencontrez des conflits de versions de dépendances avec des bibliothèques tierces, utilisez le flag `--legacy-peer-deps` :
```bash
npm install --legacy-peer-deps
```

### 2. Lancer l'Application en mode Développement
```bash
npm run dev
```
Par défaut, l'application est accessible sur `http://localhost:5173`.

### 3. Exécuter les Tests
*   Exécuter tous les tests :
    ```bash
    npm run test
    ```
*   Exécuter les tests unitaires d'authentification et de panier :
    ```bash
    npm run test:unit
    ```
*   Exécuter les tests liés à la sécurité :
    ```bash
    npm run test:security
    ```

### 4. Compiler pour la Production
```bash
npm run build
```
Les fichiers compilés prêts à être déployés seront générés dans le dossier `/dist`.

---

## ☁️ Déploiement

Pour déployer sur une plateforme comme **Vercel**, veuillez vous référer au fichier [DEPLOY.md](../DEPLOY.md) situé à la racine du projet global.
