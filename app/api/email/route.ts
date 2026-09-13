import { NextRequest, NextResponse } from 'next/server';
import { proxyAiStream } from '@/lib/proxy-ai-stream';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const LENGTH_GUIDE = {
  short: '3-4 sentences',
  medium: '2-3 paragraphs',
  detailed: '4-5 paragraphs',
};

export async function POST(request: NextRequest) {
  try {
    const { intent, recipient, sender, tone, length, context, model } = await request.json();

    if (!intent) {
      return NextResponse.json({ error: 'Email intent is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 });
    }

    const lengthGuide = LENGTH_GUIDE[length as keyof typeof LENGTH_GUIDE] || LENGTH_GUIDE.medium;

    const systemPrompt = `You are a professional email writer. Write emails that are ${tone || 'professional'} in tone.
Length: ${lengthGuide}
${recipient ? `Recipient: ${recipient}` : ''}
${sender ? `Sender: ${sender}` : ''}

Start with "Subject: [appropriate subject line]" then write the full email with greeting, body, and sign-off.
Only output the email, no explanations or meta-commentary.`;

    const userPrompt = `Write an email for this purpose: ${intent}${context ? `\n\nAdditional context: ${context}` : ''}`;

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-ai/deepseek-v4-flash-0731',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to write email' }, { status: 500 });
    }

    return proxyAiStream(response);
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
