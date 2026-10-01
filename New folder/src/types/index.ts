export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
}

export type UnitType = 'Piece' | 'Sq. Ft.' | 'Sq. M.' | 'Slab' | 'Tile' | 'Block' | 'Sheet' | 'Custom';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string; // 'Marble' | 'Granite' | 'Marble Craft' | 'Marble + Brass'
  subcategory: string;
  description: string;
  material: string;
  colour: string;
  finish: string;
  size: string;
  weight: string;
  pricingType: 'fixed' | 'quote';
  price: number; // in INR
  unit: UnitType;
  minQuantity: number;
  orderRulesType: 'craft_bulk' | 'standard';
  customOrderRulesNotice?: string;
  images: string[];
  availability: 'In Stock' | 'Made to Order' | 'Out of Stock';
  featured: boolean;
  badge?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  fullName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  businessName?: string;
}

export interface DeliveryInfo {
  address: string;
  villageArea?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  locationType?: string;
}

export interface BusinessInfo {
  instagramId?: string;
  website?: string;
  gstNumber?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  unit: UnitType;
  price: number;
  pricingType: 'fixed' | 'quote';
  quantity: number;
  totalPrice: number;
  orderRulesNote: string;
}

export type OrderStatus =
  | 'New'
  | 'Contacted'
  | 'Confirmed'
  | 'Processing'
  | 'Ready for Dispatch'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  businessInfo?: BusinessInfo;
  items: OrderItem[];
  totalAmount: number;
  transportCharge: number;
  transportNote: string;
  status: OrderStatus;
  adminNotes?: string;
}

export interface GstSettings {
  enabled: boolean;
  fieldVisibility: 'hidden' | 'optional' | 'required';
  gstNumber?: string;
  gstBusinessName?: string;
  gstAddress?: string;
  gstPercentage?: number;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  logoUrl: string;
  description: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instagramId: string;
  facebook: string;
  youtube: string;
  websiteUrl: string;
  deliveryInformation: string;
  transportInformation: string;
  termsAndConditions: string;
  privacyPolicy: string;
  gstSettings: GstSettings;
  craftDefaultMinQty: number;
  adminToken?: string;
}
