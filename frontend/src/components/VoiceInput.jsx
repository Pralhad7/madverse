import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';
import { playTapSound, playSuccessChime } from '../utils/sound';

export default function VoiceInput({ onTranscript, placeholder = 'Tap mic and speak your experience...' }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [pulseLevel, setPulseLevel] = useState(1);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        playTapSound(700, 0.08);
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText) {
          onTranscript(currentText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        playSuccessChime();
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started or blocked
      }
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`relative group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 ${
          isListening
            ? 'bg-red-500 text-white shadow-red-500/30 shadow-md ring-4 ring-red-100'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
        }`}
        title={isListening ? 'Stop listening' : 'Dictate with your voice'}
      >
        {isListening ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span>Listening... Speak now</span>
            <MicOff size={14} className="stroke-[2.5]" />
          </>
        ) : (
          <>
            <Mic size={14} className="text-teal-600 group-hover:scale-110 transition-transform" />
            <span>Voice Dictate Note</span>
            <Sparkles size={12} className="text-amber-500" />
          </>
        )}
      </button>

      {isListening && (
        <span className="text-[11px] text-red-600 font-semibold animate-pulse">
          Transcribing voice...
        </span>
      )}
    </div>
  );
}
