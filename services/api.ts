
import { Fabric, HijabProduct, FabricRequest, HijabSale, User, UserRole, RequestStatus, UsageLog } from '../types';

// API base URL configuration
// For development with Vite's proxy, we use relative paths by default
// Set VITE_DISABLE_PROXY=true in .env to use full URLs even in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const isDevelopment = import.meta.env.DEV;
const disableProxy = import.meta.env.VITE_DISABLE_PROXY === 'true';
const BASE_URL = (isDevelopment && !disableProxy) ? '' : API_BASE_URL;

async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const ApiService = {
  async login(email: string): Promise<User | null> {
    try {
      const user = await fetchApi('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  async getFabrics(): Promise<Fabric[]> {
    return fetchApi('/api/fabrics');
  },

  async addFabric(fabric: Fabric): Promise<void> {
    await fetchApi('/api/fabrics', {
      method: 'POST',
      body: JSON.stringify(fabric),
    });
  },

  async updateFabric(fabricId: string, updates: Partial<Fabric>): Promise<void> {
    await fetchApi(`/api/fabrics/${fabricId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getRequests(): Promise<FabricRequest[]> {
    return fetchApi('/api/requests');
  },

  async saveRequest(request: FabricRequest): Promise<void> {
    await fetchApi('/api/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateRequestStatus(id: string, status: RequestStatus): Promise<void> {
    await fetchApi(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getHijabProducts(): Promise<HijabProduct[]> {
    return fetchApi('/api/hijab-products');
  },

  async updateHijabProduct(product: HijabProduct): Promise<void> {
    await fetchApi('/api/hijab-products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async getSales(): Promise<HijabSale[]> {
    return fetchApi('/api/sales');
  },

  async recordSale(sale: HijabSale): Promise<void> {
    await fetchApi('/api/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  },

  async getUsageHistory(): Promise<UsageLog[]> {
    return fetchApi('/api/usage-history');
  },

  async recordUsage(log: UsageLog): Promise<void> {
    await fetchApi('/api/usage-history', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }
};
