export function createCaseFromAlert(alert: any, counselorId: string) {
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
    message_count: 0,
    unread_count: 0
  };

  // keep global store for demo only
  if (!(global as any).activeCases) (global as any).activeCases = [];
  if (!(global as any).caseAuditLog) (global as any).caseAuditLog = [];

  (global as any).activeCases.unshift(newCase);

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
