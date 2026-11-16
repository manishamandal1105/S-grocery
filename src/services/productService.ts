// Product & Inventory Management Service (Centralized Source of Truth for Products & Stock Alerts)
// Starts completely EMPTY (0 products in stock until user explicitly adds them).
// Dynamically monitors stock levels and expiry dates in Indian Standard Time (IST).
// Automatically updates when products are added, purchased, or sold.

import { getISTDateString } from './salesService';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  purchasePrice: number;
  currentStock: number;
  minStockLevel: number;
  expiryDate: string; // YYYY-MM-DD in IST
  unit: string;
  storeName: string;
  lastUpdated: number;
}

const STORAGE_KEY = 'sgrocery_product_catalog';

// Helper: Calculate days between today (IST) and a target date string (YYYY-MM-DD)
export function getDaysUntilDate(targetDateStr: string): number {
  if (!targetDateStr) return 999;
  try {
    const todayStr = getISTDateString();
    const todayParts = todayStr.split('-').map(Number);
    const targetParts = targetDateStr.split('-').map(Number);

    const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    const targetDate = new Date(targetParts[0], targetParts[1] - 1, targetParts[2]);

    const diffTime = targetDate.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 999;
  }
}

class ProductService {
  private cache: ProductItem[] | null = null;

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        // Starts completely empty as requested (0 products in stock)
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        this.cache = [];
      } else {
        const parsed = JSON.parse(existing);
        // Clean out any previous demo seed products (e.g. prod-1, prod-2)
        if (Array.isArray(parsed) && parsed.some((p: any) => p.id && p.id.startsWith('prod-'))) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          this.cache = [];
        } else {
          this.cache = parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage init error:', e);
      this.cache = [];
    }
  }

  private loadAll(): ProductItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // If contains legacy seed products, clear them
          if (parsed.some((p: any) => p.id && p.id.startsWith('prod-'))) {
            this.saveAll([]);
            return [];
          }
          this.cache = parsed;
          return this.cache;
        }
      }
    } catch (e) {
      console.warn('Failed to parse product catalog:', e);
    }
    return [];
  }

  private saveAll(products: ProductItem[]) {
    this.cache = products;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('sgrocery_products_updated'));
    } catch (e) {
      console.warn('Failed to save product catalog:', e);
    }
  }

  // Get all products added by the user
  public getAllProducts(storeName?: string): ProductItem[] {
    const defaultStore = storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';
    const all = this.loadAll();
    return all.filter((p) => !storeName || p.storeName === defaultStore);
  }

  // 1. Get all Out of Stock products (stock <= 0)
  public getOutOfStockProducts(storeName?: string): ProductItem[] {
    const all = this.getAllProducts(storeName);
    return all.filter((p) => p.currentStock <= 0);
  }

  // 2. Get all Low in Stock products (0 < stock <= minStockLevel)
  public getLowStockProducts(storeName?: string): ProductItem[] {
    const all = this.getAllProducts(storeName);
    return all.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  }

  // 3. Get all Expiring Soon products (expiring within threshold days, e.g. 30 days)
  public getExpiringSoonProducts(storeName?: string, thresholdDays: number = 30): ProductItem[] {
    const all = this.getAllProducts(storeName);
    return all
      .filter((p) => {
        const daysLeft = getDaysUntilDate(p.expiryDate);
        return daysLeft >= 0 && daysLeft <= thresholdDays;
      })
      .sort((a, b) => getDaysUntilDate(a.expiryDate) - getDaysUntilDate(b.expiryDate));
  }

  // Get summary counts for Home page "Needs Your Attention"
  public getAlertCounts(storeName?: string): { outOfStock: number; lowStock: number; expiringSoon: number } {
    return {
      outOfStock: this.getOutOfStockProducts(storeName).length,
      lowStock: this.getLowStockProducts(storeName).length,
      expiringSoon: this.getExpiringSoonProducts(storeName).length,
    };
  }

  // Add a new product to inventory
  public addProduct(input: {
    name: string;
    category?: string;
    sellingPrice: number;
    purchasePrice?: number;
    currentStock: number;
    minStockLevel?: number;
    expiryDate?: string;
    unit?: string;
    storeName?: string;
  }): ProductItem {
    const all = this.loadAll();
    const defaultStore = input.storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';

    const newProduct: ProductItem = {
      id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: input.name.trim(),
      category: input.category?.trim() || 'General Grocery',
      sellingPrice: Number(input.sellingPrice) || 0,
      purchasePrice: Number(input.purchasePrice) || Math.round((Number(input.sellingPrice) || 0) * 0.8),
      currentStock: Math.max(0, Number(input.currentStock) || 0),
      minStockLevel: Number(input.minStockLevel) || 5,
      expiryDate: input.expiryDate || '',
      unit: input.unit || 'pcs',
      storeName: defaultStore,
      lastUpdated: Date.now(),
    };

    all.unshift(newProduct);
    this.saveAll(all);
    return newProduct;
  }

  // Save/Update an existing product
  public saveProduct(product: ProductItem) {
    const all = this.loadAll();
    const existingIdx = all.findIndex((p) => p.id === product.id);
    if (existingIdx !== -1) {
      all[existingIdx] = { ...product, lastUpdated: Date.now() };
    } else {
      all.unshift({ ...product, lastUpdated: Date.now() });
    }
    this.saveAll(all);
  }

  // Delete a product
  public deleteProduct(productId: string) {
    const all = this.loadAll();
    const updated = all.filter((p) => p.id !== productId);
    this.saveAll(updated);
  }

  // Update product stock (e.g. on sale or purchase)
  public adjustStock(productName: string, delta: number, storeName?: string) {
    const cleanName = productName.trim().toLowerCase();
    const all = this.loadAll();
    let modified = false;

    const updated = all.map((p) => {
      if (p.name.trim().toLowerCase() === cleanName) {
        modified = true;
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock + delta),
          lastUpdated: Date.now(),
        };
      }
      return p;
    });

    if (modified) {
      this.saveAll(updated);
    }
  }

  // Reset all products to empty
  public clearAllProducts() {
    this.saveAll([]);
  }
}

export const productService = new ProductService();
