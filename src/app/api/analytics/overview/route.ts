import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import mockAnalytics from '@/data/analytics_mock.json';

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

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only allow counselors and admins to view analytics
    if (!['counselor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '7d';
    
    // For demo purposes, return the same mock data regardless of range
    // In a real system, this would filter data based on the time range
    const analyticsData: AnalyticsData = {
      ...mockAnalytics,
      // Adjust data slightly based on range for realism
      total_conversations: range === '30d' ? mockAnalytics.total_conversations * 4 : 
                          range === '90d' ? mockAnalytics.total_conversations * 12 : 
                          mockAnalytics.total_conversations,
      active_students: range === '30d' ? Math.floor(mockAnalytics.active_students * 2.5) : 
                      range === '90d' ? Math.floor(mockAnalytics.active_students * 4.5) : 
                      mockAnalytics.active_students
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}