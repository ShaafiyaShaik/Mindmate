import { verifyAuth } from '@/lib/auth';
import { getConversations, getMessages } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const conversation_id = params.conversation_id;

    // Get user's conversations to verify ownership
    const conversations = await getConversations(user.anon_id);
    const conversation = conversations.find((c: any) => c.id === conversation_id) as {
      id: string;
      title: string;
      created_at: string;
    } | undefined;

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

  // Get messages for this conversation
  const messages = await getMessages(conversation_id);

    return NextResponse.json({
      conversation_id: conversation.id,
      title: conversation.title,
      messages: messages,
      created_at: conversation.created_at
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}