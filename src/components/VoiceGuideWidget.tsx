import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

interface VoiceGuideWidgetProps {
  isListening: boolean;
  transcript: string;
  onToggleMic: () => void;
  onSpeakInstructions: () => void;
  isSpeaking: boolean;
}

export const VoiceGuideWidget: React.FC<VoiceGuideWidgetProps> = ({
  isListening,
  transcript,
  onToggleMic,
  onSpeakInstructions,
  isSpeaking,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-md mx-auto mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-2xl p-3.5 border border-emerald-100/80 shadow-sm flex items-center justify-between gap-3">
      {/* Icon & Message */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
              : 'bg-emerald-600 text-white shadow-sm'
          }`}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-800">
              {isListening ? t('voiceSpeaking') : t('voiceGuideTitle')}
            </p>
            {isListening && (
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 bg-red-500 rounded-full animate-wave-1"></span>
                <span className="w-1 bg-red-500 rounded-full animate-wave-2"></span>
                <span className="w-1 bg-red-500 rounded-full animate-wave-3"></span>
                <span className="w-1 bg-red-500 rounded-full animate-wave-4"></span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {transcript ? `"${transcript}"` : t('voiceGuideHelp')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onSpeakInstructions}
          title={t('speakPrompt')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
            isSpeaking
              ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Volume2 className="w-4 h-4 text-emerald-700" />
        </button>

        <button
          type="button"
          onClick={onToggleMic}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isListening
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>{t('voiceMicStop')}</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>{t('voiceMicStart')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
