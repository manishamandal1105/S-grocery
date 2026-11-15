import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Check,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  salesService,
  SoldProductItem,
  formatDisplayDate,
  getISTDateString,
  getYesterdayISTDate,
  standardGroceryCatalog,
  CatalogItem,
} from '../services/salesService';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface TodaysSalesDetailsProps {
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

export const TodaysSalesDetails: React.FC<TodaysSalesDetailsProps> = ({ onBack, storeName }) => {
  const soundFx = useSoundEffects();

  // Current selected date in IST (YYYY-MM-DD), defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(() => salesService.getTodayISTDate());
  
  // Date selector dropdown state
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('');

  // Search product filter
  const [searchQuery, setSearchQuery] = useState('');

  // Record New Sale Modal State
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [newSaleCustomer, setNewSaleCustomer] = useState('Walk-in Customer');
  const [newSalePaymentMode, setNewSalePaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');
  const [saleLineItems, setSaleLineItems] = useState<{ productName: string; quantity: number; unitPrice: number }[]>([
    { productName: 'Aashirvaad Atta (5kg)', quantity: 1, unitPrice: 210 },
  ]);

  // Trigger re-render whenever sales change
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleSalesUpdated = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('sgrocery_sales_updated', handleSalesUpdated);
    return () => window.removeEventListener('sgrocery_sales_updated', handleSalesUpdated);
  }, []);

  // Retrieve itemized products sold for the selected date
  const productsSold: SoldProductItem[] = useMemo(() => {
    return salesService.getItemizedProductsForDate(selectedDate, storeName);
  }, [selectedDate, storeName, refreshTrigger]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productsSold;
    const query = searchQuery.toLowerCase().trim();
    return productsSold.filter((p) => p.productName.toLowerCase().includes(query));
  }, [productsSold, searchQuery]);

  // Total sales amount for the selected date
  const totalSalesAmount = useMemo(() => {
    return salesService.getDateSalesTotal(selectedDate, storeName);
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
    return salesService.getAvailableDates();
  }, [refreshTrigger]);

  // Owner initial for avatar (defaults to "R" as in reference image)
  const ownerNameVal = localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  // Add line item in New Sale modal
  const handleAddLineItem = () => {
    setSaleLineItems([...saleLineItems, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  // Remove line item in New Sale modal
  const handleRemoveLineItem = (idx: number) => {
    if (saleLineItems.length > 1) {
      setSaleLineItems(saleLineItems.filter((_, i) => i !== idx));
    }
  };

  // Select catalog item for line item
  const handleSelectCatalogItem = (idx: number, catalogItem: CatalogItem) => {
    const updated = [...saleLineItems];
    updated[idx] = {
      productName: catalogItem.name,
      quantity: updated[idx].quantity || 1,
      unitPrice: catalogItem.unitPrice,
    };
    setSaleLineItems(updated);
  };

  // Save new sale transaction
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = saleLineItems.filter((item) => item.productName.trim() && item.quantity > 0 && item.unitPrice > 0);
    if (validItems.length === 0) {
      alert('Please enter at least one valid product with quantity and unit price.');
      return;
    }

    soundFx.playSuccess();
    salesService.recordCompletedSale({
      customerName: newSaleCustomer,
      paymentMode: newSalePaymentMode,
      items: validItems,
      date: selectedDate, // records for currently selected date
      storeName: storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store',
    });

    setShowAddSaleModal(false);
    // Reset form
    setSaleLineItems([{ productName: 'Tata Salt (1kg)', quantity: 1, unitPrice: 28 }]);
  };

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
              Today's Sale
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
                  Select Sales Date (IST)
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

        {/* METRIC CARD: Today's Sale */}
        <section className="bg-[#edf9f1] border border-[#d6f2df] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#00c569] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs">
              ₹
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                {selectedDate === salesService.getTodayISTDate() ? "Today's Sale" : `Sale (${dateDisplayLabel})`}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5 truncate">
                ₹{totalSalesAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#daf5e3] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#00c569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </section>

        {/* SALES DETAILS SECTION HEADER & QUICK SALE BUTTON */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Sales Details
          </h2>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowAddSaleModal(true);
            }}
            className="text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            title="Record New Sale"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Record Sale</span>
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c569] shadow-2xs"
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

        {/* TABLE COLUMN HEADER BAR (Soft mint green bar as in reference image) */}
        <div className="bg-[#dcf4e5] text-[#065f46] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between select-none shadow-2xs">
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
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              No sales found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              There are no sales for the selected date.
            </p>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowAddSaleModal(true);
              }}
              className="mt-5 px-4 py-2 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record First Sale for {dateDisplayLabel}</span>
            </button>
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
                <span className="flex-1 text-left pl-2 font-bold text-slate-800">
                  {item.productName}
                </span>
                <span className="w-20 sm:w-24 text-center font-semibold text-slate-700">
                  {item.quantity} pcs
                </span>
                <span className="w-20 sm:w-24 text-right font-semibold text-slate-700">
                  ₹{item.unitPrice}
                </span>
                <span className="w-20 sm:w-24 text-right font-black text-slate-900">
                  ₹{item.totalAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM SUMMARY BAR (Grand Total matching reference image) */}
        <div className="bg-[#e7f7ed] border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <span className="font-black text-sm sm:text-base text-slate-900">
            Grand Total
          </span>
          <span className="font-black text-lg sm:text-xl text-slate-900">
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>

      </main>

      {/* ==================== 3. CUSTOM DATE PICKER MODAL ==================== */}
      {showCustomDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#008744]" />
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
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00c569]"
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
                className="flex-1 py-2 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Apply Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. RECORD NEW SALE MODAL ==================== */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 leading-tight">
                    Record New Sale
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Date: {dateDisplayLabel} ({selectedDate})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddSaleModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4">
              
              {/* Customer & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newSaleCustomer}
                    onChange={(e) => setNewSaleCustomer(e.target.value)}
                    className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00c569]"
                    placeholder="Walk-in Customer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={newSalePaymentMode}
                    onChange={(e) => setNewSalePaymentMode(e.target.value as any)}
                    className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00c569]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Credit">Credit (Khata)</option>
                  </select>
                </div>
              </div>

              {/* Quick Pick Products from Catalog */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Quick Select Grocery Products:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {standardGroceryCatalog.slice(0, 8).map((catItem) => (
                    <button
                      key={catItem.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSaleLineItems([
                          ...saleLineItems,
                          { productName: catItem.name, quantity: 1, unitPrice: catItem.unitPrice },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#008744]" />
                      <span>{catItem.name} (₹{catItem.unitPrice})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Products in this Sale
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-[#008744] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {saleLineItems.map((line, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={line.productName}
                      onChange={(e) => {
                        const updated = [...saleLineItems];
                        updated[idx].productName = e.target.value;
                        setSaleLineItems(updated);
                      }}
                      className="flex-1 p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                      required
                    />

                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => {
                          const updated = [...saleLineItems];
                          updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setSaleLineItems(updated);
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-center"
                        required
                      />
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={line.unitPrice}
                        onChange={(e) => {
                          const updated = [...saleLineItems];
                          updated[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                          setSaleLineItems(updated);
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right"
                        required
                      />
                    </div>

                    <span className="w-16 text-right font-black text-slate-900">
                      ₹{(line.quantity * line.unitPrice).toLocaleString()}
                    </span>

                    {saleLineItems.length > 1 && (
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
              <div className="p-3 rounded-xl bg-[#e7f7ed] flex items-center justify-between font-bold text-xs">
                <span>Sale Total Amount:</span>
                <span className="text-base font-black text-[#008744]">
                  ₹{saleLineItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 font-bold text-xs text-white shadow-md shadow-emerald-700/20"
                >
                  Confirm & Complete Sale ✓
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
