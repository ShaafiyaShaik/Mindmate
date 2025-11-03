import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMessages } from '@/lib/db';

// Global store for case messages
declare global {
  var caseMessages: any[] | undefined;
}

if (!global.caseMessages) {
  global.caseMessages = [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { caseId } = params;

  // Find the case
  const allCases = [...(global.activeCases || [])];
  const case_ = allCases.find(c => c.id === caseId);
  
  if (!case_) {
    return NextResponse.json(
      { error: 'Case not found' },
      { status: 404 }
    );
  }

  let messages: any[] = [];

  // Get messages from dedicated counselor-student chat
  const counselorChat = (global.counselorStudentChats || []).find(
    (chat: any) => chat.case_id === caseId
  );

  if (counselorChat && counselorChat.messages) {
    messages = counselorChat.messages.map((msg: any) => ({
      id: msg.id,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
      type: msg.sender,
      is_original: false
    }));
  }

  // If case has original messages from alert, include them at the beginning
  if (case_.original_messages && case_.original_messages.length > 0) {
    const originalMessages = case_.original_messages.map((msg: any) => ({
      id: `original_${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: case_.conversation_id,
      case_id: caseId,
      sender: msg.type === 'student' ? case_.anon_id : 'assistant',
      content: msg.message,
      timestamp: msg.timestamp,
      type: msg.type,
      is_original: true,
      metadata: {
        stress_score: case_.stress_score,
        consent: case_.consent
      }
    }));
    messages = [...originalMessages, ...messages];
  }

  // Sort by timestamp
  messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return NextResponse.json({
    messages: messages,
    case_info: {
      id: case_.id,
      anon_id: case_.anon_id,
      conversation_id: case_.conversation_id,
      status: case_.status,
      priority: case_.priority,
      stress_score: case_.stress_score,
      tags: case_.tags
    }
  });
}