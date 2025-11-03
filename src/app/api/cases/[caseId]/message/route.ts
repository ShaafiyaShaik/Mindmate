import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { saveMessage } from '@/lib/db';

// Global store for case messages
declare global {
  var caseMessages: any[] | undefined;
}

if (!global.caseMessages) {
  global.caseMessages = [];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const user = authResult;
  const { caseId } = params;
  const body = await request.json();
  const { message, type = 'counselor', resource_id = null } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json(
      { error: 'Message is required' },
      { status: 400 }
    );
  }

  // Find the case
  const allCases = [...(global.activeCases || [])];
  const case_ = allCases.find(c => c.id === caseId);
  
  if (!case_) {
    return NextResponse.json(
      { error: 'Case not found' },
      { status: 404 }
    );
  }

  // Check if counselor has permission to message this case
  if (case_.assigned_to !== user.anon_id) {
    return NextResponse.json(
      { error: 'You are not assigned to this case' },
      { status: 403 }
    );
  }

  try {
    // Create message object
    const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const messageObj = {
      id: messageId,
      conversation_id: case_.conversation_id,
      case_id: caseId,
      sender: type === 'counselor' ? 'counselor' : user.anon_id,
      content: message,
      timestamp: new Date().toISOString(),
      type: type,
      counselor_id: user.anon_id,
      resource_id: resource_id,
      metadata: {
        case_id: caseId,
        anon_id: case_.anon_id,
        anonymous: true
      }
    };

    // Store in case messages global store
    (global as any).caseMessages.push(messageObj);

    // Create or find dedicated counselor-student chat (separate from AI chat)
    const chatId = `counselor_chat_${caseId}`;
    let counselorChat = (global.counselorStudentChats || []).find(
      (chat: any) => chat.case_id === caseId
    );

    if (!counselorChat) {
      // Create new dedicated counselor-student chat
      counselorChat = {
        id: chatId,
        case_id: caseId,
        student_anon_id: case_.anon_id,
        counselor_id: user.anon_id,
        created_at: messageObj.timestamp,
        last_activity: messageObj.timestamp,
        last_message: message,
        status: 'active',
        messages: []
      };
      
      if (!global.counselorStudentChats) global.counselorStudentChats = [];
      (global as any).counselorStudentChats.push(counselorChat);
    }

    // Add message to dedicated counselor chat
    const counselorMessage = {
      id: messageId,
      sender: 'counselor',
      content: message,
      timestamp: messageObj.timestamp,
      read_by_student: false
    };
    
    counselorChat.messages.push(counselorMessage);
    counselorChat.last_message = message;
    counselorChat.last_activity = messageObj.timestamp;

    // Update case activity
    const caseIndex = (global.activeCases || []).findIndex(c => c.id === caseId);
    if (caseIndex !== -1) {
      (global as any).activeCases[caseIndex].last_activity = messageObj.timestamp;
      (global as any).activeCases[caseIndex].counselor_last_seen = messageObj.timestamp;
      (global as any).activeCases[caseIndex].message_count = ((global as any).activeCases[caseIndex].message_count || 0) + 1;
      (global as any).activeCases[caseIndex].status = 'in-progress';
    }

    // Add audit log entry
    if (!global.caseAuditLog) global.caseAuditLog = [];
    (global as any).caseAuditLog.push({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      case_id: caseId,
      action: 'message_sent',
      actor: user.anon_id,
      timestamp: messageObj.timestamp,
      details: `Counselor sent message to ${case_.anon_id}`
    });

    console.log(`Counselor ${user.anon_id} sent message to case ${caseId} (${case_.anon_id})`);

    return NextResponse.json({
      success: true,
      message: messageObj,
      case_updated: true,
      delivered_to: case_.anon_id
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}