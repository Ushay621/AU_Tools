import { NextRequest, NextResponse } from 'next/server';
import { fileStore } from '@/lib/fileStore';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const sessionId = formData.get('sessionId') as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Set uploader session ID
        if (sessionId) {
            fileStore.setUploaderSession(sessionId);
        }

        const uploadedFiles = [];

        for (const file of files) {
            // Convert file to base64 (stored in memory only, not on disk)
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;

            const storedFile = {
                id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
                name: file.name,
                size: file.size,
                type: file.type,
                data: dataUrl,
                uploadedAt: Date.now(),
            };

            fileStore.addFile(storedFile);
            uploadedFiles.push({
                id: storedFile.id,
                name: storedFile.name,
                size: storedFile.size,
                type: storedFile.type,
                uploadedAt: storedFile.uploadedAt,
            });
        }

        return NextResponse.json({ files: uploadedFiles, message: 'Files uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const isInitialLoad = searchParams.get('initial') === 'true';

        // Only check on initial load to avoid clearing on every poll
        if (isInitialLoad && sessionId) {
            const cleared = fileStore.clearIfUploaderRefreshed(sessionId);
            if (cleared) {
                return NextResponse.json({ files: [], cleared: true });
            }
        }

        const files = fileStore.getAllFiles();

        // Return file metadata without the actual data (to reduce response size)
        const fileList = files.map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: file.uploadedAt,
        }));

        const uploaderSessionId = fileStore.getUploaderSession();

        return NextResponse.json({
            files: fileList,
            uploaderSessionId: uploaderSessionId
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            fileStore.removeFile(id);
            return NextResponse.json({ message: 'File deleted successfully' });
        } else {
            fileStore.clearAll();
            return NextResponse.json({ message: 'All files cleared successfully' });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}

