import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import StarSelector from '../components/StarSelector';
import PromptChips from '../components/PromptChips';
import { playSuccessChime, playTapSound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { speakText, stopSpeaking } from '../utils/speech';
import { 
  ExternalLink, Copy, Check, Sparkles, RefreshCw, 
  RotateCw, CheckCircle2, HeartHandshake, Volume2, VolumeX, AlertCircle, ArrowLeft
} from 'lucide-react';
import { getReviewsForRating } from '../utils/reviewMessages';

export default function CustomerReview() {
  const { locationId } = useParams();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple review state
  const [rating, setRating] = useState(5);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [editedDraft, setEditedDraft] = useState('');
  const [reviewOptionIndex, setReviewOptionIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch location information with guaranteed client fallback
  const fetchLocationData = () => {
    setLoading(true);
    setError(null);
    const targetLocId = locationId && locationId !== 'undefined' ? locationId : 'default';

    fetch(`/api/locations/${targetLocId}/public`)
      .then(res => {
        if (!res.ok) throw new Error('Location not found');
        return res.json();
      })
      .then(data => {
        setBusinessInfo(data);
        setLoading(false);

        // Pre-populate with a rich 5-star review
        const bName = data.businessName || 'Trident Net Holidays';
        const lName = data.locationName || 'Trident Net Holidays';
        const reviews = getReviewsForRating(5, bName, lName);
        if (reviews && reviews.length > 0) {
          setEditedDraft(reviews[0]);
        }

        // Record real QR scan telemetry
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
        console.warn('Using client fallback for Trident Net Holidays:', err);
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
        const reviews = getReviewsForRating(5, 'Trident Net Holidays', 'Trident Net Holidays');
        if (reviews && reviews.length > 0) {
          setEditedDraft(reviews[0]);
        }
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
      body: JSON.stringify({ locationId: activeLocId, eventType, language: 'en' })
    }).catch(() => {});
  };

  // Update review when rating changes
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setReviewOptionIndex(0);
    logEvent('rating_selected');

    const bName = businessInfo?.businessName || 'Trident Net Holidays';
    const lName = businessInfo?.locationName || 'Trident Net Holidays';
    const available = getReviewsForRating(newRating, bName, lName);
    if (available && available.length > 0) {
      setEditedDraft(available[0]);
    }
  };

  // Toggle prompt chip
  const handleTogglePrompt = (promptId) => {
    logEvent('prompt_toggled');
    setSelectedPrompts(prev => {
      const isSelected = prev.includes(promptId);
      const updated = isSelected ? prev.filter(id => id !== promptId) : [...prev, promptId];
      return updated;
    });
  };

  // Cycle to next review style
  const handleCycleReview = () => {
    playTapSound(700);
    const bName = businessInfo?.businessName || 'Trident Net Holidays';
    const lName = businessInfo?.locationName || 'Trident Net Holidays';
    const available = getReviewsForRating(rating || 5, bName, lName);
    const nextIdx = (reviewOptionIndex + 1) % available.length;
    setReviewOptionIndex(nextIdx);
    setEditedDraft(available[nextIdx]);
  };

  // Audio speech synthesis
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(editedDraft, () => setIsSpeaking(false));
    }
  };

  // Primary action: Copy text and open Google Reviews
  const handleCopyAndOpenGoogle = (e) => {
    logEvent('copy_clicked');
    logEvent('google_redirect_clicked');

    if (e && e.clientX && e.clientY) {
      fireConfetti(e.clientX, e.clientY);
    } else {
      fireConfetti();
    }
    playSuccessChime();

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(editedDraft).catch(() => {});
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    // Open Google Review Link directly in new window
    const targetUrl = businessInfo?.googleReviewLink || 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Switch view to completion screen
    setIsSubmitted(true);
  };

  // Direct bypass to Google without copying
  const handleDirectGoogleClick = () => {
    logEvent('direct_google_fallback_clicked');
    const targetUrl = businessInfo?.googleReviewLink || 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-amber-900/10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 animate-spin">
            <RefreshCw size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Connecting to Business</h3>
          <p className="text-xs text-slate-400 mt-1">Preparing your review assistant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Review Assistant</h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Ready to review Trident Net Holidays!
          </p>
          <button
            type="button"
            onClick={fetchLocationData}
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 transition shadow-sm mb-2"
          >
            <RefreshCw size={14} className="mr-1.5" /> Start Review Assistant
          </button>
          <button
            type="button"
            onClick={handleDirectGoogleClick}
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
          >
            <ExternalLink size={14} className="mr-1.5" /> Review Directly on Google Maps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-slate-900 flex flex-col justify-between antialiased">
      <div className="max-w-md mx-auto w-full px-4 pt-4 sm:pt-6 pb-6">
        
        {/* Brand Card Header */}
        <BrandHeader 
          businessName={businessInfo?.businessName || 'Trident Net Holidays'}
          locationName={businessInfo?.locationName || 'Trident Net Holidays'}
          logoUrl={businessInfo?.logoUrl || '/logo.png'}
          primaryColor={businessInfo?.primaryColor || '#0D9488'}
        />

        {/* STEP A: THE SIMPLE 1-PAGE REVIEW BUILDER */}
        {!isSubmitted ? (
          <main className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-900/10 space-y-5">
            
            {/* 1. Star Rating */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                How was your experience?
              </h2>
              <p className="text-xs text-slate-500">
                Tap your rating below:
              </p>
              <div className="pt-1">
                <StarSelector value={rating} onChange={handleRatingChange} />
              </div>
            </div>

            {/* 2. Optional Highlight Chips */}
            {businessInfo?.prompts && businessInfo.prompts.length > 0 && (
              <div className="pt-1 border-t border-slate-100">
                <PromptChips 
                  prompts={businessInfo.prompts}
                  selectedPrompts={selectedPrompts}
                  onToggle={handleTogglePrompt}
                />
              </div>
            )}

            {/* 3. Pre-Crafted Editable Review */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-teal-600" />
                  Your Suggested Review:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCycleReview}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition active:scale-95"
                    title="Click for another review style"
                  >
                    <RotateCw size={11} className="text-teal-700" />
                    <span>Try Another Style</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                    title="Read review out loud"
                  >
                    {isSpeaking ? <VolumeX size={15} className="text-teal-600" /> : <Volume2 size={15} />}
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <div className="relative">
                <textarea
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  rows={5}
                  placeholder="Your review text appears here..."
                  className="w-full p-3.5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1">
                  <span>You can edit or type anything you want above</span>
                  <span>{editedDraft ? editedDraft.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>
            </div>

            {/* 4. The 1-Tap Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleCopyAndOpenGoogle}
                className="w-full py-4 px-5 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 active:scale-98 text-white rounded-2xl font-extrabold text-sm sm:text-base shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition-all"
              >
                <Copy size={18} />
                <span>Copy & Open Google Reviews</span>
              </button>
              
              <p className="text-center text-[11px] text-slate-400">
                Copies text & opens Google Maps review form in 1 tap
              </p>
            </div>

            {/* Subtle Direct Option */}
            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDirectGoogleClick}
                className="text-[11px] text-slate-500 hover:text-slate-700 underline inline-flex items-center gap-1"
              >
                <span>Write directly on Google without suggestions</span>
                <ExternalLink size={10} />
              </button>
            </div>

          </main>
        ) : (
          /* STEP B: CLEAN SUCCESS & COMPLETION SCREEN */
          <main className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-900/10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
              <CheckCircle2 size={36} className="stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Review Copied!
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                Google Reviews is opening in your browser. Just paste your review and tap <strong>Post</strong>!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 text-left flex items-start gap-3 max-w-sm mx-auto">
              <HeartHandshake size={24} className="text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Quick Steps:</p>
                <p>1. Tap the review box in Google Maps</p>
                <p>2. Select <strong>Paste</strong> to drop in your text</p>
                <p>3. Tap <strong>Post</strong> to submit!</p>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleDirectGoogleClick}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink size={14} />
                <span>Open Google Reviews Form Again</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft size={13} />
                <span>Edit Review Draft</span>
              </button>
            </div>
          </main>
        )}

        {/* Global Footer */}
        <footer className="text-center py-5 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">
            Powered by MadVerse · Create Beyond Ordinary
          </p>
          <p className="text-[11px] text-slate-400">
            Independent software. Not affiliated with or endorsed by Google LLC.
          </p>
        </footer>

      </div>
    </div>
  );
}
