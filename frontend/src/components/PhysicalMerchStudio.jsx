import React, { useState, useRef } from 'react';
import { 
  Printer, Download, Sparkles, Layers, Sliders, 
  RotateCw, Eye, Check, Star, ShieldCheck
} from 'lucide-react';
import { playTapSound } from '../utils/sound';
import logo from '../assets/logo.png';

export default function PhysicalMerchStudio({ 
  locationId, 
  businessName = 'MadVerse', 
  primaryColor = '#0D9488' 
}) {
  const [merchType, setMerchType] = useState('acrylic'); // 'acrylic', 'tent', 'sticker', 'receipt'
  const [headline, setHeadline] = useState('CREATE BEYOND ORDINARY');
  const [subtext, setSubtext] = useState('Point camera to draft your honest Google review');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const qrUrl = `/api/qr/generate/${locationId || 'default'}`;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 10,
      y: (x / (rect.width / 2)) * 10,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handlePrint = () => {
    playTapSound(800);
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Merch Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        {[
          { id: 'acrylic', label: 'Acrylic Counter Stand', icon: '🪞' },
          { id: 'tent', label: 'Folded Table Tent', icon: '📄' },
          { id: 'sticker', label: 'Window / Door Cling', icon: '🪟' },
          { id: 'receipt', label: 'Receipt / Check Slip', icon: '🧾' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              playTapSound(600);
              setMerchType(item.id);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              merchType === item.id
                ? 'bg-white text-[#2B1810] shadow-2xs scale-100'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 3D Perspective Stage: Clean, Minimalist Studio */}
      <div 
        className="relative bg-stone-50/70 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[480px] overflow-hidden border border-stone-200/90 perspective-1000 shadow-2xs"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 3D Transformable Physical Object */}
        <div
          ref={cardRef}
          className="transition-transform duration-150 ease-out select-none"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Acrylic Stand View */}
          {merchType === 'acrylic' && (
            <div className="relative w-72 sm:w-80">
              {/* Acrylic Glass Plate */}
              <div className="relative rounded-2xl bg-white p-6 shadow-xl border border-stone-200 text-center space-y-3.5">
                {/* Specular Highlight */}
                <div className="absolute top-0 right-0 left-0 h-28 bg-gradient-to-b from-stone-50/80 to-transparent rounded-t-2xl pointer-events-none" />

                {/* MadVerse Logo & Header */}
                <div className="flex flex-col items-center justify-center">
                  <img 
                    src={logo} 
                    alt="MadVerse Logo" 
                    className="h-10 w-auto object-contain mx-auto mix-blend-multiply" 
                  />
                </div>

                {/* Brand & Stars */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={15} className="fill-amber-400 drop-shadow-2xs" />
                    ))}
                  </div>
                  <h3 className="text-sm font-black text-[#2B1810] tracking-tight">
                    {headline}
                  </h3>
                  <p className="text-[11px] text-stone-500 max-w-[210px] mx-auto leading-tight">
                    {subtext}
                  </p>
                </div>

                {/* QR Code Frame */}
                <div className="p-3 bg-white rounded-2xl border border-stone-200 inline-block shadow-xs">
                  <img src={qrUrl} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
                </div>

                {/* Footer Brand Label */}
                <div className="pt-1">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white shadow-2xs" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Review {businessName} on Google</span>
                  </div>
                </div>
              </div>

              {/* Wooden Stand Base */}
              <div className="relative -mt-2 mx-auto w-60 h-5 bg-gradient-to-r from-[#2B1810] via-[#3D2418] to-[#2B1810] rounded-lg shadow-lg border-t border-amber-600/40 flex items-center justify-center">
                <div className="w-44 h-1 bg-[#1C0F0A] rounded-full shadow-inner" />
              </div>
            </div>
          )}

          {/* Folded Table Tent Card */}
          {merchType === 'tent' && (
            <div className="w-72 sm:w-80 bg-white rounded-t-2xl rounded-b-sm p-6 shadow-xl border border-stone-200 text-center space-y-4 relative">
              <div className="absolute top-2 left-6 right-6 h-0.5 border-b border-dashed border-stone-300" />
              
              <div className="pt-2 flex flex-col items-center">
                <img 
                  src={logo} 
                  alt="MadVerse Logo" 
                  className="h-9 w-auto object-contain mx-auto mb-1 mix-blend-multiply" 
                />
                <h3 className="text-sm font-black text-[#2B1810] leading-snug mt-1">
                  {headline}
                </h3>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner">
                <img src={qrUrl} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="fill-amber-400" />)}
                </div>
                <p className="text-[10px] text-stone-500 font-medium">
                  Scan camera to draft your honest Google review
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                <span>Fold along crease</span>
                <span>Self-Standing 4"×6"</span>
              </div>
            </div>
          )}

          {/* Window / Door Cling Sticker */}
          {merchType === 'sticker' && (
            <div 
              className="w-72 sm:w-80 rounded-3xl p-7 text-white text-center shadow-xl relative overflow-hidden space-y-4"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0369A1 50%, #2B1810 100%)` }}
            >
              <div className="space-y-1 flex flex-col items-center">
                <div className="bg-white/95 rounded-2xl px-4 py-2 shadow-md">
                  <img 
                    src={logo} 
                    alt="MadVerse Logo" 
                    className="h-9 w-auto object-contain mx-auto mix-blend-multiply" 
                  />
                </div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block pt-1">
                  Official Google Review Spot
                </span>
                <h3 className="text-base font-black tracking-tight">{businessName}</h3>
              </div>

              <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
                <img src={qrUrl} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Sparkles size={12} className="text-amber-300" /> Point Camera to Review
                </p>
                <p className="text-[10px] text-teal-100 font-medium">Weatherproof Vinyl Cling Decal</p>
              </div>
            </div>
          )}

          {/* Receipt / Check Presenter Slip */}
          {merchType === 'receipt' && (
            <div className="w-64 sm:w-72 bg-white border border-stone-200 p-5 shadow-lg font-mono text-left space-y-3 relative text-[#2B1810]">
              <div className="text-center border-b border-dashed border-stone-300 pb-2">
                <span className="font-black text-xs uppercase tracking-wider block">{businessName}</span>
                <span className="text-[9px] text-amber-700 tracking-wider">CREATE BEYOND ORDINARY</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Guest Receipt Check</span>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-[#2B1810] leading-snug">{headline}</p>
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 inline-block">
                  <img src={qrUrl} alt="QR Code" className="w-28 h-28 object-contain mx-auto" />
                </div>
                <p className="text-[10px] text-stone-500">Scan QR to share your review on Google</p>
              </div>

              <div className="border-t border-dashed border-stone-300 pt-2 text-[10px] text-center text-stone-400">
                *** THANK YOU FOR CREATING WITH US ***
              </div>
            </div>
          )}
        </div>

        {/* 3D Hover Cue */}
        <p className="text-[11px] text-stone-400 mt-5 flex items-center gap-1.5 font-medium">
          <RotateCw size={12} className="animate-spin text-teal-700" style={{ animationDuration: '8s' }} /> Move cursor over card to inspect in 3D
        </p>
      </div>

      {/* Customization Sliders & Print Actions */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Display Callout Headline</label>
            <input 
              type="text" 
              value={headline} 
              onChange={e => setHeadline(e.target.value)} 
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none text-[#2B1810]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Supporting Instructions</label>
            <input 
              type="text" 
              value={subtext} 
              onChange={e => setSubtext(e.target.value)} 
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none text-[#2B1810]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <ShieldCheck size={16} className="text-teal-700" />
            <span>High-DPI Vector QR (Print Ready)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={qrUrl}
              download={`${businessName}_QR.png`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#2B1810] rounded-xl text-xs font-bold transition border border-stone-200"
            >
              <Download size={14} />
              <span>Download PNG</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-98"
            >
              <Printer size={14} />
              <span>Print {merchType === 'acrylic' ? 'Stand Flyer' : merchType === 'tent' ? 'Table Tent' : merchType === 'sticker' ? 'Decal' : 'Slip'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
