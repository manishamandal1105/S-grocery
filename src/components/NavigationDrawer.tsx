import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import {
  userService,
  UserRole,
  UserProfileData,
  EmployeeRecord,
} from '../services/userService';
import {
  X,
  ArrowLeft,
  User,
  ShieldCheck,
  Settings,
  Users,
  Headphones,
  LogOut,
  Camera,
  ChevronRight,
  ChevronDown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Smartphone,
  Laptop,
  Store,
  Briefcase,
  MapPin,
  Check,
  Globe,
  Palette,
  Bell,
  Sparkles,
  Key,
  BookOpen,
  HelpCircle,
  Copy,
  CheckCircle2,
  Calendar,
  Crown,
  Grid,
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentRole?: UserRole;
  currentStoreName?: string;
  onStoreNameUpdate?: (newName: string) => void;
}

type ActiveView =
  | 'menu'
  | 'profile'
  | 'privacy'
  | 'preferences'
  | 'employee-access'
  | 'support';

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onLogout,
  currentRole = 'owner',
  currentStoreName,
  onStoreNameUpdate,
}) => {
  const { language, setLanguage } = useLanguage();
  const soundFx = useSoundEffects();
  const { speak } = useVoiceAssistant();

  // Active sub-page inside the navigation drawer workflow
  const [activeView, setActiveView] = useState<ActiveView>('menu');

  // User Profile State
  const [profile, setProfile] = useState<UserProfileData>({
    role: currentRole,
    storeName: currentStoreName || '',
    ownerName: '',
    employeeNo: '',
    employeeName: '',
    email: '',
    phone: '',
    password: '',
    passcode: '',
    businessType: 'Retail Shop',
    address: '',
    joinedDate: '',
    profilePicUrl: '',
    theme: (localStorage.getItem('sgrocery_theme') as any) || 'default',
    language: language || 'en',
    notifications: (localStorage.getItem('sgrocery_notifications') as any) || 'on',
    devices: [],
  });

  // UI state for password toggles & forms
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [showDevicesList, setShowDevicesList] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Employee Access Generator Form State
  const [empNoInput, setEmpNoInput] = useState('');
  const [empNameInput, setEmpNameInput] = useState('');
  const [generatedPasscode, setGeneratedPasscode] = useState('');
  const [employeeRoster, setEmployeeRoster] = useState<EmployeeRecord[]>([]);

  // Device file input for profile picture selection
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Translations for all 3 languages (English, Bengali, Hindi)
  const t = {
    en: {
      owner: 'Owner',
      employeeStaff: 'Employee / Staff',
      joined: 'Joined:',
      profile: 'Profile',
      privacySecurity: 'Privacy & Security',
      preferences: 'Preferences',
      employeeAccess: 'Employee Access',
      support: 'Support',
      logout: 'Logout',
      saveChanges: 'Save Changes',
      savedSuccess: 'Changes saved successfully!',
      ownerInfo: 'Owner Information',
      ownerName: 'Owner Name',
      enterOwnerName: 'Enter owner name',
      storeInfo: 'Store Information',
      storeName: 'Store Name',
      enterStoreName: 'Enter store name',
      businessType: 'Business Type',
      address: 'Address',
      enterStoreAddress: 'Enter store address',
      employeeNo: 'Employee No.',
      enterEmpNo: 'Enter employee number',
      employeeName: 'Employee Name',
      enterEmpName: 'Enter employee name',
      emailAddress: 'Email Address',
      enterEmail: 'Enter email address',
      password: 'Password',
      enterPassword: 'Enter password',
      phoneNumber: 'Phone Number',
      enterPhone: 'Enter phone number',
      passcode: 'Passcode',
      enterPasscode: 'Enter passcode',
      devices: 'Devices',
      manageDevices: 'Manage your devices',
      devicesConnected: 'devices currently connected',
      activeNow: 'Active Now',
      language: 'Language',
      theme: 'Theme',
      notification: 'Notification',
      defaultTheme: 'Default',
      darkMode: 'Dark Mode',
      on: 'On',
      off: 'Off',
      generate: 'Generate',
      generateSuccess: 'Passcode Generated Successfully!',
      existingEmployees: 'Registered Employees & Passcodes',
      copyPasscode: 'Copy',
      copied: 'Copied!',
      helpSupport: 'Help & Support',
      helpGuides: 'Help & Guides',
      learnApp: 'Learn how to use the app',
      changePhoto: 'Click camera to change photo',
    },
    bn: {
      owner: 'দোকানের মালিক',
      employeeStaff: 'কর্মচারী / কর্মী',
      joined: 'যোগদান:',
      profile: 'প্রোফাইল',
      privacySecurity: 'গোপনীয়তা ও নিরাপত্তা',
      preferences: 'পছন্দসমূহ',
      employeeAccess: 'কর্মচারী অ্যাক্সেস',
      support: 'সহায়তা',
      logout: 'লগআউট',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      savedSuccess: 'সফলভাবে সংরক্ষিত হয়েছে!',
      ownerInfo: 'মালিকের তথ্য',
      ownerName: 'মালিকের নাম',
      enterOwnerName: 'মালিকের নাম লিখুন',
      storeInfo: 'দোকানের তথ্য',
      storeName: 'দোকানের নাম',
      enterStoreName: 'দোকানের নাম লিখুন',
      businessType: 'ব্যবসার ধরন',
      address: 'ঠিকানা',
      enterStoreAddress: 'দোকানের ঠিকানা লিখুন',
      employeeNo: 'কর্মচারী নম্বর',
      enterEmpNo: 'কর্মচারী নম্বর লিখুন',
      employeeName: 'কর্মচারীর নাম',
      enterEmpName: 'কর্মচারীর নাম লিখুন',
      emailAddress: 'ইমেল ঠিকানা',
      enterEmail: 'ইমেল ঠিকানা লিখুন',
      password: 'পাসওয়ার্ড',
      enterPassword: 'পাসওয়ার্ড লিখুন',
      phoneNumber: 'ফোন নম্বর',
      enterPhone: 'ফোন নম্বর লিখুন',
      passcode: 'পাসকোড',
      enterPasscode: 'পাসকোড লিখুন',
      devices: 'সংযুক্ত ডিভাইস',
      manageDevices: 'আপনার ডিভাইস পরিচালনা করুন',
      devicesConnected: 'টি ডিভাইস সংযুক্ত রয়েছে',
      activeNow: 'এখন সক্রিয়',
      language: 'ভাষা',
      theme: 'থিম',
      notification: 'বিজ্ঞপ্তি',
      defaultTheme: 'ডিফল্ট (হালকা)',
      darkMode: 'ডার্ক মোড',
      on: 'চালু',
      off: 'বন্ধ',
      generate: 'তৈরি করুন',
      generateSuccess: 'পাসকোড সফলভাবে তৈরি হয়েছে!',
      existingEmployees: 'নিবন্ধিত কর্মচারী এবং পাসকোড',
      copyPasscode: 'কপি',
      copied: 'কপি হয়েছে!',
      helpSupport: 'সহায়তা ও সাহায্য',
      helpGuides: 'সহায়তা ও নির্দেশিকা',
      learnApp: 'অ্যাপটি কীভাবে ব্যবহার করবেন তা জানুন',
      changePhoto: 'ছবি পরিবর্তন করতে ক্যামেরায় ক্লিক করুন',
    },
    hi: {
      owner: 'दुकान मालिक',
      employeeStaff: 'कर्मचारी / स्टाफ',
      joined: 'जुड़े:',
      profile: 'प्रोफाइल',
      privacySecurity: 'गोपनीयता और सुरक्षा',
      preferences: 'प्राथमिकताएं',
      employeeAccess: 'कर्मचारी पहुंच',
      support: 'सहायता',
      logout: 'लॉगआउट',
      saveChanges: 'बदलाव सहेजें',
      savedSuccess: 'सफलतापूर्वक सहेजा गया!',
      ownerInfo: 'मालिक की जानकारी',
      ownerName: 'मालिक का नाम',
      enterOwnerName: 'मालिक का नाम दर्ज करें',
      storeInfo: 'दुकान की जानकारी',
      storeName: 'दुकान का नाम',
      enterStoreName: 'दुकान का नाम दर्ज करें',
      businessType: 'व्यापार का प्रकार',
      address: 'पता',
      enterStoreAddress: 'दुकान का पता दर्ज करें',
      employeeNo: 'कर्मचारी संख्या',
      enterEmpNo: 'कर्मचारी संख्या दर्ज करें',
      employeeName: 'कर्मचारी का नाम',
      enterEmpName: 'कर्मचारी का नाम दर्ज करें',
      emailAddress: 'ईमेल पता',
      enterEmail: 'ईमेल पता दर्ज करें',
      password: 'पासवर्ड',
      enterPassword: 'पासवर्ड दर्ज करें',
      phoneNumber: 'फ़ोन नंबर',
      enterPhone: 'फ़ोन नंबर दर्ज करें',
      passcode: 'पासकोड',
      enterPasscode: 'पासकोड दर्ज करें',
      devices: 'डिवाइस',
      manageDevices: 'अपने डिवाइस प्रबंधित करें',
      devicesConnected: 'डिवाइस जुड़े हुए हैं',
      activeNow: 'अभी सक्रिय',
      language: 'भाषा',
      theme: 'थीम',
      notification: 'सूचनाएं',
      defaultTheme: 'डिफ़ॉल्ट',
      darkMode: 'डार्क मोड',
      on: 'चालू',
      off: 'बंद',
      generate: 'जेनरेट करें',
      generateSuccess: 'पासकोड सफलतापूर्वक जेनरेट हुआ!',
      existingEmployees: 'पंजीकृत कर्मचारी और पासकोड',
      copyPasscode: 'कॉपी',
      copied: 'कॉपी हो गया!',
      helpSupport: 'सहायता और सहायता',
      helpGuides: 'सहायता और गाइड',
      learnApp: 'ऐप का उपयोग करना सीखें',
      changePhoto: 'फ़ोटो बदलने के लिए कैमरे पर क्लिक करें',
    },
  };

  const curr = t[language] || t.en;

  // Fetch dynamic user profile from Firebase/localStorage on open
  useEffect(() => {
    if (isOpen) {
      userService.getUserProfile(currentRole).then((data) => {
        setProfile(data);
      });
      setEmployeeRoster(userService.getEmployeeList());
      setActiveView('menu');
      setSaveSuccessMsg('');
    }
  }, [isOpen, currentRole]);

  // Handle Photo Upload from device gallery / camera
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playClick();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile((prev) => ({ ...prev, profilePicUrl: base64String }));
        userService.saveUserProfile({ profilePicUrl: base64String });
        speak(
          language === 'bn'
            ? 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।'
            : language === 'hi'
            ? 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट किया गया।'
            : 'Profile photo updated successfully.'
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes handler
  const handleSaveChanges = async () => {
    soundFx.playSuccess();
    await userService.saveUserProfile(profile);
    if (onStoreNameUpdate && profile.storeName) {
      onStoreNameUpdate(profile.storeName);
    }
    setSaveSuccessMsg(curr.savedSuccess);
    speak(curr.savedSuccess);
    setTimeout(() => {
      setSaveSuccessMsg('');
      setActiveView('menu');
    }, 1200);
  };

  // Generate Unique 4-digit Passcode for Employee
  const handleGeneratePasscode = () => {
    soundFx.playClick();
    if (!empNoInput.trim() || !empNameInput.trim()) {
      alert(
        language === 'bn'
          ? 'অনুগ্রহ করে কর্মচারী নম্বর এবং নাম লিখুন।'
          : language === 'hi'
          ? 'कृपया कर्मचारी संख्या और नाम दर्ज करें।'
          : 'Please enter Employee No. and Employee Name.'
      );
      return;
    }

    const newCode = userService.generateUniquePasscode();
    setGeneratedPasscode(newCode);

    const newRecord = userService.saveEmployee({
      employeeNo: empNoInput.trim(),
      employeeName: empNameInput.trim(),
      passcode: newCode,
      storeName: profile.storeName,
    });

    setEmployeeRoster(userService.getEmployeeList());
    setSaveSuccessMsg(curr.generateSuccess);
    speak(
      language === 'bn'
        ? `পাসকোড তৈরি হয়েছে: ${newCode}`
        : language === 'hi'
        ? `पासकोड जेनरेट हुआ: ${newCode}`
        : `Passcode generated: ${newCode}`
    );
  };

  const copyToClipboard = (code: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Hidden File Input for Gallery / Photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Slide-out Drawer from LEFT side (Width: 320px - 360px on mobile, full height) */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideRight z-10 text-slate-800 dark:text-slate-100 transition-colors">

        {/* ========================================================================= */}
        {/* VIEW 1: MAIN NAVIGATION DRAWER (Image 1 for Owner, Image 2 for Employee) */}
        {/* ========================================================================= */}
        {activeView === 'menu' && (
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Drawer Top Header with Soft Mint Curved Banner */}
              <div className="relative pt-6 pb-5 px-5 bg-gradient-to-b from-[#e8f7ee] to-[#f4fbf6] dark:from-slate-800 dark:to-slate-900 border-b border-emerald-100/60 dark:border-slate-800">
                {/* Close 'X' Button in Top Right */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5 stroke-[2.4]" />
                </button>

                <div className="flex items-center gap-3.5 pr-8">
                  {/* Profile Picture with Camera Icon Overlay */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-emerald-500/70 p-0.5 bg-white dark:bg-slate-800 cursor-pointer group shadow-sm shrink-0"
                    title={curr.changePhoto}
                  >
                    {profile.profilePicUrl ? (
                      <img
                        src={profile.profilePicUrl}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}

                    {/* Camera Badge Overlay */}
                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#008744] text-white flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                      <Camera className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Store Name, Role Badge & Joined Date */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate leading-snug">
                      {profile.storeName}
                    </h3>

                    {/* Role Pill */}
                    <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#008744] dark:text-emerald-300 text-[11px] font-extrabold tracking-tight">
                      {currentRole === 'owner' ? (
                        <>
                          <Crown className="w-3 h-3" />
                          <span>{curr.owner}</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3" />
                          <span>{curr.employeeStaff}</span>
                        </>
                      )}
                    </div>

                    {/* Dynamic Joined Date */}
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      <span>{curr.joined} {profile.joinedDate}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Options List */}
              <div className="py-3 px-4 space-y-2.5">
                {/* 1. Profile */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('profile');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008744] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {curr.profile}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#008744] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. Privacy & Security */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('privacy');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008744] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {curr.privacySecurity}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#008744] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. Preferences */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('preferences');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008744] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Settings className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {curr.preferences}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#008744] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 4. Employee Access (Shop Owner Only - Image 1) */}
                {currentRole === 'owner' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveView('employee-access');
                    }}
                    className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008744] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {curr.employeeAccess}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#008744] group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                {/* 5. Support */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('support');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008744] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Headphones className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {curr.support}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#008744] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            {/* Logout Button at Bottom */}
            <div className="p-5 pt-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  onLogout();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-[#d32f2f] dark:text-red-400 font-extrabold text-sm border border-red-200/80 dark:border-red-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span>{curr.logout}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PROFILE PAGE (Image 3 for Owner, Image 4 for Employee)           */}
        {/* ========================================================================= */}
        {activeView === 'profile' && (
          <div className="flex flex-col h-full justify-between">
            <div className="p-5">
              {/* Header with Back Arrow & Title */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('menu');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {curr.profile}
                </h2>
              </div>

              {/* Profile Avatar with Camera */}
              <div className="flex flex-col items-center my-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-22 h-22 rounded-full border-3 border-emerald-500 p-0.5 bg-white dark:bg-slate-800 cursor-pointer shadow-md group"
                >
                  {profile.profilePicUrl ? (
                    <img
                      src={profile.profilePicUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#008744] text-white flex items-center justify-center border-2 border-white dark:border-slate-800 group-hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Role Pill */}
                <div className="mt-2.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 text-[#008744] dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>{currentRole === 'owner' ? curr.owner : curr.employeeStaff}</span>
                </div>
              </div>

              {/* Form Fields: Owner vs Employee */}
              {currentRole === 'owner' ? (
                /* --- SHOP OWNER PROFILE FIELDS (Image 3) --- */
                <div className="space-y-3.5 mt-2">
                  {/* Section 1: Owner Information */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{curr.ownerName}</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={profile.ownerName}
                        onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                        placeholder={curr.enterOwnerName}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                  </div>

                  {/* Section 2: Store Information */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{curr.storeName}</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={profile.storeName}
                        onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                        placeholder={curr.enterStoreName}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                  </div>

                  {/* Business Type Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{curr.businessType}</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <select
                        value={profile.businessType || 'Retail Shop'}
                        onChange={(e) => setProfile({ ...profile, businessType: e.target.value as any })}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744] appearance-none"
                      >
                        <option value="Retail Shop" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Retail Shop</option>
                        <option value="Shop & Supply" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Shop & Supply</option>
                        <option value="Wholesale" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Wholesale</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{curr.address}</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder={curr.enterStoreAddress}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* --- EMPLOYEE PROFILE FIELDS (Image 4) --- */
                <div className="space-y-3.5 mt-2">
                  {/* Employee No. */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      {curr.employeeNo}
                    </label>
                    <input
                      type="text"
                      value={profile.employeeNo}
                      onChange={(e) => setProfile({ ...profile, employeeNo: e.target.value })}
                      placeholder={curr.enterEmpNo}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>

                  {/* Employee Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      {curr.employeeName}
                    </label>
                    <input
                      type="text"
                      value={profile.employeeName}
                      onChange={(e) => setProfile({ ...profile, employeeName: e.target.value })}
                      placeholder={curr.enterEmpName}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>

                  {/* Store Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      {curr.storeName}
                    </label>
                    <input
                      type="text"
                      value={profile.storeName}
                      onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                      placeholder={curr.enterStoreName}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      {curr.address}
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      placeholder={curr.enterStoreAddress}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Changes Button */}
            <div className="p-5">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-full py-3 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>{saveSuccessMsg || curr.saveChanges}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PRIVACY & SECURITY PAGE (Image 5 for Owner, Image 6 for Employee) */}
        {/* ========================================================================= */}
        {activeView === 'privacy' && (
          <div className="flex flex-col h-full justify-between">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('menu');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {curr.privacySecurity}
                </h2>
              </div>

              {/* Role Badge */}
              <div className="flex justify-center my-3">
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#008744] dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
                  {currentRole === 'owner' ? <Crown className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  <span>{currentRole === 'owner' ? curr.owner : curr.employeeStaff}</span>
                </span>
              </div>

              {/* Privacy Fields */}
              <div className="space-y-3.5 mt-2">
                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.emailAddress}</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder={curr.enterEmail}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.password}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profile.password || ''}
                      onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                      placeholder={curr.enterPassword}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.phoneNumber}</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder={curr.enterPhone}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                  />
                </div>

                {/* Employee Passcode (Employee only - Image 6) */}
                {currentRole === 'employee' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <Grid className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{curr.passcode}</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasscode ? 'text' : 'password'}
                        maxLength={4}
                        value={profile.passcode || ''}
                        onChange={(e) => setProfile({ ...profile, passcode: e.target.value })}
                        placeholder={curr.enterPasscode}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Connected Devices Dropdown / Accordion */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.devices}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDevicesList(!showDevicesList)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-left flex items-center justify-between text-xs font-semibold cursor-pointer"
                  >
                    <span>{curr.manageDevices} ({profile.devices.length} {curr.devicesConnected})</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-300 transition-transform ${showDevicesList ? 'rotate-180' : ''}`} />
                  </button>

                  {showDevicesList && (
                    <div className="mt-2 space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      {profile.devices.map((dev) => (
                        <div key={dev.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-[11px]">
                          <div className="flex items-center gap-2">
                            {dev.type === 'Desktop' ? <Laptop className="w-4 h-4 text-emerald-600" /> : <Smartphone className="w-4 h-4 text-emerald-600" />}
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{dev.name}</p>
                              <p className="text-slate-400 text-[10px]">{dev.lastActive}</p>
                            </div>
                          </div>
                          {dev.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#008744] font-extrabold text-[9px]">
                              {curr.activeNow}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="p-5">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-full py-3 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>{saveSuccessMsg || curr.saveChanges}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: PREFERENCES PAGE (Image 7 for both Owner & Employee)             */}
        {/* ========================================================================= */}
        {activeView === 'preferences' && (
          <div className="flex flex-col h-full justify-between">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('menu');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {curr.preferences}
                </h2>
              </div>

              {/* Preferences Dropdowns */}
              <div className="space-y-4">
                {/* 1. Language Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>{curr.language}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => {
                        soundFx.playClick();
                        const newLang = e.target.value as 'en' | 'bn' | 'hi';
                        setLanguage(newLang);
                        setProfile({ ...profile, language: newLang });
                        userService.saveUserProfile({ language: newLang });
                        speak(
                          newLang === 'bn'
                            ? 'আপনি বাংলা ভাষা নির্বাচন করেছেন।'
                            : newLang === 'hi'
                            ? 'आपने हिंदी भाषा चुनी है।'
                            : 'You selected English language.'
                        );
                      }}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#008744] appearance-none"
                    >
                      <option value="en" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">English</option>
                      <option value="bn" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">বাংলা</option>
                      <option value="hi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">हिन्दी</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Theme Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    <span>{curr.theme}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={profile.theme}
                      onChange={(e) => {
                        soundFx.playClick();
                        const newTheme = e.target.value as 'default' | 'dark';
                        setProfile({ ...profile, theme: newTheme });
                        userService.saveUserProfile({ theme: newTheme });
                        if (newTheme === 'dark') {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#008744] appearance-none"
                    >
                      <option value="default" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{curr.defaultTheme}</option>
                      <option value="dark" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{curr.darkMode}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Notification Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span>{curr.notification}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={profile.notifications}
                      onChange={(e) => {
                        soundFx.playClick();
                        const newNotif = e.target.value as 'on' | 'off';
                        setProfile({ ...profile, notifications: newNotif });
                        userService.saveUserProfile({ notifications: newNotif });
                      }}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#008744] appearance-none"
                    >
                      <option value="on" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{curr.on}</option>
                      <option value="off" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{curr.off}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="p-5">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-full py-3 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>{saveSuccessMsg || curr.saveChanges}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: EMPLOYEE ACCESS PAGE (Image 8 - Shop Owner Only with GENERATE)     */}
        {/* ========================================================================= */}
        {activeView === 'employee-access' && (
          <div className="flex flex-col h-full justify-between">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('menu');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {curr.employeeAccess}
                </h2>
              </div>

              {/* Input Fields */}
              <div className="space-y-3.5 mt-2">
                {/* Employee No. */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.employeeNo}</span>
                  </label>
                  <input
                    type="text"
                    value={empNoInput}
                    onChange={(e) => setEmpNoInput(e.target.value)}
                    placeholder={curr.enterEmpNo}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                  />
                </div>

                {/* Employee Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.employeeName}</span>
                  </label>
                  <input
                    type="text"
                    value={empNameInput}
                    onChange={(e) => setEmpNameInput(e.target.value)}
                    placeholder={curr.enterEmpName}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
                  />
                </div>

                {/* Passcode (4-digit, generated upon clicking Generate) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{curr.passcode}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={generatedPasscode}
                      readOnly
                      placeholder={curr.enterPasscode}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-bold tracking-widest focus:outline-none"
                    />
                    {generatedPasscode && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedPasscode)}
                        className="absolute right-3 top-2.5 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        title={curr.copyPasscode}
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* GENERATE BUTTON (Replaces Save Changes per Requirement 2.H) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGeneratePasscode}
                    className="w-full py-3 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{curr.generate}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: SUPPORT PAGE (Image 9 for both Owner & Employee)                 */}
        {/* ========================================================================= */}
        {activeView === 'support' && (
          <div className="flex flex-col h-full justify-between">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('menu');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {curr.support}
                </h2>
              </div>

              {/* Big Agent Headset Illustration matching Image 9 */}
              <div className="flex flex-col items-center my-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#008744] dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <Headphones className="w-10 h-10 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 font-black text-base text-slate-900 dark:text-white">
                  {curr.helpSupport}
                </h3>
              </div>

              {/* Help & Guides Card (Image 9) */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008744] dark:text-emerald-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {curr.helpGuides}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {curr.learnApp}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5 flex-wrap">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>24x7 Helpline: <a href="tel:+918637394700" className="hover:underline text-emerald-700 dark:text-emerald-400 font-bold">+91 8637394700</a> / <a href="tel:+917478827279" className="hover:underline text-emerald-700 dark:text-emerald-400 font-bold">+91 7478827279</a></span>
                  </p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>support@sgrocery.app</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="p-5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveView('menu');
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-black text-sm transition-all cursor-pointer"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
