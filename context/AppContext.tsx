
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Fabric, HijabProduct, FabricRequest, UserRole, RequestStatus, UMKMStoreFabric, AppNotification, HijabSale, UsageLog } from '../types';
import { ApiService } from '../services/api';

interface AppContextType {
  user: User | null;
  fabrics: Fabric[];
  requests: FabricRequest[];
  hijabProducts: HijabProduct[];
  umkmFabrics: UMKMStoreFabric[];
  hijabSales: HijabSale[];
  notifications: AppNotification[];
  usageHistory: UsageLog[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addFabric: (fabric: Omit<Fabric, 'id' | 'supplierId' | 'supplierName'>) => Promise<void>;
  updateFabric: (fabricId: string, updates: Partial<Pick<Fabric, 'stock' | 'pricePerUnit'>>) => Promise<void>;
  recordSale: (sale: Omit<HijabSale, 'id' | 'timestamp'>) => Promise<void>;
  submitRequest: (request: Omit<FabricRequest, 'id' | 'status' | 'timestamp' | 'umkmName'>) => Promise<void>;
  uploadPaymentProof: (requestId: string, proofBase64: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  produceExistingHijab: (productId: string, quantity: number, fabricUsed: number) => Promise<void>;
  addHijabProduct: (product: Omit<HijabProduct, 'id' | 'umkmId'>, fabricUsed: number) => Promise<void>;
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [requests, setRequests] = useState<FabricRequest[]>([]);
  const [hijabProducts, setHijabProducts] = useState<HijabProduct[]>([]);
  const [umkmFabrics, setUmkmFabrics] = useState<UMKMStoreFabric[]>([]);
  const [hijabSales, setHijabSales] = useState<HijabSale[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      setIsLoading(true);
      try {
        // Check if we have a saved user and token
        const savedUser = localStorage.getItem('sc_user');
        const hasToken = ApiService.hasValidToken();
        
        if (savedUser && hasToken) {
          // Verify token is still valid with backend
          const currentUser = await ApiService.getCurrentUser();
          if (currentUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token invalid, clear session
            setUser(null);
            ApiService.logout();
            localStorage.removeItem('sc_user');
          }
        } else {
          // No saved session or invalid token
          setUser(null);
          ApiService.logout();
          localStorage.removeItem('sc_user');
        }
      } catch (err) {
        console.error("Session validation failed:", err);
        // Clear invalid session
        setUser(null);
        ApiService.logout();
        localStorage.removeItem('sc_user');
      } finally {
        setIsLoading(false);
      }
    };
    
    validateSession();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      
      try {
        const [f, r, h, s, uh, uf] = await Promise.all([
          ApiService.getFabrics(),
          ApiService.getRequests(),
          ApiService.getHijabProducts(),
          ApiService.getSales(),
          ApiService.getUsageHistory(),
          ApiService.getUmkmFabrics().catch(() => []) // New endpoint, may fail for suppliers
        ]);
        setFabrics(f);
        setRequests(r);
        setHijabProducts(h);
        setHijabSales(s);
        setUsageHistory(uh);
        setUmkmFabrics(uf);
        
        const savedNotifs = localStorage.getItem('sc_notifications');
        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // If data fetch fails with auth error, logout
        if (err instanceof Error && err.message.includes('Session expired')) {
          setUser(null);
          ApiService.logout();
          localStorage.removeItem('sc_user');
        }
      }
    };
    
    initData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sc_user', JSON.stringify(user));
    localStorage.setItem('sc_umkm_fabrics', JSON.stringify(umkmFabrics));
    localStorage.setItem('sc_notifications', JSON.stringify(notifications));
    localStorage.setItem('sc_usage_history', JSON.stringify(usageHistory));
  }, [user, umkmFabrics, notifications, usageHistory]);

  const addNotification = useCallback((userId: string, title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const result = await ApiService.login(email, password);
    setIsLoading(false);
    if (result) {
      setUser(result.user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    ApiService.logout();
    localStorage.removeItem('sc_user');
  }, []);

  const recordSale = useCallback(async (saleData: Omit<HijabSale, 'id' | 'timestamp'>) => {
    try {
      // ✅ Frontend only sends data - Backend validates & calculates
      const response = await ApiService.recordSale(saleData);
      
      // ✅ Update local state from backend response
      setHijabSales(prev => [response.sale, ...prev]);
      setHijabProducts(prev => prev.map(p => 
        p.id === response.sale.productId 
          ? { ...p, stock: response.updated_stock }
          : p
      ));
    } catch (error: any) {
      // Backend returns proper error messages
      throw error;
    }
  }, []);

  const submitRequest = useCallback(async (reqData: Omit<FabricRequest, 'id' | 'status' | 'timestamp' | 'umkmName'>) => {
    const newRequest: FabricRequest = {
      ...reqData,
      id: `r-${Date.now()}`,
      umkmName: user?.name || 'Unknown',
      status: RequestStatus.PENDING,
      timestamp: new Date().toISOString(),
    };
    await ApiService.saveRequest(newRequest);
    setRequests(prev => [newRequest, ...prev]);
    addNotification(reqData.supplierId, 'New Material Order!', `${user?.name} submitted an order.`, 'info');
  }, [user, addNotification]);

  const uploadPaymentProof = useCallback(async (requestId: string, proofBase64: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, paymentProof: proofBase64, status: RequestStatus.WAITING_VERIFICATION } : r
    ));
    addNotification(req.supplierId, 'Payment Proof Uploaded', `${user?.name} has uploaded proof for #${requestId.slice(-4)}`, 'info');
  }, [requests, user, addNotification]);

  const updateRequestStatus = useCallback(async (requestId: string, status: RequestStatus) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    try {
      // ✅ Frontend only sends request - Backend validates stock & calculates
      await ApiService.updateRequestStatus(requestId, status);
      
      // ✅ Update local state
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));

      // Refetch fabrics to get updated stock from backend
      const updatedFabrics = await ApiService.getFabrics();
      setFabrics(updatedFabrics);
      
      // Notifications
      if (status === RequestStatus.APPROVED) {
        addNotification(req.umkmId, 'Payment Verified!', `Order #${req.id.slice(-4)} verified. Supplier will ship soon.`, 'success');
      }
      
      if (status === RequestStatus.REJECTED) {
        addNotification(req.umkmId, 'Payment Rejected', `Payment proof for #${req.id.slice(-4)} was rejected. Order cancelled.`, 'error');
      }

      if (status === RequestStatus.COMPLETED) {
        // Add fabric to UMKM storage via backend
        const umkmUser = user;
        if (umkmUser) {
          await ApiService.addUmkmFabric({
            umkmId: umkmUser.id,
            fabricId: req.fabricId,
            fabricName: req.fabricName,
            fabricColor: req.fabricColor,
            quantity: req.quantity
          });
          
          // Refetch UMKM fabrics
          const updatedUmkmFabrics = await ApiService.getUmkmFabrics();
          setUmkmFabrics(updatedUmkmFabrics);
        }
        
        addNotification(req.umkmId, 'Materials Received', `${req.fabricName} (${req.fabricColor}) added to local stock.`, 'success');
      }
    } catch (error: any) {
      // Backend returns proper error messages
      if (status === RequestStatus.APPROVED) {
        addNotification(req.umkmId, 'Order Disruption', `Order #${req.id.slice(-4)} couldn't be approved: ${error.message}`, 'error');
      }
      throw error;
    }
  }, [requests, user, addNotification]);

  const updateFabric = useCallback(async (fabricId: string, updates: Partial<Fabric>) => {
    await ApiService.updateFabric(fabricId, updates);
    setFabrics(prev => prev.map(f => f.id === fabricId ? { ...f, ...updates } : f));
  }, []);

  const produceExistingHijab = useCallback(async (productId: string, quantity: number, fabricUsed: number) => {
    try {
      // ✅ Frontend only sends request - Backend validates & calculates
      const response = await ApiService.produceHijab(productId, quantity, fabricUsed);
      
      // ✅ Update local state from backend response
      setHijabProducts(prev => prev.map(p => 
        p.id === productId ? response.product : p
      ));
      setUsageHistory(prev => [response.usage_log, ...prev]);
      
      // Refetch UMKM fabrics to get updated quantities
      const updatedUmkmFabrics = await ApiService.getUmkmFabrics();
      setUmkmFabrics(updatedUmkmFabrics);
    } catch (error: any) {
      // Backend returns proper error messages
      throw error;
    }
  }, []);

  const addHijabProduct = useCallback(async (productData: Omit<HijabProduct, 'id' | 'umkmId'>, fabricUsed: number) => {
    // For new products, we still need to create the product first, then produce
    const newProduct: HijabProduct = { ...productData, id: `temp-${Date.now()}`, umkmId: user!.id };
    
    try {
      // Create the product via backend
      await ApiService.updateHijabProduct(newProduct);
      
      // Then produce using the production endpoint
      const response = await ApiService.produceHijab(newProduct.id, productData.stock, fabricUsed);
      
      // Update local state
      setHijabProducts(prev => [...prev.filter(p => p.id !== newProduct.id), response.product]);
      setUsageHistory(prev => [response.usage_log, ...prev]);
      
      // Refetch UMKM fabrics
      const updatedUmkmFabrics = await ApiService.getUmkmFabrics();
      setUmkmFabrics(updatedUmkmFabrics);
    } catch (error: any) {
      throw error;
    }
  }, [user]);

  const addFabric = useCallback(async (fabricData: Omit<Fabric, 'id' | 'supplierId' | 'supplierName'>) => {
    const newFabric = { ...fabricData, id: `f-${Date.now()}`, supplierId: user!.id, supplierName: user!.name };
    await ApiService.addFabric(newFabric);
    setFabrics(prev => [...prev, newFabric]);
  }, [user]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider value={{ 
      user, fabrics, requests, hijabProducts, umkmFabrics, notifications, hijabSales, usageHistory, isLoading,
      login, logout, addFabric, updateFabric, recordSale, submitRequest, uploadPaymentProof, updateRequestStatus, 
      produceExistingHijab, addHijabProduct, markNotificationsAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
