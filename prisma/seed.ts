import { PrismaClient, Role, KycStatus, OrderStatus, PaymentProvider, PaymentStatus, PromotionType, AdminRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { seedTestimonials } from './seed-testimonials';
import { seedPermissions } from './seed-permissions';

const prisma = new PrismaClient();

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock data arrays
const firstNames = ['Ahmed', 'Fatima', 'Hassan', 'Ayesha', 'Omar', 'Zainab', 'Ali', 'Sara', 'Bilal', 'Nadia'];
const lastNames = ['Khan', 'Ahmed', 'Malik', 'Shah', 'Butt', 'Farooq', 'Rashid', 'Qureshi', 'Hussain', 'Jameel'];
const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
const categories = ['Men', 'Women', 'Kids'];
const dressStyles = ['Shalwar Kameez', 'Kurta', 'Lehnga', 'Saree', 'Abaya', 'Jeans', 'T-Shirt', 'Blazer', 'Maxi', 'Gown'];
const conditions = ['New', 'Like New', 'Good', 'Fair'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const fabrics = ['Cotton', 'Silk', 'Linen', 'Chiffon', 'Velvet', 'Lawn', 'Organza', 'Crepe'];
const occasions = ['Wedding', 'Party', 'Casual', 'Office', 'Eid', 'Formal Event'];

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  console.log('Cleaning existing data...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    console.log('✓ Database cleaned');
  } catch (error) {
    console.log('⚠️ Could not truncate all tables, some might be missing or locked.');
  }

  // ============ 1. CREATE USERS (10) ============
  console.log('Creating users...');
  const passwordHash = await hash('Password123!', 12);

  const users = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      return prisma.user.create({
        data: {
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          name: `${firstName} ${lastName}`,
          password: passwordHash,
          role: i < 5 ? Role.SELLER : Role.USER, // First 5 are sellers
          isActive: true,
          emailVerified: new Date(),
        },
      });
    })
  );
  console.log(`✓ Created ${users.length} users`);

  // ============ 2. CREATE USER PROFILES (10) ============
  console.log('Creating user profiles...');
  const profiles = await Promise.all(
    users.map((user, i) =>
      prisma.userProfile.create({
        data: {
          userId: user.id,
          firstName: firstNames[i],
          lastName: lastNames[i],
          phone: `+92300${String(i).padStart(7, '0')}`,
          bio: `Welcome to my profile! I love fashion and quality products.`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
      })
    )
  );
  console.log(`✓ Created ${profiles.length} profiles`);

  // ============ 3. CREATE ADDRESSES (20 - 2 per user) ============
  console.log('Creating addresses...');
  const addresses = await Promise.all(
    users.flatMap((user, i) => [
      prisma.address.create({
        data: {
          userId: user.id,
          address1: `${100 + i} Main Street`,
          address2: `Suite ${i + 1}`,
          city: cities[i],
          state: 'Punjab',
          postalCode: `5400${i}`,
          country: 'Pakistan',
          isDefault: true,
          isShipping: true,
          isBilling: true,
        },
      }),
      prisma.address.create({
        data: {
          userId: user.id,
          address1: `${200 + i} Business Avenue`,
          city: cities[(i + 1) % 10],
          state: 'Sindh',
          postalCode: `7500${i}`,
          country: 'Pakistan',
          isDefault: false,
          isSellerAddress: true,
        },
      }),
    ])
  );
  console.log(`✓ Created ${addresses.length} addresses`);

  // ============ 4. CREATE VENDORS (5 - for first 5 users) ============
  // Note: Vendor "name" comes from User.name via the user relation - no separate store name
  console.log('Creating vendors...');
  const vendors = await Promise.all(
    users.slice(0, 5).map((user, i) =>
      prisma.vendor.create({
        data: {
          userId: user.id,
          slug: `${firstNames[i].toLowerCase()}-seller-${i}`,
          description: `Premium fashion items curated by ${firstNames[i]}. Quality guaranteed!`,
          logo: `https://api.dicebear.com/7.x/initials/svg?seed=${firstNames[i]}`,
          kycStatus: KycStatus.APPROVED,
          commissionBps: 1200,
          isActive: true,
          averageRating: 4.0 + (i * 0.2),
          reviewCount: 10 + (i * 5),
          walletBalance: 1000 + (i * 500),
        },
      })
    )
  );
  console.log(`✓ Created ${vendors.length} vendors`);

  // ============ 5. CREATE CATEGORIES (8) ============
  console.log('Creating categories...');
  const categoryRecords = await Promise.all(
    categories.map((name, i) =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description: `Browse our ${name} collection`,
          productCount: 0,
          status: 'Active',
        },
      })
    )
  );
  console.log(`✓ Created ${categoryRecords.length} categories`);

  // ============ 6. CREATE DRESS STYLES (10) ============
  console.log('Creating dress styles...');
  const dressStyleRecords = await Promise.all(
    dressStyles.map((name, i) =>
      prisma.dressStyle.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          categoryType: i < 5 ? 'traditional' : 'western',
          status: 'approved',
        },
      })
    )
  );
  console.log(`✓ Created ${dressStyleRecords.length} dress styles`);

  // ============ 7. CREATE PRODUCTS (20 - 4 per vendor) ============
  console.log('Creating products...');
  const productNames = [
    'Elegant Silk Kurta', 'Designer Lehnga Set', 'Casual Cotton Shirt', 'Premium Blazer',
    'Traditional Shalwar Kameez', 'Party Wear Dress', 'Formal Office Suit', 'Wedding Collection',
    'Summer Lawn Dress', 'Winter Velvet Kurta', 'Hand-embroidered Shawl', 'Printed Maxi Dress',
    'Festive Gharara Set', 'Linen Casual Wear', 'Kids Party Outfit', 'Designer Abaya',
    'Bridal Lehnga', 'Mens Formal Suit', 'Stylish Jeans', 'Traditional Waistcoat'
  ];

  const products = await Promise.all(
    productNames.map((name, i) =>
      prisma.product.create({
        data: {
          vendorId: vendors[i % 5].id,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-') + `-${i}`,
          description: `Beautiful ${name} - Premium quality with exquisite craftsmanship. Perfect for any occasion.`,
          price: 1000 + (i * 500),
          comparePrice: 1500 + (i * 500),
          sku: `SKU-${String(i).padStart(5, '0')}`,
          trackQuantity: true,
          quantity: 10 + i,
          category: categories[i % 8],
          brand: `Brand ${String.fromCharCode(65 + (i % 5))}`,
          condition: conditions[i % 4],
          size: sizes[i % 6],
          fabric: fabrics[i % 8],
          gender: i % 3 === 0 ? 'Men' : i % 3 === 1 ? 'Women' : 'Unisex',
          occasion: occasions[i % 6],
          location: cities[i % 10],
          dressStyleId: dressStyleRecords[i % 10].id,
          isActive: true,
          viewCount: 50 + (i * 10),
          averageRating: 3.5 + ((i % 5) * 0.3),
          reviewCount: 5 + i,
        },
      })
    )
  );
  console.log(`✓ Created ${products.length} products`);

  // ============ 8. CREATE PRODUCT IMAGES (40 - 2 per product) ============
  console.log('Creating product images...');
  const productImages = await Promise.all(
    products.flatMap((product, i) => [
      prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.id}-1/800/1000`,
          alt: `${product.name} - Main Image`,
          order: 0,
          isPrimary: true,
        },
      }),
      prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.id}-2/800/1000`,
          alt: `${product.name} - Secondary Image`,
          order: 1,
          isPrimary: false,
        },
      }),
    ])
  );
  console.log(`✓ Created ${productImages.length} product images`);

  // ============ 9. CREATE CARTS (10) ============
  console.log('Creating carts...');
  const carts = await Promise.all(
    users.map((user) =>
      prisma.cart.create({
        data: { userId: user.id },
      })
    )
  );
  console.log(`✓ Created ${carts.length} carts`);

  // ============ 10. CREATE CART ITEMS (15) ============
  console.log('Creating cart items...');
  const cartItems = await Promise.all(
    carts.slice(0, 8).flatMap((cart, i) => [
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: products[i % products.length].id,
          quantity: 1 + (i % 3),
        },
      }),
      ...(i < 7 ? [prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: products[(i + 5) % products.length].id,
          quantity: 1,
        },
      })] : []),
    ])
  );
  console.log(`✓ Created ${cartItems.length} cart items`);

  // ============ 11. CREATE CUSTOMER ORDERS (8) ============
  console.log('Creating customer orders...');
  const customerOrders = await Promise.all(
    users.slice(5).concat(users.slice(5, 8)).map((user, i) =>
      prisma.customerOrder.create({
        data: {
          userId: user.id,
          orderNumber: `CO-${Date.now()}-${i}`,
          totalAmount: 2000 + (i * 1000),
          shippingAddress: { address: `${100 + i} Test St`, city: cities[i % 10], postalCode: `54000` },
          billingAddress: { address: `${100 + i} Test St`, city: cities[i % 10], postalCode: `54000` },
        },
      })
    )
  );
  console.log(`✓ Created ${customerOrders.length} customer orders`);

  // ============ 12. CREATE ORDERS (8) ============
  console.log('Creating orders...');
  const orders = await Promise.all(
    customerOrders.map((co, i) =>
      prisma.order.create({
        data: {
          userId: co.userId,
          vendorId: vendors[i % 5].id,
          customerOrderId: co.id,
          orderNumber: `ORD-${Date.now()}-${i}`,
          status: [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED][i % 4],
          subtotal: 1800 + (i * 500),
          tax: 200,
          shipping: 150,
          total: 2150 + (i * 500),
          shippingAddress: { address: `${100 + i} Test St`, city: cities[i % 10] },
          billingAddress: { address: `${100 + i} Test St`, city: cities[i % 10] },
          commissionRate: 0.12,
          netPayout: (2150 + (i * 500)) * 0.88,
          platformFee: (2150 + (i * 500)) * 0.12,
        },
      })
    )
  );
  console.log(`✓ Created ${orders.length} orders`);

  // ============ 13. CREATE ORDER ITEMS (12) ============
  console.log('Creating order items...');
  const orderItems = await Promise.all(
    orders.flatMap((order, i) => [
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: products[i % products.length].id,
          quantity: 1,
          price: products[i % products.length].price,
        },
      }),
      ...(i < 4 ? [prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: products[(i + 3) % products.length].id,
          quantity: 2,
          price: products[(i + 3) % products.length].price,
        },
      })] : []),
    ])
  );
  console.log(`✓ Created ${orderItems.length} order items`);

  // ============ 14. CREATE PAYMENTS (8) ============
  console.log('Creating payments...');
  const payments = await Promise.all(
    orders.map((order, i) =>
      prisma.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentProvider.STRIPE,
          status: [PaymentStatus.PENDING, PaymentStatus.SUCCEEDED, PaymentStatus.SUCCEEDED, PaymentStatus.SUCCEEDED][i % 4],
          amount: order.total,
          currency: 'PKR',
          providerRef: `pay_${generateId()}`,
          processedAt: i > 0 ? new Date() : null,
        },
      })
    )
  );
  console.log(`✓ Created ${payments.length} payments`);

  // ============ 15. CREATE DELIVERIES (6) ============
  console.log('Creating deliveries...');
  const deliveries = await Promise.all(
    orders.slice(2).map((order, i) =>
      prisma.delivery.create({
        data: {
          orderId: order.id,
          carrier: ['TCS', 'Leopards', 'DHL', 'FedEx'][i % 4],
          trackingNumber: `TRK${Date.now()}${i}`,
          shippingCost: 150 + (i * 50),
          status: ['pending', 'shipped', 'in_transit', 'delivered'][i % 4],
        },
      })
    )
  );
  console.log(`✓ Created ${deliveries.length} deliveries`);

  // ============ 16. CREATE REVIEWS (15) ============
  console.log('Creating reviews...');
  const reviewTexts = [
    'Excellent quality! Highly recommended.',
    'Good product, fast delivery.',
    'Beautiful design, fits perfectly.',
    'Value for money!',
    'Will buy again.',
  ];
  const reviews = await Promise.all(
    users.slice(5).flatMap((user, ui) =>
      products.slice(ui * 3, ui * 3 + 3).map((product, pi) =>
        prisma.review.create({
          data: {
            userId: user.id,
            productId: product.id,
            rating: 3 + (pi % 3),
            title: ['Great!', 'Nice!', 'Good'][pi % 3],
            comment: reviewTexts[(ui + pi) % 5],
            isVerified: pi % 2 === 0,
            isPublic: true,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${reviews.length} reviews`);

  // ============ 17. CREATE FAVORITES (12) ============
  console.log('Creating favorites...');
  const favorites = await Promise.all(
    users.slice(5).flatMap((user, i) =>
      products.slice(i * 2, i * 2 + 2).map((product) =>
        prisma.favorite.create({
          data: {
            userId: user.id,
            productId: product.id,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${favorites.length} favorites`);

  // ============ 18. CREATE CHAT CONVERSATIONS (10) ============
  console.log('Creating chat conversations...');
  const conversations = await Promise.all(
    users.slice(5).flatMap((buyer, i) =>
      [0, 1].map((j) =>
        prisma.chatConversation.create({
          data: {
            buyerId: buyer.id,
            sellerId: users[(i + j) % 5].id,
            productId: products[(i * 2 + j) % products.length].id,
            type: 'PRODUCT_INQUIRY',
            subject: `Question about ${products[(i * 2 + j) % products.length].name}`,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${conversations.length} conversations`);

  // ============ 19. CREATE CHAT MESSAGES (30) ============
  console.log('Creating chat messages...');
  const messageTexts = [
    'Hi, is this still available?',
    'Yes, it is! Would you like to purchase?',
    'What is the final price?',
    'Can you share more photos?',
    'Sure, I will send them shortly.',
  ];
  const messages = await Promise.all(
    conversations.flatMap((conv, i) =>
      Array.from({ length: 3 }, (_, j) =>
        prisma.chatMessage.create({
          data: {
            conversationId: conv.id,
            senderId: j % 2 === 0 ? conv.buyerId : conv.sellerId,
            message: messageTexts[(i + j) % 5],
            messageType: 'text',
            status: 'delivered',
            isRead: j < 2,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${messages.length} messages`);

  // ============ 20. CREATE NOTIFICATIONS (20) ============
  console.log('Creating notifications...');
  const notificationTypes = ['ORDER_PLACED', 'ORDER_SHIPPED', 'NEW_MESSAGE', 'PAYMENT_SUCCESS', 'NEW_REVIEW'];
  const notifications = await Promise.all(
    users.flatMap((user, i) =>
      [0, 1].map((j) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type: notificationTypes[(i + j) % 5],
            title: `${notificationTypes[(i + j) % 5].replace('_', ' ')}`,
            message: `You have a new notification regarding your ${i % 2 === 0 ? 'order' : 'product'}.`,
            isRead: j === 0,
            actionUrl: `/orders/${orders[i % orders.length].id}`,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${notifications.length} notifications`);

  // ============ 21. CREATE NOTIFICATION PREFERENCES (10) ============
  console.log('Creating notification preferences...');
  const notifPrefs = await Promise.all(
    users.map((user) =>
      prisma.notificationPreference.create({
        data: {
          userId: user.id,
          inAppOrders: true,
          inAppMessages: true,
          inAppReviews: true,
          inAppSystem: true,
          emailOrders: true,
          emailMessages: false,
          emailMarketing: false,
          emailDigest: 'weekly',
        },
      })
    )
  );
  console.log(`✓ Created ${notifPrefs.length} notification preferences`);

  // ============ 22. CREATE WALLET TRANSACTIONS (10) ============
  console.log('Creating wallet transactions...');
  const walletTxns = await Promise.all(
    vendors.flatMap((vendor, i) =>
      [0, 1].map((j) =>
        prisma.walletTransaction.create({
          data: {
            vendorId: vendor.id,
            amount: 500 + (i * 100) + (j * 200),
            type: j === 0 ? 'CREDIT' : 'DEBIT',
            referenceId: orders[(i + j) % orders.length].id,
            description: j === 0 ? `Sales credit for Order #${i + j}` : `Payout withdrawal`,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${walletTxns.length} wallet transactions`);

  // ============ 23. CREATE REWARD POINTS (15) ============
  console.log('Creating reward points...');
  const rewardPoints = await Promise.all(
    users.flatMap((user, i) =>
      i < 8 ? [0, 1].map((j) =>
        prisma.rewardPoint.create({
          data: {
            userId: user.id,
            points: 50 + (i * 10) + (j * 25),
            actionType: ['purchase', 'review', 'referral'][j % 3],
            referenceId: j === 0 ? orders[i % orders.length].id : null,
            note: `Points earned for ${['purchase', 'review', 'referral'][j % 3]}`,
          },
        })
      ) : []
    )
  );
  console.log(`✓ Created ${rewardPoints.length} reward points`);

  // ============ 24. CREATE REWARD BALANCES (10) ============
  console.log('Creating reward balances...');
  const rewardBalances = await Promise.all(
    users.map((user, i) =>
      prisma.rewardBalance.create({
        data: {
          userId: user.id,
          totalEarned: 100 + (i * 25),
          totalRedeemed: i * 10,
          currentBalance: 100 + (i * 15),
        },
      })
    )
  );
  console.log(`✓ Created ${rewardBalances.length} reward balances`);

  // ============ 25. CREATE PAYOUTS (5) ============
  console.log('Creating payouts...');
  const payouts = await Promise.all(
    vendors.map((vendor, i) =>
      prisma.payout.create({
        data: {
          vendorId: vendor.id,
          amount: 500 + (i * 200),
          currency: 'PKR',
          method: ['Bank Transfer', 'Direct Deposit', 'EasyPaisa'][i % 3],
          status: ['pending', 'completed', 'completed', 'pending', 'completed'][i],
          processedAt: i % 2 === 1 ? new Date() : null,
        },
      })
    )
  );
  console.log(`✓ Created ${payouts.length} payouts`);

  // ============ 26. CREATE USER VERIFICATIONS (5) ============
  console.log('Creating user verifications...');
  const verifications = await Promise.all(
    users.slice(0, 5).map((user, i) =>
      prisma.userVerification.create({
        data: {
          userId: user.id,
          status: ['approved', 'approved', 'submitted', 'incomplete', 'approved'][i],
          submittedAt: i < 3 ? new Date() : null,
          reviewedAt: i < 2 || i === 4 ? new Date() : null,
          govIdType: 'CNIC',
          govIdNumber: `35201-${String(i).padStart(7, '0')}-${i}`,
          govIdFrontUrl: `https://example.com/docs/front-${i}.jpg`,
          govIdBackUrl: `https://example.com/docs/back-${i}.jpg`,
          selfieUrl: `https://example.com/docs/selfie-${i}.jpg`,
          addressLine1: `${100 + i} Business Street`,
          city: cities[i],
          state: 'Punjab',
          postalCode: `5400${i}`,
          country: 'PK',
          businessType: 'individual',
          isActive: i !== 3,
          businessAddressId: addresses[i * 2 + 1].id,
        },
      })
    )
  );
  console.log(`✓ Created ${verifications.length} verifications`);

  // ============ 27. CREATE ADMIN USERS (3) ============
  console.log('Creating admin users...');
  const adminPassword = await hash('Admin123!', 12);
  const adminUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'super@admin.com' },
      update: {},
      create: {
        email: 'super@admin.com',
        name: 'Super Admin',
        password: adminPassword,
        role: Role.SUPER_ADMIN,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {},
      create: {
        email: 'admin@admin.com',
        name: 'Admin User',
        password: adminPassword,
        role: Role.ADMIN,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);
  console.log(`✓ Created ${adminUsers.length} admin users`);

  // ============ 28. CREATE PROMOTIONS (5) ============
  console.log('Creating promotions...');
  const promotions = await Promise.all(
    products.slice(0, 5).map((product, i) =>
      prisma.promotion.create({
        data: {
          product: { connect: { id: product.id } },
          type: [PromotionType.FEATURED, PromotionType.BUMP_UP, PromotionType.FEATURED][i % 3],
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      })
    )
  );
  console.log(`✓ Created ${promotions.length} promotions`);

  // ============ 29. CREATE REPORTS (3) ============
  console.log('Creating reports...');
  const reports = await Promise.all(
    [0, 1, 2].map((i) =>
      prisma.report.create({
        data: {
          reporterId: users[5 + i].id,
          productId: products[i].id,
          reason: ['Fake product', 'Misleading description', 'Inappropriate content'][i],
          status: ['pending', 'reviewed', 'resolved'][i],
        },
      })
    )
  );
  console.log(`✓ Created ${reports.length} reports`);

  // ============ 30. CREATE ANALYTICS VIEWS (20) ============
  console.log('Creating analytics views...');
  const analyticsViews = await Promise.all(
    products.slice(0, 10).flatMap((product, i) =>
      [0, 1].map((j) =>
        prisma.analyticsView.create({
          data: {
            productId: product.id,
            viewerId: users[(i + j) % users.length].id,
            viewedAt: new Date(Date.now() - (i + j) * 24 * 60 * 60 * 1000),
          },
        })
      )
    )
  );
  console.log(`✓ Created ${analyticsViews.length} analytics views`);

  // ============ 31. CREATE SAVED SEARCHES (5) ============
  console.log('Creating saved searches...');
  const savedSearches = await Promise.all(
    users.slice(5).map((user, i) =>
      prisma.savedSearch.create({
        data: {
          userId: user.id,
          query: ['kurta', 'wedding dress', 'formal suit', 'kids wear', 'accessories'][i],
          filters: { category: categories[i % 8], priceMin: 500, priceMax: 5000 },
        },
      })
    )
  );
  console.log(`✓ Created ${savedSearches.length} saved searches`);

  // ============ 32. CREATE RECENTLY VIEWED (15) ============
  console.log('Creating recently viewed...');
  const recentlyViewed = await Promise.all(
    users.slice(5).flatMap((user, i) =>
      products.slice(i * 3, i * 3 + 3).map((product) =>
        prisma.recentlyViewed.create({
          data: {
            userId: user.id,
            productId: product.id,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${recentlyViewed.length} recently viewed`);

  // ============ 33. CREATE BANNERS (3) ============
  console.log('Creating banners...');
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Summer Sale - Up to 50% Off!',
        description: 'Shop the hottest deals of the season',
        imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
        link: '/products?sale=true',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'New Arrivals',
        description: 'Check out our latest collection',
        imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
        link: '/products?sort=newest',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Eid Collection',
        description: 'Celebrate in style with our exclusive Eid collection',
        imageUrl: 'https://picsum.photos/seed/banner3/1200/400',
        link: '/products?occasion=Eid',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
  ]);
  console.log(`✓ Created ${banners.length} banners`);

  // ============ 34. CREATE SETTINGS (5) ============
  console.log('Creating settings...');
  const settings = await Promise.all([
    prisma.settings.create({ data: { key: 'site_name', value: 'SoukLoop' } }),
    prisma.settings.create({ data: { key: 'currency', value: 'PKR' } }),
    prisma.settings.create({ data: { key: 'commission_rate', value: '12' } }),
    prisma.settings.create({ data: { key: 'min_payout', value: '1000' } }),
    prisma.settings.create({ data: { key: 'support_email', value: 'support@soukloop.com' } }),
  ]);
  console.log(`✓ Created ${settings.length} settings`);

  // ============ 35. CREATE SUPPORT TICKETS (3) ============
  console.log('Creating support tickets...');
  const supportTickets = await Promise.all(
    users.slice(7).map((user, i) =>
      prisma.supportTicket.create({
        data: {
          userId: user.id,
          subject: ['Order issue', 'Payment problem', 'Product inquiry'][i],
          description: `I need help with my ${['order delivery', 'payment', 'product question'][i]}`,
          status: ['open', 'in_progress', 'resolved'][i],
          priority: ['high', 'medium', 'low'][i],
          conversationId: conversations[i].id,
        },
      })
    )
  );
  console.log(`✓ Created ${supportTickets.length} support tickets`);

  // ============ 36. CREATE SEARCH HISTORY (10) ============
  console.log('Creating search history...');
  const searchHistory = await Promise.all(
    users.map((user, i) =>
      prisma.searchHistory.create({
        data: {
          userId: user.id,
          searchQuery: ['kurta', 'wedding', 'formal', 'casual', 'kids', 'bridal', 'party', 'office', 'summer', 'winter'][i],
        },
      })
    )
  );
  console.log(`✓ Created ${searchHistory.length} search history records`);

  // ============ 37. CREATE AUDIT LOGS (10) ============
  console.log('Creating audit logs...');
  const auditLogs = await Promise.all(
    users.slice(0, 5).flatMap((user, i) =>
      [0, 1].map((j) =>
        prisma.auditLog.create({
          data: {
            userId: user.id,
            action: ['CREATE', 'UPDATE', 'DELETE'][j % 3],
            entity: ['Product', 'Order', 'Profile'][j % 3],
            entityId: products[i].id,
            details: { field: 'price', oldValue: 1000, newValue: 1200 },
            ipAddress: `192.168.1.${10 + i}`,
          },
        })
      )
    )
  );
  console.log(`✓ Created ${auditLogs.length} audit logs`);

  // ============ 38. CREATE REFUNDS (2) ============
  console.log('Creating refunds...');
  const refunds = await Promise.all(
    orders.slice(0, 2).map((order, i) =>
      prisma.refund.create({
        data: {
          orderId: order.id,
          amount: order.total * 0.5,
          reason: ['Product defective', 'Wrong size delivered'][i],
          status: ['PENDING', 'APPROVED'][i],
          providerRef: `ref_${generateId()}`,
          processedAt: i === 1 ? new Date() : null,
        },
      })
    )
  );
  console.log(`✓ Created ${refunds.length} refunds`);

  // ============ 39. CREATE TESTIMONIALS ============
  await seedTestimonials();

  // ============ 40. CREATE PERMISSIONS ============
  await seedPermissions();

  console.log('\n✅ Seed completed successfully!');
  console.log('=====================================');
  console.log('Test Users:');
  console.log('  Sellers: ahmed.khan@example.com ... (first 5)');
  console.log('  Buyers: omar.butt@example.com ... (last 5)');
  console.log('  Password: Password123!');
  console.log('Admin Users:');
  console.log('  super@admin.com / admin@admin.com / support@admin.com');
  console.log('  Password: Admin123!');
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
