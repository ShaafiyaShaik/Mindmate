'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function CounselorSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-lavender-50">
      <div className="p-6">
        <div className="bg-white/70 backdrop-blur-md border border-sage-200/50 rounded-xl p-6">
          <h1 className="text-2xl font-display font-bold text-warm-gray-800 mb-4">
            Settings & Protocols (Help & SOPs)
          </h1>
          <p className="text-warm-gray-600 mb-6">
            Safety protocols, workflows, escalation steps, and contact numbers. Manage notification preferences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Emergency Procedures</h3>
              <div className="space-y-2 text-sm text-warm-gray-600">
                <p><strong>Campus Emergency:</strong> 9876543210</p>
                <p><strong>Crisis Counselor On-Call:</strong> 9876543211</p>
                <p><strong>Local Emergency Services:</strong> 108</p>
                <p><strong>Mental Health Crisis Line:</strong> 9152987821</p>
              </div>
            </div>
            
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Quick Scripts</h3>
              <div className="space-y-2 text-sm text-warm-gray-600">
                <p><em>"I'm sorry you're going through this. Would you like to set up a call?"</em></p>
                <p><em>"Thank you for sharing. Let's explore some coping strategies together."</em></p>
                <p><em>"Your feelings are valid. How can we best support you right now?"</em></p>
              </div>
            </div>
            
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-warm-gray-700">Email alerts for crisis cases</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-warm-gray-700">Web notifications for new assignments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-warm-gray-700">SMS alerts for emergencies</span>
                </label>
              </div>
            </div>
            
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Privacy & Confidentiality</h3>
              <div className="space-y-2 text-sm text-warm-gray-600">
                <p>✓ Student identity is always protected</p>
                <p>✓ Only anonymized IDs are visible</p>
                <p>✓ All actions are audit logged</p>
                <p>✓ Consent status is clearly marked</p>
              </div>
              <button className="mt-4 px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors">
                I confirm I read SOP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}