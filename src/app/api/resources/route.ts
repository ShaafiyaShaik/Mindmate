import { NextRequest, NextResponse } from 'next/server';
import mockResourcesData from '@/data/mockResourcesData';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'workshop' | 'hotline';
  url: string | null;
  thumbnail?: string;
  description: string;
  tags: string[];
  approved_by?: string;
  popularity?: number;
  is_hotline?: boolean;
  hotline_number?: string;
  recommendation_score?: number;
  recommendation_reasons?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    let filteredResources = [...mockResourcesData];

    // Apply search filter
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredResources = filteredResources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply tag filters
    if (tags.length > 0) {
      filteredResources = filteredResources.filter(resource =>
        tags.some(tag => resource.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        // For mock data, we'll keep original order as "newest"
        break;
      case 'most_saved':
        filteredResources.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'relevance':
      default:
        // Sort by recommendation score if available, then popularity
        filteredResources.sort((a, b) => {
          const scoreA = a.recommendation_score || 0;
          const scoreB = b.recommendation_score || 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
          return (b.popularity || 0) - (a.popularity || 0);
        });
        break;
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResources = filteredResources.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredResources.length;

    return NextResponse.json({
      resources: paginatedResources,
      total: filteredResources.length,
      page,
      hasMore
    });

  } catch (error) {
    console.error('Resources API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}