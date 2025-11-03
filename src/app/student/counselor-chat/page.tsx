'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CounselorChats from '@/components/student/CounselorChats';

export default function CounselorChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'student') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-warm-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <div className="bg-white border-b border-sage-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/student')}
              className="text-warm-gray-500 hover:text-warm-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-warm-gray-900">
                Counselor Support
              </h1>
              <p className="text-sm text-warm-gray-500">
                Private conversations with your counselors
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-warm-gray-600">#{user.anon_id}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-warm-gray-500 hover:text-warm-gray-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <CounselorChats />
      </div>
    </div>
  );
}