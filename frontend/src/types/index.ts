export type Language = 'bn' | 'en' | 'hi';

export type ShopType = 'small' | 'medium' | 'large';

export type UserRole = 'owner' | 'helper';

export type AuthMode = 'login' | 'register';

export type ActiveTab = 'home' | 'sales';

export interface ShopTypeOption {
  id: ShopType;
  titleKey: string;
  descKey: string;
  icon: string;
  badgeKey: string;
}

export interface SellerRegistrationData {
  fullName: string;
  shopName: string;
  shopType: ShopType;
  email: string;
  password: string;
}

export interface HelperLoginData {
  storeCode: string;
  storeName?: string;
  helperEmail: string;
  passcode: string;
}

export interface SaleTransaction {
  id: string;
  time: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit';
}

export interface DailySalesTrend {
  day: string;
  amount: number;
}

export interface SalesSummaryData {
  storeName: string;
  todaySales: number;
  totalTransactions: number;
  estimatedProfit: number;
  growthPercentage: number;
  cashSales: number;
  digitalSales: number;
  creditSales: number;
}
