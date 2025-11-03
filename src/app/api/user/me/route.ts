import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        anon_id: user.anon_id,
        role: user.role,
        dept: user.dept,
        year: user.year,
        consent: 'ON' // For demo, will be stored in DB later
      }
    });

  } catch (error) {
    console.error('Get user me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}