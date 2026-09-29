import React, { useState } from 'react';
import { TrendingUp, Users, Star, Award, Sparkles, QrCode, ArrowUpRight } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function ROICalculator() {
  const [dailyFootTraffic, setDailyFootTraffic] = useState(120);
  const [currentReviews, setCurrentReviews] = useState(4);

  // MadVerse conversion statistics:
  // ~12% scan rate on tables/stands, ~65% completion rate with AI assistance
  const monthlyVisitors = dailyFootTraffic * 30;
  const estimatedMonthlyScans = Math.round(monthlyVisitors * 0.12);
  const projectedMonthlyReviews = Math.round(estimatedMonthlyScans * 0.65);
  const reviewMultiplier = (projectedMonthlyReviews / Math.max(1, currentReviews)).toFixed(1);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 text-[#2B1810] shadow-xs relative overflow-hidden">
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/70 mb-2">
            <Sparkles size={13} className="text-amber-600" />
            <span>Interactive Growth Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#2B1810] tracking-tight">
            Calculate Your In-Store Review Velocity
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            See how friction-free QR scanning and MadVerse AI drafting transform in-store guests into verified 5-star Google reviews.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          
          {/* Slider 1: Foot Traffic */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <span className="text-xs font-bold text-[#2B1810]">Daily Customers</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-mono text-xs font-bold text-teal-800 whitespace-nowrap shadow-2xs">
                {dailyFootTraffic} guests / day
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={dailyFootTraffic}
                onChange={(e) => {
                  playTapSound(500);
                  setDailyFootTraffic(Number(e.target.value));
                }}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium px-0.5">
                <span>Boutique (20)</span>
                <span>High Footfall (500)</span>
              </div>
            </div>
          </div>

          {/* Slider 2: Current Reviews */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                  <Star size={16} className="fill-amber-400 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-[#2B1810]">Current Organic Reviews</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-mono text-xs font-bold text-amber-800 whitespace-nowrap shadow-2xs">
                {currentReviews} reviews / mo
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={currentReviews}
                onChange={(e) => {
                  playTapSound(550);
                  setCurrentReviews(Number(e.target.value));
                }}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium px-0.5">
                <span>1 / month</span>
                <span>30 / month</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Outcome Cards with Perfect Symmetry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          
          {/* Card 1: Scans */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 text-center flex flex-col justify-between space-y-2">
            <div className="space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center">
                <QrCode size={15} />
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Estimated Monthly Scans
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-[#2B1810] tracking-tight">
                {estimatedMonthlyScans.toLocaleString()}
              </div>
            </div>
            <p className="text-[11px] text-stone-500">
              ~12% physical stand scan rate
            </p>
          </div>

          {/* Card 2: Projected Reviews (Spotlight) */}
          <div className="bg-teal-50/70 p-5 rounded-2xl border-2 border-teal-600/40 text-center flex flex-col justify-between space-y-2 shadow-2xs">
            <div className="space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <TrendingUp size={15} />
              </div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Projected Reviews / Mo
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-teal-800 tracking-tight">
                +{projectedMonthlyReviews.toLocaleString()}
              </div>
            </div>
            <p className="text-[11px] font-bold text-teal-800">
              {reviewMultiplier}× velocity acceleration
            </p>
          </div>

          {/* Card 3: Local Visibility */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 text-center flex flex-col justify-between space-y-2">
            <div className="space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Award size={15} />
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Google Maps Visibility
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-[26px] font-black text-amber-800 tracking-tight leading-tight">
                Top 3 Local Pack
              </div>
            </div>
            <p className="text-[11px] text-stone-500">
              Dominates local nearby searches
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center text-xs text-stone-400 border-t border-stone-100 flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>Calculated using average verified in-store engagement benchmarks.</span>
        </div>

      </div>
    </div>
  );
}
