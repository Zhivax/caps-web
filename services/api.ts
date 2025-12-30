
import { Fabric, HijabProduct, FabricRequest, HijabSale, User, UserRole, RequestStatus, UsageLog } from '../types';
import { USERS, INITIAL_FABRICS, INITIAL_HIJAB_STOCK, INITIAL_REQUESTS } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  async login(email: string): Promise<User | null> {
    await delay(800);
    const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    return found || null;
  },

  async getFabrics(): Promise<Fabric[]> {
    await delay(500);
    const saved = localStorage.getItem('sc_fabrics');
    return saved ? JSON.parse(saved) : INITIAL_FABRICS;
  },

  async updateFabric(fabricId: string, updates: Partial<Fabric>): Promise<void> {
    await delay(400);
    const fabrics = await this.getFabrics();
    const updated = fabrics.map(f => f.id === fabricId ? { ...f, ...updates } : f);
    localStorage.setItem('sc_fabrics', JSON.stringify(updated));
  },

  async getRequests(): Promise<FabricRequest[]> {
    await delay(600);
    const saved = localStorage.getItem('sc_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  },

  async saveRequest(request: FabricRequest): Promise<void> {
    await delay(700);
    const requests = await this.getRequests();
    localStorage.setItem('sc_requests', JSON.stringify([request, ...requests]));
  },

  async updateRequestStatus(id: string, status: RequestStatus): Promise<void> {
    await delay(500);
    const requests = await this.getRequests();
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem('sc_requests', JSON.stringify(updated));
  },

  async getHijabProducts(): Promise<HijabProduct[]> {
    await delay(500);
    const saved = localStorage.getItem('sc_hijab');
    return saved ? JSON.parse(saved) : INITIAL_HIJAB_STOCK;
  },

  async updateHijabProduct(product: HijabProduct): Promise<void> {
    await delay(400);
    const products = await this.getHijabProducts();
    const updated = products.map(p => p.id === product.id ? product : p);
    localStorage.setItem('sc_hijab', JSON.stringify(updated));
  },

  async getSales(): Promise<HijabSale[]> {
    await delay(500);
    const saved = localStorage.getItem('sc_hijab_sales');
    return saved ? JSON.parse(saved) : [];
  },

  async recordSale(sale: HijabSale): Promise<void> {
    await delay(600);
    const sales = await this.getSales();
    localStorage.setItem('sc_hijab_sales', JSON.stringify([sale, ...sales]));
  },

  async getUsageHistory(): Promise<UsageLog[]> {
    await delay(500);
    const saved = localStorage.getItem('sc_usage_history');
    return saved ? JSON.parse(saved) : [];
  },

  async recordUsage(log: UsageLog): Promise<void> {
    const history = await this.getUsageHistory();
    localStorage.setItem('sc_usage_history', JSON.stringify([log, ...history]));
  }
};
