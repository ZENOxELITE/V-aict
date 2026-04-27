'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { PillGroup } from '@/components/ui/pill-group';
import { ResultBox } from '@/components/ui/result-box';
import { StatsRow } from '@/components/ui/stats-row';
import type { ModelId } from '@/types';

interface SummarizerProps {
  selectedModel: ModelId;
  onShowToast: (message: string, type?: 'default' | 'success' | 'error') => void;
}

const STYLES = [
  { value: 'concise' as const, label: 'Concise' },
  { value: 'detailed' as const, label: 'Detailed' },
  { value: 'bullet' as const, label: 'Bullet Points' },
  { value: 'eli5' as const, label: 'Plain English' },
];

const MAX_CHARS = 15000;

export function Summarizer({ selectedModel, onShowToast }: SummarizerProps) {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<'concise' | 'detailed' | 'bullet' | 'eli5'>('concise');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    tokens: number;
    wordCount: number;
    inputWords: number;
    reduction: number;
  } | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      onShowToast('Please enter some text to summarize', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style, model: selectedModel }),
      });

      if (!response.ok) throw new Error('Failed to summarize');

      const data = await response.json();
      const inputWords = text.split(/\s+/).filter(Boolean).length;
      const reduction = Math.round((1 - data.word_count / inputWords) * 100);

      setResult({
        summary: data.summary,
        tokens: data.tokens,
        wordCount: data.word_count,
        inputWords,
        reduction,
      });
      onShowToast('Summary generated!', 'success');
    } catch {
      onShowToast('Failed to generate summary', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/8 flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#888]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Document Summarizer</h2>
          <p className="text-[13px] text-[#888]">Condense long text into concise summaries</p>
        </div>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#555]">
            Text to summarize
          </label>
          <span className="text-[11px] text-[#555] font-mono">
            {text.length}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste your text here..."
          rows={8}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[14px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Style */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Summary style
        </label>
        <PillGroup options={STYLES} value={style} onChange={setStyle} />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !text.trim()}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-[#e2e2e2] transition-colors disabled:opacity-25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Summarize
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <StatsRow
            stats={[
              { label: 'Input Words', value: result.inputWords },
              { label: 'Summary Words', value: result.wordCount },
              { label: 'Reduction', value: `${result.reduction}%` },
              { label: 'Tokens Used', value: result.tokens },
            ]}
          />
          <ResultBox
            content={result.summary}
            label="Summary"
            wordCount={result.wordCount}
            tokenCount={result.tokens}
          />
        </div>
      )}
    </div>
  );
}
