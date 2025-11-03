'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'student' | 'counselor' | 'assistant';
  is_original?: boolean;
  resource_id?: string;
}

interface CaseInfo {
  id: string;
  anon_id: string;
  conversation_id: string;
  status: string;
  priority: string;
  stress_score: number;
  tags: string[];
}

interface RelayChatProps {
  caseId: string;
  onBack: () => void;
}

export default function RelayChat({ caseId, onBack }: RelayChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Quick reply templates
  const quickReplies = [
    "I'm sorry you're going through this. Would you like to set up a call to talk more?",
    "Thank you for sharing that with me. How can I best support you right now?",
    "I understand this is difficult. Would it help to explore some coping strategies together?",
    "Your feelings are valid. Let's work through this step by step.",
    "I'm here to listen and support you. Take your time sharing what you're comfortable with."
  ];

  useEffect(() => {
    fetchMessages();
    
    // Refresh messages every 3 seconds for real-time chat
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCaseInfo(data.case_info);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          type: 'counselor'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(); // Refresh to show new message
      } else {
        const error = await response.json();
        alert(`Failed to send message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crisis': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-warm-gray-600">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-sage-50">
      {/* Left: Case info and back button */}
      <div className="w-80 bg-white border-r border-sage-200 p-6">
        <button
          onClick={onBack}
          className="flex items-center text-soft-blue-600 hover:text-soft-blue-700 mb-6"
        >
          ← Back to Cases
        </button>
        
        {caseInfo && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-warm-gray-800">
                {caseInfo.anon_id}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm font-medium ${getPriorityColor(caseInfo.priority)}`}>
                  {caseInfo.priority.toUpperCase()}
                </span>
                <span className="text-sm text-warm-gray-500">
                  {caseInfo.status}
                </span>
              </div>
            </div>
            
            <div className="bg-lavender-50 rounded-lg p-4">
              <h3 className="font-medium text-warm-gray-800 mb-2">Context</h3>
              <div className="text-sm text-warm-gray-600 space-y-1">
                <p><strong>Stress Level:</strong> {caseInfo.stress_score}/100</p>
                <p><strong>Tags:</strong> {caseInfo.tags.join(', ')}</p>
                <p><strong>Case ID:</strong> {caseInfo.id}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-warm-gray-800 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-red-600 hover:bg-red-50 p-2 rounded">
                  🚨 Emergency Services
                </button>
                <button className="w-full text-left text-sm text-soft-blue-600 hover:bg-soft-blue-50 p-2 rounded">
                  📅 Schedule Appointment
                </button>
                <button className="w-full text-left text-sm text-purple-600 hover:bg-purple-50 p-2 rounded">
                  📚 Share Resources
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle: Chat conversation */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white border-b border-sage-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-warm-gray-800">
                Conversation with {caseInfo?.anon_id}
              </h1>
              <p className="text-sm text-warm-gray-600">
                Anonymous, secure messaging
              </p>
            </div>
            {isTyping && (
              <div className="text-sm text-soft-blue-600">
                Counselor is typing...
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'counselor' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'counselor'
                    ? 'bg-soft-blue-600 text-white'
                    : message.type === 'student'
                    ? 'bg-white border border-sage-200 text-warm-gray-800'
                    : 'bg-lavender-100 text-warm-gray-700'
                }`}
              >
                <div className="text-sm">
                  {message.type === 'counselor' && (
                    <div className="text-xs opacity-90 mb-1">
                      Counselor (anonymous)
                    </div>
                  )}
                  {message.type === 'student' && (
                    <div className="text-xs text-warm-gray-500 mb-1">
                      {caseInfo?.anon_id}
                      {message.is_original && (
                        <span className="ml-2 text-amber-600">
                          (Original message)
                        </span>
                      )}
                    </div>
                  )}
                  {message.type === 'assistant' && (
                    <div className="text-xs text-warm-gray-500 mb-1">
                      AI Assistant
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="bg-white border-t border-sage-200 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to the student..."
                className="w-full resize-none border border-sage-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                rows={3}
                disabled={sending}
              />
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-2 text-sm text-warm-gray-600 hover:text-warm-gray-800 border border-sage-300 rounded-lg"
            >
              Preview
            </button>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          {showPreview && newMessage.trim() && (
            <div className="mt-3 p-3 bg-sage-50 rounded-lg border border-sage-200">
              <div className="text-xs text-warm-gray-600 mb-1">
                Student will see:
              </div>
              <div className="text-sm text-warm-gray-800">
                <strong>Counselor (anonymous):</strong> {newMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick replies and tools */}
      <div className="w-80 bg-white border-l border-sage-200 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-warm-gray-800 mb-3">Quick Replies</h3>
            <div className="space-y-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setNewMessage(reply)}
                  className="w-full text-left text-sm text-warm-gray-700 hover:bg-sage-50 p-2 rounded border border-sage-200"
                >
                  "{reply}"
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-warm-gray-800 mb-3">Analysis</h3>
            <div className="bg-lavender-50 rounded-lg p-3">
              <div className="text-sm text-warm-gray-600 space-y-1">
                <p><strong>Current Stress:</strong> {caseInfo?.stress_score}/100</p>
                <p><strong>Risk Level:</strong> <span className={getPriorityColor(caseInfo?.priority || 'low')}>{caseInfo?.priority}</span></p>
                <p><strong>Active Tags:</strong> {caseInfo?.tags.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}