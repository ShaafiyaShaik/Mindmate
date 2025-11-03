import { useState } from 'react';

interface Message {
  id: string;
  sender: 'student' | 'mindmate' | 'counselor';
  text: string;
  timestamp: string;
  metadata?: {
    stress_score?: number;
    detected_keywords?: string[];
    tags?: string[];
    agent_response?: boolean;
    intent?: string;
    confidence?: number;
    processing_agents?: string[];
    suggested_resource_ids?: string[];
    escalation_required?: boolean;
  };
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showMetadata, setShowMetadata] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStressColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStressLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const isStudent = message.sender === 'student';
  const isCounselor = message.sender === 'counselor';

  return (
    <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isStudent ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-2xl`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isStudent ? 'bg-blue-100 ml-3' : 
          isCounselor ? 'bg-purple-100 mr-3' : 'bg-green-100 mr-3'
        }`}>
          <span className="text-sm">
            {isStudent ? '👤' : isCounselor ? '🎓' : '🤖'}
          </span>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}>
          <div 
            className={`rounded-lg p-3 shadow-sm cursor-pointer ${
              isStudent ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
            }`}
            onClick={() => setShowMetadata(!showMetadata)}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            
            {/* Timestamp */}
            <p className={`text-xs mt-2 ${
              isStudent ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>

          {/* Metadata Panel */}
          {showMetadata && message.metadata && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs border max-w-sm">
              <div className="space-y-2">
                {message.metadata.stress_score !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stress Level:</span>
                    <span className={`font-medium ${getStressColor(message.metadata.stress_score)}`}>
                      {getStressLabel(message.metadata.stress_score)} ({message.metadata.stress_score}/100)
                    </span>
                  </div>
                )}

                {message.metadata.intent && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intent:</span>
                    <span className="font-medium">{message.metadata.intent}</span>
                  </div>
                )}

                {message.metadata.confidence && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{Math.round(message.metadata.confidence * 100)}%</span>
                  </div>
                )}

                {message.metadata.detected_keywords && message.metadata.detected_keywords.length > 0 && (
                  <div>
                    <span className="text-gray-600">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.metadata.detected_keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {message.metadata.tags && message.metadata.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.metadata.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {message.metadata.processing_agents && message.metadata.processing_agents.length > 0 && (
                  <div>
                    <span className="text-gray-600">Processed by:</span>
                    <div className="text-gray-800 mt-1">
                      {message.metadata.processing_agents.join(', ')}
                    </div>
                  </div>
                )}

                {message.metadata.escalation_required && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                    <span className="text-red-800 font-medium">⚠️ Escalation Required</span>
                    <p className="text-red-700 text-xs mt-1">This message may require counselor attention</p>
                  </div>
                )}

                {message.metadata.suggested_resource_ids && message.metadata.suggested_resource_ids.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <span className="text-blue-800 font-medium">💡 Resources Available</span>
                    <p className="text-blue-700 text-xs mt-1">
                      {message.metadata.suggested_resource_ids.length} suggested resource{message.metadata.suggested_resource_ids.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}