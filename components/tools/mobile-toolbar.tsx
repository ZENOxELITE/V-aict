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

interface MobileToolbarProps {
  activeTool: ToolName;
  onToolChange: (tool: ToolName) => void;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
}

const TOOLS = [
  { id: 'summarize' as ToolName, name: 'Summarize', icon: FileText },
  { id: 'story' as ToolName, name: 'Story', icon: BookOpen },
  { id: 'code' as ToolName, name: 'Code', icon: Code },
  { id: 'quiz' as ToolName, name: 'Quiz', icon: HelpCircle },
  { id: 'email' as ToolName, name: 'Email', icon: Mail },
  { id: 'debate' as ToolName, name: 'Debate', icon: Scale },
];

export function MobileToolbar({ activeTool, onToolChange, selectedModel, onModelChange }: MobileToolbarProps) {
  return (
    <div className="md:hidden border-b border-white/8">
      {/* Tool pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onToolChange(tool.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-[13px] whitespace-nowrap transition-all flex-shrink-0
              ${activeTool === tool.id 
                ? 'bg-white text-black' 
                : 'bg-[#111] border border-white/8 text-[#888]'}
            `}
          >
            <tool.icon className="w-4 h-4" />
            {tool.name}
          </button>
        ))}
      </div>

      {/* Model selector */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-white/8">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">
          Model
        </span>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value as ModelId)}
          className="flex-1 px-3 py-2 bg-[#111] border border-white/12 rounded-lg text-[13px] text-[#ededed] appearance-none cursor-pointer focus:outline-none focus:border-white/22 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23888%22%3E%3Cpath%20d%3D%22m2%204%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
