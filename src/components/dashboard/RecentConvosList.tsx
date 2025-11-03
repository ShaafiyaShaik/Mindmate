interface Conversation {
  conv_id: string;
  title: string;
  last_snippet: string;
  last_score: number;
  timestamp: string;
}

interface RecentConvosListProps {
  conversations: Conversation[];
}

export default function RecentConvosList({ conversations }: RecentConvosListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  const getMoodColor = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleConversationClick = (convId: string) => {
    // TODO: Navigate to conversation detail
    console.log('Opening conversation:', convId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
        <span className="text-sm text-gray-500">{conversations.length} total</span>
      </div>
      
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start your first chat to see it here</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.conv_id}
              onClick={() => handleConversationClick(conv.conv_id)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {conv.title}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(conv.last_score)}`}>
                  {conv.last_score}/100
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {conv.last_snippet}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{formatTime(conv.timestamp)}</span>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Continue →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {conversations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Conversations
          </button>
        </div>
      )}
    </div>
  );
}