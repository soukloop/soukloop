import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function getDatabaseUrl() {
    const rawUrl = process.env.DATABASE_URL
    if (!rawUrl) return undefined

    // Force IPv4 loopback in local Docker/Node environments
    if (rawUrl.includes("localhost")) {
        console.log("[Prisma] Auto-corrected DATABASE_URL host: localhost -> 127.0.0.1")
        return rawUrl.replace("localhost", "127.0.0.1")
    }

    return rawUrl
}

function createPrismaClient() {
    const databaseUrl = getDatabaseUrl()

    // Only override datasource URL when we have a real value.
    // Passing `url: undefined` can fail during module evaluation in build.
    if (databaseUrl) {
        return new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        })
    }

    return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
