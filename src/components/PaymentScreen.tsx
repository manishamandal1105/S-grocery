import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Phone,
  Banknote,
  QrCode,
  MoreHorizontal,
  Tag,
  Check,
  CheckCircle,
  Printer,
  ChevronRight,
  Clock,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { salesService, CompletedSaleRecord } from '../services/salesService';
import { productService } from '../services/productService';
import { CartItem } from './NewSaleScreen';
import { BillScreen } from './BillScreen';

interface PaymentScreenProps {
  storeName: string;
  totalBillAmount: number;
  cartItems: CartItem[];
  initialCustomerName?: string;
  initialCustomerPhone?: string;
  onBack: () => void;
  onPaymentSuccess: (record: CompletedSaleRecord) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  storeName,
  totalBillAmount,
  cartItems,
  initialCustomerName = 'Walk-in Customer',
  initialCustomerPhone = '',
  onBack,
  onPaymentSuccess,
}) => {
  const soundFx = useSoundEffects();
  const activeStore = storeName || 'Maa Laxmi Store';

  // 1. Customer State
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);

  // 2. Payment Method State: 'Cash' | 'UPI' | 'Other'
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Other'>('Cash');

  // 3. Discount State
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountPercentInput, setDiscountPercentInput] = useState<string>('10');
  const [discountAmountInput, setDiscountAmountInput] = useState<string>('0.00');

  // Calculate Discount Value
  const discountValue = useMemo(() => {
    if (totalBillAmount <= 0) return 0;
    if (discountType === 'percent') {
      const pct = parseFloat(discountPercentInput) || 0;
      return Math.round(((totalBillAmount * pct) / 100) * 100) / 100;
    } else {
      const amt = parseFloat(discountAmountInput) || 0;
      return Math.min(totalBillAmount, Math.round(amt * 100) / 100);
    }
  }, [totalBillAmount, discountType, discountPercentInput, discountAmountInput]);

  // Calculate Payable Amount
  const payableAmount = useMemo(() => {
    return Math.max(0, Math.round((totalBillAmount - discountValue) * 100) / 100);
  }, [totalBillAmount, discountValue]);

  // 4. Amount Received State
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('300');

  // Auto-set initial amount received to a logical rounded cash figure or payable amount
  useEffect(() => {
    if (payableAmount > 0) {
      if (paymentMethod === 'Cash') {
        const rounded = Math.ceil(payableAmount / 50) * 50;
        setAmountReceivedInput(rounded >= payableAmount ? rounded.toString() : payableAmount.toFixed(0));
      } else {
        setAmountReceivedInput(payableAmount.toFixed(2));
      }
    } else {
      setAmountReceivedInput('0');
    }
  }, [payableAmount, paymentMethod]);

  const amountReceived = useMemo(() => {
    return parseFloat(amountReceivedInput) || 0;
  }, [amountReceivedInput]);

  // Calculate Change Return (For Cash)
  const changeReturn = useMemo(() => {
    if (paymentMethod === 'Other') return 0;
    return Math.max(0, Math.round((amountReceived - payableAmount) * 100) / 100);
  }, [amountReceived, payableAmount, paymentMethod]);

  // Outstanding Due (For Other/Credit)
  const outstandingDue = useMemo(() => {
    if (paymentMethod !== 'Other') return 0;
    return Math.max(0, Math.round((payableAmount - amountReceived) * 100) / 100);
  }, [amountReceived, payableAmount, paymentMethod]);

  // 5. Separate UPI QR Payment Page State
  const [showUpiScreen, setShowUpiScreen] = useState(false);

  // 6. Automatic Generated Bill Page State (Navigate immediately upon payment)
  const [activeBillRecord, setActiveBillRecord] = useState<CompletedSaleRecord | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Execute Final Payment Recording & Immediately Generate Bill
  const executePayment = (confirmedMode: 'Cash' | 'UPI' | 'Other') => {
    if (cartItems.length === 0) {
      showToast('No products in cart.');
      return;
    }

    soundFx.playSuccess();

    // Map cart items with formatted unit and price displays
    const items = cartItems.map((c) => ({
      productName: c.name,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      totalAmount: c.lineTotal || (c.quantity * c.unitPrice),
      quantityDisplay: c.weightDisplay || (c.unitType === 'loose' ? `${c.quantity} kg` : `${Math.round(c.quantity)} Pack`),
      unitPriceDisplay: c.unitPriceDisplay || `₹${c.unitPrice.toFixed(2)}`,
    }));

    let modeToRecord: 'Cash' | 'UPI' | 'Card' | 'Credit';
    let paidAmountToRecord: number;

    if (confirmedMode === 'Cash') {
      modeToRecord = 'Cash';
      paidAmountToRecord = payableAmount;
    } else if (confirmedMode === 'UPI') {
      modeToRecord = 'UPI';
      paidAmountToRecord = payableAmount;
    } else {
      modeToRecord = 'Credit';
      paidAmountToRecord = Math.min(payableAmount, amountReceived);
    }

    // Record via sales service with complete billing details
    const record = salesService.recordCompletedSale({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || undefined,
      paymentMode: modeToRecord,
      items,
      paidAmount: paidAmountToRecord,
      subtotal: totalBillAmount,
      discountAmount: discountValue,
      discountDisplay: discountType === 'percent' ? `${discountPercentInput || 0}%` : `₹${discountValue.toFixed(2)}`,
      amountReceived: confirmedMode === 'Cash' ? amountReceived : payableAmount,
      changeReturn: confirmedMode === 'Cash' ? changeReturn : 0,
      storeName: activeStore,
    });

    // Deduct stock in productService
    items.forEach((item) => {
      productService.adjustStock(item.productName, -item.quantity, activeStore);
    });

    // Automatically navigate immediately to the generated bill page
    setActiveBillRecord(record);
  };

  // Complete Payment Button Click Handler
  const handleCompletePaymentClick = () => {
    soundFx.playClick();

    if (paymentMethod === 'UPI') {
      setShowUpiScreen(true);
      return;
    }

    executePayment(paymentMethod);
  };

  // ==================== AUTOMATIC GENERATED BILL PAGE ====================
  // Navigates immediately upon payment completion without extra clicks
  if (activeBillRecord) {
    return (
      <BillScreen
        saleRecord={activeBillRecord}
        storeName={activeStore}
        onBack={() => {
          onPaymentSuccess(activeBillRecord);
        }}
        onNewSale={() => {
          onPaymentSuccess(activeBillRecord);
        }}
      />
    );
  }

  // ==================== SEPARATE FULL-SCREEN UPI PAYMENT PAGE ====================
  if (showUpiScreen) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen min-h-[100dvh] w-full bg-[#f8faf9] flex flex-col justify-between text-slate-800 animate-fadeIn overflow-y-auto pb-20 sm:pb-28">
        
        {/* Top App Bar */}
        <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowUpiScreen(false);
              }}
              className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs sm:text-sm"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
              <span>Back to Payment</span>
            </button>

            <span className="font-extrabold text-sm sm:text-base text-slate-900">
              UPI QR Payment
            </span>

            <div className="w-8" />
          </div>
        </header>

        {/* UPI Main Workspace */}
        <main className="w-full flex-1 max-w-md mx-auto px-4 py-6 space-y-5">
          
          {/* Amount Card */}
          <div className="bg-[#008744] text-white rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
            <p className="text-xs sm:text-sm font-semibold text-emerald-100 uppercase tracking-wider">
              Scan & Pay via Any UPI App
            </p>
            <h2 className="text-3xl sm:text-4xl font-black mt-1">
              ₹{payableAmount.toFixed(2)}
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Paying to: <span className="font-bold text-white">{activeStore}</span>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 shadow-md text-center space-y-4">
            
            <div className="relative w-56 h-56 mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <rect x="10" y="10" width="50" height="50" rx="8" fill="#008744" />
                <rect x="20" y="20" width="30" height="30" rx="4" fill="#ffffff" />
                <rect x="26" y="26" width="18" height="18" rx="2" fill="#008744" />

                <rect x="140" y="10" width="50" height="50" rx="8" fill="#008744" />
                <rect x="150" y="20" width="30" height="30" rx="4" fill="#ffffff" />
                <rect x="156" y="26" width="18" height="18" rx="2" fill="#008744" />

                <rect x="10" y="140" width="50" height="50" rx="8" fill="#008744" />
                <rect x="20" y="150" width="30" height="30" rx="4" fill="#ffffff" />
                <rect x="26" y="156" width="18" height="18" rx="2" fill="#008744" />

                <g fill="#1e293b">
                  <rect x="70" y="15" width="12" height="12" rx="2" />
                  <rect x="90" y="15" width="12" height="12" rx="2" />
                  <rect x="115" y="15" width="12" height="12" rx="2" />
                  <rect x="70" y="35" width="12" height="12" rx="2" />
                  <rect x="100" y="35" width="24" height="12" rx="2" />
                  <rect x="15" y="70" width="24" height="12" rx="2" />
                  <rect x="45" y="70" width="12" height="12" rx="2" />
                  <rect x="70" y="65" width="16" height="16" rx="3" fill="#008744" />
                  <rect x="95" y="65" width="16" height="16" rx="3" fill="#008744" />
                  <rect x="120" y="65" width="16" height="16" rx="3" fill="#008744" />
                  <rect x="150" y="75" width="14" height="14" rx="2" />
                  <rect x="175" y="75" width="14" height="14" rx="2" />
                  <rect x="70" y="95" width="12" height="12" rx="2" />
                  <rect x="90" y="95" width="12" height="12" rx="2" />
                  <rect x="110" y="95" width="12" height="12" rx="2" />
                  <rect x="15" y="95" width="12" height="12" rx="2" />
                  <rect x="35" y="95" width="12" height="12" rx="2" />
                  <rect x="145" y="105" width="20" height="12" rx="2" />
                  <rect x="170" y="105" width="15" height="12" rx="2" />
                  <rect x="70" y="125" width="18" height="18" rx="2" />
                  <rect x="100" y="125" width="18" height="18" rx="2" />
                  <rect x="130" y="125" width="18" height="18" rx="2" />
                  <rect x="70" y="155" width="14" height="14" rx="2" />
                  <rect x="95" y="155" width="14" height="14" rx="2" />
                  <rect x="120" y="155" width="14" height="14" rx="2" />
                  <rect x="150" y="155" width="14" height="14" rx="2" />
                  <rect x="175" y="155" width="14" height="14" rx="2" />
                  <rect x="150" y="175" width="35" height="14" rx="2" />
                </g>

                <rect x="78" y="78" width="44" height="44" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                <path d="M88 100 L96 90 L104 100 Z" fill="#008744" />
                <path d="M100 108 L108 98 L116 108 Z" fill="#f97316" />
              </svg>
            </div>

            {/* Supported UPI Apps */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500">Supported UPI Apps:</p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-black text-slate-700">Google Pay</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-black">PhonePe</span>
                <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-[11px] font-black">Paytm</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-black">BHIM UPI</span>
              </div>
            </div>

            {/* Live Status indicator */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#008744]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Waiting for customer to scan & pay...</span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                executePayment('UPI');
              }}
              className="w-full py-4 px-6 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
              <span>Confirm UPI Payment Received</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUpiScreen(false)}
              className="w-full py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancel / Choose Another Method
            </button>
          </div>

        </main>
      </div>
    );
  }

  // ==================== PRIMARY FULL-SCREEN PAYMENT PAGE ====================
  return (
    <div className="fixed inset-0 z-50 min-h-screen min-h-[100dvh] w-full bg-[#f8faf9] flex flex-col text-slate-800 animate-fadeIn overflow-y-auto pb-16 sm:pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================== 1. TOP APP BAR ==================== */}
      <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="w-full max-w-2xl sm:max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
            <span className="font-extrabold text-sm sm:text-base text-slate-900">
              Payment
            </span>
          </button>
        </div>
      </header>

      {/* ==================== 2. MAIN WORKSPACE (VERTICALLY ARRANGED) ==================== */}
      <main className="w-full flex-1 max-w-2xl sm:max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4 sm:space-y-5">
        
        {/* Compact Total Amount Display Box */}
        <div className="w-full bg-[#008744] text-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-black tracking-wider text-emerald-100 uppercase block">
              TOTAL AMOUNT
            </span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white block">
              ₹{totalBillAmount > 0 ? (totalBillAmount % 1 === 0 ? totalBillAmount.toFixed(0) : totalBillAmount.toFixed(2)) : '0'}
            </span>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
            <ShoppingBag className="w-6 h-6 stroke-[2.4]" />
          </div>
        </div>
            
            {/* Customer (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Customer (Optional)
              </label>

              <div
                onClick={() => {
                  soundFx.playClick();
                  setShowCustomerEdit(!showCustomerEdit);
                }}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-[#008744] flex items-center justify-center shrink-0 transition-colors">
                    <User className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {customerName || 'Walk-in Customer'}
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 transition-transform" />
              </div>

              {/* Expandable Customer Input Details */}
              {showCustomerEdit && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter Customer Name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008744]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method (3 Tiles) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Payment Method
              </label>

              <div className="grid grid-cols-3 gap-3">
                
                {/* Tile 1: Cash */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPaymentMethod('Cash');
                  }}
                  className={`relative py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    paymentMethod === 'Cash'
                      ? 'bg-white border-2 border-[#008744] ring-2 ring-emerald-500/20 text-[#008744]'
                      : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {paymentMethod === 'Cash' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#008744] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-10 h-7 rounded-lg border-2 border-[#008744] flex items-center justify-center relative">
                    <div className="w-3.5 h-3.5 rounded-full border border-[#008744]" />
                  </div>

                  <span className="font-extrabold text-xs sm:text-sm">
                    Cash
                  </span>
                </button>

                {/* Tile 2: UPI */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPaymentMethod('UPI');
                  }}
                  className={`relative py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    paymentMethod === 'UPI'
                      ? 'bg-white border-2 border-[#008744] ring-2 ring-emerald-500/20 text-slate-900'
                      : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {paymentMethod === 'UPI' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#008744] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-8 h-7 flex items-center justify-center">
                    <svg viewBox="0 0 32 32" className="w-7 h-7">
                      <path d="M6 22 L16 8 L22 17 Z" fill="#f97316" />
                      <path d="M12 24 L22 10 L28 19 Z" fill="#0284c7" />
                      <path d="M8 26 L18 12 L24 21 Z" fill="#008744" opacity="0.9" />
                    </svg>
                  </div>

                  <span className="font-extrabold text-xs sm:text-sm">
                    UPI
                  </span>
                </button>

                {/* Tile 3: Other (Credit / Due) */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPaymentMethod('Other');
                  }}
                  className={`relative py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    paymentMethod === 'Other'
                      ? 'bg-white border-2 border-[#008744] ring-2 ring-emerald-500/20 text-slate-900'
                      : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {paymentMethod === 'Other' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#008744] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-500">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>

                  <span className="font-extrabold text-xs sm:text-sm">
                    Other
                  </span>
                </button>

              </div>
            </div>

            {/* Discount Section */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#008744] flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    Discount
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">
                    Apply discount (optional)
                  </p>
                </div>
              </div>

              {/* Mode Selector & Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* Percentage Option */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setDiscountType('percent');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    discountType === 'percent'
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#008744] flex items-center justify-center">
                      {discountType === 'percent' && (
                        <div className="w-2 h-2 rounded-full bg-[#008744]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Percentage (%)
                    </span>
                  </div>

                  <div className="flex items-center rounded-xl bg-white border border-slate-200 overflow-hidden px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#008744]">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercentInput}
                      onChange={(e) => {
                        setDiscountType('percent');
                        setDiscountPercentInput(e.target.value);
                      }}
                      className="w-full font-black text-sm text-slate-900 focus:outline-none"
                      placeholder="0"
                    />
                    <span className="text-xs font-black text-slate-500 pl-1">%</span>
                  </div>
                </div>

                {/* Fixed Amount Option */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setDiscountType('amount');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    discountType === 'amount'
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center">
                      {discountType === 'amount' && (
                        <div className="w-2 h-2 rounded-full bg-[#008744]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Amount (₹)
                    </span>
                  </div>

                  <div className="flex items-center rounded-xl bg-white border border-slate-200 overflow-hidden px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#008744]">
                    <span className="text-xs font-black text-slate-500 pr-1">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmountInput}
                      onChange={(e) => {
                        setDiscountType('amount');
                        setDiscountAmountInput(e.target.value);
                      }}
                      className="w-full font-black text-sm text-slate-900 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

              </div>

        </div>

        {/* ==================== 5. AMOUNT RECEIVED & CALCULATIONS SECTION ==================== */}
        {/* Directly below other payment sections, vertically arranged, occupying full width */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Amount Received Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Amount Received
            </label>
            <div className="w-full flex items-center rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#008744] transition-all">
              <span className="font-black text-base sm:text-lg text-slate-500 pr-2">₹</span>
              <input
                type="number"
                step="0.01"
                value={amountReceivedInput}
                onChange={(e) => setAmountReceivedInput(e.target.value)}
                className="w-full font-black text-base sm:text-lg text-slate-900 bg-transparent focus:outline-none"
                placeholder="Enter amount received"
              />
            </div>
          </div>

          {/* Breakdown Lines */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {/* Discount Row */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-600">
                Discount ({discountType === 'percent' ? `${discountPercentInput || 0}%` : `₹${discountValue}`})
              </span>
              <span className="font-black text-[#008744]">
                - ₹{discountValue.toFixed(2)}
              </span>
            </div>

            {/* Payable Amount Row */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-1 border-t border-slate-100">
              <span className="font-extrabold text-slate-900">
                Payable Amount
              </span>
              <span className="font-black text-lg sm:text-xl text-[#008744]">
                ₹{payableAmount.toFixed(2)}
              </span>
            </div>

            {/* Change Return or Credit/Due Container */}
            {paymentMethod === 'Other' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs mt-2">
                <div>
                  <span className="font-black text-xs sm:text-sm text-amber-900 block">
                    Outstanding Credit / Due
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700">
                    Recorded under Pending Bills
                  </span>
                </div>
                <span className="font-black text-lg sm:text-xl text-amber-900">
                  ₹{outstandingDue.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="bg-[#e7f7ed] border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs mt-2">
                <span className="font-black text-xs sm:text-sm text-[#065f46]">
                  Change Return
                </span>
                <span className="font-black text-lg sm:text-xl text-[#065f46]">
                  ₹{changeReturn.toFixed(2)}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* ==================== 6. COMPLETE PAYMENT BUTTON (FULL WIDTH) ==================== */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCompletePaymentClick}
            className="w-full py-4 px-6 rounded-2xl bg-[#008744] hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span>Complete Payment</span>
          </button>
        </div>

      </main>

    </div>
  );
};
