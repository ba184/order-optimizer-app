export type UserRole = 'sales_executive' | 'asm' | 'rsm' | 'admin' | 'credit_team' | 'distributor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  territory?: string;
  region?: string;
}

export interface Distributor {
  id: string;
  code: string;
  firmName: string;
  ownerName: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  creditLimit: number;
  creditDays: number;
  outstandingAmount: number;
  status: 'active' | 'pending' | 'inactive';
  geoLocation: { lat: number; lng: number };
  kycDocuments: KYCDocument[];
  createdAt: Date;
  approvedBy?: string;
}

export interface Retailer {
  id: string;
  code: string;
  shopName: string;
  ownerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  category: 'A' | 'B' | 'C';
  distributorId: string;
  distributorName: string;
  geoLocation: { lat: number; lng: number };
  photos: string[];
  competitorBrands: string[];
  lastVisit?: Date;
  lastOrderDate?: Date;
  status: 'active' | 'pending' | 'inactive';
  createdAt: Date;
}

export interface KYCDocument {
  type: 'gst' | 'pan' | 'aadhaar' | 'cancelled_cheque' | 'agreement';
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  mrp: number;
  ptr: number;
  gst: number;
  unit: string;
  packSize: number;
  image: string;
  description: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'primary' | 'secondary';
  distributorId: string;
  distributorName: string;
  retailerId?: string;
  retailerName?: string;
  items: OrderItem[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  ptr: number;
  gst: number;
  discount: number;
  freeGoods: number;
  amount: number;
}

export interface Scheme {
  id: string;
  name: string;
  type: 'volume' | 'product' | 'opening' | 'display';
  description: string;
  startDate: Date;
  endDate: Date;
  minQuantity?: number;
  freeQuantity?: number;
  discountPercent?: number;
  applicableProducts: string[];
  isActive: boolean;
}

export interface Attendance {
  id: string;
  userId: string;
  date: Date;
  loginTime: Date;
  logoutTime?: Date;
  loginLocation: { lat: number; lng: number };
  logoutLocation?: { lat: number; lng: number };
  loginSelfie: string;
  logoutSelfie?: string;
  totalDistance: number;
  visitCount: number;
  ordersPlaced: number;
  dsrSubmitted: boolean;
}

export interface BeatPlan {
  id: string;
  userId: string;
  userName: string;
  month: string;
  year: number;
  routes: BeatRoute[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  approvedBy?: string;
}

export interface BeatRoute {
  dayOfWeek: number;
  retailers: string[];
  plannedVisits: number;
  area: string;
}

export interface Lead {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  city: string;
  type: 'retailer' | 'distributor';
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
  notes: string;
  createdBy: string;
  createdAt: Date;
  assignedTo: string;
}

export interface DailySalesReport {
  id: string;
  userId: string;
  date: Date;
  totalCalls: number;
  productiveCalls: number;
  ordersCount: number;
  orderValue: number;
  collectionAmount: number;
  newRetailers: number;
  complaints: number;
  remarks: string;
  submittedAt: Date;
}

export interface Claim {
  id: string;
  claimNumber: string;
  distributorId: string;
  distributorName: string;
  type: 'return' | 'damage' | 'expiry' | 'scheme';
  items: ClaimItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  photos: string[];
  remarks: string;
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

export interface ClaimItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  amount: number;
  reason: string;
}

export interface Territory {
  id: string;
  name: string;
  type: 'state' | 'region' | 'area' | 'hq';
  parentId?: string;
  managerId?: string;
  managerName?: string;
}
