'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function RelayPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-lavender-50">
      <div className="p-6">
        <div className="bg-white/70 backdrop-blur-md border border-sage-200/50 rounded-xl p-6">
          <h1 className="text-2xl font-display font-bold text-warm-gray-800 mb-4">
            Relay Chat / Case Conversation View
          </h1>
          <p className="text-warm-gray-600 mb-6">
            Full chat view for live or asynchronous exchanges between counselor and student while preserving anonymity.
          </p>
          
          <div className="bg-lavender-50 border border-lavender-200 rounded-lg p-8 text-center">
            <div className="text-lavender-600 text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-warm-gray-800 mb-2">Coming Soon</h3>
            <p className="text-warm-gray-600">
              This page will provide anonymous chat interface with students, quick reply templates, and resource sharing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}