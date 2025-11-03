'use client';

import { useState, useEffect } from 'react';
import ResourceCard from './ResourceCard';

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

interface ResourceGridProps {
  resources: Resource[];
  loading?: boolean;
  savedResourceIds?: string[];
  recommendedResourceIds?: string[];
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ResourceGrid({
  resources,
  loading = false,
  savedResourceIds = [],
  recommendedResourceIds = [],
  onOpen,
  onSave,
  onShare,
  onLoadMore,
  hasMore = false
}: ResourceGridProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const handleCall = (phoneNumber: string) => {
    // Copy to clipboard and show modal on desktop
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneNumber);
    }
    
    // Try to open phone dialer
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        // Desktop: show confirmation modal with number
        alert(`Phone number copied to clipboard: ${phoneNumber}\n\nFor immediate help, please call this number.`);
      }
    }
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      setVisibleCount(prev => prev + 12);
    }
  };

  const visibleResources = onLoadMore ? resources : resources.slice(0, visibleCount);
  const canLoadMore = onLoadMore ? hasMore : visibleCount < resources.length;

  if (loading && resources.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white/90 rounded-2xl p-6 border border-sage-200 animate-pulse"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 bg-sage-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-sage-200 rounded mb-2"></div>
                <div className="h-3 bg-sage-200 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-sage-200 rounded"></div>
              <div className="h-3 bg-sage-200 rounded w-3/4"></div>
            </div>
            <div className="flex space-x-2 mb-4">
              <div className="h-6 w-16 bg-sage-200 rounded"></div>
              <div className="h-6 w-20 bg-sage-200 rounded"></div>
            </div>
            <div className="flex justify-between pt-4 border-t border-sage-100">
              <div className="h-8 w-20 bg-sage-200 rounded-xl"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-sage-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-sage-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-sage-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-lg font-semibold text-warm-gray-900 mb-2">
          No resources found
        </h3>
        <p className="text-warm-gray-600 max-w-md mx-auto">
          Try adjusting your search terms or filters to find more resources.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            recommended={recommendedResourceIds.includes(resource.id)}
            saved={savedResourceIds.includes(resource.id)}
            onOpen={onOpen}
            onSave={onSave}
            onShare={onShare}
            onCall={handleCall}
          />
        ))}
      </div>

      {/* Load more button */}
      {canLoadMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="
              px-6 py-3 bg-white/90 hover:bg-white 
              border border-sage-200 hover:border-soft-blue-300
              text-warm-gray-700 hover:text-soft-blue-700
              rounded-xl font-medium
              shadow-soft hover:shadow-medium
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? 'Loading...' : 'Load More Resources'}
          </button>
        </div>
      )}
    </div>
  );
}