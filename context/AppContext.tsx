
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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sc_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [requests, setRequests] = useState<FabricRequest[]>([]);
  const [hijabProducts, setHijabProducts] = useState<HijabProduct[]>([]);
  const [umkmFabrics, setUmkmFabrics] = useState<UMKMStoreFabric[]>([]);
  const [hijabSales, setHijabSales] = useState<HijabSale[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [f, r, h, s, uh] = await Promise.all([
          ApiService.getFabrics(),
          ApiService.getRequests(),
          ApiService.getHijabProducts(),
          ApiService.getSales(),
          ApiService.getUsageHistory()
        ]);
        setFabrics(f);
        setRequests(r);
        setHijabProducts(h);
        setHijabSales(s);
        setUsageHistory(uh);
        
        const savedUmkmFabrics = localStorage.getItem('sc_umkm_fabrics');
        if (savedUmkmFabrics) setUmkmFabrics(JSON.parse(savedUmkmFabrics));
        
        const savedNotifs = localStorage.getItem('sc_notifications');
        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

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
    const product = hijabProducts.find(p => p.id === saleData.productId);
    if (!product || product.stock < saleData.quantity) {
      throw new Error("Insufficient stock available for this transaction.");
    }
    const newSale: HijabSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    await ApiService.recordSale(newSale);
    const updatedProduct = { ...product, stock: product.stock - saleData.quantity };
    await ApiService.updateHijabProduct(updatedProduct);
    setHijabSales(prev => [newSale, ...prev]);
    setHijabProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
  }, [hijabProducts]);

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

    if (status === RequestStatus.APPROVED) {
      const fabric = fabrics.find(f => f.id === req.fabricId);
      if (!fabric || fabric.stock < req.quantity) {
        addNotification(req.umkmId, 'Order Disruption', `Order #${req.id.slice(-4)} couldn't be approved due to stock issues at supplier.`, 'error');
        throw new Error("Insufficient fabric stock to approve this request.");
      }
      
      const newStock = fabric.stock - req.quantity;
      await ApiService.updateFabric(fabric.id, { stock: newStock });
      setFabrics(prev => prev.map(f => f.id === fabric.id ? { ...f, stock: newStock } : f));
      addNotification(req.umkmId, 'Payment Verified!', `Order #${req.id.slice(-4)} verified. Supplier will ship soon.`, 'success');
    }

    await ApiService.updateRequestStatus(requestId, status);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));

    if (status === RequestStatus.REJECTED) {
      addNotification(req.umkmId, 'Payment Rejected', `Payment proof for #${req.id.slice(-4)} was rejected. Order cancelled.`, 'error');
    }

    if (status === RequestStatus.COMPLETED) {
      setUmkmFabrics(prev => {
        const existing = prev.find(uf => uf.fabricId === req.fabricId);
        if (existing) {
          return prev.map(uf => uf.fabricId === req.fabricId ? { ...uf, quantity: Number((uf.quantity + req.quantity).toFixed(2)) } : uf);
        }
        return [...prev, { id: `uf-${Date.now()}`, fabricId: req.fabricId, name: req.fabricName, color: req.fabricColor, quantity: req.quantity }];
      });
      addNotification(req.umkmId, 'Materials Received', `${req.fabricName} (${req.fabricColor}) added to local stock.`, 'success');
    }
  }, [requests, fabrics, addNotification]);

  const updateFabric = useCallback(async (fabricId: string, updates: Partial<Fabric>) => {
    await ApiService.updateFabric(fabricId, updates);
    setFabrics(prev => prev.map(f => f.id === fabricId ? { ...f, ...updates } : f));
  }, []);

  const produceExistingHijab = useCallback(async (productId: string, quantity: number, fabricUsed: number) => {
    const product = hijabProducts.find(p => p.id === productId);
    if (!product) throw new Error("Product not found.");

    const fabric = umkmFabrics.find(f => f.fabricId === product.fabricId);
    if (!fabric || fabric.quantity < fabricUsed) {
      throw new Error("Insufficient raw materials in warehouse.");
    }

    const newUsage: UsageLog = {
      id: `uh-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      fabricId: fabric.fabricId,
      fabricName: fabric.name,
      fabricUsed,
      quantityProduced: quantity,
      timestamp: new Date().toISOString()
    };

    setUsageHistory(prev => [newUsage, ...prev]);
    setUmkmFabrics(prev => prev.map(uf => uf.fabricId === product.fabricId ? { ...uf, quantity: Number((uf.quantity - fabricUsed).toFixed(2)) } : uf));
    const updatedProduct = { ...product, stock: product.stock + quantity };
    await ApiService.updateHijabProduct(updatedProduct);
    setHijabProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
  }, [hijabProducts, umkmFabrics]);

  const addHijabProduct = useCallback(async (productData: Omit<HijabProduct, 'id' | 'umkmId'>, fabricUsed: number) => {
    const fabric = umkmFabrics.find(f => f.fabricId === productData.fabricId);
    if (!fabric || fabric.quantity < fabricUsed) {
      throw new Error("Insufficient raw materials in warehouse.");
    }

    const newId = `h-${Date.now()}`;
    const newProduct: HijabProduct = { ...productData, id: newId, umkmId: user!.id };

    const newUsage: UsageLog = {
      id: `uh-new-${Date.now()}`,
      productId: newId,
      productName: productData.name,
      fabricId: productData.fabricId,
      fabricName: fabric.name,
      fabricUsed,
      quantityProduced: productData.stock,
      timestamp: new Date().toISOString()
    };

    setUsageHistory(prev => [newUsage, ...prev]);
    await ApiService.updateHijabProduct(newProduct);
    setHijabProducts(prev => [...prev, newProduct]);
    setUmkmFabrics(prev => prev.map(uf => uf.fabricId === productData.fabricId ? { ...uf, quantity: Number((uf.quantity - fabricUsed).toFixed(2)) } : uf));
  }, [user, umkmFabrics]);

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
