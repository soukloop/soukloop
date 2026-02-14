
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@soukloop.com';
    const password = 'SuperAdmin123!';

    console.log(`🔍 Finding user: ${email}...`);

    // Find user
    const user = await prisma.user.findFirst({
        where: { email } // Do not filter by role initially, as it might be wrong
    });

    if (!user) {
        console.error(`❌ User ${email} not found!`);
        return;
    }

    console.log(`✅ Found User: ${user.id} (Current Role: ${user.role})`);
    console.log('🔄 Updating SuperAdmin security and syncing details...');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update User
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            role: 'SUPER_ADMIN',
            password: passwordHash,
            isDeletable: false,
            isActive: true,
            emailVerified: new Date(),
        }
    });

    console.log('✅ User updated:');
    console.log(`   - Role: ${updatedUser.role}`);
    console.log(`   - isDeletable: ${updatedUser.isDeletable}`);
    console.log(`   - Password: [SECURELY UPDATED]`);

    // Ensure Profile
    const profile = await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            firstName: 'Super',
            lastName: 'Administrator',
            bio: 'System Super Administrator',
        },
        update: {
            // Ensure names are set if missing
            firstName: 'Super',
            lastName: 'Administrator',
        }
    });
    console.log(`✅ Profile ensured: ${profile.firstName} ${profile.lastName}`);

    // Ensure Vendor (for selling capabilities if needed)
    const vendor = await prisma.vendor.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            slug: 'superadmin-store',
            description: 'Official Soukloop Superadmin Store',
            kycStatus: 'APPROVED',
            isActive: true
        },
        update: {
            kycStatus: 'APPROVED',
            isActive: true
        }
    });
    console.log(`✅ Vendor ensured: ${vendor.slug}`);

    // Ensure Notification Preferences
    await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {}
    });
    console.log('✅ Notification Preferences ensured');

    console.log('\n🎉 SuperAdmin update complete!');
    console.log(`   Login: ${email}`);
    console.log(`   Password: ${password}`);
}

main()
    .catch((e) => {
        console.error('❌ Error updating SuperAdmin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
