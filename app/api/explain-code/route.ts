import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

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

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 });
    }

    const modePrompt = MODE_PROMPTS[mode as keyof typeof MODE_PROMPTS] || MODE_PROMPTS.overview;
    const langHint = language ? `This code is written in ${language}.` : '';

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
            content: `You are an expert code analyst and teacher. ${modePrompt} ${langHint} Be clear and educational.` 
          },
          { role: 'user', content: `Analyze this code:\n\n\`\`\`\n${code}\n\`\`\`` },
        ],
        max_tokens: 2048,
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 });
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
    });
  } catch (error) {
    console.error('Code explain API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
