'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/chat/sidebar';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatArea } from '@/components/chat/chat-area';
import { InputBar } from '@/components/chat/input-bar';
import { NeuraToast } from '@/components/ui/neura-toast';
import { WelcomeScreen } from '@/components/welcome-screen';
import { PromptTemplates } from '@/components/prompt-templates';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { TokenTracker } from '@/components/token-tracker';
import { useChatState } from '@/hooks/use-chat-state';
import { useNeuraToast } from '@/hooks/use-neura-toast';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTokenTracker, setShowTokenTracker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const { toasts, showToast } = useNeuraToast();
  
  const {
    messages,
    selectedModel,
    isLoading,
    totalTokens,
    sessionTokens,
    isOnline,
    sessionStartTime,
    sendMessage,
    clearChat,
    changeModel,
    exportChat,
    editMessage,
    reactToMessage,
    regenerateMessage,
  } = useChatState();

  // Check if user has seen welcome screen before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('neura-welcome-seen');
    if (hasSeenWelcome === 'true') {
      setShowWelcome(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Clear chat: Ctrl+Shift+Delete
      if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        clearChat();
        showToast('Chat cleared', 'success');
      }
      // Close modals/sidebar: Escape
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowTemplates(false);
        setShowShortcuts(false);
        setShowTokenTracker(false);
      }
      // Open templates: Ctrl+T
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        setShowTemplates(true);
      }
      // Show shortcuts: Ctrl+/
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Enter to dismiss welcome
      if (e.key === 'Enter' && showWelcome) {
        handleWelcomeComplete();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [clearChat, showToast, showWelcome]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    localStorage.setItem('neura-welcome-seen', 'true');
  };

  const handleModelChange = (modelId: typeof selectedModel) => {
    changeModel(modelId);
    showToast('Model changed', 'success');
  };

  const handleClear = () => {
    clearChat();
    showToast('Chat cleared', 'success');
  };

  const handleExport = () => {
    if (messages.length === 0) {
      showToast('No messages to export', 'error');
      return;
    }
    exportChat();
    showToast('Chat exported', 'success');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleTemplateSelect = (prompt: string) => {
    setSelectedTemplate(prompt);
  };

  const handleRegenerate = (messageId: string) => {
    regenerateMessage(messageId);
    showToast('Regenerating response...', 'success');
  };

  // Show welcome screen
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="h-dvh flex overflow-hidden bg-background">
      <Sidebar
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onNewChat={handleClear}
        totalTokens={totalTokens}
        isOnline={isOnline}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col md:ml-60">
        <ChatHeader
          selectedModel={selectedModel}
          onMenuClick={() => setSidebarOpen(true)}
          onExport={handleExport}
          onClear={handleClear}
          onOpenTokenTracker={() => setShowTokenTracker(true)}
          onOpenShortcuts={() => setShowShortcuts(true)}
          totalTokens={totalTokens}
        />

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
          onReact={reactToMessage}
          onEdit={editMessage}
          onRegenerate={handleRegenerate}
        />

        <InputBar 
          onSend={sendMessage} 
          isLoading={isLoading} 
          onOpenTemplates={() => setShowTemplates(true)}
          initialValue={selectedTemplate}
        />
      </main>

      {/* Modals */}
      <PromptTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />

      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <TokenTracker
        isOpen={showTokenTracker}
        onClose={() => setShowTokenTracker(false)}
        totalTokens={totalTokens}
        sessionTokens={sessionTokens}
        messageCount={messages.length}
        startTime={sessionStartTime}
      />

      <NeuraToast toasts={toasts} />
    </div>
  );
}
