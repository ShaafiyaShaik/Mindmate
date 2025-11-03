import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { anon_id, consent } = await request.json();

    if (user.anon_id !== anon_id) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 403 }
      );
    }

    if (!['ON', 'OFF'].includes(consent)) {
      return NextResponse.json(
        { error: 'Invalid consent value' },
        { status: 400 }
      );
    }

    // In production, save to database
    // For demo, we'll just return success
    console.log(`Consent updated for ${anon_id}: ${consent}`);

    return NextResponse.json({
      success: true,
      message: `Consent updated to ${consent}`
    });

  } catch (error) {
    console.error('Update consent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}