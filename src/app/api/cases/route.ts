import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMessages, getConversations } from '@/lib/db';
import { createCaseFromAlert } from '@/lib/cases';

// Global cases store (in production, use database)
declare global {
  var activeCases: any[] | undefined;
  var caseNotes: any[] | undefined;
  var caseAuditLog: any[] | undefined;
}

// Initialize global stores
if (!global.activeCases) {
  global.activeCases = [];
}
if (!global.caseNotes) {
  global.caseNotes = [];
}
if (!global.caseAuditLog) {
  global.caseAuditLog = [];
}

// Function to convert alerts to cases when assigned
// createCaseFromAlert moved to src/lib/cases.ts

// Mock cases for demo (in addition to real-time created cases)
const mockCases = [
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
  },
  {
    id: 'CASE-169791',
    alert_id: 'ALERT-169783',
    anon_id: 'ANON-1002',
    department: 'ECE',
    title: 'ANON-1002 — crisis intervention',
    assigned_to: 'CN-2002',
    status: 'open',
    priority: 'crisis',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    conversation_id: 'conv_1760211192546_y59ukmju3',
    tags: ['crisis', 'suicidal_ideation'],
    stress_score: 95,
    consent: true,
    crisis_flag: true,
    summary: 'URGENT: Student expressed suicidal ideation and hopelessness',
    student_last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    counselor_last_seen: null,
    message_count: 3,
    unread_count: 3
  }
];

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ['counselor', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const user = authResult;
  const { searchParams } = new URL(request.url);
  const assigned_to = searchParams.get('assigned_to');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const view = searchParams.get('view') || 'assigned'; // 'assigned' or 'all'

  // Combine mock cases with real-time cases
  let allCases = [...(global.activeCases || []), ...mockCases];

  // Filter cases
  let filteredCases = allCases;

  if (view === 'assigned') {
    // Show only cases assigned to current counselor
    filteredCases = allCases.filter(case_ => case_.assigned_to === user.anon_id);
  }

  if (assigned_to) {
    filteredCases = filteredCases.filter(case_ => case_.assigned_to === assigned_to);
  }

  if (status) {
    filteredCases = filteredCases.filter(case_ => case_.status === status);
  }

  if (priority) {
    filteredCases = filteredCases.filter(case_ => case_.priority === priority);
  }

  // Sort by priority and last activity
  const priorityOrder = { crisis: 4, high: 3, medium: 2, low: 1 };
  filteredCases.sort((a, b) => {
    const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
  });

  // Calculate stats
  const userCases = allCases.filter(case_ => case_.assigned_to === user.anon_id);
  const stats = {
    total: userCases.length,
    open: userCases.filter(c => c.status === 'open').length,
    in_progress: userCases.filter(c => c.status === 'in-progress').length,
    awaiting_response: userCases.filter(c => c.status === 'awaiting-response').length,
    crisis: userCases.filter(c => c.priority === 'crisis').length,
    high: userCases.filter(c => c.priority === 'high').length,
    unread_total: userCases.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  };

  return NextResponse.json({
    cases: filteredCases,
    stats,
    total: filteredCases.length
  });
}