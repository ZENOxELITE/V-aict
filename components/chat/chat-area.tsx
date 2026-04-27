'use client';

import { useRef, useEffect } from 'react';
import { MessageSquare, Lightbulb, Code, FileText, Sparkles } from 'lucide-react';
import { Message } from './message';
import { TypingIndicator } from './typing-indicator';
import type { Message as MessageType, ReactionType } from '@/types';

interface ChatAreaProps {
  messages: MessageType[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onReact: (messageId: string, reaction: ReactionType) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Explain a concept',
    example: 'How does machine learning work?',
  },
  {
    icon: Code,
    title: 'Write some code',
    example: 'Create a React hook for dark mode',
  },
  {
    icon: FileText,
    title: 'Summarize text',
    example: 'Summarize this article for me',
  },
  {
    icon: Sparkles,
    title: 'Creative writing',
    example: 'Write a short sci-fi story',
  },
];

export function ChatArea({ messages, isLoading, onSuggestionClick, onReact, onEdit, onRegenerate }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
    >
      <div className="max-w-[680px] mx-auto px-5 py-8 pb-32">
        {messages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-12 h-12 rounded-xl border border-border-mid flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-text-muted" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              What can I help with?
            </h1>
            <p className="text-[13px] text-text-muted mb-8">
              Start a conversation or try one of these examples
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.title}
                  type="button"
                  onClick={() => onSuggestionClick(suggestion.example)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface2 border border-border text-left hover:border-border-bright transition-colors group"
                >
                  <suggestion.icon className="w-5 h-5 text-text-muted group-hover:text-foreground transition-colors mt-0.5" />
                  <div>
                    <div className="text-[13px] font-medium text-foreground mb-1">
                      {suggestion.title}
                    </div>
                    <div className="text-[12px] text-text-dim">
                      {suggestion.example}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-6">
            {messages.map((message) => (
              <Message 
                key={message.id} 
                message={message}
                onReact={onReact}
                onEdit={onEdit}
                onRegenerate={onRegenerate}
              />
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-foreground rounded-md flex-shrink-0 flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 24 21" fill="none">
                    <polygon points="12,0 0,21 24,21" className="fill-background" />
                  </svg>
                </div>
                <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-surface border border-border">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
