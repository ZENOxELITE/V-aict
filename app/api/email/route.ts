import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const lengthGuide = LENGTH_GUIDE[length as keyof typeof LENGTH_GUIDE] || LENGTH_GUIDE.medium;

    const systemPrompt = `You are a professional email writer. Write emails that are ${tone || 'professional'} in tone.
Length: ${lengthGuide}
${recipient ? `Recipient: ${recipient}` : ''}
${sender ? `Sender: ${sender}` : ''}

Start with "Subject: [appropriate subject line]" then write the full email with greeting, body, and sign-off.
Only output the email, no explanations or meta-commentary.`;

    const userPrompt = `Write an email for this purpose: ${intent}${context ? `\n\nAdditional context: ${context}` : ''}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to write email' }, { status: 500 });
    }

    const data = await response.json();
    const email = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      email,
      tokens: data.usage?.total_tokens || null,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
