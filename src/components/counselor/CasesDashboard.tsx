'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Case {
  id: string;
  alert_id: string;
  anon_id: string;
  department: string;
  title: string;
  assigned_to: string;
  status: 'open' | 'in-progress' | 'awaiting-response' | 'resolved';
  priority: 'crisis' | 'high' | 'medium' | 'low';
  created_at: string;
  last_activity: string;
  conversation_id: string;
  tags: string[];
  stress_score: number;
  consent: boolean;
  crisis_flag: boolean;
  summary: string;
  student_last_seen: string | null;
  counselor_last_seen: string | null;
  message_count: number;
  unread_count: number;
}

interface CaseStats {
  total: number;
  open: number;
  in_progress: number;
  awaiting_response: number;
  crisis: number;
  high: number;
  unread_total: number;
}

interface CaseDetail {
  case: Case;
  messages: any[];
  notes: any[];
  audit_log: any[];
}

export default function CasesDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CaseStats>({ 
    total: 0, open: 0, in_progress: 0, awaiting_response: 0, crisis: 0, high: 0, unread_total: 0 
  });
  const [activeTab, setActiveTab] = useState<'assigned' | 'all'>('assigned');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    activity: ''
  });
  const [newNote, setNewNote] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    fetchCases();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchCases, 10000);
    return () => clearInterval(interval);
  }, [activeTab, filters]);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      params.append('view', activeTab);
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await fetch(`/api/cases?${params.toString()}`);
      const data = await response.json();
      
      setCases(data.cases || []);
      setStats(data.stats || { total: 0, open: 0, in_progress: 0, awaiting_response: 0, crisis: 0, high: 0, unread_total: 0 });
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseDetail = async (caseId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCase(data);
      }
    } catch (error) {
      console.error('Error fetching case detail:', error);
    }
  };

  const handleCaseAction = async (caseId: string, action: string, data: any = {}) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data
        }),
      });

      if (response.ok) {
        fetchCases(); // Refresh cases
        if (selectedCase?.case.id === caseId) {
          fetchCaseDetail(caseId); // Refresh case detail
        }
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedCase || !newMessage.trim()) return;

    // Show confirmation dialog
    const confirmed = confirm(
      `This message will be delivered anonymously to ${selectedCase.case.anon_id}. Are you sure?`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cases/${selectedCase.case.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          anonymous: true
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setShowMessageModal(false);
        fetchCaseDetail(selectedCase.case.id);
        fetchCases();
        alert('Message sent successfully to student!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !newNote.trim()) return;

    await handleCaseAction(selectedCase.case.id, 'add_note', { content: newNote });
    setNewNote('');
    setShowNoteModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crisis': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'awaiting-response': return 'bg-amber-100 text-amber-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-lavender-50">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-md border-b border-sage-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-warm-gray-800">Active Cases</h1>
                <p className="text-warm-gray-600">Workbench for your assigned alerts and cases</p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex space-x-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-blue-700">{stats.total}</div>
                  <div className="text-xs text-blue-600">Total Cases</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-red-700">{stats.crisis}</div>
                  <div className="text-xs text-red-600">Crisis</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-orange-700">{stats.unread_total}</div>
                  <div className="text-xs text-orange-600">Unread</div>
                </div>
              </div>
            </div>

            {/* Tabs and Filters */}
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex bg-sage-50 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'assigned' 
                      ? 'bg-white text-soft-blue-700 shadow-sm' 
                      : 'text-warm-gray-600 hover:text-warm-gray-800'
                  }`}
                >
                  Assigned to Me ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'all' 
                      ? 'bg-white text-soft-blue-700 shadow-sm' 
                      : 'text-warm-gray-600 hover:text-warm-gray-800'
                  }`}
                >
                  All Active
                </button>
              </div>
              
              {/* Filters */}
              <div className="flex space-x-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="awaiting-response">Awaiting Response</option>
                </select>
                
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500 text-sm"
                >
                  <option value="">All Priority</option>
                  <option value="crisis">Crisis</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Cases List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-warm-gray-500">Loading cases...</div>
                </div>
              ) : cases.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-warm-gray-400 text-lg mb-2">No cases found</div>
                    <div className="text-warm-gray-500 text-sm">
                      {activeTab === 'assigned' ? 'No cases assigned to you yet' : 'No active cases'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((case_) => (
                    <div
                      key={case_.id}
                      onClick={() => fetchCaseDetail(case_.id)}
                      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-medium ${
                        selectedCase?.case.id === case_.id ? 'ring-2 ring-soft-blue-500 border-soft-blue-200' : 'border-sage-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm text-soft-blue-600 font-medium">
                              {case_.id}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(case_.priority)}`}>
                              {case_.priority.toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                              {case_.status.replace('-', ' ')}
                            </span>
                            {case_.unread_count > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {case_.unread_count} new
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-medium text-warm-gray-900 mb-1">{case_.title}</h3>
                          <p className="text-warm-gray-600 text-sm mb-2 line-clamp-2">
                            {case_.summary}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-warm-gray-500">
                            <span>Created: {formatTimestamp(case_.created_at)}</span>
                            <span>Last activity: {formatTimestamp(case_.last_activity)}</span>
                            <span>Messages: {case_.message_count}</span>
                            <span>Stress: {case_.stress_score}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {case_.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-lavender-100 text-lavender-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/counselor/chat?caseId=${case_.id}`, '_blank');
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            title="Open real-time chat"
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchCaseDetail(case_.id);
                              setShowMessageModal(true);
                            }}
                            className="px-3 py-1 text-xs bg-soft-blue-100 text-soft-blue-700 rounded-md hover:bg-soft-blue-200 transition-colors"
                            title="Send anonymous message"
                          >
                            � Message
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchCaseDetail(case_.id);
                              setShowNoteModal(true);
                            }}
                            className="px-3 py-1 text-xs bg-sage-100 text-sage-700 rounded-md hover:bg-sage-200 transition-colors"
                            title="Add private note"
                          >
                            📝 Note
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCaseAction(case_.id, 'update_status', { status: 'in-progress' });
                            }}
                            className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
                            title="Mark in progress"
                          >
                            ⏳ Progress
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Case Detail Panel */}
            {selectedCase && (
              <div className="w-96 bg-white border-l border-sage-200 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-warm-gray-800">Case Details</h3>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="text-warm-gray-400 hover:text-warm-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Case Info */}
                  <div className="bg-sage-50 rounded-lg p-4">
                    <h4 className="font-medium text-warm-gray-800 mb-2">{selectedCase.case.title}</h4>
                    <div className="text-sm text-warm-gray-600 space-y-1">
                      <p><strong>Student:</strong> {selectedCase.case.anon_id}</p>
                      <p><strong>Department:</strong> {selectedCase.case.department}</p>
                      <p><strong>Stress Level:</strong> {selectedCase.case.stress_score}/100</p>
                      <p><strong>Consent:</strong> {selectedCase.case.consent ? 'YES' : 'NO'}</p>
                      <p><strong>Messages:</strong> {selectedCase.case.message_count}</p>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-lavender-50 rounded-lg p-4">
                    <h4 className="font-medium text-warm-gray-800 mb-2">Summary</h4>
                    <p className="text-sm text-warm-gray-700">{selectedCase.case.summary}</p>
                  </div>
                  
                  {/* Student Messages */}
                  {selectedCase.messages && selectedCase.messages.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-warm-gray-800 mb-3">Student Messages</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedCase.messages
                          .filter(msg => msg.type === 'student')
                          .map((message, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="text-xs text-warm-gray-500 mb-2">
                              {formatTimestamp(message.timestamp)}
                            </div>
                            <div className="text-sm text-warm-gray-700">
                              "{message.content || message.message}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Case Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-warm-gray-800">Private Notes</h4>
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="text-xs text-soft-blue-600 hover:text-soft-blue-700"
                      >
                        + Add Note
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedCase.notes.filter(n => n.type === 'note').map((note) => (
                        <div key={note.id} className="bg-white border border-sage-200 rounded-lg p-3">
                          <div className="text-xs text-warm-gray-500 mb-1">
                            {formatTimestamp(note.timestamp)} by {note.counselor_id}
                          </div>
                          <div className="text-sm text-warm-gray-700">{note.content}</div>
                        </div>
                      ))}
                      {selectedCase.notes.filter(n => n.type === 'note').length === 0 && (
                        <div className="text-sm text-warm-gray-500 italic">No notes yet</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-sage-200">
                    <button
                      onClick={() => window.open(`/counselor/chat?caseId=${selectedCase.case.id}`, '_blank')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      💬 Open Real-Time Chat
                    </button>
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="w-full px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors"
                    >
                      Send Anonymous Message
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700 transition-colors"
                    >
                      Offer Appointment
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Refer to Specialist
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to resolve this case?')) {
                          handleCaseAction(selectedCase.case.id, 'resolve', { content: 'Case resolved by counselor' });
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Resolve Case
                    </button>
                  </div>
                  
                  {/* Audit Log */}
                  <div>
                    <h4 className="font-medium text-warm-gray-800 mb-2">Audit Log</h4>
                    <div className="space-y-1">
                      {selectedCase.audit_log.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="text-xs text-warm-gray-500">
                          <span className="font-medium">{entry.action.replace('_', ' ')}</span> at{' '}
                          {formatTimestamp(entry.timestamp)} by {entry.actor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Anonymous Message</h3>
            <p className="text-sm text-warm-gray-600 mb-4">
              This message will be delivered anonymously to <strong>{selectedCase.case.anon_id}</strong>
            </p>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="flex-1 px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Send Message
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setNewMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Private Note</h3>
            <p className="text-sm text-warm-gray-600 mb-4">
              This note will only be visible to counselors working on this case.
            </p>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add your note here..."
              className="w-full p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:bg-gray-300 transition-colors"
              >
                Add Note
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNewNote('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}