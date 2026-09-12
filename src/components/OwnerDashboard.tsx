import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData } from '../types';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  LayoutDashboard,
  ShoppingBag,
  BarChart2,
  MoreHorizontal,
  Mic,
  Bell,
  ChevronRight,
  Plus,
  Users,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Wallet,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Filter
} from 'lucide-react';

interface OwnerDashboardProps {
  data: OwnerSetupData;
  onReset: () => void;
}

// Tiny SVG Sparkline
const Sparkline: React.FC<{ points: string; color: string }> = ({ points, color }) => (
  <svg viewBox="0 0 80 30" className="w-20 h-7" preserveAspectRatio="none">
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  sparkPoints: string;
  sparkColor: string;
  isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  positive,
  icon,
  iconBg,
  sparkPoints,
  sparkColor,
  isDark,
}) => (
  <div
    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
      isDark
        ? 'bg-slate-800/80 border-slate-700/60 hover:border-emerald-500/40'
        : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-emerald-500/5'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-xs`}>
        {icon}
      </div>
      <Sparkline points={sparkPoints} color={sparkColor} />
    </div>

    <div>
      <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>

    <div className="mt-2.5 pt-2 border-t border-slate-100/60 flex items-center justify-between">
      <div
        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          positive
            ? isDark
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
            : isDark
            ? 'bg-red-500/15 text-red-400'
            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
        }`}
      >
        {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        <span>{change}</span>
      </div>
      <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        vs yesterday
      </span>
    </div>
  </div>
);

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ data, onReset }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'sales' | 'reports' | 'more'>('home');
  const [micActive, setMicActive] = useState(false);
  // Default to white theme as requested by user
  const [isDark, setIsDark] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (language === 'bn') {
      if (hour < 12) return 'শুভ সকাল';
      if (hour < 17) return 'শুভ দুপুর';
      return 'শুভ সন্ধ্যা';
    }
    if (language === 'hi') {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 17) return 'शुभ दोपहर';
      return 'शुभ संध्या';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  const bestSelling = [
    { name: 'Miniket Rice 5kg', nameBn: 'মিনিকেট চাল ৫ কেজি', sold: 24, img: '🌾', price: '৳340' },
    { name: 'Fresh Sunflower Oil', nameBn: 'সূর্যমুখী তেল ১লি', sold: 18, img: '🛢️', price: '৳195' },
    { name: 'Parle-G Biscuit Pack', nameBn: 'পার্লে-জি বিস্কুট প্যাক', sold: 15, img: '🍪', price: '৳45' },
    { name: 'Farm Fresh Eggs (12)', nameBn: 'ফার্মের ডিম (১২ পিস)', sold: 12, img: '🥚', price: '৳155' },
  ];

  const alerts = [
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      text: '৮টি পণ্যের স্টক কমে এসেছে (Low Stock)',
      textEn: '8 products are low in stock',
      action: 'Reorder',
      badgeClass: isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50/90 border-amber-200 text-amber-900',
    },
    {
      icon: <XCircle className="w-4 h-4 text-rose-600" />,
      text: '৩টি পণ্য স্টক শেষ (Out of Stock)',
      textEn: '3 products are out of stock',
      action: 'Add Now',
      badgeClass: isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-rose-50/90 border-rose-200 text-rose-900',
    },
    {
      icon: <Clock className="w-4 h-4 text-sky-600" />,
      text: '৫টি পণ্যের মেয়াদ দ্রুত শেষ হতে যাচ্ছে (Expiring Soon)',
      textEn: '5 products are expiring soon',
      action: 'Discount',
      badgeClass: isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-sky-50/90 border-sky-200 text-sky-900',
    },
  ];

  const quickActions = [
    {
      icon: <ShoppingCart className="w-5 h-5 text-emerald-700" />,
      label: 'নতুন বিক্রয় (Sale)',
      labelEn: 'New Sale',
      bgLight: 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-950 border-emerald-200/80',
      bgDark: 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30',
      iconBox: 'bg-emerald-500 text-slate-950',
    },
    {
      icon: <Plus className="w-5 h-5 text-blue-700" />,
      label: 'স্টক যোগ করুন',
      labelEn: 'Add Stock',
      bgLight: 'bg-blue-50/80 hover:bg-blue-100/90 text-blue-950 border-blue-200/80',
      bgDark: 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border-blue-500/30',
      iconBox: 'bg-blue-500 text-white',
    },
    {
      icon: <Boxes className="w-5 h-5 text-amber-700" />,
      label: 'পণ্য তালিকা',
      labelEn: 'Products',
      bgLight: 'bg-amber-50/80 hover:bg-amber-100/90 text-amber-950 border-amber-200/80',
      bgDark: 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-500/30',
      iconBox: 'bg-amber-500 text-slate-950',
    },
    {
      icon: <Users className="w-5 h-5 text-purple-700" />,
      label: 'কাস্টমার খাতা',
      labelEn: 'Customers',
      bgLight: 'bg-purple-50/80 hover:bg-purple-100/90 text-purple-950 border-purple-200/80',
      bgDark: 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border-purple-500/30',
      iconBox: 'bg-purple-500 text-white',
    },
  ];

  return (
    <div
      className={`w-full min-h-screen flex flex-col transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background Ambient Glows */}
      {!isDark && (
        <>
          <div className="fixed -top-32 -left-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed top-1/2 -right-32 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* TOP HEADER */}
      <header
        className={`sticky top-0 z-30 px-4 py-3.5 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80'
            : 'bg-white/90 border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`text-base font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {data.shopName || 'সততা মুদি ভান্ডার'}
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active POS
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>মালিক: {data.ownerName || 'রহিম মিয়া'}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">GROC-8821</span>
              </p>
            </div>
          </div>

          {/* Right Header Controls: Theme Toggle + Notifications + Avatar */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70 shadow-xs'
              }`}
              title={isDark ? 'Switch to White Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notifications */}
            <button
              className={`relative p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200/70 text-slate-600 shadow-xs'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Avatar Pill */}
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-sm font-black shadow-sm">
              {(data.ownerName?.[0] || 'O').toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* SCROLLABLE DASHBOARD BODY */}
      <main className="flex-1 max-w-4xl w-full mx-auto pb-28 px-3.5 sm:px-6 pt-4 sm:pt-6 space-y-6">

        {/* HERO GREETING BANNER */}
        <div
          className={`relative rounded-3xl overflow-hidden p-5 sm:p-7 transition-all ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border border-slate-700/60 text-white shadow-xl'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/20'
          }`}
        >
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>দৈনিক সারসংক্ষেপ (Store Summary)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {greeting()}, {data.ownerName?.split(' ')[0] || 'মালিক'} 👋
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100 max-w-md font-medium">
                আজকের দোকানে বিক্রি ও স্টকের সার্বিক তথ্য নিচে দেখুন।
              </p>

              <div className="inline-flex items-center gap-1.5 pt-1 text-xs text-emerald-100/90 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{today}</span>
              </div>
            </div>

            {/* 3D Store Icon */}
            <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg text-4xl">
              <span>🏪</span>
              <span className="text-[10px] font-extrabold text-white mt-1">OPEN NOW</span>
            </div>
          </div>
        </div>

        {/* 4 MAIN STAT CARDS (2x2) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className={`text-sm font-extrabold tracking-wide uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              আজকের আয় ও ব্যয় (Financial Overview)
            </h3>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              রিয়েল-টাইম হিসেব
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="আজকের বিক্রি (Sales)"
              value="৳১২,৪৫০"
              change="↑ ১৮%"
              positive={true}
              icon={<ShoppingBag className="w-5 h-5 text-emerald-600" />}
              iconBg={isDark ? 'bg-emerald-500/20' : 'bg-emerald-100 text-emerald-700'}
              sparkPoints="0,25 10,20 20,22 30,14 40,16 50,10 60,7 70,5 80,2"
              sparkColor="#059669"
              isDark={isDark}
            />

            <StatCard
              label="আজকের ক্রয় (Purchase)"
              value="৳৬,২০০"
              change="↑ ১২%"
              positive={true}
              icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
              iconBg={isDark ? 'bg-blue-500/20' : 'bg-blue-100 text-blue-700'}
              sparkPoints="0,28 10,22 20,24 30,18 40,20 50,15 60,12 70,9 80,6"
              sparkColor="#2563eb"
              isDark={isDark}
            />

            <StatCard
              label="আজকের খরচ (Expense)"
              value="৳১,২০০"
              change="↓ ৫%"
              positive={false}
              icon={<Wallet className="w-5 h-5 text-amber-600" />}
              iconBg={isDark ? 'bg-amber-500/20' : 'bg-amber-100 text-amber-700'}
              sparkPoints="0,5 10,8 20,6 30,12 40,10 50,15 60,13 70,18 80,20"
              sparkColor="#d97706"
              isDark={isDark}
            />

            <StatCard
              label="আজকের লাভ (Net Profit)"
              value="৳৩,১৫০"
              change="↑ ২৮%"
              positive={true}
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              iconBg={isDark ? 'bg-purple-500/20' : 'bg-purple-100 text-purple-700'}
              sparkPoints="0,25 10,22 20,18 30,15 40,12 50,10 60,7 70,4 80,2"
              sparkColor="#9333ea"
              isDark={isDark}
            />
          </div>
        </div>

        {/* STOCK SUMMARY ROW */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-slate-800/80 border-slate-700/70'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                স্টক সারসংক্ষেপ (Stock Status)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ইনভেন্টরি পণ্য ও সতর্কতা তালিকা
              </p>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
              সব স্টক দেখুন <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                value: '১২৮',
                label: 'মোট পণ্য (Total)',
                icon: <Package className="w-5 h-5 text-emerald-600" />,
                bg: isDark ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50/90 border-emerald-200/70 text-emerald-950',
                textVal: isDark ? 'text-white' : 'text-emerald-950',
              },
              {
                value: '৮',
                label: 'কম স্টক (Low Stock)',
                icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                bg: isDark ? 'bg-amber-950/40 border-amber-500/30' : 'bg-amber-50/90 border-amber-200/70 text-amber-950',
                textVal: isDark ? 'text-white' : 'text-amber-950',
              },
              {
                value: '৩',
                label: 'স্টক শেষ (Out)',
                icon: <XCircle className="w-5 h-5 text-rose-600" />,
                bg: isDark ? 'bg-red-950/40 border-red-500/30' : 'bg-rose-50/90 border-rose-200/70 text-rose-950',
                textVal: isDark ? 'text-white' : 'text-rose-950',
              },
              {
                value: '৫',
                label: 'মেয়াদ শেষ (Expiring)',
                icon: <Clock className="w-5 h-5 text-sky-600" />,
                bg: isDark ? 'bg-blue-950/40 border-blue-500/30' : 'bg-sky-50/90 border-sky-200/70 text-sky-950',
                textVal: isDark ? 'text-white' : 'text-sky-950',
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-3.5 flex flex-col items-center text-center gap-1.5 transition-all hover:scale-[1.02] ${s.bg}`}
              >
                <div className="p-2 rounded-xl bg-white/80 shadow-xs">
                  {s.icon}
                </div>
                <p className={`text-xl font-black ${s.textVal}`}>{s.value}</p>
                <p className={`text-[11px] font-semibold leading-tight ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS ROW */}
        <div>
          <h3 className={`text-sm font-extrabold tracking-wide uppercase mb-3 px-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            কুইক একশন (Quick Actions)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md active:scale-95 group ${
                  isDark ? a.bgDark : a.bgLight
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl ${a.iconBox} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <span className="text-xs font-black text-center leading-tight">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* NEEDS ATTENTION ALERTS */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-slate-800/80 border-slate-700/70'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                জরুরি নোটিফিকেশন (Needs Your Attention)
              </h3>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              সব দেখুন
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.map((a) => (
              <div
                key={a.text}
                className={`flex items-center justify-between rounded-2xl border p-3 sm:px-4 transition-all hover:shadow-xs ${a.badgeClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-xs">
                    {a.icon}
                  </div>
                  <span className="text-xs font-bold leading-tight">
                    {a.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-white/90 text-slate-800 border border-slate-200 shadow-xs hover:bg-white transition-all">
                    {a.action}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHARTS & BEST SELLING SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sales Chart (7 Cols) */}
          <div
            className={`lg:col-span-7 p-4 sm:p-5 rounded-3xl border transition-all ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/70'
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  আজকের বিক্রি প্রবণতা (Hourly Sales)
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  প্রতি ঘণ্টার বিক্রয় গ্রাফ
                </p>
              </div>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>রিপোর্ট</span>
              </button>
            </div>

            <div className="my-3">
              <span className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ৳১২,৪৫০
              </span>
              <span className="text-xs font-bold text-emerald-600 ml-2 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                +১৮% বৃদ্ধি
              </span>
            </div>

            {/* Visual SVG Chart */}
            <div className="w-full pt-2">
              <svg viewBox="0 0 280 90" className="w-full h-24 sm:h-28" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,75 L35,62 L70,68 L105,48 L140,55 L175,35 L210,38 L245,18 L280,10 L280,90 L0,90 Z"
                  fill="url(#salesGradLight)"
                />
                <polyline
                  points="0,75 35,62 70,68 105,48 140,55 175,35 210,38 245,18 280,10"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {[[0, 75], [70, 68], [140, 55], [210, 38], [280, 10]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>
              <div className={`flex justify-between text-[10px] font-bold mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {['সকাল ৮টা', '১০টা', 'দুপুর ১২টা', '২টা', 'বিকাল ৪টা', 'সন্ধ্যা ৬টা', 'রাত ৮টা'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Best Selling Products (5 Cols) */}
          <div
            className={`lg:col-span-5 p-4 sm:p-5 rounded-3xl border transition-all ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/70'
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                সেরা বিক্রিত পণ্য (Best Selling)
              </h3>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                সব দেখুন
              </button>
            </div>

            <div className="space-y-2.5">
              {bestSelling.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all hover:scale-[1.01] ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600'
                      : 'bg-slate-50/90 border-slate-200/80 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xl shrink-0">
                      {item.img}
                    </div>
                    <div>
                      <p className={`text-xs font-bold truncate max-w-[130px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.nameBn}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600">
                        {item.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 font-mono">
                      {item.sold} বিক্রি
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reset / Switch Store Trigger */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onReset}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>দোকান পরিবর্তন / লগআউট (Switch Store)</span>
          </button>
        </div>
      </main>

      {/* FLOATING VOICE MIC BUTTON */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setMicActive((v) => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
            micActive
              ? 'bg-rose-500 shadow-rose-500/40 animate-pulse text-white'
              : 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/30 hover:scale-105'
          }`}
          aria-label="Voice Assistant"
          title="Voice Assistant"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-slate-950/95 border-slate-800/80'
            : 'bg-white/95 border-slate-200/90 shadow-lg'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-around px-3 py-2">
          {[
            { id: 'home', icon: <LayoutDashboard className="w-5 h-5" />, label: 'হোম (Home)' },
            { id: 'sales', icon: <ShoppingCart className="w-5 h-5" />, label: 'বিক্রয় (Sales)' },
            { id: 'reports', icon: <BarChart2 className="w-5 h-5" />, label: 'রিপোর্ট (Reports)' },
            { id: 'more', icon: <MoreHorizontal className="w-5 h-5" />, label: 'অন্যান্য (More)' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-600 font-extrabold'
                    : isDark
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.icon}
                <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'inherit'}`}>
                  {tab.label}
                </span>
                {isActive && <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
