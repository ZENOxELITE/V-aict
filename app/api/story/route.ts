import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const LENGTH_TOKENS = {
  short: 700,
  medium: 1200,
  long: 2000,
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, genre, tone, length, protagonist, setting, model, continue_story } = await request.json();

    if (!prompt && !continue_story) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    let systemPrompt = `You are a creative story writer. Write engaging, immersive stories with vivid descriptions and compelling characters.
Genre: ${genre || 'General'}
Tone: ${tone || 'Neutral'}
${protagonist ? `Protagonist: ${protagonist}` : ''}
${setting ? `Setting: ${setting}` : ''}
Only output the story text, no titles or meta-commentary.`;

    let userPrompt = prompt;
    if (continue_story) {
      userPrompt = `Continue this story naturally, maintaining the same style and tone:\n\n${continue_story}\n\nContinue from where it left off:`;
    } else {
      userPrompt = `Write a ${length || 'medium'} ${genre || ''} story based on this concept: ${prompt}`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: LENGTH_TOKENS[length as keyof typeof LENGTH_TOKENS] || LENGTH_TOKENS.medium,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
    }

    const data = await response.json();
    const story = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      story,
      tokens: data.usage?.total_tokens || null,
    });
  } catch (error) {
    console.error('Story API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
