'use client';

import { 
  FileText, 
  BookOpen, 
  Code, 
  HelpCircle, 
  Mail, 
  Scale 
} from 'lucide-react';
import { MODELS } from '@/lib/models';
import type { ToolName, ModelId } from '@/types';

interface ToolsSidebarProps {
  activeTool: ToolName;
  onToolChange: (tool: ToolName) => void;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
}

const TOOLS = [
  { id: 'summarize' as ToolName, name: 'Summarizer', icon: FileText },
  { id: 'story' as ToolName, name: 'Story Generator', icon: BookOpen },
  { id: 'code' as ToolName, name: 'Code Explainer', icon: Code },
  { id: 'quiz' as ToolName, name: 'Quiz Generator', icon: HelpCircle },
  { id: 'email' as ToolName, name: 'Email Writer', icon: Mail },
  { id: 'debate' as ToolName, name: 'Debate Generator', icon: Scale },
];

export function ToolsSidebar({ activeTool, onToolChange, selectedModel, onModelChange }: ToolsSidebarProps) {
  return (
    <aside className="hidden md:block w-[220px] flex-shrink-0 sticky top-[54px] h-[calc(100dvh-54px)] border-r border-white/8 overflow-y-auto">
      <div className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-3 px-2">
          Tools
        </div>

        <div className="space-y-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolChange(tool.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                ${activeTool === tool.id 
                  ? 'bg-white/[.07] text-white border-l-2 border-[#b7ff5a] shadow-[inset_0_0_24px_rgba(183,255,90,0.04)]' 
                  : 'text-[#888] hover:text-white hover:bg-white/5'}
              `}
            >
              <tool.icon className="w-4 h-4" />
              <span className="text-[13px]">{tool.name}</span>
            </button>
          ))}
        </div>

        <div className="my-6 border-t border-white/8" />

        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-3 px-2">
          Model
        </div>

        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value as ModelId)}
          className="w-full px-3 py-2.5 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] appearance-none cursor-pointer focus:outline-none focus:border-white/22 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23888%22%3E%3Cpath%20d%3D%22m2%204%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
