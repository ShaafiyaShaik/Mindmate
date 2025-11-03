import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MessageBubble from './MessageBubble';
import ActivityStrip from './ActivityStrip';
import InputBar from './InputBar';
import ResourceSuggestion from './ResourceSuggestion';
import CounselorEscalationModal from './CounselorEscalationModal';

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

interface ChatPaneProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentConversation: string | null;
  onNewChat: () => void;
}

export default function ChatPane({ 
  messages, 
  onSendMessage, 
  currentConversation, 
  onNewChat 
}: ChatPaneProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationData, setEscalationData] = useState<{
    stressLevel: number;
    summary: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for escalation triggers
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.metadata?.escalation_required && lastMessage.sender === 'mindmate') {
      const stressScore = lastMessage.metadata.stress_score || 50;
      if (stressScore >= 75) {
        setEscalationData({
          stressLevel: stressScore,
          summary: messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n')
        });
        setShowEscalationModal(true);
      }
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    setIsTyping(true);
    try {
      // Wait until the parent has finished sending and appended the AI response
      await onSendMessage(text);
    } finally {
      // Stop typing indicator immediately after the response flow completes
      setIsTyping(false);
    }
  };

  const handleResourceOpen = (resourceId: string) => {
    router.push(`/resources?id=${resourceId}`);
  };

  const handleSendToCounselor = async (message?: string) => {
    try {
      const response = await fetch('/api/counselor/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: currentConversation,
          message: message || escalationData?.summary || 'Student requested counselor assistance',
          stress_level: escalationData?.stressLevel || 75,
          type: 'student_request'
        })
      });

      if (response.ok) {
        alert('🚨 Your request has been sent to a counselor. They will reach out to you soon.\n\nIf this is an emergency, please call the crisis hotline immediately.');
        setShowEscalationModal(false);
        setEscalationData(null);
      } else {
        throw new Error('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending to counselor:', error);
      alert('There was an error sending your message. Please try calling the crisis hotline: 9152987821');
    }
  };

  const handleManualRequestHelp = () => {
    const recentMessages = messages.slice(-3);
    const summary = recentMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    setEscalationData({
      stressLevel: 75, // Default stress level for manual requests
      summary: summary || 'Student manually requested counselor assistance'
    });
    setShowEscalationModal(true);
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Welcome to MindMate</h3>
          <p className="text-gray-600 mb-6">
            Your supportive AI companion is here to listen and help you navigate your wellness journey.
          </p>
          <button
            onClick={onNewChat}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start New Conversation
          </button>
          
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-sm">😊</span>
              </div>
              <span className="text-xs text-gray-600">Feeling good</span>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600 text-sm">😐</span>
              </div>
              <span className="text-xs text-gray-600">Neutral</span>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 text-sm">😟</span>
              </div>
              <span className="text-xs text-gray-600">Struggling</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header with Help Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">MindMate</h3>
            <p className="text-xs text-gray-500">Your wellness companion</p>
          </div>
        </div>
        
        {/* Help Button */}
        {currentConversation && (
          <button
            onClick={handleManualRequestHelp}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
            title="Request counselor assistance"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Need Help?</span>
          </button>
        )}
      </div>

      {/* Activity Strip */}
      <ActivityStrip isTyping={isTyping} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">New Conversation</h3>
            <p className="text-gray-600 text-sm">How are you feeling today? I'm here to listen and support you.</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={message.id}>
                <MessageBubble message={message} />
                
                {/* Show resource suggestions after MindMate responses */}
                {message.sender === 'mindmate' && 
                 message.metadata?.suggested_resource_ids && 
                 message.metadata.suggested_resource_ids.length > 0 && (
                  <ResourceSuggestion
                    resourceIds={message.metadata.suggested_resource_ids}
                    onResourceOpen={handleResourceOpen}
                    className="mt-3 ml-11"
                  />
                )}
              </div>
            ))}
          </>
        )}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">🤖</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <InputBar onSendMessage={handleSendMessage} disabled={isTyping} />

      {/* Counselor Escalation Modal */}
      {escalationData && (
        <CounselorEscalationModal
          isOpen={showEscalationModal}
          onClose={() => setShowEscalationModal(false)}
          onSendToCounselor={handleSendToCounselor}
          stressLevel={escalationData.stressLevel}
          conversationSummary={escalationData.summary}
        />
      )}
    </div>
  );
}