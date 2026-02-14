import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
    try {
        console.log('⚙️  Seeding settings...');

        const defaultSettings = [
            { key: 'siteName', value: 'Soukloop' },
            { key: 'siteEmail', value: 'admin@soukloop.com' },
            { key: 'supportEmail', value: 'support@soukloop.com' },
            { key: 'currency', value: 'USD' },
            { key: 'timezone', value: 'UTC' },
            { key: 'maintenanceMode', value: 'false' },
            { key: 'allowRegistration', value: 'true' },
            { key: 'requireEmailVerification', value: 'true' },
        ];

        for (const setting of defaultSettings) {
            await prisma.settings.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: setting
            });
        }

        console.log(`✅ Created/updated ${defaultSettings.length} settings`);
        console.log('✅ Settings seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding settings:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedSettings()
        .then(() => {
            console.log('🎉 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error during seeding:', error);
            process.exit(1);
        });
}

export { seedSettings };
