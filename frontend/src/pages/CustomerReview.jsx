import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import StarSelector from '../components/StarSelector';
import PromptChips from '../components/PromptChips';
import { playSuccessChime, playTapSound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { speakText, stopSpeaking } from '../utils/speech';
import { 
  ExternalLink, Copy, Check, Sparkles, RefreshCw, 
  RotateCw, CheckCircle2, HeartHandshake, Volume2, VolumeX, 
  AlertCircle, ArrowLeft, Send, MessageSquare, ShieldCheck, Mail, Phone, User,
  Mic, MicOff, Languages, Award, Zap, Star
} from 'lucide-react';
import { getReviewsForRating } from '../utils/reviewMessages';

const PASTE_HELPER_TEXTS = {
  en: {
    copiedTitle: 'Review Copied & Ready to Post!',
    copiedSubtitle: 'Google Reviews is open in your other tab. Follow these 2 quick steps to post:',
    step1Title: 'Tap Review Box',
    step1Desc: 'Switch to Google Maps & tap the review text area',
    step2Title: 'Tap "Paste" on Keyboard',
    step2Desc: 'Your review drops in with 1 tap from keyboard clipboard',
    step3Title: 'Tap "Post" (Top Right)',
    step3Desc: 'Hit the blue "Post" button to publish your review!',
    reopenBtn: 'Open Google Reviews Page Again',
    recopyBtn: 'Re-Copy Review Text',
    copiedAlert: 'Copied to Clipboard! ✓',
    editBtn: 'Edit Review Draft',
    yourDraft: 'Your Copied Review:',
    googleNotice: '🔒 Google Security: Google requires customers to tap Paste on their own keyboard to protect account privacy and prevent automated review bots.'
  },
  hi: {
    copiedTitle: 'रिव्यू कॉपी हो गया! अब गूगल पर पेस्ट करें',
    copiedSubtitle: 'गूगल रिव्यू का पेज दूसरे टैब में खुल चुका है। बस ये आसान कदम अपनाएं:',
    step1Title: 'रिव्यू बॉक्स छुएं',
    step1Desc: 'गूगल मैप्स में जाकर लिखने वाले बॉक्स पर टैप करें',
    step2Title: 'कीबोर्ड पर "Paste" दबाएं',
    step2Desc: 'आपका रिव्यू तुरंत एक टैप में बॉक्स में आ जाएगा',
    step3Title: '"Post" पर टैप करें',
    step3Desc: 'ऊपर दाईं ओर "Post" दबाकर रिव्यू पूरा करें',
    reopenBtn: 'गूगल रिव्यू पेज फिर से खोलें',
    recopyBtn: 'रिव्यू फिर से कॉपी करें',
    copiedAlert: 'क्लिपबोर्ड में कॉपी हो गया! ✓',
    editBtn: 'रिव्यू बदलें',
    yourDraft: 'आपका कॉपी किया गया रिव्यू:',
    googleNotice: '🔒 गूगल सुरक्षा: आपकी खाता सुरक्षा के लिए गूगल पर 1 बार कीबोर्ड से Paste करना अनिवार्य है।'
  },
  mr: {
    copiedTitle: 'रिव्ह्यू कॉपी झाला! आता गुगलवर पेस्ट करा',
    copiedSubtitle: 'गुगल रिव्ह्यू पेज दुसऱ्या टॅबमध्ये उघडले आहे. फक्त या २ सोप्या पायऱ्या फॉलो करा:',
    step1Title: 'रिव्ह्यू बॉक्सवर टॅप करा',
    step1Desc: 'गुगल मॅप्समध्ये जाऊन रिव्ह्यू बॉक्सवर क्लिक करा',
    step2Title: 'कीबोर्डवर "Paste" दाबा',
    step2Desc: 'तुमचा संपूर्ण मजकूर लगेच पेस्ट होईल',
    step3Title: '"Post" वर टॅप करा',
    step3Desc: 'वर उजव्या बाजूला "Post" बटण दाबून सबमिट करा',
    reopenBtn: 'गुगल रिव्ह्यू पेज पुन्हा उघडा',
    recopyBtn: 'रिव्ह्यू पुन्हा कॉपी करा',
    copiedAlert: 'क्लिपबोर्डवर कॉपी झाले! ✓',
    editBtn: 'रिव्ह्यू संपादित करा',
    yourDraft: 'तुमचा कॉपी केलेला रिव्ह्यू:',
    googleNotice: '🔒 गुगल सुरक्षा: गुगल नियमांनुसार तुमच्या प्रोफाइलवरून अधिकृत रिव्ह्यूसाठी १-टॅप पेस्ट आवश्यक आहे.'
  },
  gu: {
    copiedTitle: 'રિવ્યૂ કોપી થઈ ગયો! હવે ગૂગલ પર પેસ્ટ કરો',
    copiedSubtitle: 'ગૂગલ રિવ્યૂ પેજ બીજા ટેબમાં ખુલી ગયું છે. ફક્ત આ ૨ સરળ પગલાં અનુસરો:',
    step1Title: 'રિવ્યૂ બોક્સ પર ટેપ કરો',
    step1Desc: 'ગૂગલ મેપ્સમાં જઈને રિવ્યૂ બોક્સ પર ક્લિક કરો',
    step2Title: 'કીબોર્ડ પર "Paste" દબાવો',
    step2Desc: 'તમારો સંપૂર્ણ રિવ્યૂ તરત જ પેસ્ટ થઈ જશે',
    step3Title: '"Post" પર ટેપ કરો',
    step3Desc: 'ઉપર જમણી બાજુએ "Post" બટન દબાવી સબમિટ કરો',
    reopenBtn: 'ગૂગલ રિવ્યૂ પેજ ફરીથી ખોલો',
    recopyBtn: 'રિવ્યૂ ફરીથી કોપી કરો',
    copiedAlert: 'ક્લિપબોર્ડ પર કોપી થઈ ગયું! ✓',
    editBtn: 'રિવ્યૂ બદલો',
    yourDraft: 'તમારો કોપી કરેલો રિવ્યૂ:',
    googleNotice: '🔒 ગૂગલ સુરક્ષા: ગૂગલ પોલિસી મુજબ તમારા એકાઉન્ટથી રિવ્યૂ પોસ્ટ કરવા માટે ૧-ટેપ પેસ્ટ જરૂરી છે.'
  }
};

export default function CustomerReview() {
  const { locationId } = useParams();
  const [searchParams] = useSearchParams();
  const urlStaff = searchParams.get('staff') || '';
  const urlCname = searchParams.get('cname') || '';

  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review state
  const [rating, setRating] = useState(5);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [customNote, setCustomNote] = useState('');
  const [editedDraft, setEditedDraft] = useState('');
  const [reviewOptionIndex, setReviewOptionIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [recopied, setRecopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleRecopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(editedDraft).catch(() => {});
    }
    playSuccessChime();
    setRecopied(true);
    setTimeout(() => setRecopied(false), 2500);
  };

  // Multi-Language & Voice Dictation & Staff Attribution
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedStaff, setSelectedStaff] = useState(urlStaff);
  const [staffList, setStaffList] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Private owner resolution state (for 1-3 stars)
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateName, setPrivateName] = useState(urlCname || '');
  const [privateContact, setPrivateContact] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');
  const [privateSending, setPrivateSending] = useState(false);
  const [privateSent, setPrivateSent] = useState(false);

  // Helper to dynamically build review text with custom note, language, and staff
  const synthesizeReview = (currentRating, promptsList, note, optionIdx = 0, lang = selectedLang, staff = selectedStaff) => {
    const bName = businessInfo?.businessName || 'Trident Net Holidays';
    const lName = businessInfo?.locationName || 'Mumbai';
    const safeRating = Math.max(1, Math.min(5, Number(currentRating) || 5));
    const promptNames = (businessInfo?.prompts || [])
      .filter(p => promptsList.includes(p.id))
      .map(p => p.text);

    const notePart = note ? note.trim() : '';
    const promptsPart = promptNames.length > 0 ? promptNames.join(', ') : '';
    const staffPart = staff ? `Staff: ${staff}` : '';
    const combined = [notePart, promptsPart, staffPart].filter(Boolean).join(' · ');

    if (lang === 'hi') {
      if (safeRating >= 4) {
        return `${bName} (${lName}) के साथ हमारा अनुभव बेहद शानदार रहा। उनकी टीम ने हमारी यात्रा की हर व्यवस्था बहुत ही कुशलता और समय पर की${combined ? ' - विशेषकर ' + combined : ''}। स्टाफ का व्यवहार बहुत विनम्र और मददगार था। मुंबई में टूर और ट्रेवल के लिए इन्हें पूरे विश्वास के साथ 5 स्टार दूंगा!`;
      } else if (safeRating === 3) {
        return `${bName} के साथ हमारा अनुभव ठीक-ठाक रहा${combined ? ' (' + combined + ')' : ''}। सर्विस संतोषजनक थी लेकिन ग्राहक सहायता में थोड़ा और सुधार किया जा सकता है।`;
      } else {
        return `${bName} के साथ हमारा अनुभव निराशाजनक रहा${combined ? ' - ' + combined : ''}। समय पर सही जानकारी नहीं मिली। सुधार की आवश्यकता है।`;
      }
    }

    if (lang === 'mr') {
      if (safeRating >= 4) {
        return `${bName} (${lName}) कडून मिळालेली सेवा अत्यंत उत्कृष्ट आणि सुखकर होती${combined ? ' - विशेषतः ' + combined : ''}। संपूर्ण प्रवासाचे नियोजन अतिशय योग्य पद्धतीने केले होते. कर्मचाऱ्यांचे सहकार्य उत्तम होते. मुंबईतील सर्वोत्कृष्ट ट्रॅव्हल एजन्सी!`;
      } else if (safeRating === 3) {
        return `${bName} सोबतचा अनुभव ठीकठाक होता${combined ? ' (' + combined + ')' : ''}। सेवेत आणखी सुधारणेस वाव आहे.`;
      } else {
        return `${bName} कडून मिळालेली सेवा अपेक्षेप्रमाणे नव्हती${combined ? ' (' + combined + ')' : ''}। सुधारणा आवश्यक आहे.`;
      }
    }

    if (lang === 'gu') {
      if (safeRating >= 4) {
        return `${bName} (${lName}) સાથે અમારો અનુભવ ખૂબ જ ઉત્તમ અને યાદગાર રહ્યો${combined ? ' - ખાસ કરીને ' + combined : ''}। ટીમ ખૂબ જ સહાયક અને સમયસર સેવા આપનારી છે. મુંબઈમાં ટૂર અને ટ્રાવેલ માટે સંપૂર્ણ ભલામણ!`;
      } else {
        return `${bName} સાથેનો અનુભવ સરેરાશ રહ્યો${combined ? ' (' + combined + ')' : ''}। સેવામાં થોડો સુધારો જરૂરી છે.`;
      }
    }

    // Default English
    const available = getReviewsForRating(safeRating, bName, lName);
    const baseReview = available[optionIdx % available.length] || available[0];
    const hasCustom = (note && note.trim().length > 0) || promptNames.length > 0 || staff;
    if (!hasCustom) {
      return baseReview;
    }

    if (safeRating >= 4) {
      return `I recently booked with ${bName} in ${lName}, and the entire experience was outstanding from start to finish. In particular, ${combined}. The team was exceptionally professional, responsive, and attentive to all our requirements. Everything was handled with precision and warmth. Highly recommended!`;
    } else if (safeRating === 3) {
      return `My experience with ${bName} was decent overall. While ${combined} was handled adequately, there were a few minor areas where communication and turnaround time could be polished. A solid, dependable option with good potential.`;
    } else {
      return `Sharing honest feedback regarding our visit to ${bName} in ${lName}. We encountered delays and difficulties regarding ${combined}. I hope management addresses these operational details for future guests.`;
    }
  };

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

        // Pre-populate with 5-star review
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

    // Also fetch staff members for attribution
    fetch(`/api/staff/public/${targetLocId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaffList(data);
      })
      .catch(() => {});
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

  // Update review when rating changes
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setReviewOptionIndex(0);
    logEvent('rating_selected');
    const text = synthesizeReview(newRating, selectedPrompts, customNote, 0, selectedLang, selectedStaff);
    setEditedDraft(text);
  };

  // Toggle prompt chip
  const handleTogglePrompt = (promptId) => {
    logEvent('prompt_toggled');
    playTapSound(600);
    const updated = selectedPrompts.includes(promptId)
      ? selectedPrompts.filter(id => id !== promptId)
      : [...selectedPrompts, promptId];
    setSelectedPrompts(updated);
    const text = synthesizeReview(rating, updated, customNote, reviewOptionIndex, selectedLang, selectedStaff);
    setEditedDraft(text);
  };

  // Handle language switch
  const handleLanguageChange = (langCode) => {
    playTapSound(650);
    setSelectedLang(langCode);
    const text = synthesizeReview(rating, selectedPrompts, customNote, reviewOptionIndex, langCode, selectedStaff);
    setEditedDraft(text);
    handleAiEnhanceWithNote(customNote, langCode);
  };

  // Voice Dictation (Web Speech API)
  const handleToggleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is supported in modern mobile & desktop browsers (Chrome, Edge, Safari).');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'gu' ? 'gu-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        playTapSound(800);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const updatedNote = customNote ? `${customNote} ${transcript}` : transcript;
          setCustomNote(updatedNote);
          setIsListening(false);
          handleAiEnhanceWithNote(updatedNote, selectedLang);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      setIsListening(false);
    }
  };

  // AI Enhance button triggered by user
  const handleAiEnhance = () => {
    handleAiEnhanceWithNote(customNote, selectedLang);
  };

  const handleAiEnhanceWithNote = async (overrideNote, overrideLang) => {
    playTapSound(750);
    setIsAiGenerating(true);
    logEvent('draft_generated');

    const noteToUse = overrideNote !== undefined ? overrideNote : customNote;
    const langToUse = overrideLang || selectedLang;
    const promptTexts = (businessInfo?.prompts || [])
      .filter(p => selectedPrompts.includes(p.id))
      .map(p => p.text);

    const targetLocId = businessInfo?.locationId || locationId || 'default';
    const noteWithStaff = [noteToUse, selectedStaff ? `Assisted by: ${selectedStaff}` : ''].filter(Boolean).join(' · ');

    try {
      const res = await fetch('/api/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: targetLocId,
          starRating: rating || 5,
          selectedPrompts: promptTexts,
          language: langToUse,
          customDetails: noteWithStaff
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.drafts) && data.drafts.length > 0) {
          setEditedDraft(data.drafts[0].text);
          playSuccessChime();
          setIsAiGenerating(false);
          return;
        }
      }
    } catch (_) {}

    // Fallback instant synthesis
    const localText = synthesizeReview(rating, selectedPrompts, noteToUse, reviewOptionIndex, langToUse, selectedStaff);
    setEditedDraft(localText);
    playSuccessChime();
    setIsAiGenerating(false);
  };

  // Cycle to next review style
  const handleCycleReview = () => {
    playTapSound(700);
    const nextIdx = (reviewOptionIndex + 1) % 15;
    setReviewOptionIndex(nextIdx);
    const text = synthesizeReview(rating, selectedPrompts, customNote, nextIdx);
    setEditedDraft(text);
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

  // Submit private feedback to business owner (for 1-3 star recovery)
  const handleSubmitPrivateFeedback = async (e) => {
    e.preventDefault();
    if (!privateMessage.trim()) return;
    setPrivateSending(true);

    try {
      await fetch('/api/feedback/private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: businessInfo?.locationId || locationId || 'default',
          rating,
          customerName: privateName,
          customerContact: privateContact,
          message: privateMessage
        })
      });
      setPrivateSent(true);
      playSuccessChime();
    } catch (err) {
      console.error('Private feedback send error:', err);
    } finally {
      setPrivateSending(false);
    }
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

  const pasteText = PASTE_HELPER_TEXTS[selectedLang] || PASTE_HELPER_TEXTS.en;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-slate-900 flex flex-col justify-between antialiased">
      <div className="max-w-md mx-auto w-full px-4 pt-4 sm:pt-6 pb-6">
        
        {/* Brand Header */}
        <BrandHeader 
          businessName={businessInfo?.businessName || 'Trident Net Holidays'}
          locationName={businessInfo?.locationName || 'Trident Net Holidays'}
          logoUrl={businessInfo?.logoUrl || '/logo.png'}
          primaryColor={businessInfo?.primaryColor || '#0D9488'}
        />

        {/* MAIN: THE 1-PAGE EXPRESS REVIEW BUILDER */}
        {!isSubmitted ? (
          <main className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-900/10 space-y-5">
            
            {/* Personalized Guest Welcome (from WhatsApp link) */}
            {urlCname && (
              <div className="bg-teal-50/90 border border-teal-200/80 rounded-2xl p-3 text-xs text-teal-950 font-bold flex items-center justify-between">
                <span>👋 Welcome, {urlCname}!</span>
                <span className="text-[11px] font-semibold text-teal-700">Trident Net Holidays</span>
              </div>
            )}

            {/* Language Selection Row */}
            <div className="flex items-center justify-center gap-1.5 pb-1">
              {[
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
                { code: 'mr', label: 'मराठी', flag: '🚩' },
                { code: 'gu', label: 'ગુજરાતી', flag: '🪔' }
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 border ${
                    selectedLang === l.code
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            {/* 1. Star Rating */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                How was your experience?
              </h2>
              <p className="text-xs text-slate-500">
                Tap your rating to start:
              </p>
              <div className="pt-1">
                <StarSelector value={rating} onChange={handleRatingChange} />
              </div>
            </div>

            {/* 2. Customer Care Box if 1-3 Stars (Protects Small Business) */}
            {rating <= 3 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                <div className="flex items-start gap-2 text-amber-900 font-bold">
                  <HeartHandshake size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>We are truly sorry your visit was not 5-star!</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Trident Net Holidays' leadership is dedicated to your satisfaction. Would you like to message the owner privately so we can fix this immediately?
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPrivateModal(true)}
                    className="flex-1 py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-xs transition"
                  >
                    ✉️ Message Owner Privately
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAndOpenGoogle}
                    className="py-2 px-3 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs transition"
                  >
                    Post on Google
                  </button>
                </div>
              </div>
            )}

            {/* Optional Staff Attribution */}
            {staffList.length > 0 && (
              <div className="pt-1 border-t border-slate-100 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 px-1 flex items-center gap-1">
                  <Award size={13} className="text-amber-500" /> Who assisted you today? (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {staffList.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const nextStaff = selectedStaff === s.name ? '' : s.name;
                        setSelectedStaff(nextStaff);
                        const text = synthesizeReview(rating, selectedPrompts, customNote, reviewOptionIndex, selectedLang, nextStaff);
                        setEditedDraft(text);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                        selectedStaff === s.name
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Quick Highlight Chips */}
            {businessInfo?.prompts && businessInfo.prompts.length > 0 && (
              <div className="pt-1 border-t border-slate-100">
                <PromptChips 
                  prompts={businessInfo.prompts}
                  selectedPrompts={selectedPrompts}
                  onToggle={handleTogglePrompt}
                />
              </div>
            )}

            {/* 4. AI Custom Detail Input with Voice Dictation */}
            <div className="pt-1 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="block text-xs font-bold text-slate-700">
                  ✨ Mention anything specific? (Optional)
                </label>
                {isListening && (
                  <span className="text-[11px] font-bold text-red-600 animate-pulse flex items-center gap-1">
                    <Mic size={12} /> Listening... Speak now
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleVoiceDictation}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition shrink-0 ${
                    isListening 
                      ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-500/30' 
                      : 'bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border-slate-200'
                  }`}
                  title={isListening ? "Listening... Tap to stop" : "Tap and speak your review"}
                >
                  <Mic size={16} className={isListening ? 'animate-bounce' : ''} />
                </button>

                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAiEnhance(); }}
                  placeholder="Type or tap mic: 'booked Dubai trip, quick visa...'"
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isAiGenerating}
                  className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 transition active:scale-95"
                  title="Enhance review with AI"
                >
                  <Sparkles size={13} className={isAiGenerating ? 'animate-spin' : ''} />
                  <span>{isAiGenerating ? 'Writing...' : 'AI Enhance'}</span>
                </button>
              </div>
            </div>

            {/* 5. Pre-Crafted Editable Review */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-teal-600" />
                  Your AI Review (Ready to Post):
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
                  <span className="text-teal-700 font-medium">⚡ Local SEO Boosted for Google Maps</span>
                  <span>{editedDraft ? editedDraft.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>
            </div>

            {/* 6. The 1-Tap Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleCopyAndOpenGoogle}
                className="w-full py-4 px-5 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 active:scale-98 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2.5 transition-all group"
              >
                <Sparkles size={18} className="text-amber-300 animate-pulse" />
                <span>Post Review on Google (1-Tap Paste)</span>
                <ExternalLink size={16} className="text-teal-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <Check size={11} className="stroke-[3]" /> Auto-Copies
                </span>
                <span>•</span>
                <span>Opens Google Review Form in 1 Tap</span>
              </div>
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
          /* 1-TAP PASTE HELPER SCREEN */
          <main className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-amber-900/10 text-center space-y-5">
            {/* Top Status Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{pasteText.copiedAlert}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {pasteText.copiedTitle}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                {pasteText.copiedSubtitle}
              </p>
            </div>

            {/* Visual Interactive / Animated Phone Mockup */}
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 text-left border border-slate-800 shadow-xl max-w-md mx-auto overflow-hidden relative">
              {/* Simulated Google Maps Review Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
                    G
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 truncate max-w-[180px]">
                      {businessInfo?.businessName || 'Trident Net Holidays'}
                    </p>
                    <p className="text-[10px] text-slate-400">Google Maps Review Form</p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 text-xs tracking-widest font-black">
                  ★★★★★
                </div>
              </div>

              {/* Simulated Review Textarea with 1-Tap Paste Chip */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 relative mb-3">
                <p className="text-slate-300 text-xs italic line-clamp-2">
                  "{editedDraft || 'Excellent service and great holiday planning! Highly recommended.'}"
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/25 text-teal-300 text-[11px] font-bold border border-teal-500/50 shadow-sm animate-pulse">
                    <span>📋 Tap "Paste" Here</span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-semibold">Step 2: Instant Paste</span>
                </div>
              </div>

              {/* 3 Clear Visual Steps */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="w-5 h-5 mx-auto rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center mb-1">
                    1
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-200">{pasteText.step1Title}</p>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-teal-500/40 ring-1 ring-teal-500/50">
                  <div className="w-5 h-5 mx-auto rounded-full bg-teal-500 text-slate-950 text-[10px] font-black flex items-center justify-center mb-1">
                    2
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-teal-300">{pasteText.step2Title}</p>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="w-5 h-5 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center mb-1">
                    3
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-200">{pasteText.step3Title}</p>
                </div>
              </div>
            </div>

            {/* Quick Re-Copy & Preview Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{pasteText.yourDraft}</span>
                <button
                  type="button"
                  onClick={handleRecopy}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    recopied 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-white border border-slate-200 text-teal-700 hover:bg-teal-50'
                  }`}
                >
                  {recopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{recopied ? pasteText.copiedAlert : pasteText.recopyBtn}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 max-h-24 overflow-y-auto leading-relaxed font-sans">
                {editedDraft}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 space-y-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleDirectGoogleClick}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={15} />
                <span>{pasteText.reopenBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft size={13} />
                <span>{pasteText.editBtn}</span>
              </button>
            </div>

            {/* Trust & Explanation Note */}
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-normal">
              {pasteText.googleNotice}
            </p>
          </main>
        )}

        {/* Private Feedback Modal for 1-3 Stars */}
        {showPrivateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
              {!privateSent ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare size={18} className="text-teal-700" />
                      <span>Message Management</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowPrivateModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Your feedback will be delivered directly to the business owner to resolve your concern.
                  </p>

                  <form onSubmit={handleSubmitPrivateFeedback} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={privateName}
                        onChange={(e) => setPrivateName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone or Email (to follow up)</label>
                      <input
                        type="text"
                        value={privateContact}
                        onChange={(e) => setPrivateContact(e.target.value)}
                        placeholder="phone or email"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">What went wrong?</label>
                      <textarea
                        required
                        rows={3}
                        value={privateMessage}
                        onChange={(e) => setPrivateMessage(e.target.value)}
                        placeholder="Please share what happened so we can make this right..."
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={privateSending}
                      className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>{privateSending ? 'Sending...' : 'Send to Owner'}</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check size={24} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Message Delivered</h4>
                  <p className="text-xs text-slate-500">
                    Thank you! Management has received your message and will review it immediately.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrivateModal(false);
                      setPrivateSent(false);
                    }}
                    className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
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
