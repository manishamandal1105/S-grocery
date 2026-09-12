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
        if (onResultText) onResultText('Fresh Grocery Mart');
      }, 2500);
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
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = customLocale || speechLocale;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

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
  }, [speechLocale]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      setIsSpeaking(false);
    }
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
