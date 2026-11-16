import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData, DashboardMetrics } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { SalesDashboard } from './SalesDashboard';
import { TodaysSalesDetails } from './TodaysSalesDetails';
import { TodaysPurchaseDetails } from './TodaysPurchaseDetails';
import { TodaysProfitLossDetails } from './TodaysProfitLossDetails';
import { TodaysExpensesDetails } from './TodaysExpensesDetails';
import { ProductAlertsDetails, ProductAlertTab } from './ProductAlertsDetails';
import { NavigationDrawer } from './NavigationDrawer';
import { salesService } from '../services/salesService';
import { purchaseService } from '../services/purchaseService';
import { profitLossService } from '../services/profitLossService';
import { expenseService } from '../services/expenseService';
import { productService } from '../services/productService';
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
  Package,
  LayoutGrid,
  X,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Globe,
  User,
  MapPin,
  Phone,
  Lock,
  Plus,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface OwnerDashboardProps {
  data: OwnerSetupData;
  onReset: () => void;
  initialMetrics?: Partial<DashboardMetrics>;
  onNavigateToSales?: () => void;
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

// Initial Zero Balances matching the reference image state
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

// Demo sample metrics to preview graph & live figures if user toggles demo mode
const sampleDemoMetrics: DashboardMetrics = {
  todaySales: 4850,
  todayPurchases: 2200,
  todayExpenses: 650,
  todayProfitLoss: 2000,
  salesGrowth: 15,
  purchasesGrowth: 8,
  expensesGrowth: 4,
  profitLossGrowth: 22,
  outOfStockCount: 2,
  lowStockCount: 5,
  expiringCount: 3,
  hourlySales: [
    { time: '6 AM', amount: 200 },
    { time: '9 AM', amount: 950 },
    { time: '12 PM', amount: 1800 },
    { time: '3 PM', amount: 2900 },
    { time: '6 PM', amount: 4100 },
    { time: '9 PM', amount: 4850 },
  ],
};

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  data,
  onReset,
  initialMetrics,
}) => {
  const { language, setLanguage } = useLanguage();
  const soundFx = useSoundEffects();
  const { speak } = useVoiceAssistant();

  // Store name defaults to "Maa Laxmi Store" as in the reference image
  const storeName = data.shopName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';

  // Active View / Tab: 'home' | 'sales-details' | 'purchase-details' | 'profit-loss-details' | 'expenses-details' | 'product-alerts' | 'sales'
  const [activeTab, setActiveTab] = useState<'home' | 'sales-details' | 'purchase-details' | 'profit-loss-details' | 'expenses-details' | 'product-alerts' | 'sales'>('home');

  // Preserved selected alert tab for "Needs Your Attention" ('out_of_stock' | 'low_stock' | 'expiring_soon')
  const [activeAlertTab, setActiveAlertTab] = useState<ProductAlertTab>(() => {
    return (localStorage.getItem('sgrocery_active_alert_tab') as ProductAlertTab) || 'out_of_stock';
  });

  // Metrics State: initialized with all 0 values by default as shown in reference image
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ...defaultZeroMetrics,
    ...initialMetrics,
  });

  // Dynamic calculation of today's sales directly from actual completed sales transactions
  useEffect(() => {
    const syncSales = () => {
      const todayTotal = salesService.getTodaySalesTotal(storeName);
      setMetrics((prev) => ({
        ...prev,
        todaySales: todayTotal,
      }));
    };

    syncSales();
    window.addEventListener('sgrocery_sales_updated', syncSales);
    return () => window.removeEventListener('sgrocery_sales_updated', syncSales);
  }, [storeName]);

  // Dynamic calculation of today's purchases directly from actual completed purchase transactions
  useEffect(() => {
    const syncPurchases = () => {
      const todayPurchaseTotal = purchaseService.getTodayPurchasesTotal(storeName);
      setMetrics((prev) => ({
        ...prev,
        todayPurchases: todayPurchaseTotal,
      }));
    };

    syncPurchases();
    window.addEventListener('sgrocery_purchases_updated', syncPurchases);
    return () => window.removeEventListener('sgrocery_purchases_updated', syncPurchases);
  }, [storeName]);

  // Dynamic calculation of today's profit/loss from actual completed sales and purchase costs
  useEffect(() => {
    const syncProfitLoss = () => {
      const todayPL = profitLossService.getTodayNetProfitLoss(storeName);
      setMetrics((prev) => ({
        ...prev,
        todayProfitLoss: todayPL,
      }));
    };

    syncProfitLoss();
    window.addEventListener('sgrocery_sales_updated', syncProfitLoss);
    window.addEventListener('sgrocery_purchases_updated', syncProfitLoss);
    return () => {
      window.removeEventListener('sgrocery_sales_updated', syncProfitLoss);
      window.removeEventListener('sgrocery_purchases_updated', syncProfitLoss);
    };
  }, [storeName]);

  // Dynamic calculation of today's expenses from actual entered expense records
  useEffect(() => {
    const syncExpenses = () => {
      const todayExp = expenseService.getTodayExpensesTotal(storeName);
      setMetrics((prev) => ({
        ...prev,
        todayExpenses: todayExp,
      }));
    };

    syncExpenses();
    window.addEventListener('sgrocery_expenses_updated', syncExpenses);
    return () => window.removeEventListener('sgrocery_expenses_updated', syncExpenses);
  }, [storeName]);

  // Dynamic calculation of product stock alerts from actual inventory database
  useEffect(() => {
    const syncAlerts = () => {
      const counts = productService.getAlertCounts(storeName);
      setMetrics((prev) => ({
        ...prev,
        outOfStockCount: counts.outOfStock,
        lowStockCount: counts.lowStock,
        expiringCount: counts.expiringSoon,
      }));
    };

    syncAlerts();
    window.addEventListener('sgrocery_products_updated', syncAlerts);
    window.addEventListener('sgrocery_sales_updated', syncAlerts);
    window.addEventListener('sgrocery_purchases_updated', syncAlerts);
    return () => {
      window.removeEventListener('sgrocery_products_updated', syncAlerts);
      window.removeEventListener('sgrocery_sales_updated', syncAlerts);
      window.removeEventListener('sgrocery_purchases_updated', syncAlerts);
    };
  }, [storeName]);

  const [isDemoData, setIsDemoData] = useState(false);

  // Modals & Drawers
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttentionItem, setSelectedAttentionItem] = useState<'out_of_stock' | 'low_stock' | 'expiring_soon' | null>(null);

  // Add Product form state
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdMinStock, setNewProdMinStock] = useState('5');
  const [newProdExpiry, setNewProdExpiry] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [catalogRefresh, setCatalogRefresh] = useState(0);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    productService.addProduct({
      name: newProdName.trim(),
      category: newProdCategory.trim() || 'General Grocery',
      currentStock: Number(newProdStock) || 0,
      minStockLevel: Number(newProdMinStock) || 5,
      sellingPrice: Number(newProdPrice) || 0,
      expiryDate: newProdExpiry,
      storeName,
    });
    soundFx.playSuccess();
    setNewProdName('');
    setNewProdStock('');
    setNewProdPrice('');
    setNewProdExpiry('');
    setNewProdCategory('');
    setShowAddProductForm(false);
    setCatalogRefresh((prev) => prev + 1);
  };

  // Dynamic Current Date & Time-based Greeting in IST (Asia/Kolkata timezone)
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [currentGreeting, setCurrentGreeting] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Extract date and time in Indian Standard Time (IST - Asia/Kolkata)
      const istParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).formatToParts(now);

      const getPart = (type: string) => istParts.find((p) => p.type === type)?.value || '';

      const hour = parseInt(getPart('hour'), 10);
      const minute = parseInt(getPart('minute'), 10);
      const day = getPart('day');
      const month = getPart('month');
      const year = getPart('year');
      const weekday = getPart('weekday');

      // Formatted date in IST: e.g. "15 November 2026, Sunday"
      setCurrentDateFormatted(`${day} ${month} ${year}, ${weekday}`);

      // Dynamic Time-based Greeting in IST:
      // - Good Morning: 5:00 AM – 11:59 AM (300 <= mins < 720)
      // - Good Noon: 12:00 PM – 1:59 PM (720 <= mins < 840)
      // - Good Afternoon: 2:00 PM – 4:59 PM (840 <= mins < 1020)
      // - Good Evening: 5:00 PM – 7:59 PM (1020 <= mins < 1200)
      // - Good Night: 8:00 PM – 4:59 AM (mins >= 1200 or mins < 300)
      const totalMinutes = hour * 60 + minute;
      let greetingPrefix = 'Good Night';

      if (totalMinutes >= 5 * 60 && totalMinutes < 12 * 60) {
        greetingPrefix = 'Good Morning';
      } else if (totalMinutes >= 12 * 60 && totalMinutes < 14 * 60) {
        greetingPrefix = 'Good Noon';
      } else if (totalMinutes >= 14 * 60 && totalMinutes < 17 * 60) {
        greetingPrefix = 'Good Afternoon';
      } else if (totalMinutes >= 17 * 60 && totalMinutes < 20 * 60) {
        greetingPrefix = 'Good Evening';
      } else {
        greetingPrefix = 'Good Night';
      }

      const ownerFirstName = data.ownerName
        ? data.ownerName.trim().split(' ')[0]
        : (localStorage.getItem('sgrocery_owner_name') || 'Rina').trim().split(' ')[0];
      setCurrentGreeting(`${greetingPrefix}, ${ownerFirstName} 👋`);
    };

    updateDateTime();
    // Checks every 10 seconds so transitions between time periods occur seamlessly without refresh
    const interval = setInterval(updateDateTime, 10000);
    return () => clearInterval(interval);
  }, [data.ownerName]);

  // Owner Initial for avatar badge (defaults to "R" as in reference image)
  const ownerNameVal = data.ownerName || localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  // Joined date: auto-initialized to first login date and saved
  const [joinedDate] = useState<string>(() => {
    let saved = localStorage.getItem('sgrocery_joined_date_owner') || localStorage.getItem('sgrocery_joined_date');
    if (!saved) {
      const now = new Date();
      saved = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      localStorage.setItem('sgrocery_joined_date_owner', saved);
      localStorage.setItem('sgrocery_joined_date', saved);
    }
    return saved;
  });

  // Store Profile State
  const [profileData, setProfileData] = useState({
    shopOwner: ownerNameVal,
    shopAddress: localStorage.getItem('sgrocery_shop_address') || '',
    phone: data.phone || localStorage.getItem('sgrocery_phone') || '',
    password: data.password || localStorage.getItem('sgrocery_password') || '',
    email: data.email || localStorage.getItem('sgrocery_email') || '',
    businessType: data.businessType || localStorage.getItem('sgrocery_business_type') || 'Retail Shop',
  });

  const [activeDrawerSection, setActiveDrawerSection] = useState<'profile' | 'language' | 'theme'>('profile');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Theme State: 'default' | 'dark'
  const [theme, setTheme] = useState<'default' | 'dark'>(() => {
    return (localStorage.getItem('sgrocery_theme') as 'default' | 'dark') || 'default';
  });

  const handleSelectTheme = (selectedTheme: 'default' | 'dark') => {
    setTheme(selectedTheme);
    localStorage.setItem('sgrocery_theme', selectedTheme);
    soundFx.playClick();
  };

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = (localStorage.getItem('sgrocery_theme') as 'default' | 'dark') || 'default';
      setTheme(currentTheme);
    };
    window.addEventListener('sgrocery_theme_updated', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('sgrocery_theme_updated', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundFx.playSuccess();
    localStorage.setItem('sgrocery_owner_name', profileData.shopOwner);
    localStorage.setItem('sgrocery_shop_address', profileData.shopAddress);
    localStorage.setItem('sgrocery_phone', profileData.phone);
    localStorage.setItem('sgrocery_password', profileData.password);
    localStorage.setItem('sgrocery_email', profileData.email);
    localStorage.setItem('sgrocery_business_type', profileData.businessType);
    setProfileSaveSuccess(true);
    speak('Profile details saved successfully.');
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  const toggleDemoData = () => {
    soundFx.playClick();
    if (isDemoData) {
      setMetrics(defaultZeroMetrics);
      setIsDemoData(false);
    } else {
      setMetrics(sampleDemoMetrics);
      setIsDemoData(true);
    }
  };

  if (activeTab === 'sales-details') {
    return (
      <TodaysSalesDetails
        storeName={storeName}
        onBack={() => {
          soundFx.playClick();
          setActiveTab('home');
        }}
      />
    );
  }

  if (activeTab === 'purchase-details') {
    return (
      <TodaysPurchaseDetails
        storeName={storeName}
        onBack={() => {
          soundFx.playClick();
          setActiveTab('home');
        }}
      />
    );
  }

  if (activeTab === 'profit-loss-details') {
    return (
      <TodaysProfitLossDetails
        storeName={storeName}
        onBack={() => {
          soundFx.playClick();
          setActiveTab('home');
        }}
      />
    );
  }

  if (activeTab === 'expenses-details') {
    return (
      <TodaysExpensesDetails
        storeName={storeName}
        onBack={() => {
          soundFx.playClick();
          setActiveTab('home');
        }}
      />
    );
  }

  if (activeTab === 'product-alerts') {
    return (
      <ProductAlertsDetails
        storeName={storeName}
        initialTab={activeAlertTab}
        onTabChange={(tab) => {
          setActiveAlertTab(tab);
          localStorage.setItem('sgrocery_active_alert_tab', tab);
        }}
        onBack={() => {
          soundFx.playClick();
          setActiveTab('home');
        }}
      />
    );
  }

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between selection:bg-emerald-600 selection:text-white transition-colors duration-200 ${
      theme === 'dark' ? 'dark bg-slate-900 text-slate-100' : 'bg-[#f7f8fa] text-slate-800'
    }`}>

      {/* ==================== 1. TOP NAVIGATION APP BAR ==================== */}
      <header className={`w-full border-b sticky top-0 z-30 transition-colors shadow-xs ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Left: Hamburger Menu + Store Logo + Store Name + Dropdown Chevron */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowMenuDrawer(true);
              }}
              className="p-1 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors cursor-pointer"
              title="Menu"
              aria-label="Open Menu Drawer"
            >
              <Menu className="w-6 h-6 stroke-[2.4]" />
            </button>

            <div
              onClick={() => {
                soundFx.playClick();
                setShowMenuDrawer(true);
              }}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <StorefrontLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {storeName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Right: Search + Notifications Bell + Green Avatar "R" */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowSearchModal(true);
              }}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowNotifications(true);
              }}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors relative cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {(metrics.outOfStockCount > 0 || isDemoData) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Owner Green Avatar Badge (Letter 'R') */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowMenuDrawer(true);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#008744] text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
              title={ownerNameVal}
              aria-label="User Profile"
            >
              {ownerInitial}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. MAIN CONTENT ==================== */}
      {activeTab === 'sales' ? (
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-4 pb-28 animate-fadeIn">
          <SalesDashboard storeName={storeName} onBackToHome={() => setActiveTab('home')} />
        </main>
      ) : (
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 pb-28">

          {/* GREETING CARD (Mint green gradient with decorative wavy ribbon on the right & dynamic date) */}
          <section className={`w-full relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all shadow-xs ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-slate-800 via-slate-800/90 to-emerald-950/40 border border-slate-700 text-white'
              : 'bg-gradient-to-r from-[#eef9f2] via-[#e5f7ec] to-[#d6f2e1] border border-emerald-100 text-slate-900'
          }`}>
            {/* Soft Translucent Wavy Patterns on the Right (as in reference image) */}
            <svg
              className="absolute right-0 top-0 bottom-0 h-full w-48 sm:w-64 md:w-80 pointer-events-none opacity-45 sm:opacity-55"
              viewBox="0 0 300 120"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 60,0 C 120,40 100,90 180,70 C 240,55 220,110 300,90 L 300,120 L 0,120 Z"
                fill="url(#greenWaveGrad1)"
              />
              <path
                d="M 120,0 C 170,30 180,80 230,60 C 270,45 280,100 300,80 L 300,0 Z"
                fill="url(#greenWaveGrad2)"
              />
              <defs>
                <linearGradient id="greenWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="greenWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#86efac" stopOpacity="0.25" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative z-10 flex flex-col justify-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {currentGreeting}
              </h1>
              
              {/* Dynamic Date: Updates every day dynamically, not hardcoded */}
              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2] shrink-0" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>
          </section>

          {/* 4 METRIC STAT CARDS (2x2 grid on mobile/tablet, 4 across on desktop) */}
          <section className="w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

              {/* 1. Today's Sales */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('sales-details');
                }}
                role="button"
                tabIndex={0}
                className="bg-[#edf9f1] dark:bg-slate-800 border border-[#def2e5] dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#00c569] text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    ₹
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate leading-snug">
                      Today's Sales
                    </p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                      ₹{metrics.todaySales.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#daf5e3] dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#00c569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
                </div>
              </div>

              {/* 2. Today's Purchases */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('purchase-details');
                }}
                role="button"
                tabIndex={0}
                className="bg-[#eef6fe] dark:bg-slate-800 border border-[#d6eaff] dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0084ff] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate leading-snug">
                      Today's Purchases
                    </p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                      ₹{metrics.todayPurchases.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#dff0ff] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#0084ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
                </div>
              </div>

              {/* 3. Today's Expenses */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('expenses-details');
                }}
                role="button"
                tabIndex={0}
                className="bg-[#fff6ec] dark:bg-slate-800 border border-[#fde4cb] dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#ff8000] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate leading-snug">
                      Today's Expenses
                    </p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                      ₹{metrics.todayExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ffeed9] dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#ff8000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
                </div>
              </div>

              {/* 4. Today's Profit/Loss */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('profit-loss-details');
                }}
                role="button"
                tabIndex={0}
                className="bg-[#f8f2fe] dark:bg-slate-800 border border-[#edd7ff] dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#8a2be2] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {/* 3-bar chart icon */}
                    <div className="flex items-end gap-1 h-5">
                      <span className="w-1 bg-white rounded-xs h-2.5"></span>
                      <span className="w-1 bg-white rounded-xs h-5"></span>
                      <span className="w-1 bg-white rounded-xs h-3.5"></span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate leading-snug">
                      Today's Profit/Loss
                    </p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                      {metrics.todayProfitLoss < 0 ? `-₹${Math.abs(metrics.todayProfitLoss).toLocaleString()}` : `₹${metrics.todayProfitLoss.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f3e8ff] dark:bg-purple-950/60 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#8a2be2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
                </div>
              </div>

            </div>
          </section>

          {/* NEEDS YOUR ATTENTION SECTION (Positioned exactly above Daily Sales Overview as in reference image) */}
          <section className="w-full">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2.5">
              Needs Your Attention
            </h2>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
              
              {/* Row 1: Products are out of stock */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveAlertTab('out_of_stock');
                  localStorage.setItem('sgrocery_active_alert_tab', 'out_of_stock');
                  setActiveTab('product-alerts');
                }}
                role="button"
                tabIndex={0}
                className={`p-3.5 sm:p-4 flex items-center justify-between transition-all cursor-pointer group ${
                  activeAlertTab === 'out_of_stock'
                    ? 'bg-red-50/70 dark:bg-red-950/25 border-l-4 border-[#ff3b30]'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ff3b30] text-white flex items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Products are out of stock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {metrics.outOfStockCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                      {metrics.outOfStockCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 2: Products are low in stock */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveAlertTab('low_stock');
                  localStorage.setItem('sgrocery_active_alert_tab', 'low_stock');
                  setActiveTab('product-alerts');
                }}
                role="button"
                tabIndex={0}
                className={`p-3.5 sm:p-4 flex items-center justify-between transition-all cursor-pointer group ${
                  activeAlertTab === 'low_stock'
                    ? 'bg-amber-50/70 dark:bg-amber-950/25 border-l-4 border-[#ff9500]'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ff9500]/15 text-[#ff9500] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 fill-[#ff9500] text-white stroke-[1.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Products are low in stock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {metrics.lowStockCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      {metrics.lowStockCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 3: Products are expiring soon */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setActiveAlertTab('expiring_soon');
                  localStorage.setItem('sgrocery_active_alert_tab', 'expiring_soon');
                  setActiveTab('product-alerts');
                }}
                role="button"
                tabIndex={0}
                className={`p-3.5 sm:p-4 flex items-center justify-between transition-all cursor-pointer group ${
                  activeAlertTab === 'expiring_soon'
                    ? 'bg-blue-50/70 dark:bg-blue-950/25 border-l-4 border-[#007aff]'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007aff] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Products are expiring soon
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {metrics.expiringCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {metrics.expiringCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

            </div>
          </section>

          {/* DAILY SALES OVERVIEW CARD (Matching chart with empty state, View Report in green, labels) */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-4 sm:p-6 shadow-xs">
            
            {/* Header: Title on Left, Green 'View Report >' on Right */}
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Daily Sales Overview
              </h2>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('sales-details');
                }}
                className="text-xs sm:text-sm font-bold text-[#008744] hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Report</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Total Sales Summary */}
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                ₹{metrics.todaySales.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Total Sales Today
              </p>
            </div>

            {/* Chart Area with Horizontal Dotted Gridlines & Empty State or Spline */}
            <div className="relative w-full h-44 sm:h-52 mt-3 pt-2">
              
              <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesSplineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c569" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#00c569" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Labels & Dashed Gridlines */}
                {/* ₹3K */}
                <text x="0" y="16" fill="#94a3b8" fontSize="11" fontWeight="600">₹3K</text>
                <line x1="36" y1="12" x2="495" y2="12" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />

                {/* ₹2K */}
                <text x="0" y="52" fill="#94a3b8" fontSize="11" fontWeight="600">₹2K</text>
                <line x1="36" y1="48" x2="495" y2="48" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />

                {/* ₹1K */}
                <text x="0" y="88" fill="#94a3b8" fontSize="11" fontWeight="600">₹1K</text>
                <line x1="36" y1="84" x2="495" y2="84" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />

                {/* ₹0 */}
                <text x="8" y="124" fill="#94a3b8" fontSize="11" fontWeight="600">₹0</text>
                <line x1="36" y1="120" x2="495" y2="120" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1" />

                {/* Vertical Dotted Guides aligning with time markers */}
                {[55, 140, 225, 310, 395, 480].map((vx, i) => (
                  <line
                    key={i}
                    x1={vx}
                    y1="12"
                    x2={vx}
                    y2="120"
                    stroke="#f1f5f9"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                ))}

                {/* Live Spline Line if sales > 0 (e.g. demo mode), otherwise Empty State */}
                {metrics.todaySales > 0 ? (
                  <>
                    <path
                      d="M 55 116 C 95 110, 120 95, 140 85 C 180 65, 210 60, 225 50 C 260 38, 290 32, 310 30 C 350 25, 380 20, 395 18 C 430 15, 460 14, 480 12 L 480 120 L 55 120 Z"
                      fill="url(#salesSplineGrad)"
                    />
                    <path
                      d="M 55 116 C 95 110, 120 95, 140 85 C 180 65, 210 60, 225 50 C 260 38, 290 32, 310 30 C 350 25, 380 20, 395 18 C 430 15, 460 14, 480 12"
                      fill="none"
                      stroke="#00c569"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </>
                ) : null}
              </svg>

              {/* Exact Empty State centered over the grid as in reference image */}
              {metrics.todaySales === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  {/* Soft Gray Bar Chart Icon */}
                  <div className="flex items-end gap-1.5 h-6 mb-1 text-slate-400">
                    <span className="w-1.5 bg-slate-300 dark:bg-slate-600 rounded-xs h-3"></span>
                    <span className="w-1.5 bg-slate-400 dark:bg-slate-500 rounded-xs h-6"></span>
                    <span className="w-1.5 bg-slate-300 dark:bg-slate-600 rounded-xs h-4"></span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No sales data yet
                  </p>
                </div>
              )}

              {/* X-Axis Time Markers: 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM */}
              <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2 pl-9 pr-2">
                <span>6 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
                <span>9 PM</span>
              </div>
            </div>
          </section>

          {/* Quick Demo Data / 0-Balance Toggle Pill for developer review */}
          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={toggleDemoData}
              className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isDemoData ? 'Switch to Exact Zero-Balance View' : 'Preview with Sample Transactions'}</span>
            </button>
          </div>

        </main>
      )}

      {/* ==================== 3. FIXED BOTTOM NAVIGATION BAR ==================== */}
      <nav
        aria-label="Bottom Navigation"
        className={`fixed bottom-0 left-0 right-0 z-40 border-t py-2 px-4 sm:px-8 shadow-lg transition-colors ${
          theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="max-w-md sm:max-w-lg mx-auto grid grid-cols-4 items-center gap-1 sm:gap-2">
          
          {/* 1. Home (Active in reference image with soft green rounded pill background) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1.5 px-3 sm:px-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#e7f7ed] text-[#008744] dark:bg-emerald-950/70 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-[#008744] text-[#008744] dark:fill-emerald-400 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`} />
            <span className={`text-[11px] sm:text-xs font-black mt-0.5 ${activeTab === 'home' ? 'text-[#008744] dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
              Home
            </span>
          </button>

          {/* 2. Sale */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('sales');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1.5 px-3 sm:px-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-[#e7f7ed] text-[#008744] dark:bg-emerald-950/70 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 stroke-[2] ${activeTab === 'sales' ? 'text-[#008744] dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`} />
            <span className={`text-[11px] sm:text-xs font-semibold mt-0.5 ${activeTab === 'sales' ? 'text-[#008744] dark:text-emerald-300 font-black' : 'text-slate-600 dark:text-slate-300'}`}>
              Sale
            </span>
          </button>

          {/* 3. Product */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowProductModal(true);
            }}
            className="py-1.5 px-3 sm:px-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <Package className="w-5 h-5 stroke-[2] text-slate-600 dark:text-slate-300" />
            <span className="text-[11px] sm:text-xs font-semibold mt-0.5 text-slate-600 dark:text-slate-300">
              Product
            </span>
          </button>

          {/* 4. More */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowMenuDrawer(true);
            }}
            className="py-1.5 px-3 sm:px-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <LayoutGrid className="w-5 h-5 stroke-[2] text-slate-600 dark:text-slate-300" />
            <span className="text-[11px] sm:text-xs font-semibold mt-0.5 text-slate-600 dark:text-slate-300">
              More
            </span>
          </button>

        </div>
      </nav>

      {/* ==================== 4. LEFT NAVIGATION DRAWER (Images 1-9) ==================== */}
      <NavigationDrawer
        isOpen={showMenuDrawer}
        onClose={() => setShowMenuDrawer(false)}
        onLogout={onReset}
        currentRole={
          (localStorage.getItem('sgrocery_user_role') === 'helper'
            ? 'employee'
            : (localStorage.getItem('sgrocery_user_role') as any)) || 'owner'
        }
        currentStoreName={storeName}
        onStoreNameUpdate={(newName) => {
          localStorage.setItem('sgrocery_store_name', newName);
        }}
      />

      {/* ==================== 5. ATTENTION ITEM DETAIL MODAL ==================== */}
      {selectedAttentionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {selectedAttentionItem === 'out_of_stock' && (
                  <div className="w-8 h-8 rounded-full bg-[#ff3b30] text-white flex items-center justify-center font-bold">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                {selectedAttentionItem === 'low_stock' && (
                  <div className="w-8 h-8 rounded-lg bg-[#ff9500]/15 text-[#ff9500] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 fill-[#ff9500] text-white" />
                  </div>
                )}
                {selectedAttentionItem === 'expiring_soon' && (
                  <div className="w-8 h-8 rounded-full bg-[#007aff] text-white flex items-center justify-center">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white capitalize">
                  {selectedAttentionItem === 'out_of_stock' && 'Out of Stock Products'}
                  {selectedAttentionItem === 'low_stock' && 'Low Stock Warning'}
                  {selectedAttentionItem === 'expiring_soon' && 'Expiring Soon Items'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttentionItem(null)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 py-2">
              {selectedAttentionItem === 'out_of_stock' && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs">
                  <p className="font-bold text-red-800 dark:text-red-300">Currently 0 items in critical stock</p>
                  <p className="text-red-600 dark:text-red-400 mt-0.5">All regular items are adequately stocked or awaiting delivery.</p>
                </div>
              )}
              {selectedAttentionItem === 'low_stock' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs">
                  <p className="font-bold text-amber-800 dark:text-amber-300">5 products below reorder threshold</p>
                  <p className="text-amber-700 dark:text-amber-400 mt-0.5">Suggested reorder: Sugar (5kg left), Mustard Oil (2L left).</p>
                </div>
              )}
              {selectedAttentionItem === 'expiring_soon' && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs">
                  <p className="font-bold text-blue-800 dark:text-blue-300">Fresh bread & dairy expiring in 48 hours</p>
                  <p className="text-blue-600 dark:text-blue-400 mt-0.5">Consider applying a 10% discount on expiring milk packets.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedAttentionItem(null)}
              className="w-full py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==================== 6. SEARCH MODAL ==================== */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs p-4 pt-16 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Quick Search
              </h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, bills, customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#008744]"
              />
            </div>

            <div className="text-center py-4 text-xs text-slate-500">
              Type to instantly search grocery inventory or recent invoices
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. PRODUCT INVENTORY MODAL ==================== */}
      {showProductModal && (() => {
        const catalogProducts = productService.getAllProducts(storeName);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#008744]" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Product Catalog ({catalogProducts.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setShowAddProductForm(false);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!showAddProductForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">Store Inventory</span>
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {catalogProducts.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <Package className="w-7 h-7" />
                      </div>
                      <p className="font-extrabold text-slate-800 dark:text-white text-sm">No products in stock yet</p>
                      <p className="text-slate-400 text-xs mt-1 max-w-xs">
                        No products have been added to your store. Add products to populate your inventory and alerts.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddProductForm(true)}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        + Add First Product
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {catalogProducts.map((item) => {
                        const isOutOfStock = item.currentStock <= 0;
                        const isLowStock = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-slate-500 font-medium text-[11px]">
                                Qty: {item.currentStock} {item.unit} • ₹{item.sellingPrice} • {item.category}
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                                isOutOfStock
                                  ? 'bg-red-50 text-red-700'
                                  : isLowStock
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="w-full py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </>
              ) : (
                /* ADD PRODUCT FORM */
                <form onSubmit={handleAddProductSubmit} className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Add New Product to Store
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aashirvaad Atta (5kg)"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="e.g. 210"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Stock *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 10 (or 0)"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Min Stock Threshold</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 5"
                        value={newProdMinStock}
                        onChange={(e) => setNewProdMinStock(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={newProdExpiry}
                        onChange={(e) => setNewProdExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      {/* ==================== 8. NOTIFICATIONS DRAWER ==================== */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#008744]" />
                Notifications
              </h3>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 py-1 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 text-slate-700 dark:text-slate-200">
                <p className="font-bold text-[#008744]">Welcome to S-Grocery!</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Your store {storeName} is ready to record transactions.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
