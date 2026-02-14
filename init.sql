-- Initialize PostgreSQL database for Soukloop
-- This file is executed when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE soukloop_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'soukloop_db')\gexec

-- Connect to the database
\c soukloop_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'SELLER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_provider AS ENUM ('STRIPE', 'PAYPAL', 'COINBASE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add some additional ones here

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE soukloop_db TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
