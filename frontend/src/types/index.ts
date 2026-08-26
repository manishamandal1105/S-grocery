export type Language = 'bn' | 'en' | 'hi';

export type ShopType = 'small' | 'medium' | 'large';

export type UserRole = 'owner' | 'helper';

export type AuthMode = 'login' | 'register';

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
  helperEmail: string;
  passcode: string;
}
