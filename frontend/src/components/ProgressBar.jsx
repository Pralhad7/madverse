import React from 'react';

const STEP_LABELS = ['Welcome', 'Rating', 'Details', 'Review'];

export default function ProgressBar({ currentStep, totalSteps = 4 }) {
  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / totalSteps) * 100));

  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between text-xs text-madverse-espresso-500 font-semibold mb-2">
        <span className="text-madverse-espresso tracking-tight">
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}: <span className="text-teal-700 font-bold">{STEP_LABELS[currentStep] || 'Draft'}</span>
        </span>
        <span className="font-mono text-[11px] text-madverse-espresso-400">{progressPercent}%</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-amber-900/10 rounded-full overflow-hidden p-0.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-teal-700'
                  : isCurrent
                    ? 'bg-gradient-to-r from-teal-500 to-amber-600 shadow-xs'
                    : 'bg-amber-900/15'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
