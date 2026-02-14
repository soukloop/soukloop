# PostgreSQL Migration Guide

## Current Status
- ✅ Prisma schema updated to support PostgreSQL
- ✅ Prisma client generated successfully
- ✅ Database models preserved (User, Vendor, Product, Cart, Order, Payment, etc.)
- ✅ All enums and relations maintained
- ✅ Setup guide created for PostgreSQL installation

## Database Models Preserved

### Core Models:
- **User** - Authentication and user profiles
- **UserProfile** - Extended user information
- **Address** - Shipping and billing addresses
- **Vendor** - Seller accounts and store information
- **Product** - Product catalog with images
- **ProductImage** - Product photos and media
- **Cart** - Shopping cart functionality
- **CartItem** - Individual cart items
- **Order** - Order management
- **OrderItem** - Order line items
- **Payment** - Payment processing
- **Refund** - Refund management
- **Review** - Product reviews and ratings

### Communication Models:
- **Conversation** - Customer support chats
- **ConversationParticipant** - Chat participants
- **Message** - Individual chat messages
- **Notification** - User notifications

### NextAuth Models:
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

### Enums:
- **Role** - USER, SELLER, ADMIN
- **KycStatus** - PENDING, APPROVED, REJECTED
- **OrderStatus** - PENDING, PAID, FULFILLED, CANCELED, REFUNDED
- **PaymentProvider** - STRIPE, PAYPAL, COINBASE
- **PaymentStatus** - PENDING, SUCCEEDED, FAILED, REFUNDED

## PostgreSQL Setup Options

### Option 1: Local PostgreSQL Installation
Follow the instructions in `setup_postgres.md` to install PostgreSQL locally.

### Option 2: Cloud Database Services
- **Supabase** (Free tier): https://supabase.com/
- **Railway**: https://railway.app/
- **Neon**: https://neon.tech/
- **PlanetScale**: https://planetscale.com/

### Option 3: Docker (if available)
```bash
docker compose up -d postgres
```

## Migration Steps (when PostgreSQL is ready)

1. **Update environment variables:**
```bash
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/soukloop_db?schema=public"' > .env
```

2. **Reset migrations:**
```bash
rm -rf prisma/migrations
```

3. **Create initial migration:**
```bash
npx prisma migrate dev --name init
```

4. **Seed the database:**
```bash
npx prisma db seed
```

## PostgreSQL-Specific Optimizations

The schema is ready for PostgreSQL with:
- ✅ Proper enum types
- ✅ JSON fields for flexible data
- ✅ Proper foreign key relationships
- ✅ Indexed fields for performance
- ✅ Cascade delete operations

## Benefits of PostgreSQL over SQLite

1. **Concurrent Access** - Multiple users can access simultaneously
2. **ACID Compliance** - Better data integrity
3. **Advanced Features** - JSON fields, full-text search, etc.
4. **Scalability** - Better performance with large datasets
5. **Production Ready** - Suitable for production deployments

## Current Development Setup

For now, the project continues to use SQLite for development:
- Database file: `./dev.db`
- All models and relationships preserved
- Ready to migrate to PostgreSQL when needed

## Next Steps

1. Choose a PostgreSQL setup method
2. Follow the setup instructions
3. Update the DATABASE_URL
4. Run the migration commands
5. Test the application with PostgreSQL

The schema is fully prepared for PostgreSQL migration whenever you're ready to set up the database server.
