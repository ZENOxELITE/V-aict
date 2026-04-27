'use client';

import { useState } from 'react';
import { Code, Loader2 } from 'lucide-react';
import { PillGroup } from '@/components/ui/pill-group';
import { ResultBox } from '@/components/ui/result-box';
import type { ModelId } from '@/types';

interface CodeExplainerProps {
  selectedModel: ModelId;
  onShowToast: (message: string, type?: 'default' | 'success' | 'error') => void;
}

const MODES = [
  { value: 'line-by-line' as const, label: 'Line by Line' },
  { value: 'overview' as const, label: 'Overview' },
  { value: 'debug' as const, label: 'Bug Detection' },
  { value: 'complexity' as const, label: 'Complexity' },
];

const MAX_CHARS = 10000;

export function CodeExplainer({ selectedModel, onShowToast }: CodeExplainerProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [mode, setMode] = useState<'line-by-line' | 'overview' | 'debug' | 'complexity'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ explanation: string; tokens: number } | null>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      onShowToast('Please enter some code to analyze', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          mode,
          language: language || undefined,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze code');

      const data = await response.json();
      setResult(data);
      onShowToast('Code analyzed!', 'success');
    } catch {
      onShowToast('Failed to analyze code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/8 flex items-center justify-center">
          <Code className="w-5 h-5 text-[#888]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Code Explainer</h2>
          <p className="text-[13px] text-[#888]">Understand code with AI-powered analysis</p>
        </div>
      </div>

      {/* Language input */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Language (optional)
        </label>
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g., Python, JavaScript, Rust"
          className="w-full max-w-xs px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] placeholder:text-[#555] focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Mode */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Analysis mode
        </label>
        <PillGroup options={MODES} value={mode} onChange={setMode} />
      </div>

      {/* Code input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#555]">
            Code
          </label>
          <span className="text-[11px] text-[#555] font-mono">
            {code.length}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste your code here..."
          rows={12}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22 font-mono"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !code.trim()}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-[#e2e2e2] transition-colors disabled:opacity-25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Code className="w-4 h-4" />
            Analyze Code
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <ResultBox
            content={result.explanation}
            label="Explanation"
            tokenCount={result.tokens}
          />
        </div>
      )}
    </div>
  );
}
