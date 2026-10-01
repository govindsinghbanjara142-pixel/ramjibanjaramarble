import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  Firestore
} from 'firebase/firestore';
import { BusinessSettings, Category, Order, Product } from '../types';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// 1. Get Firebase configuration from env vars or user-entered admin settings
export const getActiveFirebaseConfig = (): FirebaseConfig | null => {
  // Check env vars first (standard for Netlify)
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  // Check custom user config saved via Admin Panel Cloud Settings
  try {
    const custom = localStorage.getItem('stone_custom_firebase_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse custom firebase config:', e);
  }

  return null;
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const getFirestoreDb = (): Firestore | null => {
  if (cachedDb) return cachedDb;

  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    cachedApp = app;
    cachedDb = getFirestore(app);
    return cachedDb;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
};

export const isFirebaseActive = (): boolean => {
  return getFirestoreDb() !== null;
};

// Test connection
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const db = getFirestoreDb();
  if (!db) {
    return {
      success: false,
      message: 'Firebase is not configured. Please add Firebase variables to Netlify or Admin Settings.'
    };
  }

  try {
    const testDoc = doc(db, 'system', 'connection_ping');
    await setDoc(testDoc, { ping: Date.now(), client: 'Ramji Banjara Marble L.U Web' }, { merge: true });
    return {
      success: true,
      message: 'Cloud Firestore connected successfully! All changes will save permanently across all devices.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Firebase connection failed: ${err.message || err}`
    };
  }
};

// ----------------- CRUD FOR SETTINGS -----------------
export const getCloudSettings = async (): Promise<BusinessSettings | null> => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'content', 'business_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch settings from Firestore:', err);
    return null;
  }
};

export const saveCloudSettings = async (settings: BusinessSettings): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'content', 'business_settings');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
    throw err;
  }
};

// ----------------- CRUD FOR PRODUCTS -----------------
export const getCloudProducts = async (): Promise<Product[] | null> => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const colRef = collection(db, 'products');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: Product[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      return items;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch products from Firestore:', err);
    return null;
  }
};

export const saveCloudProduct = async (product: Product): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, { ...product, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
    throw err;
  }
};

export const deleteCloudProduct = async (productId: string): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
    throw err;
  }
};

// ----------------- CRUD FOR CATEGORIES -----------------
export const getCloudCategories = async (): Promise<Category[] | null> => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const colRef = collection(db, 'categories');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: Category[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      return items;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch categories from Firestore:', err);
    return null;
  }
};

export const saveCloudCategory = async (cat: Category): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'categories', cat.id);
    await setDoc(docRef, { ...cat, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Error saving category to Firestore:', err);
    throw err;
  }
};

export const deleteCloudCategory = async (categoryId: string): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting category from Firestore:', err);
    throw err;
  }
};

// ----------------- CRUD FOR ORDERS -----------------
export const getCloudOrders = async (): Promise<Order[] | null> => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: Order[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      return items;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch orders from Firestore:', err);
    return null;
  }
};

export const saveCloudOrder = async (order: Order): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, { ...order, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
    throw err;
  }
};

// ----------------- ADMIN CREDENTIALS IN CLOUD -----------------
export const getCloudAdminAuth = async (): Promise<{ username: string; passwordHash: string } | null> => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'system', 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as { username: string; passwordHash: string };
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch admin auth from Firestore:', err);
    return null;
  }
};

export const saveCloudAdminAuth = async (username: string, passwordHash: string): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'system', 'admin_auth');
    await setDoc(docRef, {
      username: username.trim(),
      passwordHash: passwordHash.trim(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Error saving admin auth to Firestore:', err);
    throw err;
  }
};

// ----------------- FULL INITIAL SYNC TO CLOUD -----------------
export const syncAllToCloud = async (
  settings: BusinessSettings,
  products: Product[],
  categories: Category[],
  orders: Order[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, count: 0, error: 'Cloud Firestore not configured' };
  }

  try {
    // 1. Settings
    await saveCloudSettings(settings);

    // 2. Products
    for (const p of products) {
      await saveCloudProduct(p);
    }

    // 3. Categories
    for (const c of categories) {
      await saveCloudCategory(c);
    }

    // 4. Orders
    for (const o of orders) {
      await saveCloudOrder(o);
    }

    return {
      success: true,
      count: products.length + categories.length + orders.length + 1
    };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || String(err) };
  }
};
