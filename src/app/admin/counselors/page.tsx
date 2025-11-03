'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminCounselorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Counselor Management</h1>
        <p className="text-gray-600 mb-8">Manage counseling staff and performance</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Active Counselors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Alice Johnson', dept: 'CSE', id: 'CN-2001', sessions: 12, rating: 4.8 },
              { name: 'Bob Smith', dept: 'All', id: 'CN-2002', sessions: 8, rating: 4.9 },
              { name: 'Maria Garcia', dept: 'ECE', id: 'CN-2003', sessions: 15, rating: 4.7 },
            ].map((counselor) => (
              <div key={counselor.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{counselor.name}</h3>
                <p className="text-sm text-gray-600">Department: {counselor.dept}</p>
                <p className="text-sm text-gray-500">ID: {counselor.id}</p>
                <div className="mt-3 flex justify-between">
                  <span className="text-sm">Sessions: {counselor.sessions}</span>
                  <span className="text-sm">Rating: ⭐ {counselor.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}