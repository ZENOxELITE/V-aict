import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-ai/deepseek-v4-flash-0731';

// Server-side conversation history (in production, use Redis or similar)
let conversationHistory: Array<{ role: string; content: string }> = [];
const MAX_HISTORY = 20;

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 });
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    // Trim history if needed
    if (conversationHistory.length > MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }

  const response = await fetch(NVIDIA_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: model || DEFAULT_MODEL,
    messages: [
      { role: 'system', content: 'You are NeuraChat, a helpful AI assistant. Be concise, informative, and friendly.' },
      ...conversationHistory,
    ],
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 0.95,
    chat_template_kwargs: { thinking: true, reasoning_effort: 'high' },
    stream: true,
  }),
});
    if (!response.ok) {
      const error = await response.text();
      console.error('NVIDIA API error:', error);
      return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'AI provider returned no stream' }, { status: 502 });
    }

    let buffer = '';
    let reply = '';
    let tokens: number | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            buffer += text;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') continue;

              try {
                const data = JSON.parse(payload);
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) reply += delta;
                if (data.usage?.total_tokens) tokens = data.usage.total_tokens;
              } catch {
                // Ignore incomplete provider events; the next chunk completes them.
              }
            }

            controller.enqueue(encoder.encode(text));
          }

          conversationHistory.push({ role: 'assistant', content: reply || 'No response generated' });
          controller.close();
        } catch (error) {
          console.error('NVIDIA stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
