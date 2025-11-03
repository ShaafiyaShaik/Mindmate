import { useState, useEffect } from 'react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  type: 'article' | 'video' | 'exercise' | 'contact';
  url?: string;
  content?: string;
  tags: string[];
}

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedResourceIds: string[];
}

export default function ResourceDrawer({ 
  isOpen, 
  onClose, 
  suggestedResourceIds 
}: ResourceDrawerProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && suggestedResourceIds.length > 0) {
      loadResources();
    }
  }, [isOpen, suggestedResourceIds]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resources?tags=${suggestedResourceIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📰';
      case 'video': return '🎥';
      case 'exercise': return '🧘';
      case 'contact': return '📞';
      default: return '📄';
    }
  };

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category).filter(Boolean)))];
  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Wellness Resources</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : (category?.charAt(0).toUpperCase() + category?.slice(1)) || 'Unknown'}
              </button>
            ))}
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No resources available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(resource.type)}</span>
                      <h3 className="font-medium text-gray-900 text-sm">{resource.title}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(resource.urgency)}`}>
                      {resource.urgency}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3">{resource.description}</p>
                  
                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {resource.url && (
                      <button 
                        onClick={() => window.open(resource.url, '_blank')}
                        className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                      >
                        Open Resource
                      </button>
                    )}
                    <button className="bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded hover:bg-gray-300 transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">
              Need immediate help?
            </p>
            <button className="w-full bg-red-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              🚨 Crisis Support Hotline
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Available 24/7 • Confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}