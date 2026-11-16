// Expense Management Service (Centralized Source of Truth for Daily Kirana Store Expenses)
// Handles itemized numbered expense rows, persistent storage, and Indian Standard Time (IST) date grouping.
// Dispatches reactive update events for real-time dashboard sync.

import { getISTDateString, getYesterdayISTDate, getISTTimeString, formatDisplayDate } from './salesService';

export interface ExpenseRowItem {
  id: string;
  name: string;
  amount: number | '';
  category?: string;
  time?: string;
}

export interface DailyExpenseRecord {
  date: string; // YYYY-MM-DD in IST
  storeName: string;
  expenses: ExpenseRowItem[];
  totalAmount: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'sgrocery_daily_expenses';

// Quick expense name suggestions for Indian Kirana stores
export const commonKiranaExpenseSuggestions = [
  'Staff Tea & Snacks',
  'Shop Electricity Bill',
  'Cleaning & Sweeping',
  'Carry Bags & Polythene',
  'Goods Transport / Rickshaw',
  'Packaging Material & Tape',
  'Shop Rent',
  'Drinking Water Refill',
  'Daily Wage Helper',
  'Shop Maintenance & Repairs',
];

// Helper to create 5 numbered blank rows
export const createDefaultBlankRows = (count: number = 5): ExpenseRowItem[] => {
  const rows: ExpenseRowItem[] = [];
  for (let i = 1; i <= count; i++) {
    rows.push({
      id: `exp_row_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      name: '',
      amount: '',
    });
  }
  return rows;
};

class ExpenseService {
  private cache: Record<string, DailyExpenseRecord> | null = null;

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      // Seed Yesterday's data so date switcher can be tested immediately,
      // while Today starts at ₹0 with empty rows
      const yesterdayStr = getYesterdayISTDate();
      const defaultStore = localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';

      const initialSeed: Record<string, DailyExpenseRecord> = {
        [`${defaultStore}_${yesterdayStr}`]: {
          date: yesterdayStr,
          storeName: defaultStore,
          lastUpdated: Date.now() - 86400000,
          totalAmount: 230,
          expenses: [
            { id: 'seed-exp-1', name: 'Staff Tea & Snacks', amount: 80, time: '11:00 AM' },
            { id: 'seed-exp-2', name: 'Carry Bags & Polythene', amount: 150, time: '02:30 PM' },
            { id: 'seed-exp-3', name: '', amount: '' },
            { id: 'seed-exp-4', name: '', amount: '' },
            { id: 'seed-exp-5', name: '', amount: '' },
          ],
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }

  private loadAll(): Record<string, DailyExpenseRecord> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.cache = JSON.parse(raw);
        return this.cache || {};
      }
    } catch (e) {
      console.warn('Failed to parse expenses:', e);
    }
    return {};
  }

  private saveAll(all: Record<string, DailyExpenseRecord>) {
    this.cache = all;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('Failed to save expenses:', e);
    }
  }

  // Calculate total amount from a list of rows
  public calculateTotal(rows: ExpenseRowItem[]): number {
    return rows.reduce((sum, item) => {
      const val = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount as string) || 0;
      return sum + (val > 0 ? val : 0);
    }, 0);
  }

  // Get expenses for a specific date in IST (YYYY-MM-DD)
  // Ensures at least 5 numbered rows are always available for the user
  public getExpensesForDate(dateStr: string, storeName?: string): DailyExpenseRecord {
    const defaultStore = storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';
    const key = `${defaultStore}_${dateStr}`;
    const all = this.loadAll();

    if (all[key]) {
      const record = all[key];
      // Ensure at least 5 rows exist
      const existingRows = [...record.expenses];
      while (existingRows.length < 5) {
        existingRows.push({
          id: `exp_row_${Date.now()}_${existingRows.length + 1}_${Math.random().toString(36).substring(2, 7)}`,
          name: '',
          amount: '',
        });
      }
      return {
        ...record,
        expenses: existingRows,
        totalAmount: this.calculateTotal(existingRows),
      };
    }

    // Return brand new record with 5 blank rows
    return {
      date: dateStr,
      storeName: defaultStore,
      expenses: createDefaultBlankRows(5),
      totalAmount: 0,
      lastUpdated: Date.now(),
    };
  }

  // Save/Update expenses for a specific date
  public saveExpensesForDate(dateStr: string, rows: ExpenseRowItem[], storeName?: string): DailyExpenseRecord {
    const defaultStore = storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';
    const key = `${defaultStore}_${dateStr}`;
    const all = this.loadAll();

    const total = this.calculateTotal(rows);
    const updatedRecord: DailyExpenseRecord = {
      date: dateStr,
      storeName: defaultStore,
      expenses: rows,
      totalAmount: total,
      lastUpdated: Date.now(),
    };

    all[key] = updatedRecord;
    this.saveAll(all);

    // Notify listeners (Home page, widgets)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sgrocery_expenses_updated', {
          detail: { date: dateStr, totalAmount: total, storeName: defaultStore },
        })
      );
    }

    return updatedRecord;
  }

  // Get Today's expense total in Indian Standard Time (IST)
  public getTodayExpensesTotal(storeName?: string): number {
    const todayStr = getISTDateString();
    const record = this.getExpensesForDate(todayStr, storeName);
    return record.totalAmount;
  }

  // Today's IST Date string
  public getTodayISTDate(): string {
    return getISTDateString();
  }

  // Available dates that have recorded expenses or sales
  public getAvailableDates(storeName?: string): string[] {
    const todayStr = getISTDateString();
    const yesterdayStr = getYesterdayISTDate();
    const dateSet = new Set<string>([todayStr, yesterdayStr]);

    const all = this.loadAll();
    const defaultStore = storeName || localStorage.getItem('sgrocery_store_name') || 'Maa Laxmi Store';

    Object.values(all).forEach((rec) => {
      if (!storeName || rec.storeName === defaultStore) {
        if (rec.date) dateSet.add(rec.date);
      }
    });

    return Array.from(dateSet).sort().reverse();
  }
}

export const expenseService = new ExpenseService();
