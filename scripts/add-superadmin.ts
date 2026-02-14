import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addSuperadmin() {
    try {
        const email = 'superadmin@soukloop.com';
        const password = 'SuperAdmin@123'; // Change this to your desired password

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if superadmin already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('❌ Superadmin already exists with email:', email);

            // Optional: Upgrade existing user to SUPER_ADMIN
            if (existing.role !== 'SUPER_ADMIN') {
                await prisma.user.update({
                    where: { id: existing.id },
                    data: { role: 'SUPER_ADMIN' }
                });
                console.log('🔄 Upgraded existing user to SUPER_ADMIN');
            }
            return;
        }

        // Create superadmin
        const superadmin = await prisma.user.create({
            data: {
                email,
                name: 'Super Administrator',
                password: passwordHash, // User model uses 'password'
                role: 'SUPER_ADMIN',
                isActive: true, // Assuming isActive is on User or defaulted
                emailVerified: new Date(),
            }
        });

        console.log('✅ Superadmin created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 ID:', superadmin.id);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    } catch (error) {
        console.error('❌ Error creating superadmin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addSuperadmin();
