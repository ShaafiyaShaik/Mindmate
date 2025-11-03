import { NextRequest, NextResponse } from 'next/server';

// Mock saved resources store (in a real app this would be in a database)
const savedResources = new Map<string, string[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: { anon_id: string } }
) {
  try {
    const { anon_id } = params;
    const userSaved = savedResources.get(anon_id) || [];
    
    return NextResponse.json({
      saved: userSaved.map(id => ({ id })),
      total: userSaved.length
    });

  } catch (error) {
    console.error('Get saved resources error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { anon_id: string } }
) {
  try {
    const { anon_id } = params;
    const { resource_id } = await request.json();

    if (!resource_id) {
      return NextResponse.json(
        { error: 'resource_id is required' },
        { status: 400 }
      );
    }

    const userSaved = savedResources.get(anon_id) || [];
    
    // Toggle save state
    const isCurrentlySaved = userSaved.includes(resource_id);
    if (isCurrentlySaved) {
      const updatedSaved = userSaved.filter(id => id !== resource_id);
      savedResources.set(anon_id, updatedSaved);
    } else {
      userSaved.push(resource_id);
      savedResources.set(anon_id, userSaved);
    }

    return NextResponse.json({
      message: isCurrentlySaved ? 'Resource removed from saved' : 'Resource saved successfully',
      saved: !isCurrentlySaved,
      resource_id
    });

  } catch (error) {
    console.error('Save resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}