import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, MessageSquare, Star, QrCode, ShieldCheck, 
  ArrowRight, Sparkles, ExternalLink, Globe2, 
  Smartphone, BarChart3, Printer, Users, Mic, Sliders, Copy, Check, RotateCw
} from 'lucide-react';
import ROICalculator from '../components/ROICalculator';
import { playTapSound, playStarPop, playSuccessChime } from '../utils/sound';
import logo from '../assets/logo.png';
import logoMark from '../assets/logo-mark.png';
import { getReviewsForRating } from '../utils/reviewMessages';

export default function LandingPage() {
  // Live Playground State in Hero
  const [demoName, setDemoName] = useState('MadVerse Experience Studio');
  const [demoRating, setDemoRating] = useState(5);
  const [demoReviewIndex, setDemoReviewIndex] = useState(0);
  const [demoCopied, setDemoCopied] = useState(false);

  // Policy Simulator State
  const [simulatedStar, setSimulatedStar] = useState(5);
  const [simulatedIndex, setSimulatedIndex] = useState(0);

  // Compute active review arrays based on selected rating
  const activeReviews = getReviewsForRating(demoRating, demoName, 'Experience Studio');
  const currentReviewText = activeReviews[demoReviewIndex % activeReviews.length] || activeReviews[0];

  const simulatedReviews = getReviewsForRating(simulatedStar, demoName, 'Experience Studio');
  const activeSimulatedReview = simulatedReviews[simulatedIndex % simulatedReviews.length] || simulatedReviews[0];

  const handleCopyDemo = () => {
    playTapSound(900);
    navigator.clipboard.writeText(currentReviewText);
    setDemoCopied(true);
    setTimeout(() => setDemoCopied(false), 2000);
  };

  const handleNextReview = () => {
    playTapSound(700);
    setDemoReviewIndex(prev => (prev + 1) % activeReviews.length);
  };

  const handleNextSimulatedReview = () => {
    playTapSound(700);
    setSimulatedIndex(prev => (prev + 1) % simulatedReviews.length);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B1810] antialiased selection:bg-teal-500 selection:text-white font-sans">
      
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-6xl mx-auto">
        <nav className="bg-white/85 backdrop-blur-xl border border-stone-200/80 rounded-2xl px-5 h-16 flex items-center justify-between shadow-xs">
          <Link to="/" className="flex items-center group">
            <img 
              src={logo} 
              alt="MadVerse Logo" 
              className="h-10 sm:h-11 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
            />
          </Link>

          <div className="hidden md:flex items-center space-x-7 text-xs font-semibold text-stone-600">
            <a href="#playground" className="hover:text-teal-700 transition">Live Demo</a>
            <a href="#architecture" className="hover:text-teal-700 transition">Features</a>
            <a href="#roi" className="hover:text-teal-700 transition">Review Velocity</a>
            <a href="#compliance" className="hover:text-teal-700 transition flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>Google Policy Clean</span>
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/admin/login" 
              className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-[#2B1810] rounded-xl hover:bg-stone-100 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/admin/setup" 
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Clean Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/70">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>AI In-Store Review Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-[#2B1810] tracking-tight leading-[1.12]">
              CREATE BEYOND ORDINARY. <br />
              <span className="text-teal-700">Turn Customer Visits into Google Reviews.</span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Transform physical footfall into authentic Google Reviews. Customers scan your custom physical stand, speak or tap 2-3 genuine impressions, and copy an eloquent, 100% Google-compliant review draft in seconds.
            </p>

            {/* Clean CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                to="/admin/setup"
                className="w-full sm:w-auto px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-98"
              >
                <span>Launch Free Studio</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/review/ef9b1224-1b18-4137-825d-0693d8dcd72f"
                target="_blank"
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-stone-50 text-[#2B1810] rounded-xl text-xs sm:text-sm font-bold border border-stone-200 shadow-2xs flex items-center justify-center gap-2 transition"
              >
                <Smartphone size={15} className="text-teal-700" />
                <span>Test Live Mobile Flow</span>
                <ExternalLink size={13} className="text-stone-400" />
              </Link>
            </div>

            {/* Clean Feature Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-stone-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-teal-600" />
                Zero App Download
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-teal-600" />
                Voice Dictation Ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-teal-600" />
                100% Google Policy Clean
              </span>
            </div>
          </div>

          {/* Right Column: Clean Realistic Phone Canvas */}
          <div className="lg:col-span-6 relative" id="playground">
            <div className="relative mx-auto max-w-sm rounded-[2.5rem] bg-stone-900 p-3 shadow-2xl border-4 border-stone-800">
              {/* Dynamic Island */}
              <div className="w-20 h-3.5 bg-stone-950 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500/80 mr-1.5"></span>
                <span className="w-1 h-1 rounded-full bg-stone-800"></span>
              </div>

              {/* Inside Phone Screen: Clean Ivory/White Canvas */}
              <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-stone-200 text-left space-y-4">
                
                {/* Brand Header */}
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={logoMark} 
                      alt="MadVerse Logo" 
                      className="h-8 w-auto object-contain mix-blend-multiply" 
                    />
                    <div>
                      <h4 className="text-xs font-black text-[#2B1810] truncate max-w-[150px]">{demoName}</h4>
                      <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">
                        Create Beyond Ordinary
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Live Demo
                  </span>
                </div>

                {/* Star Sentiment Picker */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
                    1. Tap Customer Sentiment:
                  </span>
                  <div className="flex justify-between bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          playStarPop(star);
                          setDemoRating(star);
                          setDemoReviewIndex(0);
                        }}
                        className={`text-xl transition-all transform hover:scale-125 ${
                          star <= demoRating ? 'text-amber-400' : 'text-stone-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Synthesized Draft Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#2B1810] flex items-center gap-1">
                      <Sparkles size={12} className="text-teal-700" />
                      <span>{demoRating}★ Review ({ (demoReviewIndex % activeReviews.length) + 1 } of {activeReviews.length}):</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleNextReview}
                      className="text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition active:scale-95"
                      title="Browse through 12-15 long review suggestions for this rating"
                    >
                      <RotateCw size={10} className="text-teal-700" />
                      <span>Next Draft</span>
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-800 leading-relaxed font-sans shadow-2xs space-y-2">
                    <p className="font-normal text-stone-700 leading-relaxed">
                      "{currentReviewText}"
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
                      <span>{currentReviewText.split(/\s+/).length} words · Detailed</span>
                      <span className="text-teal-700 font-semibold">
                        {demoRating >= 4 ? 'Celebratory Praise' : demoRating === 3 ? 'Balanced Perspective' : 'Constructive Feedback'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Tap Copy & Redirect */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={handleCopyDemo}
                    className="w-full py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                  >
                    {demoCopied ? <Check size={14} className="text-emerald-200" /> : <Copy size={14} />}
                    <span>{demoCopied ? 'Copied to Clipboard!' : '1-Tap Copy & Open Google Form'}</span>
                  </button>

                  <p className="text-[10px] text-center text-stone-500 font-medium">
                    Always routes directly to business's official Google review link.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Clean Feature Grid */}
      <section id="architecture" className="py-20 bg-white border-y border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Innovative Architecture
            </span>
            <h2 className="text-3xl font-black text-[#2B1810] tracking-tight">
              Engineered for Modern Physical Retail & Studios
            </h2>
            <p className="text-stone-500 text-sm">
              Every micro-interaction is designed to convert rushed in-store visitors into verified, articulate reviewers.
            </p>
          </div>

          {/* Clean Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tile 1 */}
            <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <Mic size={22} />
              </div>
              <h3 className="text-base font-bold text-[#2B1810]">Whisper-to-Review Voice Dictation</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Customers speak their experience hands-free. Web Speech API transcribes impressions in real-time without typing.
              </p>
            </div>

            {/* Tile 2 */}
            <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Sliders size={22} />
              </div>
              <h3 className="text-base font-bold text-[#2B1810]">3 Distinct Review Styles</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Generates Warm, Concise (2 sentences), and Detailed drafts tailored to reader preferences with text-to-speech preview.
              </p>
            </div>

            {/* Tile 3 */}
            <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <Printer size={22} />
              </div>
              <h3 className="text-base font-bold text-[#2B1810]">3D Physical Merch Studio</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Generate high-resolution printable acrylic stands, folded table tents, weatherproof window decals, and check slips.
              </p>
            </div>

            {/* Tile 4 (Full Width 2 columns) */}
            <div className="md:col-span-2 bg-[#FAF7F2] p-6 rounded-3xl border border-teal-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2B1810]">100% Google Anti-Gating Compliant</h3>
                  <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Zero Account Suspension Risk</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Unlike legacy review aggregators that secretly divert 1-3 star customers to private complaint channels (a severe Google Merchant policy violation), MadVerse always routes every visitor directly to the official Google review form.
              </p>
            </div>

            {/* Tile 5 */}
            <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-base font-bold text-[#2B1810]">Telemetry Funnel</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Full lifecycle tracking from physical in-store QR scan to outbound Google submission, broken down by location.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Review Velocity & ROI Section */}
      <section id="roi" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <ROICalculator />
      </section>

      {/* Compliance Simulator Section */}
      <section id="compliance" className="py-20 bg-white border-t border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Interactive Compliance Sandbox
            </span>
            <h2 className="text-3xl font-black text-[#2B1810] tracking-tight">
              Test Both Positive & Critical Customer Paths
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              See how MadVerse protects your business by ensuring authentic, policy-compliant feedback.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-stone-200/90 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      playStarPop(star);
                      setSimulatedStar(star);
                      setSimulatedIndex(0);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      simulatedStar === star 
                        ? star >= 4 
                          ? 'bg-teal-700 text-white shadow-2xs' 
                          : star === 3 
                            ? 'bg-amber-600 text-white shadow-2xs' 
                            : 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    <span>{star}★ Rating</span>
                    <span className="text-[10px] opacity-80">({star >= 4 ? 'Praise' : star === 3 ? 'Balanced' : 'Constructive'})</span>
                  </button>
                ))}
              </div>

              {/* Sample Long Review Showcase */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2B1810]">
                      {simulatedStar}★ Long-Form Sample Draft ({ (simulatedIndex % simulatedReviews.length) + 1 } of {simulatedReviews.length}):
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {activeSimulatedReview.split(/\s+/).length} words
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextSimulatedReview}
                    className="text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition active:scale-95"
                  >
                    <RotateCw size={11} className="text-teal-700" />
                    <span>Next {simulatedStar}★ Suggestion</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans bg-stone-50/70 p-3 rounded-xl border border-stone-100 italic">
                  "{activeSimulatedReview}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5 text-left">
                <span className="text-stone-400 font-bold uppercase text-[10px]">AI Assistance Tone:</span>
                <p className="font-bold text-[#2B1810] text-sm">
                  {simulatedStar >= 4 ? 'Celebratory Praise Mode' : simulatedStar === 3 ? 'Balanced Perspective Mode' : 'Constructive Feedback Mode'}
                </p>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  {simulatedStar >= 4 
                    ? 'Guides customers to articulate specific craftsmanship, hospitality, and standout details warmly.' 
                    : simulatedStar === 3
                    ? 'Captures nuanced, fair reviews highlighting strengths alongside opportunities for improvement.'
                    : 'Articulates legitimate customer concerns politely, objectively, and constructively without hostility.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-teal-200 space-y-1.5 text-left">
                <span className="text-teal-700 font-bold uppercase text-[10px]">Destination URL:</span>
                <p className="font-bold text-teal-800 text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Public Google Review Form</span>
                </p>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Every user receives the identical Google link, fully honoring Google Maps Merchant Anti-Gating Guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean CTA Footer Banner */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-5">
          <img 
            src={logo} 
            alt="MadVerse Logo" 
            className="h-14 sm:h-16 w-auto object-contain mx-auto mix-blend-multiply" 
          />
          <h2 className="text-3xl sm:text-4xl font-black text-[#2B1810] tracking-tight">
            Create Beyond Ordinary Today
          </h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            Takes under 60 seconds to deploy. Generate your bespoke MadVerse in-store QR stands and decals right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/admin/setup"
              className="w-full sm:w-auto px-7 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-98"
            >
              Start Free Setup
            </Link>
            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-stone-50 text-[#2B1810] rounded-xl text-xs sm:text-sm font-bold border border-stone-200 transition"
            >
              Sign In to Business Hub
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="py-8 bg-white text-stone-500 text-xs border-t border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MadVerse. All rights reserved. Create Beyond Ordinary.</p>
          <p className="text-stone-400">
            Independent software. Not affiliated with or endorsed by Google LLC.
          </p>
        </div>
      </footer>
    </div>
  );
}
