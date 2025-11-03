'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import AgentSidebar from '@/components/AgentSidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAgents, setShowAgents] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show navigation on auth pages or home page
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/';
  const shouldShowNavigation = !isAuthPage && user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MindMate...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage || !user) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-soft-blue-50 to-lavender-50">
      <div className="flex h-screen">
        {/* Agent Sidebar */}
        {shouldShowNavigation && (
          <AgentSidebar isOpen={showAgents} onClose={() => setShowAgents(false)} />
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Navigation */}
          {shouldShowNavigation && (
            <Navigation onShowAgents={() => setShowAgents(true)} />
          )}
          
          {/* Page Content */}
          <main className={`flex-1 ${shouldShowNavigation ? 'overflow-y-auto' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}