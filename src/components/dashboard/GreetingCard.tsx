interface GreetingCardProps {
  anonId: string;
  nameAlias: string;
  lastSentimentSummary: string;
}

export default function GreetingCard({ anonId, nameAlias, lastSentimentSummary }: GreetingCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xl">👋</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hi {nameAlias}! 💬</h2>
          <p className="text-sm text-gray-600">Here's how you've been doing this week</p>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">{lastSentimentSummary}</p>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Anonymous ID: {anonId}
      </div>
    </div>
  );
}