import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { saveFormDataFile } from '@/lib/local-storage'
import { z } from 'zod'
import { handleApiError } from '@/lib/api-wrapper'

// Validation schema
const uploadSchema = z.object({
    fileType: z.enum(['govIdFront', 'govIdBack', 'selfie', 'addressProof', 'businessLicense'])
})

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

        // Save file to local storage
        const fileUrl = await saveFormDataFile({
            formData,
            fieldName: 'file',
            userId: session.user.id,
            fileType: validation.data.fileType
        })

        return NextResponse.json({
            success: true,
            fileUrl
        })

    } catch (error) {
        return handleApiError(error)
    }
}
