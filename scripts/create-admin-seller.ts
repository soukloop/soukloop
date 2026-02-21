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
                    profile: {
                        upsert: {
                            create: {
                                firstName: 'Super',
                                lastName: 'Admin',
                                phone: '+12025550123',
                            },
                            update: {
                                firstName: 'Super',
                                lastName: 'Admin',
                                phone: '+12025550123',
                            }
                        }
                    }
                },
            });

            // Ensure Address exists with seller tag
            const address = await prisma.address.findFirst({
                where: { userId: existingUser.id, isSellerAddress: true }
            });

            const addressData = {
                address1: '1600 Pennsylvania Avenue NW',
                city: 'Washington',
                state: 'DC',
                postalCode: '20500',
                country: 'US',
                isSellerAddress: true,
                isDefault: true,
            };

            if (!address) {
                await prisma.address.create({
                    data: {
                        ...addressData,
                        userId: existingUser.id,
                    }
                });
                console.log('✅ Created professional Seller Address for existing user.');
            } else {
                await prisma.address.update({
                    where: { id: address.id },
                    data: addressData
                });
                console.log('✅ Updated professional Seller Address for existing user.');
            }

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

            // Ensure UserVerification exists and is filled
            const verification = await prisma.userVerification.findFirst({
                where: { userId: existingUser.id, isActive: true }
            });

            const verificationData = {
                status: 'approved',
                govIdType: 'PASSPORT',
                govIdNumber: 'A12345678',
                taxIdType: 'EIN',
                taxId: '12-3456789',
                businessType: 'LLC',
                isActive: true,
                submittedAt: new Date(),
                reviewedAt: new Date(),
                // Inline address fields — read by SellerApplicationSection to display seller address
                addressLine1: '1600 Pennsylvania Avenue NW',
                city: 'Washington',
                state: 'DC',
                postalCode: '20500',
                country: 'US',
            };

            if (!verification) {
                await prisma.userVerification.create({
                    data: {
                        ...verificationData,
                        userId: existingUser.id,
                    }
                });
                console.log('✅ Created comprehensive UserVerification for existing user.');
            } else {
                await prisma.userVerification.update({
                    where: { id: verification.id },
                    data: verificationData
                });
                console.log('✅ Updated comprehensive UserVerification for existing user.');
            }

        } else {
            // 3. Create User, Profile, Vendor, Address, and Verification in a transaction
            await prisma.$transaction(async (tx) => {
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
                                phone: '+12025550123',
                            }
                        },
                        vendor: {
                            create: {
                                slug: 'mailer-admin',
                                kycStatus: 'APPROVED',
                                isActive: true,
                                description: 'System Administrative Seller Profile',
                            }
                        },
                        addresses: {
                            create: {
                                address1: '1600 Pennsylvania Avenue NW',
                                city: 'Washington',
                                state: 'DC',
                                postalCode: '20500',
                                country: 'US',
                                isSellerAddress: true,
                                isDefault: true,
                            }
                        },
                        userVerifications: {
                            create: {
                                status: 'approved',
                                govIdType: 'PASSPORT',
                                govIdNumber: 'A12345678',
                                taxIdType: 'EIN',
                                taxId: '12-3456789',
                                businessType: 'LLC',
                                isActive: true,
                                submittedAt: new Date(),
                                reviewedAt: new Date(),
                                // Inline address fields — read by SellerApplicationSection to display seller address
                                addressLine1: '1600 Pennsylvania Avenue NW',
                                city: 'Washington',
                                state: 'DC',
                                postalCode: '20500',
                                country: 'US',
                            }
                        }
                    },
                });
                return user;
            });

            console.log('✅ Success! Superadmin-Seller created successfully with professional data.');
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
