'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ConversationsList from '@/components/chat/ConversationsList';
import ChatPane from '@/components/chat/ChatPane';
import ResourceDrawer from '@/components/chat/ResourceDrawer';
import ConsentBanner from '@/components/chat/ConsentBanner';

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

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);
  const [suggestedResources, setSuggestedResources] = useState<string[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (user.role !== 'student') {
        router.push('/dashboard');
        return;
      }
      
      loadConversations();
      
      // Check if there's a conversation ID in the URL
      const convId = searchParams.get('conversation');
      if (convId) {
        setCurrentConversation(convId);
        loadConversation(convId);
      }
    }
  }, [user, loading, router, searchParams]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/chat/list?anon_id=${user?.anon_id}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setConversationTitle(data.title);
        setCurrentConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/chat/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anon_id: user?.anon_id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation_id);
        setMessages([]);
        setConversationTitle(data.title);
        // Refresh conversations list
        loadConversations();
        // Update URL
        router.push(`/student?conversation=${data.conversation_id}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!currentConversation || !user) return;

    // Optimistically show the student's message immediately
    const localId = `local_${Date.now()}`;
    const localMessage: Message = {
      id: localId,
      sender: 'student',
      text,
      timestamp: new Date().toISOString(),
      metadata: {}
    };

    setMessages(prev => [...prev, localMessage]);

    try {
      const response = await fetch(`/api/chat/${currentConversation}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'student', text }),
      });

      if (response.ok) {
        const data = await response.json();

        // Replace the optimistic local message with the server-authoritative one
        setMessages(prev => {
          const replaced = prev.map(m => (m.id === localId ? data.student_message : m));
          // Append AI response (if any)
          if (data.ai_response) {
            return [...replaced, data.ai_response];
          }
          return replaced;
        });

        // Check for suggested resources
        if (data.ai_response?.metadata?.suggested_resource_ids?.length > 0) {
          setSuggestedResources(data.ai_response.metadata.suggested_resource_ids);
          setIsResourceDrawerOpen(true);
        }

        // Refresh conversations list to update last message
        loadConversations();
      } else {
        // Mark the optimistic message as failed
        setMessages(prev => prev.map(m => m.id === localId ? { ...m, metadata: { ...m.metadata, failed: true } } : m));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(m => m.id === localId ? { ...m, metadata: { ...m.metadata, failed: true } } : m));
    }
  };

  const selectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    router.push(`/student?conversation=${conversationId}`);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/student/counselor-chat')}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                title="Talk to counselor"
              >
                👨‍⚕️ Counselor
              </button>
              <button
                onClick={createNewConversation}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <ConversationsList
          conversations={conversations}
          currentConversation={currentConversation}
          onSelect={selectConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {conversationTitle || 'Select a conversation'}
                </h1>
                {currentConversation && (
                  <p className="text-sm text-gray-500">#{user.anon_id}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsResourceDrawerOpen(!isResourceDrawerOpen)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l-7 7-7-7m14 14l-7-7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Consent Banner */}
        <ConsentBanner />

        {/* Chat Pane */}
        <ChatPane
          messages={messages}
          onSendMessage={sendMessage}
          currentConversation={currentConversation}
          onNewChat={createNewConversation}
        />
      </div>

      {/* Right Sidebar - Resource Drawer */}
      <ResourceDrawer
        isOpen={isResourceDrawerOpen}
        onClose={() => setIsResourceDrawerOpen(false)}
        suggestedResourceIds={suggestedResources}
      />
    </div>
  );
}