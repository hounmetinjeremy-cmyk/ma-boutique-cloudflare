# 🛍 Ma Boutique Cloudflare

Boutique en ligne moderne, gratuite et serverless, hébergée sur **Cloudflare Pages**, avec commande via **WhatsApp Business**.

## 🌐 Liens

- **Site public** : https://ma-boutique-cloudflare.pages.dev
- **Administration** : https://ma-boutique-cloudflare.pages.dev/admin.html

## ✨ Fonctionnalités

- 🎨 Design moderne avec Tailwind CSS
- 🛒 Panier d'achat fonctionnel
- 📝 Formulaire client (nom, email, téléphone, adresse)
- 📱 Commande directe via **WhatsApp Business**
- 📦 Stockage des commandes dans Cloudflare KV
- 🔐 Page admin protégée par mot de passe
- 🚀 Déploiement automatique à chaque push sur `main`

## 📱 Comment ça marche

1. Le client choisit ses produits
2. Il remplit ses informations de livraison
3. Il clique sur **"Commander via WhatsApp"**
4. Le site ouvre WhatsApp avec un message pré-rempli contenant :
   - La liste des articles
   - Le total
   - Les coordonnées du client
   - L'adresse de livraison
5. Vous recevez le message et gérez le paiement/livraison directement

## 🔧 Configuration

### Numéro WhatsApp

Le numéro actuel est configuré dans `WHATSAPP_NUMBER` : `+22962794964`.
Pour le changer, mettez à jour la variable dans **Cloudflare Pages → Settings → Environment variables**.

### Identifiants admin par défaut

- **Mot de passe** : `admin123`

> ⚠️ Changez ce mot de passe dans les variables d'environnement Cloudflare Pages.

### Variables d'environnement (Cloudflare Pages)

| Variable | Description | Requis |
|---|---|---|
| `WHATSAPP_NUMBER` | Votre numéro WhatsApp Business international | Oui |
| `ADMIN_PASSWORD` | Mot de passe page admin | Oui |
| `SESSION_SECRET` | Clé secrète pour les JWT | Oui |
| `KV_NAMESPACE_ID` | ID du namespace KV pour les commandes | Recommandé |
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare (accès KV) | Recommandé |

### Activer le stockage des commandes (admin)

1. Créez un token Cloudflare : https://dash.cloudflare.com/profile/api-tokens
2. Utilisez le template **"Edit Cloudflare Workers"** ou ajoutez les permissions :
   - `Account:Read`
   - `Workers KV Storage:Edit`
   - `Cloudflare Pages:Edit`
3. Dans Cloudflare Pages → votre projet → **Settings → Environment variables**
4. Remplacez `CLOUDFLARE_API_TOKEN` (`set-your-api-token-here`) par votre vrai token
5. Redéployez le site

### Modifier les produits

Éditez le fichier `app.js` et modifiez le tableau `products`. Le site se redéploiera automatiquement.

## 🏗 Architecture

```
ma-boutique-cloudflare/
├── index.html              # Page boutique
├── app.js                  # Logique frontend (panier, formulaire WhatsApp)
├── styles.css              # Styles personnalisés
├── success.html            # Confirmation + lien WhatsApp
├── cancel.html             # Commande annulée
├── admin.html              # Dashboard admin
├── functions/
│   ├── api/
│   │   └── checkout.js     # API commande + sauvegarde + URL WhatsApp
│   └── admin/
│       ├── login.js        # Authentification admin (JWT)
│       └── orders.js       # Liste des commandes
└── README.md
```

## 📝 Licence

Projet libre pour usage personnel et commercial.
