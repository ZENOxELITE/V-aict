'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';

interface RequestMeterContextValue {
  requestStarted: () => void;
  requestFinished: () => void;
}

const RequestMeterContext = createContext<RequestMeterContextValue | null>(null);
const WINDOW_MS = 60_000;

export function RequestMeterProvider({ children }: { children: React.ReactNode }) {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      setTimestamps((items) => items.filter((timestamp) => current - timestamp < WINDOW_MS));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const value = useMemo(() => ({
    requestStarted: () => {
      const current = Date.now();
      setTimestamps((items) => [...items.filter((timestamp) => current - timestamp < WINDOW_MS), current]);
      setActive((count) => count + 1);
    },
    requestFinished: () => setActive((count) => Math.max(0, count - 1)),
  }), []);

  return (
    <RequestMeterContext.Provider value={value}>
      {children}
      <RequestMeter timestamps={timestamps} active={active} now={now} />
    </RequestMeterContext.Provider>
  );
}

export function useRequestMeter() {
  const context = useContext(RequestMeterContext);
  if (!context) throw new Error('useRequestMeter must be used inside RequestMeterProvider');
  return context;
}

function RequestMeter({ timestamps, active, now }: { timestamps: number[]; active: number; now: number }) {
  const oldest = timestamps[0];
  const secondsUntilReset = oldest ? Math.max(0, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)) : 0;

  return (
    <div className="fixed bottom-3 left-3 z-40 hidden items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] text-white/50 shadow-lg backdrop-blur-md sm:flex">
      <Activity className={`h-3 w-3 ${active ? 'animate-pulse text-[#b7ff5a]' : 'text-white/35'}`} />
      <span>{active ? 'AI working' : 'API idle'}</span>
      <span className="text-white/20">|</span>
      <span>{timestamps.length} request{timestamps.length === 1 ? '' : 's'} / 60s</span>
      {secondsUntilReset > 0 && <span className="text-white/30">oldest clears in {secondsUntilReset}s</span>}
    </div>
  );
}
