import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Set up Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const clientId = `${user.anon_id}_${Date.now()}`;
        
        // Store the controller for this client
        clients.set(clientId, controller);
        
        // Send initial connection message
        const data = `data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
        
        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`;
            controller.enqueue(new TextEncoder().encode(heartbeatData));
          } catch (error) {
            clearInterval(heartbeat);
            clients.delete(clientId);
          }
        }, 30000);
        
        // Clean up on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          clients.delete(clientId);
          try {
            controller.close();
          } catch (error) {
            // Controller might already be closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Analytics stream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { anon_id, event_type, data } = await request.json();
    
    // Broadcast analytics update to all connected clients for this user
    clients.forEach((controller, clientId) => {
      if (clientId.startsWith(anon_id)) {
        try {
          const message = `data: ${JSON.stringify({ type: event_type, data })}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          // Client disconnected, remove from map
          clients.delete(clientId);
        }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics broadcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export utility function to broadcast analytics updates
export function broadcastAnalyticsUpdate(anon_id: string, event_type: string, data: any) {
  clients.forEach((controller, clientId) => {
    if (clientId.startsWith(anon_id)) {
      try {
        const message = `data: ${JSON.stringify({ type: event_type, data })}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        clients.delete(clientId);
      }
    }
  });
}