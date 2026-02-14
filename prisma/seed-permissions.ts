
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedPermissions = async () => {
    console.log('Seeding permissions (statically)...');

    const adminUser = await prisma.user.findUnique({
        where: { email: 'super@admin.com' }
    });

    if (!adminUser) {
        console.log('⚠️ Super admin not found, skipping permission seeding');
        return;
    }

    const permissions = [
        { resource: 'all', action: 'manage' },
        { resource: 'products', action: 'view' },
        { resource: 'products', action: 'create' },
    ];

    for (const p of permissions) {
        await prisma.userPermission.upsert({
            where: {
                userId_resource_action: {
                    userId: adminUser.id,
                    resource: p.resource,
                    action: p.action,
                }
            },
            update: {},
            create: {
                userId: adminUser.id,
                resource: p.resource,
                action: p.action,
            }
        });
    }

    console.log('✓ Seeded basic permissions');
};
