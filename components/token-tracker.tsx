'use client';

import { X, Coins, TrendingUp, Clock, Zap } from 'lucide-react';

interface TokenTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  totalTokens: number;
  sessionTokens: number;
  messageCount: number;
  startTime: Date | null;
}

// Estimated costs per 1K tokens (approximate for Groq/Llama models)
const COST_PER_1K_INPUT = 0.00005;
const COST_PER_1K_OUTPUT = 0.00010;

export function TokenTracker({ 
  isOpen, 
  onClose, 
  totalTokens, 
  sessionTokens,
  messageCount,
  startTime 
}: TokenTrackerProps) {
  if (!isOpen) return null;

  const estimatedCost = ((totalTokens / 1000) * ((COST_PER_1K_INPUT + COST_PER_1K_OUTPUT) / 2));
  const avgTokensPerMessage = messageCount > 0 ? Math.round(totalTokens / messageCount) : 0;
  
  const sessionDuration = startTime 
    ? Math.round((Date.now() - startTime.getTime()) / 60000)
    : 0;

  const stats = [
    {
      icon: Coins,
      label: 'Total Tokens',
      value: totalTokens.toLocaleString(),
      subtext: 'Cumulative usage',
    },
    {
      icon: TrendingUp,
      label: 'Session Tokens',
      value: sessionTokens.toLocaleString(),
      subtext: 'This session',
    },
    {
      icon: Zap,
      label: 'Avg per Message',
      value: avgTokensPerMessage.toLocaleString(),
      subtext: `${messageCount} messages`,
    },
    {
      icon: Clock,
      label: 'Session Duration',
      value: `${sessionDuration}m`,
      subtext: startTime ? `Started ${startTime.toLocaleTimeString()}` : 'Not started',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-border-mid rounded-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-foreground">Token Usage</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="p-4 bg-surface2 border border-border rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-text-muted" />
                  <span className="text-xs text-text-muted">{stat.label}</span>
                </div>
                <div className="text-xl font-semibold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] text-text-dim">
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>

          {/* Cost estimate */}
          <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-text-muted mb-1">Estimated Cost</div>
                <div className="text-2xl font-bold text-foreground">
                  ${estimatedCost.toFixed(6)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-muted mb-1">Rate</div>
                <div className="text-sm text-text-muted">
                  ~$0.00008/1K tokens
                </div>
              </div>
            </div>
          </div>

          {/* Usage bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">Context Window Usage</span>
              <span className="text-xs text-text-muted">{Math.min(Math.round((totalTokens / 8000) * 100), 100)}%</span>
            </div>
            <div className="h-2 bg-surface3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  totalTokens > 6400 ? 'bg-red-500' : 
                  totalTokens > 4800 ? 'bg-yellow-500' : 
                  'bg-cyan-500'
                }`}
                style={{ width: `${Math.min((totalTokens / 8000) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-dim">{totalTokens.toLocaleString()} used</span>
              <span className="text-[10px] text-text-dim">8,000 limit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
