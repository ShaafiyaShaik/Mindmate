'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { NotificationManager } from '@/components/Notifications';
import EmotionChart from '@/components/analytics/EmotionChart';
import TrendChart from '@/components/analytics/TrendChart';
import KPIRow from '@/components/analytics/KPIRow';
import TimeRangeSelector from '@/components/analytics/TimeRangeSelector';

interface AnalyticsData {
  total_conversations: number;
  active_students: number;
  avg_stress_score: number;
  crisis_alerts: number;
  emotion_distribution: {
    [key: string]: number;
  };
  stress_trends: Array<{
    date: string;
    avg_stress: number;
    conversation_count: number;
  }>;
  department_breakdown: {
    [key: string]: {
      students: number;
      avg_stress: number;
    };
  };
}

interface StudentAnalyticsData {
  total_conversations: number;
  avg_stress_score: number;
  recent_mood_trend: string;
  emotion_distribution: {
    [key: string]: number;
  };
  stress_trends: Array<{
    date: string;
    avg_stress: number;
    conversation_count: number;
  }>;
  conversation_summary: {
    total_messages: number;
    avg_messages_per_conversation: number;
    most_active_day: string;
  };
  recommendations: string[];
}

export default function InsightsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  // Use real-time analytics hook for students
  const {
    analyticsData: studentAnalyticsData,
    loading: loadingData,
    lastUpdate,
    refreshAnalytics,
  } = useRealTimeAnalytics(timeRange);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  // Fetch counselor/admin analytics separately
  useEffect(() => {
    if (user && user.role !== 'student') {
      fetchCounselorAnalytics();
    }
  }, [user, timeRange]);

  const fetchCounselorAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/overview?range=${timeRange}d`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Wellness Insights</h1>
            <p className="text-gray-600 mt-2">Understanding student mental health patterns and trends</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NotificationManager>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'student' ? 'Your Wellness Insights' : 'Student Wellness Insights'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'student' 
                  ? 'Understanding your personal mental health patterns and progress'
                  : 'Understanding student mental health patterns and trends'
                }
              </p>
              {user?.role === 'student' && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Real-time insights from your conversations
                  {lastUpdate && (
                    <span className="ml-2">
                      • Last updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                  )}
                  <button 
                    onClick={refreshAnalytics}
                    className="ml-4 text-blue-600 hover:text-blue-800 underline"
                    disabled={loadingData}
                  >
                    {loadingData ? 'Refreshing...' : 'Refresh now'}
                  </button>
                </div>
              )}
            </div>
            <TimeRangeSelector 
              value={timeRange} 
              onChange={setTimeRange}
            />
          </div>
        </div>

        {/* Student View */}
        {user?.role === 'student' && studentAnalyticsData && (
          <>
            {/* Real-time update indicator */}
            {loadingData && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 text-sm">Updating insights with latest conversation data...</span>
              </div>
            )}
            {/* Student KPIs */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                      <p className="text-2xl font-bold text-gray-900">{studentAnalyticsData.total_conversations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Stress Level</p>
                      <p className="text-2xl font-bold text-gray-900">{studentAnalyticsData.avg_stress_score.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${
                      studentAnalyticsData.recent_mood_trend === 'improving' ? 'bg-green-100' : 
                      studentAnalyticsData.recent_mood_trend === 'declining' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        studentAnalyticsData.recent_mood_trend === 'improving' ? 'text-green-600' : 
                        studentAnalyticsData.recent_mood_trend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Recent Trend</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{studentAnalyticsData.recent_mood_trend}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{studentAnalyticsData.conversation_summary.total_messages}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Emotion Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Emotion Patterns</h3>
                {Object.keys(studentAnalyticsData.emotion_distribution).length > 0 ? (
                  <EmotionChart 
                    data={Object.entries(studentAnalyticsData.emotion_distribution).map(([emotion, count]) => ({
                      emotion,
                      count: count as number
                    }))} 
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No emotion data available yet. Keep chatting with MindMate to build your insights!
                  </div>
                )}
              </div>

              {/* Stress Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stress Level Trends</h3>
                {studentAnalyticsData.stress_trends && studentAnalyticsData.stress_trends.length > 0 ? (
                  <TrendChart 
                    data={studentAnalyticsData.stress_trends.map(item => ({
                      date: item.date,
                      stress: item.avg_stress,
                      sentiment: null,
                      checkIns: item.conversation_count
                    }))}
                    timeRange={timeRange}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No trend data available yet. Continue your wellness journey with MindMate!
                  </div>
                )}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{studentAnalyticsData.conversation_summary.avg_messages_per_conversation.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Average messages per conversation</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{studentAnalyticsData.conversation_summary.most_active_day}</p>
                  <p className="text-sm text-gray-600">Most active day</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{timeRange}d</p>
                  <p className="text-sm text-gray-600">Analysis period</p>
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
              <div className="space-y-3">
                {studentAnalyticsData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 text-blue-700">
                    <span className="text-blue-500 mt-1">💡</span>
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Counselor/Admin View */}
        {user?.role !== 'student' && analyticsData && (
          <>
            {/* KPIs */}
            <div className="mb-8">
              <KPIRow 
                data={{
                  avgStress: analyticsData.avg_stress_score,
                  totalCheckIns: analyticsData.total_conversations,
                  improvementPercent: 0, // Could calculate based on previous period
                  range: parseInt(timeRange)
                }}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Emotion Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Distribution</h3>
                {analyticsData?.emotion_distribution ? (
                  <EmotionChart 
                    data={Object.entries(analyticsData.emotion_distribution).map(([emotion, count]) => ({
                      emotion,
                      count: count as number
                    }))} 
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No emotion data available
                  </div>
                )}
              </div>

              {/* Stress Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Level Trends</h3>
                {analyticsData?.stress_trends ? (
                  <TrendChart 
                    data={analyticsData.stress_trends.map(item => ({
                      date: item.date,
                      stress: item.avg_stress,
                      sentiment: null, // Not available in current data
                      checkIns: item.conversation_count
                    }))}
                    timeRange={timeRange}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No trend data available
                  </div>
                )}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
              {analyticsData?.department_breakdown ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Active Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Stress Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(analyticsData.department_breakdown).map(([dept, data]) => (
                        <tr key={dept}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dept}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.students}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.avg_stress.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              data.avg_stress >= 75 
                                ? 'bg-red-100 text-red-800' 
                                : data.avg_stress >= 50 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {data.avg_stress >= 75 ? 'High Risk' : data.avg_stress >= 50 ? 'Moderate' : 'Good'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No department data available
                </div>
              )}
            </div>

            {/* Action Items */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                {analyticsData && analyticsData.crisis_alerts > 0 && (
                  <div className="flex items-center space-x-3 text-red-700">
                    <span className="text-red-500">🚨</span>
                    <span>Immediate attention: {analyticsData.crisis_alerts} crisis alerts need review</span>
                  </div>
                )}
                {analyticsData && analyticsData.avg_stress_score > 70 && (
                  <div className="flex items-center space-x-3 text-orange-700">
                    <span className="text-orange-500">⚠️</span>
                    <span>High stress levels detected across campus - consider wellness program</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-blue-700">
                  <span className="text-blue-500">💡</span>
                  <span>Review conversation patterns to identify trending concerns</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Loading state for students with no data */}
        {user?.role === 'student' && !studentAnalyticsData && !loadingData && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Insights</h3>
              <p className="text-gray-600 mb-6">
                Your personalized wellness insights will appear here as you interact with MindMate. 
                Start a conversation to begin tracking your mental health journey!
              </p>
              <button 
                onClick={() => router.push('/student')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start a Conversation
              </button>
            </div>
          </div>
        )}

        {/* Loading state for counselors with no data */}
        {user?.role !== 'student' && !analyticsData && !loadingData && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Available</h3>
              <p className="text-gray-600">
                Analytics data will appear here as students interact with the MindMate system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </NotificationManager>
  );
}