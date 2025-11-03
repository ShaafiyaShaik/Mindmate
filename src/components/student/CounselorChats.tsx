'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CounselorMessage {
  id: string;
  sender: 'student' | 'counselor';
  content: string;
  timestamp: string;
  read_by_student?: boolean;
  read_by_counselor?: boolean;
}

interface CounselorChat {
  id: string;
  counselor_id: string;
  title: string;
  created_at: string;
  last_message: string;
  last_activity: string;
  unread_count: number;
  status: string;
}

export default function CounselorChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<CounselorChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<CounselorMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCounselorChats();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchCounselorChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat);
      
      // Refresh messages every 3 seconds when chat is open
      const interval = setInterval(() => fetchChatMessages(selectedChat), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCounselorChats = async () => {
    try {
      const response = await fetch('/api/chat/counselor');
      if (response.ok) {
        const data = await response.json();
        setChats(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching counselor chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/counselor/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);

    try {
      const response = await fetch(`/api/chat/counselor/${selectedChat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim()
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchChatMessages(selectedChat);
        await fetchCounselorChats(); // Update chat list
      } else {
        const error = await response.json();
        alert(`Failed to send message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-warm-gray-600">Loading counselor chats...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-soft-blue-600 to-lavender-600 text-white p-6">
          <h1 className="text-2xl font-bold">Counselor Support</h1>
          <p className="text-soft-blue-100 mt-2">
            Private, secure conversations with your assigned counselors
          </p>
        </div>

        <div className="flex h-96">
          {/* Chat List */}
          <div className="w-1/3 border-r border-sage-200 bg-sage-50">
            <div className="p-4 border-b border-sage-200">
              <h2 className="font-semibold text-warm-gray-800">Your Counselor Chats</h2>
            </div>
            
            <div className="overflow-y-auto h-full">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-warm-gray-500">
                  <p>No counselor conversations yet.</p>
                  <p className="text-sm mt-2">
                    A counselor will start a chat with you when you need support.
                  </p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 border-b border-sage-200 cursor-pointer hover:bg-white transition-colors ${
                      selectedChat === chat.id ? 'bg-white border-l-4 border-l-soft-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-warm-gray-800">{chat.title}</h3>
                      {chat.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-warm-gray-600 truncate">
                      {chat.last_message}
                    </p>
                    <p className="text-xs text-warm-gray-500 mt-1">
                      {formatTimestamp(chat.last_activity)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-sage-200 bg-white">
                  <h3 className="font-semibold text-warm-gray-800">
                    Anonymous Counselor
                  </h3>
                  <p className="text-sm text-warm-gray-600">
                    Secure, confidential support
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sage-25">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'student' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'student'
                            ? 'bg-soft-blue-600 text-white'
                            : 'bg-white border border-sage-200 text-warm-gray-800 shadow-sm'
                        }`}
                      >
                        <div className="text-sm">
                          {message.sender === 'counselor' && (
                            <div className="text-xs text-warm-gray-500 mb-1">
                              Counselor
                            </div>
                          )}
                          <div>{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.sender === 'student' ? 'text-soft-blue-100' : 'text-warm-gray-500'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-sage-200">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message to the counselor..."
                        className="w-full resize-none border border-sage-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                        rows={2}
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-sage-25">
                <div className="text-center text-warm-gray-500">
                  <p className="text-lg mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a counselor chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}