import { NextRequest } from 'next/server';
import { fileStore } from '@/lib/fileStore';

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial files list
      const sendFiles = () => {
        const files = fileStore.getAllFiles();
        const fileList = files.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: file.uploadedAt,
        }));

        const data = JSON.stringify({ files: fileList });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Send initial data
      sendFiles();

      // Listen for file changes
      const unsubscribe = fileStore.addListener(() => {
        sendFiles();
      });

      // Keep connection alive with ping every 30 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (error) {
          clearInterval(pingInterval);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}

