import { useState } from 'react';

interface ConsentToggleProps {
  consent: string;
  onToggle: (newConsent: string) => void;
}

export default function ConsentToggle({ consent, onToggle }: ConsentToggleProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleToggle = () => {
    const newConsent = consent === 'ON' ? 'OFF' : 'ON';
    onToggle(newConsent);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">Share Alerts</span>
        
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            consent === 'ON' ? 'bg-green-600' : 'bg-gray-300'
          }`}
          aria-label={`Toggle consent: currently ${consent}`}
          aria-pressed={consent === 'ON'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              consent === 'ON' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        <button
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Learn more about consent settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Tooltip */}
      {isTooltipVisible && (
        <div className="absolute right-0 top-8 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50">
          <div className="mb-2 font-medium">What is stored:</div>
          <ul className="space-y-1 text-gray-300">
            <li>• Anonymous stress scores</li>
            <li>• Conversation sentiment (not content)</li>
            <li>• Alert triggers for counselor support</li>
            <li>• No personally identifiable information</li>
          </ul>
          <div className="mt-2 text-gray-400">
            When ON: Alerts sent to counselors for high stress. When OFF: No alerts shared.
          </div>
          
          {/* Arrow */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}

      {/* Status indicator */}
      <div className={`mt-1 text-xs ${consent === 'ON' ? 'text-green-600' : 'text-gray-500'}`}>
        {consent === 'ON' ? 'Alerts enabled' : 'Alerts disabled'}
      </div>
    </div>
  );
}