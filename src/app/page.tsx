'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on role
        switch (user.role) {
          case 'student':
            router.push('/dashboard');
            break;
          case 'counselor':
            router.push('/counselor/insights');
            break;
          case 'admin':
            router.push('/admin/insights');
            break;
          default:
            router.push('/dashboard');
        }
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

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">MindMate</h1>
          <p className="text-xl text-gray-600 mb-8">AI-Powered Student Wellness Platform</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Supporting student mental health through intelligent conversation, 
            real-time monitoring, and compassionate care coordination.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition duration-200 font-medium"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Companion</h3>
            <p className="text-gray-600 text-sm">
              24/7 supportive conversations with empathetic AI that understands student challenges.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Insights</h3>
            <p className="text-gray-600 text-sm">
              Real-time wellness monitoring and personalized intervention recommendations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              Anonymous interactions with strong privacy protections and consent management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}