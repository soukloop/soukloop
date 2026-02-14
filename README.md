# Soukloop - Multivendor E-commerce Backend

A comprehensive multivendor e-commerce backend built with Next.js, Prisma, PostgreSQL, Redis, and multiple payment gateways (Stripe, PayPal, Coinbase Commerce).

## 🚀 Features

- **Multi-vendor Support**: Vendors can create stores, manage products, and handle orders
- **Authentication**: NextAuth.js with Google, Apple, Facebook, and credentials
- **Payment Processing**: Stripe, PayPal, and Coinbase Commerce integration
- **Rate Limiting**: Redis-based rate limiting for security
- **Real-time Features**: WebSocket support for messaging and notifications
- **Admin Panel**: Product moderation and vendor KYC management
- **Review System**: Product reviews and ratings
- **Refund System**: Automated refund processing
- **Docker Support**: Full containerization with Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- Stripe, PayPal, and Coinbase Commerce accounts

## 🛠️ Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd soukloop-vercel
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up postgres redis -d

# Wait for services to be ready
docker-compose ps
```

#### Option B: Local Installation

```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed
```

### 5. Start Development Server

```bash
# Start the development server
npm run dev

# Or with Docker
docker-compose up app -d
```

## 🐳 Docker Setup

### Full Stack with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development with Docker

```bash
# Start development services
docker-compose --profile dev up -d

# Run migrations in container
docker-compose exec app npx prisma migrate dev

# Seed database
docker-compose exec app npm run db:seed
```

## 🔧 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/soukloop_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

### Payment Gateway Configuration

#### Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### PayPal Setup
1. Create account at [developer.paypal.com](https://developer.paypal.com)
2. Create app in Sandbox
3. Get Client ID and Secret

```env
PAYPAL_CLIENT_ID="your_client_id"
PAYPAL_CLIENT_SECRET="your_client_secret"
PAYPAL_ENVIRONMENT="sandbox"
```

#### Coinbase Commerce Setup
1. Create account at [commerce.coinbase.com](https://commerce.coinbase.com)
2. Generate API key
3. Set up webhook

```env
COINBASE_COMMERCE_API_KEY="your_api_key"
COINBASE_COMMERCE_WEBHOOK_SECRET="your_webhook_secret"
```

## 🧪 Webhook Testing

### Stripe Webhook Testing

#### Using Stripe CLI (Recommended)

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows
# Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook events
stripe trigger checkout.session.completed
```

#### Using ngrok (Alternative)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in Stripe webhook settings
# https://abc123.ngrok.io/api/webhooks/stripe
```

### PayPal Webhook Testing

#### Using ngrok

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Configure webhook in PayPal Developer Dashboard
# Webhook URL: https://abc123.ngrok.io/api/webhooks/paypal
# Events: PAYMENT.CAPTURE.COMPLETED
```

### Coinbase Commerce Webhook Testing

#### Using ngrok

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Configure webhook in Coinbase Commerce Dashboard
# Webhook URL: https://abc123.ngrok.io/api/webhooks/crypto
# Events: charge:confirmed
```

## 📊 API Documentation

### Authentication Endpoints

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "name": "John Doe"
}
```

### Product Endpoints

```bash
# Get all products
GET /api/products?page=1&limit=10&search=keyword

# Get product details
GET /api/products/[id]

# Create product (SELLER only)
POST /api/products
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 29.99,
  "stock": 100
}
```

### Cart Endpoints

```bash
# Get user cart
GET /api/cart

# Add item to cart
POST /api/cart/items
{
  "productId": "product-id",
  "quantity": 2
}

# Update cart item
PATCH /api/cart/items
{
  "cartItemId": "item-id",
  "quantity": 3
}
```

### Order Endpoints

```bash
# Checkout
POST /api/orders/checkout
{
  "shippingAddress": {...},
  "billingAddress": {...}
}

# Get user orders
GET /api/orders?page=1&status=PAID

# Get vendor orders
GET /api/vendor/orders?status=PAID
```

### Payment Endpoints

```bash
# Create Stripe session
POST /api/payments/stripe/session
{
  "orderId": "order-id"
}

# Create PayPal order
POST /api/payments/paypal/create
{
  "orderId": "order-id"
}

# Create Coinbase charge
POST /api/payments/crypto/create
{
  "orderId": "order-id"
}
```

## 🔒 Security Features

### Rate Limiting

- **Login attempts**: 5 per 15 minutes per IP
- **Checkout requests**: 10 per hour per user
- **API requests**: 100 per 15 minutes per IP

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (USER, SELLER, ADMIN)
- Session management with NextAuth.js
- OAuth integration (Google, Apple, Facebook)

### Data Protection

- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection
- CSRF protection

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```bash
# Build image
docker build -t soukloop-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e REDIS_HOST="your-redis-host" \
  soukloop-backend
```

### Production Environment Variables

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@host:5432/db"
REDIS_HOST="your-redis-host"
REDIS_PASSWORD="your-redis-password"
NEXTAUTH_URL="https://your-domain.com"
```

## 📝 Database Schema

### Key Models

- **User**: Authentication and profile data
- **Vendor**: Store information and KYC status
- **Product**: Product catalog with images and variants
- **Order**: Order management and tracking
- **Payment**: Payment processing and status
- **Cart**: Shopping cart functionality
- **Review**: Product reviews and ratings

### Relationships

- User → Vendor (1:1)
- Vendor → Product (1:many)
- User → Order (1:many)
- Order → OrderItem (1:many)
- Product → Review (1:many)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Monitoring

### Health Checks

```bash
# Application health
GET /api/health

# Database health
GET /api/health/db

# Redis health
GET /api/health/redis
```

### Logging

- Structured logging with Winston
- Error tracking with Sentry
- Performance monitoring
- Security event logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Join our Discord community

## 🔄 Changelog

### v1.0.0
- Initial release
- Multi-vendor support
- Payment gateway integration
- Rate limiting
- Docker support
- Comprehensive API documentation
