import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const anon_id = url.searchParams.get('anon_id');
    const range = url.searchParams.get('range') || '7'; // 7, 30, or 90 days

    if (!anon_id || anon_id !== user.anon_id) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 403 }
      );
    }

    const db = getDb();
    const daysBack = parseInt(range);
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysBack * 24 * 60 * 60);

    // Get messages with sentiment data
    const messages = db.prepare(`
      SELECT 
        m.*, 
        c.title as conversation_title,
        DATE(datetime(m.timestamp, 'unixepoch')) as message_date
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.anon_id = ? 
        AND m.timestamp >= ?
        AND m.sender = 'student'
        AND m.stress_score IS NOT NULL
      ORDER BY m.timestamp ASC
    `).all(anon_id, cutoffTimestamp);

    // Calculate KPIs
    const totalCheckIns = messages.length;
    const avgStress = totalCheckIns > 0 
      ? Math.round(messages.reduce((sum: number, m: any) => sum + (m.stress_score || 50), 0) / totalCheckIns)
      : 50;

    // Calculate week-over-week improvement
    const weekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    const recentMessages = messages.filter((m: any) => m.timestamp >= weekAgo);
    const olderMessages = messages.filter((m: any) => m.timestamp < weekAgo);
    
    const recentAvgStress = recentMessages.length > 0
      ? recentMessages.reduce((sum: number, m: any) => sum + (m.stress_score || 50), 0) / recentMessages.length
      : avgStress;
    
    const olderAvgStress = olderMessages.length > 0
      ? olderMessages.reduce((sum: number, m: any) => sum + (m.stress_score || 50), 0) / olderMessages.length
      : avgStress;

    const improvementPercent = olderAvgStress > 0 
      ? Math.round(((olderAvgStress - recentAvgStress) / olderAvgStress) * 100)
      : 0;

    // Generate sentiment trend data
    const sentimentTrend = generateSentimentTrend(messages, daysBack);
    
    // Generate emotion frequency data
    const emotionFrequency = generateEmotionFrequency(messages);
    
    // Generate story insights
    const insights = generateInsights(messages, daysBack);

    // Get personalized resource recommendations
    const topTags = getTopTags(messages);
    const resourceRecommendations = await getResourceRecommendations(topTags);

    return NextResponse.json({
      kpis: {
        avgStress,
        totalCheckIns,
        improvementPercent,
        range: daysBack
      },
      sentimentTrend,
      emotionFrequency,
      insights,
      resourceRecommendations,
      dataPoints: messages.length
    });

  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSentimentTrend(messages: any[], daysBack: number) {
  const trend = [];
  const now = new Date();
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayMessages = messages.filter(m => {
      const msgDate = new Date(m.timestamp * 1000).toISOString().split('T')[0];
      return msgDate === dateStr;
    });
    
    if (dayMessages.length > 0) {
      const avgStress = dayMessages.reduce((sum, m) => sum + (m.stress_score || 50), 0) / dayMessages.length;
      const avgSentiment = calculateSentimentScore(dayMessages);
      
      trend.push({
        date: dateStr,
        stress: Math.round(avgStress),
        sentiment: avgSentiment,
        checkIns: dayMessages.length
      });
    } else {
      trend.push({
        date: dateStr,
        stress: null,
        sentiment: null,
        checkIns: 0
      });
    }
  }
  
  return trend;
}

function generateEmotionFrequency(messages: any[]) {
  const emotions: Record<string, number> = {};
  
  messages.forEach(message => {
    if (message.emotion) {
      emotions[message.emotion] = (emotions[message.emotion] || 0) + 1;
    }
  });
  
  return Object.entries(emotions)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);
}

function generateInsights(messages: any[], daysBack: number): string[] {
  const insights: string[] = [];
  
  if (messages.length < 3) {
    return ["Keep checking in regularly to see personalized insights about your emotional patterns."];
  }

  // Stress pattern analysis
  const stressLevels = messages.map(m => m.stress_score || 50);
  const avgStress = stressLevels.reduce((sum, s) => sum + s, 0) / stressLevels.length;
  
  if (avgStress > 70) {
    insights.push("Your stress levels have been consistently high lately. Consider taking breaks and using relaxation techniques.");
  } else if (avgStress < 30) {
    insights.push("You've been maintaining relatively low stress levels - great job managing your wellbeing!");
  }

  // Time pattern analysis
  const timestamps = messages.map(m => new Date(m.timestamp * 1000));
  const hourCounts: Record<number, number> = {};
  
  timestamps.forEach(time => {
    const hour = time.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const mostActiveHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (mostActiveHour && parseInt(mostActiveHour[0]) < 6) {
    insights.push("You tend to reach out during very early hours. Consider establishing a regular sleep schedule.");
  } else if (mostActiveHour && parseInt(mostActiveHour[0]) > 22) {
    insights.push("You often check in late at night. Late-night stress might be affecting your sleep quality.");
  }

  // Conversation pattern analysis
  const conversationTitles = messages.map(m => m.conversation_title || '').join(' ').toLowerCase();
  
  if (conversationTitles.includes('exam') || conversationTitles.includes('test')) {
    insights.push("Academic pressure seems to be a recurring theme. Consider developing a study schedule to reduce exam anxiety.");
  }
  
  if (conversationTitles.includes('sleep') || conversationTitles.includes('tired')) {
    insights.push("Sleep concerns appear frequently in your conversations. Good sleep hygiene could help improve your overall wellbeing.");
  }

  return insights.length > 0 ? insights.slice(0, 3) : [
    "Your emotional patterns are developing. Continue regular check-ins to unlock more personalized insights."
  ];
}

function calculateSentimentScore(messages: any[]): number {
  // Convert sentiment strings to scores: positive=1, neutral=0, negative=-1
  const sentimentScores = messages.map(m => {
    switch(m.sentiment || 'neutral') {
      case 'positive': return 1;
      case 'negative': return -1;
      default: return 0;
    }
  });
  
  const avgSentiment = sentimentScores.reduce((sum: number, s: number) => sum + s, 0) / sentimentScores.length;
  return Math.round(avgSentiment * 100) / 100; // Round to 2 decimals
}

function getTopTags(messages: any[]): string[] {
  const tagCounts: Record<string, number> = {};
  
  messages.forEach(message => {
    if (message.tags) {
      try {
        const tags = typeof message.tags === 'string' ? JSON.parse(message.tags) : message.tags;
        if (Array.isArray(tags)) {
          tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      } catch (e) {
        // Handle malformed tags
      }
    }
  });
  
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
}

async function getResourceRecommendations(topTags: string[]) {
  // This would normally call the resources API, but for now return mock data
  const recommendations = [
    {
      id: 'res_breathing',
      title: 'Breathing Exercises',
      description: 'Quick 5-minute breathing techniques to reduce immediate stress',
      type: 'exercise',
      tags: ['anxiety', 'stress', 'breathing']
    },
    {
      id: 'res_study_tips',
      title: 'Study Schedule Planning',
      description: 'Evidence-based strategies for effective study scheduling',
      type: 'guide',
      tags: ['exam_stress', 'academic', 'time_management']
    },
    {
      id: 'res_sleep_hygiene',
      title: 'Sleep Improvement Guide',
      description: 'Proven techniques for better sleep quality and duration',
      type: 'guide',
      tags: ['sleep', 'wellness', 'routine']
    }
  ];
  
  // Filter recommendations based on user's top tags
  return recommendations.filter(resource => 
    resource.tags.some(tag => topTags.includes(tag))
  ).slice(0, 3);
}