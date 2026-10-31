import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData, DashboardMetrics } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Calendar,
  ShoppingCart,
  Wallet,
  Clock,
  Home,
  ShoppingBag,
  PieChart,
  LayoutGrid,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Database,
  ArrowUpRight,
  ArrowDown,
  CheckCircle2,
  Layers,
  TrendingUp,
  PackageCheck,
  AlertCircle
} from 'lucide-react';

interface OwnerDashboardProps {
  data: OwnerSetupData;
  onReset: () => void;
  initialMetrics?: Partial<DashboardMetrics>;
}

// Crisp Vector Storefront Graphic matching the reference design
const StorefrontLogo: React.FC<{ className?: string }> = ({ className = "w-7 h-7 sm:w-8 sm:h-8" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Foundation & Base */}
    <rect x="6" y="52" width="52" height="6" rx="2" fill="#cbd5e1" />
    <rect x="10" y="55" width="44" height="3" rx="1" fill="#94a3b8" />

    {/* Storefront Wall */}
    <rect x="9" y="22" width="46" height="31" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1.5" />

    {/* Green Plants on Side */}
    <circle cx="8" cy="45" r="4.5" fill="#10b981" />
    <circle cx="56" cy="45" r="4.5" fill="#10b981" />
    <circle cx="9" cy="40" r="3" fill="#059669" />
    <circle cx="55" cy="40" r="3" fill="#059669" />

    {/* Display Window */}
    <rect x="13" y="29" width="16" height="19" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
    <line x1="13" y1="38" x2="29" y2="38" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    <circle cx="17" cy="34" r="2" fill="#ef4444" />
    <circle cx="25" cy="34" r="2" fill="#f97316" />
    <circle cx="21" cy="44" r="2.2" fill="#10b981" />

    {/* Store Door */}
    <rect x="33" y="27" width="18" height="25" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" />
    <rect x="36" y="30" width="12" height="10" rx="1.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
    <circle cx="47" cy="41" r="1.5" fill="#b45309" />

    {/* Striped Canopy Awning */}
    <path
      d="M5 15 L11 24 L17 15 L23 24 L29 15 L35 24 L41 15 L47 24 L53 15 L59 23 L61 19 L57 11 H7 L3 19 Z"
      fill="#ef4444"
    />
    <path
      d="M11 15 L17 24 L23 15 M29 15 L35 24 L41 15 M47 15 L53 24 L57 16"
      stroke="#ffffff"
      strokeWidth="5"
      strokeLinecap="butt"
    />
    {/* Scalloped Awning Fringe */}
    <path
      d="M5 23 Q8 26 11 23 Q14 26 17 23 Q20 26 23 23 Q26 26 29 23 Q32 26 35 23 Q38 26 41 23 Q44 26 47 23 Q50 26 53 23 Q56 26 59 23"
      fill="none"
      stroke="#b91c1c"
      strokeWidth="1.8"
    />

    {/* Signboard Header */}
    <rect x="8" y="8" width="48" height="6" rx="2" fill="#b91c1c" />
    <rect x="12" y="10" width="40" height="2" rx="1" fill="#fecaca" opacity="0.8" />
  </svg>
);

// Default Zero Balances & Quantities:
// Strictly initialized to 0 for Profit/Loss, Sales, Purchases, Expenses, and all inventory/stock counts
const defaultZeroMetrics: DashboardMetrics = {
  todaySales: 0,
  todayPurchases: 0,
  todayExpenses: 0,
  todayProfitLoss: 0,
  salesGrowth: 0,
  purchasesGrowth: 0,
  expensesGrowth: 0,
  profitLossGrowth: 0,
  outOfStockCount: 0,
  lowStockCount: 0,
  expiringCount: 0,
  hourlySales: [
    { time: '6 AM', amount: 0 },
    { time: '9 AM', amount: 0 },
    { time: '12 PM', amount: 0 },
    { time: '3 PM', amount: 0 },
    { time: '6 PM', amount: 0 },
    { time: '9 PM', amount: 0 },
  ],
};

// Reference data for developer preview when testing backend data feeding
const backendSampleMetrics: DashboardMetrics = {
  todaySales: 12450,
  todayPurchases: 6200,
  todayExpenses: 1200,
  todayProfitLoss: 3150,
  salesGrowth: 18,
  purchasesGrowth: 12,
  expensesGrowth: 5,
  profitLossGrowth: 28,
  outOfStockCount: 3,
  lowStockCount: 8,
  expiringCount: 5,
  hourlySales: [
    { time: '6 AM', amount: 150 },
    { time: '9 AM', amount: 1100 },
    { time: '12 PM', amount: 1650 },
    { time: '3 PM', amount: 2150 },
    { time: '6 PM', amount: 2150 },
    { time: '9 PM', amount: 3000 },
  ],
};

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  data,
  onReset,
  initialMetrics,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const soundFx = useSoundEffects();
  const { speak } = useVoiceAssistant();

  // Active Tab: 'home' | 'sales' | 'reports' | 'more'
  const [activeTab, setActiveTab] = useState<'home' | 'sales' | 'reports' | 'more'>('home');

  // Metrics State: initialized with all 0 values by default as instructed
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ...defaultZeroMetrics,
    ...initialMetrics,
  });

  // Developer Backend Preview Mode toggle (allows switching between 0-state and live sample values)
  const [isDemoDataActive, setIsDemoDataActive] = useState<boolean>(false);

  // Modals & Drawers
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttentionItem, setSelectedAttentionItem] = useState<'out_of_stock' | 'low_stock' | 'expiring_soon' | null>(null);

  // Dynamic Current Date calculation: Uses real current calendar date
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [currentGreeting, setCurrentGreeting] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now.getDate();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const weekdayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ];

      const month = monthNames[now.getMonth()];
      const weekday = weekdayNames[now.getDay()];
      const year = now.getFullYear();

      setCurrentDateFormatted(`${day} ${month} ${year}, ${weekday}`);

      // Time-of-day greeting
      const hour = now.getHours();
      let greetingPrefix = 'Good Morning';
      if (hour >= 12 && hour < 17) greetingPrefix = 'Good Afternoon';
      else if (hour >= 17) greetingPrefix = 'Good Evening';

      const ownerFirstName = data.ownerName ? data.ownerName.trim().split(' ')[0] : 'Rina';
      setCurrentGreeting(`${greetingPrefix}, ${ownerFirstName} 👋`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, [data.ownerName]);

  // Toggle backend test simulation
  const handleToggleBackendSimulation = () => {
    soundFx.playClick();
    if (isDemoDataActive) {
      setMetrics(defaultZeroMetrics);
      setIsDemoDataActive(false);
      speak('Default zero balances and quantities loaded.');
    } else {
      setMetrics(backendSampleMetrics);
      setIsDemoDataActive(true);
      speak('Sample backend values loaded.');
    }
  };

  const storeName = data.shopName || 'Maa Laxmi Store';
  const ownerInitial = (data.ownerName?.[0] || 'R').toUpperCase();

  // Notification count: based on total attention items (or 0 when backend data is 0)
  const notificationCount = metrics.outOfStockCount + metrics.lowStockCount + metrics.expiringCount;

  return (
    <div className="w-full min-h-screen bg-[#f8faf9] text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">

      {/* ==================== 1. FULL-SCREEN TOP APP BAR ==================== */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Left: Hamburger Menu + Storefront Graphic + Store Name + Dropdown Chevron */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowMenuDrawer(true);
              }}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
              title="Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            <div
              onClick={() => {
                soundFx.playClick();
                setShowMenuDrawer(true);
              }}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <StorefrontLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#111827] tracking-tight leading-none">
                  {storeName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-600 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Visible on Laptop & Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'sales', label: 'Sales POS', icon: ShoppingBag },
              { id: 'reports', label: 'Reports', icon: PieChart },
              { id: 'more', label: 'Management', icon: LayoutGrid },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ebf7ee] text-[#008744] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Search + Notifications Bell (with Badge) + User Avatar "R" */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowSearchModal(true);
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowNotifications(true);
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-800 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff3b30] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {notificationCount}
              </span>
            </button>

            {/* Owner Green Avatar Badge */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowMenuDrawer(true);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#008744] text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
              title={data.ownerName || 'Rina'}
            >
              {ownerInitial}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. RESPONSIVE FULL-SCREEN MAIN BODY ==================== */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-24 md:pb-10">

        {/* GREETING CARD (Dynamic Time-based Greeting & Dynamic Current Date) */}
        <section className="w-full bg-[#ebf7ee] border border-emerald-100/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] tracking-tight">
                {currentGreeting}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600 font-medium">
                <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>

            {/* Backend Data Indicator */}
            <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-200/60 text-xs font-semibold text-[#008744] shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isDemoDataActive ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isDemoDataActive ? 'Preview Backend Sample' : 'Default Zero Balances'}</span>
            </div>
          </div>
        </section>

        {/* 4 MAIN STAT CARDS (Responsive: 1-col on mobile, 2-col on tablet, 4-col across on desktop/laptop) */}
        <section className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

            {/* Card 1: Today's Sales */}
            <div className="bg-[#edf8f1] border border-[#dcf2e4] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#00c569] text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#4b5563] leading-snug">
                      Today's Sales
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
                      ₹{metrics.todaySales.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Circular Trend Sparkline */}
                <div className="w-10 h-10 rounded-full bg-[#daf5e3] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 28 20" className="w-5 h-4">
                    <path
                      d="M2 17 L8 11 L14 14 L23 4"
                      fill="none"
                      stroke="#00c569"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="17 4 23 4 23 10"
                      fill="none"
                      stroke="#00c569"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs pt-3 mt-3 border-t border-emerald-950/5">
                <span className="font-bold text-[#00c569] flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  {metrics.salesGrowth}%
                </span>
                <span className="text-[#6b7280]">from yesterday</span>
              </div>
            </div>

            {/* Card 2: Today's Purchases */}
            <div className="bg-[#eef6fe] border border-[#d8eafc] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0084ff] text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#4b5563] leading-snug">
                      Today's Purchases
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
                      ₹{metrics.todayPurchases.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Circular Trend Sparkline */}
                <div className="w-10 h-10 rounded-full bg-[#dff0ff] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 28 20" className="w-5 h-4">
                    <path
                      d="M2 17 L8 11 L14 14 L23 4"
                      fill="none"
                      stroke="#0084ff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="17 4 23 4 23 10"
                      fill="none"
                      stroke="#0084ff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs pt-3 mt-3 border-t border-blue-950/5">
                <span className="font-bold text-[#0084ff] flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  {metrics.purchasesGrowth}%
                </span>
                <span className="text-[#6b7280]">from yesterday</span>
              </div>
            </div>

            {/* Card 3: Today's Expenses */}
            <div className="bg-[#fff6ec] border border-[#fde8d4] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#ff8000] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Wallet className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#4b5563] leading-snug">
                      Today's Expenses
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
                      ₹{metrics.todayExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Circular Trend Sparkline */}
                <div className="w-10 h-10 rounded-full bg-[#ffeed9] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 28 20" className="w-5 h-4">
                    <path
                      d="M2 13 L7 17 L13 9 L19 14 L25 5"
                      fill="none"
                      stroke="#ff8000"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs pt-3 mt-3 border-t border-amber-950/5">
                <span className="font-bold text-[#ff8000] flex items-center">
                  <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  {metrics.expensesGrowth}%
                </span>
                <span className="text-[#6b7280]">from yesterday</span>
              </div>
            </div>

            {/* Card 4: Today's Profit/Loss (Default 0 as instructed) */}
            <div className="bg-[#f8f2fe] border border-[#ecdcff] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#8a2be2] text-white flex items-center justify-center shadow-xs shrink-0">
                    {/* 3 Bar Chart Icon */}
                    <div className="flex items-end gap-1 h-5">
                      <span className="w-1.5 bg-white rounded-xs h-2.5"></span>
                      <span className="w-1.5 bg-white rounded-xs h-5"></span>
                      <span className="w-1.5 bg-white rounded-xs h-3.5"></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#4b5563] leading-snug">
                      Today's Profit/Loss
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
                      ₹{metrics.todayProfitLoss.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Circular Trend Sparkline */}
                <div className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 28 20" className="w-5 h-4">
                    <path
                      d="M2 16 L8 12 L13 15 L18 8 L24 10"
                      fill="none"
                      stroke="#8a2be2"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs pt-3 mt-3 border-t border-purple-950/5">
                <span className="font-bold text-[#8a2be2] flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  {metrics.profitLossGrowth}%
                </span>
                <span className="text-[#6b7280]">from yesterday</span>
              </div>
            </div>

          </div>
        </section>

        {/* ==================== 3. SPLIT SECTION ON DESKTOP: CHART (LEFT) & ATTENTION (RIGHT) ==================== */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

          {/* LEFT: DAILY SALES OVERVIEW (CHART) - Occupies 7 columns on Desktop */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                  Daily Sales Overview
                </h2>
                <p className="text-xs text-[#6b7280] font-normal mt-0.5">
                  Real-time Hourly Performance
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('reports');
                }}
                className="text-xs sm:text-sm font-semibold text-[#1877f2] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Report</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Total Sales Value */}
            <div className="mt-3 mb-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                ₹{metrics.todaySales.toLocaleString()}
              </p>
              <p className="text-xs text-[#6b7280] font-normal mt-0.5">
                Total Sales Today
              </p>
            </div>

            {/* Responsive Line Chart SVG */}
            <div className="w-full pt-2">
              <svg viewBox="0 0 500 150" className="w-full h-44 sm:h-52 overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="fullSalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c569" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00c569" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Guidelines & Labels */}
                {/* ₹3K */}
                <text x="0" y="16" fill="#9ca3af" fontSize="11" fontWeight="600">₹3K</text>
                <line x1="38" y1="12" x2="495" y2="12" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1.2" />

                {/* ₹2K */}
                <text x="0" y="52" fill="#9ca3af" fontSize="11" fontWeight="600">₹2K</text>
                <line x1="38" y1="48" x2="495" y2="48" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1.2" />

                {/* ₹1K */}
                <text x="0" y="88" fill="#9ca3af" fontSize="11" fontWeight="600">₹1K</text>
                <line x1="38" y1="84" x2="495" y2="84" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1.2" />

                {/* ₹0 */}
                <text x="8" y="124" fill="#9ca3af" fontSize="11" fontWeight="600">₹0</text>
                <line x1="38" y1="120" x2="495" y2="120" stroke="#f1f5f9" strokeWidth="1.2" />

                {/* Chart Spline Line & Area */}
                {metrics.todaySales > 0 ? (
                  <>
                    <path
                      d="M 50 120 C 95 116, 120 102, 140 94 C 170 82, 195 78, 220 72 C 240 82, 255 86, 270 78 C 290 64, 305 50, 325 50 C 355 50, 385 50, 415 50 C 445 38, 470 22, 495 12 L 495 120 L 50 120 Z"
                      fill="url(#fullSalesGradient)"
                    />
                    <path
                      d="M 50 120 C 95 116, 120 102, 140 94 C 170 82, 195 78, 220 72 C 240 82, 255 86, 270 78 C 290 64, 305 50, 325 50 C 355 50, 385 50, 415 50 C 445 38, 470 22, 495 12"
                      fill="none"
                      stroke="#00c569"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[
                      { cx: 50, cy: 120 },
                      { cx: 140, cy: 94 },
                      { cx: 220, cy: 72 },
                      { cx: 270, cy: 78 },
                      { cx: 325, cy: 50 },
                      { cx: 415, cy: 50 },
                      { cx: 495, cy: 12 },
                    ].map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.cx}
                        cy={pt.cy}
                        r="4"
                        fill="#00c569"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all hover:scale-125"
                      />
                    ))}
                  </>
                ) : (
                  // Default 0-balance horizontal baseline
                  <>
                    <line x1="50" y1="120" x2="495" y2="120" stroke="#00c569" strokeWidth="3" />
                    {[50, 140, 228, 318, 406, 495].map((cx, i) => (
                      <circle key={i} cx={cx} cy="120" r="3.5" fill="#00c569" stroke="#ffffff" strokeWidth="2.5" />
                    ))}
                  </>
                )}
              </svg>

              {/* X-Axis Time Markers */}
              <div className="flex justify-between items-center text-xs text-[#6b7280] font-medium pt-2 pl-9 pr-1">
                <span>6 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
                <span>9 PM</span>
              </div>
            </div>
          </div>

          {/* RIGHT: NEEDS YOUR ATTENTION - Occupies 5 columns on Desktop */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                  Needs Your Attention
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Live Stock Status
                </span>
              </div>

              {/* 3 Attention Items matching the reference image */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {/* Item 1: Out of Stock */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAttentionItem('out_of_stock');
                  }}
                  role="button"
                  tabIndex={0}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ff4d4f] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      <X className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#374151]">
                      {metrics.outOfStockCount} products are out of stock
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Item 2: Low Stock */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAttentionItem('low_stock');
                  }}
                  role="button"
                  tabIndex={0}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#faad14] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      <span className="text-base font-extrabold leading-none pb-0.5">!</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#374151]">
                      {metrics.lowStockCount} products are low in stock
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Item 3: Expiring Soon */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAttentionItem('expiring_soon');
                  }}
                  role="button"
                  tabIndex={0}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1890ff] text-white flex items-center justify-center text-sm shrink-0 shadow-xs">
                      <Clock className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#374151]">
                      {metrics.expiringCount} products are expiring soon
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Quick Developer / Backend Note inside Attention card */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend API: Ready for integration</span>
              </span>
              <button
                type="button"
                onClick={handleToggleBackendSimulation}
                className="text-xs font-bold text-[#008744] hover:underline cursor-pointer"
              >
                {isDemoDataActive ? 'Reset to 0' : 'Simulate Data'}
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ==================== 4. BOTTOM NAVIGATION BAR (STICKY ON MOBILE / TOUCH) ==================== */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/80 py-2 px-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Tab 1: Home (Active) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('home');
            }}
            className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer group"
          >
            <div className="text-[#008744]">
              <Home className="w-5 h-5 fill-[#008744]" />
            </div>
            <span className="text-xs font-bold text-[#008744]">
              Home
            </span>
          </button>

          {/* Tab 2: Sales */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('sales');
            }}
            className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer group"
          >
            <div className="text-[#6b7280] group-hover:text-[#111827] transition-colors">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-[#6b7280] group-hover:text-[#111827] transition-colors">
              Sales
            </span>
          </button>

          {/* Tab 3: Reports */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('reports');
            }}
            className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer group"
          >
            <div className="text-[#6b7280] group-hover:text-[#111827] transition-colors">
              <PieChart className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-[#6b7280] group-hover:text-[#111827] transition-colors">
              Reports
            </span>
          </button>

          {/* Tab 4: More */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('more');
            }}
            className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer group"
          >
            <div className="text-[#6b7280] group-hover:text-[#111827] transition-colors">
              <LayoutGrid className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-[#6b7280] group-hover:text-[#111827] transition-colors">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ==================== 5. SLIDE-OUT MENU DRAWER ==================== */}
      {showMenuDrawer && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMenuDrawer(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-right overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <StorefrontLogo className="w-9 h-9" />
                  <div>
                    <h3 className="font-extrabold text-base text-[#111827] leading-tight">
                      {storeName}
                    </h3>
                    <p className="text-xs text-[#008744] font-bold">
                      ● Active Storefront
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Store & Owner Details */}
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <p><strong>Owner:</strong> {data.ownerName || 'Rina'}</p>
                <p><strong>Business Type:</strong> {data.businessType || 'Small Shop'}</p>
                <p><strong>Contact:</strong> {data.email || data.phone || 'store@grocery.com'}</p>
                <p><strong>Daily PIN:</strong> {data.quickPin ? '••••' : 'Configured'}</p>
              </div>

              {/* Developer Backend Integration Mode */}
              <div className="p-4 rounded-2xl bg-[#edf8f1] border border-[#d2eed9] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f4b30]">
                    <Database className="w-4 h-4 text-[#00c569]" />
                    <span>Backend Data Mode</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isDemoDataActive ? 'bg-[#00c569] text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isDemoDataActive ? 'Simulated Data' : 'Default 0 (Live)'}
                  </span>
                </div>
                <p className="text-xs text-[#486354] leading-relaxed">
                  Profit & Loss balances and stock counts remain 0 by default. Once backend is connected, simply pass the metrics state from your API.
                </p>
                <button
                  type="button"
                  onClick={handleToggleBackendSimulation}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#0f4b30] border border-[#bfe4ca] text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{isDemoDataActive ? 'Reset to Default 0 Values' : 'Preview with Backend Values'}</span>
                </button>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">App Language (ভাষা)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'bn', label: 'বাংলা' },
                    { id: 'hi', label: 'हिंदी' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setLanguage(lang.id as any);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        language === lang.id
                          ? 'bg-[#008744] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Switch Store / Logout Button */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowMenuDrawer(false);
                  onReset();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Switch Store / Reset Setup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. NOTIFICATIONS POPOVER ==================== */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#ff3b30]" />
                <h3 className="font-bold text-base text-[#111827]">
                  Store Notifications ({notificationCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {metrics.outOfStockCount > 0 ? (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-900 font-medium">
                  ⚠️ <strong>{metrics.outOfStockCount} products out of stock:</strong> Requires immediate reorder.
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No products currently out of stock.</span>
                </div>
              )}

              {metrics.lowStockCount > 0 ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-900 font-medium">
                  ⚡ <strong>{metrics.lowStockCount} products low in stock:</strong> Check inventory levels.
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inventory levels are sufficient.</span>
                </div>
              )}

              {metrics.expiringCount > 0 ? (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 font-medium">
                  🕒 <strong>{metrics.expiringCount} products expiring soon:</strong> Consider clearance discounts.
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No products expiring in the near term.</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="w-full py-2.5 rounded-xl bg-[#008744] hover:bg-[#06723b] text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==================== 7. SEARCH MODAL ==================== */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#111827]">Search Products & Invoices</h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, barcode, or invoice ID..."
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#008744]"
                autoFocus
              />
            </div>

            <div className="text-xs text-slate-500 text-center py-6">
              {searchQuery ? `Searching for "${searchQuery}" in inventory...` : 'Type any item name or scan barcode to view inventory details.'}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 8. ATTENTION ITEM DETAIL MODAL ==================== */}
      {selectedAttentionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#111827]">
                {selectedAttentionItem === 'out_of_stock' && 'Out of Stock Products'}
                {selectedAttentionItem === 'low_stock' && 'Low Stock Inventory'}
                {selectedAttentionItem === 'expiring_soon' && 'Expiring Soon Alert'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAttentionItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {selectedAttentionItem === 'out_of_stock' && (
                metrics.outOfStockCount > 0 ? (
                  <>
                    <div className="flex justify-between p-2.5 rounded-xl bg-red-50 text-red-900 font-semibold">
                      <span>🌾 Miniket Rice 5kg</span>
                      <span className="font-bold">0 units</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-red-50 text-red-900 font-semibold">
                      <span>🛢️ Fresh Sunflower Oil 1L</span>
                      <span className="font-bold">0 units</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-red-50 text-red-900 font-semibold">
                      <span>🧂 Pure Crystal Sugar 1kg</span>
                      <span className="font-bold">0 units</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No products currently out of stock. (Backend default: 0)
                  </div>
                )
              )}

              {selectedAttentionItem === 'low_stock' && (
                metrics.lowStockCount > 0 ? (
                  <>
                    <div className="flex justify-between p-2.5 rounded-xl bg-amber-50 text-amber-900 font-semibold">
                      <span>🍪 Parle-G Biscuit 500g</span>
                      <span className="font-bold">2 packs left</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-amber-50 text-amber-900 font-semibold">
                      <span>🥚 Farm Eggs (12 Pack)</span>
                      <span className="font-bold">3 crates left</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No low stock items. All inventory levels healthy. (Backend default: 0)
                  </div>
                )
              )}

              {selectedAttentionItem === 'expiring_soon' && (
                metrics.expiringCount > 0 ? (
                  <>
                    <div className="flex justify-between p-2.5 rounded-xl bg-blue-50 text-blue-900 font-semibold">
                      <span>🍞 Whole Wheat Bread 400g</span>
                      <span className="font-bold">Expires in 2 days</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-blue-50 text-blue-900 font-semibold">
                      <span>🥣 Fresh Curd / Dahi 200g</span>
                      <span className="font-bold">Expires in 3 days</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No products expiring soon. (Backend default: 0)
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedAttentionItem(null)}
              className="w-full py-2.5 rounded-xl bg-[#008744] hover:bg-[#06723b] text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
