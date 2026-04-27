'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Sparkles, ArrowUp, Square } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onOpenTemplates: () => void;
  initialValue?: string;
}

const MAX_CHARS = 4000;

export function InputBar({ onSend, isLoading, onOpenTemplates, initialValue }: InputBarProps) {
  const [input, setInput] = useState(initialValue || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (window.innerWidth < 768) textareaRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = input.trim().length > 0;
  const remaining = MAX_CHARS - input.length;
  const showCount = input.length > MAX_CHARS * 0.8;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background md:pl-60">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-3 pt-2">

        {/* Single row input */}
        <div className={`
          flex items-center gap-2 px-3 py-2.5
          bg-white dark:bg-neutral-900 rounded-2xl
          border transition-all duration-150
          ${hasContent
            ? 'border-black/30 dark:border-white/30'
            : 'border-black/10 dark:border-white/10'}
        `}>

          {/* Templates button */}
          <button
            type="button"
            onClick={onOpenTemplates}
            disabled={isLoading}
            title="Prompt templates"
            className="
              w-7 h-7 rounded-full flex-shrink-0
              border border-black/10 dark:border-white/10
              flex items-center justify-center
              text-black/35 dark:text-white/35
              hover:text-black dark:hover:text-white
              hover:border-black/20 dark:hover:border-white/20
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-120
            "
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Message NeuraChat..."
            rows={1}
            style={{ minHeight: '22px', maxHeight: '160px', fontSize: '14px' }}
            className="
              flex-1 bg-transparent border-none outline-none resize-none
              text-black dark:text-white
              placeholder:text-black/25 dark:placeholder:text-white/25
              leading-relaxed overflow-y-auto
              disabled:opacity-40
            "
          />

          {/* Char count */}
          {showCount && (
            <span className={`
              text-[10px] font-mono flex-shrink-0
              ${remaining <= 0 ? 'text-red-500' : 'text-black/25 dark:text-white/25'}
            `}>
              {remaining}
            </span>
          )}

          {/* Send / stop button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!hasContent && !isLoading}
            title={isLoading ? 'Responding...' : 'Send'}
            className={`
              w-7 h-7 rounded-full flex-shrink-0
              flex items-center justify-center
              transition-all duration-120
              ${hasContent && !isLoading
                ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80 cursor-pointer'
                : isLoading
                  ? 'border border-black/15 dark:border-white/15 text-black/35 dark:text-white/35'
                  : 'border border-black/10 dark:border-white/10 text-black/20 dark:text-white/20 cursor-not-allowed opacity-40'
              }
            `}
          >
            {isLoading
              ? <Square className="w-2.5 h-2.5" strokeWidth={2} />
              : <ArrowUp className="w-3 h-3" strokeWidth={2.5} />
            }
          </button>
        </div>

        <p className="text-center text-[10.5px] text-black/20 dark:text-white/20 mt-1.5">
          NeuraChat can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}