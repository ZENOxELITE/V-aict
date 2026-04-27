import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const DEPTH_POINTS = {
  brief: 3,
  standard: 5,
  deep: 7,
};

export async function POST(request: NextRequest) {
  try {
    const { topic, side, depth, model } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const points = DEPTH_POINTS[depth as keyof typeof DEPTH_POINTS] || DEPTH_POINTS.standard;

    let prompt = '';
    if (side === 'both') {
      prompt = `Generate a balanced debate on this topic: "${topic}"

Structure your response as:

**FOR** (Arguments in favor)
[${points} numbered points with explanations]

**AGAINST** (Arguments opposed)
[${points} numbered points with explanations]

**CONCLUSION**
[Brief summary of the key tensions and considerations]`;
    } else {
      const position = side === 'for' ? 'in favor of' : 'against';
      prompt = `Generate ${points} strong arguments ${position} this topic: "${topic}"

Number each argument and provide clear explanations with supporting reasoning.`;
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'You are a debate expert and critical thinker. Generate well-reasoned, balanced arguments. Be thorough and objective.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate debate' }, { status: 500 });
    }

    const data = await response.json();
    const debate = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      debate,
      tokens: data.usage?.total_tokens || null,
    });
  } catch (error) {
    console.error('Debate API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
