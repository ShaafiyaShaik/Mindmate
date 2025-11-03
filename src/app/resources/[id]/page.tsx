'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

interface Props {
  params: { id: string };
}

export default function ResourcePage({ params }: Props) {
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`/api/resources/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setResource(data);
        } else if (response.status === 404) {
          setError('Resource not found');
        } else {
          setError('Failed to load resource');
        }
      } catch (err) {
        setError('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResource();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-600 mb-4">
            {error || "Looks like you've followed a broken link or entered a URL that doesn't exist on this site."}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            If this is your site, and you weren't expecting a 404 for this path, please visit Netlify's "page not found" support guide for troubleshooting tips.
          </p>
          <button
            onClick={() => router.push('/resources')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    if (resource.hotline_number) {
      window.open(`tel:${resource.hotline_number}`, '_self');
    }
  };

  const handleOpen = () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Resource Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                <p className="text-lg text-gray-600 capitalize">{resource.type}</p>
                {resource.approved_by && (
                  <p className="text-sm text-gray-500 mt-1">• Approved by {resource.approved_by}</p>
                )}
              </div>
              {resource.popularity && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{resource.popularity}</p>
                  <p className="text-sm text-gray-500">views</p>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed">{resource.description}</p>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {resource.is_hotline ? (
                <button
                  onClick={handleCall}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call {resource.hotline_number}</span>
                </button>
              ) : (
                <button
                  onClick={handleOpen}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open Resource</span>
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                All resources are university-approved. None include personal data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
