'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, Brain, MessageSquare } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

// Pre-generated particle positions
const PARTICLES = [
  { x: 5, y: 10, delay: 0, duration: 3 },
  { x: 15, y: 30, delay: 0.5, duration: 4 },
  { x: 25, y: 60, delay: 0.3, duration: 3 },
  { x: 35, y: 20, delay: 1, duration: 3.5 },
  { x: 45, y: 80, delay: 0.4, duration: 4 },
  { x: 55, y: 45, delay: 0.7, duration: 3 },
  { x: 65, y: 15, delay: 1.2, duration: 2.5 },
  { x: 75, y: 70, delay: 0.2, duration: 4 },
  { x: 85, y: 35, delay: 0.9, duration: 3.2 },
  { x: 95, y: 55, delay: 1.4, duration: 3 },
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [stage, setStage] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Faster animations - reduced delays
    const timers = [
      setTimeout(() => setStage(1), 100),
      setTimeout(() => setStage(2), 300),
      setTimeout(() => setStage(3), 500),
      setTimeout(() => setStage(4), 700),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  const features = [
    { icon: MessageSquare, label: 'Multi-model' },
    { icon: Zap, label: 'Fast' },
    { icon: Brain, label: 'AI Tools' },
  ];

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center
        bg-background
        transition-all duration-300
        ${isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
      `}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/20 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-4 sm:px-6 max-w-md w-full">
        {/* Logo */}
        <div
          className={`
            mb-6 sm:mb-8 transition-all duration-400 ease-out
            ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 relative">
            <div className="absolute inset-0 bg-foreground/20 rounded-xl blur-xl" />
            <div className="relative w-full h-full bg-surface border border-border rounded-xl flex items-center justify-center">
              <svg width="28" height="24" viewBox="0 0 24 21" fill="none" className="sm:w-8 sm:h-7">
                <polygon points="12,0 0,21 24,21" className="fill-foreground" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          className={`
            text-3xl sm:text-5xl font-bold mb-3 sm:mb-4 tracking-tight text-foreground
            transition-all duration-400 ease-out
            ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          NeuraChat
        </h1>

        <p
          className={`
            text-muted text-sm sm:text-lg mb-8 sm:mb-10 font-medium
            transition-all duration-400 ease-out
            ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          AI-powered assistant with multiple models
        </p>

        {/* Features */}
        <div
          className={`
            flex justify-center gap-4 sm:gap-8 mb-8 sm:mb-12
            transition-all duration-400 ease-out
            ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {features.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-surface2 border border-border flex items-center justify-center">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>
              <span className="text-[10px] sm:text-[12px] font-semibold text-muted">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Enter button */}
        <button
          type="button"
          onClick={handleEnter}
          className={`
            group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl
            bg-foreground text-background font-semibold text-sm
            hover:opacity-90 active:scale-95 transition-all duration-200
            ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <Sparkles className="w-4 h-4" />
          Get Started
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Keyboard hint */}
        <p
          className={`
            mt-6 sm:mt-8 text-[11px] sm:text-[12px] text-dim font-medium
            transition-all duration-400
            ${stage >= 4 ? 'opacity-100' : 'opacity-0'}
          `}
        >
          Press <kbd className="px-1.5 py-0.5 bg-surface2 border border-border rounded text-muted font-mono text-[10px]">Enter</kbd> to continue
        </p>
      </div>
    </div>
  );
}
