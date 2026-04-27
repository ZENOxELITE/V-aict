'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { ResultBox } from '@/components/ui/result-box';
import type { ModelId } from '@/types';

interface StoryGeneratorProps {
  selectedModel: ModelId;
  onShowToast: (message: string, type?: 'default' | 'success' | 'error') => void;
}

const GENRES = ['Adventure', 'Science Fiction', 'Fantasy', 'Horror', 'Romance', 'Mystery', 'Thriller', 'Comedy', 'Drama'];
const TONES = ['Neutral', 'Dark', 'Comedic', 'Romantic', 'Suspenseful', 'Epic'];
const LENGTHS = [
  { value: 'short', label: 'Short (~500 words)' },
  { value: 'medium', label: 'Medium (~800 words)' },
  { value: 'long', label: 'Long (~1400 words)' },
];

const LOADING_MESSAGES = [
  'Writing your story...',
  'Developing characters...',
  'Building the world...',
  'Crafting the climax...',
];

export function StoryGenerator({ selectedModel, onShowToast }: StoryGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Adventure');
  const [tone, setTone] = useState('Neutral');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [protagonist, setProtagonist] = useState('');
  const [setting, setSetting] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [result, setResult] = useState<{ story: string; tokens: number } | null>(null);

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (continueStory = false) => {
    if (!prompt.trim() && !continueStory) {
      onShowToast('Please enter a story concept', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: continueStory ? 'Continue this story' : prompt,
          genre,
          tone,
          length,
          protagonist: protagonist || undefined,
          setting: setting || undefined,
          model: selectedModel,
          continue_story: continueStory ? result?.story : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate story');

      const data = await response.json();
      setResult({
        story: continueStory && result ? result.story + '\n\n' + data.story : data.story,
        tokens: data.tokens,
      });
      onShowToast(continueStory ? 'Story continued!' : 'Story generated!', 'success');
    } catch {
      onShowToast('Failed to generate story', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = result?.story.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/8 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#888]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Story Generator</h2>
          <p className="text-[13px] text-[#888]">Create engaging stories from simple prompts</p>
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
          Story concept
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your story idea..."
          rows={4}
          className="w-full px-4 py-3 bg-[#111] border border-white/12 rounded-lg text-[14px] text-[#ededed] placeholder:text-[#555] resize-none focus:outline-none focus:border-white/22"
        />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Genre
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] appearance-none cursor-pointer focus:outline-none focus:border-white/22 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23888%22%3E%3Cpath%20d%3D%22m2%204%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] appearance-none cursor-pointer focus:outline-none focus:border-white/22 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23888%22%3E%3Cpath%20d%3D%22m2%204%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Length
          </label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] appearance-none cursor-pointer focus:outline-none focus:border-white/22 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23888%22%3E%3Cpath%20d%3D%22m2%204%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
          >
            {LENGTHS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Protagonist (optional)
          </label>
          <input
            type="text"
            value={protagonist}
            onChange={(e) => setProtagonist(e.target.value)}
            placeholder="e.g., A young astronaut"
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] placeholder:text-[#555] focus:outline-none focus:border-white/22"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-2">
            Setting (optional)
          </label>
          <input
            type="text"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder="e.g., A distant planet"
            className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] placeholder:text-[#555] focus:outline-none focus:border-white/22"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isLoading || !prompt.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-[#e2e2e2] transition-colors disabled:opacity-25"
        >
          {isLoading && !result ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Generate Story
            </>
          )}
        </button>

        {result && (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#111] border border-white/12 text-white rounded-lg text-[13px] font-medium hover:border-white/22 transition-colors disabled:opacity-25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Continuing...
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Continue Story
              </>
            )}
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <ResultBox
            content={result.story}
            label="Your Story"
            wordCount={wordCount}
            tokenCount={result.tokens}
          />
        </div>
      )}
    </div>
  );
}
