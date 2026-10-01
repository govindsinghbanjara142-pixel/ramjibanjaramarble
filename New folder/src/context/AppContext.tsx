import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BusinessSettings, Category, Order, OrderItem, Product } from '../types';
import { defaultCategories, defaultOrders, defaultProducts, defaultSettings } from '../data/defaultData';
import { api } from '../services/api';

interface AppContextType {
  products: Product[];
  categories: Category[];
  settings: BusinessSettings;
  orders: Order[];
  loading: boolean;
  isAdminLoggedIn: boolean;
  adminToken: string | null;
  cartItems: OrderItem[];
  addToCart: (product: Product, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  refreshData: () => Promise<void>;
  // Product actions
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product>;
  // Category actions
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  // Settings actions
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<BusinessSettings>;
  // Order actions
  submitOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order>;
  // Admin auth
  loginAdmin: (username: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  changeAdminPassword: (currentPassword: string, newPassword: string, newUsername?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  // Navigation helper
  currentPage: string;
  setCurrentPage: (page: string, params?: Record<string, string>) => void;
  pageParams: Record<string, string>;
  openWhatsAppOrder: (product?: Product, customQty?: number, customerDetails?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('stone_products');
    return cached ? JSON.parse(cached) : defaultProducts;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const cached = localStorage.getItem('stone_categories');
    return cached ? JSON.parse(cached) : defaultCategories;
  });
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const cached = localStorage.getItem('stone_settings');
    return cached ? JSON.parse(cached) : defaultSettings;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem('stone_orders');
    return cached ? JSON.parse(cached) : defaultOrders;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('stone_admin_token');
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('stone_admin_token');
  });

  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    const cached = localStorage.getItem('stone_cart');
    return cached ? JSON.parse(cached) : [];
  });

  // Routing state
  const [currentPage, setCurrentPageState] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  const setCurrentPage = (page: string, params: Record<string, string> = {}) => {
    setCurrentPageState(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedCategories, fetchedSettings, fetchedOrders] = await Promise.all([
        api.getProducts().catch(() => defaultProducts),
        api.getCategories().catch(() => defaultCategories),
        api.getSettings().catch(() => defaultSettings),
        api.getOrders().catch(() => defaultOrders)
      ]);

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setSettings(fetchedSettings);
      setOrders(fetchedOrders);

      localStorage.setItem('stone_products', JSON.stringify(fetchedProducts));
      localStorage.setItem('stone_categories', JSON.stringify(fetchedCategories));
      localStorage.setItem('stone_settings', JSON.stringify(fetchedSettings));
      localStorage.setItem('stone_orders', JSON.stringify(fetchedOrders));
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('stone_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Cart operations
  const addToCart = (product: Product, quantity: number): { success: boolean; message?: string } => {
    // Check Marble Craft rule:
    const isCraft =
      product.orderRulesType === 'craft_bulk' ||
      product.category.toLowerCase().includes('craft') ||
      product.category.toLowerCase().includes('handicraft') ||
      product.category.toLowerCase().includes('brass');

    const effectiveMin = product.minQuantity || (isCraft ? (settings.craftDefaultMinQty || 100) : 1);

    if (quantity < effectiveMin) {
      if (isCraft) {
        return {
          success: false,
          message: `Minimum order quantity is ${effectiveMin} pieces. Bulk/Wholesale orders only.`
        };
      } else {
        return {
          success: false,
          message: `Minimum order quantity for this item is ${effectiveMin} ${product.unit}.`
        };
      }
    }

    const price = product.pricingType === 'fixed' ? product.price : 0;
    const itemTotal = price * quantity;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: price * newQty
        };
        return updated;
      } else {
        const newItem: OrderItem = {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          category: product.category,
          unit: product.unit,
          price: product.price,
          pricingType: product.pricingType,
          quantity: quantity,
          totalPrice: itemTotal,
          orderRulesNote: isCraft ? 'Wholesale Bulk Order (Min 100 pcs)' : `Standard Order (Min ${effectiveMin} ${product.unit})`
        };
        return [...prev, newItem];
      }
    });

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };

    const isCraft =
      product.orderRulesType === 'craft_bulk' ||
      product.category.toLowerCase().includes('craft') ||
      product.category.toLowerCase().includes('handicraft') ||
      product.category.toLowerCase().includes('brass');

    const effectiveMin = product.minQuantity || (isCraft ? (settings.craftDefaultMinQty || 100) : 1);

    if (quantity < effectiveMin) {
      if (isCraft) {
        return {
          success: false,
          message: `Minimum order quantity is ${effectiveMin} pieces. Bulk/Wholesale orders only.`
        };
      } else {
        return {
          success: false,
          message: `Minimum order quantity is ${effectiveMin} ${product.unit}.`
        };
      }
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const price = item.pricingType === 'fixed' ? item.price : 0;
          return {
            ...item,
            quantity,
            totalPrice: price * quantity
          };
        }
        return item;
      })
    );

    return { success: true };
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Product CRUD
  const addProduct = async (productData: Partial<Product>): Promise<Product> => {
    const created = await api.createProduct(productData);
    setProducts(prev => [created, ...prev]);
    localStorage.setItem('stone_products', JSON.stringify([created, ...products]));
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const updated = await api.updateProduct(id, updates);
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
    localStorage.setItem(
      'stone_products',
      JSON.stringify(products.map(p => (p.id === id ? updated : p)))
    );
    return updated;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    localStorage.setItem(
      'stone_products',
      JSON.stringify(products.filter(p => p.id !== id))
    );
  };

  const duplicateProduct = async (id: string): Promise<Product> => {
    const dup = await api.duplicateProduct(id);
    setProducts(prev => [dup, ...prev]);
    localStorage.setItem('stone_products', JSON.stringify([dup, ...products]));
    return dup;
  };

  // Category CRUD
  const addCategory = async (categoryData: Partial<Category>): Promise<Category> => {
    const created = await api.createCategory(categoryData);
    setCategories(prev => [...prev, created]);
    return created;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
    const updated = await api.updateCategory(id, updates);
    setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Settings
  const updateSettings = async (newSettings: Partial<BusinessSettings>): Promise<BusinessSettings> => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    localStorage.setItem('stone_settings', JSON.stringify(updated));
    return updated;
  };

  // Orders
  const submitOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const created = await api.createOrder(orderData);
    setOrders(prev => [created, ...prev]);
    clearCart();
    return created;
  };

  const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
    try {
      const updated = await api.updateOrder(id, updates);
      setOrders(prev => {
        const next = prev.map(o => (o.id === id ? updated : o));
        localStorage.setItem('stone_orders', JSON.stringify(next));
        return next;
      });
      return updated;
    } catch {
      let localUpdated: Order | undefined;
      setOrders(prev => {
        const next = prev.map(o => {
          if (o.id === id) {
            localUpdated = { ...o, ...updates };
            return localUpdated;
          }
          return o;
        });
        localStorage.setItem('stone_orders', JSON.stringify(next));
        return next;
      });
      return localUpdated || (updates as Order);
    }
  };

  // Auth
  const loginAdmin = async (username: string, pass: string): Promise<boolean> => {
    const result = await api.login(username, pass);
    if (result.success && result.token) {
      setIsAdminLoggedIn(true);
      setAdminToken(result.token);
      localStorage.setItem('stone_admin_token', result.token);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminToken(null);
    localStorage.removeItem('stone_admin_token');
    setCurrentPage('home');
  };

  const changeAdminPassword = async (currentPassword: string, newPassword: string, newUsername?: string) => {
    return await api.changePassword(currentPassword, newPassword, newUsername);
  };

  // WhatsApp Order Link Generator
  const openWhatsAppOrder = (product?: Product, customQty?: number, customerDetails?: any) => {
    const cleanNumber = (settings.whatsappNumber || '+919829012345').replace(/[^0-9]/g, '');
    let text = `Namaste ${settings.businessName},\nI am interested in placing an inquiry / bulk order.\n\n`;

    if (customerDetails) {
      text += `*Customer Name:* ${customerDetails.fullName || 'N/A'}\n`;
      text += `*Mobile Number:* ${customerDetails.mobile || 'N/A'}\n`;
      if (customerDetails.businessName) text += `*Business Name:* ${customerDetails.businessName}\n`;
      if (customerDetails.city) text += `*City:* ${customerDetails.city}\n`;
      if (customerDetails.state) text += `*State:* ${customerDetails.state}\n`;
      if (customerDetails.pincode) text += `*PIN Code:* ${customerDetails.pincode}\n`;
      if (customerDetails.address) text += `*Full Address:* ${customerDetails.address}\n`;
      if (customerDetails.instagramId) text += `*Instagram ID:* ${customerDetails.instagramId}\n`;
      text += `\n`;
    }

    if (product) {
      const qty = customQty || product.minQuantity || 100;
      text += `*Product Name:* ${product.name}\n`;
      text += `*Product Code:* ${product.code}\n`;
      text += `*Category:* ${product.category} (${product.subcategory})\n`;
      text += `*Quantity:* ${qty} ${product.unit}\n`;
      text += `*Material:* ${product.material}\n`;
      text += `*Pricing:* ${product.pricingType === 'fixed' ? `₹${product.price} / ${product.unit}` : 'Get Quote'}\n`;

      if (product.orderRulesType === 'craft_bulk' || product.category.includes('Craft') || product.category.includes('Handicraft')) {
        text += `\n*Applicable Rules:* Bulk / Wholesale Order Only (Min 100 pcs rule applies). Fixed Price. Transport charges extra.\n*Payment Terms:* 25% advance payment required to confirm the order.\n`;
      } else {
        text += `\n*Applicable Rules:* Natural Stone Order. Min Quantity: ${product.minQuantity} ${product.unit}. Transport charges extra.\n*Payment Terms:* 25% advance payment required to confirm the order.\n`;
      }
    } else if (cartItems.length > 0) {
      text += `*Order Items (${cartItems.length} items):*\n`;
      cartItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.productName} (${item.productCode}) - ${item.quantity} ${item.unit} @ ${item.pricingType === 'fixed' ? `₹${item.price}` : 'Quote'} = ${item.pricingType === 'fixed' ? `₹${item.totalPrice}` : 'TBD'}\n`;
      });
      text += `\n*Transport Charges:* Extra (To be confirmed separately)\n*Payment Terms:* 25% advance payment required to confirm the order.\n`;
    } else {
      text += `Please share your latest marble, granite, and handicraft catalog with wholesale pricing and dispatch terms.`;
    }

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        settings,
        orders,
        loading,
        isAdminLoggedIn,
        adminToken,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        submitOrder,
        updateOrder,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        currentPage,
        setCurrentPage,
        pageParams,
        openWhatsAppOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
