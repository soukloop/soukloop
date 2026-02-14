import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper'
import { auth } from "@/auth"
import { getStorageProvider } from '@/lib/storage'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const execAsync = promisify(exec)

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_TYPES: { [key: string]: string[] } = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    voice: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/aac'],
    file: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ]
}

async function convertToMp3(inputBuffer: Buffer, originalName: string): Promise<{ buffer: Buffer; filename: string }> {
    const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp')

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }

    const inputExt = path.extname(originalName) || '.webm'
    const inputPath = path.join(tempDir, `input-${uuidv4()}${inputExt}`)
    const outputPath = path.join(tempDir, `output-${uuidv4()}.mp3`)

    try {
        fs.writeFileSync(inputPath, inputBuffer)

        // Try to run ffmpeg. We use -vn to disable video, -ar for sample rate, -ac for channels, -b:a for bitrate
        // We catch errors to handle cases where ffmpeg is not installed
        try {
            await execAsync(`ffmpeg -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 128k "${outputPath}" -y`)
            const mp3Buffer = fs.readFileSync(outputPath)
            return {
                buffer: mp3Buffer,
                filename: originalName.replace(/\.[^.]+$/, '.mp3')
            }
        } catch (ffmpegError: any) {
            console.warn('FFmpeg conversion failed or FFmpeg not found. Falling back to original format.', ffmpegError.message)
            throw ffmpegError // Re-throw to be caught by the outer try-catch
        }
    } finally {
        // Clean up
        try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        } catch (e) {
            console.error('Failed to clean up temp files:', e)
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const mediaType = formData.get('mediaType') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
        }

        // Lenient validation for voice, strict for others
        // Strict validation for ALL types including 'file'
        const typeList = ALLOWED_TYPES[mediaType || 'file'] || ALLOWED_TYPES['file'];

        if (mediaType === 'voice') {
            // Voice has lax validation due to recording formats, but strictly no executables
            if (file.type === 'application/x-msdownload') {
                return NextResponse.json({ error: 'Executables not allowed' }, { status: 400 });
            }
        } else {
            if (!typeList.includes(file.type)) {
                return NextResponse.json({
                    error: `Invalid file type. Allowed: ${mediaType || 'file'} formats`,
                    allowed: typeList
                }, { status: 400 })
            }
        }

        let buffer = Buffer.from(await file.arrayBuffer())
        let originalName = file.name
        let mimeType = file.type || 'application/octet-stream'
        let finalFilename = `chat-${Date.now()}-${originalName.replace(/\s+/g, '-')}`

        // Audio Conversion logic
        if (mediaType === 'voice' && !mimeType.includes('mpeg')) {
            try {
                const converted = await convertToMp3(buffer, originalName)
                buffer = converted.buffer
                originalName = converted.filename
                mimeType = 'audio/mpeg'
                finalFilename = `chat-${Date.now()}-${originalName}`
            } catch (err) {
                // If conversion fails, we proceed with original
                console.log('Using original audio file due to conversion failure')
            }
        }

        // Ensure proper extension if still missing or generic
        if (!path.extname(finalFilename)) {
            if (mimeType.includes('webm')) finalFilename += '.webm'
            else if (mimeType.includes('mp4') || mimeType.includes('m4a')) finalFilename += '.mp4'
            else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) finalFilename += '.mp3'
        }

        const storage = getStorageProvider()
        const result = await storage.upload(buffer, finalFilename, mimeType)

        return NextResponse.json({
            fileUrl: result.url,
            key: result.key,
            fileName: originalName,
            fileSize: buffer.length,
            mimeType: mimeType
        })

    } catch (error) {
        return handleApiError(error)
    }
}
