// Firebase Firestore Database Service
// Manages store profiles, daily sales, transactions, and employee credentials

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface StoreProfileData {
  storeId?: string;
  storeName: string;
  ownerName: string;
  email: string;
  businessType: string;
  phone?: string;
  address?: string;
  joinedDate?: string;
  createdAt?: any;
}

export interface SaleRecord {
  id?: string;
  storeName: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Credit';
  customerName?: string;
  invoiceNo?: string;
  timestamp: string;
}

export const firestoreService = {
  // Save or update store profile in Firestore
  async saveStoreProfile(profile: StoreProfileData): Promise<boolean> {
    try {
      if (db) {
        const storeRef = doc(db, 'stores', profile.email || 'default_store');
        await setDoc(storeRef, {
          ...profile,
          updatedAt: Timestamp.now(),
        }, { merge: true });
        return true;
      }
    } catch (err) {
      console.warn("Firestore saveStoreProfile fallback:", err);
    }

    localStorage.setItem('sgrocery_store_profile', JSON.stringify(profile));
    return true;
  },

  // Retrieve store profile
  async getStoreProfile(email: string): Promise<StoreProfileData | null> {
    try {
      if (db) {
        const storeRef = doc(db, 'stores', email);
        const snap = await getDoc(storeRef);
        if (snap.exists()) {
          return snap.data() as StoreProfileData;
        }
      }
    } catch (err) {
      console.warn("Firestore getStoreProfile fallback:", err);
    }

    const local = localStorage.getItem('sgrocery_store_profile');
    return local ? JSON.parse(local) : null;
  },

  // Record a sales transaction
  async recordSale(sale: SaleRecord): Promise<string> {
    try {
      if (db) {
        const salesCol = collection(db, 'sales');
        const docRef = await addDoc(salesCol, {
          ...sale,
          createdAt: Timestamp.now(),
        });
        return docRef.id;
      }
    } catch (err) {
      console.warn("Firestore recordSale fallback:", err);
    }

    const saved = localStorage.getItem('sgrocery_sales_history');
    const history: SaleRecord[] = saved ? JSON.parse(saved) : [];
    const newId = `sale_${Date.now()}`;
    history.unshift({ ...sale, id: newId });
    localStorage.setItem('sgrocery_sales_history', JSON.stringify(history));
    return newId;
  },

  // Get sales transactions for a store
  async getSalesHistory(storeName: string): Promise<SaleRecord[]> {
    try {
      if (db) {
        const salesCol = collection(db, 'sales');
        const q = query(salesCol, where('storeName', '==', storeName), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as SaleRecord));
      }
    } catch (err) {
      console.warn("Firestore getSalesHistory fallback:", err);
    }

    const saved = localStorage.getItem('sgrocery_sales_history');
    return saved ? JSON.parse(saved) : [];
  }
};
