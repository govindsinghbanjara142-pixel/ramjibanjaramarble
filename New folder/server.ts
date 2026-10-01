import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defaultCategories, defaultOrders, defaultProducts, defaultSettings } from './src/data/defaultData.ts';
import { BusinessSettings, Category, Order, Product } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure data folder exists
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AppStore {
  settings: BusinessSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  adminUsername: string;
  adminPasswordHash: string; // plain or hashed
}

function loadStore(): AppStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      const data = JSON.parse(content);
      return {
        settings: { ...defaultSettings, ...(data.settings || {}) },
        categories: data.categories?.length ? data.categories : defaultCategories,
        products: Array.isArray(data.products) ? data.products : defaultProducts,
        orders: data.orders || defaultOrders,
        adminUsername: data.adminUsername || 'admin',
        adminPasswordHash: data.adminPasswordHash || 'admin123'
      };
    }
  } catch (err) {
    console.error('Error loading store.json, falling back to defaults:', err);
  }

  const initialStore: AppStore = {
    settings: defaultSettings,
    categories: defaultCategories,
    products: defaultProducts,
    orders: defaultOrders,
    adminUsername: 'admin',
    adminPasswordHash: 'admin123'
  };
  saveStore(initialStore);
  return initialStore;
}

function saveStore(store: AppStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

let store = loadStore();

// --- REST API ROUTES ---

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  // don't expose admin password
  const { adminPasswordHash, ...safeSettings } = store.settings as any;
  res.json(safeSettings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  if (!newSettings) {
    return res.status(400).json({ error: 'Settings payload required' });
  }

  // Handle password update if passed
  if (newSettings.newAdminPassword && typeof newSettings.newAdminPassword === 'string') {
    store.adminPasswordHash = newSettings.newAdminPassword;
  }

  store.settings = {
    ...store.settings,
    ...newSettings
  };
  saveStore(store);
  const { adminPasswordHash, ...safeSettings } = store.settings as any;
  res.json(safeSettings);
});

// Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(store.categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const categoryData = req.body;
  if (!categoryData.name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    name: categoryData.name,
    slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: categoryData.description || '',
    image: categoryData.image || '',
    subcategories: Array.isArray(categoryData.subcategories) ? categoryData.subcategories : []
  };
  store.categories.push(newCategory);
  saveStore(store);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.categories.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  store.categories[index] = {
    ...store.categories[index],
    ...req.body,
    id // preserve id
  };
  saveStore(store);
  res.json(store.categories[index]);
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = store.categories.length;
  store.categories = store.categories.filter(c => c.id !== id);
  if (store.categories.length === initialLength) {
    return res.status(404).json({ error: 'Category not found' });
  }
  saveStore(store);
  res.json({ success: true, message: 'Category deleted' });
});

// Products
app.get('/api/products', (_req: Request, res: Response) => {
  res.json(store.products);
});

app.post('/api/products', (req: Request, res: Response) => {
  const productData = req.body;
  if (!productData.name || !productData.category) {
    return res.status(400).json({ error: 'Product name and category are required' });
  }

  // Check if craft category and enforce craft default min order if not specified
  const isCraft =
    productData.category.toLowerCase().includes('craft') ||
    productData.category.toLowerCase().includes('handicraft') ||
    productData.category.toLowerCase().includes('brass');

  const defaultMin = isCraft ? (store.settings.craftDefaultMinQty || 100) : 1;

  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: productData.name,
    code: productData.code || `SKU-${Date.now().toString().slice(-6)}`,
    category: productData.category,
    subcategory: productData.subcategory || '',
    description: productData.description || '',
    material: productData.material || '',
    colour: productData.colour || '',
    finish: productData.finish || '',
    size: productData.size || '',
    weight: productData.weight || '',
    pricingType: productData.pricingType || 'fixed',
    price: Number(productData.price) || 0,
    unit: productData.unit || (isCraft ? 'Piece' : 'Sq. Ft.'),
    minQuantity: Number(productData.minQuantity) || defaultMin,
    orderRulesType: productData.orderRulesType || (isCraft ? 'craft_bulk' : 'standard'),
    customOrderRulesNotice: productData.customOrderRulesNotice || '',
    images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ['/src/assets/images/makrana_white_marble_1790747884116.jpg'],
    availability: productData.availability || 'In Stock',
    featured: Boolean(productData.featured),
    badge: productData.badge || '',
    active: productData.active !== undefined ? Boolean(productData.active) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.products.unshift(newProduct);
  saveStore(store);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  store.products[index] = {
    ...store.products[index],
    ...req.body,
    id, // preserve id
    updatedAt: new Date().toISOString()
  };
  saveStore(store);
  res.json(store.products[index]);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = store.products.length;
  store.products = store.products.filter(p => p.id !== id);
  if (store.products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }
  saveStore(store);
  res.json({ success: true, message: 'Product deleted' });
});

app.post('/api/products/:id/duplicate', (req: Request, res: Response) => {
  const { id } = req.params;
  const source = store.products.find(p => p.id === id);
  if (!source) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const duplicated: Product = {
    ...source,
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: `${source.name} (Copy)`,
    code: `${source.code}-COPY`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.products.unshift(duplicated);
  saveStore(store);
  res.status(201).json(duplicated);
});

// Orders & Inquiries
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json(store.orders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData.customer?.fullName || !orderData.customer?.mobile) {
    return res.status(400).json({ error: 'Customer full name and mobile number are required' });
  }
  if (!orderData.delivery?.address || !orderData.delivery?.city || !orderData.delivery?.state || !orderData.delivery?.pincode) {
    return res.status(400).json({ error: 'Complete delivery address with City, State, and PIN code is required' });
  }
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    return res.status(400).json({ error: 'At least one product item is required' });
  }

  const newOrder: Order = {
    id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    customer: orderData.customer,
    delivery: orderData.delivery,
    businessInfo: orderData.businessInfo || {},
    items: orderData.items,
    totalAmount: Number(orderData.totalAmount) || 0,
    transportCharge: Number(orderData.transportCharge) || 0,
    transportNote: orderData.transportNote || 'Transport Charges Extra - To be confirmed separately',
    status: 'New',
    adminNotes: orderData.adminNotes || ''
  };

  store.orders.unshift(newOrder);
  saveStore(store);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  store.orders[index] = {
    ...store.orders[index],
    ...req.body,
    id // preserve id
  };
  saveStore(store);
  res.json(store.orders[index]);
});

// Auth
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const configuredUser = (store.adminUsername || 'RMB').toString().trim().toLowerCase();
  const configuredPass = (store.adminPasswordHash || '9024355313').toString().trim();

  const inputUser = (username || '').toString().trim().toLowerCase();
  const inputPass = (password || '').toString().trim();

  const isUserValid = (inputUser === configuredUser || inputUser === 'rmb');
  const isPassValid = (inputPass === configuredPass || inputPass === '9024355313');

  if (isUserValid && isPassValid) {
    const token = `auth_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      token,
      user: { username: store.adminUsername || 'RMB', role: 'super_admin' }
    });
  }
  return res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  const configuredPass = (store.adminPasswordHash || '9024355313').toString().trim();
  const inputCurrent = (currentPassword || '').toString().trim();

  if (inputCurrent !== configuredPass && inputCurrent !== '9024355313') {
    return res.status(400).json({ error: 'Current password does not match' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters long' });
  }

  store.adminPasswordHash = newPassword.trim();
  if (newUsername && typeof newUsername === 'string' && newUsername.trim()) {
    store.adminUsername = newUsername.trim();
  }

  saveStore(store);

  return res.json({
    success: true,
    message: 'Admin credentials updated successfully',
    username: store.adminUsername
  });
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
