
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = 'SuperAdmin123!';

    console.log('🔍 Searching for SuperAdmin user...');

    // Find user with SUPER_ADMIN role
    const superAdmin = await prisma.user.findFirst({
        where: {
            role: 'SUPER_ADMIN'
        }
    });

    if (!superAdmin) {
        console.error('❌ No user with SUPER_ADMIN role found.');
        console.log('   Please check if a superadmin user exists or create one.');
        return;
    }

    console.log(`✅ Found SuperAdmin: ${superAdmin.email} (ID: ${superAdmin.id})`);
    console.log('🔄 Updating password...');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user
    await prisma.user.update({
        where: { id: superAdmin.id },
        data: {
            password: passwordHash
        }
    });

    console.log('✅ Password updated successfully!');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${password}`);
}

main()
    .catch((e) => {
        console.error('❌ Error resetting password:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
