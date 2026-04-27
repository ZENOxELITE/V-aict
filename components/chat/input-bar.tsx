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
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-2">

        <div
          className={`
            flex flex-col bg-white dark:bg-neutral-900
            rounded-2xl overflow-hidden
            border transition-all duration-150
            ${hasContent
              ? 'border-black/40 dark:border-white/40'
              : 'border-black/10 dark:border-white/10'
            }
          `}
        >
          {/* Textarea */}
          <div className="px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Message NeuraChat..."
              rows={1}
              style={{ minHeight: '24px', maxHeight: '160px', fontSize: '15px' }}
              className="
                w-full bg-transparent border-none outline-none resize-none
                text-black dark:text-white
                placeholder:text-black/25 dark:placeholder:text-white/25
                leading-relaxed overflow-y-auto
                disabled:opacity-50
              "
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">

            {/* Left — templates button + char count */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenTemplates}
                disabled={isLoading}
                title="Prompt templates"
                className="
                  w-[30px] h-[30px] rounded-full
                  border border-black/10 dark:border-white/10
                  flex items-center justify-center
                  text-black/40 dark:text-white/40
                  hover:text-black dark:hover:text-white
                  hover:border-black/20 dark:hover:border-white/20
                  hover:bg-black/4 dark:hover:bg-white/6
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-120
                "
              >
                <Sparkles className="w-[14px] h-[14px]" strokeWidth={1.8} />
              </button>

              {showCount && (
                <span
                  className={`
                    text-[11px] font-mono tabular-nums
                    ${remaining <= 0
                      ? 'text-red-500'
                      : 'text-black/30 dark:text-white/30'
                    }
                  `}
                >
                  {remaining} left
                </span>
              )}
            </div>

            {/* Right — send / stop button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent && !isLoading}
              title={isLoading ? 'Waiting for response' : 'Send message'}
              className={`
                w-[30px] h-[30px] rounded-full
                flex items-center justify-center
                transition-all duration-120
                ${hasContent && !isLoading
                  ? 'bg-black dark:bg-white text-white dark:text-black cursor-pointer hover:opacity-80'
                  : isLoading
                    ? 'border border-black/20 dark:border-white/20 text-black/40 dark:text-white/40 cursor-default'
                    : 'border border-black/10 dark:border-white/10 text-black/20 dark:text-white/20 cursor-not-allowed opacity-40'
                }
              `}
            >
              {isLoading
                ? <Square className="w-[11px] h-[11px]" strokeWidth={2} />
                : <ArrowUp className="w-[13px] h-[13px]" strokeWidth={2.5} />
              }
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-black/25 dark:text-white/25 mt-2">
          NeuraChat can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}