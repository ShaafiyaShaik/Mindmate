'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CounselorCompanionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (user.role !== 'counselor') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'counselor') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Management</h1>
        <p className="text-gray-600 mb-8">Monitor and manage student conversations</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Active Chat Sessions</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">ANON-1001</h3>
                  <p className="text-sm text-gray-600">CSE, Year 2</p>
                  <p className="text-sm text-gray-500 mt-1">Last message: 5 minutes ago</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}