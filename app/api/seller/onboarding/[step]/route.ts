import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { encrypt } from '@/lib/encryption'
import { handleApiError } from '@/lib/api-wrapper'

// Validation schemas
const identitySchema = z.object({
    govIdType: z.enum(['CNIC', 'PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID']),
    govIdNumber: z.string().min(5).max(50),
    govIdFrontUrl: z.string().min(1),
    govIdBackUrl: z.string().min(1),
    selfieUrl: z.string().min(1),
    // Tax Information
    taxIdType: z.enum(['SSN', 'EIN']),
    taxId: z.string().min(1),
})

const addressSchema = z.object({
    addressLine1: z.string().min(5).max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postalCode: z.string().min(4).max(20),
    country: z.string().length(2),
})

/**
 * POST /api/seller/onboarding/[step]
 * Save individual onboarding step data
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ step: string }> }
) {
    try {
        const { step } = await props.params
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Get verification record
        let verification = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id,
                OR: [
                    { status: 'incomplete' },
                    { status: 'rejected' }
                ]
            },
            select: { id: true, status: true },
            orderBy: { createdAt: 'desc' }
        })

        if (!verification) {
            try {
                // Get latest version number
                const latestVersion = await prisma.userVerification.findFirst({
                    where: { userId: session.user.id },
                    select: { version: true },
                    orderBy: { version: 'desc' }
                })

                verification = await prisma.userVerification.create({
                    data: {
                        userId: session.user.id,
                        status: 'incomplete',
                        version: (latestVersion?.version || 0) + 1
                    },
                    select: { id: true, status: true }
                })
            } catch (err) {
                return NextResponse.json(
                    { error: 'Failed to initialize application. Please try logging out and back in.' },
                    { status: 500 }
                )
            }
        }

        if (verification.status !== 'incomplete' && verification.status !== 'rejected') {
            return NextResponse.json({
                error: 'Application already submitted or approved',
                status: verification.status
            }, { status: 400 })
        }

        // Validate and save based on step
        let updateData: any = {}

        if (step === 'identity') {
            const validation = identitySchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 })
            }
            const validated = validation.data

            updateData = {
                govIdType: validated.govIdType,
                govIdNumber: await encrypt(validated.govIdNumber),
                govIdFrontUrl: validated.govIdFrontUrl,
                govIdBackUrl: validated.govIdBackUrl,
                selfieUrl: validated.selfieUrl,
                taxIdType: validated.taxIdType,
                taxId: await encrypt(validated.taxId)
            }
        } else if (step === 'address') {
            const validation = addressSchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 })
            }
            const validated = validation.data

            // Upsert: Find existing address by location OR create new with isBusiness=true
            const address = await prisma.address.upsert({
                where: {
                    unique_address_location: {
                        userId: session.user.id,
                        address1: validated.addressLine1,
                        city: validated.city,
                        postalCode: validated.postalCode
                    }
                },
                update: {
                    // Mark existing address as also being a business address
                    isBusiness: true,
                    address2: validated.addressLine2 || null,
                    state: validated.state,
                    country: validated.country
                },
                create: {
                    userId: session.user.id,
                    address1: validated.addressLine1,
                    address2: validated.addressLine2 || null,
                    city: validated.city,
                    state: validated.state,
                    postalCode: validated.postalCode,
                    country: validated.country,
                    isBusiness: true,
                    isDefault: false
                }
            })

            // Link to verification AND keep legacy fields for backward compatibility
            updateData = {
                ...validated,
                businessAddressId: address.id
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid step. Must be identity or address' },
                { status: 400 }
            )
        }

        await prisma.userVerification.update({
            where: { id: verification.id },
            data: { ...updateData, updatedAt: new Date() }
        })

        return NextResponse.json({
            success: true,
            message: `${step} information saved successfully`
        })

    } catch (error) {
        return handleApiError(error)
    }
}
