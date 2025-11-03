import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const handleStartChat = () => {
    // TODO: Create new conversation and navigate to chat
    router.push('/student');
  };

  const handleReviewResources = () => {
    // TODO: Navigate to resources page
    console.log('Opening resources...');
  };

  const handleExportSummary = () => {
    // TODO: Generate and download mood summary
    alert('Mood summary export feature coming soon!');
  };

  const handleResetHistory = () => {
    // TODO: Show confirmation dialog and reset history
    if (confirm('Are you sure you want to reset your conversation history? This action cannot be undone.')) {
      alert('History reset feature coming soon!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleStartChat}
          className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
          aria-label="Start a new chat conversation"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">💬</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-blue-900">Start New Chat</div>
            <div className="text-xs text-blue-700">Begin conversation</div>
          </div>
        </button>

        <button
          onClick={handleReviewResources}
          className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200"
          aria-label="Review wellness resources"
        >
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📚</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-green-900">Review Resources</div>
            <div className="text-xs text-green-700">Wellness materials</div>
          </div>
        </button>

        <button
          onClick={handleExportSummary}
          className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200"
          aria-label="Export mood summary"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-purple-900">Export Summary</div>
            <div className="text-xs text-purple-700">Download data</div>
          </div>
        </button>

        <button
          onClick={handleResetHistory}
          className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors duration-200"
          aria-label="Reset conversation history"
        >
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🗑️</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-red-900">Reset History</div>
            <div className="text-xs text-red-700">Clear all data</div>
          </div>
        </button>
      </div>
    </div>
  );
}