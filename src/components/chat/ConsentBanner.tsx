import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConsentBanner() {
  const { user } = useAuth();
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      checkConsentStatus();
    }
  }, [user]);

  const checkConsentStatus = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const userData = await response.json();
        setHasConsent(userData.user.data_consent);
        setIsVisible(!userData.user.data_consent);
      }
    } catch (error) {
      console.error('Failed to check consent status:', error);
    }
  };

  const updateConsent = async (consent: boolean) => {
    try {
      const response = await fetch('/api/user/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent }),
      });

      if (response.ok) {
        setHasConsent(consent);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  if (!isVisible || hasConsent === null) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 text-blue-600 mt-0.5">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            Data Usage Consent
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            To provide you with personalized support and improve our services, we may analyze your conversation patterns. 
            Your identity remains anonymous and your privacy is protected. Would you like to consent to this data usage?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => updateConsent(true)}
              className="bg-blue-600 text-white text-xs py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              I Consent
            </button>
            <button
              onClick={() => updateConsent(false)}
              className="bg-white text-blue-600 border border-blue-300 text-xs py-2 px-4 rounded hover:bg-blue-50 transition-colors"
            >
              No Thanks
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-blue-600 text-xs py-2 px-2 hover:text-blue-800 transition-colors"
            >
              Remind me later
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}