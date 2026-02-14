
import { PrismaClient } from '@prisma/client';

async function checkDb(url: string, label: string) {
    console.log(`\n--- Checking ${label} (${url}) ---`);
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });
    try {
        await prisma.$connect();
        const users = await prisma.user.count();
        const products = await prisma.product.count();
        const testimonials = await prisma.testimonial.count();
        console.log(`${label} counts: Users=${users}, Products=${products}, Testimonials=${testimonials}`);
    } catch (e) {
        console.log(`${label} failed: ${(e as Error).message}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    // 1. Current .env setting (Postgres 5435)
    await checkDb("postgresql://postgres:password@localhost:5435/soukloop_db?schema=public", "Postgres (5435/soukloop_db) - localhost");
    await checkDb("postgresql://postgres:password@127.0.0.1:5435/soukloop_db?schema=public", "Postgres (5435/soukloop_db) - 127.0.0.1");

    // 2. Dev Postgres (5433)
    await checkDb("postgresql://postgres:password@localhost:5433/soukloop_dev", "Postgres (5433/soukloop_dev)");

    // 3. SQLite
    await checkDb("file:./prisma/dev.db", "SQLite (dev.db)");
}

main();
