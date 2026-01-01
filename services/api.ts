
import { Fabric, HijabProduct, FabricRequest, HijabSale, User, UserRole, RequestStatus, UsageLog } from '../types';

// API base URL configuration
// For development with Vite's proxy, we use relative paths by default
// Set VITE_DISABLE_PROXY=true in .env to use full URLs even in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const isDevelopment = import.meta.env.DEV;
const disableProxy = import.meta.env.VITE_DISABLE_PROXY === 'true';
const BASE_URL = (isDevelopment && !disableProxy) ? '' : API_BASE_URL;

// Token storage keys
// NOTE: Using localStorage for demo purposes. In production:
// - Use httpOnly cookies for refresh tokens (more secure against XSS)
// - Keep access token in memory or sessionStorage
// - Implement CSRF protection with cookies
const ACCESS_TOKEN_KEY = 'sc_access_token';
const REFRESH_TOKEN_KEY = 'sc_refresh_token';

// Token management
class TokenManager {
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      // Client-side expiration check (structure validation only)
      // NOTE: This does NOT verify the signature - server always validates
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }
}

// Input sanitization utility
class InputSanitizer {
  static sanitizeString(input: string): string {
    if (!input) return '';
    
    // Remove null bytes and control characters
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Encode HTML special characters to prevent XSS
    // Using textContent ensures proper escaping
    const div = document.createElement('div');
    div.textContent = sanitized;
    sanitized = div.innerHTML;
    
    return sanitized.trim();
  }

  // NOTE: For HTML content sanitization in production, use DOMPurify library
  // https://github.com/cure53/DOMPurify
  // Regex-based HTML sanitization is NOT secure against all XSS vectors
}

// Secure fetch with automatic token handling
async function fetchApi(endpoint: string, options?: RequestInit, skipAuth = false): Promise<any> {
  let accessToken = TokenManager.getAccessToken();
  
  // Check if token is expired and try to refresh
  if (!skipAuth && accessToken && TokenManager.isTokenExpired(accessToken)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = TokenManager.getAccessToken();
    } else {
      TokenManager.clearTokens();
      // NOTE: Using window.location for demo. In production with React Router:
      // - Pass navigate function from useNavigate hook
      // - Or dispatch a logout action that components can handle
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add authorization header if we have a token and not skipping auth
  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token once
    if (response.status === 401 && !skipAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        const newAccessToken = TokenManager.getAccessToken();
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.statusText}`);
        }
        
        return retryResponse.json();
      } else {
        TokenManager.clearTokens();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    TokenManager.setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export const ApiService = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string } | null> {
    try {
      const response = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email: InputSanitizer.sanitizeString(email), 
          password 
        }),
      }, true); // Skip auth for login

      // Store tokens
      TokenManager.setTokens(response.access_token, response.refresh_token);

      return {
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout(): void {
    TokenManager.clearTokens();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await fetchApi('/api/auth/me');
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getFabrics(): Promise<Fabric[]> {
    return fetchApi('/api/fabrics');
  },

  async addFabric(fabric: Fabric): Promise<void> {
    // Sanitize input
    const sanitizedFabric = {
      ...fabric,
      name: InputSanitizer.sanitizeString(fabric.name),
      type: InputSanitizer.sanitizeString(fabric.type),
      color: InputSanitizer.sanitizeString(fabric.color),
    };
    
    await fetchApi('/api/fabrics', {
      method: 'POST',
      body: JSON.stringify(sanitizedFabric),
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
    // Sanitize input
    const sanitizedRequest = {
      ...request,
      umkmName: InputSanitizer.sanitizeString(request.umkmName),
      supplierName: InputSanitizer.sanitizeString(request.supplierName),
      fabricName: InputSanitizer.sanitizeString(request.fabricName),
      fabricColor: InputSanitizer.sanitizeString(request.fabricColor),
      notes: request.notes ? InputSanitizer.sanitizeString(request.notes) : undefined,
    };
    
    await fetchApi('/api/requests', {
      method: 'POST',
      body: JSON.stringify(sanitizedRequest),
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
    // Sanitize input
    const sanitizedProduct = {
      ...product,
      name: InputSanitizer.sanitizeString(product.name),
      color: InputSanitizer.sanitizeString(product.color),
    };
    
    await fetchApi('/api/hijab-products', {
      method: 'POST',
      body: JSON.stringify(sanitizedProduct),
    });
  },

  async getSales(): Promise<HijabSale[]> {
    return fetchApi('/api/sales');
  },

  async recordSale(sale: HijabSale): Promise<void> {
    // Sanitize input
    const sanitizedSale = {
      ...sale,
      productName: InputSanitizer.sanitizeString(sale.productName),
      trackingNumber: InputSanitizer.sanitizeString(sale.trackingNumber),
    };
    
    await fetchApi('/api/sales', {
      method: 'POST',
      body: JSON.stringify(sanitizedSale),
    });
  },

  async getUsageHistory(): Promise<UsageLog[]> {
    return fetchApi('/api/usage-history');
  },

  async recordUsage(log: UsageLog): Promise<void> {
    // Sanitize input
    const sanitizedLog = {
      ...log,
      productName: InputSanitizer.sanitizeString(log.productName),
      fabricName: InputSanitizer.sanitizeString(log.fabricName),
    };
    
    await fetchApi('/api/usage-history', {
      method: 'POST',
      body: JSON.stringify(sanitizedLog),
    });
  }
};
