export type ReactionType = 'like' | 'dislike' | 'helpful' | 'creative';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  time: string;
  reactions?: ReactionType[];
  isEdited?: boolean;
  tokens?: number;
}

export interface ChatResponse {
  reply: string;
  model: string;
  tokens: number | null;
}

export interface SummarizeRequest {
  text: string;
  style: 'concise' | 'detailed' | 'bullet' | 'eli5';
  model: string;
}

export interface SummarizeResponse {
  summary: string;
  tokens: number | null;
  word_count: number;
}

export interface StoryRequest {
  prompt: string;
  genre: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  protagonist?: string;
  setting?: string;
  model: string;
  continue_story?: string;
}

export interface StoryResponse {
  story: string;
  tokens: number;
}

export interface CodeRequest {
  code: string;
  mode: 'line-by-line' | 'overview' | 'debug' | 'complexity';
  language?: string;
  model: string;
}

export interface CodeResponse {
  explanation: string;
  tokens: number;
}

export interface QuizRequest {
  topic: string;
  type: 'mcq' | 'true-false' | 'short';
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  model: string;
}

export interface QuizResponse {
  quiz: string;
  tokens: number;
}

export interface EmailRequest {
  intent: string;
  recipient?: string;
  sender?: string;
  tone: 'professional' | 'formal' | 'friendly' | 'assertive' | 'apologetic';
  length: 'short' | 'medium' | 'detailed';
  context?: string;
  model: string;
}

export interface EmailResponse {
  email: string;
  tokens: number;
}

export interface DebateRequest {
  topic: string;
  side: 'both' | 'for' | 'against';
  depth: 'brief' | 'standard' | 'deep';
  model: string;
}

export interface DebateResponse {
  debate: string;
  tokens: number;
}

export type ToolName = 'summarize' | 'story' | 'code' | 'quiz' | 'email' | 'debate';

export type ModelId =
  | 'deepseek-ai/deepseek-v4-flash-0731';

export interface ModelOption {
  id: ModelId;
  name: string;
  tag: string;
}
