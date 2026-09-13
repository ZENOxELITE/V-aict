'use client';

import { useState } from 'react';
import { HelpCircle, Loader2 } from 'lucide-react';
import { PillGroup } from '@/components/ui/pill-group';
import { ResultBox } from '@/components/ui/result-box';
import type { ModelId } from '@/types';
import { readAiStream } from '@/lib/read-ai-stream';
import { useRequestMeter } from '@/components/request-meter';

interface QuizGeneratorProps {
  selectedModel: ModelId;
  onShowToast: (message: string, type?: 'default' | 'success' | 'error') => void;
}

const TYPES = [
  { value: 'mcq' as const, label: 'Multiple Choice' },
  { value: 'true-false' as const, label: 'True/False' },
  { value: 'short' as const, label: 'Short Answer' },
];

const DIFFICULTIES = [
  { value: 'easy' as const, label: 'Easy' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'hard' as const, label: 'Hard' },
];

export function QuizGenerator({ selectedModel, onShowToast }: QuizGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'mcq' | 'true-false' | 'short'>('mcq');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ quiz: string; tokens: number } | null>(null);
  const { requestStarted, requestFinished } = useRequestMeter();

  const handleSubmit = async () => {
    if (!topic.trim()) {
      onShowToast('Please enter a topic', 'error');
      return;
    }

    setIsLoading(true);
    requestStarted();
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          type,
          difficulty,
          count: Math.min(Math.max(count, 3), 15),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate quiz');
      }

      let quiz = '';
      const tokens = await readAiStream(response, (chunk) => {
        quiz += chunk;
        setResult({ quiz, tokens: 0 });
      });
      setResult({ quiz, tokens: tokens || 0 });
      onShowToast('Quiz generated!', 'success');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Failed to generate quiz', 'error');
    } finally {
      requestFinished();
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/8 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-[#888]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Quiz Generator</h2>
          <p className="text-[13px] text-[#888]">Create quizzes on any topic</p>
        </div>
      </div>

      {/* Topic */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Topic or source material
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic or paste content to quiz on..."
          rows={4}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[14px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Question type
        </label>
        <PillGroup options={TYPES} value={type} onChange={setType} />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Difficulty
        </label>
        <PillGroup options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
      </div>

      {/* Count */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Number of questions (3-15)
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 5)}
          min={3}
          max={15}
          className="w-24 px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !topic.trim()}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-[#e2e2e2] transition-colors disabled:opacity-25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <HelpCircle className="w-4 h-4" />
            Generate Quiz
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <ResultBox
            content={result.quiz}
            label="Quiz"
            tokenCount={result.tokens}
          />
        </div>
      )}
    </div>
  );
}
