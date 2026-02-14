import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { productsData } from '@/prisma/products_data'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    const isDev = process.env.NODE_ENV === 'development'
    const isAdmin = session?.user?.role === 'ADMIN'

    if (!isDev && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ensure vendor user exists (same logic as seed script)
    const vendorUser = await prisma.user.upsert({
      where: { email: 'vendor@example.com' },
      update: {},
      create: {
        email: 'vendor@example.com',
        name: 'Vendor User',
        password: '',
        role: 'SELLER',
        emailVerified: new Date(),
        vendor: {
          create: {
            storeName: 'TechGear Pro',
            slug: 'techgear-pro',
            description: 'Premium electronics and gadgets for tech enthusiasts',
            isActive: true,
            commissionBps: 500,
          }
        }
      }
    })

    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUser.id } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor creation failed' }, { status: 500 })
    }

    let created = 0
    for (let i = 0; i < productsData.length; i++) {
      const p = productsData[i]
      const slug = (p.title || `product-${i + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (i + 1)

      const data: any = {
        name: p.title,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.originalPrice || null,
        sku: `SEED-${1000 + i}`,
        category: p.category,
        dress: p.subCategory || null,
        brand: p.brand || null,
        condition: p.condition || 'brand-new',
        size: p.size || null,
        isOnSale: !!p.onSale,
        tags: JSON.stringify([p.category, p.subCategory, p.brand].filter(Boolean)),
        quantity: Math.floor(Math.random() * 50) + 5,
        weight: 0.5,
        dimensions: JSON.stringify({ length: 10, width: 10, height: 5 }),
        images: {
          create: [
            {
              url: p.image || '/placeholder.png',
              alt: p.title,
              isPrimary: true,
              order: 0
            }
          ]
        }
      }

      await prisma.product.upsert({
        where: { vendorId_slug: { vendorId: vendor.id, slug } },
        update: data,
        create: { ...data, vendorId: vendor.id }
      })

      created++
    }

    return NextResponse.json({ created, total: productsData.length })

  } catch (error) {
    console.error('Seed products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
