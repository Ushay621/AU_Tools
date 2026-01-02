import { NextRequest, NextResponse } from 'next/server';
import { fileStore } from '@/lib/fileStore';

// Simple polling endpoint instead of SSE for better compatibility
export async function GET(request: NextRequest) {
  try {
    const files = fileStore.getAllFiles();
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
    console.error('Error in stream endpoint:', error);
    return NextResponse.json({ error: 'Failed to get files' }, { status: 500 });
  }
}
