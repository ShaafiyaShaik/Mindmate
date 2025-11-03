'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CounselorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to alerts page as the default counselor landing
    router.push('/counselor/alerts');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-lavender-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-blue-600 mx-auto"></div>
        <p className="mt-4 text-warm-gray-600">Redirecting to alerts...</p>
      </div>
    </div>
  );
}