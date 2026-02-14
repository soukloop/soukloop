# Payment Provider Setup Guide

## Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Get your API keys:
   - Go to "Developers" → "API keys"
   - Copy "Publishable key" and "Secret key"
   - Use test keys for development
4. Set up webhooks:
   - Go to "Developers" → "Webhooks"
   - Add endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
   - Copy webhook signing secret

## PayPal Setup

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create an account or sign in
3. Create a new app:
   - Go to "My Apps & Credentials"
   - Create new app
   - Select "Default Application"
   - Copy Client ID and Secret
4. Set up webhooks:
   - Go to "My Apps & Credentials" → "Webhooks"
   - Create webhook
   - URL: `http://localhost:3000/api/webhooks/paypal`
   - Select events:
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`
     - `PAYMENT.CAPTURE.PENDING`
   - Copy webhook ID

## Coinbase Commerce Setup

1. Go to [Coinbase Commerce](https://commerce.coinbase.com/)
2. Create an account or sign in
3. Get your API key:
   - Go to "Settings" → "API Keys"
   - Generate new API key
   - Copy the API key
4. Set up webhooks:
   - Go to "Settings" → "Webhook subscriptions"
   - Add webhook
   - URL: `http://localhost:3000/api/webhooks/crypto`
   - Select events:
     - `charge:created`
     - `charge:confirmed`
     - `charge:failed`
   - Copy webhook secret

## Environment Variables

Update your `.env.local` file with:

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PayPal
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
PAYPAL_ENVIRONMENT="sandbox"
PAYPAL_WEBHOOK_ID="your_webhook_id"
PAYPAL_WEBHOOK_SECRET="your_webhook_secret"

# Coinbase Commerce
COINBASE_COMMERCE_API_KEY="your_api_key"
COINBASE_COMMERCE_WEBHOOK_SECRET="your_webhook_secret"
```

## Testing Payments

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/cart`
3. Add items to cart and proceed to checkout
4. Test payment flows:
   - Stripe: Use test card `4242 4242 4242 4242`
   - PayPal: Use sandbox account
   - Coinbase: Use test cryptocurrency

## Production Setup

For production:
- Use live API keys and secrets
- Update webhook URLs to production domain
- Set `PAYPAL_ENVIRONMENT="live"`
- Use live Stripe keys (sk_live_... and pk_live_...)
- Test with real payment methods

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Monitor webhook events for security
- Use HTTPS in production
