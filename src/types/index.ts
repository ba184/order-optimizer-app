export type UserRole = 'sales_executive' | 'asm' | 'rsm' | 'admin';

export interface GeoHierarchy {
  country: string;
  state: string;
  zone: string;
  city: string;
  area: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  territory?: string;
  region?: string;
  geoHierarchy?: GeoHierarchy;
  reportingTo?: string;
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
  zone: string;
  area: string;
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
  assignedSE?: string;
  assignedASM?: string;
}

export interface Retailer {
  id: string;
  code: string;
  shopName: string;
  ownerName: string;
  address: string;
  city: string;
  state: string;
  zone: string;
  area: string;
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
  assignedSE?: string;
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
  userName: string;
  date: Date;
  loginTime: Date;
  logoutTime?: Date;
  loginLocation: { lat: number; lng: number; address: string };
  logoutLocation?: { lat: number; lng: number; address: string };
  loginSelfie: string;
  logoutSelfie?: string;
  totalDistance: number;
  visitCount: number;
  ordersPlaced: number;
  dsrSubmitted: boolean;
  liveLocation?: { lat: number; lng: number; timestamp: Date }[];
}

export interface BeatPlan {
  id: string;
  userId: string;
  userName: string;
  month: string;
  year: number;
  planType: 'journey' | 'monthly';
  routes: BeatRoute[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface BeatRoute {
  dayOfWeek: number;
  date?: string;
  retailers: string[];
  plannedVisits: number;
  area: string;
  zone: string;
}

export interface Lead {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zone: string;
  area: string;
  type: 'retailer' | 'distributor';
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'lost' | 'pending_approval';
  notes: string;
  createdBy: string;
  createdAt: Date;
  assignedTo: string;
  followUpDate?: Date;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalReason?: string;
  potentialValue?: number;
  source?: string;
}

export interface DailySalesReport {
  id: string;
  userId: string;
  userName: string;
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
  visitType: 'call' | 'visit';
  distributorId?: string;
  distributorName?: string;
  retailerId?: string;
  retailerName?: string;
  zone: string;
  city: string;
  area: string;
  marketIntelligence?: string;
  status: 'draft' | 'submitted';
}

export interface Leave {
  id: string;
  userId: string;
  userName: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'compensatory';
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  expenseType: 'da' | 'ta' | 'hotel' | 'fuel' | 'other';
  date: Date;
  amount: number;
  cityCategory: 'A' | 'B' | 'C';
  distance?: number;
  description: string;
  billUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface PreOrder {
  id: string;
  orderNumber: string;
  distributorId: string;
  distributorName: string;
  items: OrderItem[];
  totalAmount: number;
  expectedDeliveryDate: Date;
  paymentCollected: number;
  status: 'booked' | 'pending_approval' | 'approved' | 'confirmed' | 'delivered' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  schemeName?: string;
  launchName?: string;
}

export interface Presentation {
  id: string;
  title: string;
  productId: string;
  productName: string;
  type: 'ppt' | 'pdf' | 'video';
  fileUrl: string;
  description: string;
  duration: number;
  hasQuiz: boolean;
  quizQuestions?: QuizQuestion[];
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface PresentationLog {
  id: string;
  presentationId: string;
  presentedBy: string;
  presentedTo: string;
  retailerId?: string;
  distributorId?: string;
  presentedAt: Date;
  completed: boolean;
  quizScore?: number;
  feedback?: string;
}

export interface Inventory {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseType: 'company' | 'distributor';
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  batchNumber: string;
  manufacturingDate: Date;
  expiryDate: Date;
  lastUpdated: Date;
}

export interface StockTransfer {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  items: { productId: string; productName: string; quantity: number }[];
  status: 'pending' | 'approved' | 'in_transit' | 'completed';
  createdAt: Date;
  createdBy: string;
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
  type: 'country' | 'state' | 'zone' | 'city' | 'area';
  parentId?: string;
  managerId?: string;
  managerName?: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: 'distributor' | 'order' | 'expense' | 'leave' | 'beat_plan' | 'lead' | 'pre_order';
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: Date;
}

export interface ApprovalStep {
  order: number;
  role: UserRole;
  canApprove: boolean;
  canReject: boolean;
  autoEscalateHours?: number;
  condition?: string;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  entityType: string;
  entityId: string;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected';
  history: ApprovalHistory[];
  createdAt: Date;
}

export interface ApprovalHistory {
  step: number;
  action: 'approved' | 'rejected' | 'escalated';
  actionBy: string;
  actionAt: Date;
  comments?: string;
}

export interface Sample {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  costPrice: number;
  quantity: number;
  issuedTo: string;
  issuedToType: 'retailer' | 'distributor';
  issuedBy: string;
  issuedAt: Date;
  acknowledgement?: string;
  converted: boolean;
  conversionOrderId?: string;
}

export interface EmployeeLocation {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: Date;
  accuracy: number;
  batteryLevel?: number;
  isMoving: boolean;
}
