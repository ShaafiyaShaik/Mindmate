'use client';

import { useState, useEffect } from 'react';
import { 
  BookmarkIcon, 
  EyeIcon, 
  PhoneIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'workshop' | 'hotline';
  description: string;
  tags: string[];
  hotline_number?: string;
  is_hotline?: boolean;
}

interface ResourceSuggestionProps {
  resourceIds: string[];
  onResourceOpen: (id: string) => void;
  className?: string;
}

export default function ResourceSuggestion({ 
  resourceIds, 
  onResourceOpen, 
  className = '' 
}: ResourceSuggestionProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resourceIds.length === 0) return;

    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          tags: resourceIds.join(',')
        });
        
        const response = await fetch(`/api/resources?${params}`);
        const data = await response.json();
        
        if (response.ok) {
          // Filter to only suggested resources or get similar ones
          const filteredResources = data.resources.filter((r: Resource) => 
            resourceIds.some(id => r.id.includes(id) || r.tags.some((tag: string) => 
              resourceIds.includes(tag) || resourceIds.includes(r.type)
            ))
          ).slice(0, 3);
          
          setResources(filteredResources);
        }
      } catch (error) {
        console.error('Error fetching suggested resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [resourceIds]);

  const handleResourceClick = (resource: Resource) => {
    if (resource.is_hotline && resource.hotline_number) {
      // Handle phone call
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `tel:${resource.hotline_number}`;
      } else {
        navigator.clipboard?.writeText(resource.hotline_number);
        alert(`Phone number copied: ${resource.hotline_number}\n\nFor immediate help, please call this number.`);
      }
    } else {
      onResourceOpen(resource.id);
    }
  };

  if (loading) {
    return (
      <div className={`bg-soft-blue-50 rounded-xl p-4 border border-soft-blue-200 animate-pulse ${className}`}>
        <div className="h-4 bg-soft-blue-200 rounded mb-2"></div>
        <div className="h-3 bg-soft-blue-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (resources.length === 0) return null;

  return (
    <div className={`bg-gradient-to-r from-soft-blue-50 to-lavender-50 rounded-xl p-4 border border-soft-blue-200 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-soft-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">💡</span>
        </div>
        <h4 className="font-medium text-soft-blue-900">
          MindMate suggests these resources
        </h4>
      </div>
      
      <div className="space-y-2">
        {resources.map((resource) => (
          <button
            key={resource.id}
            onClick={() => handleResourceClick(resource)}
            className="
              w-full text-left p-3 bg-white/80 hover:bg-white 
              rounded-lg border border-soft-blue-100 hover:border-soft-blue-300
              transition-all duration-200 hover:shadow-soft
              group
            "
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {resource.is_hotline ? (
                    <PhoneIcon className="w-4 h-4 text-orange-600" />
                  ) : resource.type === 'pdf' ? (
                    <EyeIcon className="w-4 h-4 text-blue-600" />
                  ) : (
                    <BookmarkIcon className="w-4 h-4 text-green-600" />
                  )}
                  <h5 className="font-medium text-warm-gray-900 text-sm">
                    {resource.title}
                  </h5>
                  {resource.is_hotline && (
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <p className="text-xs text-warm-gray-600 line-clamp-2">
                  {resource.description}
                </p>
                {resource.hotline_number && (
                  <p className="text-xs font-mono text-orange-700 mt-1">
                    📞 {resource.hotline_number}
                  </p>
                )}
              </div>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-soft-blue-600">
                  {resource.is_hotline ? 'Call' : 'View'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-soft-blue-200">
        <p className="text-xs text-soft-blue-700">
          💡 Based on your conversation, these resources might help
        </p>
      </div>
    </div>
  );
}