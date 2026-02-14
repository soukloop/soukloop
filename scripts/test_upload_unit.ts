
import { getStorageProvider } from '../lib/storage';
import fs from 'fs';
import path from 'path';

async function testStorage() {
    process.env.STORAGE_PROVIDER = 'local';
    const storage = getStorageProvider();

    console.log('Testing Local Storage Provider...');

    const testContent = Buffer.from('Hello World Storage Test');
    const filename = 'test-file.txt';
    const mimeType = 'text/plain';

    try {
        // 1. Upload
        const result = await storage.upload(testContent, filename, mimeType);
        console.log('Upload Result:', result);

        if (!result.url.includes('/uploads/')) {
            throw new Error('Invalid URL returned');
        }

        // 2. Verify File Exists
        const filePath = path.join(process.cwd(), 'public', 'uploads', result.key);
        if (fs.existsSync(filePath)) {
            console.log('✅ File successfully created at:', filePath);
        } else {
            throw new Error('File not found at expected path');
        }

        // 3. Clean up (Optional, but good for tests)
        // await storage.delete(result.key);
        // console.log('✅ File deleted');

    } catch (error) {
        console.error('❌ Storage Test Failed:', error);
        process.exit(1);
    }
}

testStorage();
