import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  X,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  profitLossService,
  ProductProfitLossItem,
  DailyProfitLossSummary,
} from '../services/profitLossService';
import { salesService, formatDisplayDate } from '../services/salesService';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface TodaysProfitLossDetailsProps {
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

export const TodaysProfitLossDetails: React.FC<TodaysProfitLossDetailsProps> = ({ onBack, storeName }) => {
  const soundFx = useSoundEffects();

  // Current selected date in IST (YYYY-MM-DD), defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(() => salesService.getTodayISTDate());

  // Date selector dropdown state
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('');

  // Search product filter
  const [searchQuery, setSearchQuery] = useState('');

  // Trigger re-render whenever sales or purchases update
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleUpdates = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('sgrocery_sales_updated', handleUpdates);
    window.addEventListener('sgrocery_purchases_updated', handleUpdates);
    return () => {
      window.removeEventListener('sgrocery_sales_updated', handleUpdates);
      window.removeEventListener('sgrocery_purchases_updated', handleUpdates);
    };
  }, []);

  // Retrieve profit & loss summary for the selected date
  const summary: DailyProfitLossSummary = useMemo(() => {
    return profitLossService.getProfitLossForDate(selectedDate, storeName);
  }, [selectedDate, storeName, refreshTrigger]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return summary.products;
    const query = searchQuery.toLowerCase().trim();
    return summary.products.filter((p) => p.productName.toLowerCase().includes(query));
  }, [summary.products, searchQuery]);

  // Display label for the selected date (e.g. "Today", "Yesterday", "14 Nov 2026")
  const dateDisplayLabel = useMemo(() => {
    return formatDisplayDate(selectedDate);
  }, [selectedDate]);

  // Available historical dates
  const availableDates = useMemo(() => {
    return salesService.getAvailableDates();
  }, [refreshTrigger]);

  // Owner initial for avatar (defaults to "R" as in reference image)
  const ownerNameVal = localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  return (
    <div className="w-full min-h-screen bg-[#f7f8fa] text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white animate-fadeIn pb-16">
      
      {/* ==================== 1. TOP APP BAR ==================== */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Left: Back Arrow + Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onBack();
              }}
              className="p-1 -ml-1 rounded-xl hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.4]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Today's Profit/Loss
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
        
        {/* Row with Date Selector on the Right */}
        <div className="flex items-center justify-end relative">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowDateDropdown(!showDateDropdown);
            }}
            className="border border-emerald-300 bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            aria-label="Select Date"
          >
            <Calendar className="w-4 h-4 text-emerald-800 stroke-[2.2]" />
            <span>{dateDisplayLabel}</span>
            <ChevronDown className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
          </button>

          {/* Date Selector Popover Dropdown */}
          {showDateDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDateDropdown(false)}
              />
              <div className="absolute top-10 right-0 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-xs font-semibold animate-scaleUp">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select P&L Date (IST)
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
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setShowDateDropdown(false);
                      setShowCustomDatePicker(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>📅 Choose Other Date...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* METRIC CARD: Today's Profit/Loss (Matching reference image with soft purple card & 3-bar chart icon) */}
        <section className="bg-[#f8f2fe] border border-[#edd7ff] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#8a2be2] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs">
              {/* 3-Bar Chart Icon */}
              <div className="flex items-end gap-1 h-6">
                <span className="w-1.5 bg-white rounded-xs h-3"></span>
                <span className="w-1.5 bg-white rounded-xs h-6"></span>
                <span className="w-1.5 bg-white rounded-xs h-4.5"></span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                {selectedDate === salesService.getTodayISTDate() ? "Today's Profit/Loss" : `Profit/Loss (${dateDisplayLabel})`}
              </p>
              <p className={`text-2xl sm:text-3xl font-black leading-tight mt-0.5 truncate ${
                summary.netProfitLoss > 0
                  ? 'text-emerald-700'
                  : summary.netProfitLoss < 0
                  ? 'text-red-600'
                  : 'text-slate-900'
              }`}>
                {summary.netProfitLoss < 0 ? `-₹${Math.abs(summary.netProfitLoss).toLocaleString()}` : `₹${summary.netProfitLoss.toLocaleString()}`}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f3e8ff] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#8a2be2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </section>

        {/* PROFIT/LOSS DETAILS SECTION HEADER */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Profit/Loss Details
          </h2>
          {summary.products.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Profit: ₹{summary.totalProfit.toLocaleString()}
              </span>
              {summary.totalLoss > 0 && (
                <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                  Loss: ₹{summary.totalLoss.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SEARCH PRODUCT INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8a2be2] shadow-2xs"
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

        {/* TABLE COLUMN HEADER BAR (Matching reference image: No., Product Name, Purchase Price, Selling Price, Profit/Loss) */}
        <div className="bg-[#dcf4e5] text-[#065f46] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between select-none shadow-2xs">
          <span className="w-8 text-left">No.</span>
          <span className="flex-1 text-left pl-2">Product Name</span>
          <span className="w-24 sm:w-28 text-center sm:text-right">Purchase Price (₹)</span>
          <span className="w-24 sm:w-28 text-center sm:text-right">Selling Price (₹)</span>
          <span className="w-24 sm:w-28 text-right">Profit/Loss (₹)</span>
        </div>

        {/* TABLE ROWS / EMPTY STATE */}
        {filteredProducts.length === 0 ? (
          /* EMPTY STATE (Open green box illustration matching reference image) */
          <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-2">
              <OpenBoxGraphic className="w-28 h-28 sm:w-32 sm:h-32" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              No profit or loss found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              There is no profit or loss for the selected date.
            </p>
          </div>
        ) : (
          /* POPULATED ROWS */
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {filteredProducts.map((item, idx) => (
              <div
                key={item.id || idx}
                className="px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/80 transition-colors"
              >
                <span className="w-8 text-left font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div className="flex-1 text-left pl-2 min-w-0 pr-2">
                  <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Sold: {item.quantitySold} pcs</p>
                </div>
                <span className="w-24 sm:w-28 text-center sm:text-right font-semibold text-slate-700">
                  ₹{item.purchasePrice}
                </span>
                <span className="w-24 sm:w-28 text-center sm:text-right font-semibold text-slate-700">
                  ₹{item.sellingPrice}
                </span>
                <span className={`w-24 sm:w-28 text-right font-black ${
                  item.totalProfitLoss > 0
                    ? 'text-emerald-700'
                    : item.totalProfitLoss < 0
                    ? 'text-red-600'
                    : 'text-slate-900'
                }`}>
                  {item.totalProfitLoss > 0 ? `+₹${item.totalProfitLoss.toLocaleString()}` : item.totalProfitLoss < 0 ? `-₹${Math.abs(item.totalProfitLoss).toLocaleString()}` : '₹0'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM SUMMARY BAR (Total Profit/Loss matching reference image) */}
        <div className="bg-[#e7f7ed] border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="font-black text-sm sm:text-base text-slate-900">
              Total Profit/Loss
            </span>
            {summary.products.length > 0 && (
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {summary.isNetProfit ? '✓ Overall Net Profit achieved' : '⚠ Overall Net Loss incurred'}
              </p>
            )}
          </div>
          <span className={`font-black text-lg sm:text-xl ${
            summary.netProfitLoss > 0
              ? 'text-emerald-700'
              : summary.netProfitLoss < 0
              ? 'text-red-600'
              : 'text-slate-900'
          }`}>
            {summary.netProfitLoss < 0 ? `-₹${Math.abs(summary.netProfitLoss).toLocaleString()}` : `₹${summary.netProfitLoss.toLocaleString()}`}
          </span>
        </div>

      </main>

      {/* ==================== 3. CUSTOM DATE PICKER MODAL ==================== */}
      {showCustomDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8a2be2]" />
                Select Specific Date
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomDatePicker(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Choose Calendar Date (IST)
              </label>
              <input
                type="date"
                max={salesService.getTodayISTDate()}
                value={customDateInput || selectedDate}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8a2be2]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomDatePicker(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
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
                className="flex-1 py-2 rounded-xl bg-[#8a2be2] hover:bg-purple-700 text-white text-xs font-bold"
              >
                Apply Date
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
