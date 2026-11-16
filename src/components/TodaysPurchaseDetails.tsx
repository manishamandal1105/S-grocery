import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  Plus,
  X,
  Check,
  ShoppingCart,
} from 'lucide-react';
import {
  purchaseService,
  PurchasedProductItem,
} from '../services/purchaseService';
import { formatDisplayDate, standardGroceryCatalog, CatalogItem } from '../services/salesService';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface TodaysPurchaseDetailsProps {
  onBack: () => void;
  storeName?: string;
}

// Crisp Vector Open Box Graphic matching the reference design
const OpenBoxGraphic: React.FC<{ className?: string }> = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3 Radiating Green Sparks on Top */}
    <line x1="60" y1="12" x2="60" y2="24" stroke="#00c569" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="42" y1="16" x2="49" y2="26" stroke="#00c569" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="78" y1="16" x2="71" y2="26" stroke="#00c569" strokeWidth="3.5" strokeLinecap="round" />

    {/* Top Open Flaps */}
    {/* Left Flap */}
    <path d="M 28 50 L 44 34 L 60 48 L 44 64 Z" fill="#ebf9f0" stroke="#00c569" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Right Flap */}
    <path d="M 60 48 L 76 34 L 92 50 L 76 64 Z" fill="#e2f7ea" stroke="#00c569" strokeWidth="2.5" strokeLinejoin="round" />

    {/* Box Body */}
    {/* Left Face */}
    <path d="M 32 58 L 60 74 L 60 102 L 32 86 Z" fill="#ebf9f0" stroke="#00c569" strokeWidth="2.8" strokeLinejoin="round" />
    {/* Right Face */}
    <path d="M 60 74 L 88 58 L 88 86 L 60 102 Z" fill="#def4e5" stroke="#00c569" strokeWidth="2.8" strokeLinejoin="round" />
    {/* Inner Box Top Cavity */}
    <path d="M 32 58 L 60 44 L 88 58 L 60 74 Z" fill="#d2f2dc" stroke="#00c569" strokeWidth="2.8" strokeLinejoin="round" />
  </svg>
);

export const TodaysPurchaseDetails: React.FC<TodaysPurchaseDetailsProps> = ({ onBack, storeName }) => {
  const soundFx = useSoundEffects();

  // Current selected date in IST (YYYY-MM-DD), defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(() => purchaseService.getTodayISTDate());

  // Date selector dropdown state
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('');

  // Search product filter
  const [searchQuery, setSearchQuery] = useState('');

  // Record New Purchase Modal State
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [supplierName, setSupplierName] = useState('Metro Cash & Carry');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Cash' | 'UPI' | 'Credit'>('Bank Transfer');
  const [purchaseLineItems, setPurchaseLineItems] = useState<{ productName: string; quantity: number; unitPrice: number }[]>([
    { productName: 'Fortune Mustard Oil (1L)', quantity: 10, unitPrice: 125 },
  ]);

  // Trigger re-render whenever purchases change
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handlePurchaseUpdated = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('sgrocery_purchases_updated', handlePurchaseUpdated);
    return () => window.removeEventListener('sgrocery_purchases_updated', handlePurchaseUpdated);
  }, []);

  // Retrieve itemized products purchased for the selected date
  const productsPurchased: PurchasedProductItem[] = useMemo(() => {
    return purchaseService.getItemizedProductsForDate(selectedDate, storeName);
  }, [selectedDate, storeName, refreshTrigger]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productsPurchased;
    const query = searchQuery.toLowerCase().trim();
    return productsPurchased.filter((p) => p.productName.toLowerCase().includes(query));
  }, [productsPurchased, searchQuery]);

  // Total purchase amount for the selected date
  const totalPurchaseAmount = useMemo(() => {
    return purchaseService.getDatePurchaseTotal(selectedDate, storeName);
  }, [selectedDate, storeName, refreshTrigger]);

  // Grand total for the displayed products
  const grandTotal = useMemo(() => {
    return filteredProducts.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [filteredProducts]);

  // Display label for the selected date (e.g. "Today", "Yesterday", "14 Nov 2026")
  const dateDisplayLabel = useMemo(() => {
    return formatDisplayDate(selectedDate);
  }, [selectedDate]);

  // Available historical dates
  const availableDates = useMemo(() => {
    return purchaseService.getAvailableDates();
  }, [refreshTrigger]);

  // Owner initial for avatar (defaults to "R" as in reference image)
  const ownerNameVal = localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  // Add line item in New Purchase modal
  const handleAddLineItem = () => {
    setPurchaseLineItems([...purchaseLineItems, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  // Remove line item in New Purchase modal
  const handleRemoveLineItem = (idx: number) => {
    if (purchaseLineItems.length > 1) {
      setPurchaseLineItems(purchaseLineItems.filter((_, i) => i !== idx));
    }
  };

  // Save new purchase transaction
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = purchaseLineItems.filter((item) => item.productName.trim() && item.quantity > 0 && item.unitPrice > 0);
    if (validItems.length === 0) {
      alert('Please enter at least one valid product with quantity and purchase price.');
      return;
    }

    soundFx.playSuccess();
    purchaseService.recordCompletedPurchase({
      supplierName,
      paymentMode,
      items: validItems,
      date: selectedDate,
      storeName: storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store',
    });

    setShowAddPurchaseModal(false);
    setPurchaseLineItems([{ productName: 'Fortune Mustard Oil (1L)', quantity: 5, unitPrice: 130 }]);
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f8fa] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white animate-fadeIn pb-16">
      
      {/* ==================== 1. TOP APP BAR ==================== */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Left: Back Arrow + Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onBack();
              }}
              className="p-1 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors cursor-pointer"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.4]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Today's Purchase
            </h1>
          </div>

          {/* Right: Search + Bell + Green Avatar "R" */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => soundFx.playClick()}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => soundFx.playClick()}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors cursor-pointer"
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
        
        {/* Row with Date Selector on the Right */}
        <div className="flex items-center justify-end relative">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowDateDropdown(!showDateDropdown);
            }}
            className="border border-emerald-300 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            aria-label="Select Date"
          >
            <Calendar className="w-4 h-4 text-emerald-800 dark:text-emerald-300 stroke-[2.2]" />
            <span>{dateDisplayLabel}</span>
            <ChevronDown className="w-4 h-4 text-emerald-800 dark:text-emerald-300 stroke-[2.5]" />
          </button>

          {/* Date Selector Popover Dropdown */}
          {showDateDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDateDropdown(false)}
              />
              <div className="absolute top-10 right-0 z-50 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 text-xs font-semibold animate-scaleUp">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Select Purchase Date (IST)
                </div>

                {availableDates.map((dStr) => {
                  const isSelected = selectedDate === dStr;
                  const label = formatDisplayDate(dStr);
                  return (
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedDate(dStr);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setShowDateDropdown(false);
                      setShowCustomDatePicker(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>📅 Choose Other Date...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* METRIC CARD: Today's Purchase (Matching reference image with soft blue card & cart icon) */}
        <section className="bg-[#f0f7ff] dark:bg-blue-950/40 border border-[#d6eaff] dark:border-blue-900/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0084ff] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-blue-300/80 leading-snug">
                {selectedDate === purchaseService.getTodayISTDate() ? "Today's Purchase" : `Purchase (${dateDisplayLabel})`}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                ₹{totalPurchaseAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#dff0ff] dark:bg-blue-900/60 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#0084ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </section>

        {/* PURCHASE DETAILS SECTION HEADER & QUICK RECORD BUTTON */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Purchase Details
          </h2>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowAddPurchaseModal(true);
            }}
            className="text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 hover:bg-blue-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            title="Record Purchase"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Record Purchase</span>
          </button>
        </div>

        {/* SEARCH PRODUCT INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0084ff] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* TABLE COLUMN HEADER BAR (Soft mint green bar matching reference image) */}
        <div className="bg-[#dcf4e5] dark:bg-emerald-950/60 text-[#065f46] dark:text-emerald-300 dark:border dark:border-emerald-900/50 text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between select-none shadow-2xs">
          <span className="w-8 text-left">No.</span>
          <span className="flex-1 text-left pl-2">Product Name</span>
          <span className="w-20 sm:w-24 text-center">Quantity</span>
          <span className="w-20 sm:w-24 text-right">Unit Price</span>
          <span className="w-20 sm:w-24 text-right">Amount</span>
        </div>

        {/* TABLE ROWS / EMPTY STATE */}
        {filteredProducts.length === 0 ? (
          /* EMPTY STATE (Open green box illustration matching reference image) */
          <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-2">
              <OpenBoxGraphic className="w-28 h-28 sm:w-32 sm:h-32" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
              No purchase found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              There are no purchases for the selected date.
            </p>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowAddPurchaseModal(true);
              }}
              className="mt-5 px-4 py-2 rounded-xl bg-[#0084ff] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Purchase for {dateDisplayLabel}</span>
            </button>
          </div>
        ) : (
          /* POPULATED ROWS */
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden shadow-2xs">
            {filteredProducts.map((item, idx) => (
              <div
                key={item.id || idx}
                className="px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
              >
                <span className="w-8 text-left font-bold text-slate-400 dark:text-slate-500">
                  {idx + 1}
                </span>
                <span className="flex-1 text-left pl-2 font-bold text-slate-800 dark:text-slate-100">
                  {item.productName}
                </span>
                <span className="w-20 sm:w-24 text-center font-semibold text-slate-700 dark:text-slate-300">
                  {item.quantity} pcs
                </span>
                <span className="w-20 sm:w-24 text-right font-semibold text-slate-700 dark:text-slate-300">
                  ₹{item.unitPrice}
                </span>
                <span className="w-20 sm:w-24 text-right font-black text-slate-900 dark:text-white">
                  ₹{item.totalAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM SUMMARY BAR (Grand Total matching reference image) */}
        <div className="bg-[#e7f7ed] dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <span className="font-black text-sm sm:text-base text-slate-900 dark:text-emerald-200">
            Grand Total
          </span>
          <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>

      </main>

      {/* ==================== 3. CUSTOM DATE PICKER MODAL ==================== */}
      {showCustomDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0084ff]" />
                Select Specific Date
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomDatePicker(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Choose Calendar Date (IST)
              </label>
              <input
                type="date"
                max={purchaseService.getTodayISTDate()}
                value={customDateInput || selectedDate}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0084ff]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomDatePicker(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customDateInput) {
                    setSelectedDate(customDateInput);
                  }
                  setShowCustomDatePicker(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#0084ff] hover:bg-blue-600 text-white text-xs font-bold"
              >
                Apply Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. RECORD NEW PURCHASE MODAL ==================== */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                    Record New Purchase
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    Date: {dateDisplayLabel} ({selectedDate})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPurchaseModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4">
              
              {/* Supplier & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Wholesale Supplier Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0084ff]"
                    placeholder="e.g. Kolkata Wholesale Mart"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0084ff]"
                  >
                    <option value="Bank Transfer" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Bank Transfer / NEFT</option>
                    <option value="Cash" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Cash</option>
                    <option value="UPI" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">UPI</option>
                    <option value="Credit" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Credit (Supplier Khata)</option>
                  </select>
                </div>
              </div>

              {/* Quick Pick Products from Catalog */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Products to Procure:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  {standardGroceryCatalog.slice(0, 8).map((catItem) => (
                    <button
                      key={catItem.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        const wholesalePrice = Math.round(catItem.unitPrice * 0.85);
                        setPurchaseLineItems([
                          ...purchaseLineItems,
                          { productName: catItem.name, quantity: 5, unitPrice: wholesalePrice },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#0084ff]" />
                      <span>{catItem.name} (~₹{Math.round(catItem.unitPrice * 0.85)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Purchased Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-[#0084ff] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {purchaseLineItems.map((line, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={line.productName}
                      onChange={(e) => {
                        const updated = [...purchaseLineItems];
                        updated[idx].productName = e.target.value;
                        setPurchaseLineItems(updated);
                      }}
                      className="flex-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      required
                    />

                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => {
                          const updated = [...purchaseLineItems];
                          updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setPurchaseLineItems(updated);
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-center"
                        required
                      />
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="0"
                        placeholder="Cost"
                        value={line.unitPrice}
                        onChange={(e) => {
                          const updated = [...purchaseLineItems];
                          updated[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                          setPurchaseLineItems(updated);
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-right"
                        required
                      />
                    </div>

                    <span className="w-16 text-right font-black text-slate-900 dark:text-white">
                      ₹{(line.quantity * line.unitPrice).toLocaleString()}
                    </span>

                    {purchaseLineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-100">
                <span>Purchase Total Amount:</span>
                <span className="text-base font-black text-[#0084ff] dark:text-blue-400">
                  ₹{purchaseLineItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-xs text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0084ff] hover:bg-blue-600 font-bold text-xs text-white shadow-md shadow-blue-700/20"
                >
                  Confirm & Complete Purchase ✓
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
