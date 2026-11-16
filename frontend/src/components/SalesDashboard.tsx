import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ShoppingCart,
  Receipt,
  Award,
  FileText,
  Plus,
  X,
  Check,
  RotateCcw,
  Clock,
  User,
  Phone,
  ArrowRight,
  TrendingUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  salesService,
  CompletedSaleRecord,
  SoldProductItem,
  standardGroceryCatalog,
} from '../services/salesService';
import { productService, ProductItem } from '../services/productService';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { NewSaleScreen } from './NewSaleScreen';
import { BillScreen } from './BillScreen';

interface SalesDashboardProps {
  onBackToHome?: () => void;
  storeName?: string;
}

// Crisp Vector Storefront Graphic matching reference design
const StorefrontLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="52" width="52" height="6" rx="2" fill="#cbd5e1" />
    <rect x="10" y="55" width="44" height="3" rx="1" fill="#94a3b8" />
    <rect x="9" y="22" width="46" height="31" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1.5" />
    <circle cx="8" cy="45" r="4.5" fill="#10b981" />
    <circle cx="56" cy="45" r="4.5" fill="#10b981" />
    <circle cx="9" cy="40" r="3" fill="#059669" />
    <circle cx="55" cy="40" r="3" fill="#059669" />
    <rect x="13" y="29" width="16" height="19" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
    <line x1="13" y1="38" x2="29" y2="38" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    <circle cx="17" cy="34" r="2" fill="#ef4444" />
    <circle cx="25" cy="34" r="2" fill="#f97316" />
    <circle cx="21" cy="44" r="2.2" fill="#10b981" />
    <rect x="33" y="27" width="18" height="25" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" />
    <rect x="36" y="30" width="12" height="10" rx="1.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
    <circle cx="47" cy="41" r="1.5" fill="#b45309" />
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
    <path
      d="M5 23 Q8 26 11 23 Q14 26 17 23 Q20 26 23 23 Q26 26 29 23 Q32 26 35 23 Q38 26 41 23 Q44 26 47 23 Q50 26 53 23 Q56 26 59 23"
      fill="none"
      stroke="#b91c1c"
      strokeWidth="1.8"
    />
    <rect x="8" y="8" width="48" height="6" rx="2" fill="#b91c1c" />
    <rect x="12" y="10" width="40" height="2" rx="1" fill="#fecaca" opacity="0.8" />
  </svg>
);

// Crisp Vector Receipt Graphic matching the reference empty state
const ReceiptGraphic: React.FC<{ className?: string }> = ({ className = 'w-28 h-28' }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3 Radiating Green Sparks */}
    <line x1="60" y1="12" x2="60" y2="24" stroke="#00c569" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="42" y1="16" x2="49" y2="26" stroke="#00c569" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="78" y1="16" x2="71" y2="26" stroke="#00c569" strokeWidth="3.5" strokeLinecap="round" />

    {/* Receipt Shadow & Backing */}
    <rect x="36" y="32" width="48" height="66" rx="4" fill="#e2f7ea" />

    {/* Receipt Paper Body with Zig-Zag Bottom */}
    <path
      d="M34 32 C34 30 36 28 38 28 H82 C84 28 86 30 86 32 V88 L80 84 L74 88 L68 84 L62 88 L56 84 L50 88 L44 84 L38 88 L34 84 Z"
      fill="#ffffff"
      stroke="#00c569"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />

    {/* Receipt Horizontal Print Lines */}
    <line x1="44" y1="42" x2="76" y2="42" stroke="#00c569" strokeWidth="3" strokeLinecap="round" />
    <line x1="44" y1="52" x2="72" y2="52" stroke="#00c569" strokeWidth="3" strokeLinecap="round" />
    <line x1="44" y1="62" x2="68" y2="62" stroke="#00c569" strokeWidth="3" strokeLinecap="round" />
    <line x1="44" y1="72" x2="56" y2="72" stroke="#00c569" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export type SalesFilterTab = 'all' | 'completed' | 'pending' | 'returned';

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onBackToHome, storeName }) => {
  const soundFx = useSoundEffects();

  const activeStore = storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';
  const ownerNameVal = localStorage.getItem('sgrocery_owner_name') || 'Rina';
  const ownerInitial = (ownerNameVal[0] || 'R').toUpperCase();

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Active Status Tab: 'all' | 'completed' | 'pending' | 'returned'
  const [activeTab, setActiveTab] = useState<SalesFilterTab>('all');

  // Trigger re-render whenever sales change
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleUpdates = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('sgrocery_sales_updated', handleUpdates);
    return () => window.removeEventListener('sgrocery_sales_updated', handleUpdates);
  }, []);

  // 1. Today's Sales Total (IST)
  const todaySalesTotal = useMemo(() => {
    return salesService.getTodaySalesTotal(activeStore);
  }, [activeStore, refreshTrigger]);

  // 2. Today's Total Bills Count (IST)
  const todayTotalBills = useMemo(() => {
    return salesService.getTodayTotalBillsCount(activeStore);
  }, [activeStore, refreshTrigger]);

  // 3. Top Selling Product (IST)
  const topSellingProduct = useMemo(() => {
    return salesService.getTodayTopSellingProduct(activeStore);
  }, [activeStore, refreshTrigger]);

  // Tab Notification Counts
  const tabCounts = useMemo(() => {
    return salesService.getSalesTabCounts(activeStore);
  }, [activeStore, refreshTrigger]);

  // Today's Sales List
  const todaySalesList: CompletedSaleRecord[] = useMemo(() => {
    const todayStr = salesService.getTodayISTDate();
    return salesService.getSalesForDate(todayStr, activeStore);
  }, [activeStore, refreshTrigger]);

  // Filtered Sales by Tab and Search
  const filteredSales = useMemo(() => {
    return todaySalesList.filter((sale) => {
      // Status filter
      if (activeTab === 'completed' && sale.status !== 'completed') return false;
      if (activeTab === 'pending' && sale.status !== 'pending') return false;
      if (activeTab === 'returned') {
        const hasReturns = sale.status === 'returned' || (sale.returns && sale.returns.length > 0);
        if (!hasReturns) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchInvoice = sale.invoiceNo.toLowerCase().includes(q);
        const matchCustomer = sale.customerName.toLowerCase().includes(q);
        const matchPhone = sale.customerPhone?.toLowerCase().includes(q) || false;
        const matchItems = sale.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchInvoice && !matchCustomer && !matchPhone && !matchItems) return false;
      }

      return true;
    });
  }, [todaySalesList, activeTab, searchQuery]);

  // ==================== MODALS STATE ====================
  // Dedicated Bill View State (null = Initial blank bill page, CompletedSaleRecord = populated bill)
  const [activeBillSale, setActiveBillSale] = useState<CompletedSaleRecord | null | undefined>(undefined);

  // New Sale Full Screen View State
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // New Sale Modal
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [newSaleCustomer, setNewSaleCustomer] = useState('Walk-in Customer');
  const [newSalePhone, setNewSalePhone] = useState('');
  const [newSalePaymentMode, setNewSalePaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');
  const [newSalePaidAmount, setNewSalePaidAmount] = useState<string>('');
  const [newSaleItems, setNewSaleItems] = useState<{ productName: string; quantity: number; unitPrice: number }[]>([
    { productName: '', quantity: 1, unitPrice: 0 },
  ]);

  // Collect Payment Modal (for Pending bills)
  const [collectPaymentSale, setCollectPaymentSale] = useState<CompletedSaleRecord | null>(null);
  const [collectAmountInput, setCollectAmountInput] = useState<string>('');

  // Return Item Modal
  const [returnSale, setReturnSale] = useState<CompletedSaleRecord | null>(null);
  const [returnItemName, setReturnItemName] = useState<string>('');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnRefundAmount, setReturnRefundAmount] = useState<string>('');
  const [returnReason, setReturnReason] = useState<string>('Customer Request');

  // Available inventory products for selection in New Sale
  const availableInventory = useMemo(() => {
    const fromInventory = productService.getAllProducts(activeStore);
    if (fromInventory.length > 0) {
      return fromInventory.map((p) => ({
        id: p.id,
        name: p.name,
        unitPrice: p.sellingPrice,
        category: p.category,
      }));
    }
    return standardGroceryCatalog;
  }, [activeStore, showNewSaleModal]);

  // Calculate Subtotal for New Sale
  const newSaleTotal = useMemo(() => {
    return newSaleItems.reduce((sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0), 0);
  }, [newSaleItems]);

  // Auto-set paid amount to total by default
  useEffect(() => {
    if (newSaleTotal > 0 && newSalePaidAmount === '') {
      setNewSalePaidAmount(newSaleTotal.toString());
    }
  }, [newSaleTotal]);

  // Handle item change in New Sale
  const handleItemChange = (idx: number, field: 'productName' | 'quantity' | 'unitPrice', value: any) => {
    setNewSaleItems((prev) => {
      const updated = [...prev];
      if (field === 'productName') {
        const matched = availableInventory.find((p) => p.name === value);
        updated[idx] = {
          ...updated[idx],
          productName: value,
          unitPrice: matched ? matched.unitPrice : updated[idx].unitPrice,
        };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
  };

  const handleAddItemRow = () => {
    soundFx.playClick();
    setNewSaleItems((prev) => [...prev, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    soundFx.playClick();
    setNewSaleItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  };

  // Submit New Sale
  const handleCreateSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = newSaleItems.filter((i) => i.productName.trim() && i.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one product with a valid name.');
      return;
    }

    const paid = newSalePaidAmount === '' ? newSaleTotal : Number(newSalePaidAmount);

    const record = salesService.recordCompletedSale({
      customerName: newSaleCustomer.trim() || 'Walk-in Customer',
      customerPhone: newSalePhone.trim(),
      paymentMode: newSalePaymentMode,
      paidAmount: paid,
      items: validItems,
      storeName: activeStore,
    });

    // Adjust product inventory stock
    validItems.forEach((item) => {
      productService.adjustStock(item.productName, -item.quantity, activeStore);
    });

    soundFx.playSuccess();
    setShowNewSaleModal(false);

    // Reset form
    setNewSaleCustomer('Walk-in Customer');
    setNewSalePhone('');
    setNewSalePaidAmount('');
    setNewSaleItems([{ productName: '', quantity: 1, unitPrice: 0 }]);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Submit Payment for Pending Bill
  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectPaymentSale) return;

    const amount = Number(collectAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    salesService.recordBillPayment(collectPaymentSale.invoiceNo, amount);
    soundFx.playSuccess();
    setCollectPaymentSale(null);
    setCollectAmountInput('');
    setRefreshTrigger((prev) => prev + 1);
  };

  // Submit Product Return
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnSale || !returnItemName) return;

    const qty = Number(returnQuantity) || 1;
    const refund = Number(returnRefundAmount) || 0;

    salesService.recordProductReturn(returnSale.invoiceNo, {
      productName: returnItemName,
      quantity: qty,
      refundAmount: refund,
      reason: returnReason,
    });

    // Restock product in inventory
    productService.adjustStock(returnItemName, qty, activeStore);

    soundFx.playSuccess();
    setReturnSale(null);
    setReturnItemName('');
    setReturnQuantity(1);
    setReturnRefundAmount('');
    setRefreshTrigger((prev) => prev + 1);
  };

  // ==================== DEDICATED BILL SCREEN (SINGLE-PAGE & DYNAMIC) ====================
  if (activeBillSale !== undefined) {
    return (
      <BillScreen
        saleRecord={activeBillSale}
        storeName={activeStore}
        onBack={() => {
          soundFx.playClick();
          setActiveBillSale(undefined);
        }}
        onNewSale={() => {
          soundFx.playClick();
          setActiveBillSale(undefined);
          setIsNewSaleOpen(true);
        }}
      />
    );
  }

  // ==================== FULL-SCREEN NEW SALE SCREEN (IMAGE 1 & 2) ====================
  if (isNewSaleOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f8faf9] overflow-y-auto">
        <NewSaleScreen
          storeName={activeStore}
          onBack={() => {
            soundFx.playClick();
            setIsNewSaleOpen(false);
          }}
          onSaleCompleted={() => {
            setIsNewSaleOpen(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn">
      
      {/* ==================== 1. SUBHEADER WITH GREEN CART ICON & TITLE ==================== */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#eaf7ee] flex items-center justify-center text-[#008744] shrink-0 shadow-2xs">
          <ShoppingCart className="w-6 h-6 stroke-[2.4]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Sales
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Manage your daily sales
          </p>
        </div>
      </div>

      {/* ==================== 2. PRIMARY PROMINENT GREEN BUTTON (+ NEW SALE) ==================== */}
      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsNewSaleOpen(true);
        }}
        className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#008744] hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
        <span>+ New Sale</span>
      </button>

      {/* ==================== 3. THREE METRICS CARDS ROW ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* CARD 1: TODAY'S SALES (Light Green Container, NO arrows or extra elements) */}
        <div className="bg-[#eaf7ee] border border-[#d2f0db] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#008744] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-xs">
            ₹
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              Today's Sales
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5 truncate">
              ₹{todaySalesTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* CARD 2: TOTAL BILLS (Light Blue Container) */}
        <div
          onClick={() => {
            soundFx.playClick();
            const latest = todaySalesList[0] || null;
            setActiveBillSale(latest);
          }}
          className="bg-[#eef6fe] border border-[#d6eaff] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs cursor-pointer hover:border-blue-300 transition-all group"
          title="Click to view Bill"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0084ff] group-hover:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              Total Bills
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5 truncate">
              {todayTotalBills}
            </p>
          </div>
        </div>

        {/* CARD 3: TOP SELLING PRODUCT (Light Peach/Orange Container) */}
        <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#ff8000] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              Top Selling Product
            </p>
            {topSellingProduct ? (
              <>
                <p className="text-sm sm:text-base font-black text-slate-900 leading-tight mt-0.5 truncate" title={topSellingProduct.name}>
                  {topSellingProduct.name}
                </p>
                <p className="text-[11px] font-bold text-orange-700 mt-0.5">
                  {topSellingProduct.quantitySold} pcs sold today
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5">
                  -
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  (No sales yet)
                </p>
              </>
            )}
          </div>
        </div>

      </section>

      {/* ==================== 4. SEARCH BAR ==================== */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search invoice or customer"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008744] shadow-2xs"
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

      {/* ==================== 5. FILTER TABS (ALL, COMPLETED, PENDING, RETURNED) ==================== */}
      <div className="grid grid-cols-4 gap-2">
        
        {/* Tab 1: All */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('all');
          }}
          className={`py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#dcf4e5] text-[#008744] shadow-2xs'
              : 'bg-[#f1f3f5] text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <span>All</span>
          {tabCounts.all > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'all' ? 'bg-[#008744] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {tabCounts.all}
            </span>
          )}
        </button>

        {/* Tab 2: Completed */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('completed');
          }}
          className={`py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#dcf4e5] text-[#008744] shadow-2xs'
              : 'bg-[#f1f3f5] text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <span>Completed</span>
          {tabCounts.completed > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'completed' ? 'bg-[#008744] text-white' : 'bg-emerald-200 text-emerald-800'
            }`}>
              {tabCounts.completed}
            </span>
          )}
        </button>

        {/* Tab 3: Pending */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('pending');
          }}
          className={`py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#dcf4e5] text-[#008744] shadow-2xs'
              : 'bg-[#f1f3f5] text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <span>Pending</span>
          {tabCounts.pending > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-800'
            }`}>
              {tabCounts.pending}
            </span>
          )}
        </button>

        {/* Tab 4: Returned */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('returned');
          }}
          className={`py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'returned'
              ? 'bg-[#dcf4e5] text-[#008744] shadow-2xs'
              : 'bg-[#f1f3f5] text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <span>Returned</span>
          {tabCounts.returned > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'returned' ? 'bg-rose-500 text-white' : 'bg-rose-200 text-rose-800'
            }`}>
              {tabCounts.returned}
            </span>
          )}
        </button>

      </div>

      {/* ==================== 6. RECENT SALES SECTION ==================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Recent Sales
          </h2>
          {filteredSales.length > 0 && (
            <span className="text-xs font-bold text-slate-500">
              {filteredSales.length} {filteredSales.length === 1 ? 'sale' : 'sales'} found
            </span>
          )}
        </div>

        {/* EMPTY STATE OR POPULATED LIST */}
        {filteredSales.length === 0 ? (
          /* EMPTY STATE (Matching reference image with green receipt graphic & sparks) */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="mb-2">
              <ReceiptGraphic className="w-28 h-28 sm:w-32 sm:h-32" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              No sales yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Create a new sale to get started.
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsNewSaleOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                + Create First Sale
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveBillSale(null); // Initial blank bill page preview
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Initial Bill Page
              </button>
            </div>
          </div>
        ) : (
          /* POPULATED RECENT SALES CARDS */
          <div className="space-y-2.5">
            {filteredSales.map((sale) => {
              const isCompleted = sale.status === 'completed';
              const isPending = sale.status === 'pending';
              const hasReturns = sale.returns && sale.returns.length > 0;

              return (
                <div
                  key={sale.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                >
                  {/* Top Row: Invoice ID + Date/Time + Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs sm:text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                        {sale.invoiceNo}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {sale.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                        </span>
                      )}

                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Due: ₹{sale.dueAmount}
                        </span>
                      )}

                      {hasReturns && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                          <RotateCcw className="w-3 h-3 text-rose-600" /> Returned ({sale.returns?.length})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Customer + Items List */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {sale.customerName}
                        {sale.customerPhone && (
                          <span className="text-[11px] text-slate-400 font-normal">({sale.customerPhone})</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        {sale.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}
                      </p>
                    </div>

                    {/* Amount Block */}
                    <div className="text-right shrink-0">
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        ₹{sale.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        Paid: ₹{sale.paidAmount} • {sale.paymentMode}
                      </p>
                    </div>
                  </div>

                  {/* Returns Details if any */}
                  {hasReturns && (
                    <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100 text-[11px] space-y-1">
                      {sale.returns?.map((ret) => (
                        <div key={ret.id} className="flex items-center justify-between text-rose-800">
                          <span>
                            ↩ Returned: {ret.quantity} × {ret.productName} ({ret.reason})
                          </span>
                          <span className="font-bold">Refund: -₹{ret.refundAmount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Row Actions */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setActiveBillSale(sale);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#008744] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Bill</span>
                    </button>

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setCollectPaymentSale(sale);
                          setCollectAmountInput(sale.dueAmount.toString());
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Collect Due (₹{sale.dueAmount})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setReturnSale(sale);
                        setReturnItemName(sale.items[0]?.productName || '');
                        setReturnRefundAmount(sale.items[0]?.unitPrice.toString() || '0');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return Item</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ==================== 7. NEW SALE MODAL ==================== */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#008744]" />
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Create New Sale
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSaleModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSaleSubmit} className="space-y-4">
              
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={newSaleCustomer}
                    onChange={(e) => setNewSaleCustomer(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008744]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newSalePhone}
                    onChange={(e) => setNewSalePhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008744]"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Products Sold</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#008744] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>

                {newSaleItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          list="catalog-suggestions"
                          value={item.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                          placeholder="Select or type product name..."
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#008744]"
                        />
                      </div>
                      {newSaleItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unit Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Total (₹)</label>
                        <div className="px-2 py-1 text-xs font-black text-slate-800 bg-slate-100 rounded-lg">
                          ₹{(item.quantity * item.unitPrice).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <datalist id="catalog-suggestions">
                  {availableInventory.map((p) => (
                    <option key={p.id} value={p.name}>
                      ₹{p.unitPrice} • {p.category}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Total & Payment Mode */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-sm font-black">
                  <span className="text-slate-800">Total Bill Amount:</span>
                  <span className="text-lg text-[#008744]">₹{newSaleTotal.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Mode</label>
                    <select
                      value={newSalePaymentMode}
                      onChange={(e) => setNewSalePaymentMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / QR</option>
                      <option value="Card">Card</option>
                      <option value="Credit">Credit / Khata</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Amount Paid (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder={newSaleTotal.toString()}
                      value={newSalePaidAmount}
                      onChange={(e) => setNewSalePaidAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between pt-1">
                  <span>Bill Status:</span>
                  {Number(newSalePaidAmount || newSaleTotal) >= newSaleTotal ? (
                    <span className="text-emerald-700 font-bold">✓ Full Payment (Completed)</span>
                  ) : (
                    <span className="text-amber-700 font-bold">
                      ⚠ Partial (Pending Due: ₹{newSaleTotal - Number(newSalePaidAmount || 0)})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Complete & Generate Invoice
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================== 8. COLLECT DUE MODAL ==================== */}
      {collectPaymentSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">
                Collect Payment: {collectPaymentSale.invoiceNo}
              </h3>
              <button
                type="button"
                onClick={() => setCollectPaymentSale(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 text-xs space-y-1">
              <p className="font-bold text-amber-900">Customer: {collectPaymentSale.customerName}</p>
              <p className="text-amber-700">Total Bill: ₹{collectPaymentSale.totalAmount} • Current Due: ₹{collectPaymentSale.dueAmount}</p>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Payment Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={collectPaymentSale.dueAmount}
                  required
                  value={collectAmountInput}
                  onChange={(e) => setCollectAmountInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#008744]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCollectPaymentSale(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#008744] text-white text-xs font-bold"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 9. RETURN ITEM MODAL ==================== */}
      {returnSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">
                Return Product: {returnSale.invoiceNo}
              </h3>
              <button
                type="button"
                onClick={() => setReturnSale(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Select Item to Return</label>
                <select
                  value={returnItemName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setReturnItemName(name);
                    const matched = returnSale.items.find((i) => i.productName === name);
                    if (matched) {
                      setReturnRefundAmount((matched.unitPrice * (returnQuantity || 1)).toString());
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  {returnSale.items.map((i) => (
                    <option key={i.id} value={i.productName}>
                      {i.productName} ({i.quantity} bought @ ₹{i.unitPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Quantity Returned</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQuantity}
                    onChange={(e) => {
                      const q = Number(e.target.value) || 1;
                      setReturnQuantity(q);
                      const matched = returnSale.items.find((i) => i.productName === returnItemName);
                      if (matched) {
                        setReturnRefundAmount((matched.unitPrice * q).toString());
                      }
                    }}
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Refund Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={returnRefundAmount}
                    onChange={(e) => setReturnRefundAmount(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-black text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Reason for Return</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Defective, Wrong item, Changed mind"
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReturnSale(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Return & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
