

export enum UserRole {
  UMKM = 'UMKM',
  SUPPLIER = 'SUPPLIER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  description?: string;
}

export interface Fabric {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  type: string;
  color: string;
  pricePerUnit: number;
  stock: number;
}

export interface UMKMStoreFabric {
  id: string;
  fabricId: string;
  name: string;
  color: string;
  quantity: number;
}

export interface HijabProduct {
  id: string;
  umkmId: string;
  name: string;
  color: string;
  stock: number;
  threshold: number;
  fabricId: string;
}

export interface HijabSale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  trackingNumber: string;
  date: string;
  timestamp: string;
}

export interface UsageLog {
  id: string;
  productId: string;
  productName: string;
  fabricId: string;
  fabricName: string;
  fabricUsed: number;
  quantityProduced: number;
  timestamp: string;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  WAITING_VERIFICATION = 'WAITING_VERIFICATION',
  APPROVED = 'APPROVED',
  SHIPPED = 'SHIPPED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface FabricRequest {
  id: string;
  umkmId: string;
  umkmName: string;
  supplierId: string;
  /* Added supplierName to track which supplier the request belongs to in order history */
  supplierName: string;
  fabricId: string;
  fabricName: string;
  fabricColor: string;
  quantity: number;
  status: RequestStatus;
  timestamp: string;
  notes?: string;
  paymentProof?: string; // Base64 image string
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface AppState {
  user: User | null;
  fabrics: Fabric[];
  requests: FabricRequest[];
  hijabProducts: HijabProduct[];
  notifications: AppNotification[];
  usageHistory: UsageLog[];
}