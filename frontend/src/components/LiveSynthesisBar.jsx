import React from 'react';
import { Sparkles, MessageSquareQuote } from 'lucide-react';

export default function LiveSynthesisBar({ rating, selectedPromptTexts = [], customText = '' }) {
  if (selectedPromptTexts.length === 0 && !customText && !rating) return null;

  let mood = 'Balanced';
  let moodColor = 'text-teal-700 bg-teal-50 border-teal-200';
  if (rating >= 4) {
    mood = 'Celebratory Praise';
    moodColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (rating && rating <= 3) {
    mood = 'Constructive Feedback';
    moodColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  const items = [...selectedPromptTexts];
  if (customText.trim()) items.push(`"${customText.trim()}"`);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-teal-50/80 via-[#FAF6F0] to-amber-50/80 rounded-2xl p-3.5 border border-teal-200/60 shadow-xs space-y-1.5 transition-all duration-300">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-madverse-espresso flex items-center gap-1.5">
          <Sparkles size={13} className="text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
          Live Draft Synthesis
        </span>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${moodColor}`}>
          {mood}
        </span>
      </div>

      <p className="text-xs text-madverse-espresso-500 leading-relaxed italic">
        {items.length > 0 ? (
          <>
            Focusing on <strong className="text-madverse-espresso not-italic">{items.join(', ')}</strong> with {rating ? `${rating}★ intent` : 'neutral tone'}.
          </>
        ) : (
          `Rating guidance set to ${rating}★. Select details below to generate your review.`
        )}
      </p>
    </div>
  );
}
