import { NextRequest, NextResponse } from 'next/server';
import { fileStore } from '@/lib/fileStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = fileStore.getFile(id);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Return the file data (base64 data URL)
    return NextResponse.json({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      data: file.data,
      uploadedAt: file.uploadedAt,
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}

