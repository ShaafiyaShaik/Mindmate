import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { chat_id: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const { chat_id } = params;

    // Find the counselor chat
    const chat = (global.counselorStudentChats || []).find(
      (c: any) => c.id === chat_id && c.student_anon_id === user.anon_id
    );

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Mark messages as read by student
    if (chat.messages) {
      chat.messages.forEach((msg: any) => {
        if (msg.sender === 'counselor') {
          msg.read_by_student = true;
        }
      });
    }

    return NextResponse.json({
      chat_id: chat.id,
      counselor_id: 'Anonymous Counselor',
      title: 'Counselor Support Session',
      messages: chat.messages || [],
      created_at: chat.created_at,
      status: chat.status
    });

  } catch (error) {
    console.error('Get counselor chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chat_id: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const { chat_id } = params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Find the counselor chat
    const chatIndex = (global.counselorStudentChats || []).findIndex(
      (c: any) => c.id === chat_id && c.student_anon_id === user.anon_id
    );

    if (chatIndex === -1) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Create student message
    const messageObj = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sender: 'student',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      read_by_counselor: false
    };

    // Add message to chat
    if (!global.counselorStudentChats![chatIndex].messages) {
      global.counselorStudentChats![chatIndex].messages = [];
    }
    global.counselorStudentChats![chatIndex].messages.push(messageObj);
    global.counselorStudentChats![chatIndex].last_message = message.trim();
    global.counselorStudentChats![chatIndex].last_activity = messageObj.timestamp;

    console.log(`Student ${user.anon_id} sent message in counselor chat ${chat_id}`);

    return NextResponse.json({
      success: true,
      message: messageObj
    });

  } catch (error) {
    console.error('Send student message to counselor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}