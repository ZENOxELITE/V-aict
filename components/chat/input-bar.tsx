'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUp, Paperclip, Sparkles } from 'lucide-react';

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
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const handleKeydown = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (window.innerWidth < 768) {
        textareaRef.current?.blur();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background md:pl-60">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-2">
        {/* Main input container - ChatGPT style */}
        <div className="relative flex flex-col bg-[#2f2f2f] rounded-3xl border border-[#424242] shadow-lg">
          {/* Textarea */}
          <div className="flex items-end px-3 sm:px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="Message NeuraChat"
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] sm:text-base text-white placeholder:text-[#8e8e8e] leading-6 max-h-[200px] py-1"
              style={{ minHeight: '24px' }}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 sm:px-4 pb-3 pt-0">
            <div className="flex items-center gap-1">
              {/* Attach button */}
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e8e8e] hover:text-white hover:bg-[#424242] transition-colors"
                title="Attach file (coming soon)"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Templates button */}
              <button
                type="button"
                onClick={onOpenTemplates}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e8e8e] hover:text-white hover:bg-[#424242] transition-colors"
                title="Prompt templates (Ctrl+T)"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || isLoading}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${hasContent && !isLoading
                  ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                  : 'bg-[#676767] text-[#2f2f2f] cursor-not-allowed'
                }
              `}
              title="Send message"
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] text-[#8e8e8e] mt-2 px-4">
          NeuraChat can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
