# 🛍 Ma Boutique Cloudflare

Boutique en ligne moderne, gratuite et serverless, hébergée sur **Cloudflare Pages**.

## 🌐 Liens

- **Site public** : https://ma-boutique-cloudflare.pages.dev
- **Administration** : https://ma-boutique-cloudflare.pages.dev/admin.html
- **Code source** : https://github.com/hounmetinjeremy-cmyk/ma-boutique-cloudflare

## ✨ Fonctionnalités

- 🎨 Design moderne avec Tailwind CSS
- 🛒 Panier d'achat fonctionnel
- 📝 Formulaire client (nom, email, téléphone, adresse)
- 💳 Intégration Stripe Checkout (mode démo sans clé API)
- 📦 Stockage des commandes dans Cloudflare KV
- 🔐 Page admin protégée par mot de passe
- 🚀 Déploiement automatique à chaque push sur `main`

## 🔧 Configuration

### Identifiants admin par défaut

- **Mot de passe** : `admin123`

> ⚠️ Important : changez ce mot de passe dans les variables d'environnement Cloudflare Pages.

### Variables d'environnement (Cloudflare Pages)

| Variable | Description | Requis |
|---|---|---|
| `ADMIN_PASSWORD` | Mot de passe page admin | Oui |
| `SESSION_SECRET` | Clé secrète pour les JWT | Oui |
| `KV_NAMESPACE_ID` | ID du namespace KV pour les commandes | Oui |
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare (accès KV) | Recommandé |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe pour les vrais paiements | Optionnel |

### Activer les vrais paiements Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez votre clé secrète (`sk_test_...` ou `sk_live_...`)
3. Dans le dashboard Cloudflare Pages → **Settings → Environment variables**
4. Ajoutez `STRIPE_SECRET_KEY` avec votre clé
5. Redéployez le site

### Modifier les produits

Éditez le fichier `app.js` et modifiez le tableau `products`.

## 🏗 Architecture

```
ma-boutique-cloudflare/
├── index.html              # Page boutique
├── app.js                  # Logique frontend (panier, checkout)
├── styles.css              # Styles personnalisés
├── success.html            # Confirmation de commande
├── cancel.html             # Paiement annulé
├── admin.html              # Dashboard admin
├── functions/
│   ├── api/
│   │   └── checkout.js     # API checkout + sauvegarde commandes
│   └── admin/
│       ├── login.js        # Authentification admin (JWT)
│       └── orders.js       # Liste des commandes
└── README.md
```

## 📝 Licence

Projet libre pour usage personnel et commercial.
