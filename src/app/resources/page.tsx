'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ResourceSearch from '@/components/resources/ResourceSearch';
import FilterTags from '@/components/resources/FilterTags';
import ResourceGrid from '@/components/resources/ResourceGrid';
import ResourceModal from '@/components/resources/ResourceModal';
import SaveForLater from '@/components/resources/SaveForLater';

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

export default function ResourcesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'most_saved'>('relevance');
  const [resources, setResources] = useState<Resource[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<Resource[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch resources
  const fetchResources = useCallback(async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams({
        q: searchQuery,
        tags: selectedTags.join(','),
        sort: sortBy,
        page: currentPage.toString(),
        limit: '12'
      });

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (resetPage) {
          setResources(data.resources);
          setPage(1);
        } else {
          setResources(prev => [...prev, ...data.resources]);
        }
        setHasMore(data.has_more);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTags, sortBy, page]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user?.anon_id) return;
    
    try {
      const response = await fetch(`/api/resources/recommended?anon_id=${user.anon_id}&limit=6`);
      const data = await response.json();
      
      if (response.ok) {
        setRecommendedResources(data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendedResources([]);
    }
  }, [user?.anon_id]);

  // Fetch saved resources
  const fetchSavedResources = useCallback(async () => {
    if (!user?.anon_id) return;
    
    try {
      const response = await fetch(`/api/user/${user.anon_id}/resources/save`);
      const data = await response.json();
      
      if (response.ok) {
        setSavedResources(data.saved || []);
      }
    } catch (error) {
      console.error('Error fetching saved resources:', error);
      setSavedResources([]);
    }
  }, [user?.anon_id]);

  // Initial data fetch
  useEffect(() => {
    fetchResources(true);
    fetchRecommendations();
    fetchSavedResources();
  }, []);

  // Refetch when search/filter changes
  useEffect(() => {
    fetchResources(true);
  }, [searchQuery, selectedTags, sortBy]);

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
  };

  // Handle tag filter
  const handleTagToggle = (tag: string) => {
    if (tag === 'all') {
      setSelectedTags([]);
    } else {
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  // Handle resource actions
  const handleOpen = async (id: string) => {
    const resource = resources.find(r => r.id === id) || recommendedResources.find(r => r.id === id);
    if (resource) {
      setSelectedResource(resource);
      setIsModalOpen(true);
      
      // Track analytics
      if (user?.anon_id) {
        fetch(`/api/resources/${id}/track_click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anon_id: user.anon_id,
            action: 'open'
          })
        }).catch(console.error);
      }
    }
  };

  const handleSave = async (id: string) => {
    if (!user?.anon_id) return;
    
    try {
      const response = await fetch(`/api/user/${user.anon_id}/resources/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: id })
      });
      
      if (response.ok) {
        await fetchSavedResources();
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleShare = async (id: string) => {
    const resource = resources.find(r => r.id === id) || recommendedResources.find(r => r.id === id);
    if (resource) {
      const shareText = `Check out this resource: ${resource.title}`;
      const shareUrl = `${window.location.origin}/resources?id=${id}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: resource.title,
            text: shareText,
            url: shareUrl
          });
        } catch (error) {
          // Fallback to clipboard
          navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`);
          alert('Link copied to clipboard!');
        }
      } else {
        navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`);
        alert('Link copied to clipboard!');
      }
      
      // Track analytics
      if (user?.anon_id) {
        fetch(`/api/resources/${id}/track_click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anon_id: user.anon_id,
            action: 'share'
          })
        }).catch(console.error);
      }
    }
  };

  const handleRemoveSaved = async (id: string) => {
    // For now, we'll remove from local state
    // In a full implementation, you'd have a DELETE endpoint
    setSavedResources(prev => prev.filter(r => r.id !== id));
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchResources(false);
  };

  const savedResourceIds = savedResources?.map(r => r.id) || [];
  const recommendedResourceIds = recommendedResources?.map(r => r.id) || [];

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-lavender-25 to-warm-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-3">
            Resources & Recommendations
          </h1>
          <p className="text-warm-gray-600 max-w-2xl mx-auto">
            Discover university-approved resources, get personalized recommendations based on your conversations, 
            and access crisis support when you need it most.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-soft mb-8">
          <div className="space-y-6">
            {/* Search */}
            <div className="flex justify-center">
              <ResourceSearch
                value={searchQuery}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
              />
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap justify-center">
              <FilterTags
                selectedTags={selectedTags}
                onToggle={handleTagToggle}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 bg-sage-50 rounded-xl p-1">
                {[
                  { value: 'relevance', label: 'Most Relevant' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'most_saved', label: 'Most Saved' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${sortBy === option.value
                        ? 'bg-white text-soft-blue-700 shadow-soft'
                        : 'text-warm-gray-600 hover:text-warm-gray-800'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Recommended Resources */}
            {recommendedResources.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-soft-blue-500 to-lavender-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-warm-gray-900">
                    Recommended for you
                  </h2>
                  <span className="text-sm text-warm-gray-500">
                    Based on your recent chats
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {(recommendedResources || []).slice(0, 4).map((resource) => (
                    <div key={resource.id} className="transform scale-105">
                      <ResourceGrid
                        resources={[resource]}
                        savedResourceIds={savedResourceIds}
                        recommendedResourceIds={recommendedResourceIds}
                        onOpen={handleOpen}
                        onSave={handleSave}
                        onShare={handleShare}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Resources */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-warm-gray-900">
                  {searchQuery || selectedTags.length > 0 ? 'Search Results' : 'All Resources'}
                </h2>
                <span className="text-sm text-warm-gray-500">
                  {resources.length} resources found
                </span>
              </div>
              
              <ResourceGrid
                resources={resources}
                loading={loading}
                savedResourceIds={savedResourceIds}
                recommendedResourceIds={recommendedResourceIds}
                onOpen={handleOpen}
                onSave={handleSave}
                onShare={handleShare}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Resources */}
            <SaveForLater
              savedResources={savedResources}
              onOpen={handleOpen}
              onRemove={handleRemoveSaved}
            />

            {/* Help Text */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-sage-200">
              <h3 className="font-medium text-warm-gray-900 mb-2">Need immediate help?</h3>
              <p className="text-sm text-warm-gray-600 mb-3">
                Crisis support resources are marked with 🆘 and are always available.
              </p>
              <p className="text-xs text-warm-gray-500">
                All resources are university-approved and none include personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Resource Modal */}
        <ResourceModal
          resource={selectedResource}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          saved={selectedResource ? savedResourceIds.includes(selectedResource.id) : false}
          onSave={handleSave}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}