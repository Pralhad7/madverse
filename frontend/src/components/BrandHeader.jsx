import React from 'react';
import { ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import defaultLogoMark from '../assets/logo-mark.png';

export default function BrandHeader({ 
  businessName = 'MadVerse', 
  locationName = 'Experience Studio', 
  logoUrl = null, 
  primaryColor = '#0D9488' 
}) {
  const isMadVerse = !businessName || businessName.toLowerCase().includes('madverse');
  const displayLogo = logoUrl || (isMadVerse ? defaultLogoMark : null);
  const initial = businessName ? businessName.charAt(0).toUpperCase() : 'M';

  return (
    <header className="rounded-2xl p-4 sm:p-5 mb-5 shadow-2xs border border-stone-200/90 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {displayLogo ? (
            <div className="relative group flex items-center">
              <img 
                src={displayLogo} 
                alt={`${businessName} logo`} 
                className="h-10 sm:h-11 w-auto max-w-[130px] object-contain mix-blend-multiply"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultLogoMark;
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              </span>
            </div>
          ) : (
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-xs"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, #2B1810 100%)` 
              }}
            >
              {initial}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-[#2B1810] tracking-tight leading-snug">
                {businessName || 'MadVerse'}
              </h1>
              <span className="inline-flex items-center text-teal-600" title="Verified Brand Profile">
                <ShieldCheck size={16} className="fill-teal-50 text-teal-600" />
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              {locationName && (
                <p className="flex items-center gap-1 text-xs font-medium text-stone-500">
                  <MapPin size={12} className="text-teal-600" />
                  <span>{locationName}</span>
                </p>
              )}
              {isMadVerse && (
                <span className="text-[10px] font-bold tracking-widest text-amber-700 uppercase">
                  · CREATE BEYOND ORDINARY
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live verified badge */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            Verified Feedback
          </span>
          <span className="text-[10px] font-medium text-stone-400 mt-1 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500 fill-amber-400" /> Google Compliant
          </span>
        </div>
      </div>
    </header>
  );
}
