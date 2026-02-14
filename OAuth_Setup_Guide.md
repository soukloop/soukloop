# OAuth Provider Setup Guide

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

## Apple OAuth Setup

1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list)
2. Create a new App ID:
   - Description: Your App Name
   - Bundle ID: com.yourcompany.yourapp
   - Capabilities: Sign In with Apple
3. Create a new Service ID:
   - Description: Your App Name (Web)
   - Identifier: com.yourcompany.yourapp.web
   - Configure Sign In with Apple:
     - Primary App ID: Select the App ID created above
     - Domains and Subdomains: `localhost:3000`
     - Return URLs: `http://localhost:3000/api/auth/callback/apple`
4. Create a new Key:
   - Key Name: Apple Sign In Key
   - Configure: Sign In with Apple
   - Download the key file (.p8)
5. Copy the Service ID and Key ID to `.env.local`

## Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new app:
   - Display Name: Your App Name
   - App Contact Email: your-email@example.com
3. Add Facebook Login product
4. Configure Facebook Login:
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
5. Go to Settings → Basic:
   - Copy App ID and App Secret to `.env.local`

## Environment Variables

Update your `.env.local` file with:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Apple OAuth
APPLE_ID="your-apple-service-id"
APPLE_SECRET="your-apple-secret-key"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

## Testing OAuth

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/signin`
3. Click on the OAuth provider buttons to test
4. Ensure redirects work correctly

## Production Setup

For production, update:
- Redirect URIs to use your domain (e.g., `https://yourdomain.com/api/auth/callback/google`)
- Update `NEXTAUTH_URL` to your production domain
- Use production OAuth app credentials
