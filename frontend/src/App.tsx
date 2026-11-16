import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { OnboardingStep, OwnerSetupData, UserRole } from './types';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { LanguageSelectScreen } from './components/LanguageSelectScreen';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { OwnerLoginScreen } from './components/OwnerLoginScreen';
import { EmployeeLoginScreen } from './components/EmployeeLoginScreen';
import { OwnerDashboard } from './components/OwnerDashboard';
import { SalesDashboard } from './components/SalesDashboard';
import { Home, TrendingUp } from 'lucide-react';

export const App: React.FC = () => {
  const { language } = useLanguage();
  const soundFx = useSoundEffects();

  // Primary Step Machine - starts at splash screen on initial launch
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    const isLoggedIn = localStorage.getItem('sgrocery_is_logged_in') === 'true';
    if (isLoggedIn) {
      return 'owner-dashboard';
    }
    return 'splash';
  });

  // State for user details
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

  const handleStepBack = () => {
    soundFx.playClick();
    if (currentStep === 'language') setCurrentStep('splash');
    else if (currentStep === 'role') setCurrentStep('language');
    else if (currentStep === 'owner-login') setCurrentStep('role');
    else if (currentStep === 'employee-login') setCurrentStep('role');
    else if (currentStep === 'sales-dashboard') setCurrentStep('owner-dashboard');
    else if (currentStep === 'staff-flow') setCurrentStep('role');
  };

  const handleResetAll = () => {
    soundFx.playClick();
    localStorage.removeItem('sgrocery_is_logged_in');
    setCurrentStep('splash');
    setOwnerData({
      loginMethod: 'email',
      email: '',
      phone: '',
      password: '',
      ownerName: '',
      shopName: '',
      businessType: 'small',
      quickPin: '',
    });
  };

  // Sales Dashboard view (accessible after login/dashboard, with fixed bottom navigation)
  if (currentStep === 'sales-dashboard') {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between pb-24">
        <Header
          isLoggedIn={true}
          storeName={ownerData.shopName || localStorage.getItem('sgrocery_store_name') || ''}
          onLogout={handleResetAll}
          onGoHome={() => setCurrentStep('owner-dashboard')}
        />
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-4 animate-fadeIn">
          <SalesDashboard
            storeName={ownerData.shopName || localStorage.getItem('sgrocery_store_name') || ''}
            onBackToHome={() => setCurrentStep('owner-dashboard')}
          />
        </main>
        {/* Fixed bottom navigation bar */}
        <nav
          aria-label="Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl shadow-slate-900/15 py-2.5 px-4 sm:px-8"
        >
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep('owner-dashboard')}
              className="py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Home Page</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('sales-dashboard')}
              className="py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#008744] text-white shadow-lg shadow-emerald-700/30 scale-102"
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Sales</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Dashboard is full-screen — render it outside the onboarding shell
  if (currentStep === 'owner-dashboard') {
    return (
      <OwnerDashboard
        data={ownerData}
        onReset={handleResetAll}
        onNavigateToSales={() => setCurrentStep('sales-dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbfcf9] text-slate-800 relative selection:bg-emerald-600 selection:text-white">
      {/* Onboarding Steps: Full-screen responsive viewport without top header interference on image-based auth pages */}
      <main className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] relative">
        {/* 1. Splash Screen (5 seconds -> language) */}
        {currentStep === 'splash' && (
          <SplashScreen onComplete={() => setCurrentStep('language')} />
        )}

        {/* 2. Choose Language Page */}
        {currentStep === 'language' && (
          <LanguageSelectScreen
            onContinue={() => setCurrentStep('role')}
            onBack={() => setCurrentStep('splash')}
          />
        )}

        {/* 3. Role Selection Page */}
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

        {/* 4. Shop Owner Login Page */}
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

        {/* 5. Employee / Staff Login Page */}
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
