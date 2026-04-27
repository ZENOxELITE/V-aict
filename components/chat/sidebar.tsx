'use client';

import Link from 'next/link';
import { Plus, Grid3X3, X, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { MODELS } from '@/lib/models';
import type { ModelId } from '@/types';

interface SidebarProps {
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  onNewChat: () => void;
  totalTokens: number;
  isOnline: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_TOKENS = 8000;

export function Sidebar({
  selectedModel,
  onModelChange,
  onNewChat,
  totalTokens,
  isOnline,
  isOpen,
  onClose,
}: SidebarProps) {
  const tokenPercentage = (totalTokens / MAX_TOKENS) * 100;
  const tokenBarColor = tokenPercentage > 80 ? 'bg-red' : tokenPercentage > 60 ? 'bg-yellow' : 'bg-accent';
  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-60 bg-surface border-r border-border 
          flex flex-col z-50 transition-transform duration-200
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-foreground hover:bg-surface2 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* New conversation */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent hover:bg-surface2 transition-colors mb-6"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[13px] font-medium">New conversation</span>
          </button>

          {/* Model section */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-dim mb-3 px-1">
            Model
          </div>

          <div className="space-y-1">
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onModelChange(model.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all
                  ${selectedModel === model.id 
                    ? 'bg-surface2 border border-accent/50 text-foreground' 
                    : 'border border-transparent text-muted hover:text-foreground hover:bg-surface2'}
                `}
              >
                <span className="text-[13px] font-medium">{model.name}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface3 text-muted">
                  {model.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Token usage */}
          {totalTokens > 0 && (
            <div className="mt-6 p-3 bg-surface2 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-dim">
                  Tokens used
                </span>
                <span className="text-[13px] font-mono font-semibold text-foreground">
                  {totalTokens.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-surface4 rounded-full overflow-hidden">
                <div
                  className={`h-full ${tokenBarColor} transition-all duration-300`}
                  style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Link
            href="/tools"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-muted hover:text-accent hover:bg-surface2 transition-colors mb-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="text-[13px] font-medium">AI Tools</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('neura-welcome-seen');
              window.location.reload();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-muted hover:text-accent hover:bg-surface2 transition-colors mb-3"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[13px] font-medium">Show Welcome</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2">
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green animate-pulse' : 'bg-red'}`}
            />
            <span className="text-[11px] font-medium text-muted">
              {currentModel.name} · Groq
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
