'use client';

import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

interface ResultBoxProps {
  content: string;
  label?: string;
  wordCount?: number;
  tokenCount?: number;
  onDownload?: () => void;
}

export function ResultBox({ content, label = 'Result', wordCount, tokenCount, onDownload }: ResultBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-[#111] border border-white/8 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] text-[#888] hover:text-white hover:bg-white/5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] text-[#888] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
      <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        <pre className="whitespace-pre-wrap text-[13.5px] text-[#ededed] font-sans leading-relaxed">
          {content}
        </pre>
      </div>
      {(wordCount !== undefined || tokenCount !== undefined) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/8 text-[11px] text-[#888]">
          {wordCount !== undefined && <span>{wordCount} words</span>}
          {tokenCount !== undefined && <span>{tokenCount} tokens</span>}
        </div>
      )}
    </div>
  );
}
