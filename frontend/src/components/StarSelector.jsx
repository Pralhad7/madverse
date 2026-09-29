import React, { useState } from 'react';
import { Star, Info } from 'lucide-react';
import { playStarPop } from '../utils/sound';

const STARS = [
  { 
    value: 1, 
    label: 'Needs Significant Improvement', 
    emoji: '😕',
    toneTip: 'Constructive mode: Details areas for refinement politely & respectfully' 
  },
  { 
    value: 2, 
    label: 'Below Expectations', 
    emoji: '🙁',
    toneTip: 'Actionable mode: Highlights specific opportunities for the team' 
  },
  { 
    value: 3, 
    label: 'Average Experience', 
    emoji: '😐',
    toneTip: 'Balanced mode: Captures both positive highlights and shortcomings' 
  },
  { 
    value: 4, 
    label: 'Great Visit', 
    emoji: '😊',
    toneTip: 'Positive mode: Emphasizes standout craft, service, and ambiance' 
  },
  { 
    value: 5, 
    label: 'Exceptional Experience', 
    emoji: '✨',
    toneTip: 'Celebratory mode: Praise highlighting memorable team hospitality' 
  },
];

export default function StarSelector({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;
  const currentStar = STARS.find(s => s.value === displayValue);

  return (
    <div className="flex flex-col items-center select-none py-2">
      {/* Animated Emoji Avatar */}
      <div className="w-14 h-14 rounded-2xl bg-amber-50/90 border border-amber-200/60 shadow-xs flex items-center justify-center text-2xl mb-3 transition-transform duration-200 transform scale-100 hover:scale-105">
        <span>{currentStar ? currentStar.emoji : '👋'}</span>
      </div>

      {/* 5-Star Row */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-amber-900/10 shadow-2xs">
        {STARS.map((star) => {
          const isActive = star.value <= displayValue;
          return (
            <button
              key={star.value}
              type="button"
              onClick={() => {
                playStarPop(star.value);
                onChange(star.value);
              }}
              onMouseEnter={() => setHoverValue(star.value)}
              onMouseLeave={() => setHoverValue(0)}
              className={`p-2 rounded-xl transition-all duration-150 transform focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isActive 
                  ? 'text-amber-400 scale-110 drop-shadow-xs' 
                  : 'text-stone-200 hover:text-amber-200 hover:scale-105'
              }`}
              aria-label={`Select ${star.label}`}
            >
              <Star 
                size={32} 
                className={`transition-colors ${isActive ? 'fill-amber-400' : 'fill-stone-100'}`} 
              />
            </button>
          );
        })}
      </div>

      {/* Dynamic Label and Tone Tip */}
      <div className="text-center min-h-[3.5rem] px-4">
        <h4 className="font-black text-madverse-espresso text-base sm:text-lg tracking-tight transition-opacity duration-200">
          {currentStar ? currentStar.label : 'Select your overall sentiment'}
        </h4>
        
        {currentStar ? (
          <p className="text-xs text-madverse-espresso-500 mt-1 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block"></span>
            {currentStar.toneTip}
          </p>
        ) : (
          <p className="text-xs text-madverse-espresso-400 mt-1">
            Helps our AI customize the vocabulary and tone of your draft
          </p>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-madverse-espresso-500 bg-[#FAF6F0] px-3.5 py-1.5 rounded-full border border-amber-900/10">
        <Info size={13} className="text-teal-600 shrink-0" />
        <span>Writing aid only — you choose your true stars freely on Google.</span>
      </div>
    </div>
  );
}
