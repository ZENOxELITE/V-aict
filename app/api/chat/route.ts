import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Server-side conversation history (in production, use Redis or similar)
let conversationHistory: Array<{ role: string; content: string }> = [];
const MAX_HISTORY = 20;

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    // Trim history if needed
    if (conversationHistory.length > MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }

   const response = await fetch(GROQ_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: model || 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: 'You are NeuraChat, a helpful AI assistant. Be concise, informative, and friendly.' },
      ...conversationHistory,
    ],
    max_tokens: 2048,
    temperature: 0.7,
  }),
});
    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'No response generated';
    const tokens = data.usage?.total_tokens || null;

    // Add assistant response to history
    conversationHistory.push({ role: 'assistant', content: reply });

    return NextResponse.json({
      reply,
      model: model || 'meta-llama/llama-4-scout-17b-16e-instruct',
      tokens,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
