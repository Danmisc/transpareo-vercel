# Configuration Banque Réelle (Live/Sandbox)

Pour désactiver le mode "Simulation" et passer en "Réel", vous devez configurer les clés API des partenaires bancaires.

## 1. Stripe (Paiements & Dépôts)
Créez un compte sur [dashboard.stripe.com](https://dashboard.stripe.com).
Récupérez vos clés API (Mode Test pour commencer).

```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### URL du Webhook
- **En Local (avec Stripe CLI)** : Lancez `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **En Production** : `https://votre-domaine.com/api/webhooks/stripe`
- Ajoutez l'événement `payment_intent.succeeded`.

Indispensable pour connecter des comptes externes (Revolut, BNP...).
Créez un compte sur [plaid.com](https://plaid.com).

```env
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox # ou 'development' / 'production'
```

## 3. Activation
Une fois ces clés ajoutées dans `.env`, l'application basculera automatiquement sur les vrais providers.
