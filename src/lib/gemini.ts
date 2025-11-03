const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_ENDPOINT = process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface AnalysisResult {
  analysis: {
    sentiment: 'positive' | 'neutral' | 'negative';
    emotion: string;
    stress_score: number;
    tags: string[];
    crisis_flag: boolean;
    confidence: number;
  };
  reply: {
    text: string;
    suggested_actions: string[];
    resource_ids: string[];
  };
}

export function sanitizeForPrompt(text: string): string {
  // Remove emails and phone numbers for privacy
  let sanitized = text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/(\+?1?\s*\(?[0-9]{3}\)?[\s.-]*[0-9]{3}[\s.-]*[0-9]{4})/g, '[PHONE]');
  
  // Limit length to 2000 characters
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000) + '...';
  }
  
  return sanitized;
}

export const COMBINED_PROMPT = (recentMessages: string, messageText: string) => `
SYSTEM:
You are MindMate — a privacy-first, empathetic student counseling assistant. For the 'Current message' below, produce ONLY a valid JSON object EXACTLY matching the schema described in OUTPUT_SCHEMA. Do NOT include any extra commentary, markdown formatting, or code blocks. Use the student's language when replying. Normalize misspellings. If message indicates immediate self-harm or intent to harm, set crisis_flag true.

OUTPUT_SCHEMA:
{
  "analysis": {
    "sentiment": "positive|neutral|negative",
    "emotion": "<one-word label like anxious, sad, calm>",
    "stress_score": 0-100,
    "tags": ["exam_stress","sleep_issue","anxiety","depression","relationship","workload","substance_use","suicidal_ideation","other"],
    "crisis_flag": true|false,
    "confidence": 0.0-1.0
  },
  "reply": {
    "text": "<empathetic 1-3 sentence reply in same language>",
    "suggested_actions": ["breathing_exercise","reschedule_study","contact_counselor","sleep_tip"],
    "resource_ids": ["stress","anxiety","sleep","study","meditation","crisis","counseling","breathing","focus"]
  }
}

CONSTRAINTS:
- Always return valid JSON only, no markdown or code blocks.
- stress_score: 0 (no stress) to 100 (extreme).
- If crisis_flag true, reply must be brief, urgent, and include "If you are in immediate danger, contact local emergency services" and offer "connect anonymously to counselor".
- If message is ambiguous, set confidence < 0.5 and reply with a gentle probe.
- Use tags from allowed list only.
- Be conversational, empathetic, and supportive like a real counselor.
- For resource_ids, suggest relevant tags based on the message content:
  * "stress" for stress, pressure, overwhelmed
  * "anxiety" for anxious, worried, nervous, panic
  * "sleep" for tired, insomnia, sleepless
  * "study" for exam stress, academic pressure
  * "meditation" for need to relax, calm down
  * "crisis" for serious emotional distress
  * "counseling" for wanting to talk to someone
  * "breathing" for panic, anxiety attacks
  * "focus" for concentration issues, ADHD
- Always include 2-3 relevant resource_ids when student expresses distress.

RECENT_MESSAGES:
${recentMessages}

CURRENT MESSAGE:
${messageText}

Respond with JSON only:`;

export async function callGemini(prompt: string, options?: { timeoutMs?: number }): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const timeoutMs = options?.timeoutMs || 10000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('Calling Gemini API...');
    
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from Gemini');
    }

    const responseText = data.candidates[0].content.parts[0].text.trim();
    console.log('Raw Gemini response:', responseText);

    // Clean the response - remove markdown code blocks if present
    const cleanedResponse = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    console.log('Cleaned response:', cleanedResponse);

    try {
      const parsed = JSON.parse(cleanedResponse);
      console.log('Parsed Gemini response:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', cleanedResponse);
      throw new Error('Invalid JSON response from Gemini');
    }

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Gemini API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

export function fallbackAnalysis(message: string): AnalysisResult {
  const lowerMessage = message.toLowerCase();
  
  // Crisis detection
  const crisisKeywords = ['suicide', 'kill myself', 'end it', 'cant go on', 'hurt myself', 'want to die', 'give up'];
  const hasCrisis = crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Stress keywords
  const stressKeywords = ['exam', 'midterm', 'deadline', 'overwhelmed', 'stressed', 'panic', 'anxious'];
  const stressCount = stressKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
  
  // Sleep keywords
  const sleepKeywords = ['sleep', 'tired', 'insomnia', 'exhausted'];
  const sleepCount = sleepKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
  
  // Anxiety keywords
  const anxietyKeywords = ['worry', 'nervous', 'afraid', 'scared', 'anxious'];
  const anxietyCount = anxietyKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
  
  // Calculate stress score
  let stressScore = 20; // baseline
  stressScore += stressCount * 12;
  stressScore += sleepCount * 8;
  stressScore += anxietyCount * 10;
  
  // Caps and punctuation boost
  if (message.includes('!!!') || message.includes('???')) stressScore += 5;
  if (message.toUpperCase() === message && message.length > 5) stressScore += 8;
  
  if (hasCrisis) stressScore = Math.max(stressScore, 85);
  
  stressScore = Math.max(0, Math.min(100, stressScore));
  
  // Determine tags
  const tags: string[] = [];
  if (stressCount > 0) tags.push('exam_stress', 'workload');
  if (sleepCount > 0) tags.push('sleep_issue');
  if (anxietyCount > 0) tags.push('anxiety');
  if (hasCrisis) tags.push('suicidal_ideation');
  if (tags.length === 0) tags.push('other');
  
  // Determine emotion and sentiment
  let emotion = 'neutral';
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  
  if (hasCrisis || stressScore > 70) {
    emotion = 'distressed';
    sentiment = 'negative';
  } else if (stressScore > 40) {
    emotion = 'anxious';
    sentiment = 'negative';
  } else if (lowerMessage.includes('good') || lowerMessage.includes('better')) {
    emotion = 'calm';
    sentiment = 'positive';
  }
  
  // Generate appropriate reply based on message content
  let replyText = '';
  let suggestedActions: string[] = [];
  let resourceIds: string[] = [];
  
  if (hasCrisis) {
    replyText = "I'm very concerned about what you're sharing. If you are in immediate danger, please contact emergency services at 988 or go to your nearest emergency room. Would you like me to connect you with a counselor right now?";
    suggestedActions = ['contact_counselor'];
    resourceIds = ['res_crisis_hotline'];
  } else if (lowerMessage.includes('just wanna talk') || lowerMessage.includes('nothing') || lowerMessage.includes('fine')) {
    replyText = "I hear you - sometimes we just need someone to listen, even when we say we're fine. That's totally okay! I'm here for you. What's been on your mind lately? Even small things can sometimes feel bigger than they seem.";
    suggestedActions = [];
    resourceIds = [];
  } else if (lowerMessage.includes('told u') || lowerMessage.includes('told you')) {
    replyText = "You're right, I'm sorry if I'm being repetitive. I want to make sure I'm really hearing you. It sounds like you might be feeling a bit frustrated with me? That's completely understandable. What would be most helpful for you right now?";
    suggestedActions = [];
    resourceIds = [];
  } else if (stressScore > 70) {
    replyText = "It sounds like you're going through a really difficult time. That level of stress can feel overwhelming, but you don't have to handle this alone. Let's work together to find some strategies that can help.";
    suggestedActions = ['breathing_exercise', 'contact_counselor'];
    resourceIds = ['res_breathing', 'res_counseling'];
  } else if (sleepCount > 0) {
    replyText = "Sleep issues can really impact how we feel and function. Good sleep hygiene is crucial for mental health. Have you tried establishing a consistent bedtime routine?";
    suggestedActions = ['sleep_tip'];
    resourceIds = ['res_sleep_hygiene'];
  } else if (stressCount > 0) {
    replyText = "Academic pressure can be really challenging. It sounds like you're dealing with a lot right now. Let's work together to find some strategies that can help you manage this stress.";
    suggestedActions = ['reschedule_study', 'breathing_exercise'];
    resourceIds = ['res_study_tips', 'res_breathing'];
  } else if (message.length < 10) {
    replyText = "I'm glad you reached out. Sometimes starting a conversation is the hardest part. What's going on in your world today?";
    suggestedActions = [];
    resourceIds = [];
  } else {
    replyText = "I appreciate you sharing that with me. I'm here to listen and support you however I can. What's been the most challenging part of your day so far?";
    suggestedActions = [];
    resourceIds = [];
  }
  
  return {
    analysis: {
      sentiment,
      emotion,
      stress_score: stressScore,
      tags,
      crisis_flag: hasCrisis,
      confidence: 0.6 // Lower confidence for fallback
    },
    reply: {
      text: replyText,
      suggested_actions: suggestedActions,
      resource_ids: resourceIds
    }
  };
}

// Call Gemini but return the raw cleaned text (no JSON parse). Useful when asking for
// different schemas (e.g., resource overviews) so callers can parse flexibly.
export async function callGeminiRaw(prompt: string, options?: { timeoutMs?: number }): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const timeoutMs = options?.timeoutMs || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('Calling Gemini (raw) API...');
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, topK: 40, topP: 0.9, maxOutputTokens: 512 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded');
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const responseText = data.candidates[0]?.content?.parts?.[0]?.text || '';
    const cleanedResponse = String(responseText)
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    console.log('Raw Gemini (cleaned):', cleanedResponse);
    return cleanedResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Gemini raw call error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Try to parse JSON even when the model returns extra text. This attempts several
// heuristics: direct parse, find the first {...} block, or fallback to building a
// simple object with the raw text as the overview.
export function parseRelaxedJSON<T = any>(text: string): T | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  // 1) Try direct parse
  try { return JSON.parse(trimmed) as T; } catch (e) {}

  // 2) Try to extract the first {...} block (naive but works for many cases)
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try { return JSON.parse(candidate) as T; } catch (e) { /* fall through */ }
  }

  // 3) Try to find lines that look like JSON (starts with { and ends with }) across lines
  const lines = trimmed.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('{')) {
      for (let j = i; j < Math.min(lines.length, i + 40); j++) {
        if (lines[j].trim().endsWith('}')) {
          const cand = lines.slice(i, j + 1).join('\n');
          try { return JSON.parse(cand) as T; } catch (e) { /* ignore */ }
        }
      }
    }
  }

  // 4) Give up - return a simple object containing the raw text as overview
  return { overview: trimmed } as unknown as T;
}