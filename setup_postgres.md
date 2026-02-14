# PostgreSQL Setup Instructions

Since Docker is not available on this system, here are alternative ways to set up PostgreSQL:

## Option 1: Install PostgreSQL Locally

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the 'postgres' user
4. Start PostgreSQL service

### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql
```

## Option 2: Use a Cloud Database

### Supabase (Free tier available):
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Update .env with the connection string

### Railway:
1. Go to https://railway.app/
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string

### Neon:
1. Go to https://neon.tech/
2. Create a new project
3. Copy the connection string

## Option 3: Use SQLite for Development

If you prefer to continue with SQLite for development:

```bash
# Revert to SQLite
echo 'DATABASE_URL="file:./dev.db"' > .env
```

## After Setting Up PostgreSQL:

1. Create the database:
```sql
CREATE DATABASE soukloop_db;
```

2. Run migrations:
```bash
npx prisma migrate dev --name init
```

3. Seed the database:
```bash
npx prisma db seed
```

## Environment Variables:

Update your `.env` file with the PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/soukloop_db?schema=public"
```

Replace:
- `username` with your PostgreSQL username
- `password` with your PostgreSQL password
- `localhost:5432` with your database host and port
- `soukloop_db` with your database name
