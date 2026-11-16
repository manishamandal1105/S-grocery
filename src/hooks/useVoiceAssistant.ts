import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function useVoiceAssistant() {
  const { speechLocale } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const recognitionRef = useRef<any>(null);
  const currentCallbackRef = useRef<((text: string) => void) | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Pre-load and cache speech synthesis voices immediately and on dynamic voice updates
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          voicesRef.current = v;
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }, []);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceAvailable(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLocale;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal && currentCallbackRef.current) {
          currentCallbackRef.current(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition not supported on this device/browser');
      setVoiceAvailable(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
      }
    };
  }, [speechLocale]);

  const startListening = useCallback((onResultText?: (text: string) => void) => {
    if (!recognitionRef.current) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        if (onResultText) onResultText('Fresh Daily Mart');
      }, 1500);
      return;
    }

    try {
      setTranscript('');
      recognitionRef.current.lang = speechLocale;
      currentCallbackRef.current = onResultText || null;
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Microphone start error:', err);
      setIsListening(false);
    }
  }, [speechLocale]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }
    setIsListening(false);
  }, []);

  // Multi-lingual Speech Output:
  // - English & Hindi: Untouched, uses native browser SpeechSynthesis (working 100%)
  // - Bengali: Dual-engine support (Browser Native + Zero-Configuration Local TTS Streaming)
  //   Does NOT require installing Windows language packs or altering Windows display language.
  const speak = useCallback((text: string, customLocale?: string, onEnd?: () => void) => {
    if (!text) {
      if (onEnd) onEnd();
      return;
    }

    // Stop any previous active audio immediately
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) { }
      activeAudioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) { }
    }

    const targetLocale = customLocale || speechLocale;
    const langCode = targetLocale.split('-')[0].toLowerCase(); // 'bn', 'hi', 'en'

    // ========================================================
    // 1. ENGLISH & HINDI (PRESERVED EXACTLY AS WORKING BEFORE)
    // ========================================================
    if (langCode !== 'bn') {
      if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLocale;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        const matchingVoice = voices.find((v) => {
          const l = v.lang.toLowerCase().replace('_', '-');
          const n = v.name.toLowerCase();
          return l.startsWith(langCode) || n.includes(langCode === 'hi' ? 'hindi' : 'english');
        });

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      }
      return;
    }

    // ========================================================
    // 2. BENGALI (NO WINDOWS LANGUAGE PACK OR OS CHANGES REQUIRED)
    // ========================================================
    // Refresh available voices on-the-fly from the browser
    const availableVoices = ('speechSynthesis' in window)
      ? (window.speechSynthesis.getVoices().length > 0 ? window.speechSynthesis.getVoices() : voicesRef.current)
      : [];

    const nativeBengaliVoice = availableVoices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      const n = v.name.toLowerCase();
      return (
        l.startsWith('bn') ||
        l.startsWith('ben') ||
        n.includes('bengali') ||
        n.includes('bangla') ||
        n.includes('bashkar') ||
        n.includes('tanishaa') ||
        n.includes('pradeep') ||
        n.includes('nabanita') ||
        n.includes('nabaneeta')
      );
    });

    const cleanup = () => {
      setIsSpeaking(false);
      activeAudioRef.current = null;
      if (onEnd) onEnd();
    };

    // A. If a native Bengali voice is present in the browser (e.g. Microsoft Edge, friend's PC, or mobile):
    if (nativeBengaliVoice && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = nativeBengaliVoice;
        utterance.lang = nativeBengaliVoice.lang || 'bn-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = cleanup;
        utterance.onerror = () => {
          // If native synthesis fails, fallback to streaming audio
          playBengaliAudioStream();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn('Native Bengali SpeechSynthesis error, falling back to /api/tts:', e);
      }
    }

    // B. If NO Bengali voice is installed in the browser/OS (e.g. Chrome on Windows Single Language):
    // Stream authentic, pure Bengali speech through our built-in /api/tts proxy endpoint
    function playBengaliAudioStream() {
      const ttsUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=bn`;
      const audio = new Audio(ttsUrl);
      activeAudioRef.current = audio;

      setIsSpeaking(true);

      audio.onended = cleanup;

      const fallbackToSpeechSynthesis = () => {
        if ('speechSynthesis' in window) {
          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            fallbackUtterance.lang = 'bn-IN';
            fallbackUtterance.rate = 1.0;
            fallbackUtterance.pitch = 1.0;
            fallbackUtterance.onstart = () => setIsSpeaking(true);
            fallbackUtterance.onend = cleanup;
            fallbackUtterance.onerror = cleanup;
            window.speechSynthesis.speak(fallbackUtterance);
            return;
          } catch (e) { }
        }
        cleanup();
      };

      audio.onerror = () => {
        fallbackToSpeechSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or fetch error fallback
          fallbackToSpeechSynthesis();
        });
      }
    }

    playBengaliAudioStream();
  }, [speechLocale]);

  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) { }
      activeAudioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) { }
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    voiceAvailable,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}
