import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface RoleSelectScreenProps {
  onSelectRole: (role: UserRole) => void;
  onBack?: () => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({ onSelectRole, onBack }) => {
  const { language } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();
  const hasSpokenRef = useRef(false);

  // Exact multilingual translations requested by Requirement 4
  const content = {
    en: {
      heading: "I am",
      ownerTitle: "Shop Owner",
      ownerDesc: "Full access to all features",
      staffTitle: "Employee/Staff",
      staffDesc: "Limited access for billing and stock view",
      promptAudio: "Select your role.",
      locale: "en-US",
    },
    bn: {
      heading: "আমি হলাম",
      ownerTitle: "দোকানের মালিক",
      ownerDesc: "সব সুবিধা ব্যবহারের পূর্ণ অধিকার রয়েছে",
      staffTitle: "কর্মচারী/কর্মী",
      staffDesc: "বিল তৈরি এবং মজুত দেখার জন্য সীমিত প্রবেশাধিকার।",
      promptAudio: "আপনার ভূমিকা নির্বাচন করুন।",
      locale: "bn-IN",
    },
    hi: {
      heading: "मैं हूँ",
      ownerTitle: "दुकान का मालिक",
      ownerDesc: "सभी सुविधाओं का उपयोग करने का पूरा अधिकार है",
      staffTitle: "कर्मचारी/स्टाफ",
      staffDesc: "बिलिंग और स्टॉक देखने के लिए सीमित पहुँच",
      promptAudio: "अपनी भूमिका चुनें।",
      locale: "hi-IN",
    },
  };

  const activeContent = content[language] || content.en;

  // Voice Assistance upon landing: plays immediately
  useEffect(() => {
    if (!hasSpokenRef.current) {
      hasSpokenRef.current = true;
      speak(activeContent.promptAudio, activeContent.locale);
    }
  }, [activeContent, speak]);

  const handleSelect = (role: UserRole) => {
    soundFx.playClick();
    onSelectRole(role);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between items-center px-4 sm:px-8 py-8 sm:py-12 animate-fadeIn relative">
      
      {/* Full-width Responsive Container filling Laptop and Mobile screens */}
      <div className="w-full max-w-5xl my-auto flex flex-col items-center">
        
        {/* Main Heading dynamically rendered in selected language: "I am" / "আমি হলাম" / "मैं हूँ" */}
        <div className="text-center pb-6 sm:pb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {activeContent.heading}
          </h1>
        </div>

        {/* 2-Column Responsive Grid on Laptop/Desktop, Stacked on Mobile */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Shop Owner */}
          <button
            type="button"
            onClick={() => handleSelect('owner')}
            className="w-full text-left p-5 sm:p-7 rounded-3xl border-2 border-slate-200/90 hover:border-[#008744] hover:shadow-xl bg-white transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            {/* Storefront Image */}
            <div className="w-full h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-slate-100 relative mb-4">
              <img
                src="/assets/shop_owner_store.jpg"
                alt="Kirana Grocery Storefront"
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              />
            </div>

            {/* Title & Description in Selected Language */}
            <div className="text-center pt-1 pb-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#008744] transition-colors">
                {activeContent.ownerTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                {activeContent.ownerDesc}
              </p>
            </div>
          </button>

          {/* Card 2: Employee / Staff */}
          <button
            type="button"
            onClick={() => handleSelect('helper')}
            className="w-full text-left p-5 sm:p-7 rounded-3xl border-2 border-slate-200/90 hover:border-[#008744] hover:shadow-xl bg-white transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            {/* Staff Photo */}
            <div className="w-full h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-slate-100 relative mb-4">
              <img
                src="/assets/employee_staff.jpg"
                alt="Employee / Staff Team"
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              />
            </div>

            {/* Title & Description in Selected Language */}
            <div className="text-center pt-1 pb-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#008744] transition-colors">
                {activeContent.staffTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                {activeContent.staffDesc}
              </p>
            </div>
          </button>

        </div>

      </div>

    </div>
  );
};
