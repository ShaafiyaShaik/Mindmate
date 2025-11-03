import { useState } from 'react';

interface Conversation {
  conversation_id: string;
  title: string;
  last_message: string;
  last_snippet: string;
  mood_pulse: 'green' | 'yellow' | 'red';
  timestamp: string;
  unread: boolean;
  last_stress_score: number;
}

interface ConversationsListProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onSelect: (conversationId: string) => void;
}

export default function ConversationsList({ 
  conversations, 
  currentConversation, 
  onSelect 
}: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'green': return 'bg-green-400';
      case 'yellow': return 'bg-yellow-400';
      case 'red': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredConversations.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No conversations yet</p>
          <p className="text-xs text-gray-400 mt-1">Start a new chat to get support</p>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.conversation_id}
              onClick={() => onSelect(conversation.conversation_id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversation === conversation.conversation_id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm truncate flex-1">
                  {conversation.title}
                </h3>
                <div className="flex items-center space-x-2 ml-2">
                  <div className={`w-2 h-2 rounded-full ${getMoodColor(conversation.mood_pulse)}`} />
                  {conversation.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {conversation.last_snippet}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {formatTimestamp(conversation.timestamp)}
                </span>
                <div className="flex items-center space-x-1">
                  {conversation.last_stress_score > 70 && (
                    <div className="text-xs text-red-500 font-medium">
                      High stress
                    </div>
                  )}
                  {conversation.last_stress_score > 40 && conversation.last_stress_score <= 70 && (
                    <div className="text-xs text-yellow-500 font-medium">
                      Moderate
                    </div>
                  )}
                  {conversation.last_stress_score <= 40 && (
                    <div className="text-xs text-green-500 font-medium">
                      Low stress
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}