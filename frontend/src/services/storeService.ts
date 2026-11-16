// Store Details Service
// Central source for shop setup details (Store Name, Address, Phone, Tagline, Business Type)
// Ensures details are 100% dynamic and pulled from the user's setup/profile.

export interface ShopDetails {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  businessType: string;
  ownerName?: string;
}

const DEFAULT_STORE: ShopDetails = {
  storeName: 'Maa Laxmi Store',
  tagline: 'Grocery & Daily Needs',
  address: 'Station Road, Barasat, Kolkata - 700124',
  phone: '+91 98765 43210',
  businessType: 'Retail Shop',
  ownerName: 'Shop Owner',
};

export const storeService = {
  // Retrieve current shop details dynamically
  getStoreDetails(requestedStoreName?: string): ShopDetails {
    let profileData: any = null;
    try {
      const rawProfile = localStorage.getItem('sgrocery_store_profile');
      if (rawProfile) {
        profileData = JSON.parse(rawProfile);
      }
    } catch (e) {
      console.warn('Error reading store profile from localStorage', e);
    }

    const name =
      requestedStoreName ||
      profileData?.storeName ||
      localStorage.getItem('sgrocery_store_name') ||
      DEFAULT_STORE.storeName;

    const address =
      profileData?.address ||
      localStorage.getItem('sgrocery_store_address') ||
      DEFAULT_STORE.address;

    const phone =
      profileData?.phone ||
      localStorage.getItem('sgrocery_store_phone') ||
      DEFAULT_STORE.phone;

    const businessType =
      profileData?.businessType ||
      localStorage.getItem('sgrocery_business_type') ||
      DEFAULT_STORE.businessType;

    const tagline =
      profileData?.tagline ||
      localStorage.getItem('sgrocery_store_tagline') ||
      (businessType ? `${businessType} & Daily Needs` : DEFAULT_STORE.tagline);

    const ownerName =
      profileData?.ownerName ||
      localStorage.getItem('sgrocery_owner_name') ||
      DEFAULT_STORE.ownerName;

    return {
      storeName: name,
      tagline,
      address,
      phone,
      businessType,
      ownerName,
    };
  },

  // Save or update shop details dynamically
  saveStoreDetails(details: Partial<ShopDetails>): ShopDetails {
    const current = this.getStoreDetails();
    const updated: ShopDetails = {
      ...current,
      ...details,
    };

    if (updated.storeName) {
      localStorage.setItem('sgrocery_store_name', updated.storeName);
    }
    if (updated.address) {
      localStorage.setItem('sgrocery_store_address', updated.address);
    }
    if (updated.phone) {
      localStorage.setItem('sgrocery_store_phone', updated.phone);
    }
    if (updated.tagline) {
      localStorage.setItem('sgrocery_store_tagline', updated.tagline);
    }
    if (updated.businessType) {
      localStorage.setItem('sgrocery_business_type', updated.businessType);
    }
    if (updated.ownerName) {
      localStorage.setItem('sgrocery_owner_name', updated.ownerName);
    }

    localStorage.setItem('sgrocery_store_profile', JSON.stringify(updated));

    // Dispatch custom event for real-time reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sgrocery_store_details_updated', {
          detail: updated,
        })
      );
    }

    return updated;
  },
};
