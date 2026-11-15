import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { OnboardingStep, OwnerSetupData, UserRole } from './types';
import { useSoundEffects } from './hooks/useSoundEffects';
import { SplashScreen } from './components/SplashScreen';
import { LanguageSelectScreen } from './components/LanguageSelectScreen';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { OwnerLoginScreen } from './components/OwnerLoginScreen';
import { EmployeeLoginScreen } from './components/EmployeeLoginScreen';
import { SalesDashboard } from './components/SalesDashboard';
import { Home, TrendingUp, Sparkles, Store, ShoppingBag } from 'lucide-react';

export const App: React.FC = () => {
  const { language } = useLanguage();
  const soundFx = useSoundEffects();

  // Primary Step Machine
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    const isLoggedIn = localStorage.getItem('sgrocery_is_logged_in') === 'true';
    return isLoggedIn ? 'owner-dashboard' : 'splash';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'sales'>('home');

  const [ownerData, setOwnerData] = useState<OwnerSetupData>(() => ({
    loginMethod: 'email',
    email: localStorage.getItem('sgrocery_user_email') || '',
    phone: '',
    password: '',
    ownerName: localStorage.getItem('sgrocery_owner_name') || '',
    shopName: localStorage.getItem('sgrocery_store_name') || '',
    businessType: 'small',
    quickPin: '',
  }));

  const handleResetAll = () => {
    soundFx.playClick();
    localStorage.removeItem('sgrocery_is_logged_in');
    setCurrentStep('splash');
  };

  // Logged-in Main App (Home Page & Sales)
  if (currentStep === 'owner-dashboard') {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between pb-24 text-slate-800">
        {/* Top Header */}
        <header className="w-full bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {ownerData.shopName || localStorage.getItem('sgrocery_store_name') || 'My Store'}
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold">
                {localStorage.getItem('sgrocery_user_role') === 'owner' ? 'Owner' : 'Staff'} • {localStorage.getItem('sgrocery_business_type') || 'Retail Shop'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAll}
            className="text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </header>

        {/* View Switcher: Home Page or Sales */}
        <main className="w-full flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 animate-fadeIn">
          {activeTab === 'home' ? (
            <div className="space-y-6">
              {/* Hero Greeting */}
              <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white p-6 sm:p-8 shadow-xl shadow-emerald-700/20">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    Store Live
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Welcome, {ownerData.ownerName || 'Store Owner'}!
                </h2>
                <p className="text-sm sm:text-base text-emerald-100 mt-1 max-w-xl">
                  Your store dashboard is running with full voice assistance. Click below to inspect your daily sales performance or enter transactions.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
                  >
                    Open Sales Dashboard →
                  </button>
                </div>
              </div>

              {/* Quick Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">Today's Sales</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₹0.00</p>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">Total Transactions</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">0</p>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">Estimated Profit</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">₹0.00</p>
                </div>
              </div>
            </div>
          ) : (
            <SalesDashboard
              storeName={ownerData.shopName || localStorage.getItem('sgrocery_store_name') || ''}
              onBackToHome={() => setActiveTab('home')}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation: Home Page and Sales */}
        <nav
          aria-label="Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-2.5 px-4 sm:px-8"
        >
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#008744] text-white shadow-lg shadow-emerald-700/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Home Page</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-[#008744] text-white shadow-lg shadow-emerald-700/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Sales</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbfcf9] text-slate-800 relative selection:bg-emerald-600 selection:text-white">
      <main className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] relative">
        {/* 1. Splash Screen */}
        {currentStep === 'splash' && (
          <SplashScreen onComplete={() => setCurrentStep('language')} />
        )}

        {/* 2. Choose Language */}
        {currentStep === 'language' && (
          <LanguageSelectScreen
            onContinue={() => setCurrentStep('role')}
            onBack={() => setCurrentStep('splash')}
          />
        )}

        {/* 3. Role Selection */}
        {currentStep === 'role' && (
          <RoleSelectScreen
            onSelectRole={(role: UserRole) => {
              if (role === 'owner') {
                setCurrentStep('owner-login');
              } else {
                setCurrentStep('employee-login');
              }
            }}
            onBack={() => setCurrentStep('language')}
          />
        )}

        {/* 4. Shop Owner Login */}
        {currentStep === 'owner-login' && (
          <OwnerLoginScreen
            onBack={() => setCurrentStep('role')}
            onLoginSuccess={(loginData) => {
              setOwnerData((prev) => ({
                ...prev,
                ownerName: loginData.ownerName,
                shopName: loginData.shopName,
                email: loginData.email,
              }));
              setCurrentStep('owner-dashboard');
            }}
          />
        )}

        {/* 5. Employee / Staff Login */}
        {currentStep === 'employee-login' && (
          <EmployeeLoginScreen
            onBack={() => setCurrentStep('role')}
            onLoginSuccess={() => {
              setCurrentStep('owner-dashboard');
            }}
          />
        )}
      </main>
    </div>
  );
};
