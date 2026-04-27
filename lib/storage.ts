import type { Message } from '@/types';

const MESSAGES_KEY = 'neurachat_messages';
const MODEL_KEY = 'neurachat_model';
const MAX_STORED_MESSAGES = 30;

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  const toSave = messages.slice(-MAX_STORED_MESSAGES);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(toSave));
}

export function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearMessages(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MESSAGES_KEY);
}

export function saveModel(modelId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODEL_KEY, modelId);
}

export function loadModel(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MODEL_KEY);
}
