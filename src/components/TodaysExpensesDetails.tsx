import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  X,
  Check,
  Plus,
  Trash2,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import {
  expenseService,
  ExpenseRowItem,
  DailyExpenseRecord,
  createDefaultBlankRows,
} from '../services/expenseService';
import { salesService, formatDisplayDate } from '../services/salesService';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface TodaysExpensesDetailsProps {
  onBack: () => void;
  storeName?: string;
}

// Crisp Vector Open Box Graphic in Orange matching the reference image empty state
const OpenOrangeBoxGraphic: React.FC<{ className?: string }> = ({ className = 'w-28 h-28' }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3 Radiating Orange Sparks on Top */}
    <line x1="60" y1="12" x2="60" y2="24" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="42" y1="16" x2="49" y2="26" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="78" y1="16" x2="71" y2="26" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />

    {/* Top Open Flaps */}
    {/* Left Flap */}
    <path d="M 28 50 L 44 34 L 60 48 L 44 64 Z" fill="#fff7ed" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Right Flap */}
    <path d="M 60 48 L 76 34 L 92 50 L 76 64 Z" fill="#ffedd5" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />

    {/* Box Body */}
    {/* Left Face */}
    <path d="M 32 58 L 60 74 L 60 102 L 32 86 Z" fill="#fff7ed" stroke="#f97316" strokeWidth="2.8" strokeLinejoin="round" />
    {/* Right Face */}
    <path d="M 60 74 L 88 58 L 88 86 L 60 102 Z" fill="#fed7aa" stroke="#f97316" strokeWidth="2.8" strokeLinejoin="round" />
    {/* Inner Box Top Cavity */}
    <path d="M 32 58 L 60 44 L 88 58 L 60 74 Z" fill="#ffedd5" stroke="#f97316" strokeWidth="2.8" strokeLinejoin="round" />
  </svg>
);

export const TodaysExpensesDetails: React.FC<TodaysExpensesDetailsProps> = ({ onBack, storeName }) => {
  const soundFx = useSoundEffects();

  // Current selected date in IST (YYYY-MM-DD), defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(() => expenseService.getTodayISTDate());

  // Date selector dropdown state
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for the editable numbered rows (1, 2, 3, 4, 5...)
  const [rows, setRows] = useState<ExpenseRowItem[]>(() => createDefaultBlankRows(5));

  // Auto-save debouncing
  const [showSavedToast, setShowSavedToast] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load record for currently selected date
  useEffect(() => {
    const record = expenseService.getDailyExpenses(selectedDate, storeName);
    if (record && record.rows && record.rows.length > 0) {
      setRows(record.rows);
    } else {
      // Create fresh default numbered rows starting at 1
      setRows(createDefaultBlankRows(5));
    }
  }, [selectedDate, storeName]);

  // Handle single row change and trigger debounced auto-save
  const handleRowChange = (index: number, field: 'name' | 'amount', value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      if (field === 'name') {
        updated[index] = { ...updated[index], name: value };
      } else {
        const parsed = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        updated[index] = { ...updated[index], amount: parsed };
      }

      // Schedule save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        expenseService.saveDailyExpenses(selectedDate, updated, storeName);
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }, 400);

      return updated;
    });
  };

  // Add one more numbered row
  const handleAddRow = () => {
    soundFx.playClick();
    setRows((prev) => {
      const updated = [...prev, { id: `exp_${Date.now()}_${prev.length + 1}`, name: '', amount: '' }];
      expenseService.saveDailyExpenses(selectedDate, updated, storeName);
      return updated;
    });
  };

  // Add 5 more numbered rows at once
  const handleAddFiveRows = () => {
    soundFx.playClick();
    setRows((prev) => {
      const newItems: ExpenseRowItem[] = Array.from({ length: 5 }, (_, i) => ({
        id: `exp_${Date.now()}_${prev.length + i + 1}`,
        name: '',
        amount: '',
      }));
      const updated = [...prev, ...newItems];
      expenseService.saveDailyExpenses(selectedDate, updated, storeName);
      return updated;
    });
  };

  // Delete / clear a single row
  const handleDeleteRow = (index: number) => {
    soundFx.playClick();
    setRows((prev) => {
      if (prev.length <= 1) {
        const cleared = [{ id: `exp_${Date.now()}_1`, name: '', amount: '' }];
        expenseService.saveDailyExpenses(selectedDate, cleared, storeName);
        return cleared;
      }
      const updated = prev.filter((_, i) => i !== index);
      expenseService.saveDailyExpenses(selectedDate, updated, storeName);
      return updated;
    });
  };

  // Clear all entered expenses for this date
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all expenses for this date?')) {
      soundFx.playClick();
      const resetRows = createDefaultBlankRows(5);
      setRows(resetRows);
      expenseService.saveDailyExpenses(selectedDate, resetRows, storeName);
    }
  };

  // Total expense calculation (sum of non-empty amounts)
  const totalExpense = useMemo(() => {
    return rows.reduce((sum, row) => {
      if (typeof row.amount === 'number' && !isNaN(row.amount)) {
        return sum + row.amount;
      }
      return sum;
    }, 0);
  }, [rows]);

  // Filtered rows for search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return rows.map((row, originalIndex) => ({ row, originalIndex }));
    }
    const q = searchQuery.toLowerCase().trim();
    return rows
      .map((row, originalIndex) => ({ row, originalIndex }))
      .filter(({ row }) => row.name.toLowerCase().includes(q));
  }, [rows, searchQuery]);

  // Display label for the selected date (e.g. "Today", "Yesterday", "14 Nov 2026")
  const dateDisplayLabel = useMemo(() => {
    return formatDisplayDate(selectedDate);
  }, [selectedDate]);

  // Available historical dates
  const availableDates = useMemo(() => {
    return expenseService.getAvailableDates(storeName);
  }, [storeName, selectedDate]);

  // Owner initial for avatar (defaults to "R" as in reference image)
  const ownerNameVal = localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  return (
    <div className="w-full min-h-screen bg-[#f7f8fa] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white animate-fadeIn pb-16">
      
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
              Today's Expenses
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
        
        {/* Row with Date Selector on the Right (Matching reference design) */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            {showSavedToast && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md animate-fadeIn">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-saved
              </span>
            )}
          </div>

          <div className="relative">
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
                    Select Expenses Date (IST)
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
        </div>

        {/* METRIC CARD: Today's Expenses (Matching reference image with soft orange card & wallet icon) */}
        <section className="bg-[#fff6ec] dark:bg-orange-950/40 border border-[#fde4cb] dark:border-orange-900/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ff8000] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-orange-300/80 leading-snug">
                {selectedDate === expenseService.getTodayISTDate() ? "Today's Expenses" : `Expenses (${dateDisplayLabel})`}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                ₹{totalExpense.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#ffeed9] dark:bg-orange-900/60 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#ff8000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </section>

        {/* EXPENSES DETAILS SECTION HEADER */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Expenses Details
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {rows.filter(r => r.name || (typeof r.amount === 'number' && r.amount > 0)).length} entered
            </span>
            {totalExpense > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* SEARCH EXPENSE INPUT (Matching reference image) */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff8000] shadow-2xs"
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

        {/* TABLE COLUMN HEADER BAR (Matching clean styling: No., Expense Name, Amount (₹)) */}
        <div className="bg-[#ffedd5] dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-300 dark:border dark:border-orange-900/50 text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between select-none shadow-2xs">
          <span className="w-10 sm:w-12 text-center">No.</span>
          <span className="flex-1 text-left pl-2">Expense Name</span>
          <span className="w-28 sm:w-36 text-right pr-2">Amount (₹)</span>
          <span className="w-8 text-center"></span>
        </div>

        {/* NUMBERED ROWS (1, 2, 3, 4, 5...) OR SEARCH EMPTY STATE */}
        {filteredRows.length === 0 ? (
          /* Search Empty State */
          <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-2">
              <OpenOrangeBoxGraphic className="w-28 h-28 sm:w-32 sm:h-32" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
              No expenses found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              No expense matches "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* NUMBERED ROWS LIST (1, 2, 3, 4, 5...) */
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden shadow-2xs">
            {filteredRows.map(({ row, originalIndex }) => (
              <div
                key={row.id}
                className="px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 hover:bg-orange-50/20 dark:hover:bg-slate-750 transition-colors group"
              >
                {/* Numbered Row Column (1, 2, 3, 4, 5...) */}
                <div className="w-10 sm:w-12 text-center shrink-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-100/70 dark:bg-orange-950/70 text-[#ea580c] dark:text-orange-400 font-black text-xs sm:text-sm">
                    {originalIndex + 1}
                  </span>
                </div>

                {/* Expense Name Space / Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => handleRowChange(originalIndex, 'name', e.target.value)}
                    placeholder={`Expense ${originalIndex + 1} (e.g. Electricity, Staff Tea...)`}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50/60 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                {/* Amount (₹) Space / Input */}
                <div className="w-28 sm:w-36 shrink-0 relative">
                  <span className="absolute left-3 top-2 text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.amount}
                    onChange={(e) => handleRowChange(originalIndex, 'amount', e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-black text-right text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 bg-slate-50/60 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                {/* Clear / Delete Row Action */}
                <div className="w-8 shrink-0 flex items-center justify-center">
                  {(row.name || row.amount !== '') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(originalIndex)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUTTONS TO ADD MORE ROWS (Numbered dynamically) */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-700 hover:border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 hover:bg-orange-50 dark:hover:bg-orange-900/50 text-orange-800 dark:text-orange-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-orange-700 dark:text-orange-400 stroke-[2.5]" />
            <span>Add Row {rows.length + 1}</span>
          </button>

          <button
            type="button"
            onClick={handleAddFiveRows}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add +5 More Rows</span>
          </button>
        </div>

        {/* BOTTOM SUMMARY BAR (Total Expenses matching reference image) */}
        <div className="bg-[#fff1e0] dark:bg-orange-950/70 border border-orange-200/80 dark:border-orange-900/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-orange-200">
              Total Expenses
            </span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-orange-300/70 mt-0.5">
              {rows.filter(r => r.name || (typeof r.amount === 'number' && r.amount > 0)).length} expense items for {dateDisplayLabel}
            </p>
          </div>
          <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
            ₹{totalExpense.toLocaleString()}
          </span>
        </div>

      </main>

      {/* ==================== 3. CUSTOM DATE PICKER MODAL ==================== */}
      {showCustomDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff8000]" />
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
                max={expenseService.getTodayISTDate()}
                value={customDateInput || selectedDate}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ff8000]"
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
                className="flex-1 py-2 rounded-xl bg-[#ff8000] hover:bg-orange-600 text-white text-xs font-bold"
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
