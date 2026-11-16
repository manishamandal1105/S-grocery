import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
  Smartphone,
  CreditCard,
  ShoppingBag,
  Printer,
  Share2,
  Download,
  PlusCircle,
  Copy,
  Check,
} from 'lucide-react';
import { CompletedSaleRecord } from '../services/salesService';
import { storeService, ShopDetails } from '../services/storeService';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface BillScreenProps {
  saleRecord?: CompletedSaleRecord | null;
  storeName?: string;
  onBack: () => void;
  onNewSale: () => void;
}

export const BillScreen: React.FC<BillScreenProps> = ({
  saleRecord,
  storeName,
  onBack,
  onNewSale,
}) => {
  const soundFx = useSoundEffects();
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // 1. Dynamic Shop Details
  const [shopInfo, setShopInfo] = useState<ShopDetails>(() =>
    storeService.getStoreDetails(storeName || saleRecord?.storeName)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setShopInfo(storeService.getStoreDetails(storeName || saleRecord?.storeName));
    };
    window.addEventListener('sgrocery_store_details_updated', handleUpdate);
    return () => window.removeEventListener('sgrocery_store_details_updated', handleUpdate);
  }, [storeName, saleRecord]);

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // 2. Computed values from saleRecord or blank initial state
  const isBlankBill = !saleRecord || !saleRecord.items || saleRecord.items.length === 0;

  const invoiceNo = saleRecord?.invoiceNo || 'INV-1025';
  
  // Format Date & Time cleanly
  const formattedDateTime = useMemo(() => {
    if (!saleRecord) {
      const now = new Date();
      return now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ', ' + now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (saleRecord.time && saleRecord.date) {
      try {
        const d = new Date(saleRecord.date);
        const dayStr = d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return `${dayStr}, ${saleRecord.time}`;
      } catch (e) {
        return `${saleRecord.date}, ${saleRecord.time}`;
      }
    }
    return 'Today, Just now';
  }, [saleRecord]);

  const isCompleted = saleRecord?.status === 'completed';
  const isPending = saleRecord?.status === 'pending';

  const items = saleRecord?.items || [];
  const itemsCount = items.length;

  // Calculate total quantity display
  const totalQuantityDisplay = useMemo(() => {
    if (isBlankBill) return '0';
    let totalKg = 0;
    let totalPacks = 0;

    items.forEach((item) => {
      const qtyStr = item.quantityDisplay || '';
      if (qtyStr.includes('gm') || qtyStr.includes('kg') || item.quantity < 1) {
        totalKg += Number(item.quantity) || 0;
      } else {
        totalPacks += Math.round(Number(item.quantity) || 1);
      }
    });

    if (totalKg > 0 && totalPacks > 0) {
      return `${totalPacks} Packs, ${totalKg >= 1 ? `${totalKg.toFixed(2)} kg` : `${Math.round(totalKg * 1000)} gm`}`;
    }
    if (totalKg > 0) {
      return totalKg >= 1 ? `${totalKg.toFixed(2)} kg` : `${Math.round(totalKg * 1000)} gm`;
    }
    return `${totalPacks} ${totalPacks === 1 ? 'Pack' : 'Packs'}`;
  }, [items, isBlankBill]);

  const subtotal = saleRecord?.subtotal !== undefined
    ? saleRecord.subtotal
    : items.reduce((sum, item) => sum + (Number(item.totalAmount) || (Number(item.quantity) * Number(item.unitPrice))), 0);

  const discountAmount = saleRecord?.discountAmount || 0;
  const discountDisplay = saleRecord?.discountDisplay || (discountAmount > 0 ? `₹${discountAmount.toFixed(2)}` : '0%');

  const totalAmount = saleRecord?.totalAmount !== undefined ? saleRecord.totalAmount : subtotal;

  const paymentMode = saleRecord?.paymentMode || 'Cash';
  const amountReceived = saleRecord?.amountReceived !== undefined ? saleRecord.amountReceived : (saleRecord?.paidAmount || totalAmount);
  const changeReturn = saleRecord?.changeReturn !== undefined ? saleRecord.changeReturn : Math.max(0, amountReceived - totalAmount);
  const outstandingDue = saleRecord?.dueAmount !== undefined ? saleRecord.dueAmount : Math.max(0, totalAmount - (saleRecord?.paidAmount || 0));

  // 3. Actions: Print, Share, Download, New Sale
  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleShare = async () => {
    soundFx.playClick();
    const shareText = `*${shopInfo.storeName}* - Bill / Invoice\n` +
      `Invoice: ${invoiceNo}\n` +
      `Date: ${formattedDateTime}\n` +
      `Total: ₹${totalAmount.toFixed(2)}\n` +
      `Status: ${isCompleted ? 'PAID' : `DUE ₹${outstandingDue.toFixed(2)}`}\n` +
      `Thank you for shopping with us!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopInfo.storeName} Invoice ${invoiceNo}`,
          text: shareText,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Bill details copied to clipboard!');
    } catch (e) {
      showToast('Ready to share');
    }
  };

  const handleDownload = () => {
    soundFx.playClick();
    const invoiceContent = [
      `========================================`,
      `          ${shopInfo.storeName.toUpperCase()}`,
      `         ${shopInfo.tagline}`,
      `     ${shopInfo.address}`,
      `           Phone: ${shopInfo.phone}`,
      `========================================`,
      `BILL / INVOICE`,
      `Invoice No.: ${invoiceNo}`,
      `Date & Time: ${formattedDateTime}`,
      `Status     : ${isCompleted ? 'PAID' : 'PENDING DUE'}`,
      `Customer   : ${saleRecord?.customerName || 'Walk-in Customer'}`,
      `----------------------------------------`,
      `Item Name             Qty     Price     Amount`,
      `----------------------------------------`,
      ...items.map((i, idx) => {
        const name = i.productName.padEnd(20).slice(0, 20);
        const qty = (i.quantityDisplay || `${i.quantity}`).padEnd(8).slice(0, 8);
        const price = (i.unitPriceDisplay || `₹${i.unitPrice}`).padEnd(9).slice(0, 9);
        const amt = `₹${i.totalAmount.toFixed(2)}`;
        return `${idx + 1}. ${name} ${qty} ${price} ${amt}`;
      }),
      `----------------------------------------`,
      `Items: ${itemsCount} | Total Qty: ${totalQuantityDisplay}`,
      `Subtotal        : ₹${subtotal.toFixed(2)}`,
      `Discount        : - ₹${discountAmount.toFixed(2)}`,
      `TOTAL AMOUNT    : ₹${totalAmount.toFixed(2)}`,
      `----------------------------------------`,
      `Payment Method  : ${paymentMode}`,
      `Amount Received : ₹${amountReceived.toFixed(2)}`,
      paymentMode === 'Cash' ? `Change Return   : ₹${changeReturn.toFixed(2)}` : `Outstanding Due : ₹${outstandingDue.toFixed(2)}`,
      `========================================`,
      `    Thank you for shopping with us!`,
      `========================================`,
    ].join('\n');

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Invoice ${invoiceNo} downloaded`);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-[100dvh] w-full bg-[#008744]/10 flex flex-col justify-start overflow-y-auto text-slate-800 animate-fadeIn select-none p-1.5 sm:p-3">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* ==================== 1. TOP APP BAR ==================== */}
      <header className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs px-3 sm:px-4 py-1.5 sm:py-2 mb-2 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="p-1 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#008744] flex items-center justify-center font-bold">
              <Store className="w-3.5 h-3.5 text-[#008744]" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
              {shopInfo.storeName}
            </span>
          </div>
        </button>

        <span className="text-[10px] sm:text-xs font-bold text-[#008744] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
          Bill / Invoice
        </span>
      </header>

      {/* ==================== 2. MAIN COMPLETE BILL WORKSPACE ==================== */}
      <main className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-start">
        
        {/* Scalloped Receipt Ticket Frame */}
        <div className="w-full bg-[#008744] p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col">
          
          {/* Inner White Paper Receipt Card with Perforated Teeth */}
          <div className="w-full bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex flex-col shadow-sm">
            
            {/* Top Store Details Header */}
            <div className="text-center shrink-0 space-y-0.5">
              
              {/* Colorful Storefront Awning Graphic */}
              <div className="mx-auto w-10 h-7 sm:w-11 sm:h-8 flex items-center justify-center">
                <svg viewBox="0 0 64 52" className="w-full h-full drop-shadow-xs">
                  <path d="M4 18 L60 18 L54 6 L10 6 Z" fill="#ef4444" />
                  <path d="M12 18 L20 18 L18 6 L12 6 Z" fill="#ffffff" opacity="0.9" />
                  <path d="M28 18 L36 18 L34 6 L28 6 Z" fill="#ffffff" opacity="0.9" />
                  <path d="M44 18 L52 18 L50 6 L44 6 Z" fill="#ffffff" opacity="0.9" />
                  <circle cx="8" cy="18" r="4" fill="#ef4444" />
                  <circle cx="16" cy="18" r="4" fill="#ffffff" />
                  <circle cx="24" cy="18" r="4" fill="#ef4444" />
                  <circle cx="32" cy="18" r="4" fill="#ffffff" />
                  <circle cx="40" cy="18" r="4" fill="#ef4444" />
                  <circle cx="48" cy="18" r="4" fill="#ffffff" />
                  <circle cx="56" cy="18" r="4" fill="#ef4444" />
                  <rect x="8" y="20" width="48" height="26" rx="2" fill="#e2e8f0" />
                  <rect x="25" y="27" width="14" height="19" rx="2" fill="#0284c7" />
                  <circle cx="36" cy="37" r="1.5" fill="#facc15" />
                  <rect x="12" y="27" width="9" height="11" rx="1.5" fill="#38bdf8" />
                  <rect x="43" y="27" width="9" height="11" rx="1.5" fill="#38bdf8" />
                  <rect x="4" y="46" width="56" height="4" rx="2" fill="#16a34a" />
                </svg>
              </div>

              {/* Dynamic Store Name */}
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-none pt-0.5">
                {shopInfo.storeName}
              </h1>

              {/* Tagline */}
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
                {shopInfo.tagline}
              </p>

              {/* Dynamic Address & Phone */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] sm:text-[11px] font-medium text-slate-600 leading-tight pt-0.5">
                <div className="flex items-center gap-0.5 truncate max-w-[280px]">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{shopInfo.address}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                  <span>{shopInfo.phone}</span>
                </div>
              </div>
            </div>

            {/* Dashed Divider 1 */}
            <div className="border-t border-dashed border-slate-300 my-1 sm:my-1.5 shrink-0" />

            {/* Bill / Invoice Metadata Header */}
            <div className="shrink-0 space-y-0.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Invoice No.:</span>
                    <span className="font-black text-slate-900">{invoiceNo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Date & Time:</span>
                    <span className="font-semibold text-slate-700">{formattedDateTime}</span>
                  </div>
                </div>

                {/* Paid / Due Badge */}
                <div>
                  {isBlankBill ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                      <Clock className="w-3 h-3" /> Blank Bill
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Due
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-[#e7f7ed] text-[#008744] border border-emerald-200/80 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-[#008744]" /> Paid
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dashed Divider 2 */}
            <div className="border-t border-dashed border-slate-300 my-1 sm:my-1.5 shrink-0" />

            {/* ==================== 3. PRODUCT LIST SECTION (EXCLUSIVE SCROLLING AREA) ==================== */}
            <div className="flex flex-col overflow-hidden my-0.5">
              
              {/* Product Table Header */}
              <div className="bg-[#eaf6ee] py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold text-slate-700 grid grid-cols-12 items-center shrink-0">
                <span className="col-span-1 text-center font-bold text-slate-500">Sr.</span>
                <span className="col-span-6 font-bold text-slate-800 pl-1">Item Name</span>
                <span className="col-span-2 text-center font-bold text-slate-800">Qty</span>
                <span className="col-span-1 text-right font-bold text-slate-800 pr-1">Price</span>
                <span className="col-span-2 text-right font-bold text-slate-800">Amount</span>
              </div>

              {/* Dedicated Vertical Scrollable Rows Container (Only this section scrolls!) */}
              <div className="overflow-y-auto divide-y divide-slate-100 px-1 py-0.5 scrollbar-thin scrollbar-thumb-slate-200 max-h-[110px] sm:max-h-[145px] md:max-h-[175px]">
                {isBlankBill ? (
                  <div className="flex flex-col items-center justify-center text-center py-2.5 text-slate-400 space-y-0.5">
                    <ShoppingBag className="w-5 h-5 text-slate-300 stroke-[1.5]" />
                    <p className="text-[11px] font-semibold text-slate-500">No products added yet</p>
                    <p className="text-[9px] text-slate-400">Complete a payment to view the generated bill</p>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const rowQty = item.quantityDisplay || (item.quantity < 1 ? `${Math.round(item.quantity * 1000)} gm` : `${item.quantity} Pack`);
                    const rowPrice = item.unitPriceDisplay || `₹${Number(item.unitPrice).toFixed(2)}`;
                    const rowAmount = Number(item.totalAmount) || (Number(item.quantity) * Number(item.unitPrice));

                    return (
                      <div
                        key={item.id || idx}
                        className="py-1 grid grid-cols-12 items-center text-[10px] sm:text-[11px] text-slate-800 hover:bg-slate-50/70 transition-colors"
                      >
                        <span className="col-span-1 text-center font-medium text-slate-400">
                          {idx + 1}
                        </span>
                        <span className="col-span-6 font-semibold text-slate-900 truncate pl-1" title={item.productName}>
                          {item.productName}
                        </span>
                        <span className="col-span-2 text-center text-slate-600 font-medium truncate">
                          {rowQty}
                        </span>
                        <span className="col-span-1 text-right text-slate-600 font-medium pr-1 truncate">
                          {rowPrice}
                        </span>
                        <span className="col-span-2 text-right font-extrabold text-slate-900">
                          ₹{rowAmount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Dashed Divider 3 */}
            <div className="border-t border-dashed border-slate-300 my-1 sm:my-1.5 shrink-0" />

            {/* Summary & Pricing Breakdown */}
            <div className="shrink-0 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] items-center">
              
              {/* Left Column: Items Count & Total Quantity */}
              <div className="space-y-0.5 text-slate-600">
                <p className="font-semibold">
                  Items: <span className="font-black text-slate-900">{itemsCount}</span>
                </p>
                <p className="font-semibold truncate">
                  Total Quantity: <span className="font-black text-slate-900">{totalQuantityDisplay}</span>
                </p>
              </div>

              {/* Right Column: Subtotal, Discount & Highlighted Total */}
              <div className="space-y-0.5 text-right">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-black text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 ? (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="font-medium">Discount ({discountDisplay})</span>
                    <span className="font-black">- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">Discount</span>
                    <span className="font-bold">₹0.00</span>
                  </div>
                )}

                {/* Total Amount Green Pill Box */}
                <div className="bg-[#e7f7ed] rounded-lg px-2 py-0.5 flex justify-between items-center text-slate-900 mt-0.5">
                  <span className="font-extrabold text-[10px] sm:text-[11px] text-slate-900">
                    Total Amount
                  </span>
                  <span className="font-black text-xs sm:text-sm text-[#008744]">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            {/* Dashed Divider 4 */}
            <div className="border-t border-dashed border-slate-300 my-1 sm:my-1.5 shrink-0" />

            {/* Payment Details Section */}
            <div className="shrink-0 grid grid-cols-12 gap-2 items-center text-[10px] sm:text-[11px]">
              
              {/* Left: Payment Method */}
              <div className="col-span-5 pr-1 space-y-0.5">
                <span className="text-slate-500 font-bold block text-[9px] sm:text-[10px]">
                  Payment Method
                </span>
                <div className="flex items-center gap-1 font-extrabold text-slate-900">
                  {paymentMode === 'Cash' && (
                    <div className="w-4 h-3 rounded border border-[#008744] flex items-center justify-center shrink-0">
                      <div className="w-1 h-1 rounded-full bg-[#008744]" />
                    </div>
                  )}
                  {paymentMode === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  {paymentMode === 'Credit' && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  <span className="truncate">{paymentMode === 'Credit' ? 'Credit / Due' : paymentMode}</span>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="col-span-1 flex justify-center">
                <div className="h-6 w-px bg-slate-200" />
              </div>

              {/* Right: Amount Received & Change / Due */}
              <div className="col-span-6 space-y-0.5 pl-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Amount Received</span>
                  <span className="font-black text-slate-900">₹{amountReceived.toFixed(2)}</span>
                </div>

                {paymentMode === 'Credit' || isPending ? (
                  <div className="flex justify-between items-center text-amber-700 font-bold">
                    <span>Outstanding Due</span>
                    <span className="font-black">₹{outstandingDue.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>Change Return</span>
                    <span className="font-black">₹{changeReturn.toFixed(2)}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Thank You Banner */}
            <div className="shrink-0 bg-[#eef8f2] text-[#008744] rounded-lg py-1 px-2.5 flex items-center justify-center gap-1.5 my-1 font-bold italic text-[10px] sm:text-[11px]">
              <ShoppingBag className="w-3 h-3 stroke-[2.4]" />
              <span>Thank you for shopping with us!</span>
            </div>

            {/* ==================== 4. BOTTOM ACTION BUTTONS ROW ==================== */}
            <div className="shrink-0 grid grid-cols-4 gap-1.5 pt-0.5">
              
              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="py-1.5 px-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] sm:text-[11px] flex flex-col items-center justify-center gap-0.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Print Receipt"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="py-1.5 px-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] sm:text-[11px] flex flex-col items-center justify-center gap-0.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Share Receipt"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Share</span>
              </button>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                className="py-1.5 px-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] sm:text-[11px] flex flex-col items-center justify-center gap-0.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Download Receipt"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download</span>
              </button>

              {/* + New Sale Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNewSale();
                }}
                className="py-1.5 px-1 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-extrabold text-[10px] sm:text-[11px] flex flex-col items-center justify-center gap-0.5 shadow-md transition-all cursor-pointer active:scale-95"
                title="Start New Sale"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span>New Sale</span>
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
