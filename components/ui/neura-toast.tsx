'use client';

import type { Toast as ToastType } from '@/hooks/use-neura-toast';

interface ToastProps {
  toasts: ToastType[];
}

export function NeuraToast({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-md:left-4 max-md:right-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg border text-sm animate-in fade-in slide-in-from-bottom-2
            bg-[#111] border-white/12
            ${toast.type === 'success' ? 'border-green-500/50 text-green-400' : ''}
            ${toast.type === 'error' ? 'border-red-500/50 text-red-400' : ''}
            ${toast.type === 'default' ? 'text-[#ededed]' : ''}
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
