import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export type StorageProviderType = 'local' | 's3';

export interface UploadResult {
    url: string;
    key: string;
}

export abstract class StorageProvider {
    abstract upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
    abstract uploadStream(fileStream: Readable, filename: string, mimeType: string): Promise<UploadResult>;
    abstract delete(key: string): Promise<void>;
}

class LocalStorageProvider extends StorageProvider {
    private uploadDir: string;
    private baseUrl: string;

    constructor() {
        super();
        this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
        this.baseUrl = '/uploads'; // Assumes public folder is served at root

        // Ensure directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
        const uniqueName = `${uuidv4()}-${filename}`;
        const filePath = path.join(this.uploadDir, uniqueName);

        await fs.promises.writeFile(filePath, file);

        return {
            url: `${this.baseUrl}/${uniqueName}`,
            key: uniqueName
        };
    }

    async uploadStream(fileStream: Readable, filename: string, mimeType: string): Promise<UploadResult> {
        const uniqueName = `${uuidv4()}-${filename}`;
        const filePath = path.join(this.uploadDir, uniqueName);
        const writeStream = fs.createWriteStream(filePath);

        await pipeline(fileStream, writeStream);

        return {
            url: `${this.baseUrl}/${uniqueName}`,
            key: uniqueName
        };
    }

    async delete(key: string): Promise<void> {
        const filePath = path.join(this.uploadDir, key);
        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            console.error(`Failed to delete local file ${filePath}:`, error);
        }
    }
}

class S3StorageProvider extends StorageProvider {
    private client: S3Client;
    private bucket: string;
    private region: string;

    constructor() {
        super();
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.bucket = process.env.AWS_BUCKET_NAME || '';

        this.client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
        const key = `uploads/${uuidv4()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file,
            ContentType: mimeType,
            // ACL: 'public-read' // Note: Many buckets utilize bucket policies instead of ACLs
        });

        await this.client.send(command);

        // Construct URL 
        const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

        return {
            url,
            key
        };
    }

    async uploadStream(fileStream: Readable, filename: string, mimeType: string): Promise<UploadResult> {
        const key = `uploads/${uuidv4()}-${filename}`;

        // S3 PutObjectCommand accepts Readable stream as Body
        // Note: For large streams without known length, Upload from @aws-sdk/lib-storage is preferred,
        // but PutObject works for basic node streams if size is not massive or if backend handles it.
        // Since we are fixing "RAM Explosion", passing the stream here avoids buffering in OUR app memory.
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileStream,
            ContentType: mimeType,
        });

        await this.client.send(command);

        const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

        return {
            url,
            key
        };
    }

    async delete(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.client.send(command);
    }
}

export function getStorageProvider(): StorageProvider {
    const type = (process.env.STORAGE_PROVIDER as StorageProviderType) || 'local';

    if (type === 's3') {
        return new S3StorageProvider();
    }
    return new LocalStorageProvider();
}
