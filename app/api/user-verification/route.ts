import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const verification = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id as string,
                OR: [
                    { isActive: true },
                    { status: 'submitted' },
                    { status: 'incomplete' }
                ]
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!verification) {
            return NextResponse.json(
                { message: 'No verification record found', status: 'none' },
                { status: 200 }
            )
        }

        return NextResponse.json({ verification })
    } catch (error) {
        console.error('Error fetching verification:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await req.json()
        // MAPPED: cnic -> govIdNumber, documentUrl -> govIdFrontUrl
        // We use 'govIdNumber' for the ID number and 'govIdFrontUrl' for the image
        const { cnic, documentUrl } = body

        if (!cnic || !documentUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check for existing active verification
        const existingVerification = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id as string,
                OR: [
                    { isActive: true },
                    { status: 'submitted' }
                ]
            }
        })

        if (existingVerification) {
            return NextResponse.json(
                { error: 'Verification already submitted' },
                { status: 409 }
            )
        }

        // Create new verification record
        // Status is 'pending' or 'submitted' depending on logic, keeping 'submitted' as per typical flow or 'pending' if strictly following previous code.
        // The previous code said 'pending' for creation, but 'submitted' in check. Let's use 'submitted' to align with the check.
        const verification = await prisma.userVerification.create({
            data: {
                userId: session.user.id as string,
                govIdNumber: cnic,       // mapped from input
                govIdFrontUrl: documentUrl, // mapped from input
                status: 'submitted'      // aligned with check logic
            }
        })

        return NextResponse.json({ verification }, { status: 201 })
    } catch (error) {
        console.error('Error creating verification:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
