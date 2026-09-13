'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ModelId, ReactionType } from '@/types';
import { saveMessages, loadMessages, clearMessages, saveModel, loadModel } from '@/lib/storage';
import { DEFAULT_MODEL, MODELS } from '@/lib/models';
import { useRequestMeter } from '@/components/request-meter';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function readChatStream(
  response: Response,
  onChunk: (content: string) => void,
): Promise<number | null> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The AI provider returned no response stream.');

  const decoder = new TextDecoder();
  let buffer = '';
  let tokens: number | null = null;

  const processLines = (lines: string[]) => {
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;

      try {
        const data = JSON.parse(payload);
        const content = data.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
        if (data.usage?.total_tokens) tokens = data.usage.total_tokens;
      } catch {
        // Ignore malformed partial events; the next read completes the JSON.
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    processLines(lines);
  }

  if (buffer) processLines([buffer]);
  return tokens;
}

export function useChatState() {
  const { requestStarted, requestFinished } = useRequestMeter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL.id);
  const [isLoading, setIsLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedMessages = loadMessages();
    const storedModel = loadModel();
    if (storedMessages.length > 0) {
      // Migrate old messages without IDs
      const migratedMessages = storedMessages.map((m: Message) => ({
        ...m,
        id: m.id || generateId(),
      }));
      setMessages(migratedMessages);
      // Calculate total tokens from existing messages
      const existingTokens = migratedMessages.reduce((acc: number, m: Message) => acc + (m.tokens || 0), 0);
      setTotalTokens(existingTokens);
    }
    if (storedModel && MODELS.some((model) => model.id === storedModel)) {
      setSelectedModel(storedModel as ModelId);
    }
    setSessionStartTime(new Date());
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string, resendFromId?: string) => {
    if (!content.trim() || isLoading) return;

    // If resending, remove messages from that point onward
    if (resendFromId) {
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === resendFromId);
        if (index !== -1) {
          return prev.slice(0, index);
        }
        return prev;
      });
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    requestStarted();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: content.trim(),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API request failed (${response.status})`);
      }

      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        content: '',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      const tokens = await readChatStream(response, (chunk) => {
        setMessages((prev) => prev.map((message) => (
          message.id === aiMessage.id
            ? { ...message, content: message.content + chunk }
            : message
        )));
      });
      if (tokens) {
        setMessages((prev) => prev.map((message) => (
          message.id === aiMessage.id ? { ...message, tokens: tokens || undefined } : message
        )));
        setTotalTokens((prev) => prev + tokens);
        setSessionTokens((prev) => prev + tokens);
      }
      setIsOnline(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setIsOnline(true);
        return;
      }
      setIsOnline(false);
      const errorMessage: Message = {
        id: generateId(),
        role: 'ai',
        content: error instanceof Error && error.message === 'NVIDIA_API_KEY not configured'
          ? 'The AI API is not configured. Add NVIDIA_API_KEY to .env and restart the dev server.'
          : error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      abortControllerRef.current = null;
      requestFinished();
      setIsLoading(false);
    }
  }, [selectedModel, isLoading, requestStarted, requestFinished]);

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const regenerateMessage = useCallback(async (messageId: string) => {
    // Find the AI message and the user message before it
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'ai') return;

    // Find the previous user message
    let userMessage: Message | null = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) return;

    // Remove messages from AI message onward
    setMessages((prev) => prev.slice(0, messageIndex));
    
    // Re-send the user message
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        content: '',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      const tokens = await readChatStream(response, (chunk) => {
        setMessages((prev) => prev.map((message) => (
          message.id === aiMessage.id
            ? { ...message, content: message.content + chunk }
            : message
        )));
      });
      if (tokens) {
        setMessages((prev) => prev.map((message) => (
          message.id === aiMessage.id ? { ...message, tokens: tokens || undefined } : message
        )));
        setTotalTokens((prev) => prev + tokens);
        setSessionTokens((prev) => prev + tokens);
      }
      setIsOnline(true);
    } catch {
      setIsOnline(false);
      const errorMessage: Message = {
        id: generateId(),
        role: 'ai',
        content: 'Sorry, I encountered an error while regenerating. Please try again.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedModel]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;

    // Update the message content
    const updatedMessage = {
      ...messages[messageIndex],
      content: newContent,
      isEdited: true,
    };

    // Remove all messages from this point onward and add the updated message
    setMessages((prev) => prev.slice(0, messageIndex));
    
    // Re-send the edited message
    sendMessage(newContent);
  }, [messages, sendMessage]);

  const reactToMessage = useCallback((messageId: string, reaction: ReactionType) => {
    setMessages((prev) => prev.map((m) => {
      if (m.id === messageId) {
        const currentReactions = m.reactions || [];
        const hasReaction = currentReactions.includes(reaction);
        
        return {
          ...m,
          reactions: hasReaction
            ? currentReactions.filter((r) => r !== reaction)
            : [...currentReactions, reaction],
        };
      }
      return m;
    }));
  }, []);

  const clearChat = useCallback(async () => {
    setMessages([]);
    setTotalTokens(0);
    setSessionTokens(0);
    clearMessages();
    
    // Clear server-side history
    try {
      await fetch(`${API_BASE}/api/clear`, { method: 'POST' });
    } catch {
      // Silently fail
    }
  }, []);

  const changeModel = useCallback((modelId: ModelId) => {
    setSelectedModel(modelId);
    saveModel(modelId);
  }, []);

  const exportChat = useCallback(() => {
    const content = messages
      .map((m) => `[${m.time}] ${m.role === 'user' ? 'You' : 'NeuraChat'}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurachat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  return {
    messages,
    selectedModel,
    isLoading,
    totalTokens,
    sessionTokens,
    isOnline,
    sessionStartTime,
    sendMessage,
    stopGenerating,
    clearChat,
    changeModel,
    exportChat,
    editMessage,
    reactToMessage,
    regenerateMessage,
  };
}
