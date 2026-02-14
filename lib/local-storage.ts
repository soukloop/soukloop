import fs from 'fs/promises'
import path from 'path'
import { NextRequest } from 'next/server'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'kyc')

/**
 * Save uploaded file to local filesystem
 * Files are stored in: public/uploads/kyc/{userId}/{fileType}-{timestamp}.ext
 */
export async function saveFileLocally({
    file,
    userId,
    fileType
}: {
    file: File
    userId: string
    fileType: string
}): Promise<string> {
    try {
        // Create user-specific directory
        const userDir = path.join(UPLOAD_DIR, userId)
        await fs.mkdir(userDir, { recursive: true })

        // Generate unique filename
        const extension = file.name.split('.').pop() || 'jpg'
        const filename = `${fileType}-${Date.now()}.${extension}`
        const filepath = path.join(userDir, filename)

        // Convert File to Buffer and save
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        await fs.writeFile(filepath, buffer)

        // Return public URL
        return `/uploads/kyc/${userId}/${filename}`

    } catch (error) {
        console.error('[Local Upload Error]:', error)
        throw new Error('Failed to save file')
    }
}

/**
 * Save file from FormData
 */
export async function saveFormDataFile({
    formData,
    fieldName,
    userId,
    fileType
}: {
    formData: FormData
    fieldName: string
    userId: string
    fileType: string
}): Promise<string> {
    const file = formData.get(fieldName) as File | null

    if (!file) {
        throw new Error(`No file found for field: ${fieldName}`)
    }

    if (file.size === 0) {
        throw new Error('File is empty')
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
        throw new Error('File size must be less than 5MB')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
    }

    return saveFileLocally({ file, userId, fileType })
}

/**
 * Delete file from local storage
 */
export async function deleteLocalFile(fileUrl: string): Promise<void> {
    try {
        const filepath = path.join(process.cwd(), 'public', fileUrl)
        await fs.unlink(filepath)
    } catch (error) {
        console.error('[Delete File Error]:', error)
        // Don't throw - file might already be deleted
    }
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(): Promise<void> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
}
