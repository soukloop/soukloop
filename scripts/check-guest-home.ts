import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking database for guest home page display issues...\n');

    // Check Products
    const totalProducts = await prisma.product.count();
    console.log(`📦 Total Products: ${totalProducts}`);

    const activeProducts = await prisma.product.count({
        where: { isActive: true }
    });
    console.log(`✅ Active Products (isActive=true): ${activeProducts}`);

    const pendingStyleProducts = await prisma.product.count({
        where: { hasPendingStyle: true }
    });
    console.log(`⏳ Products with Pending Style: ${pendingStyleProducts}`);

    const nonPendingProducts = await prisma.product.count({
        where: { hasPendingStyle: false }
    });
    console.log(`✓ Products without Pending Style: ${nonPendingProducts}`);

    // Check Vendors
    console.log('\n👥 Vendor Status:');
    const totalVendors = await prisma.vendor.count();
    console.log(`   Total Vendors: ${totalVendors}`);

    const approvedVendors = await prisma.vendor.count({
        where: { kycStatus: 'APPROVED' }
    });
    console.log(`   KYC Approved Vendors: ${approvedVendors}`);

    const activeVendors = await prisma.vendor.count({
        where: { isActive: true }
    });
    console.log(`   Active Vendors: ${activeVendors}`);

    const approvedActiveVendors = await prisma.vendor.count({
        where: {
            kycStatus: 'APPROVED',
            isActive: true
        }
    });
    console.log(`   Both Approved & Active: ${approvedActiveVendors}`);

    // Check Products visible to guests (matching API logic)
    console.log('\n🌐 Products Visible to Guests:');
    const guestVisibleProducts = await prisma.product.count({
        where: {
            isActive: true,
            hasPendingStyle: false,
            vendor: {
                kycStatus: 'APPROVED',
                isActive: true
            }
        }
    });
    console.log(`   ${guestVisibleProducts} products match guest visibility criteria`);

    // Sample some guest-visible products
    if (guestVisibleProducts > 0) {
        console.log('\n📋 Sample Guest-Visible Products:');
        const sampleProducts = await prisma.product.findMany({
            where: {
                isActive: true,
                hasPendingStyle: false,
                vendor: {
                    kycStatus: 'APPROVED',
                    isActive: true
                }
            },
            include: {
                images: { take: 1 },
                vendor: { select: { kycStatus: true, isActive: true } }
            },
            take: 5
        });

        sampleProducts.forEach((p, idx) => {
            console.log(`   ${idx + 1}. ${p.name} - $${p.price}`);
            console.log(`      - Category: ${p.category || 'N/A'}`);
            console.log(`      - Images: ${p.images.length}`);
            console.log(`      - Vendor KYC: ${p.vendor.kycStatus}, Active: ${p.vendor.isActive}`);
        });
    } else {
        console.log('\n❌ NO PRODUCTS MATCH GUEST VISIBILITY CRITERIA!');
        console.log('\nDiagnosing the issue...\n');

        // Find what's blocking products
        const inactiveProducts = await prisma.product.count({
            where: { isActive: false }
        });
        console.log(`   - ${inactiveProducts} products have isActive=false`);

        const productsWithInactiveVendor = await prisma.product.count({
            where: {
                vendor: {
                    isActive: false
                }
            }
        });
        console.log(`   - ${productsWithInactiveVendor} products have inactive vendors`);

        const productsWithUnapprovedVendor = await prisma.product.count({
            where: {
                vendor: {
                    kycStatus: { not: 'APPROVED' }
                }
            }
        });
        console.log(`   - ${productsWithUnapprovedVendor} products have unapproved vendors`);
    }

    // Check DressStyles for Bestselling section
    console.log('\n🎨 Dress Styles Status:');
    const totalStyles = await prisma.dressStyle.count();
    console.log(`   Total Styles: ${totalStyles}`);

    const approvedStyles = await prisma.dressStyle.count({
        where: { status: 'approved' }
    });
    console.log(`   Approved Styles: ${approvedStyles}`);

    if (approvedStyles === 0) {
        console.log('\n⚠️  NO APPROVED DRESS STYLES - Bestselling Categories will be empty!');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
