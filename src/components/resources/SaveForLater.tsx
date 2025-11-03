'use client';

import { useState } from 'react';
import { 
  BookmarkIcon, 
  XMarkIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'workshop' | 'hotline';
  description: string;
  tags: string[];
  saved_at?: string;
}

interface SaveForLaterProps {
  savedResources: Resource[];
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export default function SaveForLater({
  savedResources,
  onOpen,
  onRemove,
  className = ''
}: SaveForLaterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatSavedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Recently';
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (savedResources.length === 0) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-sage-200 ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <BookmarkIcon className="w-5 h-5 text-warm-gray-400" />
          <h3 className="font-medium text-warm-gray-900">Saved Resources</h3>
        </div>
        <p className="text-sm text-warm-gray-500">
          Resources you save will appear here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-sage-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-sage-50 transition-colors duration-200"
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-3">
          <BookmarkIcon className="w-5 h-5 text-soft-blue-600" />
          <h3 className="font-medium text-warm-gray-900">Saved Resources</h3>
          <span className="text-sm text-warm-gray-500 bg-sage-100 px-2 py-1 rounded-full">
            {savedResources.length}
          </span>
        </div>
        <ChevronRightIcon 
          className={`w-4 h-4 text-warm-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </div>

      {/* Saved resources list */}
      {isExpanded && (
        <div className="border-t border-sage-100">
          <div className="max-h-80 overflow-y-auto">
            {savedResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-3 hover:bg-sage-50 transition-colors duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-warm-gray-900 truncate">
                      {resource.title}
                    </h4>
                    <span className="text-xs text-warm-gray-400 capitalize bg-sage-100 px-1.5 py-0.5 rounded">
                      {resource.type}
                    </span>
                  </div>
                  <p className="text-xs text-warm-gray-500 line-clamp-1">
                    {resource.description}
                  </p>
                  {resource.saved_at && (
                    <p className="text-xs text-warm-gray-400 mt-1">
                      Saved {formatSavedDate(resource.saved_at)}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(resource.id);
                    }}
                    className="
                      p-1.5 text-warm-gray-400 hover:text-soft-blue-600
                      hover:bg-soft-blue-50 rounded-md
                      transition-all duration-200
                    "
                    aria-label="Open resource"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(resource.id);
                    }}
                    className="
                      p-1.5 text-warm-gray-400 hover:text-red-600
                      hover:bg-red-50 rounded-md
                      transition-all duration-200
                    "
                    aria-label="Remove from saved"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {savedResources.length > 5 && (
            <div className="p-3 border-t border-sage-100 bg-sage-25">
              <p className="text-xs text-warm-gray-500 text-center">
                Scroll to see all {savedResources.length} saved resources
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}