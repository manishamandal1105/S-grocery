import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SaleTransaction, DailySalesTrend, SalesSummaryData } from '../types';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Bell,
  MoreVertical,
  TrendingUp,
  Calendar,
  Wallet,
  Banknote,
  Smartphone,
  CreditCard,
  Handshake,
  BarChart2,
  Receipt,
  FileText,
  Plus,
  Check,
  X,
  Edit2,
  Package,
  RotateCcw,
  Sparkles,
  Search,
  Printer,
  Download
} from 'lucide-react';

interface SalesDashboardProps {
  onBackToHome: () => void;
  storeName?: string;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onBackToHome, storeName }) => {
  const { t } = useLanguage();

  // Summary State (all initialized to 0 as requested, dynamic store name)
  const [summary, setSummary] = useState<SalesSummaryData>(() => {
    const saved = localStorage.getItem('sgrocery_sales_summary');
    const activeStore = storeName || localStorage.getItem('sgrocery_store_name') || '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          storeName: activeStore || (parsed.storeName && parsed.storeName !== 'Maa Laxmi Store' ? parsed.storeName : 'My Store'),
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      storeName: activeStore || 'My Store',
      todaySales: 0.0,
      totalTransactions: 0,
      estimatedProfit: 0.0,
      growthPercentage: 0,
      cashSales: 0.0,
      digitalSales: 0.0,
      creditSales: 0.0,
    };
  });

  // Daily Trend State (Mon-Sun, initialized to 0)
  const [dailyTrend, setDailyTrend] = useState<DailySalesTrend[]>(() => {
    const saved = localStorage.getItem('sgrocery_daily_trend');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { day: 'Mon', amount: 0 },
      { day: 'Tue', amount: 0 },
      { day: 'Wed', amount: 0 },
      { day: 'Thu', amount: 0 },
      { day: 'Fri', amount: 0 },
      { day: 'Sat', amount: 0 },
      { day: 'Sun', amount: 0 },
    ];
  });

  // Transactions (matching image layout, initialized to 0 amount)
  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('sgrocery_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: '1',
        time: '10:45 AM',
        invoiceNo: '#INV-1042',
        customerName: 'Walk-in Customer',
        amount: 0.0,
        paymentMode: 'Cash',
      },
      {
        id: '2',
        time: '09:37 AM',
        invoiceNo: '#INV-1041',
        customerName: 'John Doe',
        amount: 0.0,
        paymentMode: 'UPI',
      },
      {
        id: '3',
        time: '08:20 AM',
        invoiceNo: '#INV-1040',
        customerName: 'Walk-in Customer',
        amount: 0.0,
        paymentMode: 'Card',
      },
    ];
  });

  // Filter selection: Today, Yesterday, Last 7 Days, This Month, Last Month, Custom
  const [selectedFilter, setSelectedFilter] = useState<'Today' | 'Yesterday' | 'Last 7 Days' | 'This Month' | 'Last Month' | 'Custom'>('Today');

  // Modals & Menus
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditAllModal, setShowEditAllModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [showItemWiseModal, setShowItemWiseModal] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);

  // Direct Inline Editing state
  const [inlineEditingField, setInlineEditingField] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState<string>('');

  // New Transaction Form State
  const [newTx, setNewTx] = useState({
    customerName: 'Walk-in Customer',
    amount: '',
    paymentMode: 'Cash' as 'Cash' | 'UPI' | 'Card' | 'Credit',
    invoiceNo: `#INV-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  // Item-wise data
  const [groceryItems, setGroceryItems] = useState([
    { id: '1', name: 'Aashirvaad Atta (5kg)', category: 'Flour & Grains', qtySold: 0, rate: 210 },
    { id: '2', name: 'Fortune Mustard Oil (1L)', category: 'Edible Oils', qtySold: 0, rate: 145 },
    { id: '3', name: 'Tata Salt (1kg)', category: 'Spices & Essentials', qtySold: 0, rate: 28 },
    { id: '4', name: 'Madhur Pure Sugar (1kg)', category: 'Sugar & Sweeteners', qtySold: 0, rate: 44 },
    { id: '5', name: 'Amul Taaza Milk (500ml)', category: 'Dairy', qtySold: 0, rate: 27 },
    { id: '6', name: 'Basmati Rice (1kg)', category: 'Flour & Grains', qtySold: 0, rate: 95 },
  ]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('sgrocery_sales_summary', JSON.stringify(summary));
  }, [summary]);

  // Sync store name from prop or localStorage whenever it changes
  useEffect(() => {
    if (storeName && storeName.trim()) {
      setSummary((prev) => ({ ...prev, storeName: storeName.trim() }));
    }
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('sgrocery_daily_trend', JSON.stringify(dailyTrend));
  }, [dailyTrend]);

  useEffect(() => {
    localStorage.setItem('sgrocery_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Inline edit handler
  const startInlineEdit = (fieldKey: string, currentValue: number | string) => {
    setInlineEditingField(fieldKey);
    setInlineValue(String(currentValue));
  };

  const saveInlineEdit = () => {
    if (!inlineEditingField) return;
    const num = parseFloat(inlineValue) || 0;

    if (inlineEditingField.startsWith('tx-')) {
      const txId = inlineEditingField.replace('tx-', '');
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, amount: num } : t))
      );
    } else if (inlineEditingField.startsWith('day-')) {
      const dayName = inlineEditingField.replace('day-', '');
      setDailyTrend((prev) =>
        prev.map((d) => (d.day === dayName ? { ...d, amount: num } : d))
      );
    } else {
      setSummary((prev) => ({
        ...prev,
        [inlineEditingField]: num,
      }));
    }

    setInlineEditingField(null);
    setInlineValue('');
  };

  // Add new transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newTx.amount) || 0;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTransactionItem: SaleTransaction = {
      id: Date.now().toString(),
      time: timeStr,
      invoiceNo: newTx.invoiceNo,
      customerName: newTx.customerName || 'Walk-in Customer',
      amount: amountNum,
      paymentMode: newTx.paymentMode,
    };

    setTransactions((prev) => [newTransactionItem, ...prev]);

    // Update summary metrics
    setSummary((prev) => {
      const updatedTotal = prev.todaySales + amountNum;
      const updatedTxCount = prev.totalTransactions + 1;
      const profitRate = 0.25; // standard kirana margin ~25%
      const updatedProfit = prev.estimatedProfit + amountNum * profitRate;

      let updatedCash = prev.cashSales;
      let updatedDigital = prev.digitalSales;
      let updatedCredit = prev.creditSales;

      if (newTx.paymentMode === 'Cash') updatedCash += amountNum;
      else if (newTx.paymentMode === 'UPI' || newTx.paymentMode === 'Card') updatedDigital += amountNum;
      else if (newTx.paymentMode === 'Credit') updatedCredit += amountNum;

      return {
        ...prev,
        todaySales: updatedTotal,
        totalTransactions: updatedTxCount,
        estimatedProfit: Math.round(updatedProfit * 100) / 100,
        cashSales: updatedCash,
        digitalSales: updatedDigital,
        creditSales: updatedCredit,
        growthPercentage: prev.growthPercentage === 0 ? 12 : prev.growthPercentage + 2,
      };
    });

    // Update today's bar in trend
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = dayNames[now.getDay()];
    setDailyTrend((prev) =>
      prev.map((d) => (d.day === currentDayName ? { ...d, amount: d.amount + amountNum } : d))
    );

    // Reset Form
    setNewTx({
      customerName: 'Walk-in Customer',
      amount: '',
      paymentMode: 'Cash',
      invoiceNo: `#INV-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setShowAddModal(false);
  };

  // Reset all to 0
  const handleResetToZero = () => {
    if (window.confirm('Reset all sales dashboard values to 0?')) {
      setSummary({
        storeName: summary.storeName,
        todaySales: 0.0,
        totalTransactions: 0,
        estimatedProfit: 0.0,
        growthPercentage: 0,
        cashSales: 0.0,
        digitalSales: 0.0,
        creditSales: 0.0,
      });
      setTransactions((prev) =>
        prev.map((t) => ({ ...t, amount: 0.0 }))
      );
      setDailyTrend((prev) =>
        prev.map((d) => ({ ...d, amount: 0 }))
      );
      setShowMenuDropdown(false);
    }
  };

  // Download Excel / CSV
  const handleDownloadExcel = () => {
    const csvRows = [
      ['Date', new Date().toLocaleDateString()],
      ['Store', summary.storeName],
      [''],
      ['Summary Metric', 'Value'],
      ["Today's Total Sales", `₹${summary.todaySales.toFixed(2)}`],
      ['Total Transactions', summary.totalTransactions],
      ['Estimated Daily Profit', `₹${summary.estimatedProfit.toFixed(2)}`],
      ['Growth vs Yesterday', `${summary.growthPercentage}%`],
      ['Cash Sales', `₹${summary.cashSales.toFixed(2)}`],
      ['Digital / UPI / Card', `₹${summary.digitalSales.toFixed(2)}`],
      ['Credit / Khata', `₹${summary.creditSales.toFixed(2)}`],
      [''],
      ['Transactions'],
      ['Time', 'Invoice ID', 'Customer Name', 'Amount', 'Payment Mode'],
      ...transactions.map((t) => [t.time, t.invoiceNo, t.customerName, `₹${t.amount.toFixed(2)}`, t.paymentMode]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${summary.storeName.replace(/\s+/g, '_')}_sales_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF / Print
  const handleDownloadPDF = () => {
    window.print();
  };

  // Maximum value for chart scaling
  const maxTrendAmount = Math.max(1500, ...dailyTrend.map((d) => d.amount));

  return (
    <div className="w-full max-w-7xl mx-auto pb-32 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* 1. NEW SALES ACTION OPTION (Positioned above Sales Dashboard) */}
      <div className="flex items-center justify-between pb-3.5 pt-1">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#008744] hover:bg-[#06723b] text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          <span>New Sales</span>
        </button>

        <button
          type="button"
          onClick={() => setShowEditAllModal(true)}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* 2. SALES DASHBOARD HERO BANNER */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white p-5 sm:p-6 shadow-xl shadow-emerald-600/25 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          {/* Left Title & Icon */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <TrendingUp className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Sales Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Track your shop's performance
              </p>
            </div>
          </div>

          {/* Right Date Pill: "Today ∨" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const options: ('Today' | 'Yesterday' | 'Last 7 Days' | 'This Month')[] = ['Today', 'Yesterday', 'Last 7 Days', 'This Month'];
                const nextIdx = (options.indexOf(selectedFilter as any) + 1) % options.length;
                setSelectedFilter(options[nextIdx]);
              }}
              className="bg-white/95 hover:bg-white text-slate-800 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{selectedFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. TOP 3 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
        {/* CARD 1: Today's Total Sales */}
        <div
          onClick={() => startInlineEdit('todaySales', summary.todaySales)}
          className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer group relative overflow-hidden"
          title="Click to enter Today's Total Sales"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <span>₹</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">
                  Today's Total Sales
                </p>
                <Edit2 className="w-3 h-3 text-slate-300 dark:text-slate-500 group-hover:text-emerald-600 transition-colors" />
              </div>

              {inlineEditingField === 'todaySales' ? (
                <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveInlineEdit();
                      if (e.key === 'Escape') setInlineEditingField(null);
                    }}
                    className="w-full px-2 py-0.5 text-base font-extrabold border-2 border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
                  />
                  <button
                    onClick={saveInlineEdit}
                    className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  ₹{summary.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: Total Transactions */}
        <div
          onClick={() => startInlineEdit('totalTransactions', summary.totalTransactions)}
          className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group relative overflow-hidden"
          title="Click to enter Total Transactions"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">
                  Total Transactions
                </p>
                <Edit2 className="w-3 h-3 text-slate-300 dark:text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>

              {inlineEditingField === 'totalTransactions' ? (
                <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    step="1"
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveInlineEdit();
                      if (e.key === 'Escape') setInlineEditingField(null);
                    }}
                    className="w-full px-2 py-0.5 text-base font-extrabold border-2 border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
                  />
                  <button
                    onClick={saveInlineEdit}
                    className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {summary.totalTransactions}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CARD 3: Estimated Daily Profit */}
        <div
          onClick={() => startInlineEdit('estimatedProfit', summary.estimatedProfit)}
          className="bg-amber-50/70 dark:bg-slate-800 rounded-3xl p-4 border border-amber-200/70 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500 transition-all cursor-pointer group relative overflow-hidden"
          title="Click to enter Estimated Profit"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                  Estimated Daily Profit
                </p>
                <Edit2 className="w-3 h-3 text-amber-400 group-hover:text-amber-600 transition-colors" />
              </div>

              {inlineEditingField === 'estimatedProfit' ? (
                <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveInlineEdit();
                      if (e.key === 'Escape') setInlineEditingField(null);
                    }}
                    className="w-full px-2 py-0.5 text-base font-extrabold border-2 border-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
                  />
                  <button
                    onClick={saveInlineEdit}
                    className="p-1 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  ₹{summary.estimatedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. GROWTH INDICATOR PILL */}
      <div
        onClick={() => startInlineEdit('growthPercentage', summary.growthPercentage)}
        className="mt-3.5 bg-emerald-50/80 dark:bg-slate-800 hover:bg-emerald-100/70 dark:hover:bg-slate-750 border border-emerald-100/90 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {inlineEditingField === 'growthPercentage' ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                autoFocus
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveInlineEdit();
                  if (e.key === 'Escape') setInlineEditingField(null);
                }}
                className="w-16 px-1.5 py-0.5 border border-emerald-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
              <span>% vs yesterday</span>
              <button onClick={saveInlineEdit} className="p-0.5 bg-emerald-600 text-white rounded">
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span>+{summary.growthPercentage}% vs yesterday</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
      </div>

      {/* 5. PAYMENT MODE BREAKDOWN */}
      <div className="mt-3.5 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
              Payment Mode Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowEditAllModal(true)}
            className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Enter Amounts</span>
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700 gap-1.5 sm:gap-3 pt-1">
          {/* Cash Sales */}
          <div
            onClick={() => startInlineEdit('cashSales', summary.cashSales)}
            className="px-2 py-1 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
            title="Click to enter Cash Sales"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Banknote className="w-4 h-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                Cash Sales
              </span>
            </div>
            {inlineEditingField === 'cashSales' ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={inlineValue}
                  onChange={(e) => setInlineValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveInlineEdit();
                    if (e.key === 'Escape') setInlineEditingField(null);
                  }}
                  className="w-full px-1 py-0.5 text-xs font-bold border border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded"
                />
              </div>
            ) : (
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                ₹{summary.cashSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* UPI (Renamed from Digital / UPI / Card as requested) */}
          <div
            onClick={() => startInlineEdit('digitalSales', summary.digitalSales)}
            className="px-2 py-1 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
            title="Click to enter UPI Sales"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                UPI
              </span>
            </div>
            {inlineEditingField === 'digitalSales' ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={inlineValue}
                  onChange={(e) => setInlineValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveInlineEdit();
                    if (e.key === 'Escape') setInlineEditingField(null);
                  }}
                  className="w-full px-1 py-0.5 text-xs font-bold border border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded"
                />
              </div>
            ) : (
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                ₹{summary.digitalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Credit / Khata */}
          <div
            onClick={() => startInlineEdit('creditSales', summary.creditSales)}
            className="px-2 py-1 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
            title="Click to enter Credit Sales"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Handshake className="w-4 h-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                Credit / Khata
              </span>
            </div>
            {inlineEditingField === 'creditSales' ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={inlineValue}
                  onChange={(e) => setInlineValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveInlineEdit();
                    if (e.key === 'Escape') setInlineEditingField(null);
                  }}
                  className="w-full px-1 py-0.5 text-xs font-bold border border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded"
                />
              </div>
            ) : (
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                ₹{summary.creditSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6. DATE FILTER PILLS */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
        {(['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Last Month', 'Custom'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'Custom' && <Calendar className="w-3.5 h-3.5" />}
              <span>{filter}</span>
            </button>
          );
        })}
      </div>

      {/* 7. SALES TREND (BAR CHART) */}
      <div className="mt-4 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
              Sales Trend
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Sales</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const day = prompt('Enter Day (Mon, Tue, Wed, Thu, Fri, Sat, Sun):', 'Mon');
                if (day) {
                  const val = prompt(`Enter sales amount for ${day}:`, '0');
                  if (val !== null) {
                    const num = parseFloat(val) || 0;
                    setDailyTrend((prev) =>
                      prev.map((d) => (d.day.toLowerCase() === day.toLowerCase() ? { ...d, amount: num } : d))
                    );
                  }
                }
              }}
              className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Set Days
            </button>
          </div>
        </div>

        {/* Visual Chart Graphic */}
        <div className="pt-2 pb-2">
          <div className="flex gap-2 sm:gap-4">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-right pr-1 w-8 sm:w-10 h-36">
              <span>1,500</span>
              <span>1,000</span>
              <span>500</span>
              <span>0</span>
            </div>

            {/* Bars Area with Grid Lines */}
            <div className="flex-1 relative h-36 border-b border-slate-200 dark:border-slate-700">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800"></div>
                <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800"></div>
                <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800"></div>
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              {/* Day Bars */}
              <div className="absolute inset-0 flex items-end justify-between px-1 sm:px-3">
                {dailyTrend.map((item) => {
                  const heightPercent = maxTrendAmount > 0 ? Math.min(100, (item.amount / maxTrendAmount) * 100) : 0;
                  return (
                    <div
                      key={item.day}
                      onClick={() => {
                        const val = prompt(`Enter sales amount for ${item.day}:`, String(item.amount));
                        if (val !== null) {
                          const num = parseFloat(val) || 0;
                          setDailyTrend((prev) =>
                            prev.map((d) => (d.day === item.day ? { ...d, amount: num } : d))
                          );
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group flex-1 max-w-[36px]"
                      title={`${item.day}: ₹${item.amount.toFixed(2)} (Click to edit)`}
                    >
                      {/* Hover Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded shadow absolute -top-5 whitespace-nowrap z-20 pointer-events-none">
                        ₹{item.amount}
                      </div>

                      {/* Bar Fill */}
                      <div
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                          item.amount > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-700 group-hover:to-emerald-500'
                            : 'bg-emerald-200/40 dark:bg-emerald-950/40 hover:bg-emerald-300/60'
                        }`}
                        style={{ height: `${Math.max(4, heightPercent)}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* X-Axis Labels (Days) */}
          <div className="flex justify-between pl-9 sm:pl-12 pr-1 sm:pr-3 mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {dailyTrend.map((item) => (
              <span key={item.day} className="flex-1 text-center max-w-[36px]">
                {item.day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 8. TRANSACTION HISTORY */}
      <div className="mt-4 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
              Transaction History
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sale</span>
            </button>
            <button
              type="button"
              onClick={() => setShowViewAllModal(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transactions Table/List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => {
                const val = prompt(`Edit amount for ${tx.invoiceNo}:`, String(tx.amount));
                if (val !== null) {
                  const num = parseFloat(val) || 0;
                  setTransactions((prev) =>
                    prev.map((t) => (t.id === tx.id ? { ...t, amount: num } : t))
                  );
                }
              }}
              className="py-3 flex items-center justify-between gap-2 hover:bg-slate-50/80 dark:hover:bg-slate-750 rounded-xl px-2 transition-colors cursor-pointer group"
              title="Click to edit transaction amount"
            >
              {/* Left: Time & Invoice */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0">
                  <span className="text-xs select-none">🕒</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{tx.time}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">{tx.invoiceNo}</p>
                </div>
              </div>

              {/* Middle: Customer Name */}
              <div className="hidden sm:block text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                {tx.customerName}
              </div>

              {/* Right: Amount & Payment Mode Badge & Chevron */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                {/* Badge based on payment mode */}
                {tx.paymentMode === 'Cash' && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    <span>Cash</span>
                  </span>
                )}
                {tx.paymentMode === 'UPI' && (
                  <span className="px-2 py-0.5 rounded-lg bg-orange-100/80 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] font-bold flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>UPI</span>
                  </span>
                )}
                {tx.paymentMode === 'Card' && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    <span>Card</span>
                  </span>
                )}
                {tx.paymentMode === 'Credit' && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                    <Handshake className="w-3 h-3" />
                    <span>Khata</span>
                  </span>
                )}

                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. REPORTS & EXPORT */}
      <div className="mt-4 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
            Reports & Export
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="py-3 px-3.5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/30 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span className="bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              PDF
            </span>
            <span>Download PDF</span>
          </button>

          {/* Download Excel */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="py-3 px-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              X
            </span>
            <span>Download Excel</span>
          </button>

          {/* Item-wise Report */}
          <button
            type="button"
            onClick={() => setShowItemWiseModal(true)}
            className="py-3 px-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-800 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Item-wise Report</span>
          </button>
        </div>
      </div>

      {/* MODAL: ADD NEW SALE TRANSACTION */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Record New Sale Entry</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sale Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400 dark:text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="grocery-input pl-8 text-lg font-black dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Cash', 'UPI', 'Card', 'Credit'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setNewTx({ ...newTx, paymentMode: mode })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        newTx.paymentMode === mode
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Walk-in Customer / Rajesh"
                  value={newTx.customerName}
                  onChange={(e) => setNewTx({ ...newTx, customerName: e.target.value })}
                  className="grocery-input text-xs font-semibold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  Save & Update Sales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL EDIT ALL SUMMARY VALUES */}
      {showEditAllModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Enter Manual Dashboard Values</h3>
              </div>
              <button
                onClick={() => setShowEditAllModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Update any number directly. Set to 0 or enter your real store figures.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Today's Total Sales (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={summary.todaySales}
                  onChange={(e) => setSummary({ ...summary, todaySales: parseFloat(e.target.value) || 0 })}
                  className="grocery-input text-sm font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Transactions
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={summary.totalTransactions}
                    onChange={(e) => setSummary({ ...summary, totalTransactions: parseInt(e.target.value) || 0 })}
                    className="grocery-input text-sm font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Daily Profit (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={summary.estimatedProfit}
                    onChange={(e) => setSummary({ ...summary, estimatedProfit: parseFloat(e.target.value) || 0 })}
                    className="grocery-input text-sm font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cash Sales (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={summary.cashSales}
                    onChange={(e) => setSummary({ ...summary, cashSales: parseFloat(e.target.value) || 0 })}
                    className="grocery-input text-xs font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    UPI (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={summary.digitalSales}
                    onChange={(e) => setSummary({ ...summary, digitalSales: parseFloat(e.target.value) || 0 })}
                    className="grocery-input text-xs font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credit/Khata (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={summary.creditSales}
                    onChange={(e) => setSummary({ ...summary, creditSales: parseFloat(e.target.value) || 0 })}
                    className="grocery-input text-xs font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Growth % vs Yesterday
                </label>
                <input
                  type="number"
                  value={summary.growthPercentage}
                  onChange={(e) => setSummary({ ...summary, growthPercentage: parseFloat(e.target.value) || 0 })}
                  className="grocery-input text-xs font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setShowEditAllModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setShowEditAllModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Apply Values
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ITEM-WISE REPORT */}
      {showItemWiseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 dark:text-blue-400">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Item-wise Sales Breakdown</h3>
              </div>
              <button
                onClick={() => setShowItemWiseModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groceryItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">{item.category} • ₹{item.rate}/unit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Qty:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.qtySold}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value) || 0;
                        setGroceryItems((prev) =>
                          prev.map((g) => (g.id === item.id ? { ...g, qtySold: newQty } : g))
                        );
                      }}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center"
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white w-16 text-right">
                      ₹{(item.qtySold * item.rate).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Item Sales:</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                ₹{groceryItems.reduce((acc, curr) => acc + curr.qtySold * curr.rate, 0).toFixed(2)}
              </span>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowItemWiseModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold cursor-pointer hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ALL TRANSACTIONS */}
      {showViewAllModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">All Transactions ({transactions.length})</h3>
              </div>
              <button
                onClick={() => setShowViewAllModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{tx.invoiceNo}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{tx.customerName} • {tx.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">₹{tx.amount.toFixed(2)}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {tx.paymentMode}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowViewAllModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
