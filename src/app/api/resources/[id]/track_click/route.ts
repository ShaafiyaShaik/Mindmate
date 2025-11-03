import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resourceId = params.id;
    
    // For demo purposes, just return success
    // In a real system, this would track the click in analytics
    console.log(`Resource clicked: ${resourceId}`);
    
    return NextResponse.json({
      message: 'Click tracked successfully',
      resource_id: resourceId
    });

  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}