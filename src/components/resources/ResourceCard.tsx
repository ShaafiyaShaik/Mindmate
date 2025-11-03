'use client';

import { useState } from 'react';

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

interface ResourceCardProps {
  resource: Resource;
  recommended?: boolean;
  saved?: boolean;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  onCall?: (phoneNumber: string) => void;
}

const TYPE_ICONS: Record<string, () => JSX.Element> = {
  pdf: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  video: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  workshop: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7L6 9h12l-2-2M4 15h16v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  hotline: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
};

const TYPE_COLORS = {
  pdf: 'bg-red-100 text-red-700',
  video: 'bg-purple-100 text-purple-700',
  workshop: 'bg-green-100 text-green-700',
  hotline: 'bg-orange-100 text-orange-700'
};

export default function ResourceCard({
  resource,
  recommended = false,
  saved = false,
  onOpen,
  onSave,
  onShare,
  onCall
}: ResourceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);

  const IconComponent = TYPE_ICONS[resource.type];
  const typeColor = TYPE_COLORS[resource.type];

  const handleOpen = async () => {
    setIsLoading(true);
    try {
      await onOpen(resource.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await onSave(resource.id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleCall = () => {
    if (resource.hotline_number && onCall) {
      onCall(resource.hotline_number);
    }
  };

  const handleShare = () => {
    onShare(resource.id);
  };

  const formatTags = (tags: string[]) => {
    return tags.map(tag => tag.replace('_', ' ')).slice(0, 3);
  };

  return (
    <div className={`
      group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 
      border border-sage-200 hover:border-soft-blue-300
      shadow-soft hover:shadow-medium
      transition-all duration-300 hover:-translate-y-1
      ${recommended ? 'ring-2 ring-soft-blue-200 ring-opacity-50' : ''}
    `}>
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute -top-2 -right-2 bg-soft-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-medium animate-pulse">
          Recommended
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${typeColor}`}>
            {TYPE_ICONS[resource.type] ? TYPE_ICONS[resource.type]() : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-warm-gray-900 leading-tight">
              {resource.title}
            </h3>
            <p className="text-sm text-warm-gray-500 capitalize">
              {resource.type === 'hotline' ? 'Crisis Support' : resource.type}
            </p>
          </div>
        </div>
        
        {/* Popularity indicator */}
        {resource.popularity && resource.popularity > 0 && (
          <div className="flex items-center space-x-1 text-xs text-warm-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{resource.popularity}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-warm-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
        {resource.description}
      </p>

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {formatTags(resource.tags).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-md capitalize"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-warm-gray-400">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-sage-100">
        <div className="flex items-center space-x-2">
          {/* Primary action */}
          {resource.is_hotline ? (
            <button
              onClick={handleCall}
              className="
                flex items-center space-x-2 px-4 py-2 
                bg-orange-500 hover:bg-orange-600 text-white
                rounded-xl font-medium text-sm
                transition-colors duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Call</span>
            </button>
          ) : (
            <button
              onClick={handleOpen}
              disabled={isLoading}
              className="
                flex items-center space-x-2 px-4 py-2 
                bg-soft-blue-500 hover:bg-soft-blue-600 text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                rounded-xl font-medium text-sm
                transition-colors duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{isLoading ? 'Opening...' : 'Open'}</span>
            </button>
          )}
          
          {/* External link for workshops */}
          {resource.type === 'workshop' && resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center space-x-1 px-3 py-2 
                text-soft-blue-600 hover:text-soft-blue-700
                text-sm font-medium
                transition-colors duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Register</span>
            </a>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Save button */}
          <button
            onClick={handleSave}
            className="
              p-2 text-warm-gray-400 hover:text-soft-blue-600
              hover:bg-soft-blue-50 rounded-lg
              transition-all duration-200
            "
            aria-label={isSaved ? 'Remove from saved' : 'Save resource'}
          >
            {isSaved ? (
              <svg className="w-5 h-5 text-soft-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3a1 1 0 000 2v16a1 1 0 001.447.894L12 18.618l7.553 3.276A1 1 0 0021 21V5a1 1 0 000-2H3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="
              p-2 text-warm-gray-400 hover:text-warm-gray-600
              hover:bg-warm-gray-50 rounded-lg
              transition-all duration-200
            "
            aria-label="Share resource"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Approved by footer */}
      {resource.approved_by && (
        <div className="mt-3 pt-3 border-t border-sage-100">
          <p className="text-xs text-warm-gray-400">
            Approved by {resource.approved_by}
          </p>
        </div>
      )}

      {/* Recommendation reason tooltip */}
      {recommended && resource.recommendation_reasons && resource.recommendation_reasons.length > 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-warm-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
            Recommended: {resource.recommendation_reasons[0].replace('_', ' ')}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-warm-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}