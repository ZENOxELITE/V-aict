'use client';

import { useState } from 'react';
import { X, Search, FileText, Code, Lightbulb, Mail, BookOpen, Briefcase, Heart, Rocket, Palette, GraduationCap, Calculator } from 'lucide-react';

interface PromptTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Lightbulb },
  { id: 'writing', label: 'Writing', icon: FileText },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'creative', label: 'Creative', icon: Palette },
];

const TEMPLATES = [
  // Writing
  { id: 1, category: 'writing', title: 'Explain Like I\'m 5', prompt: 'Explain [concept] in simple terms that a 5-year-old would understand.', icon: Lightbulb },
  { id: 2, category: 'writing', title: 'Write a Blog Post', prompt: 'Write a comprehensive blog post about [topic]. Include an introduction, main points, and a conclusion.', icon: FileText },
  { id: 3, category: 'writing', title: 'Proofread & Edit', prompt: 'Please proofread and edit the following text for grammar, clarity, and style: [paste your text]', icon: FileText },
  { id: 4, category: 'writing', title: 'Summarize Article', prompt: 'Summarize the following article in 3-5 bullet points: [paste article]', icon: BookOpen },
  
  // Coding
  { id: 5, category: 'coding', title: 'Debug This Code', prompt: 'Help me debug this code. Here\'s the error I\'m getting: [error]. Here\'s the code: [code]', icon: Code },
  { id: 6, category: 'coding', title: 'Code Review', prompt: 'Review the following code for best practices, potential bugs, and performance improvements: [paste code]', icon: Code },
  { id: 7, category: 'coding', title: 'Convert Code', prompt: 'Convert the following code from [language1] to [language2]: [paste code]', icon: Code },
  { id: 8, category: 'coding', title: 'Write Unit Tests', prompt: 'Write comprehensive unit tests for the following function: [paste function]', icon: Code },
  
  // Business
  { id: 9, category: 'business', title: 'Professional Email', prompt: 'Write a professional email to [recipient] about [subject]. The tone should be [formal/friendly/assertive].', icon: Mail },
  { id: 10, category: 'business', title: 'Meeting Agenda', prompt: 'Create a detailed meeting agenda for a [meeting type] meeting. Topics to cover: [topics]', icon: Briefcase },
  { id: 11, category: 'business', title: 'SWOT Analysis', prompt: 'Conduct a SWOT analysis for [company/product]. Consider strengths, weaknesses, opportunities, and threats.', icon: Briefcase },
  { id: 12, category: 'business', title: 'Project Proposal', prompt: 'Write a project proposal for [project name]. Include objectives, timeline, budget, and expected outcomes.', icon: Rocket },
  
  // Education
  { id: 13, category: 'education', title: 'Study Notes', prompt: 'Create comprehensive study notes for [topic/chapter]. Include key concepts, definitions, and examples.', icon: GraduationCap },
  { id: 14, category: 'education', title: 'Practice Questions', prompt: 'Generate 10 practice questions on [topic] at [difficulty level] level with answers and explanations.', icon: GraduationCap },
  { id: 15, category: 'education', title: 'Solve Math Problem', prompt: 'Solve this math problem step by step: [problem]. Explain each step clearly.', icon: Calculator },
  { id: 16, category: 'education', title: 'Research Summary', prompt: 'Summarize the current research and findings on [topic]. Include key studies and their conclusions.', icon: BookOpen },
  
  // Creative
  { id: 17, category: 'creative', title: 'Story Starter', prompt: 'Write the opening paragraph of a [genre] story set in [setting] with a protagonist who [character trait].', icon: Palette },
  { id: 18, category: 'creative', title: 'Character Profile', prompt: 'Create a detailed character profile including background, personality, goals, and flaws for a [type] character.', icon: Heart },
  { id: 19, category: 'creative', title: 'Dialogue Scene', prompt: 'Write a dialogue scene between two characters who are [relationship] discussing [topic].', icon: Palette },
  { id: 20, category: 'creative', title: 'World Building', prompt: 'Help me build a fictional world for my [genre] story. Include geography, culture, and history.', icon: Rocket },
];

export function PromptTemplates({ isOpen, onClose, onSelect }: PromptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(search.toLowerCase()) ||
                         template.prompt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-surface border border-border-mid rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Prompt Templates</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full h-11 pl-10 pr-4 bg-surface2 border border-border rounded-lg text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide border-b border-border">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors
                ${selectedCategory === cat.id 
                  ? 'bg-accent text-background' 
                  : 'bg-surface2 text-muted hover:text-foreground hover:bg-surface3'}
              `}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  onSelect(template.prompt);
                  onClose();
                }}
                className="text-left p-4 bg-surface2 border border-border rounded-xl hover:border-accent/50 hover:bg-surface3 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface3 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <template.icon className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1 truncate">
                      {template.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2">
                      {template.prompt}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted font-medium">
              No templates found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
