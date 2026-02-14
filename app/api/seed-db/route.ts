import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helpers for random data
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomArrayItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomBoolean = () => Math.random() < 0.5;

const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"];
const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Toys", "Automotive", "Books", "Health"];
const LOCATIONS = ["USA", "UK", "Canada", "Australia", "Germany", "France"];

export async function GET() {
    try {
        console.log("Starting comprehensive seed...");
        const timestamp = Date.now();

        // 1. Create Users (Buyers & Sellers)
        const users = [];
        for (let i = 0; i < 10; i++) {
            const email = `user_${i}_${timestamp}@example.com`;
            // Check if exists (unlikely with timestamp but good practice)
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: `${getRandomArrayItem(FIRST_NAMES)} ${getRandomArrayItem(LAST_NAMES)}`,
                        role: i < 3 ? "SELLER" : "USER", // First 3 are sellers
                        emailVerified: new Date(),
                        image: `https://i.pravatar.cc/150?u=${email}`,
                    }
                });
            }
            users.push(user);
        }

        // 2. User Profiles & Addresses
        for (const user of users) {
            // Profile
            await prisma.userProfile.create({
                data: {
                    userId: user.id,
                    firstName: user.name?.split(' ')[0],
                    lastName: user.name?.split(' ')[1],
                    bio: "Just a shopper on Soukloop.",
                    phone: `+1555000${getRandomInt(1000, 9999)}`
                }
            });

            // Address
            await prisma.address.create({
                data: {
                    userId: user.id,
                    isBilling: true,
                    firstName: user.name?.split(' ')[0] || "User",
                    lastName: user.name?.split(' ')[1] || "Name",
                    address1: `${getRandomInt(1, 999)} Main St`,
                    city: getRandomArrayItem(CITIES),
                    state: "NY", // simplified
                    postalCode: "10001",
                    country: "USA",
                    phone: `+1555000${getRandomInt(1000, 9999)}`,
                    isDefault: true
                }
            });
        }

        // 3. Categories & Locations
        const categories = [];
        for (const catName of CATEGORIES) {
            const slug = `${catName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}-${timestamp}`;
            let cat = await prisma.category.findUnique({ where: { slug } });
            if (!cat) {
                cat = await prisma.category.create({ data: { name: catName, slug } });
            }
            categories.push(cat);
        }

        const locationObjs = [];
        for (const locName of LOCATIONS) {
            const loc = await prisma.location.create({ data: { name: locName } });
            locationObjs.push(loc);
        }

        // 4. Vendors (linked to Sellers)
        const sellers = users.filter(u => u.role === "SELLER");
        const vendors = [];
        for (const seller of sellers) {
            const vendor = await prisma.vendor.create({
                data: {
                    userId: seller.id,
                    storeName: `${seller.name}'s Store`,
                    slug: `store-${seller.id}-${timestamp}`,
                    description: "Best products in town.",
                    kycStatus: getRandomBoolean() ? "APPROVED" : "PENDING",
                    isActive: true
                }
            });
            vendors.push(vendor);
        }

        // 5. Products & Listings
        const products = [];
        const listings = [];
        const DRESS_STYLES = ["Maxi", "Casual", "Party", "Summer", "Formal"];

        for (const vendor of vendors) {
            for (let i = 0; i < 5; i++) {
                // Product (B2C)
                const price = getRandomInt(10, 500);
                const product = await prisma.product.create({
                    data: {
                        vendorId: vendor.id,
                        name: `Product ${i} from ${vendor.storeName}`,
                        slug: `prod-${vendor.id}-${i}-${timestamp}`,
                        description: "High quality item.",
                        price: price,

                        category: getRandomArrayItem(CATEGORIES), // string field in Product
                        dress: getRandomArrayItem(DRESS_STYLES), // For stats
                        isActive: true,
                        images: {
                            create: [
                                { url: `https://picsum.photos/seed/${vendor.id}-${i}/300/300`, isPrimary: true, order: 0 },
                                { url: `https://picsum.photos/seed/${vendor.id}-${i}-2/300/300`, isPrimary: false, order: 1 }
                            ]
                        }
                    }
                });
                products.push(product);

                // Listing (C2C or secondary) -> Now a Product with isC2C=true
                const listingPrice = price * 0.8;
                const listingProduct = await prisma.product.create({
                    data: {
                        vendorId: vendor.id, // technically C2C should be user-based, but for now linking to vendor profile is safest per schema
                        name: `Listing ${i} - ${vendor.storeName}`,
                        slug: `listing-${vendor.id}-${i}-${timestamp}`,
                        description: "Used item, good condition.",
                        price: listingPrice,
                        category: getRandomArrayItem(categories).name,

                        location: "New York, USA", // simplified
                        isActive: true,
                        images: {
                            create: [
                                { url: `https://picsum.photos/seed/listing-${vendor.id}-${i}/300/300`, order: 0 }
                            ]
                        }
                    }
                });
                listings.push(listingProduct);
            }
        }

        // 6. Orders (Transactions)
        const buyers = users.filter(u => u.role === "USER");
        for (const buyer of buyers) {
            // Create a Customer Order
            const custOrder = await prisma.customerOrder.create({
                data: {
                    userId: buyer.id,
                    orderNumber: `ORD-${buyer.id.substring(0, 4)}-${timestamp}`,
                    totalAmount: 0, // update later
                    shippingAddress: {},
                    billingAddress: {}
                }
            });

            // Create Vendor Orders (Sub-orders)
            // Pick rand vendor
            const vendor = getRandomArrayItem(vendors);
            // Pick rand products from this vendor
            const vendorProducts = products.filter(p => p.vendorId === vendor.id);
            if (vendorProducts.length === 0) continue;

            const selectedProd = getRandomArrayItem(vendorProducts);
            const qty = getRandomInt(1, 3);
            const total = selectedProd.price * qty;

            const order = await prisma.order.create({
                data: {
                    customerOrderId: custOrder.id,
                    userId: buyer.id,
                    vendorId: vendor.id,
                    orderNumber: `SUB-${getRandomInt(1000, 9999)}-${timestamp}`,
                    status: getRandomBoolean() ? "PAID" : "PENDING",
                    subtotal: total,
                    total: total,
                    shippingAddress: {},
                    billingAddress: {},
                    items: {
                        create: {
                            productId: selectedProd.id,
                            quantity: qty,
                            price: selectedProd.price
                        }
                    }
                }
            });

            // Create Payment
            if (order.status === "PAID") {
                await prisma.payment.create({
                    data: {
                        orderId: order.id,
                        provider: "STRIPE",
                        status: "SUCCEEDED",
                        amount: total
                    }
                });
            }
        }

        // 7. Reviews & Favorites
        for (const user of users) {
            // Favorite some products
            const randProd = getRandomArrayItem(products);
            if (randProd) {
                // Check uniqueness first or use createMany with skip duplicates if supported (Prisma createMany skipDuplicates is experimental/db dependent)
                // Just try catch or proper check
                const exists = await prisma.favorite.findUnique({
                    where: { userId_productId: { userId: user.id, productId: randProd.id } }
                });
                if (!exists) {
                    await prisma.favorite.create({
                        data: {
                            userId: user.id,
                            productId: randProd.id
                        }
                    });
                }
            }

            // Recently Viewed
            if (randProd) {
                await prisma.recentlyViewed.create({
                    data: {
                        userId: user.id,
                        productId: randProd.id
                    }
                });
            }
        }

        // 8. Pending Reports
        if (users.length > 0 && products.length > 0) {
            await prisma.report.createMany({
                data: [
                    {
                        reporterId: users[0].id,
                        productId: products[0].id,
                        reason: "Counterfeit Item",
                        status: "pending"
                    },
                    {
                        reporterId: users[1].id,
                        productId: products[1].id,
                        reason: "Harassment",
                        status: "resolved"
                    }
                ]
            });
        }

        // 9. Chats
        const buyer = users.find(u => u.role === "USER");
        const seller = users.find(u => u.role === "SELLER");
        if (buyer && seller && products.length > 0) {
            const convo = await prisma.chatConversation.create({
                data: {
                    buyerId: buyer.id,
                    sellerId: seller.id,
                    productId: products[0].id
                }
            });

            await prisma.chatMessage.create({
                data: {
                    conversationId: convo.id,
                    senderId: buyer.id,
                    message: "Is this still available?"
                }
            });
        }

        // 10. Notifications
        for (const user of users) {
            const notifCount = getRandomInt(0, 3);
            for (let k = 0; k < notifCount; k++) {
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: "SYSTEM",
                        title: "Welcome to Soukloop",
                        message: "Thanks for joining us!",
                        isRead: getRandomBoolean()
                    }
                });
            }
        }

        // 11. Rewards
        for (const user of users) {
            const points = getRandomInt(10, 500);
            await prisma.rewardPoint.create({
                data: {
                    userId: user.id,
                    points: points,
                    actionType: "SIGNUP_BONUS",
                    note: "Welcome bonus"
                }
            });
            // Update balance
            await prisma.rewardBalance.upsert({
                where: { userId: user.id },
                create: { userId: user.id, currentBalance: points, totalEarned: points },
                update: { currentBalance: { increment: points }, totalEarned: { increment: points } }
            });
        }

        // 12. Audit Logs
        await prisma.auditLog.create({
            data: {
                action: "SYSTEM_SEED",
                entity: "DATABASE",
                entityId: "ALL",
                details: { note: "Seeded dummy data" }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Comprehensive dummy data seeded successfully. Database populated."
        });

    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
