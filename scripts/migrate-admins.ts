import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting Admin Migration...');

    // 1. Fetch all AdminUsers
    const admins = await prisma.adminUser.findMany();
    console.log(`found ${admins.length} admins to migrate.`);

    for (const admin of admins) {
        console.log(`Processing admin: ${admin.email}`);

        // 2. Check if a User already exists with this email
        const existingUser = await prisma.user.findUnique({
            where: { email: admin.email },
        });

        if (existingUser) {
            console.log(`   -> User already exists. Updating role to ADMIN.`);
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    role: Role.ADMIN, // Or map derived from admin.role if complex
                    // We don't overwrite password if they already have a user account
                },
            });
            // TODO: Migrate permissions if needed
        } else {
            console.log(`   -> Creating new User for admin.`);
            // Create user with same password hash
            // Note: We need to ensure the hash formats are compatible. 
            // Assuming both use bcrypt (standard in this stack).

            await prisma.user.create({
                data: {
                    email: admin.email,
                    name: admin.name,
                    password: admin.passwordHash, // Copy the hash directly
                    role: Role.ADMIN,
                    isActive: admin.isActive,
                    emailVerified: new Date(), // Auto-verify migrated admins
                },
            });
        }
    }

    console.log('✅ Admin Migration Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
