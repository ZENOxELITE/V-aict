'use client';

import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { PillGroup } from '@/components/ui/pill-group';
import { ResultBox } from '@/components/ui/result-box';
import type { ModelId } from '@/types';
import { readAiStream } from '@/lib/read-ai-stream';
import { useRequestMeter } from '@/components/request-meter';

interface EmailWriterProps {
  selectedModel: ModelId;
  onShowToast: (message: string, type?: 'default' | 'success' | 'error') => void;
}

const TONES = [
  { value: 'professional' as const, label: 'Professional' },
  { value: 'formal' as const, label: 'Formal' },
  { value: 'friendly' as const, label: 'Friendly' },
  { value: 'assertive' as const, label: 'Assertive' },
  { value: 'apologetic' as const, label: 'Apologetic' },
];

const LENGTHS = [
  { value: 'short' as const, label: 'Short (3-4 sentences)' },
  { value: 'medium' as const, label: 'Medium (2-3 paragraphs)' },
  { value: 'detailed' as const, label: 'Detailed (4-5 paragraphs)' },
];

export function EmailWriter({ selectedModel, onShowToast }: EmailWriterProps) {
  const [intent, setIntent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [tone, setTone] = useState<'professional' | 'formal' | 'friendly' | 'assertive' | 'apologetic'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ email: string; tokens: number } | null>(null);
  const { requestStarted, requestFinished } = useRequestMeter();

  const handleSubmit = async () => {
    if (!intent.trim()) {
      onShowToast('Please enter the email purpose', 'error');
      return;
    }

    setIsLoading(true);
    requestStarted();
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          recipient: recipient || undefined,
          sender: sender || undefined,
          tone,
          length,
          context: context || undefined,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Email API failed (${response.status})`);
      }

      let email = '';
      const tokens = await readAiStream(response, (chunk) => {
        email += chunk;
        setResult({ email, tokens: 0 });
      });
      setResult({ email, tokens: tokens || 0 });
      onShowToast('Email drafted!', 'success');
    } catch (error) {
      console.error('Email generation error:', error);
      onShowToast(error instanceof Error ? error.message : 'Failed to write email', 'error');
    } finally {
      requestFinished();
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/8 flex items-center justify-center">
          <Mail className="w-5 h-5 text-[#888]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Email Writer</h2>
          <p className="text-[13px] text-[#888]">Draft professional emails instantly</p>
        </div>
      </div>

      {/* Intent */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Email purpose
        </label>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="What do you want to communicate?"
          rows={3}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[14px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Recipient and Sender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Recipient (optional)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g., John, Hiring Manager"
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] placeholder:text-[#555] focus:outline-none focus:border-white/22"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Sender name (optional)
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] placeholder:text-[#555] focus:outline-none focus:border-white/22"
          />
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">
          Tone
        </label>
        <PillGroup options={TONES} value={tone} onChange={setTone} />
      </div>

      {/* Length */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Length
        </label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'detailed')}
          className="w-full max-w-xs px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] appearance-none cursor-pointer focus:outline-none focus:border-white/22 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23888%22%3E%3Cpath%20d%3D%22m2%204%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
        >
          {LENGTHS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Context */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Additional context (optional)
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Any extra details to include..."
          rows={2}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[14px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !intent.trim()}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-[#e2e2e2] transition-colors disabled:opacity-25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Writing...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Write Email
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <ResultBox
            content={result.email}
            label="Email"
            tokenCount={result.tokens}
          />
        </div>
      )}
    </div>
  );
}
