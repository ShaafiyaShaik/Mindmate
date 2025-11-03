import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getConversations } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const anon_id = url.searchParams.get('anon_id');

    if (!anon_id || anon_id !== user.anon_id) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 403 }
      );
    }

    // Get conversations from database
    const conversations = await getConversations(anon_id);

    // Return conversation list without messages (for performance)
    const conversationList = conversations.map((conv: any) => ({
      conversation_id: conv.id,
      title: conv.title,
      last_message: conv.last_message,
      last_snippet: conv.last_snippet,
      mood_pulse: conv.mood_pulse || 'neutral',
      timestamp: conv.created_at,
      unread: conv.unread || false,
      last_stress_score: conv.last_stress_score || 50
    }));

    return NextResponse.json({
      conversations: conversationList
    });

  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}