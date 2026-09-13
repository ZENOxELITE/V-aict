'use client';

import { useState } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import { PillGroup } from '@/components/ui/pill-group';
import { ResultBox } from '@/components/ui/result-box';
import type { ModelId } from '@/types';
import { readAiStream } from '@/lib/read-ai-stream';
import { useRequestMeter } from '@/components/request-meter';

interface DebateGeneratorProps {
  selectedModel: ModelId;
  onShowToast: (message: string, type?: 'default' | 'success' | 'error') => void;
}

const SIDES = [
  { value: 'both' as const, label: 'Both Sides' },
  { value: 'for' as const, label: 'For' },
  { value: 'against' as const, label: 'Against' },
];

const DEPTHS = [
  { value: 'brief' as const, label: 'Brief (3 points)' },
  { value: 'standard' as const, label: 'Standard (5 points)' },
  { value: 'deep' as const, label: 'Deep (7 points)' },
];

export function DebateGenerator({ selectedModel, onShowToast }: DebateGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [side, setSide] = useState<'both' | 'for' | 'against'>('both');
  const [depth, setDepth] = useState<'brief' | 'standard' | 'deep'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ debate: string; tokens: number } | null>(null);
  const { requestStarted, requestFinished } = useRequestMeter();

  const handleSubmit = async () => {
    if (!topic.trim()) {
      onShowToast('Please enter a debate topic', 'error');
      return;
    }

    setIsLoading(true);
    requestStarted();
    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          side,
          depth,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate debate');

      let debate = '';
      const tokens = await readAiStream(response, (chunk) => {
        debate += chunk;
        setResult({ debate, tokens: 0 });
      });
      setResult({ debate, tokens: tokens || 0 });
      onShowToast('Debate generated!', 'success');
    } catch {
      onShowToast('Failed to generate debate', 'error');
    } finally {
      requestFinished();
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/8 flex items-center justify-center">
          <Scale className="w-5 h-5 text-[#888]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Debate Generator</h2>
          <p className="text-[13px] text-[#888]">Generate arguments for any topic</p>
        </div>
      </div>

      {/* Topic */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Debate topic
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic or statement to debate..."
          rows={3}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[14px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Perspective */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Perspective
        </label>
        <PillGroup options={SIDES} value={side} onChange={setSide} />
      </div>

      {/* Depth */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Depth
        </label>
        <PillGroup options={DEPTHS} value={depth} onChange={setDepth} />
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
            <Scale className="w-4 h-4" />
            Generate Debate
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <ResultBox
            content={result.debate}
            label="Debate Arguments"
            tokenCount={result.tokens}
          />
        </div>
      )}
    </div>
  );
}
