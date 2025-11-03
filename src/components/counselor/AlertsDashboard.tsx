'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Alert {
  id: string;
  anon_id: string;
  department: string;
  stress_score: number;
  tags: string[];
  snippet: string;
  timestamp: string;
  consent: boolean;
  confidence: number;
  status: string;
  severity: 'crisis' | 'high' | 'medium' | 'watchlist' | 'low';
  assigned_to: string | null;
  summary: string;
  suggested_action: string;
  timeline: Array<{
    timestamp: string;
    message: string;
    type: 'student' | 'assistant' | 'counselor';
  }>;
}

interface AlertStats {
  crisis: number;
  high: number;
  medium: number;
  watchlist: number;
  low: number;
}

export default function AlertsDashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AlertStats>({ crisis: 0, high: 0, medium: 0, watchlist: 0, low: 0 });
  const [filters, setFilters] = useState({
    dept: 'All',
    severity: '',
    consent: '',
    age: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [lastFetch, setLastFetch] = useState(new Date());

  useEffect(() => {
    fetchAlerts();
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Set up real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchAlerts(true); // Pass true to indicate this is a background fetch
    }, 5000);

    return () => clearInterval(interval);
  }, [filters]);

  const fetchAlerts = async (showNewAlertIndicator = false) => {
    try {
      if (!showNewAlertIndicator) {
        setLoading(true);
      }
      
      const params = new URLSearchParams();
      params.append('status', 'open');
      
      if (filters.dept !== 'All') params.append('dept', filters.dept);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.consent) params.append('consent', filters.consent);
      if (filters.age) params.append('age', filters.age);

      const response = await fetch(`/api/alerts?${params.toString()}`);
      const data = await response.json();
      
      const newAlerts = data.alerts || [];
      
      // Check for new alerts since last fetch
      if (showNewAlertIndicator && alerts.length > 0) {
        const newAlertsCount = newAlerts.filter((alert: Alert) => 
          new Date(alert.timestamp) > lastFetch
        ).length;
        
        if (newAlertsCount > 0) {
          setNewAlertCount(prev => prev + newAlertsCount);
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('🚨 New Student Alert', {
              body: `${newAlertsCount} new alert(s) received`,
              icon: '/favicon.ico'
            });
          }
        }
      }
      
      setAlerts(newAlerts);
      setStats(data.stats || { crisis: 0, high: 0, medium: 0, watchlist: 0, low: 0 });
      setLastFetch(new Date());
      
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      if (!showNewAlertIndicator) {
        setLoading(false);
      }
    }
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          counselor_id: user?.anon_id,
        }),
      });

      if (response.ok) {
        fetchAlerts(); // Refresh the list
        if (selectedAlert?.id === alertId) {
          setSelectedAlert(null); // Close detail panel if this alert was selected
        }
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  // Clear new alert count when user interacts with the dashboard
  const clearNewAlertCount = () => {
    setNewAlertCount(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'crisis': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'watchlist': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredAlerts = alerts.filter(alert => {
    if (!searchQuery) return true;
    return (
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.anon_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-lavender-50">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-md border-b border-sage-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-warm-gray-800 flex items-center">
                    Alerts
                    {newAlertCount > 0 && (
                      <button
                        onClick={clearNewAlertCount}
                        className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse hover:bg-red-600 transition-colors"
                        title="Click to clear notification"
                      >
                        {newAlertCount} new
                      </button>
                    )}
                  </h1>
                  <p className="text-warm-gray-600">Triage queue for student wellness alerts</p>
                </div>
                
                {/* Real-time indicator */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live updates</span>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="flex space-x-4">
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-red-700">{stats.crisis}</div>
                  <div className="text-xs text-red-600">Crisis</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-orange-700">{stats.high}</div>
                  <div className="text-xs text-orange-600">High</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-yellow-700">{stats.medium}</div>
                  <div className="text-xs text-yellow-600">Medium</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-blue-700">{stats.watchlist}</div>
                  <div className="text-xs text-blue-600">Watch</div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by Alert ID, Anon ID, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.dept}
                onChange={(e) => setFilters(prev => ({ ...prev, dept: e.target.value }))}
                className="px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500"
              >
                <option value="All">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="IT">IT</option>
                <option value="EEE">EEE</option>
              </select>
              
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500"
              >
                <option value="">All Severities</option>
                <option value="crisis">Crisis</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="watchlist">Watchlist</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={filters.consent}
                onChange={(e) => setFilters(prev => ({ ...prev, consent: e.target.value }))}
                className="px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500"
              >
                <option value="">All Consent</option>
                <option value="ON">Consent ON</option>
                <option value="OFF">Consent OFF</option>
              </select>
              
              <select
                value={filters.age}
                onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))}
                className="px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-soft-blue-500"
              >
                <option value="">All Time</option>
                <option value="0-7d">Last 7 days</option>
                <option value="7-30d">7-30 days</option>
              </select>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-warm-gray-500">Loading alerts...</div>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-warm-gray-400 text-lg mb-2">No alerts found</div>
                    <div className="text-warm-gray-500 text-sm">Try adjusting your filters</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-medium ${
                        selectedAlert?.id === alert.id ? 'ring-2 ring-soft-blue-500 border-soft-blue-200' : 'border-sage-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm text-soft-blue-600 font-medium">
                              {alert.id}
                            </span>
                            <span className="font-mono text-sm text-warm-gray-600">
                              {alert.anon_id}
                            </span>
                            <span className="text-sm text-warm-gray-500">
                              {alert.department}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            {!alert.consent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                Consent OFF
                              </span>
                            )}
                          </div>
                          
                          <p className="text-warm-gray-700 text-sm mb-2 line-clamp-2">
                            {alert.snippet}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-warm-gray-500">
                            <span>{formatTimestamp(alert.timestamp)}</span>
                            <span>Stress: {alert.stress_score}</span>
                            <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                            {alert.assigned_to && (
                              <span className="text-soft-blue-600">Assigned to {alert.assigned_to}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {alert.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-lavender-100 text-lavender-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert.id, 'assign');
                            }}
                            className="px-3 py-1 text-xs bg-soft-blue-100 text-soft-blue-700 rounded-md hover:bg-soft-blue-200 transition-colors"
                          >
                            Assign to Me
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert.id, 'mark-reviewed');
                            }}
                            className="px-3 py-1 text-xs bg-sage-100 text-sage-700 rounded-md hover:bg-sage-200 transition-colors"
                          >
                            Mark Reviewed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alert Detail Panel */}
            {selectedAlert && (
              <div className="w-96 bg-white border-l border-sage-200 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-warm-gray-800">Alert Details</h3>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-warm-gray-400 hover:text-warm-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-sage-50 rounded-lg p-4">
                    <div className="text-sm text-warm-gray-600 mb-1">AI Summary</div>
                    <div className="text-warm-gray-800">{selectedAlert.summary}</div>
                  </div>
                  
                  <div className="bg-lavender-50 rounded-lg p-4">
                    <div className="text-sm text-warm-gray-600 mb-1">Suggested Action</div>
                    <div className="text-warm-gray-800">{selectedAlert.suggested_action}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-warm-gray-600 mb-2">Recent Timeline</div>
                    <div className="space-y-2">
                      {selectedAlert.timeline.map((entry, index) => (
                        <div key={index} className="bg-white border border-sage-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-2 py-1 rounded-md ${
                              entry.type === 'student' ? 'bg-blue-100 text-blue-800' :
                              entry.type === 'assistant' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {entry.type}
                            </span>
                            <span className="text-xs text-warm-gray-500">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-warm-gray-700">{entry.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-sage-200">
                    <button
                      onClick={() => handleAlertAction(selectedAlert.id, 'assign')}
                      className="w-full px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors"
                    >
                      Assign to Me
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700 transition-colors"
                    >
                      Send Anonymous Message
                    </button>
                    <button
                      onClick={() => handleAlertAction(selectedAlert.id, 'mark-reviewed')}
                      className="w-full px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Refer to Specialist
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAlertAction(selectedAlert.id, 'resolve')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAlertAction(selectedAlert.id, 'archive')}
                        className="flex-1 px-4 py-2 bg-warm-gray-600 text-white rounded-lg hover:bg-warm-gray-700 transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}