import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { getStorageProvider } from '@/lib/storage';
import { handleApiError } from '@/lib/api-wrapper';
import { Readable } from 'stream';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime', // .mov
    'video/x-m4v'      // .m4v
];

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Validate Headers (Metadata)
        const filename = request.headers.get('x-filename');
        const mimeType = request.headers.get('content-type');
        const contentLength = parseInt(request.headers.get('content-length') || '0');

        if (!filename || !mimeType) {
            return NextResponse.json({ error: 'Missing X-Filename or Content-Type headers' }, { status: 400 });
        }

        // 2. Validate Type
        const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

        if (!isImage && !isVideo) {
            return NextResponse.json({
                error: 'Invalid file type',
                allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
            }, { status: 400 });
        }

        // 3. Validate Size (Fast Fail check via Header)
        if (contentLength > 0) {
            if (isImage && contentLength > MAX_IMAGE_SIZE) {
                return NextResponse.json({ error: 'Image size exceeds 5MB limit' }, { status: 400 });
            }
            if (isVideo && contentLength > MAX_VIDEO_SIZE) {
                return NextResponse.json({ error: 'Video size exceeds 50MB limit' }, { status: 400 });
            }
        }

        // 4. Stream directly to storage (Bypassing RAM buffering)
        const storage = getStorageProvider();

        // Convert Web Stream to Node Stream for pipeline compatibility
        // @ts-ignore - Readable.fromWeb is valid in modern Node but types might lag
        const nodeStream = Readable.fromWeb(request.body);

        const result = await storage.uploadStream(nodeStream, filename, mimeType);

        return NextResponse.json(result);

    } catch (error) {
        return handleApiError(error);
    }
}
