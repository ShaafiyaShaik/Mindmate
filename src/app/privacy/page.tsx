'use client';

export default function PrivacyPage() {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Privacy & About</h1>
        <p className="text-green-100 mt-1">Privacy-first design & ethical AI principles</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Privacy Statement */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔒 Privacy First</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>MindMate keeps your conversations completely private.</strong> We believe that mental 
              health support requires absolute trust, which is why privacy is built into every aspect of our system.
            </p>
            <p>
              Your personal conversations, mood data, and wellness information are never shared with 
              counselors, administrators, or anyone else unless you explicitly consent. Even then, 
              only anonymized summaries are provided to protect your identity.
            </p>
            <p>
              All analytics shown to institutions are fully anonymized and aggregated at the department 
              level. Individual students cannot be identified from dashboard data.
            </p>
          </div>
        </div>

        {/* Consent Control */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🤝 You Control Your Data</h3>
          <div className="text-blue-700 space-y-3">
            <p>
              <strong>Consent Toggle:</strong> You have complete control over whether your wellness insights 
              are shared with counselors. This can be turned on or off at any time in the Student Companion.
            </p>
            <p>
              <strong>Anonymous Support:</strong> Even when consent is enabled, counselors only see anonymized 
              risk indicators like "ANON-012 (ENG Yr1) - High stress detected" without any personal details.
            </p>
            <p>
              <strong>Opt-in Communication:</strong> If you want to connect with a counselor, you can choose 
              to reveal your contact information through a secure, encrypted channel.
            </p>
          </div>
        </div>

        {/* Technical Safeguards */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🛡️ Technical Safeguards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Data Protection</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• End-to-end encryption for all conversations</li>
                <li>• Anonymized identifiers (ANON-XXX) for all records</li>
                <li>• Local data processing where possible</li>
                <li>• Secure cloud storage with access controls</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Access Controls</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Role-based permissions for staff access</li>
                <li>• Audit logs for all data access</li>
                <li>• Time-limited counselor alerts</li>
                <li>• Student-controlled data retention</li>
              </ul>
            </div>
          </div>
        </div>

        {/* About the Project */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 About MindMate</h3>
          <div className="text-gray-700 space-y-4">
            <p>
              MindMate is an AI-powered Student Counseling & Well-being Platform designed for colleges 
              and universities. It combines empathetic AI conversation with institutional analytics to 
              create a comprehensive mental health support system.
            </p>
            <p>
              This platform demonstrates how modern AI can be used ethically to support student well-being 
              while maintaining strict privacy standards. It was built for a college hackathon to showcase 
              responsible AI development in education.
            </p>
            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-800 mb-2">🎯 Core Mission</h4>
              <p className="text-blue-700 text-sm">
                "To create technology that genuinely helps students thrive academically and emotionally, 
                while respecting their privacy and autonomy at every step."
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Agent Architecture */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 AI Agent Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <h5 className="font-medium text-blue-800">Data Observer Agent</h5>
                <p className="text-xs text-blue-600">Collects behavioral patterns securely</p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <h5 className="font-medium text-green-800">Mood Analyzer Agent</h5>
                <p className="text-xs text-green-600">Detects emotional states using NLP</p>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <h5 className="font-medium text-purple-800">Wellness Planner Agent</h5>
                <p className="text-xs text-purple-600">Suggests personalized interventions</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <h5 className="font-medium text-orange-800">Counselor Interface Agent</h5>
                <p className="text-xs text-orange-600">Manages anonymous alert system</p>
              </div>
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <h5 className="font-medium text-red-800">Institutional Insights Agent</h5>
                <p className="text-xs text-red-600">Builds predictive campus models</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">💚 Support & Emergency</h3>
          <div className="text-green-700 space-y-2">
            <p>
              <strong>If you're in immediate danger:</strong> Please contact emergency services (911) 
              or your local crisis hotline immediately.
            </p>
            <p>
              <strong>For non-emergency support:</strong> MindMate can help connect you with campus 
              counselors anonymously, or you can reach out to student services directly.
            </p>
            <p className="text-sm text-green-600">
              Remember: This AI system is designed to support, not replace, professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}