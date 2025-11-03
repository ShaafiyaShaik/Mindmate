'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import RelayChat from '@/components/counselor/RelayChat';

export default function RelayChatPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = searchParams.get('caseId');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && user.role !== 'counselor' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleBack = () => {
    router.push('/counselor/cases');
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-warm-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'counselor' && user.role !== 'admin')) {
    return null;
  }

  if (!caseId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-warm-gray-800 mb-2">
            No Case Selected
          </h1>
          <p className="text-warm-gray-600 mb-4">
            Please select a case to start chatting.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  return <RelayChat caseId={caseId} onBack={handleBack} />;
}