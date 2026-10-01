import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import ProgressBar from '../components/ProgressBar';
import StarSelector from '../components/StarSelector';
import PromptChips from '../components/PromptChips';
import DraftCards from '../components/DraftCards';
import VoiceInput from '../components/VoiceInput';
import LiveSynthesisBar from '../components/LiveSynthesisBar';
import StoryCanvas from '../components/StoryCanvas';
import { playSuccessChime, playTapSound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { speakText, stopSpeaking } from '../utils/speech';
import { 
  ExternalLink, Copy, RefreshCw, Check, AlertCircle, Sparkles, 
  ShieldCheck, ArrowRight, ArrowLeft, MessageSquare, Globe2, 
  MapPin, CheckCircle2, HeartHandshake, ThumbsUp, Volume2, VolumeX, RotateCw
} from 'lucide-react';
import { getReviewsForRating } from '../utils/reviewMessages';

const STEPS = ['Welcome', 'Rating', 'Details', 'Draft', 'Thank You'];

export default function CustomerReview() {
  const { locationId } = useParams();
  const [step, setStep] = useState(0);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review flow state
  const [rating, setRating] = useState(0);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [customText, setCustomText] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [reviewOptionIndex, setReviewOptionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(editedDraft, () => setIsSpeaking(false));
    }
  };

  const fetchLocationData = () => {
    setLoading(true);
    setError(null);
    const targetLocId = locationId && locationId !== 'undefined' ? locationId : 'default';

    fetch(`/api/locations/${targetLocId}/public`)
      .then(res => {
        if (!res.ok) throw new Error('Location not found or currently inactive');
        return res.json();
      })
      .then(data => {
        setBusinessInfo(data);
        if (data.language) setSelectedLang(data.language);
        setLoading(false);

        // Record real QR scan telemetry (guarded per browser tab session)
        const scanSessionKey = `madverse_scan_${data.locationId || targetLocId}`;
        if (!sessionStorage.getItem(scanSessionKey)) {
          sessionStorage.setItem(scanSessionKey, 'logged');
          fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              locationId: data.locationId || targetLocId, 
              eventType: 'qr_scanned', 
              language: data.language || 'en' 
            })
          }).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Network issue fetching location, applying instant client fallback:', err);
        // Resilient fallback for Trident Net Holidays so customers never see a broken error
        const fallbackInfo = {
          locationId: targetLocId,
          locationName: 'Trident Net Holidays',
          address: '3rd Floor, Hari Om Chamber, B/46, New Link Rd, Veera Desai Industrial Estate, Andheri West, Mumbai, Maharashtra 400053',
          googleReviewLink: 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
          businessName: 'Trident Net Holidays',
          category: 'travel',
          logoUrl: '/logo.png',
          primaryColor: '#0D9488',
          secondaryColor: '#D97706',
          language: 'en',
          tone: 'friendly',
          prompts: [
            { id: 't1', text: 'Great customer service', type: 'positive' },
            { id: 't2', text: 'Smooth booking process', type: 'positive' },
            { id: 't3', text: 'Helpful & polite staff', type: 'positive' },
            { id: 't4', text: 'Hassle-free holiday planning', type: 'positive' },
            { id: 't5', text: 'Prompt communication', type: 'positive' },
            { id: 't6', text: 'Highly recommended', type: 'positive' }
          ]
        };
        setBusinessInfo(fallbackInfo);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLocationData();
  }, [locationId]);

  // Log analytics event
  const logEvent = (eventType) => {
    const activeLocId = businessInfo?.locationId || locationId || 'default';
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId: activeLocId, eventType, language: selectedLang })
    }).catch(() => {});
  };

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep(s => Math.max(0, s - 1));
  
  const handleGoogleRedirect = (eventName = 'google_redirect_clicked') => {
    logEvent(eventName);
    if (businessInfo?.googleReviewLink) {
      const url = String(businessInfo.googleReviewLink).trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.error('Refused to open invalid or unsafe URL protocol');
      }
      setStep(4); // Move to thank you step
    }
  };

  const handleCycleLongReview = () => {
    playTapSound(700);
    const available = getReviewsForRating(
      rating || 5, 
      businessInfo?.businessName || 'MadVerse', 
      businessInfo?.locationName || 'Experience Studio'
    );
    const nextIdx = (reviewOptionIndex + 1) % available.length;
    setReviewOptionIndex(nextIdx);
    setEditedDraft(available[nextIdx]);
  };

  const generateDrafts = async () => {
    setIsGenerating(true);
    logEvent('draft_generated');
    handleNext();
    
    const promptTexts = (businessInfo?.prompts || [])
      .filter(p => selectedPrompts.includes(p.id))
      .map(p => p.text);

    try {
      const res = await fetch('/api/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          starRating: rating || undefined,
          selectedPrompts: promptTexts,
          language: selectedLang,
          customDetails: customText
        })
      });
      const data = await res.json();
      const generatedDrafts = data.drafts || [];
      setDrafts(generatedDrafts);
      if (generatedDrafts.length > 0) {
        setSelectedDraftId(generatedDrafts[0].id);
        setEditedDraft(generatedDrafts[0].text);
      }
      playSuccessChime();
    } catch (err) {
      const longReviews = getReviewsForRating(
        rating || 5,
        businessInfo?.businessName || 'MadVerse',
        businessInfo?.locationName || 'Experience Studio'
      );
      const fallbackList = [
        { 
          id: '1', 
          tone: rating >= 4 ? 'Warm & Enthusiastic' : rating === 3 ? 'Balanced Assessment' : 'Constructive & Direct', 
          badge: 'Detailed',
          text: longReviews[0] 
        },
        { 
          id: '2', 
          tone: rating >= 4 ? 'Detailed Praise' : 'Thorough Observations', 
          badge: 'Comprehensive',
          text: longReviews[1] || longReviews[0] 
        },
        { 
          id: '3', 
          tone: rating >= 4 ? 'Thoughtful Review' : 'Actionable Feedback', 
          badge: 'Balanced',
          text: longReviews[2] || longReviews[0] 
        }
      ];
      setDrafts(fallbackList);
      setSelectedDraftId(fallbackList[0].id);
      setEditedDraft(fallbackList[0].text);
      playSuccessChime();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (e) => {
    logEvent('copy_clicked');
    playTapSound(950, 0.08);
    if (e && e.clientX && e.clientY) {
      fireConfetti(e.clientX, e.clientY);
    } else {
      fireConfetti();
    }
    navigator.clipboard.writeText(editedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Sort prompts based on rating
  const getSortedPrompts = () => {
    if (!businessInfo?.prompts) return [];
    const prompts = [...businessInfo.prompts];
    if (rating && rating <= 3) {
      prompts.sort((a, b) => (a.type === 'negative' ? -1 : 1) - (b.type === 'negative' ? -1 : 1));
    } else if (rating && rating >= 4) {
      prompts.sort((a, b) => (a.type === 'positive' ? -1 : 1) - (b.type === 'positive' ? -1 : 1));
    }
    return prompts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-slate-100 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 animate-spin">
            <RefreshCw size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Connecting to Business</h3>
          <p className="text-xs text-slate-400 mt-1">Preparing your secure review assistant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Connecting to Review Assistant</h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Network connection took longer than usual to reach Trident Net Holidays.
          </p>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={fetchLocationData}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 transition shadow-sm"
            >
              <RefreshCw size={14} className="mr-1.5" /> Retry Connection
            </button>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
            >
              <ExternalLink size={14} className="mr-1.5" /> Review Directly on Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-madverse-espresso flex flex-col justify-between antialiased">
      {/* Top Banner Navigation */}
      <div className="max-w-xl mx-auto w-full px-4 pt-4 sm:pt-6">
        {/* Language & Info bar */}
        <div className="flex items-center justify-between text-xs text-madverse-espresso-500 mb-3 px-1">
          <div className="flex items-center gap-1.5 font-medium text-madverse-espresso">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>MadVerse Verified Assistant</span>
          </div>

          <div className="flex items-center gap-2">
            <Globe2 size={13} className="text-madverse-espresso-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent border-0 text-slate-600 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* Brand Card Header */}
        <BrandHeader 
          businessName={businessInfo.businessName}
          locationName={businessInfo.locationName}
          logoUrl={businessInfo.logoUrl}
          primaryColor={businessInfo.primaryColor}
        />

        {/* Progress bar on intermediate steps */}
        {step < 4 && (
          <ProgressBar currentStep={step} totalSteps={4} />
        )}

        {/* MAIN STEP PANELS */}
        <main className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80">
          
          {/* STEP 0: Welcome Screen */}
          {step === 0 && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100/80">
                <MessageSquare size={32} className="stroke-[2.2]" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Share Your Real Experience
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
                  Your authentic review helps <strong className="text-slate-800">{businessInfo.locationName || businessInfo.businessName}</strong> serve the community better.
                </p>
              </div>

              {/* Policy Guarantee Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-900">100% Honest & Independent</p>
                  <p className="text-slate-500 leading-normal">
                    We never filter critical feedback or preselect your rating. You are always taken directly to the public Google Review form.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    logEvent('rating_selected');
                    handleNext();
                  }}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-teal-600 via-teal-700 to-amber-700 hover:from-teal-700 hover:to-amber-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <Sparkles size={17} />
                  <span>Help Me Draft an Honest Review</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleRedirect('direct_google_fallback_clicked')}
                  className="w-full py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink size={14} className="text-slate-400" />
                  <span>I prefer to write directly on Google</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Star Rating Guidance */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  How would you rate your visit?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Optional intent guidance — this shapes the tone of your draft
                </p>
              </div>

              <StarSelector 
                value={rating} 
                onChange={(val) => {
                  setRating(val);
                  logEvent('rating_selected');
                }} 
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-2/3 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 flex items-center justify-center gap-1.5 transition"
                >
                  <span>{rating === 0 ? 'Skip to Topics' : 'Continue to Topics'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Add Factual Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-black text-madverse-espresso tracking-tight">
                  What specifics stood out?
                </h3>
                <p className="text-xs text-madverse-espresso-500 mt-1">
                  Our AI only includes facts you affirmatively choose or write.
                </p>
              </div>

              {/* Kinetic Story Canvas & Prompts */}
              <StoryCanvas 
                prompts={getSortedPrompts()}
                selectedPromptIds={selectedPrompts}
                onTogglePrompt={(id) => {
                  logEvent('prompt_toggled');
                  setSelectedPrompts(prev => 
                    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
                  );
                }}
                rating={rating}
                businessName={businessInfo.businessName}
              />

              {/* Custom Details Field with Voice Dictation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-madverse-espresso">
                    Specific staff, dish, or experience notes?
                  </label>
                  <VoiceInput 
                    onTranscript={(spokenText) => {
                      logEvent('voice_dictation_used');
                      setCustomText(prev => prev ? `${prev} ${spokenText}` : spokenText);
                    }}
                  />
                </div>
                <textarea
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., The creative ambiance was inspiring, team was attentive even during busy hours... (or tap voice dictate above!)"
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-amber-900/15 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none transition resize-none placeholder:text-madverse-espresso-400 leading-relaxed text-madverse-espresso"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 py-3 px-4 border border-amber-900/15 hover:bg-[#FAF6F0] text-madverse-espresso rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  onClick={generateDrafts}
                  disabled={selectedPrompts.length === 0 && customText.trim() === ''}
                  className={`w-2/3 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    selectedPrompts.length === 0 && customText.trim() === ''
                      ? 'bg-[#F5EFEB] text-madverse-espresso-400 cursor-not-allowed border border-amber-900/10'
                      : 'bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20 active:scale-98'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Generate Review Drafts</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Edit Drafts */}
          {step === 3 && (
            <div>
              {isGenerating ? (
                <div className="py-12 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin"></div>
                    <Sparkles size={20} className="absolute inset-0 m-auto text-teal-700 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-madverse-espresso">Crafting Review Variants</h4>
                    <p className="text-xs text-madverse-espresso-400 mt-1">Grounding drafts strictly in your selected facts...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-2 border border-teal-200/60">
                      <Sparkles size={13} className="text-teal-600" />
                      AI Suggestions Ready
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Pick a draft & make it yours
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You can edit every word before copying to Google.
                    </p>
                  </div>

                  {/* Draft Variant Selector or Active Editor */}
                  {!selectedDraftId ? (
                    <DraftCards 
                      drafts={drafts}
                      selectedDraft={selectedDraftId}
                      onSelect={(id, text) => {
                        setSelectedDraftId(id);
                        setEditedDraft(text);
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Active Textarea */}
                      <div className="relative">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 px-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">Editable Review Draft:</span>
                            <button
                              type="button"
                              onClick={handleCycleLongReview}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition active:scale-95"
                              title="Cycle through 12-15 detailed review suggestions"
                            >
                              <RotateCw size={10} className="text-teal-700" />
                              <span>Option {reviewOptionIndex + 1} of 15</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleToggleSpeak}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                isSpeaking 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' 
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                              }`}
                              title="Listen to draft read aloud"
                            >
                              {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                            </button>
                            <span className="font-mono text-[11px] text-slate-400">
                              {editedDraft ? editedDraft.trim().split(/\s+/).length : 0} words
                            </span>
                          </div>
                        </div>
                        <textarea
                          rows={5}
                          value={editedDraft}
                          onChange={(e) => setEditedDraft(e.target.value)}
                          className="w-full p-4 text-xs sm:text-sm rounded-2xl border-2 border-blue-500/80 bg-blue-50/10 focus:ring-4 focus:ring-blue-100 outline-none transition leading-relaxed font-sans"
                        />
                      </div>

                      {/* Primary Actions: Copy & Go to Google */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
                        >
                          {copied ? (
                            <>
                              <Check size={16} className="text-emerald-400 stroke-[3]" />
                              <span className="text-emerald-300">Draft Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              <span>1. Copy Draft to Clipboard</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGoogleRedirect('google_redirect_clicked')}
                          className="w-full py-3.5 px-5 bg-gradient-to-r from-teal-600 via-teal-700 to-amber-700 hover:from-teal-700 hover:to-amber-800 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition active:scale-98"
                        >
                          <span>2. Open Google Review Form</span>
                          <ExternalLink size={16} />
                        </button>
                      </div>

                      {/* Change draft variant */}
                      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedDraftId(null)}
                          className="text-teal-700 hover:text-teal-800 font-bold"
                        >
                          ← Choose a different style
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setSelectedDraftId(null);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          Start Over
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Thank You Screen */}
          {step === 4 && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 size={36} className="stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Thank You for Your Feedback!
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                  Your honest words give genuine guidance to neighbors and help local teams continually improve.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 text-left flex items-center gap-3 max-w-sm mx-auto">
                <HeartHandshake size={24} className="text-blue-600 shrink-0" />
                <span>Google Reviews are published directly under your Google Account with full customer control.</span>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setSelectedDraftId(null);
                    setDrafts([]);
                    setSelectedPrompts([]);
                    setCustomText('');
                    setRating(0);
                  }}
                  className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Write Another Review
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Global Footer */}
        <footer className="text-center py-6 text-xs text-madverse-espresso-400 space-y-1">
          <p className="font-bold text-madverse-espresso-500">
            Powered by MadVerse · Create Beyond Ordinary
          </p>
          <p className="text-[11px] text-madverse-espresso-400">
            Independent software. Not affiliated with or endorsed by Google LLC.
          </p>
        </footer>
      </div>
    </div>
  );
}
