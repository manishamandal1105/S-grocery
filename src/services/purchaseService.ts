// Purchase Management Service (Centralized Source of Truth for Purchases & Procurement)
// Handles purchase transactions, itemized products, and Indian Standard Time (IST) date grouping.
// Syncs with LocalStorage and dispatches reactive update events.

import { getISTDateString, getYesterdayISTDate, getISTTimeString, formatDisplayDate } from './salesService';

export interface PurchasedProductItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface CompletedPurchaseRecord {
  id: string;
  purchaseOrderNo: string;
  date: string; // YYYY-MM-DD in IST
  time: string; // e.g. "11:20 AM"
  timestamp: number;
  supplierName: string;
  paymentMode: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit';
  status: 'completed' | 'cancelled';
  items: PurchasedProductItem[];
  totalAmount: number;
  storeName: string;
}

const STORAGE_KEY = 'sgrocery_completed_purchases';

class PurchaseService {
  private purchaseCache: CompletedPurchaseRecord[] | null = null;

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      // Initialize with sample purchases for yesterday so date selector can be tested immediately,
      // while Today starts with ₹0 as requested ("If no products have been sold/purchased today, display ₹0").
      const yesterdayStr = getYesterdayISTDate();
      const initialSeed: CompletedPurchaseRecord[] = [
        {
          id: 'seed-purchase-1',
          purchaseOrderNo: 'PO-8812',
          date: yesterdayStr,
          time: '10:15 AM',
          timestamp: Date.now() - 86400000,
          supplierName: 'Kolkata Wholesale Traders',
          paymentMode: 'Bank Transfer',
          status: 'completed',
          storeName: localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store',
          totalAmount: 1300,
          items: [
            {
              id: 'p-item-1',
              productName: 'Fortune Mustard Oil (1L)',
              quantity: 10,
              unitPrice: 130,
              totalAmount: 1300,
            },
          ],
        },
        {
          id: 'seed-purchase-2',
          purchaseOrderNo: 'PO-8813',
          date: yesterdayStr,
          time: '02:45 PM',
          timestamp: Date.now() - 86400000 + 25000,
          supplierName: 'Bengal Flour & Grain Millers',
          paymentMode: 'Cash',
          status: 'completed',
          storeName: localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store',
          totalAmount: 900,
          items: [
            {
              id: 'p-item-2',
              productName: 'Aashirvaad Atta (5kg)',
              quantity: 5,
              unitPrice: 180,
              totalAmount: 900,
            },
          ],
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      this.purchaseCache = initialSeed;
    }
  }

  // Get current date in IST
  public getTodayISTDate(): string {
    return getISTDateString();
  }

  // Retrieve all purchase records
  public getAllPurchases(): CompletedPurchaseRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.purchaseCache = data ? JSON.parse(data) : [];
      return this.purchaseCache || [];
    } catch (e) {
      console.error('Error reading purchases from storage:', e);
      return [];
    }
  }

  // Get completed purchases for a specific date in IST (YYYY-MM-DD)
  public getPurchasesForDate(dateStr: string, storeName?: string): CompletedPurchaseRecord[] {
    const all = this.getAllPurchases();
    return all.filter((p) => {
      const matchDate = p.date === dateStr;
      const matchStatus = p.status === 'completed';
      const matchStore = storeName ? p.storeName === storeName : true;
      return matchDate && matchStatus && matchStore;
    });
  }

  // Get today's total purchase amount (in IST)
  public getTodayPurchasesTotal(storeName?: string): number {
    const todayStr = getISTDateString();
    const todayPurchases = this.getPurchasesForDate(todayStr, storeName);
    return todayPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }

  // Get total purchase amount for a specified date
  public getDatePurchasesTotal(dateStr: string, storeName?: string): number {
    const datePurchases = this.getPurchasesForDate(dateStr, storeName);
    return datePurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }

  // Display Purchased Product Details:
  // Aggregates products purchased on a given date by product name, showing:
  // - Product Name
  // - Quantity Sold / Purchased
  // - Unit Price
  // - Total Amount
  public getItemizedProductsForDate(dateStr: string, storeName?: string): PurchasedProductItem[] {
    const purchases = this.getPurchasesForDate(dateStr, storeName);
    const itemMap = new Map<string, { quantity: number; totalAmount: number; unitPrice: number }>();

    purchases.forEach((purchase) => {
      if (purchase.items && Array.isArray(purchase.items)) {
        purchase.items.forEach((item) => {
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

    const result: PurchasedProductItem[] = [];
    let counter = 1;

    itemMap.forEach((val, name) => {
      const effectiveUnitPrice = val.quantity > 0 ? Math.round((val.totalAmount / val.quantity) * 100) / 100 : val.unitPrice;
      result.push({
        id: `purch_item_${counter++}`,
        productName: name,
        quantity: val.quantity,
        unitPrice: effectiveUnitPrice,
        totalAmount: val.totalAmount,
      });
    });

    return result;
  }

  // Record a new completed purchase
  public recordCompletedPurchase(input: {
    supplierName?: string;
    paymentMode?: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit';
    items: { productName: string; quantity: number; unitPrice: number; totalAmount?: number }[];
    storeName?: string;
    purchaseOrderNo?: string;
    date?: string; // optional custom IST date (YYYY-MM-DD)
  }): CompletedPurchaseRecord {
    const now = new Date();
    const dateStr = input.date || getISTDateString(now);
    const timeStr = getISTTimeString(now);

    const fullItems: PurchasedProductItem[] = input.items.map((item, idx) => ({
      id: `purch_prod_${Date.now()}_${idx}`,
      productName: item.productName,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalAmount: item.totalAmount !== undefined ? Number(item.totalAmount) : (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const calculatedTotal = fullItems.reduce((acc, i) => acc + i.totalAmount, 0);

    const newRecord: CompletedPurchaseRecord = {
      id: `purchase_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      purchaseOrderNo: input.purchaseOrderNo || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      time: timeStr,
      timestamp: Date.now(),
      supplierName: input.supplierName || 'General Wholesale Distributor',
      paymentMode: input.paymentMode || 'Cash',
      status: 'completed',
      items: fullItems,
      totalAmount: calculatedTotal,
      storeName: input.storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store',
    };

    const all = this.getAllPurchases();
    all.unshift(newRecord);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    this.purchaseCache = all;

    // Notify all components in the app immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sgrocery_purchases_updated', { detail: newRecord }));
    }

    return newRecord;
  }

  // Get all available dates that have purchase records (plus Today and Yesterday)
  public getAvailableDates(): string[] {
    const all = this.getAllPurchases();
    const dateSet = new Set<string>();

    dateSet.add(getISTDateString());
    dateSet.add(getYesterdayISTDate());

    all.forEach((p) => {
      if (p.date) dateSet.add(p.date);
    });

    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }
}

export const purchaseService = new PurchaseService();
