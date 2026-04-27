'use client';

import { useState, useEffect } from 'react';
import { ToolsNav } from '@/components/tools/tools-nav';
import { ToolsSidebar } from '@/components/tools/tools-sidebar';
import { MobileToolbar } from '@/components/tools/mobile-toolbar';
import { Summarizer } from '@/components/tools/summarizer';
import { StoryGenerator } from '@/components/tools/story-generator';
import { CodeExplainer } from '@/components/tools/code-explainer';
import { QuizGenerator } from '@/components/tools/quiz-generator';
import { EmailWriter } from '@/components/tools/email-writer';
import { DebateGenerator } from '@/components/tools/debate-generator';
import { NeuraToast } from '@/components/ui/neura-toast';
import { useNeuraToast } from '@/hooks/use-neura-toast';
import { loadModel, saveModel } from '@/lib/storage';
import { DEFAULT_MODEL } from '@/lib/models';
import type { ToolName, ModelId } from '@/types';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolName>('summarize');
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL.id);
  const { toasts, showToast } = useNeuraToast();

  // Load model from localStorage
  useEffect(() => {
    const storedModel = loadModel();
    if (storedModel) {
      setSelectedModel(storedModel as ModelId);
    }
  }, []);

  const handleModelChange = (modelId: ModelId) => {
    setSelectedModel(modelId);
    saveModel(modelId);
    showToast('Model changed', 'success');
  };

  const renderTool = () => {
    const props = { selectedModel, onShowToast: showToast };
    
    switch (activeTool) {
      case 'summarize':
        return <Summarizer {...props} />;
      case 'story':
        return <StoryGenerator {...props} />;
      case 'code':
        return <CodeExplainer {...props} />;
      case 'quiz':
        return <QuizGenerator {...props} />;
      case 'email':
        return <EmailWriter {...props} />;
      case 'debate':
        return <DebateGenerator {...props} />;
      default:
        return <Summarizer {...props} />;
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <ToolsNav />

      <MobileToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />

      <div className="flex-1 flex">
        <ToolsSidebar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-3xl">
            {renderTool()}
          </div>
        </main>
      </div>

      <NeuraToast toasts={toasts} />
    </div>
  );
}
