'use client';

import { useState } from 'react';
import { Check, Copy, ThumbsUp, ThumbsDown, Sparkles, Lightbulb, Pencil, RefreshCw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message as MessageType, ReactionType } from '@/types';

interface MessageProps {
  message: MessageType;
  onReact?: (messageId: string, reaction: ReactionType) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const REACTIONS: { type: ReactionType; icon: typeof ThumbsUp; label: string }[] = [
  { type: 'like', icon: ThumbsUp, label: 'Good' },
  { type: 'dislike', icon: ThumbsDown, label: 'Bad' },
  { type: 'helpful', icon: Lightbulb, label: 'Helpful' },
  { type: 'creative', icon: Sparkles, label: 'Creative' },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-surface3 border-b border-border">
        <span className="text-[11px] text-muted font-mono font-medium">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors font-medium"
        >
          {copied ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'var(--color-surface2)',
          fontSize: '12.5px',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function formatContent(content: string) {
  const parts: (string | { type: 'code'; language: string; code: string })[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ type: 'code', language: match[1], code: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

function formatText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-surface3 rounded text-[12.5px] font-mono text-accent">$1</code>')
    .replace(/\n/g, '<br />');
}

export function Message({ message, onReact, onEdit, onRegenerate }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isUser = message.role === 'user';
  const parts = formatContent(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex gap-2 sm:gap-3 animate-in fade-in duration-200 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`
          w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0 flex items-center justify-center
          ${isUser ? 'bg-surface2 border border-border-mid' : 'bg-foreground'}
        `}
      >
        {isUser ? (
          <span className="text-[11px] sm:text-[12px] font-bold text-muted">U</span>
        ) : (
          <svg width="12" height="10" viewBox="0 0 24 21" fill="none" className="sm:w-[14px] sm:h-[12px]">
            <polygon points="12,0 0,21 24,21" className="fill-background" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[85%]">
        <div
          className={`
            px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border
            ${isUser 
              ? 'bg-surface2 border-border-mid rounded-tr-sm' 
              : 'bg-surface border-border rounded-tl-sm'}
          `}
        >
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[80px] p-3 bg-surface3 border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-accent"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-accent text-background text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Save & Resend
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {parts.map((part, index) => {
                if (typeof part === 'string') {
                  return (
                    <p
                      key={index}
                      className="text-[14px] text-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatText(part) }}
                    />
                  );
                }
                return <CodeBlock key={index} code={part.code} language={part.language} />;
              })}
              {message.isEdited && (
                <span className="text-[10px] text-dim italic">(edited)</span>
              )}
            </>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 px-1 flex-wrap">
          <span className="text-[9px] sm:text-[10px] font-medium text-muted">{message.time}</span>
          
          {message.tokens && (
            <span className="text-[9px] sm:text-[10px] text-dim font-mono font-medium hidden sm:inline">
              {message.tokens} tokens
            </span>
          )}
          
          <button
            type="button"
            onClick={handleCopy}
            className="text-[9px] sm:text-[10px] font-medium text-muted hover:text-foreground"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>

          {isUser && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-muted hover:text-foreground"
            >
              <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {!isUser && onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(message.id)}
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-muted hover:text-foreground"
            >
              <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {/* Reactions for AI messages */}
          {!isUser && onReact && (
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
              {REACTIONS.map((reaction) => {
                const isActive = message.reactions?.includes(reaction.type);
                return (
                  <button
                    key={reaction.type}
                    type="button"
                    onClick={() => onReact(message.id, reaction.type)}
                    className={`
                      p-1 sm:p-1.5 rounded-md
                      ${isActive 
                        ? 'bg-foreground/20 text-foreground' 
                        : 'text-dim hover:text-muted hover:bg-surface2'}
                    `}
                    title={reaction.label}
                  >
                    <reaction.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
