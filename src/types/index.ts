export type Language = 'bn' | 'en' | 'hi';

export type ShopType = 'small' | 'medium' | 'large';

export type UserRole = 'owner' | 'helper';

export type OnboardingStep =
  | 'welcome'
  | 'splash'
  | 'language'
  | 'role'
  | 'owner-setup'
  | 'owner-review'
  | 'owner-welcome'
  | 'owner-dashboard'
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
