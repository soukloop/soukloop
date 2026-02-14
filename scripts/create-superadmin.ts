import { PrismaClient, Role, KycStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAbsoluteSuperadmin() {
    const email = 'superadmin@soukloop.com';
    const password = 'SuperAdmin@123'; // IMPORTANT: Change this after first login
    const name = 'Super Administrator';

    console.log('🚀 Starting Absolute SuperAdmin Initialization...');

    try {
        // 1. Hash the password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Upsert User
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: Role.SUPER_ADMIN,
                password: passwordHash,
                isActive: true,
                isDeletable: false,
                emailVerified: new Date(),
            },
            create: {
                email,
                name,
                password: passwordHash,
                role: Role.SUPER_ADMIN,
                isActive: true,
                isDeletable: false,
                emailVerified: new Date(),
            },
        });
        console.log(`✅ User ensured: ${user.email} (ID: ${user.id})`);

        // 3. Upsert UserProfile
        const profile = await prisma.userProfile.upsert({
            where: { userId: user.id },
            update: {
                firstName: 'Super',
                lastName: 'Administrator',
                bio: 'System Super Administrator with full system access.',
            },
            create: {
                userId: user.id,
                firstName: 'Super',
                lastName: 'Administrator',
                bio: 'System Super Administrator with full system access.',
            },
        });
        console.log(`✅ UserProfile ensured for ${profile.firstName}`);

        // 4. Upsert Vendor (Seller)
        const vendor = await prisma.vendor.upsert({
            where: { userId: user.id },
            update: {
                kycStatus: KycStatus.APPROVED,
                isActive: true,
            },
            create: {
                userId: user.id,
                slug: 'superadmin-official',
                description: 'Official System Administrator Store',
                kycStatus: KycStatus.APPROVED,
                isActive: true,
            },
        });
        console.log(`✅ Vendor (Seller) profile ensured: ${vendor.slug}`);

        // 5. Upsert Notification Preferences
        await prisma.notificationPreference.upsert({
            where: { userId: user.id },
            update: {
                inAppOrders: true,
                inAppMessages: true,
                inAppReviews: true,
                inAppSystem: true,
                emailOrders: true,
                emailMessages: true,
            },
            create: {
                userId: user.id,
                inAppOrders: true,
                inAppMessages: true,
                inAppReviews: true,
                inAppSystem: true,
                emailOrders: true,
                emailMessages: true,
            },
        });
        console.log('✅ Notification Preferences enabled');

        // 6. Ensure Cart exists
        await prisma.cart.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
        });
        console.log('✅ Personal Cart initialized');

        // 7. Initialize Reward Balance
        await prisma.rewardBalance.upsert({
            where: { userId: user.id },
            update: {
                currentBalance: 1000,
            },
            create: {
                userId: user.id,
                currentBalance: 1000,
                totalEarned: 1000,
            },
        });
        console.log('✅ Reward Balance initialized (1000 bonus points)');

        // 8. Assign Global (Wildcard) Permissions
        // resource: '*' and action: '*' represents full access in most ACL systems
        const permissions = [
            { resource: '*', action: '*' },
            { resource: 'admin', action: 'all' },
            { resource: 'vendor', action: 'all' },
        ];

        for (const perm of permissions) {
            await prisma.userPermission.upsert({
                where: {
                    userId_resource_action: {
                        userId: user.id,
                        resource: perm.resource,
                        action: perm.action,
                    },
                },
                update: {},
                create: {
                    userId: user.id,
                    resource: perm.resource,
                    action: perm.action,
                },
            });
        }
        console.log('✅ Global Permissions assigned');

        console.log('\n✨ ABSOLUTE SUPERADMIN READY! ✨');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log('-----------------------------------');
        console.log('⚠️  Please change your password immediately after logging in.');

    } catch (error) {
        console.error('❌ Error initializing SuperAdmin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAbsoluteSuperadmin();
