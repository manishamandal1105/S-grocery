export type Language = 'bn' | 'en' | 'hi';

export type ShopType = 'small' | 'medium' | 'large';

export type BusinessTypeOption = 'Retail Shop' | 'Shop & Supply' | 'Wholesale';

export type UserRole = 'owner' | 'helper';

export type AuthMode = 'login' | 'register';

export type ActiveTab = 'home' | 'sales';

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

export type OnboardingStep =
  | 'welcome'
  | 'splash'
  | 'language'
  | 'role'
  | 'owner-login'
  | 'employee-login'
  | 'owner-setup'
  | 'owner-review'
  | 'owner-welcome'
  | 'owner-dashboard'
  | 'sales-dashboard'
  | 'staff-flow';

export type OwnerSetupSubStep =
  | 'credentials'
  | 'shop-details'
  | 'business-type'
  | 'quick-pin';

export type StaffSubStep =
  | 'select-shop'
  | 'select-staff'
  | 'enter-pin'
  | 'staff-dashboard';

export type LoginMethod = 'email' | 'phone';

export interface OwnerSetupData {
  loginMethod: LoginMethod;
  email: string;
  phone: string;
  password: string;
  ownerName: string;
  shopName: string;
  businessType: ShopType;
  quickPin: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  pin: string;
  shift: string;
}

export interface ShopProfile {
  id: string;
  name: string;
  ownerName: string;
  code: string;
  type: ShopType;
  address: string;
}

export interface HourlySalesPoint {
  time: string;
  amount: number;
}

export interface DashboardMetrics {
  todaySales: number;
  todayPurchases: number;
  todayExpenses: number;
  todayProfitLoss: number;
  salesGrowth: number;
  purchasesGrowth: number;
  expensesGrowth: number;
  profitLossGrowth: number;
  outOfStockCount: number;
  lowStockCount: number;
  expiringCount: number;
  hourlySales: HourlySalesPoint[];
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
