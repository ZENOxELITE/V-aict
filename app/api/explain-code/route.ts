import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODE_PROMPTS = {
  'line-by-line': 'Explain this code line by line or block by block. Use clear section headings and explain what each part does in plain English.',
  'overview': 'Provide a high-level overview of this code. Explain its purpose, inputs, outputs, and how the main components work together.',
  'debug': 'Analyze this code for bugs, errors, edge cases, and potential issues. For each problem found, explain the issue and suggest a fix.',
  'complexity': 'Analyze the time and space complexity of this code. Provide Big-O notation for each function and suggest optimizations where possible.',
};

export async function POST(request: NextRequest) {
  try {
    const { code, mode, language, model } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const modePrompt = MODE_PROMPTS[mode as keyof typeof MODE_PROMPTS] || MODE_PROMPTS.overview;
    const langHint = language ? `This code is written in ${language}.` : '';

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
            content: `You are an expert code analyst and teacher. ${modePrompt} ${langHint} Be clear and educational.` 
          },
          { role: 'user', content: `Analyze this code:\n\n\`\`\`\n${code}\n\`\`\`` },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 });
    }

    const data = await response.json();
    const explanation = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      explanation,
      tokens: data.usage?.total_tokens || null,
    });
  } catch (error) {
    console.error('Code explain API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
