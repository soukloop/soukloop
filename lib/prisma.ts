import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Fix for Docker/Node IPv6 resolution issues: Force 127.0.0.1 over localhost
const databaseUrl = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
    console.log('🔧 Auto-corrected DATABASE_URL: localhost -> 127.0.0.1');
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
