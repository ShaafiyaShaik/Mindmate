'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CounselorInsightsPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'counselor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Counselor Insights</h1>
          <p className="text-gray-600">Monitor student alerts and intervention needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">ANON-1003</span>
                  <span className="text-xs text-red-600">High Risk</span>
                </div>
                <p className="text-xs text-red-700 mt-1">Stress score: 80.1/100</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-800">ANON-1002</span>
                  <span className="text-xs text-yellow-600">Medium Risk</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Stress score: 50.8/100</p>
              </div>
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department: {user.dept}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="text-lg font-bold text-blue-600">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Alerts</span>
                <span className="text-lg font-bold text-red-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Wellness</span>
                <span className="text-lg font-bold text-green-600">72%</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm text-gray-700">New chat session started</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm text-gray-700">Stress alert triggered</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <p className="text-sm text-gray-700">Wellness plan completed</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
              Start Chat Session
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200">
              Create Wellness Plan
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}