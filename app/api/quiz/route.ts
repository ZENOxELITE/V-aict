import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-ai/deepseek-v4-flash-0731';

const TYPE_PROMPTS = {
  'mcq': 'Generate multiple choice questions with 4 options (A, B, C, D) each. Mark the correct answer clearly.',
  'true-false': 'Generate true/false statements. Include the correct answer (True or False) for each.',
  'short': 'Generate short answer questions. Include a model answer for each question.',
};

export async function POST(request: NextRequest) {
  try {
    const { topic, type, difficulty, count, model } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 });
    }

    const typePrompt = TYPE_PROMPTS[type as keyof typeof TYPE_PROMPTS] || TYPE_PROMPTS.mcq;
    const questionCount = Math.min(Math.max(count || 5, 3), 15);
    const selectedModel = model === DEFAULT_MODEL ? model : DEFAULT_MODEL;

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { 
            role: 'system', 
            content: `You are a quiz creator. ${typePrompt} Create ${difficulty || 'medium'} difficulty questions. Number each question. Include an Answer Key section at the end with all correct answers.` 
          },
          { role: 'user', content: `Create ${questionCount} ${type || 'multiple choice'} questions about: ${topic}` },
        ],
        max_tokens: 2048,
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!response.ok) {
      const providerError = await response.text();
      console.error(`NVIDIA quiz API error (${response.status}):`, providerError);
      return NextResponse.json(
        { error: 'Failed to generate quiz', details: providerError },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
      );
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
    });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
