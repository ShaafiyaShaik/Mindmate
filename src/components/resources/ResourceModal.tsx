'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  ShareIcon,
  DocumentTextIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

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
}

interface ResourceModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  saved?: boolean;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function ResourceModal({
  resource,
  isOpen,
  onClose,
  saved = false,
  onSave,
  onShare
}: ResourceModalProps) {
  if (!resource) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(resource.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(resource.id);
    }
  };

  const handleOpenExternal = () => {
    // Prefer opening the internal resource detail page which verifies local files and provides
    // fallback external links. Only open the raw resource.url directly for external http(s) links.
    try {
      const isLocalStatic = resource.url && String(resource.url).startsWith('/static/resources/');
      if (resource.id && isLocalStatic) {
        window.open(`${window.location.origin}/resources/${resource.id}`, '_blank', 'noopener,noreferrer');
        return;
      }

      if (resource.url && /^https?:\/\//.test(String(resource.url))) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Fallback to internal resource page if no direct external URL is safe
      if (resource.id) {
        window.open(`${window.location.origin}/resources/${resource.id}`, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error('Failed to open resource URL', e);
    }
  };

  const renderContent = () => {
    const isLocalStatic = resource.url && String(resource.url).startsWith('/static/resources/');

    // For PDFs that are local static paths, avoid embedding directly in iframe because the file
    // may not exist in development. Instead, provide a button to open the internal resource page
    // which performs a server-side check and provides fallback links.
    if (resource.type === 'pdf' && resource.url) {
      if (isLocalStatic) {
        return (
          <div className="w-full h-[300px] bg-sage-50 rounded-lg p-6 flex flex-col items-center justify-center">
            <p className="text-warm-gray-600 mb-4 text-center">This PDF is served from the project's static files. If the file is missing you'll see alternatives on the resource page.</p>
            <div className="space-x-2">
              <button
                onClick={() => window.open(`${window.location.origin}/resources/${resource.id}`, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-soft-blue-500 hover:bg-soft-blue-600 text-white rounded-xl font-medium"
              >
                <span>Open resource page</span>
              </button>
            </div>
          </div>
        );
      }

      // If URL is external (http/https) embed PDF
      if (/^https?:\/\//.test(String(resource.url))) {
        return (
          <div className="w-full h-[600px] bg-white rounded-lg overflow-hidden">
            <iframe
              src={`${resource.url}#view=FitH`}
              className="w-full h-full border-0"
              title={resource.title}
            />
          </div>
        );
      }

      // Fallback: show link
      return (
        <div className="bg-sage-50 rounded-lg p-6 text-center">
          <p className="text-warm-gray-600 mb-4">Preview not available in the modal.</p>
          {resource.url && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-soft-blue-600">Open resource</a>
          )}
        </div>
      );
    }

    if (resource.type === 'video' && resource.url) {
      // Only embed http(s) video URLs. If it's not an external URL, open resource page.
      if (/^https?:\/\//.test(String(resource.url))) {
        return (
          <div className="w-full h-[400px] bg-black rounded-lg overflow-hidden">
            <iframe
              src={resource.url}
              className="w-full h-full border-0"
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      return (
        <div className="bg-sage-50 rounded-lg p-6 text-center">
          <p className="text-warm-gray-600 mb-4">This video link is handled externally.</p>
          <button onClick={() => window.open(`${window.location.origin}/resources/${resource.id}`, '_blank', 'noopener,noreferrer')} className="inline-flex items-center space-x-2 px-6 py-3 bg-soft-blue-500 text-white rounded-xl">Open resource page</button>
        </div>
      );
    }

    if (resource.type === 'workshop') {
      return (
        <div className="bg-sage-50 rounded-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
          <h3 className="text-lg font-semibold text-warm-gray-900 mb-2">
            Workshop Registration
          </h3>
          <p className="text-warm-gray-600 mb-4">
            {resource.description}
          </p>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center space-x-2 px-6 py-3
                bg-green-500 hover:bg-green-600 text-white
                rounded-xl font-medium
                transition-colors duration-200
              "
            >
              <span>Register for Workshop</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      );
    }

    if (resource.type === 'hotline') {
      return (
        <div className="bg-orange-50 rounded-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📞</span>
          </div>
          <h3 className="text-lg font-semibold text-warm-gray-900 mb-2">
            Crisis Support Hotline
          </h3>
          <p className="text-warm-gray-600 mb-4">
            {resource.description}
          </p>
          {resource.hotline_number && (
            <div className="space-y-3">
              <div className="text-2xl font-bold text-orange-700">
                {resource.hotline_number}
              </div>
              <div className="flex justify-center space-x-3">
                <a
                  href={`tel:${resource.hotline_number}`}
                  className="
                    flex items-center space-x-2 px-4 py-2
                    bg-orange-500 hover:bg-orange-600 text-white
                    rounded-xl font-medium
                    transition-colors duration-200
                  "
                >
                  <span>Call Now</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(resource.hotline_number || '');
                    alert('Phone number copied to clipboard');
                  }}
                  className="
                    px-4 py-2 bg-white border border-orange-200
                    text-orange-700 hover:bg-orange-50
                    rounded-xl font-medium
                    transition-colors duration-200
                  "
                >
                  Copy Number
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback content
    return (
      <div className="bg-sage-50 rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-sage-100 rounded-full flex items-center justify-center">
          {resource.type === 'pdf' ? (
            <DocumentTextIcon className="w-8 h-8 text-sage-600" />
          ) : (
            <VideoCameraIcon className="w-8 h-8 text-sage-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-warm-gray-900 mb-2">
          Resource Preview
        </h3>
        <p className="text-warm-gray-600 mb-4">
          {resource.description}
        </p>
        {resource.url && (
          <button
            onClick={handleOpenExternal}
            className="
              inline-flex items-center space-x-2 px-6 py-3
              bg-soft-blue-500 hover:bg-soft-blue-600 text-white
              rounded-xl font-medium
              transition-colors duration-200
            "
          >
            <span>Open Resource</span>
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-display font-bold text-warm-gray-900 leading-tight mb-2"
                    >
                      {resource.title}
                    </Dialog.Title>
                    <div className="flex items-center space-x-4 text-sm text-warm-gray-500">
                      <span className="capitalize">{resource.type}</span>
                      {resource.approved_by && (
                        <>
                          <span>•</span>
                          <span>Approved by {resource.approved_by}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {resource.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-md capitalize"
                          >
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {onSave && (
                      <button
                        onClick={handleSave}
                        className="
                          p-2 text-warm-gray-400 hover:text-soft-blue-600
                          hover:bg-soft-blue-50 rounded-lg
                          transition-all duration-200
                        "
                        aria-label={saved ? 'Remove from saved' : 'Save resource'}
                      >
                        {saved ? (
                          <BookmarkSolidIcon className="w-5 h-5 text-soft-blue-600" />
                        ) : (
                          <BookmarkIcon className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    {onShare && (
                      <button
                        onClick={handleShare}
                        className="
                          p-2 text-warm-gray-400 hover:text-warm-gray-600
                          hover:bg-warm-gray-50 rounded-lg
                          transition-all duration-200
                        "
                        aria-label="Share resource"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                    )}

                    {resource.url && (
                      <button
                        onClick={handleOpenExternal}
                        className="
                          p-2 text-warm-gray-400 hover:text-warm-gray-600
                          hover:bg-warm-gray-50 rounded-lg
                          transition-all duration-200
                        "
                        aria-label="Open in new tab"
                      >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="
                        p-2 text-warm-gray-400 hover:text-warm-gray-600
                        hover:bg-warm-gray-50 rounded-lg
                        transition-all duration-200
                      "
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  {renderContent()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-sage-100">
                  <p className="text-sm text-warm-gray-600">
                    {resource.description}
                  </p>
                  <div className="text-xs text-warm-gray-400">
                    All resources are university-approved. None include personal data.
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}