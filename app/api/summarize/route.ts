import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const STYLE_PROMPTS = {
  concise: 'Provide a concise summary in 2-3 sentences, focusing on the key points.',
  detailed: 'Provide a detailed summary covering all important aspects and nuances.',
  bullet: 'Summarize the text using bullet points, with each point covering a key idea.',
  eli5: 'Explain the text in plain English that anyone can understand, avoiding jargon.',
};

export async function POST(request: NextRequest) {
  try {
    const { text, style, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 });
    }

    const stylePrompt = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS] || STYLE_PROMPTS.concise;

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-ai/deepseek-v4-flash-0731',
        messages: [
          { 
            role: 'system', 
            content: `You are a document summarization expert. ${stylePrompt} Only output the summary, no preamble or explanation.` 
          },
          { role: 'user', content: `Summarize the following text:\n\n${text}` },
        ],
        max_tokens: 1024,
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
    });
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
