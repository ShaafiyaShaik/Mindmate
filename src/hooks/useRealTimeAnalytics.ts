import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

export function useRealTimeAnalytics(timeRange: '7' | '30' | '90' = '7') {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial analytics data
  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const endpoint = user.role === 'student' ? '/api/analytics/student' : '/api/analytics/overview';
      const response = await fetch(`${endpoint}?range=${timeRange}d`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time connection
  useEffect(() => {
    if (!user) return;

    fetchAnalytics();

    // Set up Server-Sent Events for real-time updates
    if (user.role === 'student') {
      const eventSource = new EventSource('/api/analytics/stream');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('Connected to real-time analytics');
              // Show connection notification
              if ((window as any).addNotification) {
                (window as any).addNotification('Real-time insights connected!', 'success');
              }
              break;
            case 'conversation_update':
              console.log('Conversation update received, refreshing analytics...');
              if ((window as any).addNotification) {
                (window as any).addNotification('New conversation detected - updating insights!', 'info');
              }
              fetchAnalytics();
              break;
            case 'emotion_analysis':
              console.log('Emotion analysis update received, refreshing analytics...');
              if ((window as any).addNotification) {
                (window as any).addNotification('Emotions analyzed - insights updated!', 'info');
              }
              fetchAnalytics();
              break;
            case 'stress_analysis':
              console.log('Stress analysis update received, refreshing analytics...');
              if ((window as any).addNotification) {
                (window as any).addNotification('Stress levels analyzed - insights refreshed!', 'info');
              }
              fetchAnalytics();
              break;
            case 'heartbeat':
              // Heartbeat - keep connection alive
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Reconnect after a delay
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            fetchAnalytics();
          }
        }, 5000);
      };
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user, timeRange]);

  // Manual refresh function
  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  // Trigger analytics update (called when new conversations are created)
  const triggerUpdate = async (eventType: string, eventData?: any) => {
    if (!user) return;

    try {
      await fetch('/api/analytics/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anon_id: user.anon_id,
          event_type: eventType,
          data: eventData,
        }),
      });
    } catch (error) {
      console.error('Error triggering analytics update:', error);
    }
  };

  return {
    analyticsData,
    loading,
    lastUpdate,
    refreshAnalytics,
    triggerUpdate,
  };
}