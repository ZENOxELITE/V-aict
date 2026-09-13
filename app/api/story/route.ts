import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const LENGTH_TOKENS = {
  short: 700,
  medium: 1200,
  long: 2000,
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, genre, tone, length, protagonist, setting, additionalInfo, model, continue_story } = await request.json();

    if (!prompt && !continue_story) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 });
    }

    let systemPrompt = `You are a creative story writer. Write engaging, immersive stories with vivid descriptions and compelling characters.
Genre: ${genre || 'General'}
Tone: ${tone || 'Neutral'}
${protagonist ? `Protagonist: ${protagonist}` : ''}
${setting ? `Setting: ${setting}` : ''}
${additionalInfo ? `Additional creative direction: ${additionalInfo}` : ''}
Only output the story text, no titles or meta-commentary.`;

    let userPrompt = prompt;
    if (continue_story) {
      userPrompt = `Continue this story naturally, maintaining the same style and tone:\n\n${continue_story}\n\nContinue from where it left off:`;
    } else {
      userPrompt = `Write a ${length || 'medium'} ${genre || ''} story based on this concept: ${prompt}`;
    }

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
        max_tokens: LENGTH_TOKENS[length as keyof typeof LENGTH_TOKENS] || LENGTH_TOKENS.medium,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
    });
  } catch (error) {
    console.error('Story API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
