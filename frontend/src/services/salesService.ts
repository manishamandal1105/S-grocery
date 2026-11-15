// Sales Management Service (Centralized Source of Truth for Sales & Billing)
// Handles sales transactions, itemized products, completed/pending/returned statuses,
// unique invoice generation, and Indian Standard Time (IST) date grouping.

export interface SoldProductItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  quantityDisplay?: string; // e.g. "2 Pack" or "250 gm"
  unitPriceDisplay?: string; // e.g. "₹10.00" or "₹50.00/kg"
}

export interface SaleReturnItem {
  id: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  date: string;
  time: string;
  reason?: string;
}

export interface CompletedSaleRecord {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD in IST
  time: string; // e.g. "10:45 AM"
  timestamp: number;
  customerName: string;
  customerPhone?: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit';
  status: 'completed' | 'pending' | 'returned';
  items: SoldProductItem[];
  subtotal?: number;
  discountAmount?: number;
  discountDisplay?: string;
  totalAmount: number;
  paidAmount: number;
  amountReceived?: number;
  changeReturn?: number;
  dueAmount: number;
  returns?: SaleReturnItem[];
  storeName: string;
}

// Common Kirana Catalog items for quick selection & billing
export interface CatalogItem {
  id: string;
  name: string;
  unitPrice: number;
  category: string;
}

export const standardGroceryCatalog: CatalogItem[] = [
  { id: 'cat-1', name: 'Aashirvaad Atta (5kg)', unitPrice: 210, category: 'Flour & Grains' },
  { id: 'cat-2', name: 'Fortune Mustard Oil (1L)', unitPrice: 145, category: 'Edible Oils' },
  { id: 'cat-3', name: 'Tata Salt (1kg)', unitPrice: 28, category: 'Spices & Essentials' },
  { id: 'cat-4', name: 'Madhur Pure Sugar (1kg)', unitPrice: 44, category: 'Sugar & Sweeteners' },
  { id: 'cat-5', name: 'Amul Taaza Milk (500ml)', unitPrice: 27, category: 'Dairy' },
  { id: 'cat-6', name: 'India Gate Basmati Rice (1kg)', unitPrice: 95, category: 'Flour & Grains' },
  { id: 'cat-7', name: 'Fortune Sunflower Oil (1L)', unitPrice: 155, category: 'Edible Oils' },
  { id: 'cat-8', name: 'Maggi 2-Minute Noodles (70g)', unitPrice: 14, category: 'Packaged Food' },
  { id: 'cat-9', name: 'Amul Butter (100g)', unitPrice: 56, category: 'Dairy' },
  { id: 'cat-10', name: 'Tata Tea Gold (250g)', unitPrice: 130, category: 'Beverages' },
];

const STORAGE_KEY = 'sgrocery_completed_sales';

// Helper: Get current date in Indian Standard Time (IST - Asia/Kolkata) as YYYY-MM-DD
export function getISTDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

// Helper: Get current time in Indian Standard Time (IST) as hh:mm AM/PM
export function getISTTimeString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

// Helper: Format YYYY-MM-DD to readable display string (e.g. "15 Nov 2026")
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getISTDateString();
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayStr = getISTDateString(d);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

// Get Yesterday's IST date string
export function getYesterdayISTDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getISTDateString(d);
}

class SalesService {
  private salesCache: CompletedSaleRecord[] | null = null;

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      // Starts clean with empty sales for today (₹0 default as requested)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      this.salesCache = [];
    }
  }

  // Get current date in IST
  public getTodayISTDate(): string {
    return getISTDateString();
  }

  // Retrieve all sales from storage
  public getAllSales(): CompletedSaleRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.salesCache = data ? JSON.parse(data) : [];
      return this.salesCache || [];
    } catch (e) {
      console.error('Error reading sales from storage:', e);
      return [];
    }
  }

  private saveAll(sales: CompletedSaleRecord[]) {
    this.salesCache = sales;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
      window.dispatchEvent(new CustomEvent('sgrocery_sales_updated'));
    } catch (e) {
      console.warn('Failed to save sales records:', e);
    }
  }

  // Generate unique sequential Invoice ID strictly on sale creation (e.g. INV-1001, INV-1002...)
  public generateUniqueInvoiceNo(): string {
    const all = this.getAllSales();
    let maxNum = 1000;

    all.forEach((s) => {
      if (s.invoiceNo && s.invoiceNo.startsWith('INV-')) {
        const numPart = parseInt(s.invoiceNo.replace('INV-', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `INV-${nextNum}`;
  }

  // Get sales for a specific date in IST (YYYY-MM-DD)
  public getSalesForDate(dateStr: string, storeName?: string): CompletedSaleRecord[] {
    const all = this.getAllSales();
    const defaultStore = storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';
    return all.filter((s) => {
      const matchDate = s.date === dateStr;
      const matchStore = !storeName || s.storeName === defaultStore;
      return matchDate && matchStore;
    });
  }

  // 1. Get Today's Total Sales amount (sum of completed bill revenue in IST today)
  public getTodaySalesTotal(storeName?: string): number {
    const todayStr = getISTDateString();
    return this.getDateSalesTotal(todayStr, storeName);
  }

  // Get total sales amount for a specified date
  public getDateSalesTotal(dateStr: string, storeName?: string): number {
    const dateSales = this.getSalesForDate(dateStr, storeName);
    return dateSales
      .filter((s) => s.status === 'completed' || s.status === 'pending')
      .reduce((sum, sale) => sum + (sale.status === 'completed' ? sale.totalAmount : sale.paidAmount || 0), 0);
  }

  // 2. Get Today's Total Bills count (counts each bill generated today only once)
  public getTodayTotalBillsCount(storeName?: string): number {
    const todayStr = getISTDateString();
    const todaySales = this.getSalesForDate(todayStr, storeName);
    return todaySales.length;
  }

  // 3. Get Top Selling Product today (highest quantity sold today)
  public getTodayTopSellingProduct(storeName?: string): { name: string; quantitySold: number } | null {
    const todayStr = getISTDateString();
    const todaySales = this.getSalesForDate(todayStr, storeName);
    const productQuantities = new Map<string, number>();

    todaySales
      .filter((s) => s.status !== 'returned')
      .forEach((sale) => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item) => {
            const key = item.productName.trim();
            const curr = productQuantities.get(key) || 0;
            productQuantities.set(key, curr + (Number(item.quantity) || 0));
          });
        }
      });

    if (productQuantities.size === 0) return null;

    let topProduct: string | null = null;
    let maxQty = 0;

    productQuantities.forEach((qty, name) => {
      if (qty > maxQty) {
        maxQty = qty;
        topProduct = name;
      }
    });

    if (!topProduct || maxQty === 0) return null;
    return { name: topProduct, quantitySold: maxQty };
  }

  // Get counts for tabs: All, Completed, Pending, Returned
  public getSalesTabCounts(storeName?: string, dateStr?: string): {
    all: number;
    completed: number;
    pending: number;
    returned: number;
  } {
    const targetDate = dateStr || getISTDateString();
    const sales = this.getSalesForDate(targetDate, storeName);

    let completed = 0;
    let pending = 0;
    let returned = 0;

    sales.forEach((s) => {
      if (s.status === 'completed') completed++;
      else if (s.status === 'pending') pending++;
      else if (s.status === 'returned') returned++;
      // If a bill has returned items
      if (s.returns && s.returns.length > 0 && s.status !== 'returned') {
        returned++;
      }
    });

    return {
      all: sales.length,
      completed,
      pending,
      returned,
    };
  }

  // Display Sold Product Details (Itemized aggregation)
  public getItemizedProductsForDate(dateStr: string, storeName?: string): SoldProductItem[] {
    const sales = this.getSalesForDate(dateStr, storeName);
    const itemMap = new Map<string, { quantity: number; totalAmount: number; unitPrice: number }>();

    sales
      .filter((s) => s.status === 'completed')
      .forEach((sale) => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item) => {
            const key = item.productName.trim();
            const existing = itemMap.get(key);
            if (existing) {
              existing.quantity += item.quantity;
              existing.totalAmount += item.totalAmount;
            } else {
              itemMap.set(key, {
                quantity: item.quantity,
                totalAmount: item.totalAmount,
                unitPrice: item.unitPrice,
              });
            }
          });
        }
      });

    const result: SoldProductItem[] = [];
    let counter = 1;

    itemMap.forEach((val, name) => {
      const effectiveUnitPrice =
        val.quantity > 0 ? Math.round((val.totalAmount / val.quantity) * 100) / 100 : val.unitPrice;
      result.push({
        id: `prod_${counter++}`,
        productName: name,
        quantity: val.quantity,
        unitPrice: effectiveUnitPrice,
        totalAmount: val.totalAmount,
      });
    });

    return result;
  }

  // Record a new sale with complete business logic (Completed or Pending)
  public recordCompletedSale(saleInput: {
    customerName?: string;
    customerPhone?: string;
    paymentMode?: 'Cash' | 'UPI' | 'Card' | 'Credit';
    items: {
      productName: string;
      quantity: number;
      unitPrice: number;
      totalAmount?: number;
      quantityDisplay?: string;
      unitPriceDisplay?: string;
    }[];
    storeName?: string;
    paidAmount?: number;
    subtotal?: number;
    discountAmount?: number;
    discountDisplay?: string;
    amountReceived?: number;
    changeReturn?: number;
    date?: string; // optional custom IST date (YYYY-MM-DD)
  }): CompletedSaleRecord {
    const now = new Date();
    const dateStr = saleInput.date || getISTDateString(now);
    const timeStr = getISTTimeString(now);

    const fullItems: SoldProductItem[] = saleInput.items.map((item, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      productName: item.productName,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalAmount:
        item.totalAmount !== undefined
          ? Number(item.totalAmount)
          : (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      quantityDisplay: item.quantityDisplay,
      unitPriceDisplay: item.unitPriceDisplay,
    }));

    const rawSum = fullItems.reduce((acc, i) => acc + i.totalAmount, 0);
    const subtotal = saleInput.subtotal !== undefined ? Number(saleInput.subtotal) : rawSum;
    const discountAmount = saleInput.discountAmount !== undefined ? Number(saleInput.discountAmount) : 0;
    const finalTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    const enteredPaid = saleInput.paidAmount !== undefined ? Number(saleInput.paidAmount) : finalTotal;

    // Determine status:
    // If full amount paid -> Completed
    // If partial or unpaid -> Pending
    const isFullPayment = enteredPaid >= finalTotal;
    const finalPaid = Math.min(enteredPaid, finalTotal);
    const remainingDue = Math.max(0, Math.round((finalTotal - finalPaid) * 100) / 100);
    const status: 'completed' | 'pending' = isFullPayment ? 'completed' : 'pending';

    // Generate unique Invoice ID only after sale creation
    const invoiceNo = this.generateUniqueInvoiceNo();

    const newRecord: CompletedSaleRecord = {
      id: `sale_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      invoiceNo,
      date: dateStr,
      time: timeStr,
      timestamp: Date.now(),
      customerName: saleInput.customerName?.trim() || 'Walk-in Customer',
      customerPhone: saleInput.customerPhone?.trim() || '',
      paymentMode: saleInput.paymentMode || 'Cash',
      status,
      items: fullItems,
      subtotal,
      discountAmount,
      discountDisplay: saleInput.discountDisplay,
      totalAmount: finalTotal,
      paidAmount: finalPaid,
      amountReceived: saleInput.amountReceived,
      changeReturn: saleInput.changeReturn,
      dueAmount: remainingDue,
      returns: [],
      storeName: saleInput.storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store',
    };

    const all = this.getAllSales();
    all.unshift(newRecord);
    this.saveAll(all);

    return newRecord;
  }

  // Update payment on a pending bill (mark completed when fully paid)
  public recordBillPayment(invoiceNo: string, paymentAmount: number): CompletedSaleRecord | null {
    const all = this.getAllSales();
    const idx = all.findIndex((s) => s.invoiceNo === invoiceNo);
    if (idx === -1) return null;

    const bill = all[idx];
    const newPaid = bill.paidAmount + paymentAmount;
    const newDue = Math.max(0, bill.totalAmount - newPaid);
    const newStatus = newDue <= 0 ? 'completed' : 'pending';

    all[idx] = {
      ...bill,
      paidAmount: Math.min(newPaid, bill.totalAmount),
      dueAmount: newDue,
      status: newStatus,
    };

    this.saveAll(all);
    return all[idx];
  }

  // Record a product return on a bill
  public recordProductReturn(
    invoiceNo: string,
    returnData: { productName: string; quantity: number; refundAmount: number; reason?: string }
  ): CompletedSaleRecord | null {
    const all = this.getAllSales();
    const idx = all.findIndex((s) => s.invoiceNo === invoiceNo);
    if (idx === -1) return null;

    const bill = all[idx];
    const now = new Date();
    const returnItem: SaleReturnItem = {
      id: `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productName: returnData.productName,
      quantity: returnData.quantity,
      refundAmount: returnData.refundAmount,
      date: getISTDateString(now),
      time: getISTTimeString(now),
      reason: returnData.reason || 'Customer Return',
    };

    const existingReturns = bill.returns || [];
    existingReturns.push(returnItem);

    // Check if total refund equals or exceeds bill total
    const totalRefunded = existingReturns.reduce((sum, r) => sum + r.refundAmount, 0);
    const newStatus: 'completed' | 'pending' | 'returned' =
      totalRefunded >= bill.totalAmount ? 'returned' : bill.status;

    all[idx] = {
      ...bill,
      returns: existingReturns,
      status: newStatus,
    };

    this.saveAll(all);
    return all[idx];
  }

  // Delete a sale (if needed)
  public deleteSale(invoiceNo: string) {
    const all = this.getAllSales();
    const updated = all.filter((s) => s.invoiceNo !== invoiceNo);
    this.saveAll(updated);
  }

  // Get all available dates that have sales records
  public getAvailableDates(): string[] {
    const all = this.getAllSales();
    const dateSet = new Set<string>();
    dateSet.add(getISTDateString());
    dateSet.add(getYesterdayISTDate());

    all.forEach((s) => {
      if (s.date) dateSet.add(s.date);
    });

    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }
}

export const salesService = new SalesService();
