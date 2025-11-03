import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMessages } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { caseId } = params;

  // Find case in global store or mock data
  const allCases = [...(global.activeCases || []), 
    {
      id: 'CASE-169790',
      alert_id: 'ALERT-169782',
      anon_id: 'ANON-1001',
      department: 'CSE',
      title: 'ANON-1001 — exam stress',
      assigned_to: 'CN-2001',
      status: 'in-progress',
      priority: 'high',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      conversation_id: 'conv_1760211164679_tv2zqgf55',
      tags: ['exam_stress', 'anxiety'],
      stress_score: 85,
      consent: true,
      crisis_flag: false,
      summary: 'Student overwhelmed with upcoming exams and project deadlines',
      student_last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      counselor_last_seen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      message_count: 8,
      unread_count: 2
    }
  ];

  const case_ = allCases.find(c => c.id === caseId);
  if (!case_) {
    return NextResponse.json(
      { error: 'Case not found' },
      { status: 404 }
    );
  }

  // Get conversation messages if available
  let messages: any[] = [];
  try {
    if (case_.conversation_id) {
      messages = await getMessages(case_.conversation_id);
    }
  } catch (error) {
    console.log('Could not fetch messages for case:', error);
  }

  // If no messages from conversation but case has original_messages from alert, use those
  if (messages.length === 0 && case_.original_messages) {
    messages = case_.original_messages.map((msg: any) => ({
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: case_.conversation_id,
      sender: msg.type === 'student' ? case_.anon_id : 'assistant',
      content: msg.message,
      timestamp: msg.timestamp,
      type: msg.type,
      metadata: {
        stress_score: case_.stress_score,
        consent: case_.consent
      }
    }));
  }

  // Get case notes
  const caseNotes = (global.caseNotes || []).filter(note => note.case_id === caseId);

  // Get audit log
  const auditLog = (global.caseAuditLog || []).filter(entry => entry.case_id === caseId);

  return NextResponse.json({
    case: case_,
    messages: messages || [],
    notes: caseNotes,
    audit_log: auditLog
  });
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
  const { action, content, reminder_date, status } = body;

  const allCases = [...(global.activeCases || [])];
  const caseIndex = allCases.findIndex(c => c.id === caseId);
  
  if (caseIndex === -1) {
    return NextResponse.json(
      { error: 'Case not found' },
      { status: 404 }
    );
  }

  const case_ = allCases[caseIndex];

  switch (action) {
    case 'add_note':
      const noteId = `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const note = {
        id: noteId,
        case_id: caseId,
        counselor_id: user.anon_id,
        content,
        timestamp: new Date().toISOString(),
        type: 'note'
      };
      
      if (!global.caseNotes) global.caseNotes = [];
      global.caseNotes.push(note);
      
      // Add audit log
      if (!global.caseAuditLog) global.caseAuditLog = [];
      global.caseAuditLog.push({
        id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        case_id: caseId,
        action: 'note_added',
        actor: user.anon_id,
        timestamp: new Date().toISOString(),
        details: `Added case note: ${content.substring(0, 50)}...`
      });
      
      case_.last_activity = new Date().toISOString();
      break;

    case 'set_reminder':
      const reminderId = `reminder_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const reminder = {
        id: reminderId,
        case_id: caseId,
        counselor_id: user.anon_id,
        content,
        reminder_date,
        timestamp: new Date().toISOString(),
        type: 'reminder',
        status: 'pending'
      };
      
      if (!global.caseNotes) global.caseNotes = [];
      global.caseNotes.push(reminder);
      
      // Add audit log
      if (!global.caseAuditLog) global.caseAuditLog = [];
      global.caseAuditLog.push({
        id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        case_id: caseId,
        action: 'reminder_set',
        actor: user.anon_id,
        timestamp: new Date().toISOString(),
        details: `Set reminder for ${reminder_date}: ${content}`
      });
      
      case_.last_activity = new Date().toISOString();
      break;

    case 'update_status':
      const oldStatus = case_.status;
      case_.status = status;
      case_.last_activity = new Date().toISOString();
      
      // Add audit log
      if (!global.caseAuditLog) global.caseAuditLog = [];
      global.caseAuditLog.push({
        id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        case_id: caseId,
        action: 'status_updated',
        actor: user.anon_id,
        timestamp: new Date().toISOString(),
        details: `Status changed from ${oldStatus} to ${status}`
      });
      break;

    case 'resolve':
      case_.status = 'resolved';
      case_.resolved_at = new Date().toISOString();
      case_.resolved_by = user.anon_id;
      case_.last_activity = new Date().toISOString();
      
      // Add audit log
      if (!global.caseAuditLog) global.caseAuditLog = [];
      global.caseAuditLog.push({
        id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        case_id: caseId,
        action: 'case_resolved',
        actor: user.anon_id,
        timestamp: new Date().toISOString(),
        details: content || 'Case resolved'
      });
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }

  return NextResponse.json({
    success: true,
    message: `Case ${action.replace('_', ' ')} successfully`,
    case: case_
  });
}