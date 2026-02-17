import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminSeller() {
    const email = 'mailer@soukloop.com';
    const rawPassword = 'AdminSeller@2026'; // Please change this after login if needed

    try {
        console.log(`Starting creation of Superadmin-Seller: ${email}`);

        // 1. Hash the password
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('⚠️  User already exists. Clearing existing data for a fresh Superadmin-Seller setup...');
            // To ensure a clean state as requested, we'll update the existing user
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    role: 'SUPER_ADMIN',
                    password: hashedPassword,
                    isActive: true,
                    emailVerified: new Date(),
                },
            });

            // Ensure Vendor exists
            const vendor = await prisma.vendor.findUnique({ where: { userId: existingUser.id } });
            if (!vendor) {
                await prisma.vendor.create({
                    data: {
                        userId: existingUser.id,
                        slug: 'mailer-admin',
                        kycStatus: 'APPROVED',
                        isActive: true,
                        description: 'System Administrative Seller Profile',
                    },
                });
                console.log('✅ Created missing Vendor profile for existing user.');
            } else {
                await prisma.vendor.update({
                    where: { userId: existingUser.id },
                    data: { kycStatus: 'APPROVED', isActive: true },
                });
                console.log('✅ Updated existing Vendor profile to APPROVED.');
            }
        } else {
            // 3. Create User, Profile, and Vendor in a transaction
            const newUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        role: 'SUPER_ADMIN',
                        isActive: true,
                        name: 'Super Admin Seller',
                        emailVerified: new Date(),
                        profile: {
                            create: {
                                firstName: 'Super',
                                lastName: 'Admin',
                                phone: '0000000000',
                            }
                        },
                        vendor: {
                            create: {
                                slug: 'mailer-admin',
                                kycStatus: 'APPROVED',
                                isActive: true,
                                description: 'System Administrative Seller Profile',
                            }
                        }
                    },
                });
                return user;
            });

            console.log('✅ Success! Superadmin-Seller created successfully.');
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Password: ${rawPassword}`);
        }

        console.log('\n🚀 Setup Complete. You can now login at http://localhost:3000/auth/login');

    } catch (error) {
        console.error('❌ Error during script execution:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminSeller();
