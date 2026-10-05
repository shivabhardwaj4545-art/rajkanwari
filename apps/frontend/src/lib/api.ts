export interface ProductPrice {
  mrp_paise: number;
  product_discount_percent: number;
  base_price_paise: number;
  offer_discount_paise: number;
  final_price_paise: number;
  effective_discount_percent: number;
  applied_offer: {
    id: string;
    name: string;
    offer_category?: string;
    code?: string | null;
    discount_paise: number;
  } | null;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  variant_sku: string;
  price_override: number | null;
  stock: number;
  weight_grams?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  fabric: string;
  occasion: string;
  gender: 'men' | 'women' | 'unisex';
  care_instructions?: string;
  sku: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  images: string[];
  is_featured: boolean;
  total_stock: number;
  variants: ProductVariant[];
  price: ProductPrice;
}

export interface ProductDetail extends ProductItem {
  applicable_offers?: Array<{
    id: string;
    name: string;
    code: string | null;
    offer_category: string;
    type: string;
    value: number;
    max_discount: number | null;
    min_cart_value: number;
    is_auto: boolean;
  }>;
  related_products: Array<{
    id: string;
    name: string;
    slug: string;
    category_name: string;
    images: string[];
    price: ProductPrice;
  }>;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  product_count: number;
  is_active?: boolean;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  text_alignment?: 'left' | 'right';
  text_color?: string;
  offer_category?: string;
  gradient_style?: string;
  display_order: number;
}

export interface OfferItem {
  id: string;
  name: string;
  code: string | null;
  offer_category?: string;
  type: string;
  value: number;
  max_discount: number | null;
  min_cart_value: number;
  scope?: 'all' | 'category' | 'product';
  scope_ids?: string[] | string;
  banner_image_url?: string | null;
}

export interface ProductsResponse {
  data: ProductItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
    next_cursor: string | null;
    total_pages: number;
    current_page: number;
  };
}

export interface SearchProductItem {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  primary_image: string | null;
  mrp_paise: number;
  final_price_paise: number;
  discount_percent: number;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rajkanwari_access_token') || localStorage.getItem('shikkis_access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rajkanwari_refresh_token') || localStorage.getItem('shikkis_refresh_token');
}

export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rajkanwari_access_token', accessToken);
  localStorage.setItem('shikkis_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('rajkanwari_refresh_token', refreshToken);
    localStorage.setItem('shikkis_refresh_token', refreshToken);
  }
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('rajkanwari_access_token');
  localStorage.removeItem('shikkis_access_token');
  localStorage.removeItem('rajkanwari_refresh_token');
  localStorage.removeItem('shikkis_refresh_token');
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

export type AuthSessionListener = (user: UserProfile, accessToken: string, refreshToken?: string) => void;
let sessionListeners: AuthSessionListener[] = [];

export function onAuthSessionRefreshed(listener: AuthSessionListener): () => void {
  sessionListeners.push(listener);
  return () => {
    sessionListeners = sessionListeners.filter((l) => l !== listener);
  };
}

function notifySessionRefreshed(user: UserProfile, accessToken: string, refreshToken?: string) {
  sessionListeners.forEach((l) => {
    try {
      l(user, accessToken, refreshToken);
    } catch (e) {
      console.error('Error in auth session listener:', e);
    }
  });
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T>(endpoint: string, options?: RequestInit, isRetry = false): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`/api${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    // Attempt automatic silent token refresh on 401 or on 403 when hitting admin endpoints
    const shouldRefresh =
      ((res.status === 401) || (res.status === 403 && endpoint.startsWith('/admin'))) &&
      !isRetry &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/refresh');

    if (shouldRefresh) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const data = await refreshRes.json();
              setAuthTokens(data.accessToken, data.refreshToken);
              if (data.user) {
                notifySessionRefreshed(data.user, data.accessToken, data.refreshToken);
              }
              isRefreshing = false;
              onRefreshed(data.accessToken);
              return request<T>(endpoint, options, true);
            } else if (refreshRes.status === 401 || refreshRes.status === 403) {
              // Only clear tokens if refresh token is explicitly rejected as invalid/expired
              clearAuthTokens();
              isRefreshing = false;
              refreshSubscribers = [];
            } else {
              isRefreshing = false;
              refreshSubscribers = [];
            }
          } catch {
            // Transient network failure: keep tokens safe, do not log user out
            isRefreshing = false;
            refreshSubscribers = [];
          }
        } else {
          // Wait for concurrent refresh to complete
          return new Promise<T>((resolve, reject) => {
            subscribeTokenRefresh(() => {
              request<T>(endpoint, options, true).then(resolve).catch(reject);
            });
          });
        }
      }
    }

    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData?.error?.message || `API error: ${res.status}`);
    err.status = res.status;
    err.code = errorData?.error?.code;
    throw err;
  }

  return res.json();
}

export const api = {
  // Products
  getProducts: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return request<ProductsResponse>(`/products${qStr ? `?${qStr}` : ''}`);
  },

  getProductBySlug: (slug: string) => {
    return request<{ data: ProductDetail }>(`/products/${encodeURIComponent(slug)}`);
  },

  searchProducts: (q: string) => {
    return request<{ data: SearchProductItem[] }>(`/products/search?q=${encodeURIComponent(q)}`);
  },

  // Categories
  getCategories: () => {
    return request<{ data: CategoryItem[] }>('/categories');
  },

  createCategory: (data: { name: string; description?: string; image_url?: string; display_order?: number }) => {
    return request<{ data: CategoryItem }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: (id: string, data: Partial<CategoryItem>) => {
    return request<{ data: CategoryItem }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: (id: string) => {
    return request<{ success: boolean }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Banners
  getActiveBanners: () => {
    return request<{ data: BannerItem[] }>('/banners/active');
  },

  getActiveOffers: () => {
    return request<{ data: OfferItem[] }>('/offers/active');
  },

  // Cart
  getCart: () => {
    return request<{ cart_id: string; breakdown: CartBreakdown }>('/cart');
  },

  addToCart: (variant_id: string, quantity: number = 1) => {
    return request<{ cart_id: string; breakdown: CartBreakdown }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variant_id, quantity }),
    });
  },

  updateCartItem: (itemId: string, quantity: number) => {
    return request<{ cart_id: string; breakdown: CartBreakdown }>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  removeCartItem: (itemId: string) => {
    return request<{ cart_id: string; breakdown: CartBreakdown }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  applyCoupon: (code: string) => {
    return request<{ cart_id: string; breakdown: CartBreakdown }>('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  removeCoupon: () => {
    return request<{ cart_id: string; breakdown: CartBreakdown }>('/cart/coupon', {
      method: 'DELETE',
    });
  },

  createOrder: (orderData: any) => {
    return request<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Orders
  getOrders: (params?: {
    status?: string | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return request<{
      data: OrderListItem[];
      pagination: { total: number; page: number; limit: number; total_pages: number };
    }>(`/orders${qStr ? `?${qStr}` : ''}`);
  },

  getOrderById: (id: string) => {
    return request<{ order: OrderDetail }>(`/orders/${id}`);
  },

  payOrderOnline: (id: string) => {
    return request<{
      order_id: string;
      order_number: string;
      razorpay: {
        key_id: string;
        order_id: string;
        amount: number;
        currency: string;
      };
    }>(`/orders/${id}/pay`, {
      method: 'POST',
    });
  },

  verifyRazorpayPayment: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return request<{
      success: boolean;
      order_id: string;
      order_number: string;
      payment_status: string;
    }>('/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  customerRequestReturn: (
    id: string,
    data: {
      reason: string;
      comments?: string | undefined;
      refund_preference?: string | undefined;
    }
  ) => {
    return request<{ success: boolean; message: string; order_id: string; order_status: string }>(
      `/orders/${id}/return-request`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Auth
  login: (email: string, password: string = 'Customer123!') => {
    return request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  googleLogin: (credential: string) => {
    return request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string | undefined;
    phone?: string | undefined;
  }) => {
    return request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: () => {
    return request<{ user: UserProfile }>('/auth/me');
  },

  refreshToken: (refreshToken: string) => {
    return request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout: () => {
    return request<{ message: string }>('/auth/logout', { method: 'POST' });
  },

  getDemoUsers: () => {
    return request<{ users: Array<{ id: string; email: string; first_name: string; last_name: string; role: string }> }>('/auth/demo-users');
  },

  // ─── Admin Endpoints (Owner only) ──────────────────────────────────────────
  adminGetProducts: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    category_id?: string | undefined;
    gender?: string | undefined;
    is_active?: string | undefined;
    sort_by?: string | undefined;
    order?: 'asc' | 'desc' | undefined;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request<{
      data: AdminProductItem[];
      pagination: { total: number; page: number; limit: number; total_pages: number };
    }>(`/admin/products${qStr ? `?${qStr}` : ''}`);
  },

  adminGetProductById: (id: string) => {
    return request<{ product: AdminProductDetail; variants: AdminVariantItem[] }>(`/admin/products/${id}`);
  },

  adminCreateProduct: (data: any) => {
    return request<{ product_id: string; slug: string; message: string }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  adminUpdateProduct: (id: string, data: any) => {
    return request<{ message: string }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  adminToggleProductStatus: (id: string, is_active: boolean) => {
    return request<{ success: boolean; is_active: boolean }>(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  },

  adminBulkProducts: (ids: string[], action: 'activate' | 'deactivate' | 'delete') => {
    return request<{ success: boolean; count: number; action: string }>('/admin/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action }),
    });
  },

  adminUploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('shikkis_access_token') : null;
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Failed to upload image');
    }
    return res.json() as Promise<{ url: string; filename: string }>;
  },

  adminGetInventory: (params?: {
    search?: string | undefined;
    low_stock?: boolean | undefined;
    order?: 'asc' | 'desc' | undefined;
    page?: number | undefined;
    limit?: number | undefined;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request<{
      data: AdminInventoryItem[];
      pagination: { total: number; page: number; limit: number; total_pages: number };
    }>(`/admin/inventory${qStr ? `?${qStr}` : ''}`);
  },

  adminBatchUpdateStock: (variant_ids: string[], stock: number) => {
    return request<{ success: boolean; updated_count: number; new_stock: number; message: string }>(
      '/admin/inventory/batch',
      {
        method: 'POST',
        body: JSON.stringify({ variant_ids, stock }),
      }
    );
  },

  adminAddInventoryVariant: (data: {
    product_id: string;
    size: string;
    color: string;
    stock: number;
    variant_sku?: string | undefined;
    price_override?: number | undefined;
    weight_grams?: number | undefined;
  }) => {
    return request<{ success: boolean; variant_id: string; message: string }>(
      '/admin/inventory/variant',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  adminGetInventoryAuditLogs: () => {
    return request<{ data: AdminAuditLogItem[] }>('/admin/inventory/audit-log');
  },

  adminGetOffers: () => {
    return request<{ data: AdminOfferItem[] }>('/admin/offers');
  },

  adminCreateOffer: (data: any) => {
    return request<{ offer_id: string; message: string }>('/admin/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  adminToggleOffer: (id: string) => {
    return request<{ success: boolean; is_active: boolean }>(`/admin/offers/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  adminDeleteOffer: (id: string) => {
    return request<{ success: boolean; message: string }>(`/admin/offers/${id}`, {
      method: 'DELETE',
    });
  },

  adminUpdateOffer: (id: string, data: any) => {
    return request<{ success: boolean; message: string }>(`/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  adminGetProductOffers: (productId: string) => {
    return request<{ data: AdminOfferItem[]; product: any }>(`/admin/products/${productId}/offers`);
  },

  adminToggleProductOffer: (productId: string, offerId: string, apply?: boolean) => {
    return request<{
      success: boolean;
      is_applied: boolean;
      scope: 'all' | 'category' | 'product';
      scope_ids: string[];
      message: string;
    }>(
      `/admin/products/${productId}/offers/toggle`,
      {
        method: 'POST',
        body: JSON.stringify({ offer_id: offerId, apply }),
      }
    );
  },

  adminGetBanners: () => {
    return request<{ data: AdminBannerItem[] }>('/admin/banners');
  },

  adminCreateBanner: (data: any) => {
    return request<{ banner_id: string; message: string }>('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  adminReorderBanners: (items: Array<{ id: string; display_order: number }>) => {
    return request<{ success: boolean; message: string }>('/admin/banners/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  adminDeleteBanner: (id: string) => {
    return request<{ success: boolean; message: string }>(`/admin/banners/${id}`, {
      method: 'DELETE',
    });
  },

  adminUpdateBanner: (id: string, data: any) => {
    return request<{ success: boolean; message: string }>(`/admin/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ── Part 4: Orders Management ──────────────────────────────────────────────
  adminGetOrders: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    status?: string | undefined;
    payment_status?: string | undefined;
    fulfillment_type?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    search?: string | undefined;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      if (params.page) q.append('page', String(params.page));
      if (params.limit) q.append('limit', String(params.limit));
      if (params.status && params.status !== 'all') q.append('status', params.status);
      if (params.payment_status && params.payment_status !== 'all') q.append('payment_status', params.payment_status);
      if (params.fulfillment_type && params.fulfillment_type !== 'all') q.append('fulfillment_type', params.fulfillment_type);
      if (params.date_from) q.append('date_from', params.date_from);
      if (params.date_to) q.append('date_to', params.date_to);
      if (params.search) q.append('search', params.search);
    }
    const qStr = q.toString();
    return request<{
      data: AdminOrderItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/orders${qStr ? `?${qStr}` : ''}`);
  },

  adminGetOrderById: (id: string) => {
    return request<{ order: AdminOrderDetail }>(`/admin/orders/${id}`);
  },

  adminAdvanceOrderStatus: (id: string, data: { status: string; note?: string | undefined }) => {
    return request<{ success: boolean; message: string; order_id: string; new_status: string }>(
      `/admin/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  adminUpdateOrderNotes: (id: string, internal_notes: string) => {
    return request<{ success: boolean; message: string }>(`/admin/orders/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ internal_notes }),
    });
  },

  adminRefundOrder: (
    id: string,
    data?: string | { reason?: string | undefined; refund_method?: string | undefined; refund_type?: string | undefined } | undefined
  ) => {
    const payload = typeof data === 'string' ? { reason: data } : (data || {});
    return request<{ success: boolean; message: string; refund_id: string; refund_amount: number; refund_method?: string }>(
      `/admin/orders/${id}/refund`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  adminReturnOrder: (
    id: string,
    data: {
      reason: string;
      notes?: string | undefined;
      restock?: boolean | undefined;
      refund?: boolean | undefined;
      refund_method?: ('gateway' | 'manual' | 'store_credit') | undefined;
    }
  ) => {
    return request<{
      success: boolean;
      message: string;
      order_id: string;
      order_status: string;
      restocked_count: number;
      refunded: boolean;
      refund_id?: string | null;
    }>(`/admin/orders/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  adminConfirmPayment: (
    id: string,
    data?: { reference?: string | undefined; note?: string | undefined } | undefined
  ) => {
    return request<{ success: boolean; message: string; order_id: string; payment_status: string }>(
      `/admin/orders/${id}/confirm-payment`,
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }
    );
  },

  adminGetPackingSlip: (id: string) => {
    return request<AdminPackingSlipData>(`/admin/orders/${id}/packing-slip`);
  },

  // ── Part 5: Customers CRM ──────────────────────────────────────────────────
  adminGetCustomers: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: string | undefined;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      if (params.page) q.append('page', String(params.page));
      if (params.limit) q.append('limit', String(params.limit));
      if (params.search) q.append('search', params.search);
      if (params.sortBy) q.append('sortBy', params.sortBy);
      if (params.sortOrder) q.append('sortOrder', params.sortOrder);
    }
    const qStr = q.toString();
    return request<{
      data: AdminCustomerListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/customers${qStr ? `?${qStr}` : ''}`);
  },

  adminGetCustomerById: (id: string) => {
    return request<AdminCustomerDetail>(`/admin/customers/${id}`);
  },

  // ── Part 6: Reports & Analytics ────────────────────────────────────────────
  adminGetReportsKpis: (period: string = 'month') => {
    return request<AdminReportsKpis>(`/admin/reports/kpis?period=${period}`);
  },

  adminGetRevenueTrend: () => {
    return request<{ trend: AdminRevenueTrendItem[] }>('/admin/reports/revenue-trend');
  },

  adminGetTopProducts: (period: string = 'all') => {
    return request<{
      period: string;
      top_by_units: AdminTopProductItem[];
      top_by_revenue: AdminTopProductItem[];
    }>(`/admin/reports/top-products?period=${period}`);
  },

  adminGetCategoryPerformance: (period: string = 'all') => {
    return request<{ period: string; categories: AdminCategoryPerformanceItem[] }>(
      `/admin/reports/category-performance?period=${period}`
    );
  },

  adminGetSoldItems: (params?: {
    period?: string | undefined;
    category_id?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      if (params.period) q.append('period', params.period);
      if (params.category_id && params.category_id !== 'all') q.append('category_id', params.category_id);
      if (params.page) q.append('page', String(params.page));
      if (params.limit) q.append('limit', String(params.limit));
    }
    const qStr = q.toString();
    return request<{
      data: AdminSoldItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/reports/sold-items${qStr ? `?${qStr}` : ''}`);
  },
};

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'owner' | 'customer';
}

export interface OrderListItem {
  id: string;
  order_number: string;
  created_at: string;
  fulfillment_type: 'delivery' | 'pickup';
  pickup_slot?: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'online' | 'cod';
  order_status:
    | 'placed'
    | 'confirmed'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'delivered'
    | 'picked_up'
    | 'cancelled';
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  items_count: number;
  thumbnails: string[];
}

export interface OrderItemDetail {
  id: string;
  variant_id: string;
  product_id?: string;
  product_slug?: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  price_at_purchase: number;
  discount_at_purchase: number;
  current_stock: number;
  is_available: boolean;
  image_url: string;
}

export interface OrderTimelineStep {
  id: string;
  status: string;
  note?: string | null;
  created_at: string;
}

export interface OrderDetail {
  id: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  fulfillment_type: 'delivery' | 'pickup';
  pickup_slot?: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'online' | 'cod';
  order_status:
    | 'placed'
    | 'confirmed'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'delivered'
    | 'picked_up'
    | 'cancelled'
    | 'returned';
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  delivery_address_snapshot?: any;
  customer_notes?: string | null;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  items: OrderItemDetail[];
  timeline: OrderTimelineStep[];
}

export interface CreateOrderResponse {
  order_id: string;
  order_number: string;
  order?: any;
  token?: string;
  user?: UserProfile;
  razorpay?: {
    key_id: string;
    amount: number;
    currency: string;
    order_id: string;
  };
}

export interface CartLineItem {
  variant_id: string;
  product_id: string;
  category_id: string;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  image_url: string;
  quantity: number;
  stock: number;
  unit_mrp_paise: number;
  unit_product_discount_percent: number;
  unit_base_price_paise: number;
  unit_auto_discount_paise: number;
  unit_final_price_paise: number;
  line_mrp_paise: number;
  line_subtotal_paise: number;
  applied_auto_offer?: {
    id: string;
    name: string;
    discount_paise: number;
  };
}

export interface NamedDiscount {
  offer_id: string;
  name: string;
  code: string | null;
  discount_paise: number;
}

export interface CartBreakdown {
  items: CartLineItem[];
  subtotal_mrp_paise: number;
  subtotal_base_paise?: number;
  catalog_discount_paise?: number;
  subtotal_paise: number;
  total_discount_paise: number;
  discounts: NamedDiscount[];
  coupon?: {
    code: string;
    name: string;
    discount_paise: number;
  };
  coupon_error?: string;
  shipping_paise: number;
  tax_paise: number;
  total_paise: number;
  applied_offers: Array<{
    id: string;
    name: string;
    type: string;
    discount_paise: number;
  }>;
}

// ─── Admin Type Interfaces ───────────────────────────────────────────────────

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  gender: 'men' | 'women' | 'unisex';
  mrp: number;
  discount_percent: number;
  final_price_paise: number;
  sku: string;
  images: string[];
  primary_image: string | null;
  is_active: boolean;
  is_featured: boolean;
  total_stock: number;
  variant_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminVariantItem {
  id?: string;
  product_id?: string;
  size: string;
  color: string;
  variant_sku: string;
  price_override?: number | null;
  stock: number;
  is_active?: boolean;
}

export interface AdminProductDetail {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  fabric?: string;
  occasion?: string;
  gender: 'men' | 'women' | 'unisex';
  care_instructions?: string;
  mrp: number;
  discount_percent: number;
  sku: string;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
}

export interface AdminInventoryItem {
  variant_id: string;
  variant_sku: string;
  size: string;
  color: string;
  stock: number;
  price_override: number | null;
  variant_active: number;
  product_id: string;
  product_name: string;
  product_sku: string;
  mrp: number;
  discount_percent: number;
  category_name: string;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  entity_id: string;
  changes: any;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface AdminOfferItem {
  id: string;
  name: string;
  code: string | null;
  offer_category?: string;
  type: 'percent' | 'flat' | 'bxgy' | 'free_shipping';
  value: number;
  max_discount: number | null;
  min_cart_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  stackable: boolean;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  scope: 'all' | 'category' | 'product';
  scope_ids: string[];
  banner_image_url: string | null;
  priority: number;
  redemption_count: number;
  total_discount_disbursed: number;
  derived_status: 'scheduled' | 'running' | 'expired';
  is_applied_to_product?: boolean;
  is_direct_product_scope?: boolean;
}

export interface AdminBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  cta_text: string;
  cta_link: string;
  text_alignment?: 'left' | 'right';
  text_color?: string;
  offer_category?: string;
  gradient_style?: string;
  display_order: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
}

export interface AdminOrderItem {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  fulfillment_type: 'delivery' | 'pickup';
  pickup_slot: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'online' | 'cod';
  order_status: 'placed' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'picked_up' | 'cancelled' | 'returned';
  customer_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  thumbnails: string[];
}

export interface AdminOrderDetailItem {
  id: string;
  variant_id: string;
  variant_sku: string;
  product_name: string;
  product_slug: string;
  size: string;
  color: string;
  quantity: number;
  price_at_purchase: number;
  discount_at_purchase: number;
  thumbnail: string | null;
}

export interface AdminOrderDetailHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  changed_by: string | null;
  changed_by_name: string | null;
  created_at: string;
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  fulfillment_type: 'delivery' | 'pickup';
  pickup_slot: string | null;
  delivery_address_snapshot: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'online' | 'cod';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  order_status: 'placed' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'picked_up' | 'cancelled' | 'returned';
  customer_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  items: AdminOrderDetailItem[];
  history: AdminOrderDetailHistory[];
  allowed_next_statuses: string[];
}

export interface AdminPackingSlipData {
  order_number: string;
  created_at: string;
  fulfillment_type: 'delivery' | 'pickup';
  pickup_slot: string | null;
  payment_status?: string;
  payment_method?: string;
  total_amount?: number;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  delivery_address: any;
  customer_notes: string | null;
  internal_notes: string | null;
  items: Array<{
    id: string;
    sku: string;
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    price_at_purchase?: number;
  }>;
  total_items: number;
}

export interface AdminCustomerListItem {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string | null;
  join_date: string;
  order_count: number;
  lifetime_spend: number;
  last_order_date: string | null;
}

export interface AdminCustomerDetail {
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: number;
    created_at: string;
  };
  analytics: {
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    lifetime_spend: number;
    aov: number;
    last_order_date: string | null;
  };
  addresses: any[];
  orders: Array<{
    id: string;
    order_number: string;
    fulfillment_type: string;
    order_status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    item_count: number;
  }>;
}

export interface AdminReportsKpis {
  period: string;
  total_revenue: number;
  total_orders: number;
  aov: number;
  units_sold: number;
}

export interface AdminRevenueTrendItem {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface AdminTopProductItem {
  product_name: string;
  units_sold: number;
  revenue: number;
}

export interface AdminCategoryPerformanceItem {
  id: string;
  name: string;
  order_count: number;
  units_sold: number;
  revenue: number;
}

export interface AdminSoldItem {
  id: string;
  order_number: string;
  order_date: string;
  customer_name: string;
  category_name: string | null;
  product_name: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  price_at_purchase: number;
  discount_at_purchase: number;
  net_total: number;
}


