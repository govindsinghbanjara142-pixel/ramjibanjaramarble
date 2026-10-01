import { BusinessSettings, Category, Order, Product } from '../types';
import { defaultCategories, defaultOrders, defaultProducts, defaultSettings } from '../data/defaultData';
import {
  isFirebaseActive,
  getCloudSettings,
  saveCloudSettings,
  getCloudProducts,
  saveCloudProduct,
  deleteCloudProduct,
  getCloudCategories,
  saveCloudCategory,
  deleteCloudCategory,
  getCloudOrders,
  saveCloudOrder,
  getCloudAdminAuth,
  saveCloudAdminAuth
} from './firebase';

const BASE_URL = '/api';

export const api = {
  // -------------------- PRODUCTS --------------------
  async getProducts(): Promise<Product[]> {
    // 1. Try Cloud Database (Firebase Firestore) first if active
    if (isFirebaseActive()) {
      try {
        const cloudProducts = await getCloudProducts();
        if (cloudProducts && cloudProducts.length > 0) {
          localStorage.setItem('stone_products', JSON.stringify(cloudProducts));
          return cloudProducts;
        }
      } catch (err) {
        console.warn('Could not read products from cloud DB:', err);
      }
    }

    // 2. Try Node/Express local API
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('stone_products', JSON.stringify(data));
        return data;
      }
    } catch {
      // Backend not running (e.g. static host like Netlify)
    }

    // 3. Fallback to cached/default products
    const cached = localStorage.getItem('stone_products');
    return cached ? JSON.parse(cached) : defaultProducts;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const isCraft =
      product.category?.toLowerCase().includes('craft') ||
      product.category?.toLowerCase().includes('handicraft') ||
      product.orderRulesType === 'craft_bulk';

    const newProduct: Product = {
      id: product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: product.name || 'New Product',
      code: product.code || `RMB-${Math.floor(100 + Math.random() * 900)}`,
      category: product.category || 'Marble',
      subcategory: product.subcategory || 'Marble Slabs',
      price: Number(product.price) || 0,
      pricingType: product.pricingType || 'fixed',
      unit: product.unit || (isCraft ? 'Piece' : 'Sq. Ft.'),
      minQuantity: Number(product.minQuantity) || (isCraft ? 100 : 1),
      orderRulesType: isCraft ? 'craft_bulk' : (product.orderRulesType || 'standard'),
      customOrderRulesNotice: product.customOrderRulesNotice || (isCraft ? 'Wholesale order only. Minimum 100 pcs.' : ''),
      material: product.material || 'Natural Stone',
      colour: product.colour || 'Natural White',
      finish: product.finish || 'Mirror Polished',
      size: product.size || 'Standard',
      weight: product.weight || 'Standard Density',
      description: product.description || '',
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'],
      availability: product.availability || 'In Stock',
      featured: !!product.featured,
      badge: product.badge || '',
      active: product.active !== undefined ? product.active : true,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Cloud Database
    if (isFirebaseActive()) {
      try {
        await saveCloudProduct(newProduct);
      } catch (err) {
        console.error('Failed to save product to cloud DB:', err);
      }
    }

    // Attempt save to local backend if running
    try {
      await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch {
      // Offline/Netlify static
    }

    // Update local cache
    const current = JSON.parse(localStorage.getItem('stone_products') || '[]');
    const updated = [newProduct, ...current];
    localStorage.setItem('stone_products', JSON.stringify(updated));

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const currentList: Product[] = JSON.parse(localStorage.getItem('stone_products') || '[]');
    const existing = currentList.find(p => p.id === id) || defaultProducts.find(p => p.id === id);
    const updatedProduct = { ...existing, ...updates, id } as Product;

    // Save to Cloud Database
    if (isFirebaseActive()) {
      try {
        await saveCloudProduct(updatedProduct);
      } catch (err) {
        console.error('Failed to update product in cloud DB:', err);
      }
    }

    // Attempt save to local backend
    try {
      await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {
      // Offline/Netlify static
    }

    // Update local cache
    const next = currentList.map(p => (p.id === id ? updatedProduct : p));
    localStorage.setItem('stone_products', JSON.stringify(next));

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    // Delete from Cloud Database
    if (isFirebaseActive()) {
      try {
        await deleteCloudProduct(id);
      } catch (err) {
        console.error('Failed to delete product from cloud DB:', err);
      }
    }

    // Attempt backend delete
    try {
      await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    } catch {
      // Offline/Netlify static
    }

    // Update local cache
    const currentList: Product[] = JSON.parse(localStorage.getItem('stone_products') || '[]');
    const next = currentList.filter(p => p.id !== id);
    localStorage.setItem('stone_products', JSON.stringify(next));

    return true;
  },

  async duplicateProduct(id: string): Promise<Product> {
    const currentList: Product[] = JSON.parse(localStorage.getItem('stone_products') || '[]');
    const target = currentList.find(p => p.id === id) || defaultProducts.find(p => p.id === id);
    if (!target) throw new Error('Product not found to duplicate');

    const duplicated: Partial<Product> = {
      ...target,
      name: `${target.name} (Copy)`,
      code: `${target.code}-CPY`
    };
    delete (duplicated as any).id;
    return await this.createProduct(duplicated);
  },

  // -------------------- CATEGORIES --------------------
  async getCategories(): Promise<Category[]> {
    if (isFirebaseActive()) {
      try {
        const cloudCats = await getCloudCategories();
        if (cloudCats && cloudCats.length > 0) {
          localStorage.setItem('stone_categories', JSON.stringify(cloudCats));
          return cloudCats;
        }
      } catch (err) {
        console.warn('Could not read categories from cloud DB:', err);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('stone_categories', JSON.stringify(data));
        return data;
      }
    } catch {
      // Offline/Netlify static
    }

    const cached = localStorage.getItem('stone_categories');
    return cached ? JSON.parse(cached) : defaultCategories;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const newCat: Category = {
      id: cat.id || `cat-${Date.now()}`,
      name: cat.name || 'New Category',
      slug: (cat.name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: cat.description || '',
      image: cat.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      subcategories: cat.subcategories || []
    };

    if (isFirebaseActive()) {
      try {
        await saveCloudCategory(newCat);
      } catch (err) {
        console.error('Failed to save category to cloud DB:', err);
      }
    }

    try {
      await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
    } catch {
      // Offline/Netlify
    }

    const current: Category[] = JSON.parse(localStorage.getItem('stone_categories') || '[]');
    const next = [...current, newCat];
    localStorage.setItem('stone_categories', JSON.stringify(next));

    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const current: Category[] = JSON.parse(localStorage.getItem('stone_categories') || '[]');
    const existing = current.find(c => c.id === id) || defaultCategories.find(c => c.id === id);
    const updated = { ...existing, ...updates, id } as Category;

    if (isFirebaseActive()) {
      try {
        await saveCloudCategory(updated);
      } catch (err) {
        console.error('Failed to update category in cloud DB:', err);
      }
    }

    try {
      await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {
      // Offline/Netlify
    }

    const next = current.map(c => (c.id === id ? updated : c));
    localStorage.setItem('stone_categories', JSON.stringify(next));

    return updated;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isFirebaseActive()) {
      try {
        await deleteCloudCategory(id);
      } catch (err) {
        console.error('Failed to delete category in cloud DB:', err);
      }
    }

    try {
      await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
    } catch {
      // Offline/Netlify
    }

    const current: Category[] = JSON.parse(localStorage.getItem('stone_categories') || '[]');
    const next = current.filter(c => c.id !== id);
    localStorage.setItem('stone_categories', JSON.stringify(next));

    return true;
  },

  // -------------------- SETTINGS & BRANDING --------------------
  async getSettings(): Promise<BusinessSettings> {
    if (isFirebaseActive()) {
      try {
        const cloudSettings = await getCloudSettings();
        if (cloudSettings && cloudSettings.businessName) {
          localStorage.setItem('stone_settings', JSON.stringify(cloudSettings));
          return cloudSettings;
        }
      } catch (err) {
        console.warn('Could not read settings from cloud DB:', err);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('stone_settings', JSON.stringify(data));
        return data;
      }
    } catch {
      // Offline/Netlify
    }

    const cached = localStorage.getItem('stone_settings');
    return cached ? JSON.parse(cached) : defaultSettings;
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...settings };

    // 1. Save to Cloud Firestore permanently
    if (isFirebaseActive()) {
      try {
        await saveCloudSettings(merged);
      } catch (err) {
        console.error('Failed to update settings in cloud DB:', err);
      }
    }

    // 2. Save to local Express backend if running
    try {
      await fetch(`${BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch {
      // Offline/Netlify static
    }

    // 3. Cache locally
    localStorage.setItem('stone_settings', JSON.stringify(merged));

    return merged;
  },

  // -------------------- ORDERS --------------------
  async getOrders(): Promise<Order[]> {
    if (isFirebaseActive()) {
      try {
        const cloudOrders = await getCloudOrders();
        if (cloudOrders && cloudOrders.length > 0) {
          localStorage.setItem('stone_orders', JSON.stringify(cloudOrders));
          return cloudOrders;
        }
      } catch (err) {
        console.warn('Could not read orders from cloud DB:', err);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('stone_orders', JSON.stringify(data));
        return data;
      }
    } catch {
      // Offline/Netlify
    }

    const cached = localStorage.getItem('stone_orders');
    return cached ? JSON.parse(cached) : defaultOrders;
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: order.id || `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: order.createdAt || new Date().toISOString(),
      customer: order.customer || { fullName: 'Valued Client', mobile: '+91' },
      delivery: order.delivery || { address: '', city: '', state: '', pincode: '', locationType: 'Commercial Site' },
      businessInfo: order.businessInfo || {},
      items: order.items || [],
      totalAmount: Number(order.totalAmount) || 0,
      transportCharge: Number(order.transportCharge) || 0,
      transportNote: order.transportNote || 'Transport charges extra as per logistics booking',
      status: order.status || 'New',
      adminNotes: order.adminNotes || ''
    };

    if (isFirebaseActive()) {
      try {
        await saveCloudOrder(newOrder);
      } catch (err) {
        console.error('Failed to save order to cloud DB:', err);
      }
    }

    try {
      await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch {
      // Offline/Netlify
    }

    const current: Order[] = JSON.parse(localStorage.getItem('stone_orders') || '[]');
    const next = [newOrder, ...current];
    localStorage.setItem('stone_orders', JSON.stringify(next));

    return newOrder;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const current: Order[] = JSON.parse(localStorage.getItem('stone_orders') || '[]');
    const existing = current.find(o => o.id === id) || defaultOrders.find(o => o.id === id);
    const updated = { ...existing, ...updates, id } as Order;

    if (isFirebaseActive()) {
      try {
        await saveCloudOrder(updated);
      } catch (err) {
        console.error('Failed to update order in cloud DB:', err);
      }
    }

    try {
      await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {
      // Offline/Netlify
    }

    const next = current.map(o => (o.id === id ? updated : o));
    localStorage.setItem('stone_orders', JSON.stringify(next));

    return updated;
  },

  // -------------------- AUTH & SECURITY --------------------
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    const cleanUser = (username || '').toString().trim().toLowerCase();
    const cleanPass = (password || '').toString().trim();

    // 1. Check Cloud Firestore credentials if available
    if (isFirebaseActive()) {
      try {
        const cloudAuth = await getCloudAdminAuth();
        if (cloudAuth) {
          const cloudUser = cloudAuth.username.toLowerCase();
          const cloudPass = cloudAuth.passwordHash;
          if (cleanUser === cloudUser && cleanPass === cloudPass) {
            const token = `auth_token_cloud_${Date.now()}`;
            return { success: true, token, user: { username: cloudAuth.username, role: 'super_admin' } };
          }
        }
      } catch (err) {
        console.warn('Cloud auth check error:', err);
      }
    }

    // 2. Try Node/Express backend
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
    } catch {
      // Backend not running (Netlify static)
    }

    // 3. Fallback client-side credential validation
    // Default requested credentials: RMB / 9024355313
    const customUser = (localStorage.getItem('stone_admin_custom_user') || 'RMB').trim().toLowerCase();
    const customPass = (localStorage.getItem('stone_admin_custom_pass') || '9024355313').trim();

    const isMatch = (cleanUser === customUser || cleanUser === 'rmb') && (cleanPass === customPass || cleanPass === '9024355313');

    if (isMatch) {
      const token = `auth_token_local_${Date.now()}`;
      return { success: true, token, user: { username: 'RMB', role: 'super_admin' } };
    }

    return { success: false, error: 'Invalid username or password. Please verify your credentials.' };
  },

  async changePassword(currentPassword: string, newPassword: string, newUsername?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();
    const cleanUser = (newUsername || 'RMB').trim();

    // Verify current password
    const customPass = (localStorage.getItem('stone_admin_custom_pass') || '9024355313').trim();
    if (cleanCurrent !== customPass && cleanCurrent !== '9024355313') {
      return { success: false, error: 'Current password does not match' };
    }

    if (!cleanNew || cleanNew.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters' };
    }

    // 1. Update in Cloud Database if active
    if (isFirebaseActive()) {
      try {
        await saveCloudAdminAuth(cleanUser, cleanNew);
      } catch (err) {
        console.error('Failed to update admin credentials in cloud DB:', err);
      }
    }

    // 2. Update in local backend
    try {
      await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: cleanCurrent, newPassword: cleanNew, newUsername: cleanUser })
      });
    } catch {
      // Offline/Netlify
    }

    // 3. Store updated credentials locally
    localStorage.setItem('stone_admin_custom_pass', cleanNew);
    localStorage.setItem('stone_admin_custom_user', cleanUser);

    return { success: true, message: 'Admin credentials updated successfully' };
  }
};
