import type { ModelOption } from '@/types';

export const MODELS: ModelOption[] = [
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', tag: 'New' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', tag: 'Smart' },
  // { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', tag: 'Reasoning' },
 // { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', tag: 'Code' },
//  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', tag: 'Google' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', tag: 'Fast' },
];

export const DEFAULT_MODEL = MODELS[0];
