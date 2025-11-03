import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getConversations, getMessages } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only allow students to view their own analytics
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'This endpoint is for students only' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '7d';
    
    // Fetch student's conversations from the configured DB (MongoDB or SQLite)
    let studentConversations: any[] = [];
    let totalMessages = 0;
    let stressScores: number[] = [];
    let emotions: { [key: string]: number } = {};
    let dailyActivity: { [key: string]: { stress: number[], count: number } } = {};

    try {
      const convs = await getConversations(user.anon_id);
      // getConversations returns array of conversations for anon_id
      studentConversations = convs || [];

      for (const conv of studentConversations) {
        // fetch messages for conversation from DB
        const messages = await getMessages(conv.id || conv.id?.toString());
        if (!messages || messages.length === 0) continue;

        totalMessages += messages.length;

        for (const message of messages) {
          if (message.sender === 'student' && (message.stress_score || message.stress_score === 0 || message.metadata?.stress_score)) {
            const score = message.stress_score ?? message.metadata?.stress_score ?? null;
            if (typeof score === 'number') stressScores.push(score);

            const ts = message.timestamp ? new Date(message.timestamp * 1000) : new Date();
            const date = ts.toISOString().split('T')[0];
            if (!dailyActivity[date]) dailyActivity[date] = { stress: [], count: 0 };
            if (typeof score === 'number') dailyActivity[date].stress.push(score);
            dailyActivity[date].count++;
          }

          // Extract emotions from message tags/metadata
          const detected = message.tags || message.metadata?.detected_keywords || [];
          if (Array.isArray(detected)) {
            for (const keyword of detected) {
              const k = String(keyword).toLowerCase();
              const emotionWords = ['anxious', 'stressed', 'sad', 'worried', 'frustrated', 'angry', 'depressed', 'happy', 'excited', 'calm', 'confident', 'optimistic', 'overwhelmed', 'nervous', 'panicking'];
              if (emotionWords.includes(k)) {
                emotions[k] = (emotions[k] || 0) + 1;
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error fetching conversations/messages from DB:', e);
    }

    // Calculate analytics
    const avgStressScore = stressScores.length > 0 ? stressScores.reduce((a, b) => a + b, 0) / stressScores.length : 0;

    console.log(`=== Analytics Update for ${user.anon_id} ===`);
    console.log(`Found ${studentConversations.length} conversations for user ${user.anon_id}`);
    console.log(`Total messages: ${totalMessages}`);
    console.log(`Stress scores: ${stressScores.length}`);
    console.log(`Emotions found:`, emotions);
    console.log(`Daily activity:`, Object.keys(dailyActivity));
    console.log(`Average stress: ${avgStressScore}`);
    console.log('================================');
    
    // Build stress trends
    const stressTrends = Object.entries(dailyActivity)
      .map(([date, data]) => ({
        date,
        avg_stress: data.stress.length > 0 ? data.stress.reduce((a, b) => a + b, 0) / data.stress.length : 0,
        conversation_count: data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-parseInt(range.replace('d', '')));

    // If no real data exists, use mock data for demo
    if (studentConversations.length === 0) {
      const mockData: StudentAnalyticsData = {
        total_conversations: 12,
        avg_stress_score: 58.3,
        recent_mood_trend: 'improving',
        emotion_distribution: {
          'anxious': 8,
          'stressed': 6,
          'worried': 4,
          'frustrated': 3,
          'sad': 2,
          'calm': 5,
          'happy': 3
        },
        stress_trends: [
          { date: '2025-10-05', avg_stress: 65.0, conversation_count: 2 },
          { date: '2025-10-06', avg_stress: 62.5, conversation_count: 1 },
          { date: '2025-10-07', avg_stress: 58.0, conversation_count: 3 },
          { date: '2025-10-08', avg_stress: 55.5, conversation_count: 2 },
          { date: '2025-10-09', avg_stress: 52.0, conversation_count: 1 },
          { date: '2025-10-10', avg_stress: 48.5, conversation_count: 2 },
          { date: '2025-10-11', avg_stress: 45.0, conversation_count: 1 }
        ],
        conversation_summary: {
          total_messages: 47,
          avg_messages_per_conversation: 3.9,
          most_active_day: 'Tuesday'
        },
        recommendations: [
          'Your stress levels have been improving over the past week - keep up the great work!',
          'Consider practicing the breathing exercises shared in our recent conversation',
          'Try scheduling regular check-ins with the wellness center',
          'Keep engaging with the MindMate companion when you feel overwhelmed'
        ]
      };
      
      return NextResponse.json(mockData);
    }

    // Find most active day
    const dayActivity: { [key: string]: number } = {};
    Object.entries(dailyActivity).forEach(([date, data]) => {
      const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      dayActivity[day] = (dayActivity[day] || 0) + data.count;
    });
    const mostActiveDay = Object.entries(dayActivity).length > 0 
      ? Object.entries(dayActivity).reduce((a, b) => dayActivity[a[0]] > dayActivity[b[0]] ? a : b, ['Monday', 0])[0]
      : 'No activity yet';

    // Generate recommendations based on real data
    const recommendations: string[] = [];
    
    // Analyze stress trend
    if (stressTrends.length >= 2) {
      const recentStress = stressTrends[stressTrends.length - 1].avg_stress;
      const previousStress = stressTrends[0].avg_stress;
      const trendDiff = recentStress - previousStress;
      
      if (trendDiff < -10) {
        recommendations.push('Great progress! Your stress levels have decreased significantly. Keep up the excellent work with your coping strategies.');
      } else if (trendDiff < -5) {
        recommendations.push('Your stress levels are showing improvement. The techniques you\'re practicing seem to be helping.');
      } else if (trendDiff > 10) {
        recommendations.push('I notice your stress levels have increased. Consider scheduling time with a counselor or practicing relaxation techniques.');
      } else if (trendDiff > 5) {
        recommendations.push('Your stress levels have risen slightly. Try incorporating some stress-relief activities into your daily routine.');
      } else {
        recommendations.push('Your stress levels are relatively stable. Continue with your current wellness practices.');
      }
    }
    
    // Analyze conversation content for personalized recommendations
    let hasAcademicConcerns = false;
    let hasSocialAnxiety = false;
    let hasTimeManagement = false;
    let showingImprovement = false;
    
    studentConversations.forEach(conv => {
      if (conv.messages) {
        conv.messages.forEach((msg: any) => {
          if (msg.sender === 'student' && msg.metadata?.detected_keywords) {
            const keywords = msg.metadata.detected_keywords.map((k: string) => k.toLowerCase());
            
            if (keywords.some((k: string) => ['exam', 'assignment', 'project', 'study', 'grade'].includes(k))) {
              hasAcademicConcerns = true;
            }
            if (keywords.some((k: string) => ['presentation', 'social', 'group', 'judge', 'staring'].includes(k))) {
              hasSocialAnxiety = true;
            }
            if (keywords.some((k: string) => ['deadline', 'procrastinating', 'time', 'overwhelmed'].includes(k))) {
              hasTimeManagement = true;
            }
            if (keywords.some((k: string) => ['better', 'helped', 'confident', 'optimistic', 'progress'].includes(k))) {
              showingImprovement = true;
            }
          }
        });
      }
    });
    
    // Add specific recommendations based on conversation analysis
    if (hasAcademicConcerns) {
      recommendations.push('Consider breaking down large academic tasks into smaller, manageable steps to reduce overwhelm.');
    }
    if (hasSocialAnxiety) {
      recommendations.push('Practice grounding techniques like the 5-4-3-2-1 method before social situations to manage anxiety.');
    }
    if (hasTimeManagement) {
      recommendations.push('Try using time-blocking or the Pomodoro technique to improve your time management and reduce procrastination.');
    }
    if (showingImprovement) {
      recommendations.push('You\'re making excellent progress! Continue practicing the coping strategies that are working for you.');
    }
    
    // Always include general wellness recommendations
    recommendations.push('Remember that seeking support is a sign of strength - keep engaging with MindMate when you need guidance.');
    
    // Determine recent mood trend
    let recentMoodTrend = 'stable';
    if (stressTrends.length >= 3) {
      const recent = stressTrends.slice(-3);
      const avgRecent = recent.reduce((sum, item) => sum + item.avg_stress, 0) / recent.length;
      const early = stressTrends.slice(0, Math.min(3, stressTrends.length));
      const avgEarly = early.reduce((sum, item) => sum + item.avg_stress, 0) / early.length;
      
      if (avgRecent < avgEarly - 5) {
        recentMoodTrend = 'improving';
      } else if (avgRecent > avgEarly + 5) {
        recentMoodTrend = 'declining';
      }
    }

    const analyticsData: StudentAnalyticsData = {
      total_conversations: studentConversations.length,
      avg_stress_score: Math.round(avgStressScore * 10) / 10,
      recent_mood_trend: recentMoodTrend,
      emotion_distribution: emotions,
      stress_trends: stressTrends,
      conversation_summary: {
        total_messages: totalMessages,
        avg_messages_per_conversation: studentConversations.length > 0 ? Math.round((totalMessages / studentConversations.length) * 10) / 10 : 0,
        most_active_day: mostActiveDay
      },
      recommendations: recommendations.slice(0, 4) // Limit to 4 recommendations
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Student analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}