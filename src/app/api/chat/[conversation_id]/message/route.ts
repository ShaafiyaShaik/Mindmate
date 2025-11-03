import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getMessages, saveMessage, createAlert, getConversations, updateConversationTitle } from '@/lib/db';
import { callGemini, fallbackAnalysis, sanitizeForPrompt, COMBINED_PROMPT } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const { conversation_id } = params;
    const { text: messageText, sender = 'student' } = await request.json();

    if (!messageText || typeof messageText !== 'string') {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

  // Verify conversation belongs to user
  const conversations = await getConversations(user.anon_id);
  const conversation = conversations.find((c: any) => c.id === conversation_id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Sanitize the message
    const sanitizedMessage = sanitizeForPrompt(messageText);
    
    // Get recent messages for context
    const recentMessages = await getMessages(conversation_id);
    const recentContext = (recentMessages || [])
      .slice(-4) // Last 4 messages for context
      .map((msg: any) => `${msg.sender}: ${msg.text}`)
      .join('\n');

    // Generate student message ID and timestamp
    const studentMessageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const timestamp = Math.floor(Date.now() / 1000);

    // Save student message first
    await saveMessage({
      id: studentMessageId,
      conversation_id,
      sender: 'student',
      text: messageText,
      timestamp
    });

    console.log(`New student message in conversation ${conversation_id}: ${messageText}`);

    let analysisResult;
    let usedFallback = false;

    try {
      // Try Gemini API first
      const prompt = COMBINED_PROMPT(recentContext, sanitizedMessage);
      console.log('Calling Gemini with prompt...');
      analysisResult = await callGemini(prompt, { timeoutMs: 15000 });
      console.log('Gemini analysis result:', analysisResult);
    } catch (error) {
      console.error('Gemini API failed, using fallback:', error);
      analysisResult = fallbackAnalysis(sanitizedMessage);
      usedFallback = true;
    }

    // Determine if escalation is needed
    const shouldEscalate = analysisResult.analysis.crisis_flag || 
                          (analysisResult.analysis.stress_score >= 75 && analysisResult.analysis.confidence >= 0.5);

    // Save assistant message
    const assistantMessageId = `msg_${Date.now() + 1}_${Math.floor(Math.random() * 1000)}`;
    const assistantTimestamp = Math.floor(Date.now() / 1000) + 2; // Slight delay for realism
    
    await saveMessage({
      id: assistantMessageId,
      conversation_id,
      sender: 'assistant',
      text: analysisResult.reply.text,
      timestamp: assistantTimestamp,
      stress_score: analysisResult.analysis.stress_score,
      tags: analysisResult.analysis.tags,
      confidence: analysisResult.analysis.confidence,
      intent: usedFallback ? 'fallback_response' : 'gemini_response',
      emotion: analysisResult.analysis.emotion,
      crisis_flag: analysisResult.analysis.crisis_flag
    });

    // Update conversation title if this is the first real exchange
    if ((recentMessages || []).length <= 1) {
      const title = generateConversationTitle(messageText);
      await updateConversationTitle(conversation_id, title);
    }

    // Create alert if escalation needed
    let alertCreated = false;
    if (shouldEscalate) {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await createAlert({
        alert_id: alertId,
        anon_id: user.anon_id,
        dept: user.dept || 'Unknown',
        stress_score: analysisResult.analysis.stress_score,
        snippet: messageText.substring(0, 100),
        tags: analysisResult.analysis.tags,
        consent: 'ON' // For demo, assuming consent
      });
      alertCreated = true;
      console.log(`Alert ${alertId} created for high stress/crisis message`);
    }

    // Prepare response
    const response = {
      student_message: {
        id: studentMessageId,
        sender: 'student',
        text: messageText,
        timestamp: new Date(timestamp * 1000).toISOString(),
        metadata: {
          stress_score: analysisResult.analysis.stress_score,
          detected_keywords: analysisResult.analysis.tags
        }
      },
      ai_response: {
        id: assistantMessageId,
        sender: 'mindmate',
        text: analysisResult.reply.text,
        timestamp: new Date(assistantTimestamp * 1000).toISOString(),
        metadata: {
          stress_score: analysisResult.analysis.stress_score,
          tags: analysisResult.analysis.tags,
          confidence: analysisResult.analysis.confidence,
          emotion: analysisResult.analysis.emotion,
          crisis_flag: analysisResult.analysis.crisis_flag,
          escalation_required: shouldEscalate,
          suggested_resource_ids: analysisResult.reply.resource_ids,
          suggested_actions: analysisResult.reply.suggested_actions,
          processing_agents: usedFallback ? ['Fallback Analyzer'] : ['Gemini AI', 'Mood Analyzer', 'Crisis Detector'],
          agent_response: true,
          intent: usedFallback ? 'fallback_response' : 'gemini_response'
        }
      }
    };

    console.log('Sending response:', {
      conversation_id,
      stress_score: analysisResult.analysis.stress_score,
      escalate: shouldEscalate,
      alert_created: alertCreated,
      used_fallback: usedFallback
    });

    // Trigger real-time analytics update
    try {
      await fetch(`${request.nextUrl.origin}/api/analytics/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anon_id: user.anon_id,
          event_type: 'emotion_analysis',
          data: {
            conversation_id,
            stress_score: analysisResult.analysis.stress_score,
            emotion: analysisResult.analysis.emotion,
            tags: analysisResult.analysis.tags,
            timestamp: new Date().toISOString()
          }
        })
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to trigger analytics update:', error);
      // Don't fail the main request if analytics update fails
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat message error:', error);
    
    // Fallback response for any unexpected errors
    return NextResponse.json({
      ai_response: {
        id: `msg_${Date.now()}_fallback`,
        sender: 'mindmate',
        text: "I'm sorry, I'm having trouble processing your message right now. If this is urgent, please reach out to a counselor or call 988 for crisis support.",
        timestamp: new Date().toISOString(),
        metadata: {
          stress_score: 50,
          escalation_required: false,
          agent_response: true,
          intent: 'error_fallback'
        }
      },
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function generateConversationTitle(firstMessage: string): string {
  const message = firstMessage.toLowerCase();
  
  if (message.includes('exam') || message.includes('test')) {
    return 'Exam Support';
  } else if (message.includes('sleep') || message.includes('tired')) {
    return 'Sleep & Wellness';
  } else if (message.includes('anxious') || message.includes('anxiety')) {
    return 'Anxiety Support';
  } else if (message.includes('stress') || message.includes('overwhelmed')) {
    return 'Stress Management';
  } else if (message.includes('sad') || message.includes('depression')) {
    return 'Emotional Support';
  } else if (message.includes('relationship') || message.includes('friend')) {
    return 'Relationship Support';
  } else {
    return 'General Support';
  }
}