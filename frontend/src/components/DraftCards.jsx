import React from 'react';
import { Sparkles, ArrowRight, Check, Quote } from 'lucide-react';

export default function DraftCards({ drafts = [], onSelect, selectedDraft }) {
  if (!drafts || drafts.length === 0) {
    return (
      <div className="p-8 text-center text-madverse-espresso-400 bg-white rounded-2xl border border-amber-900/10">
        No draft variants available. Tap 'Start over' to generate new options.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {drafts.map((draft, idx) => {
        const isSelected = selectedDraft === draft.id;
        const wordCount = draft.text ? draft.text.trim().split(/\s+/).length : 0;

        return (
          <div
            key={draft.id || idx}
            onClick={() => onSelect(draft.id, draft.text)}
            className={`group relative text-left p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 border bg-white ${
              isSelected
                ? 'border-teal-700 ring-2 ring-teal-500/20 shadow-md shadow-teal-700/10'
                : 'border-amber-900/15 hover:border-teal-400 hover:shadow-sm'
            }`}
          >
            {/* Header: Tone & Badge */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span className="text-xs font-bold text-madverse-espresso tracking-tight">
                  {draft.tone || `Style Option ${idx + 1}`}
                </span>
                {draft.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70">
                    {draft.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-mono text-madverse-espresso-400">
                {wordCount} words
              </span>
            </div>

            {/* Review Quote Body */}
            <div className="relative pl-3 border-l-2 border-amber-900/20 group-hover:border-teal-500 transition-colors my-2">
              <p className="text-madverse-espresso text-sm sm:text-base leading-relaxed font-normal">
                "{draft.text}"
              </p>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-amber-900/10 text-xs">
              <span className="text-madverse-espresso-400 flex items-center gap-1 text-[11px]">
                <Sparkles size={11} className="text-amber-500" />
                Fact-grounded
              </span>

              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-teal-700 hover:bg-teal-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(draft.id, draft.text);
                }}
              >
                <span>{isSelected ? 'Selected' : 'Use & Edit Draft'}</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
