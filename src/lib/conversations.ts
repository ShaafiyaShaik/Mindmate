import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'conversations');

export interface Message {
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

export interface Conversation {
  conversation_id: string;
  anon_id: string;
  title: string;
  created_at: string;
  last_message: string;
  last_snippet: string;
  mood_pulse: 'green' | 'yellow' | 'red';
  unread: boolean;
  last_stress_score: number;
  messages: Message[];
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function saveConversation(conversation: Conversation): void {
  const filePath = path.join(DATA_DIR, `${conversation.conversation_id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));
}

export function loadConversation(conversationId: string): Conversation | null {
  const filePath = path.join(DATA_DIR, `${conversationId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export function loadConversationsByUser(anonId: string): Conversation[] {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(DATA_DIR);
  const conversations: Conversation[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(DATA_DIR, file);
      const data = fs.readFileSync(filePath, 'utf-8');
      const conversation = JSON.parse(data);
      if (conversation.anon_id === anonId) {
        conversations.push(conversation);
      }
    }
  }
  
  // Sort by created_at descending (newest first)
  return conversations.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addMessageToConversation(
  conversationId: string, 
  message: Message
): Conversation | null {
  const conversation = loadConversation(conversationId);
  if (!conversation) {
    return null;
  }
  
  conversation.messages.push(message);
  conversation.last_message = message.text;
  conversation.last_snippet = message.text.substring(0, 50) + (message.text.length > 50 ? '...' : '');
  conversation.unread = message.sender !== 'student';
  
  if (message.metadata?.stress_score) {
    conversation.last_stress_score = message.metadata.stress_score;
    // Update mood pulse based on stress score
    if (message.metadata.stress_score >= 70) {
      conversation.mood_pulse = 'red';
    } else if (message.metadata.stress_score >= 40) {
      conversation.mood_pulse = 'yellow';
    } else {
      conversation.mood_pulse = 'green';
    }
  }
  
  saveConversation(conversation);
  return conversation;
}