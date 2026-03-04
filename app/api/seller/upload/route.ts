import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { z } from 'zod'
import { handleApiError } from '@/lib/api-wrapper'
import { getStorageProvider } from '@/lib/storage'

// Validation schema
const uploadSchema = z.object({
    fileType: z.enum(['govIdFront', 'govIdBack', 'selfie', 'addressProof', 'businessLicense'])
})

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

/**
 * POST /api/seller/upload
 * Upload KYC documents to local storage
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const fileType = formData.get('fileType') as string

        // Validate fileType
        const validation = uploadSchema.safeParse({ fileType })
        if (!validation.success) {
            return NextResponse.json({
                error: 'Invalid file type',
                details: validation.error.format()
            }, { status: 400 })
        }

        const file = formData.get('file') as File | null
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        if (file.size === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 })
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type',
                allowedTypes: ALLOWED_TYPES
            }, { status: 400 })
        }

        const extension = file.name.split('.').pop() || 'bin'
        const filename = `kyc-${session.user.id}-${validation.data.fileType}-${Date.now()}.${extension}`
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const storage = getStorageProvider()
        const uploadResult = await storage.upload(buffer, filename, file.type)

        return NextResponse.json({
            success: true,
            fileUrl: uploadResult.url
        })

    } catch (error) {
        return handleApiError(error)
    }
}
