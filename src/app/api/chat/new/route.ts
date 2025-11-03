import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createConversation } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const { anon_id } = await request.json();

    if (!anon_id || anon_id !== user.anon_id) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 403 }
      );
    }

    // Generate new conversation ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const conversation_id = `conv_${timestamp}_${random}`;

    // Create conversation in database
    const newConversation = await createConversation(anon_id, 'New Conversation');

    console.log(`Created new conversation ${newConversation.id} for user ${anon_id}`);

    // Trigger real-time analytics update for new conversation
    try {
      await fetch(`${request.nextUrl.origin}/api/analytics/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anon_id: user.anon_id,
          event_type: 'conversation_update',
          data: {
            conversation_id: newConversation.id,
            action: 'created',
            timestamp: new Date().toISOString()
          }
        })
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to trigger analytics update:', error);
    }

    return NextResponse.json({
      conversation_id: newConversation.id,
      title: newConversation.title,
      created_at: new Date(newConversation.created_at * 1000).toISOString()
    });

  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}