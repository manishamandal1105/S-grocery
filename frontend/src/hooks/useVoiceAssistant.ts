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

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
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
        } catch (e) {}
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
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, customLocale?: string, onEnd?: () => void) => {
    if (!text) {
      if (onEnd) onEnd();
      return;
    }

    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeAudioRef.current = null;
    }

    const targetLocale = customLocale || speechLocale;
    const langCode = targetLocale.split('-')[0].toLowerCase();

    const playViaSpeechSynthesis = () => {
      if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLocale;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        
        let matchingVoice = voices.find((v) => {
          const l = v.lang.toLowerCase().replace('_', '-');
          const n = v.name.toLowerCase();
          return l.startsWith(langCode) || n.includes(langCode === 'bn' ? 'bangla' : langCode === 'hi' ? 'hindi' : 'english');
        });

        if (!matchingVoice && langCode === 'bn') {
          matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().startsWith('in'));
        }

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
    };

    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(text)}`;
      const audio = new Audio(ttsUrl);
      activeAudioRef.current = audio;

      setIsSpeaking(true);
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.onended = () => {
              setIsSpeaking(false);
              if (onEnd) onEnd();
            };
          })
          .catch((err) => {
            console.warn('Audio TTS fallback to SpeechSynthesis:', err);
            playViaSpeechSynthesis();
          });
      }
    } catch (e) {
      playViaSpeechSynthesis();
    }
  }, [speechLocale]);

  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeAudioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
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
