import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Bell,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  Clock,
  PackageX,
  XCircle,
  Calendar,
} from 'lucide-react';
import {
  productService,
  ProductItem,
  getDaysUntilDate,
} from '../services/productService';
import { useSoundEffects } from '../hooks/useSoundEffects';

export type ProductAlertTab = 'out_of_stock' | 'low_stock' | 'expiring_soon';

interface ProductAlertsDetailsProps {
  onBack: () => void;
  initialTab?: ProductAlertTab;
  onTabChange?: (tab: ProductAlertTab) => void;
  storeName?: string;
}

// 3D Closed Box Icon in crisp vector (matching Out of Stock reference image metric card)
const ClosedBoxIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3D Isometric Closed Package Box */}
    {/* Top Face */}
    <path d="M24 6L40 15L24 24L8 15L24 6Z" fill="#ff7675" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Left Face */}
    <path d="M8 15V33L24 42V24L8 15Z" fill="#d63031" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Right Face */}
    <path d="M24 24V42L40 33V15L24 24Z" fill="#b71540" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Top Center Seam Line */}
    <line x1="24" y1="6" x2="24" y2="24" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 1" />
  </svg>
);

// Crisp Vector Open Box Graphic with 3 Radiating Sparks (Themed by alert type)
const OpenAlertBoxGraphic: React.FC<{
  type: ProductAlertTab;
  className?: string;
}> = ({ type, className = 'w-28 h-28' }) => {
  // Theme colors
  const strokeColor =
    type === 'out_of_stock' ? '#ef4444' : type === 'low_stock' ? '#f59e0b' : '#0084ff';
  const leftFlapFill =
    type === 'out_of_stock' ? '#fef2f2' : type === 'low_stock' ? '#fffbeb' : '#eff6ff';
  const rightFlapFill =
    type === 'out_of_stock' ? '#fee2e2' : type === 'low_stock' ? '#fef3c7' : '#dbeafe';
  const leftFaceFill =
    type === 'out_of_stock' ? '#fef2f2' : type === 'low_stock' ? '#fffbeb' : '#eff6ff';
  const rightFaceFill =
    type === 'out_of_stock' ? '#fecaca' : type === 'low_stock' ? '#fde68a' : '#bfdbfe';
  const cavityFill =
    type === 'out_of_stock' ? '#fee2e2' : type === 'low_stock' ? '#fef3c7' : '#dbeafe';

  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3 Radiating Sparks on Top */}
      <line x1="60" y1="12" x2="60" y2="24" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="42" y1="16" x2="49" y2="26" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="78" y1="16" x2="71" y2="26" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />

      {/* Top Open Flaps */}
      {/* Left Flap */}
      <path d="M 28 50 L 44 34 L 60 48 L 44 64 Z" fill={leftFlapFill} stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Right Flap */}
      <path d="M 60 48 L 76 34 L 92 50 L 76 64 Z" fill={rightFlapFill} stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Box Body */}
      {/* Left Face */}
      <path d="M 32 58 L 60 74 L 60 102 L 32 86 Z" fill={leftFaceFill} stroke={strokeColor} strokeWidth="2.8" strokeLinejoin="round" />
      {/* Right Face */}
      <path d="M 60 74 L 88 58 L 88 86 L 60 102 Z" fill={rightFaceFill} stroke={strokeColor} strokeWidth="2.8" strokeLinejoin="round" />
      {/* Inner Box Top Cavity */}
      <path d="M 32 58 L 60 44 L 88 58 L 60 74 Z" fill={cavityFill} stroke={strokeColor} strokeWidth="2.8" strokeLinejoin="round" />
    </svg>
  );
};

export const ProductAlertsDetails: React.FC<ProductAlertsDetailsProps> = ({
  onBack,
  initialTab = 'out_of_stock',
  onTabChange,
  storeName,
}) => {
  const soundFx = useSoundEffects();

  // Active Tab state: 'out_of_stock' | 'low_stock' | 'expiring_soon'
  const [activeTab, setActiveTab] = useState<ProductAlertTab>(() => {
    return initialTab || (localStorage.getItem('sgrocery_active_alert_tab') as ProductAlertTab) || 'out_of_stock';
  });

  // Dropdown menu visibility
  const [showDropdown, setShowDropdown] = useState(false);

  // Search product filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Re-fetch trigger when inventory updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleUpdates = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('sgrocery_products_updated', handleUpdates);
    window.addEventListener('sgrocery_sales_updated', handleUpdates);
    window.addEventListener('sgrocery_purchases_updated', handleUpdates);
    return () => {
      window.removeEventListener('sgrocery_products_updated', handleUpdates);
      window.removeEventListener('sgrocery_sales_updated', handleUpdates);
      window.removeEventListener('sgrocery_purchases_updated', handleUpdates);
    };
  }, []);

  // Sync external tab change
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handler to switch alert tab
  const handleSelectTab = (tab: ProductAlertTab) => {
    soundFx.playClick();
    setActiveTab(tab);
    setShowDropdown(false);
    localStorage.setItem('sgrocery_active_alert_tab', tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Get filtered products according to activeTab
  const productList: ProductItem[] = useMemo(() => {
    if (activeTab === 'out_of_stock') {
      return productService.getOutOfStockProducts(storeName);
    }
    if (activeTab === 'low_stock') {
      return productService.getLowStockProducts(storeName);
    }
    return productService.getExpiringSoonProducts(storeName);
  }, [activeTab, storeName, refreshTrigger]);

  // Filter by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productList;
    const q = searchQuery.toLowerCase().trim();
    return productList.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [productList, searchQuery]);

  // Owner initial for avatar (defaults to "R" as in reference image)
  const ownerNameVal = localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  // Active configuration based on selected tab (matching the 3 reference images)
  const tabConfig = useMemo(() => {
    switch (activeTab) {
      case 'out_of_stock':
        return {
          title: 'Out of Stock Products',
          cardBg: 'bg-[#feecee]',
          cardBorder: 'border-[#fecaca]',
          iconBg: 'bg-[#e53935]',
          icon: <ClosedBoxIcon className="w-7 h-7 sm:w-8 sm:h-8" />,
          dropdownLabel: 'Out of Stock',
          dropdownIcon: <XCircle className="w-4 h-4 text-[#ef4444] fill-[#ef4444] text-white stroke-[2]" />,
          dropdownBg: 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border-emerald-300',
          tableHeaderBg: 'bg-[#fee2e2] text-[#991b1b]',
          col1Title: 'Product Name',
          col2Title: 'Available Quantity',
          emptyTitle: 'No out of stock products',
          emptySubtitle: 'There are no products out of stock.',
        };
      case 'low_stock':
        return {
          title: 'Low in Stock Products',
          cardBg: 'bg-[#fef8e7]',
          cardBorder: 'border-[#fef3c7]',
          iconBg: 'bg-[#f59e0b]',
          icon: <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white stroke-[1.5]" />,
          dropdownLabel: 'Low in Stock',
          dropdownIcon: <AlertTriangle className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b] text-white stroke-[1.5]" />,
          dropdownBg: 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border-emerald-300',
          tableHeaderBg: 'bg-[#fef3c7] text-[#92400e]',
          col1Title: 'Product Name',
          col2Title: 'Available Quantity',
          emptyTitle: 'No low stock products',
          emptySubtitle: 'There are no products with low stock.',
        };
      case 'expiring_soon':
      default:
        return {
          title: 'Expiring Soon Products',
          cardBg: 'bg-[#eef6fe]',
          cardBorder: 'border-[#dbeafe]',
          iconBg: 'bg-[#0084ff]',
          icon: <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.2]" />,
          dropdownLabel: 'Expiring Soon',
          dropdownIcon: <Clock className="w-4 h-4 text-[#0084ff] fill-[#0084ff] text-white stroke-[1.5]" />,
          dropdownBg: 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border-emerald-300',
          tableHeaderBg: 'bg-[#dbeafe] text-[#1e40af]',
          col1Title: 'Product Name',
          col2Title: 'Expiry Date',
          emptyTitle: 'No expiring products',
          emptySubtitle: 'There are no products expiring soon.',
        };
    }
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-[#f7f8fa] text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white animate-fadeIn pb-16">
      
      {/* ==================== 1. TOP APP BAR ==================== */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Left: Back Arrow + Page Title ("Product Alerts" as shown in all 3 reference images) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                // Ensure activeTab is saved before navigating back
                localStorage.setItem('sgrocery_active_alert_tab', activeTab);
                if (onTabChange) onTabChange(activeTab);
                onBack();
              }}
              className="p-1 -ml-1 rounded-xl hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.4]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Product Alerts
            </h1>
          </div>

          {/* Right: Search + Bell + Green Avatar "R" */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => soundFx.playClick()}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => soundFx.playClick()}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#008744] text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-xs select-none"
              title={ownerNameVal}
            >
              {ownerInitial}
            </div>
          </div>

        </div>
      </header>

      {/* ==================== 2. MAIN BODY ==================== */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* ROW WITH ALERT TYPE DROPDOWN (Positioned top-right exactly as shown in reference images) */}
        <div className="flex items-center justify-end relative">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowDropdown(!showDropdown);
            }}
            className={`border ${tabConfig.dropdownBg} text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer`}
            aria-label="Select Alert Type"
          >
            {tabConfig.dropdownIcon}
            <span>{tabConfig.dropdownLabel}</span>
            <ChevronDown className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
          </button>

          {/* DROPDOWN MENU POPOVER (Matching Image 1 popup menu with the 3 options) */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-10 right-0 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-xs font-semibold animate-scaleUp">
                
                {/* Option 1: Out of Stock */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('out_of_stock')}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'out_of_stock'
                      ? 'bg-red-50 text-red-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#ff3b30] text-white flex items-center justify-center">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Out of Stock</span>
                  </div>
                  {activeTab === 'out_of_stock' && <Check className="w-4 h-4 text-red-700 stroke-[2.5]" />}
                </button>

                {/* Option 2: Low in Stock */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('low_stock')}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'low_stock'
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-[#ff9500]/15 text-[#ff9500] flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 fill-[#ff9500] text-white stroke-[1.5]" />
                    </div>
                    <span>Low in Stock</span>
                  </div>
                  {activeTab === 'low_stock' && <Check className="w-4 h-4 text-amber-700 stroke-[2.5]" />}
                </button>

                {/* Option 3: Expiring Soon */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('expiring_soon')}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'expiring_soon'
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Expiring Soon</span>
                  </div>
                  {activeTab === 'expiring_soon' && <Check className="w-4 h-4 text-blue-700 stroke-[2.5]" />}
                </button>

              </div>
            </>
          )}
        </div>

        {/* METRIC SUMMARY CARD (Matching reference images with themed background, icon, and dynamic count) */}
        <section className={`${tabConfig.cardBg} border ${tabConfig.cardBorder} rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs transition-all`}>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${tabConfig.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
              {tabConfig.icon}
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                {tabConfig.title}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5 truncate">
                {productList.length}
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH PRODUCT INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* TABLE COLUMN HEADER (Shown when table has products or in low stock/expiring as in reference images) */}
        {(activeTab !== 'out_of_stock' || filteredProducts.length > 0) && (
          <div className={`${tabConfig.tableHeaderBg} text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between select-none shadow-2xs`}>
            <span className="w-10 sm:w-12 text-center">No.</span>
            <span className="flex-1 text-left pl-2">{tabConfig.col1Title}</span>
            <span className="w-36 sm:w-44 text-right pr-2">{tabConfig.col2Title}</span>
          </div>
        )}

        {/* PRODUCT LIST OR EMPTY STATE */}
        {filteredProducts.length === 0 ? (
          /* EMPTY STATE (Matching themed open box graphic with sparks) */
          <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-2">
              <OpenAlertBoxGraphic type={activeTab} className="w-28 h-28 sm:w-32 sm:h-32" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {tabConfig.emptyTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {tabConfig.emptySubtitle}
            </p>
          </div>
        ) : (
          /* POPULATED ROWS */
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {filteredProducts.map((prod, idx) => {
              const daysLeft = getDaysUntilDate(prod.expiryDate);
              return (
                <div
                  key={prod.id}
                  className="px-3.5 sm:px-4 py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-10 sm:w-12 text-center shrink-0">
                    <span className="font-bold text-slate-400">{idx + 1}</span>
                  </div>

                  <div className="flex-1 text-left pl-2 min-w-0 pr-3">
                    <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{prod.category}</p>
                  </div>

                  <div className="w-36 sm:w-44 text-right shrink-0">
                    {activeTab === 'out_of_stock' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-xs">
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> 0 {prod.unit}
                      </span>
                    )}

                    {activeTab === 'low_stock' && (
                      <div className="inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> {prod.currentStock} {prod.unit} left
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Min stock: {prod.minStockLevel}
                        </span>
                      </div>
                    )}

                    {activeTab === 'expiring_soon' && (
                      <div className="inline-flex flex-col items-end">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-xs ${
                          daysLeft <= 3 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          <Clock className="w-3 h-3" /> {prod.expiryDate}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {daysLeft === 0 ? 'Expires today' : daysLeft === 1 ? 'Expires tomorrow' : `In ${daysLeft} days`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
};
