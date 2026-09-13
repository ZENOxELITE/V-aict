'use client';

import { Menu, Download, Trash2, Coins, Keyboard } from 'lucide-react';
import { MODELS } from '@/lib/models';
import type { ModelId } from '@/types';

interface ChatHeaderProps {
  selectedModel: ModelId;
  onMenuClick: () => void;
  onExport: () => void;
  onClear: () => void;
  onOpenTokenTracker: () => void;
  onOpenShortcuts: () => void;
  totalTokens: number;
}

export function ChatHeader({ 
  selectedModel, 
  onMenuClick, 
  onExport, 
  onClear,
  onOpenTokenTracker,
  onOpenShortcuts,
  totalTokens,
}: ChatHeaderProps) {
  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-[54px] px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface2 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[15px] font-semibold text-foreground tracking-tight">Assistant</span>
            <span className="hidden sm:block text-[10px] text-dim uppercase tracking-[0.18em]">Neura workspace</span>
          </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface2/80 border border-border text-[11px] font-medium text-muted truncate max-w-[180px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_8px_var(--color-green)]" />
            {currentModel.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Token counter */}
          {totalTokens > 0 && (
            <button
              type="button"
              onClick={onOpenTokenTracker}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface2"
              title="View token usage"
            >
              <Coins className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-medium">{totalTokens.toLocaleString()}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenShortcuts}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface2"
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={onExport}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface2"
            title="Export chat"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red hover:bg-surface2"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
