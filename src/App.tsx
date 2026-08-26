import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { UserRole } from './types';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import { Header } from './components/Header';
import { VoiceGuideWidget } from './components/VoiceGuideWidget';
import { OwnerLoginForm } from './components/OwnerLoginForm';
import { HelperLoginForm } from './components/HelperLoginForm';
import { 
  Store, 
  Users, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  Volume2,
  Mic,
  Zap
} from 'lucide-react';

export const App: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [toastMessage, setToastMessage] = useState<{ text: string; role: string } | null>(null);

  // Voice Assistant Hook
  const {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAssistant();

  const [activeMicField, setActiveMicField] = useState<string | null>(null);

  // Spoken welcome greeting
  const handleSpeakWelcome = () => {
    let welcomeText = '';
    if (language === 'bn') {
      welcomeText = 'এস-মুদি দোকানে স্বাগতম। আপনি টাইপ করে বা মুখে কথা বলে লগইন করতে পারেন।';
    } else if (language === 'hi') {
      welcomeText = 'एस-किराना में आपका स्वागत है। आप बोलकर या टाइप करके लॉगिन कर सकते हैं।';
    } else {
      welcomeText = 'Welcome to S-Grocery. You can type or speak into the microphone to log in.';
    }
    speak(welcomeText);
  };

  // Spoken step instructions
  const handleSpeakInstructions = () => {
    let instruction = '';
    if (activeRole === 'owner') {
      if (language === 'bn') {
        instruction = 'মালিকের ইমেইল এবং পাসওয়ার্ড দিন। নতুন দোকান খুলতে রেজিস্টার চাপুন।';
      } else if (language === 'hi') {
        instruction = 'दुकानदार ईमेल और पासवर्ड दर्ज करें। नई दुकान के लिए रजिस्टर दबाएं।';
      } else {
        instruction = 'Enter your owner email and password. Click register if you are opening a new store.';
      }
    } else {
      if (language === 'bn') {
        instruction = 'দোকানের কোড এবং আপনার পাসকোড দিন।';
      } else if (language === 'hi') {
        instruction = 'दुकान का कोड और अपना पासकोड दर्ज करें।';
      } else {
        instruction = 'Enter the store code and helper passcode to log in.';
      }
    }
    speak(instruction);
  };

  // Toggle general listening
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      setActiveMicField(null);
    } else {
      startListening();
    }
  };

  // Handle Voice Input for a specific field
  const handleListeningField = (fieldName: string, onResult: (text: string) => void) => {
    if (isListening && activeMicField === fieldName) {
      stopListening();
      setActiveMicField(null);
      return;
    }

    setActiveMicField(fieldName);
    startListening((text) => {
      onResult(text);
      setActiveMicField(null);
    });
  };

  // Handle successful login
  const handleSuccess = (message: string, role: string) => {
    setToastMessage({ text: message, role });
    speak(message);
    setTimeout(() => {
      // Keep message for 4 seconds
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <Header onSpeakWelcome={handleSpeakWelcome} />

      {/* Main Content Area */}
      <main className="w-full max-w-lg mx-auto my-auto py-4">
        {/* Voice Assistant Floating Widget */}
        <VoiceGuideWidget
          isListening={isListening}
          transcript={transcript}
          onToggleMic={handleToggleMic}
          onSpeakInstructions={handleSpeakInstructions}
          isSpeaking={isSpeaking}
        />

        {/* Success Toast Notification */}
        {toastMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-emerald-200" />
              <div>
                <p className="font-bold text-sm">{toastMessage.text}</p>
                <p className="text-[11px] text-emerald-100">
                  {toastMessage.role === 'owner' ? 'Owner Dashboard Ready' : 'Helper POS Ready'} (Step 1 Frontend Success)
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs bg-emerald-700/80 px-2.5 py-1 rounded-lg hover:bg-emerald-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Card Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setActiveRole('owner');
                setToastMessage(null);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                activeRole === 'owner'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{t('roleOwner')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('helper');
                setToastMessage(null);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                activeRole === 'helper'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('roleHelper')}</span>
            </button>
          </div>

          {/* Form Render based on Active Role */}
          {activeRole === 'owner' ? (
            <OwnerLoginForm
              onListeningField={handleListeningField}
              activeMicField={activeMicField}
              onSuccess={handleSuccess}
            />
          ) : (
            <HelperLoginForm
              onListeningField={handleListeningField}
              activeMicField={activeMicField}
              onSuccess={handleSuccess}
            />
          )}

          {/* Feature Badges Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free Forever</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice & Typing</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Easy Kirana UI</span>
            </div>
          </div>
        </div>
      </main>

      {/* App Footer */}
      <footer className="w-full max-w-lg mx-auto text-center py-4">
        <p className="text-xs text-slate-500 font-medium">
          🌱 S-Grocery Store Management • Frontend Step 1 Completed
        </p>
      </footer>
    </div>
  );
};
