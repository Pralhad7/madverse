import React from 'react';
import { Sparkles, Check, Plus } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function StoryCanvas({ 
  prompts = [], 
  selectedPromptIds = [], 
  onTogglePrompt,
  rating,
  businessName = 'MadVerse'
}) {
  const selectedList = prompts.filter(p => selectedPromptIds.includes(p.id));

  return (
    <div className="space-y-3.5">
      {/* Live Interactive Kinetic Preview Card */}
      <div className="relative rounded-2xl p-4 bg-[#2B1810] text-[#FAF7F2] shadow-xs border border-stone-800">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold flex items-center gap-1.5 text-teal-400">
            <Sparkles size={13} className="text-amber-400" />
            <span>Kinetic Story Preview</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-stone-300">
            {selectedList.length} memories attached
          </span>
        </div>

        {/* Synthesized Live Sentence */}
        <div className="min-h-[4rem] flex items-center">
          <p className="text-xs sm:text-sm leading-relaxed text-stone-100">
            <span className="text-stone-400">"I experienced {businessName} and noticed that </span>
            {selectedList.length === 0 ? (
              <span className="italic text-stone-500 underline decoration-dashed">
                (tap memories below to weave into your review...)
              </span>
            ) : (
              selectedList.map((item, idx) => (
                <span 
                  key={item.id}
                  className="inline-flex items-center font-bold px-2 py-0.5 mx-0.5 rounded-md text-xs bg-teal-500/20 border border-teal-400/30 text-teal-300"
                >
                  {item.text}
                  {idx < selectedList.length - 1 ? ' ·' : ''}
                </span>
              ))
            )}
            <span className="text-stone-400">
              {rating ? ` — overall a ${rating}★ visit."` : '."'}
            </span>
          </p>
        </div>
      </div>

      {/* Interactive Tag Cloud */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span className="font-bold text-[#2B1810]">Tap to attach genuine details:</span>
          <span className="text-[11px] text-stone-400 font-medium">100% Honest · No Fake Claims</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map(prompt => {
            const isSelected = selectedPromptIds.includes(prompt.id);
            const isNegative = prompt.type === 'negative';

            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() => {
                  playTapSound(isSelected ? 450 : 650);
                  onTogglePrompt(prompt.id);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all transform active:scale-95 border ${
                  isSelected
                    ? isNegative
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : isNegative
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 shadow-2xs'
                }`}
              >
                {isSelected ? (
                  <Check size={13} className="stroke-[3]" />
                ) : (
                  <Plus size={13} className="text-stone-400 group-hover:scale-110 transition-transform" />
                )}
                <span>{prompt.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
