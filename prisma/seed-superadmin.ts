/**
 * Seed Script: Create SuperAdmin
 * 
 * Run with: npx ts-node prisma/seed-superadmin.ts
 * Or: npx tsx prisma/seed-superadmin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@soukloop.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
    const name = 'Super Admin';

    console.log('🔐 Creating SuperAdmin account...');
    console.log(`   Email: ${email}`);

    // Check if SuperAdmin already exists
    const existing = await prisma.adminUser.findFirst({
        where: { role: 'SUPER_ADMIN' }
    });

    if (existing) {
        console.log(`⚠️  SuperAdmin already exists: ${existing.email}`);
        console.log('   Skipping creation. To reset, delete the existing SuperAdmin first.');
        return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create SuperAdmin
    const superAdmin = await prisma.adminUser.create({
        data: {
            email: email.toLowerCase().trim(),
            name,
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
            isDeletable: false  // Cannot be deleted!
        }
    });

    console.log('✅ SuperAdmin created successfully!');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password immediately!');
    console.log(`   Default password: ${password}`);
}

main()
    .catch((e) => {
        console.error('❌ Error creating SuperAdmin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
