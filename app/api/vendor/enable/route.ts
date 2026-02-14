import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor account already exists' },
        { status: 409 }
      )
    }

    // Get user info for slug generation
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role to SELLER
    await prisma.user.update({
      where: { id: userId },
      data: { role: Role.SELLER }
    })

    // Create vendor profile using user's name for slug
    const userName = user.name || user.email?.split('@')[0] || 'seller'
    const baseSlug = userName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (await prisma.vendor.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId,
        slug,
        description: '',
        kycStatus: 'PENDING',
        commissionBps: 500, // 5% default commission
        isActive: true
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    return NextResponse.json(vendor, { status: 201 })

  } catch (error) {
    console.error('Vendor enable POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
