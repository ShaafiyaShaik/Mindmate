import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Import real-time alerts from the global store
async function getRealTimeAlerts() {
  try {
    return (global as any).realTimeAlerts || [];
  } catch (error) {
    console.error('Error fetching real-time alerts:', error);
    return [];
  }
}

// Import case creation function
async function createCaseFromAlert(alert: any, counselorId: string) {
  const caseId = `CASE-${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  const newCase = {
    id: caseId,
    alert_id: alert.id,
    anon_id: alert.anon_id,
    department: alert.department,
    title: `${alert.anon_id} — ${alert.tags?.[0] || 'support needed'}`,
    assigned_to: counselorId,
    status: 'open',
    priority: alert.severity,
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    conversation_id: alert.conversation_id,
    tags: alert.tags || [],
    stress_score: alert.stress_score,
    consent: alert.consent,
    crisis_flag: alert.severity === 'crisis',
    summary: alert.summary,
    student_last_seen: null,
    counselor_last_seen: new Date().toISOString(),
    message_count: alert.timeline ? alert.timeline.filter((t: any) => t.type === 'student').length : 0,
    unread_count: 0,
    original_messages: alert.timeline || [] // Store original alert timeline
  };
  
  // Add to global cases store
  if (!global.activeCases) global.activeCases = [];
  (global as any).activeCases.unshift(newCase);
  
  // Add audit log entry
  if (!global.caseAuditLog) global.caseAuditLog = [];
  (global as any).caseAuditLog.push({
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    case_id: caseId,
    action: 'case_created',
    actor: counselorId,
    timestamp: new Date().toISOString(),
    details: `Case created from alert ${alert.id}`
  });
  
  return newCase;
}

// Mock alerts data - must match the main alerts route
const mockAlerts = [
  {
    id: 'ALERT-169782',
    anon_id: 'ANON-1001',
    department: 'CSE',
    stress_score: 85,
    tags: ['exam_stress', 'anxiety'],
    snippet: 'Student expressed feeling overwhelmed with upcoming exams and project deadlines...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    consent: true,
    confidence: 0.92,
    status: 'open',
    severity: 'high',
    assigned_to: null,
    summary: 'Stress score increased from 42 → 85 over 3 days.',
    suggested_action: 'Gentle call / Offer walk-in appointment',
    conversation_id: 'conv_1760207798529_764',
    timeline: [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        message: 'I have so many assignments due this week...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        message: 'I understand you\'re feeling overwhelmed. Would you like to talk about prioritizing your tasks?',
        type: 'assistant'
      },
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        message: 'I don\'t think I can handle all this pressure...',
        type: 'student'
      }
    ]
  },
  {
    id: 'ALERT-169783',
    anon_id: 'ANON-1002',
    department: 'ECE',
    stress_score: 95,
    tags: ['crisis', 'suicidal_ideation'],
    snippet: 'Student mentioned feeling hopeless and having thoughts of self-harm...',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    consent: true,
    confidence: 0.97,
    status: 'open',
    severity: 'crisis',
    assigned_to: null,
    summary: 'Critical alert: Student expressing suicidal ideation.',
    suggested_action: 'IMMEDIATE INTERVENTION REQUIRED',
    conversation_id: 'conv_1760207963202_192',
    timeline: [
      {
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        message: 'Everything feels so overwhelming...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        message: 'I understand you\'re going through a difficult time. Can you tell me more about what\'s making you feel this way?',
        type: 'assistant'
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        message: 'I don\'t see any point in continuing... maybe it would be better if I wasn\'t here...',
        type: 'student'
      }
    ]
  },
  {
    id: 'ALERT-169784',
    anon_id: 'ANON-1003',
    department: 'ME',
    stress_score: 70,
    tags: ['academic_stress', 'sleep_deprivation'],
    snippet: 'Student reporting difficulty sleeping and concentration issues affecting academic performance...',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    consent: true,
    confidence: 0.85,
    status: 'open',
    severity: 'medium',
    assigned_to: null,
    summary: 'Academic stress impacting sleep and concentration.',
    suggested_action: 'Schedule check-in / Offer stress management resources',
    conversation_id: 'conv_1760208396507_15',
    timeline: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        message: 'I can\'t seem to focus on my studies anymore...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        message: 'That sounds really frustrating. How has your sleep been lately?',
        type: 'assistant'
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        message: 'I barely sleep 3-4 hours a night. My mind just won\'t stop racing...',
        type: 'student'
      }
    ]
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { alertId } = params;
  
  // Check mock alerts first
  let alert = mockAlerts.find(a => a.id === alertId);
  
  // If not found in mock alerts, check real-time alerts
  if (!alert && global.realTimeAlerts) {
    alert = (global as any).realTimeAlerts.find((a: any) => a.id === alertId);
  }

  if (!alert) {
    return NextResponse.json(
      { error: 'Alert not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(alert);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { alertId } = params;
  const body = await request.json();
  const { action, counselor_id, note } = body;

  console.log(`[ALERT ASSIGNMENT] Looking for alert: ${alertId}`);
  console.log(`[ALERT ASSIGNMENT] Action: ${action}, Counselor: ${counselor_id}`);

  // Find the alert in mock alerts first
  let alertIndex = mockAlerts.findIndex(a => a.id === alertId);
  let alert = alertIndex !== -1 ? mockAlerts[alertIndex] : null;
  let isRealTimeAlert = false;

  console.log(`[ALERT ASSIGNMENT] Found in mock alerts: ${!!alert}`);

  // If not found in mock alerts, check real-time alerts
  if (!alert && global.realTimeAlerts) {
    const realTimeIndex = (global as any).realTimeAlerts.findIndex((a: any) => a.id === alertId);
    if (realTimeIndex !== -1) {
      alert = (global as any).realTimeAlerts[realTimeIndex];
      isRealTimeAlert = true;
    }
    console.log(`[ALERT ASSIGNMENT] Found in real-time alerts: ${!!alert}`);
  }

  if (!alert) {
    console.log(`[ALERT ASSIGNMENT] Alert not found: ${alertId}`);
    console.log(`[ALERT ASSIGNMENT] Available mock alerts:`, mockAlerts.map(a => a.id));
    console.log(`[ALERT ASSIGNMENT] Available real-time alerts:`, global.realTimeAlerts ? (global as any).realTimeAlerts.map((a: any) => a.id) : 'None');
    return NextResponse.json(
      { error: 'Alert not found' },
      { status: 404 }
    );
  }

  switch (action) {
    case 'assign':
      alert.assigned_to = counselor_id;
      
      // Create a case when alert is assigned
      try {
        const newCase = await createCaseFromAlert(alert, counselor_id);
        console.log('[ALERT ASSIGNMENT] Case created:', newCase.id, 'for alert:', alertId);
      } catch (error) {
        console.error('[ALERT ASSIGNMENT] Failed to create case from alert:', error);
      }
      break;
    case 'mark-reviewed':
      alert.status = 'reviewed';
      break;
    case 'archive':
      alert.status = 'archived';
      break;
    case 'resolve':
      alert.status = 'resolved';
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }

  // In a real app, you'd save this to the database
  // For now, we'll just return the updated alert
  return NextResponse.json({
    success: true,
    alert: alert,
    message: `Alert ${action.replace('-', ' ')} successfully`
  });
}