import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { UserRole, ActiveTab } from './types';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import { Header } from './components/Header';
import { VoiceGuideWidget } from './components/VoiceGuideWidget';
import { OwnerLoginForm } from './components/OwnerLoginForm';
import { HelperLoginForm } from './components/HelperLoginForm';
import { SalesDashboard } from './components/SalesDashboard';
import {
  Home,
  TrendingUp,
  Store,
  Users,
  ShieldCheck,
  Mic,
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Receipt,
  BookOpen,
  Package,
  ShoppingBag,
  Clock,
  Wallet
} from 'lucide-react';

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sgrocery_is_logged_in') === 'true';
  });

  const [userStoreName, setUserStoreName] = useState<string>(() => {
    return localStorage.getItem('sgrocery_store_name') || '';
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('sgrocery_user_role') as UserRole) || 'owner';
  });

  // Active Screen: 'home' or 'sales'
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Role selector on login screen
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [toastMessage, setToastMessage] = useState<{ text: string; role: string } | null>(null);

  // Voice Assistant Hooks
  const {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    speak,
  } = useVoiceAssistant();

  const [activeMicField, setActiveMicField] = useState<string | null>(null);

  const handleSpeakWelcome = () => {
    let welcomeText = '';
    if (language === 'bn') {
      welcomeText = isLoggedIn
        ? `${userStoreName || 'দোকানে'} স্বাগতম। আপনি হোম পেজ বা সেলস দেখতে পারেন।`
        : 'এস-মুদি দোকানে স্বাগতম। অনুগ্রহ করে আপনার দোকানের নাম দিয়ে লগইন করুন।';
    } else if (language === 'hi') {
      welcomeText = isLoggedIn
        ? `${userStoreName || 'दुकान'} में आपका स्वागत है। आप होम पेज या सेल्स देख सकते हैं।`
        : 'एस-किराना में आपका स्वागत है। कृपया अपनी दुकान का नाम दर्ज करके लॉगिन करें।';
    } else {
      welcomeText = isLoggedIn
        ? `Welcome to ${userStoreName || 'your store'}. You can explore Home Page and Sales.`
        : 'Welcome to S-Grocery. Please enter your store name and log in to get started.';
    }
    speak(welcomeText);
  };

  const handleSpeakInstructions = () => {
    let instruction = '';
    if (!isLoggedIn) {
      if (activeRole === 'owner') {
        instruction = language === 'bn'
          ? 'আপনার দোকানের নাম, ইমেইল এবং পাসওয়ার্ড দিন। নতুন দোকান হলে রেজিস্টার চাপুন।'
          : language === 'hi'
          ? 'अपनी दुकान का नाम, ईमेल और पासवर्ड दर्ज करें। नई दुकान के लिए रजिस्टर दबाएं।'
          : 'Enter your store name, owner email and password to log in.';
      } else {
        instruction = language === 'bn'
          ? 'দোকানের কোড এবং আপনার হেল্পার পাসকোড দিন।'
          : language === 'hi'
          ? 'दुकान का कोड और अपना पासकोड दर्ज करें।'
          : 'Enter the store code and helper passcode to log in.';
      }
    } else if (activeTab === 'sales') {
      instruction = language === 'bn'
        ? 'সেলস পেজে আজকের মোট বিক্রি, ট্রানজ্যাকশন ও পেমেন্ট হিস্ট্রি দেখতে ও লিখতে পারবেন।'
        : language === 'hi'
        ? 'सेल्स पेज में आज की बिक्री, लेनदेन और भुगतान का विवरण देख व दर्ज कर सकते हैं।'
        : 'On the Sales page, you can track and enter today\'s sales, transactions, and payment breakdown.';
    } else {
      instruction = language === 'bn'
        ? `হোম পেজে স্বাগতম। নিচে সেলস বাটনে চাপ দিয়ে বিক্রি ও হিসাব দেখুন।`
        : language === 'hi'
        ? `होम पेज में आपका स्वागत है। नीचे सेल्स बटन दबाकर बिक्री व बहीखाता देखें।`
        : `Welcome to your Store Home. Tap the Sales button at the bottom to view sales analytics.`;
    }
    speak(instruction);
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      setActiveMicField(null);
    } else {
      startListening();
    }
  };

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

  // Called when user successfully submits Login / Register
  const handleSuccess = (message: string, role: string, storeName?: string) => {
    const finalStoreName = storeName && storeName.trim() ? storeName.trim() : (userStoreName || 'My Kirana Store');

    setUserStoreName(finalStoreName);
    setUserRole(role as UserRole);
    setIsLoggedIn(true);
    setActiveTab('home');

    localStorage.setItem('sgrocery_is_logged_in', 'true');
    localStorage.setItem('sgrocery_store_name', finalStoreName);
    localStorage.setItem('sgrocery_user_role', role);

    setToastMessage({ text: message, role });
    speak(`${message} Welcome to ${finalStoreName}`);
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('sgrocery_is_logged_in');
    setActiveTab('home');
    setToastMessage(null);
    speak(language === 'bn' ? 'সফলভাবে লগআউট হয়েছে।' : language === 'hi' ? 'सफलतापूर्वक लॉगआउट हो गया।' : 'Logged out successfully.');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-slate-100 relative overflow-x-hidden selection:bg-emerald-600 selection:text-white">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. TOP HEADER (Contains branding, language switcher, and logout when logged in) */}
      <Header
        onSpeakWelcome={handleSpeakWelcome}
        isLoggedIn={isLoggedIn}
        storeName={userStoreName}
        onLogout={handleLogout}
        onGoHome={() => setActiveTab('home')}
      />

      {/* 2. MAIN APPLICATION CONTENT */}
      {!isLoggedIn ? (
        /* ======================== A. LOGIN PAGE VIEW (UNAUTHENTICATED) ======================== */
        <main className="w-full flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 my-auto">
          <div className="w-full max-w-6xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-center">
              {/* Left Column: Full-screen Desktop App Showcase */}
              <div className="hidden lg:block lg:col-span-6 space-y-6 text-left pr-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>100% Free Store Management for Kirana & Retail</span>
                </div>

                <h1 className="text-3xl xl:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                  Run your grocery store faster, smarter & in your own language.
                </h1>

                <p className="text-slate-600 text-sm xl:text-base leading-relaxed">
                  Voice-assisted billing, zero-setup sales tracking, khata credit registers, and real-time inventory designed for small, medium, and large grocery shops.
                </p>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs text-slate-800">Voice & Typing Entry</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Speak items in বাংলা, English, or हिन्दी</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 mb-2">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs text-slate-800">Sales Dashboard</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cash, UPI, and credit sales breakdown</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-2">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs text-slate-800">Instant Billing</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Generate receipts & bills in seconds</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs text-slate-800">Safe & Offline Ready</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Your shop data saved securely</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Enter your store name on the right to launch your dashboard.</span>
                </div>
              </div>

              {/* Right Column: Responsive Login / Register Card */}
              <div className="lg:col-span-6 w-full max-w-md mx-auto">
                {/* Voice Assistant Floating Widget */}
                <VoiceGuideWidget
                  isListening={isListening}
                  transcript={transcript}
                  onToggleMic={handleToggleMic}
                  onSpeakInstructions={handleSpeakInstructions}
                  isSpeaking={isSpeaking}
                />

                {/* Login Card */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-white/95 border border-slate-200/90 backdrop-blur-xl">
                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRole('owner');
                        setToastMessage(null);
                      }}
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
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
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        activeRole === 'helper'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{t('roleHelper')}</span>
                    </button>
                  </div>

                  {/* Form Component (Store name starts empty, user enters their own store name) */}
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

                  {/* Trust Badges */}
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
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* ======================== B. AUTHENTICATED STORE VIEW ======================== */
        <main className="w-full flex-1 flex flex-col justify-start pb-28 px-2 sm:px-4 md:px-6">
          {/* Success Banner if just logged in */}
          {toastMessage && (
            <div className="w-full max-w-5xl mx-auto mb-4 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-6 h-6 text-emerald-200 shrink-0" />
                <div>
                  <p className="font-bold text-sm">{toastMessage.text}</p>
                  <p className="text-[11px] text-emerald-100">
                    Store: <strong className="underline">{userStoreName}</strong> • Logged in as {userRole === 'owner' ? 'Owner' : 'Helper'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-xs bg-emerald-700/80 px-2.5 py-1.5 rounded-xl hover:bg-emerald-800 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tab Switcher Body */}
          {activeTab === 'sales' ? (
            /* 1. SALES DASHBOARD VIEW (Receives user's exact store name entered at login) */
            <section className="w-full">
              <SalesDashboard
                storeName={userStoreName}
                onBackToHome={() => setActiveTab('home')}
              />
            </section>
          ) : (
            /* 2. STORE HOME PAGE VIEW */
            <section className="w-full max-w-5xl mx-auto space-y-5 animate-fadeIn">
              {/* Store Welcome Banner */}
              <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white p-6 sm:p-8 shadow-xl shadow-emerald-700/20 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-400/20 blur-xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-3xl shadow-inner shrink-0">
                      🏪
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 border border-emerald-300/40">
                          {userRole === 'owner' ? 'Store Owner' : 'Helper POS'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                        <span className="text-xs text-emerald-100 font-medium">Shop Open</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                        {userStoreName || 'My Grocery Store'}
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                        Welcome to your store home page. Manage sales, billing, and stock in one place.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-white text-emerald-800 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Open Sales Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Voice Guide Widget in Home View */}
              <VoiceGuideWidget
                isListening={isListening}
                transcript={transcript}
                onToggleMic={handleToggleMic}
                onSpeakInstructions={handleSpeakInstructions}
                isSpeaking={isSpeaking}
              />

              {/* Quick Actions Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Quick Kirana Features & Tools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Quick Billing */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Quick Kirana Billing</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter items by voice or typing and print customer receipts instantly.
                    </p>
                    <button
                      type="button"
                      onClick={() => alert(`Starting new bill for ${userStoreName}...`)}
                      className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Start New Bill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: Sales Dashboard Shortcut */}
                  <div
                    onClick={() => setActiveTab('sales')}
                    className="p-5 rounded-3xl bg-white border border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Sales Dashboard</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                        Feature
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Track today's total sales, UPI/cash payment modes, and export reports.
                    </p>
                    <div className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span>View Sales Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Card 3: Khata Register */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Customer Khata / Udhaar</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage customer credit balances, payment reminders, and receipts.
                    </p>
                    <button
                      type="button"
                      onClick={() => alert(`Opening Khata register for ${userStoreName}...`)}
                      className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Khata Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4: Inventory */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <Package className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Inventory & Stock</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Check low stock items, flour, edible oil, spices, and price lists.
                    </p>
                    <button
                      type="button"
                      onClick={() => alert(`Opening Inventory for ${userStoreName}...`)}
                      className="mt-3 text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Stock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's Quick Numbers Snapshot */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Today's Live Store Snapshot
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Analytics</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase">Today's Sales</p>
                    <p className="text-lg font-black text-emerald-900 mt-0.5">₹0.00</p>
                    <p className="text-[10px] text-emerald-600">Manual entry ready</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                    <p className="text-[11px] font-bold text-teal-800 uppercase">Transactions</p>
                    <p className="text-lg font-black text-teal-900 mt-0.5">0</p>
                    <p className="text-[10px] text-teal-600">Ready for first bill</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                    <p className="text-[11px] font-bold text-amber-800 uppercase">Khata Udhaar</p>
                    <p className="text-lg font-black text-amber-900 mt-0.5">₹0.00</p>
                    <p className="text-[10px] text-amber-600">All balances clear</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ======================== FIXED BOTTOM NAVIGATION BAR ======================== */}
          {/* Positioned at the bottom of the screen, only visible after user has logged in */}
          <nav
            aria-label="Bottom Navigation"
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl shadow-slate-900/15 py-2.5 px-4 sm:px-8"
          >
            <div className="max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4">
              {/* Button 1: Home Page */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span>{t('navHome')}</span>
              </button>

              {/* Button 2: Sales */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sales');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-102'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span>{t('navSales')}</span>
              </button>
            </div>
          </nav>
        </main>
      )}

      {/* 3. APP FOOTER (Only when not logged in; logged-in view has the fixed bottom nav bar) */}
      {!isLoggedIn && (
        <footer className="w-full max-w-lg mx-auto text-center py-4 px-3">
          <p className="text-xs text-slate-500 font-medium">
            🌱 S-Grocery Store Management • Built for Kirana & Retail Stores
          </p>
        </footer>
      )}
    </div>
  );
};
