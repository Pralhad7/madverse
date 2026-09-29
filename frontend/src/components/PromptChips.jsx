import React from 'react';
import { Check, Plus, ThumbsUp, AlertCircle, Sparkles } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function PromptChips({ prompts = [], selectedPrompts = [], onToggle }) {
  if (!prompts || prompts.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-madverse-espresso-400 bg-white/60 rounded-xl border border-dashed border-amber-900/15">
        No specific topics loaded. You can describe your experience in the text field below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-madverse-espresso-500 px-1">
        <span className="font-bold text-madverse-espresso flex items-center gap-1.5">
          <Sparkles size={14} className="text-teal-600" />
          Tap any details you observed:
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
          selectedPrompts.length > 0 
            ? 'bg-teal-100 text-teal-800' 
            : 'bg-[#FAF6F0] text-madverse-espresso-400'
        }`}>
          {selectedPrompts.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {prompts.map(prompt => {
          const isSelected = selectedPrompts.includes(prompt.id);
          const isNegative = prompt.type === 'negative';

          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => {
                playTapSound(580);
                onToggle(prompt.id);
              }}
              className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 border ${
                isSelected
                  ? isNegative
                    ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-200 focus:ring-red-400'
                    : 'bg-teal-700 text-white border-teal-700 shadow-sm shadow-teal-200 focus:ring-teal-400'
                  : isNegative
                    ? 'bg-red-50/60 hover:bg-red-100/70 text-red-700 border-red-200/80 hover:border-red-300'
                    : 'bg-white hover:bg-[#FAF6F0] text-madverse-espresso border-amber-900/15 hover:border-teal-400 shadow-2xs'
              }`}
            >
              {isSelected ? (
                <Check size={14} className="shrink-0 stroke-[3]" />
              ) : isNegative ? (
                <AlertCircle size={14} className="shrink-0 text-red-500 group-hover:scale-110 transition-transform" />
              ) : (
                <Plus size={14} className="shrink-0 text-madverse-espresso-400 group-hover:text-teal-600 group-hover:scale-110 transition-transform" />
              )}
              <span>{prompt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
