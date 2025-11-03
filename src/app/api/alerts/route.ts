import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Import real-time alerts from the global store
async function getRealTimeAlerts() {
  try {
    // Access the global alert store
    return (global as any).realTimeAlerts || [];
  } catch (error) {
    console.error('Error fetching real-time alerts:', error);
    return [];
  }
}

// Mock alerts data for now
const mockAlerts = [
  {
    id: 'ALERT-169782',
    anon_id: 'ANON-1001',
    department: 'CSE',
    stress_score: 85,
    tags: ['exam_stress', 'anxiety'],
    snippet: 'Student expressed feeling overwhelmed with upcoming exams and project deadlines...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    consent: true,
    confidence: 0.92,
    status: 'open',
    severity: 'high',
    assigned_to: null,
    summary: 'Stress score increased from 42 → 85 over 3 days.',
    suggested_action: 'Gentle call / Offer walk-in appointment',
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
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    consent: true,
    confidence: 0.97,
    status: 'open',
    severity: 'crisis',
    assigned_to: null,
    summary: 'Critical mental health indicators detected in recent conversations.',
    suggested_action: 'IMMEDIATE INTERVENTION - Contact emergency services',
    timeline: [
      {
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        message: 'I don\'t see the point anymore...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        message: 'Sometimes I think everyone would be better off without me...',
        type: 'student'
      }
    ]
  },
  {
    id: 'ALERT-169784',
    anon_id: 'ANON-1003',
    department: 'ME',
    stress_score: 72,
    tags: ['social_anxiety', 'isolation'],
    snippet: 'Student reports difficulty connecting with peers and feeling lonely...',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    consent: false,
    confidence: 0.84,
    status: 'open',
    severity: 'medium',
    assigned_to: null,
    summary: 'Social isolation patterns detected over past week.',
    suggested_action: 'Offer group activities or peer support resources',
    timeline: [
      {
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        message: 'I don\'t really have friends here...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        message: 'Making friends can be challenging. What activities interest you?',
        type: 'assistant'
      }
    ]
  },
  {
    id: 'ALERT-169785',
    anon_id: 'ANON-1004',
    department: 'IT',
    stress_score: 68,
    tags: ['academic_pressure', 'watchlist'],
    snippet: 'Consistent mentions of academic performance concerns and fear of failure...',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    consent: true,
    confidence: 0.79,
    status: 'open',
    severity: 'watchlist',
    assigned_to: 'CN-2001',
    summary: 'Academic stress trending upward over 5 days.',
    suggested_action: 'Study skills workshop recommendation',
    timeline: [
      {
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        message: 'I\'m worried about my GPA...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        message: 'Let\'s talk about effective study strategies that might help.',
        type: 'assistant'
      }
    ]
  },
  {
    id: 'ALERT-169786',
    anon_id: 'ANON-1005',
    department: 'EEE',
    stress_score: 58,
    tags: ['homesickness', 'adjustment'],
    snippet: 'Student expressing difficulty adjusting to college life and missing home...',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    consent: true,
    confidence: 0.71,
    status: 'open',
    severity: 'low',
    assigned_to: null,
    summary: 'Adjustment issues common for first-year students.',
    suggested_action: 'Orientation resources and peer buddy program',
    timeline: [
      {
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        message: 'I really miss being at home...',
        type: 'student'
      },
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        message: 'Many students feel this way initially. What do you miss most?',
        type: 'assistant'
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'open';
  const dept = searchParams.get('dept');
  const severity = searchParams.get('severity');
  const consent = searchParams.get('consent');
  const age = searchParams.get('age'); // 0-7d, 7-30d, etc.

  // Get real-time alerts
  const realTimeAlerts = await getRealTimeAlerts();
  
  // Combine mock alerts with real-time alerts
  let allAlerts = [...realTimeAlerts, ...mockAlerts];
  
  let filteredAlerts = allAlerts.filter(alert => alert.status === status);

  if (dept && dept !== 'All') {
    filteredAlerts = filteredAlerts.filter(alert => alert.department === dept);
  }

  if (severity) {
    filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
  }

  if (consent) {
    const consentBool = consent === 'ON';
    filteredAlerts = filteredAlerts.filter(alert => alert.consent === consentBool);
  }

  if (age) {
    const now = new Date();
    const cutoff = age === '0-7d' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - cutoff * 24 * 60 * 60 * 1000);
    filteredAlerts = filteredAlerts.filter(alert => new Date(alert.timestamp) > cutoffDate);
  }

  // Sort by severity and timestamp
  const severityOrder = { crisis: 4, high: 3, medium: 2, watchlist: 1, low: 0 };
  filteredAlerts.sort((a, b) => {
    const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                        (severityOrder[a.severity as keyof typeof severityOrder] || 0);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Calculate stats from all alerts
  const openAlerts = allAlerts.filter(a => a.status === 'open');
  
  return NextResponse.json({
    alerts: filteredAlerts,
    total: filteredAlerts.length,
    stats: {
      crisis: openAlerts.filter(a => a.severity === 'crisis').length,
      high: openAlerts.filter(a => a.severity === 'high').length,
      medium: openAlerts.filter(a => a.severity === 'medium').length,
      watchlist: openAlerts.filter(a => a.severity === 'watchlist').length,
      low: openAlerts.filter(a => a.severity === 'low').length,
    }
  });
}