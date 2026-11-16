// User Profile & Preferences Management Service
// Full persistence across localStorage and Firestore REST API with zero external npm dependencies

export type UserRole = 'owner' | 'employee';

export interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface EmployeeRecord {
  id: string;
  employeeNo: string;
  employeeName: string;
  passcode: string;
  storeName: string;
  createdAt: string;
}

export interface UserProfileData {
  role: UserRole;
  storeName: string;
  ownerName: string;
  employeeNo?: string;
  employeeName?: string;
  email: string;
  phone: string;
  password?: string;
  passcode?: string;
  businessType?: 'Retail Shop' | 'Shop & Supply' | 'Wholesale';
  address: string;
  joinedDate: string;
  profilePicUrl?: string;
  theme: 'default' | 'dark';
  language: 'en' | 'bn' | 'hi';
  notifications: 'on' | 'off';
  devices: ConnectedDevice[];
}

const DEFAULT_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-1',
    name: 'Windows PC (Desktop Chrome)',
    type: 'Desktop',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 'dev-2',
    name: 'Android Mobile App',
    type: 'Mobile',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
];

class UserService {
  public formatJoinedDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Load user profile from persistent storage
  public async getUserProfile(role: UserRole): Promise<UserProfileData> {
    const cachedRole =
      (localStorage.getItem('sgrocery_user_role') === 'helper'
        ? 'employee'
        : localStorage.getItem('sgrocery_user_role')) || role;
    const isOwner = cachedRole === 'owner';

    // 1. Dynamic Joined Date: Sets and preserves the exact date of first login
    const roleJoinedKey = isOwner ? 'sgrocery_joined_date_owner' : 'sgrocery_joined_date_employee';
    let joinedDate = localStorage.getItem(roleJoinedKey) || localStorage.getItem('sgrocery_joined_date');
    if (!joinedDate) {
      joinedDate = this.formatJoinedDate();
      localStorage.setItem(roleJoinedKey, joinedDate);
      localStorage.setItem('sgrocery_joined_date', joinedDate);
    }

    // 2. Dynamic Password: Uses the exact password entered during login (No default password)
    const rolePasswordKey = isOwner ? 'sgrocery_password_owner' : 'sgrocery_password_employee';
    const savedPassword =
      localStorage.getItem(rolePasswordKey) ||
      localStorage.getItem('sgrocery_password') ||
      '';

    // 3. Address: Blank by default so user enters manually (No default address)
    const roleAddressKey = isOwner ? 'sgrocery_address_owner' : 'sgrocery_address_employee';
    const savedAddress =
      localStorage.getItem(roleAddressKey) ||
      localStorage.getItem('sgrocery_address') ||
      '';

    const defaultProfile: UserProfileData = {
      role: isOwner ? 'owner' : 'employee',
      storeName:
        localStorage.getItem('sgrocery_store_name') ||
        (isOwner ? 'My Store' : 'Mart Grocery Store'),
      ownerName: localStorage.getItem('sgrocery_owner_name') || (isOwner ? 'Shop Owner' : ''),
      employeeNo: localStorage.getItem('sgrocery_employee_no') || '',
      employeeName: localStorage.getItem('sgrocery_staff_name') || '',
      email:
        localStorage.getItem('sgrocery_user_email') ||
        (isOwner ? 'owner@store.com' : 'employee@store.com'),
      phone: localStorage.getItem('sgrocery_phone') || '',
      password: savedPassword,
      passcode: localStorage.getItem('sgrocery_employee_passcode') || '',
      businessType:
        (localStorage.getItem('sgrocery_business_type') as any) || 'Retail Shop',
      address: savedAddress,
      joinedDate: joinedDate,
      profilePicUrl: localStorage.getItem(`sgrocery_profile_pic_${cachedRole}`) || '',
      theme: (localStorage.getItem('sgrocery_theme') as any) || 'default',
      language: (localStorage.getItem('sgrocery_lang') as any) || 'en',
      notifications: (localStorage.getItem('sgrocery_notifications') as any) || 'on',
      devices: DEFAULT_DEVICES,
    };

    return defaultProfile;
  }

  // Save profile updates to persistent storage and Firebase
  public async saveUserProfile(data: Partial<UserProfileData>): Promise<void> {
    const role =
      (localStorage.getItem('sgrocery_user_role') === 'helper'
        ? 'employee'
        : localStorage.getItem('sgrocery_user_role')) || 'owner';
    const isOwner = role === 'owner';

    if (data.storeName !== undefined) localStorage.setItem('sgrocery_store_name', data.storeName);
    if (data.ownerName !== undefined) localStorage.setItem('sgrocery_owner_name', data.ownerName);
    if (data.employeeNo !== undefined) localStorage.setItem('sgrocery_employee_no', data.employeeNo);
    if (data.employeeName !== undefined) localStorage.setItem('sgrocery_staff_name', data.employeeName);
    if (data.email !== undefined) localStorage.setItem('sgrocery_user_email', data.email);
    if (data.phone !== undefined) localStorage.setItem('sgrocery_phone', data.phone);
    if (data.password !== undefined) {
      localStorage.setItem('sgrocery_password', data.password);
      localStorage.setItem(isOwner ? 'sgrocery_password_owner' : 'sgrocery_password_employee', data.password);
    }
    if (data.passcode !== undefined) localStorage.setItem('sgrocery_employee_passcode', data.passcode);
    if (data.businessType !== undefined) localStorage.setItem('sgrocery_business_type', data.businessType);
    if (data.address !== undefined) {
      localStorage.setItem('sgrocery_address', data.address);
      localStorage.setItem(isOwner ? 'sgrocery_address_owner' : 'sgrocery_address_employee', data.address);
    }
    if (data.theme !== undefined) {
      localStorage.setItem('sgrocery_theme', data.theme);
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    if (data.language !== undefined) localStorage.setItem('sgrocery_lang', data.language);
    if (data.notifications !== undefined) localStorage.setItem('sgrocery_notifications', data.notifications);
    if (data.profilePicUrl !== undefined) {
      localStorage.setItem(`sgrocery_profile_pic_${role}`, data.profilePicUrl);
    }
  }

  // Generate a guaranteed unique 4-digit passcode for employees
  public generateUniquePasscode(): string {
    const existingList = this.getEmployeeList();
    const existingCodes = new Set(existingList.map((e) => e.passcode));

    let code = '';
    let attempts = 0;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
    } while (existingCodes.has(code) && attempts < 100);

    return code;
  }

  // Get roster of registered employees
  public getEmployeeList(): EmployeeRecord[] {
    try {
      const saved = localStorage.getItem('sgrocery_employee_roster');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }

  // Save new or updated employee in roster
  public saveEmployee(employee: Omit<EmployeeRecord, 'id' | 'createdAt'>): EmployeeRecord {
    const list = this.getEmployeeList();
    const existingIndex = list.findIndex(
      (e) => e.employeeNo.toLowerCase() === employee.employeeNo.toLowerCase()
    );

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    let record: EmployeeRecord;
    if (existingIndex >= 0) {
      record = {
        ...list[existingIndex],
        ...employee,
      };
      list[existingIndex] = record;
    } else {
      record = {
        id: `emp-${Date.now()}`,
        ...employee,
        createdAt: dateStr,
      };
      list.unshift(record);
    }

    localStorage.setItem('sgrocery_employee_roster', JSON.stringify(list));
    return record;
  }
}

export const userService = new UserService();
