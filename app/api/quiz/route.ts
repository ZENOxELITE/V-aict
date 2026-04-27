import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const typePrompt = TYPE_PROMPTS[type as keyof typeof TYPE_PROMPTS] || TYPE_PROMPTS.mcq;
    const questionCount = Math.min(Math.max(count || 5, 3), 15);

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
            content: `You are a quiz creator. ${typePrompt} Create ${difficulty || 'medium'} difficulty questions. Number each question. Include an Answer Key section at the end with all correct answers.` 
          },
          { role: 'user', content: `Create ${questionCount} ${type || 'multiple choice'} questions about: ${topic}` },
        ],
        max_tokens: 2048,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }

    const data = await response.json();
    const quiz = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      quiz,
      tokens: data.usage?.total_tokens || null,
    });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
