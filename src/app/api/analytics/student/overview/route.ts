import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

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

    if (!anon_id || anon_id !== user.anon_id) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 403 }
      );
    }

    // Generate demo data for student dashboard
    const currentDate = new Date();
    const trend = [];
    
    // Generate 7 days of trend data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Simulate varying stress levels (20-80 range)
      const baseStress = 40;
      const variation = Math.sin(i * 0.5) * 20 + Math.random() * 10;
      const score = Math.max(20, Math.min(80, baseStress + variation));
      
      trend.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(score * 10) / 10
      });
    }

    const avgStressWeek = trend.reduce((sum, day) => sum + day.score, 0) / trend.length;

    // Demo recent conversations
    const recentConvos = [
      {
        conv_id: 'conv_001',
        title: 'Feeling overwhelmed with assignments',
        last_snippet: 'Thanks for the breathing exercise tip...',
        last_score: 65,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        conv_id: 'conv_002', 
        title: 'Anxiety about upcoming exams',
        last_snippet: 'The study schedule you suggested really helps...',
        last_score: 45,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        conv_id: 'conv_003',
        title: 'General check-in',
        last_snippet: 'Had a good day today, feeling more balanced...',
        last_score: 25,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const response = {
      avg_stress_week: Math.round(avgStressWeek * 10) / 10,
      checkins_week: 5,
      alerts_sent: 1,
      trend,
      emotion_counts: {
        anxiety: 8,
        stress: 12,
        calm: 15,
        happy: 10,
        frustrated: 6,
        overwhelmed: 4
      },
      recent_convos: recentConvos
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get student overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}