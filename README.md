# Ma Boutique Cloudflare

Boutique en ligne gratuite hébergée sur **Cloudflare Pages**.

## 🚀 Déploiement

Le site est automatiquement déployé depuis GitHub sur Cloudflare Pages.

## 💳 Paiement

Le bouton de paiement est configuré en **mode démo** par défaut.
Pour activer les vrais paiements Stripe :

1. Crée un compte sur [Stripe](https://stripe.com)
2. Récupère ta clé secrète `STRIPE_SECRET_KEY`
3. Dans Cloudflare Pages → Settings → Environment variables, ajoute :
   - `STRIPE_SECRET_KEY` = `sk_test_...`
4. Redéploie le site

## 📦 Produits

Les produits sont définis dans `app.js`. Modifie le tableau `products` pour ajouter tes propres articles.

## 📁 Structure

```
├── index.html        → Page boutique
├── app.js            → Logique panier et produits
├── styles.css        → Design
├── success.html      → Page de confirmation
├── cancel.html       → Paiement annulé
├── functions/api/    → API serverless Cloudflare Pages
└── README.md
```
