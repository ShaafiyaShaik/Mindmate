import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMessages, getConversations } from '@/lib/db';

// Global alert store for real-time updates (in production, use Redis or database)
declare global {
  var realTimeAlerts: any[] | undefined;
}

// Initialize global alerts store
if (!global.realTimeAlerts) {
  global.realTimeAlerts = [];
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['student']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const user = authResult;
  const body = await request.json();
  const { conversation_id, message, stress_level, type = 'student_request', tags = [] } = body;

  try {
    // Verify conversation belongs to user
    const conversations = await getConversations(user.anon_id);
    const conversation = conversations.find((c: any) => c.id === conversation_id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get recent messages for context
    const recentMessages = await getMessages(conversation_id);
    const timeline = (recentMessages || [])
      .slice(-3) // Last 3 messages for context
      .map((msg: any) => ({
        timestamp: new Date(msg.timestamp * 1000).toISOString(),
        message: msg.text.substring(0, 200) + (msg.text.length > 200 ? '...' : ''),
        type: msg.sender
      }));

    // Create alert
    const alertId = `ALERT-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const alert = {
      id: alertId,
      anon_id: user.anon_id,
      department: user.dept || 'Unknown',
      stress_score: stress_level || 75,
      tags: type === 'student_request' ? ['student_request', 'manual_alert', ...tags] : tags,
      snippet: message ? message.substring(0, 200) + (message.length > 200 ? '...' : '') : 
               'Student requested counselor assistance through chat interface.',
      timestamp: new Date().toISOString(),
      consent: true, // Since they're actively requesting help
      confidence: type === 'student_request' ? 1.0 : 0.85,
      status: 'open',
      severity: type === 'student_request' ? 'high' : (stress_level >= 85 ? 'crisis' : 'high'),
      assigned_to: null,
      summary: type === 'student_request' ? 
               'Student actively requested counselor assistance through chat interface.' :
               `Stress indicators detected. Score: ${stress_level || 'N/A'}`,
      suggested_action: type === 'student_request' ? 
                       'PRIORITY: Student requested help - respond within 15 minutes' :
                       'Monitor conversation and consider outreach',
      timeline,
      conversation_id,
      alert_type: type,
      created_by: 'student'
    };

    // Add to real-time alerts store
    global.realTimeAlerts!.unshift(alert);
    
    // Keep only last 100 alerts to prevent memory issues
    if (global.realTimeAlerts!.length > 100) {
      global.realTimeAlerts = global.realTimeAlerts!.slice(0, 100);
    }

    console.log(`🚨 NEW REAL-TIME ALERT: ${alertId} - ${type} from ${user.anon_id}`);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send WebSocket notification to all connected counselors
    // 3. Send email/SMS notifications for crisis cases
    // 4. Log for audit trail

    return NextResponse.json({
      success: true,
      alert_id: alertId,
      message: 'Alert created successfully'
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// Get real-time alerts for counselors
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since'); // For polling updates
  
  let filteredAlerts = global.realTimeAlerts || [];
  
  if (since) {
    const sinceDate = new Date(since);
    filteredAlerts = (global.realTimeAlerts || []).filter(alert => 
      new Date(alert.timestamp) > sinceDate
    );
  }

  return NextResponse.json({
    alerts: filteredAlerts,
    total: filteredAlerts.length,
    timestamp: new Date().toISOString()
  });
}