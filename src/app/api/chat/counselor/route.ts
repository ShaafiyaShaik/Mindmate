import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { saveMessage, getMessages } from '@/lib/db';

// Global store for counselor-student conversations
declare global {
  var counselorStudentChats: any[] | undefined;
}

if (!global.counselorStudentChats) {
  global.counselorStudentChats = [];
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    // Get all counselor conversations for this student
    const studentChats = (global.counselorStudentChats || []).filter(
      (chat: any) => chat.student_anon_id === user.anon_id
    );

    // Format conversations for display
    const conversations = studentChats.map((chat: any) => ({
      id: chat.id,
      counselor_id: chat.counselor_id,
      title: `Counselor Support Session`,
      created_at: chat.created_at,
      last_message: chat.last_message,
      last_activity: chat.last_activity,
      unread_count: chat.messages?.filter((m: any) => 
        m.sender === 'counselor' && !m.read_by_student
      ).length || 0,
      status: chat.status
    }));

    return NextResponse.json({
      conversations: conversations.sort((a, b) => 
        new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      )
    });

  } catch (error) {
    console.error('Get counselor chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}