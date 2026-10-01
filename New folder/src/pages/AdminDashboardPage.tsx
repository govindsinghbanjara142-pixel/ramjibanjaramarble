import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Category, Order, OrderStatus, UnitType } from '../types';
import {
  isFirebaseActive,
  testFirebaseConnection,
  syncAllToCloud,
  getActiveFirebaseConfig
} from '../services/firebase';
import {
  Package,
  Layers,
  ShoppingBag,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  Search,
  LogOut,
  Save,
  AlertCircle,
  Truck,
  ExternalLink,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  Lock,
  Shield,
  Database,
  Cloud,
  RefreshCw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const {
    products,
    categories,
    settings,
    orders,
    isAdminLoggedIn,
    logoutAdmin,
    setCurrentPage,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    updateOrder,
    changeAdminPassword
  } = useApp();

  // If not logged in, redirect to login via useEffect to prevent render-phase state update
  useEffect(() => {
    if (!isAdminLoggedIn) {
      setCurrentPage('admin-login');
    }
  }, [isAdminLoggedIn, setCurrentPage]);

  if (!isAdminLoggedIn) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'settings' | 'security' | 'cloud'>('products');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cloud Database & Netlify states
  const [isCloudActive, setIsCloudActive] = useState<boolean>(() => isFirebaseActive());
  const [cloudStatusMsg, setCloudStatusMsg] = useState<string>(() =>
    isFirebaseActive()
      ? 'Cloud Firestore is connected. Edits save permanently across all devices on Netlify.'
      : 'Running in Local/Cache Mode. Add Firebase keys below or in Netlify to enable permanent cross-device cloud sync.'
  );
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [cloudConfigForm, setCloudConfigForm] = useState(() => {
    const existing = getActiveFirebaseConfig();
    return {
      apiKey: existing?.apiKey || '',
      authDomain: existing?.authDomain || '',
      projectId: existing?.projectId || '',
      storageBucket: existing?.storageBucket || '',
      messagingSenderId: existing?.messagingSenderId || '',
      appId: existing?.appId || ''
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- PRODUCT MANAGEMENT STATES ---
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state for creating/editing product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: 'Marble',
    subcategory: 'Makrana Marble',
    description: '',
    material: '',
    colour: '',
    finish: '',
    size: '',
    weight: '',
    pricingType: 'fixed',
    price: 350,
    unit: 'Sq. Ft.',
    minQuantity: 200,
    orderRulesType: 'standard',
    customOrderRulesNotice: '',
    images: ['/src/assets/images/makrana_white_marble_1790747884116.jpg'],
    availability: 'In Stock',
    featured: false,
    badge: '',
    active: true
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const openCreateProduct = () => {
    setIsCreatingProduct(true);
    setEditingProduct(null);
    setProductForm({
      name: '',
      code: `SKU-${Date.now().toString().slice(-5)}`,
      category: 'Marble',
      subcategory: categories[0]?.subcategories[0] || 'Makrana Marble',
      description: '',
      material: '',
      colour: '',
      finish: 'Mirror Polish',
      size: '',
      weight: '',
      pricingType: 'fixed',
      price: 250,
      unit: 'Sq. Ft.',
      minQuantity: 100,
      orderRulesType: 'standard',
      customOrderRulesNotice: '',
      images: ['/src/assets/images/makrana_white_marble_1790747884116.jpg'],
      availability: 'In Stock',
      featured: false,
      badge: '',
      active: true
    });
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreatingProduct(false);
    setProductForm({ ...prod });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        showToast('Product updated successfully!');
      } else {
        await addProduct(productForm);
        showToast('New product created successfully!');
      }
      setEditingProduct(null);
      setIsCreatingProduct(false);
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      await duplicateProduct(id);
      showToast('Product duplicated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error duplicating product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      showToast('Product deleted.');
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleToggleProductActive = async (prod: Product) => {
    try {
      await updateProduct(prod.id, { active: !prod.active });
      showToast(prod.active ? 'Product deactivated' : 'Product activated');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddImageToForm = () => {
    if (!newImageUrl.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImageFromForm = (idx: number) => {
    setProductForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx)
    }));
  };

  // When changing category in product form, auto-suggest order rules & min qty
  const handleCategoryChangeInForm = (newCategory: string) => {
    const isCraft =
      newCategory.toLowerCase().includes('craft') ||
      newCategory.toLowerCase().includes('handicraft') ||
      newCategory.toLowerCase().includes('brass');

    const catObj = categories.find(c => c.name.toLowerCase() === newCategory.toLowerCase());
    const defaultSub = catObj?.subcategories[0] || '';

    setProductForm(prev => ({
      ...prev,
      category: newCategory,
      subcategory: defaultSub,
      unit: isCraft ? 'Piece' : (prev.unit === 'Piece' ? 'Sq. Ft.' : prev.unit),
      minQuantity: isCraft ? (settings.craftDefaultMinQty || 100) : (prev.minQuantity === 100 ? 200 : prev.minQuantity),
      orderRulesType: isCraft ? 'craft_bulk' : 'standard',
      customOrderRulesNotice: isCraft
        ? 'BULK / WHOLESALE ORDERS ONLY. Minimum Order: 100 Pieces. Fixed Price. All India Delivery Available. Transport Charges Extra.'
        : prev.customOrderRulesNotice
    }));
  };

  // --- CATEGORIES STATE ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image: '',
    subcategories: []
  });
  const [newSubcategoryText, setNewSubcategoryText] = useState('');

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
        showToast('Category updated!');
      } else {
        await addCategory(categoryForm);
        showToast('Category created!');
      }
      setEditingCategory(null);
      setIsCreatingCategory(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubcategoryText.trim()) return;
    setCategoryForm(prev => ({
      ...prev,
      subcategories: [...(prev.subcategories || []), newSubcategoryText.trim()]
    }));
    setNewSubcategoryText('');
  };

  const handleRemoveSubcategory = (sub: string) => {
    setCategoryForm(prev => ({
      ...prev,
      subcategories: (prev.subcategories || []).filter(s => s !== sub)
    }));
  };

  // --- ORDERS STATE ---
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingTransportCharge, setEditingTransportCharge] = useState<number>(0);
  const [editingAdminNotes, setEditingAdminNotes] = useState<string>('');

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setEditingTransportCharge(ord.transportCharge || 0);
    setEditingAdminNotes(ord.adminNotes || '');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveTransportAndNotes = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {
        transportCharge: Number(editingTransportCharge),
        adminNotes: editingAdminNotes,
        transportNote: `Transport charges confirmed: ₹${editingTransportCharge}`
      });
      showToast('Transport charges & notes updated!');
      setSelectedOrder(prev => (prev ? {
        ...prev,
        transportCharge: Number(editingTransportCharge),
        adminNotes: editingAdminNotes
      } : null));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- SETTINGS STATE ---
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- SECURITY / PASSWORD STATE ---
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPasswordVal, setNewAdminPasswordVal] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminUsernameInput, setAdminUsernameInput] = useState('RMB');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (!currentAdminPassword) {
      setSecurityStatus({ type: 'error', message: 'Current password is required to verify your authorization.' });
      return;
    }
    if (!newAdminPasswordVal || newAdminPasswordVal.trim().length < 4) {
      setSecurityStatus({ type: 'error', message: 'New password must be at least 4 characters long.' });
      return;
    }
    if (newAdminPasswordVal !== confirmAdminPassword) {
      setSecurityStatus({ type: 'error', message: 'New password and confirmation password do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changeAdminPassword(currentAdminPassword, newAdminPasswordVal.trim(), adminUsernameInput.trim());
      if (res.success) {
        setSecurityStatus({
          type: 'success',
          message: 'Admin credentials updated successfully! Please note your new credentials for future logins.'
        });
        setCurrentAdminPassword('');
        setNewAdminPasswordVal('');
        setConfirmAdminPassword('');
        showToast('Admin password changed successfully!');
      } else {
        setSecurityStatus({
          type: 'error',
          message: res.error || 'Failed to update credentials. Please check your current password.'
        });
      }
    } catch (err: any) {
      setSecurityStatus({ type: 'error', message: err.message || 'Error occurred while updating password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaveMsg(null);
    setIsSavingSettings(true);
    try {
      const payload: any = { ...settingsForm };
      if (newAdminPassword.trim()) {
        payload.newAdminPassword = newAdminPassword.trim();
      }
      await updateSettings(payload);
      setNewAdminPassword('');
      setSettingsSaveMsg({
        type: 'success',
        text: 'All company information saved permanently! Public website has been updated.'
      });
      showToast('Settings permanently saved!');
    } catch (err: any) {
      setSettingsSaveMsg({
        type: 'error',
        text: `Error saving settings: ${err.message || 'Please check your connection and try again.'}`
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // --- CLOUD DATABASE ACTION HANDLERS ---
  const handleSaveCloudConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('stone_custom_firebase_config', JSON.stringify(cloudConfigForm));
      const testRes = await testFirebaseConnection();
      setIsCloudActive(testRes.success);
      setCloudStatusMsg(testRes.message);
      if (testRes.success) {
        showToast('Cloud database connected successfully!');
      } else {
        showToast(testRes.message);
      }
    } catch (err: any) {
      alert(`Configuration error: ${err.message}`);
    }
  };

  const handleTestCloudConnection = async () => {
    setIsTestingCloud(true);
    try {
      const res = await testFirebaseConnection();
      setIsCloudActive(res.success);
      setCloudStatusMsg(res.message);
      showToast(res.message);
    } catch (err: any) {
      setIsCloudActive(false);
      setCloudStatusMsg(`Connection error: ${err.message}`);
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleSyncAllToCloudNow = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await syncAllToCloud(settings, products, categories, orders);
      if (res.success) {
        showToast(`Successfully synced ${res.count} records to Cloud Database!`);
        setCloudStatusMsg(`Cloud Sync Complete: ${res.count} records saved to Cloud Firestore.`);
      } else {
        alert(`Sync error: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (productCategoryFilter !== 'all' && !p.category.toLowerCase().includes(productCategoryFilter.toLowerCase())) {
      return false;
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobile.includes(q) ||
        o.delivery.city.toLowerCase().includes(q) ||
        o.delivery.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Admin Top Header */}
      <div className="bg-stone-900 text-white px-4 sm:px-6 lg:px-8 py-3.5 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              {settings.businessName}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
              Admin Control Panel
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-stone-300 hover:text-white flex items-center gap-1"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <span className="text-stone-700">|</span>
            <button
              onClick={logoutAdmin}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar (Tabs) */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-6 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Enquiries ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Business & GST Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Password & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('cloud')}
              className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'cloud'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Database className="w-4 h-4 text-amber-700" />
              <span>Netlify Cloud Database</span>
              <span className={`w-2 h-2 rounded-full ${isCloudActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          </div>

          {activeTab === 'products' && !isCreatingProduct && !editingProduct && (
            <button
              onClick={openCreateProduct}
              className="my-2 px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          )}

          {activeTab === 'categories' && !isCreatingCategory && !editingCategory && (
            <button
              onClick={() => {
                setIsCreatingCategory(true);
                setEditingCategory(null);
                setCategoryForm({
                  name: '',
                  slug: '',
                  description: '',
                  image: '/src/assets/images/makrana_white_marble_1790747884116.jpg',
                  subcategories: []
                });
              }}
              className="my-2 px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ======================================================== */}
        {/* TAB 1: PRODUCTS TAB                                       */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* PRODUCT CREATION OR EDIT FORM */}
            {(isCreatingProduct || editingProduct) ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-stone-900">
                      {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Natural Stone / Craft Product'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Configure dimensions, finish, wholesale minimums, units, and images.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6">
                  {/* Row 1: Basic Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name || ''}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Makrana Pure White Marble Slabs"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Product Code / SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.code || ''}
                        onChange={e => setProductForm({ ...productForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. MKR-WHT-001"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono uppercase focus:ring-1 focus:ring-amber-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Product Badge (Optional)
                      </label>
                      <input
                        type="text"
                        value={productForm.badge || ''}
                        onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                        placeholder="e.g. Best Seller / Wholesale Only / Top Rated"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Category & Subcategory */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={productForm.category || 'Marble'}
                        onChange={e => handleCategoryChangeInForm(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white font-medium"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Subcategory *
                      </label>
                      <input
                        type="text"
                        value={productForm.subcategory || ''}
                        onChange={e => setProductForm({ ...productForm, subcategory: e.target.value })}
                        placeholder="e.g. Makrana Marble, Marble Diyas, Black Granite..."
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Product Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={productForm.description || ''}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Detailed architectural specifications, quarry characteristics, grain pattern, and recommended applications..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                    />
                  </div>

                  {/* Row 4: Material, Colour, Finish, Size, Weight */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Material
                      </label>
                      <input
                        type="text"
                        value={productForm.material || ''}
                        onChange={e => setProductForm({ ...productForm, material: e.target.value })}
                        placeholder="e.g. Makrana Calcite"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Colour / Shade
                      </label>
                      <input
                        type="text"
                        value={productForm.colour || ''}
                        onChange={e => setProductForm({ ...productForm, colour: e.target.value })}
                        placeholder="e.g. Pristine White"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Finish
                      </label>
                      <input
                        type="text"
                        value={productForm.finish || ''}
                        onChange={e => setProductForm({ ...productForm, finish: e.target.value })}
                        placeholder="e.g. Mirror Polish"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Dimensions / Size
                      </label>
                      <input
                        type="text"
                        value={productForm.size || ''}
                        onChange={e => setProductForm({ ...productForm, size: e.target.value })}
                        placeholder="e.g. 8x4 ft slabs"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={productForm.weight || ''}
                        onChange={e => setProductForm({ ...productForm, weight: e.target.value })}
                        placeholder="e.g. 45 kg/sqm"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 5: PRICING & QUANTITY RULES (CRITICAL REQUIREMENT) */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <div className="font-semibold text-xs text-stone-900 uppercase tracking-wider">
                      Pricing, Unit & Order Rules Settings
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Pricing Type */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Pricing Mode
                        </label>
                        <select
                          value={productForm.pricingType || 'fixed'}
                          onChange={e => setProductForm({ ...productForm, pricingType: e.target.value as any })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                        >
                          <option value="fixed">Fixed Price (INR)</option>
                          <option value="quote">Contact / Get Quote</option>
                        </select>
                      </div>

                      {/* Price in INR */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Price (₹) {productForm.pricingType === 'quote' && '(Ignored)'}
                        </label>
                        <input
                          type="number"
                          disabled={productForm.pricingType === 'quote'}
                          value={productForm.price || 0}
                          onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono disabled:opacity-40"
                        />
                      </div>

                      {/* Unit Type */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Measurement Unit
                        </label>
                        <select
                          value={productForm.unit || 'Sq. Ft.'}
                          onChange={e => setProductForm({ ...productForm, unit: e.target.value as UnitType })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                        >
                          <option value="Piece">Piece (Crafts / Diyas / Decor)</option>
                          <option value="Sq. Ft.">Sq. Ft. (Marble / Granite)</option>
                          <option value="Sq. M.">Sq. M.</option>
                          <option value="Slab">Slab</option>
                          <option value="Tile">Tile</option>
                          <option value="Block">Block</option>
                          <option value="Sheet">Sheet</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>

                      {/* Minimum Quantity */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Minimum Order Quantity
                        </label>
                        <input
                          type="number"
                          required
                          value={productForm.minQuantity || 1}
                          onChange={e => setProductForm({ ...productForm, minQuantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Order Rule Preset */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Order Rule Enforcement Type
                        </label>
                        <select
                          value={productForm.orderRulesType || 'standard'}
                          onChange={e => setProductForm({ ...productForm, orderRulesType: e.target.value as any })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                        >
                          <option value="craft_bulk">Marble Craft / Bulk Wholesale Only (Min 100 pcs notice)</option>
                          <option value="standard">Natural Stone Standard Rules (Custom Unit / Min)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Custom Order Rules Notice (Optional override)
                        </label>
                        <input
                          type="text"
                          value={productForm.customOrderRulesNotice || ''}
                          onChange={e => setProductForm({ ...productForm, customOrderRulesNotice: e.target.value })}
                          placeholder="e.g. Bulk orders only. Minimum 100 pcs. Transport extra."
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 6: Image Management */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-stone-700">
                      Product Images (Multiple supported)
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image path or URL (e.g. /src/assets/images/...)"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageToForm}
                        className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium uppercase"
                      >
                        Add Image
                      </button>
                    </div>

                    {/* Image thumbnails */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {(productForm.images || []).map((img, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200 group">
                          <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageFromForm(i)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 hover:opacity-100"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 7: Availability & Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Availability Status
                      </label>
                      <select
                        value={productForm.availability || 'In Stock'}
                        onChange={e => setProductForm({ ...productForm, availability: e.target.value as any })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Made to Order">Made to Order</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="featuredToggle"
                        checked={Boolean(productForm.featured)}
                        onChange={e => setProductForm({ ...productForm, featured: e.target.checked })}
                        className="rounded border-stone-300 text-amber-800"
                      />
                      <label htmlFor="featuredToggle" className="text-xs font-semibold text-stone-700 cursor-pointer">
                        Featured on Home Showcase
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="activeToggle"
                        checked={Boolean(productForm.active)}
                        onChange={e => setProductForm({ ...productForm, active: e.target.checked })}
                        className="rounded border-stone-300 text-amber-800"
                      />
                      <label htmlFor="activeToggle" className="text-xs font-semibold text-stone-700 cursor-pointer">
                        Active (Visible in Public Catalog)
                      </label>
                    </div>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium uppercase hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Product Changes' : 'Create Product'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* PRODUCT LIST TABLE & CONTROLS */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden space-y-4 p-5">
              {/* Filter / Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-80">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search product by name, code..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-700"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700 border-collapse">
                  <thead>
                    <tr className="bg-stone-100/75 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Code / Category</th>
                      <th className="py-3 px-3">Price & Unit</th>
                      <th className="py-3 px-3">Min Order</th>
                      <th className="py-3 px-3">Rules</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-full bg-amber-100/70 text-amber-900 flex items-center justify-center mx-auto">
                              <Package className="w-6 h-6" />
                            </div>
                            <div className="font-semibold text-stone-900 text-sm">
                              {products.length === 0 ? 'No Products Uploaded Yet' : 'No Matching Products Found'}
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">
                              {products.length === 0
                                ? 'Your product catalog is currently clear as requested. Whenever you are ready, click "Add New Product" to start adding your stone slabs, tiles, or handicrafts.'
                                : 'Try clearing your search query or category filter.'}
                            </p>
                            {products.length === 0 && (
                              <button
                                onClick={openCreateProduct}
                                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Your First Product</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images?.[0] || '/src/assets/images/makrana_white_marble_1790747884116.jpg'}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover border border-stone-200"
                            />
                            <div>
                              <div className="font-semibold text-stone-900">{prod.name}</div>
                              <div className="text-[11px] text-stone-500">{prod.material}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono font-medium text-stone-700">{prod.code}</div>
                          <div className="text-[11px] text-stone-500">{prod.category} · {prod.subcategory}</div>
                        </td>

                        <td className="py-3 px-3">
                          {prod.pricingType === 'fixed' ? (
                            <div className="font-mono font-bold text-stone-900 tabular-nums">
                              ₹{prod.price.toLocaleString('en-IN')} <span className="text-[10px] text-stone-500 font-normal">/ {prod.unit}</span>
                            </div>
                          ) : (
                            <span className="text-amber-800 font-semibold">Quote</span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-stone-800">
                          {prod.minQuantity} {prod.unit}
                        </td>

                        <td className="py-3 px-3">
                          {prod.orderRulesType === 'craft_bulk' ? (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                              Wholesale 100+
                            </span>
                          ) : (
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                              Standard Stone
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleProductActive(prod)}
                            className={`flex items-center gap-1 text-[11px] font-medium ${
                              prod.active ? 'text-emerald-700 hover:text-emerald-800' : 'text-stone-400 hover:text-stone-600'
                            }`}
                          >
                            {prod.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{prod.active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditProduct(prod)}
                              className="p-1.5 text-stone-600 hover:text-amber-800 rounded hover:bg-stone-100"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(prod.id)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
                              title="Duplicate product"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(prod.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delete Modal Confirmation */}
            {deleteConfirmId && (
              <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-xl">
                  <h4 className="font-display text-lg font-bold text-stone-900">Confirm Product Deletion</h4>
                  <p className="text-xs text-stone-600">
                    Are you sure you want to permanently remove this product from the inventory database?
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(deleteConfirmId)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CATEGORY MANAGEMENT TAB                           */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Category Form */}
            {(isCreatingCategory || editingCategory) && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="font-display text-xl font-bold text-stone-900">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setEditingCategory(null);
                    }}
                    className="p-1.5 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name || ''}
                        onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Cover Image Path
                      </label>
                      <input
                        type="text"
                        value={categoryForm.image || ''}
                        onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Category Description
                      </label>
                      <textarea
                        rows={2}
                        value={categoryForm.description || ''}
                        onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Subcategory Manager */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <label className="block text-xs font-semibold text-stone-700">
                      Manage Subcategories
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add subcategory name..."
                        value={newSubcategoryText}
                        onChange={e => setNewSubcategoryText(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubcategory}
                        className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
                      >
                        Add Subcategory
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(categoryForm.subcategories || []).map(sub => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded-md text-xs text-stone-800 border border-stone-200"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcategory(sub)}
                            className="text-stone-400 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategory(false);
                        setEditingCategory(null);
                      }}
                      className="px-4 py-2 border border-stone-300 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-stone-900 text-white text-xs font-bold uppercase rounded-lg"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Category Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display text-xl font-bold text-stone-900">{cat.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{cat.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({ ...cat });
                        }}
                        className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete category ${cat.name}?`)) {
                            await deleteCategory(cat.id);
                            showToast('Category deleted');
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold uppercase text-stone-500 block mb-1.5">
                      Subcategories ({cat.subcategories.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.map(sub => (
                        <span key={sub} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ORDERS & CUSTOMER ENQUIRIES MANAGEMENT             */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, city..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-700"
                  >
                    <option value="all">All Order Statuses ({orders.length})</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700 border-collapse">
                  <thead>
                    <tr className="bg-stone-100/75 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Order / Date</th>
                      <th className="py-3 px-3">Customer & Mobile</th>
                      <th className="py-3 px-3">Destination</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Product Amount</th>
                      <th className="py-3 px-3">Transport Charge</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {filteredOrders.map(ord => (
                      <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-amber-900 block">{ord.id}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-900">{ord.customer.fullName}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{ord.customer.mobile}</div>
                          {ord.customer.businessName && (
                            <div className="text-[10px] text-amber-800">{ord.customer.businessName}</div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div>{ord.delivery.city}, {ord.delivery.state}</div>
                          <span className="text-[10px] font-mono text-stone-400">{ord.delivery.pincode}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-stone-800">{ord.items.length} product(s)</span>
                          <div className="text-[10px] text-stone-500 line-clamp-1">
                            {ord.items.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-stone-900 tabular-nums">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3">
                          {ord.transportCharge > 0 ? (
                            <span className="font-mono text-emerald-700 font-bold tabular-nums">
                              ₹{ord.transportCharge.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-amber-800 text-[11px] font-medium">Extra / Pending</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={ord.status}
                            onChange={e => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 border border-stone-300 rounded text-[11px] font-semibold bg-white"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Ready for Dispatch">Ready for Dispatch</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => openOrderModal(ord)}
                            className="px-2.5 py-1 bg-stone-900 text-white rounded text-[11px] font-medium hover:bg-stone-800"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ORDER DETAIL & TRANSPORT CHARGE MANAGEMENT MODAL */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Order Dossier
                      </span>
                      <h3 className="font-display text-2xl font-bold text-stone-900">
                        {selectedOrder.id}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div className="space-y-1">
                      <strong className="text-stone-900 uppercase tracking-wider text-[10px] block">
                        Customer Information
                      </strong>
                      <div>Name: <span className="font-semibold text-stone-900">{selectedOrder.customer.fullName}</span></div>
                      <div>Mobile: <span className="font-mono text-stone-900">{selectedOrder.customer.mobile}</span></div>
                      {selectedOrder.customer.email && <div>Email: {selectedOrder.customer.email}</div>}
                      {selectedOrder.customer.businessName && <div>Company: {selectedOrder.customer.businessName}</div>}
                      {selectedOrder.businessInfo?.instagramId && <div>Instagram: {selectedOrder.businessInfo.instagramId}</div>}
                      {selectedOrder.businessInfo?.gstNumber && <div>GST: <span className="font-mono">{selectedOrder.businessInfo.gstNumber}</span></div>}
                    </div>

                    <div className="space-y-1">
                      <strong className="text-stone-900 uppercase tracking-wider text-[10px] block">
                        Delivery Destination
                      </strong>
                      <div>Address: {selectedOrder.delivery.address}</div>
                      {selectedOrder.delivery.villageArea && <div>Area: {selectedOrder.delivery.villageArea}</div>}
                      <div>City / State: {selectedOrder.delivery.city}, {selectedOrder.delivery.state}</div>
                      <div>PIN Code: <span className="font-mono font-bold">{selectedOrder.delivery.pincode}</span></div>
                      {selectedOrder.delivery.landmark && <div>Landmark: {selectedOrder.delivery.landmark}</div>}
                      <div>Location Type: {selectedOrder.delivery.locationType}</div>
                    </div>
                  </div>

                  {/* Itemized Products */}
                  <div className="space-y-2">
                    <strong className="text-stone-900 uppercase tracking-wider text-[10px] block">
                      Ordered Products
                    </strong>
                    <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-150 text-xs">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-stone-900">{item.productName}</div>
                            <div className="text-[11px] text-stone-500 font-mono">
                              {item.productCode} · {item.quantity} {item.unit}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-stone-900">
                            {item.pricingType === 'fixed' ? `₹${item.totalPrice.toLocaleString('en-IN')}` : 'Quotation'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADMIN EDIT TRANSPORT CHARGES MANUALLY (REQUIREMENT 6 & 14) */}
                  <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3 text-xs">
                    <div className="font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-800" />
                      <span>Admin Transport Charge Adjustment (Manual Entry)</span>
                    </div>
                    <p className="text-stone-600">
                      Transport is billed separately from the product amount. Enter verified transporter freight charges below:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Manual Transport Charge (₹)
                        </label>
                        <input
                          type="number"
                          value={editingTransportCharge}
                          onChange={e => setEditingTransportCharge(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Consignment Total with Freight (₹)
                        </label>
                        <div className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900">
                          ₹{(selectedOrder.totalAmount + Number(editingTransportCharge)).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Admin / Logistics Dispatch Notes
                        </label>
                        <textarea
                          rows={2}
                          value={editingAdminNotes}
                          onChange={e => setEditingAdminNotes(e.target.value)}
                          placeholder="e.g. Transporter Bilty #8291, Crane unloading confirmed for Thursday"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveTransportAndNotes}
                        className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold uppercase"
                      >
                        Update Freight & Notes
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-600">Change Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold bg-white"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready for Dispatch">Ready for Dispatch</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-5 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium uppercase"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: BUSINESS SETTINGS & GST CONFIGURATION             */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Full Business Customization
              </span>
              <h3 className="font-display text-2xl font-bold text-stone-900">
                Business, Delivery, Freight & GST Settings
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Edit business credentials, phones, addresses, and GST settings dynamically without code changes.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* Section 1: Business Identity */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  1. Business Identity & Branding
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.businessName}
                      onChange={e => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Business Description
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.description}
                      onChange={e => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Numbers & Location */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  2. Contact & Factory Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp Number (For Order Link & Floating Button)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Quarry / Factory Address
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City / State / PIN Code
                    </label>
                    <input
                      type="text"
                      value={`${settingsForm.city}, ${settingsForm.state} - ${settingsForm.pincode}`}
                      onChange={e => {
                        const parts = e.target.value.split(',');
                        if (parts[0]) setSettingsForm(prev => ({ ...prev, city: parts[0].trim() }));
                      }}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Instagram ID
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramId}
                      onChange={e => setSettingsForm({ ...settingsForm, instagramId: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={settingsForm.websiteUrl}
                      onChange={e => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: GST SETTINGS (CRITICAL REQUIREMENT 13) */}
              <div className="p-5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-amber-950 uppercase tracking-wider">
                      GST Settings & Future Invoicing
                    </h4>
                    <p className="text-xs text-stone-600">
                      GST is disabled by default. Enable it anytime when your GST registration is completed without code modification.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
                      <input
                        type="checkbox"
                        checked={Boolean(settingsForm.gstSettings?.enabled)}
                        onChange={e =>
                          setSettingsForm(prev => ({
                            ...prev,
                            gstSettings: {
                              ...prev.gstSettings,
                              enabled: e.target.checked
                            }
                          }))
                        }
                        className="w-4 h-4 rounded text-amber-800"
                      />
                      <span>GST Status: {settingsForm.gstSettings?.enabled ? 'ENABLED' : 'DISABLED (Default)'}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Customer Form GST Field Visibility
                    </label>
                    <select
                      value={settingsForm.gstSettings?.fieldVisibility || 'optional'}
                      onChange={e =>
                        setSettingsForm(prev => ({
                          ...prev,
                          gstSettings: {
                            ...prev.gstSettings,
                            fieldVisibility: e.target.value as any
                          }
                        }))
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                    >
                      <option value="optional">Show Field (Optional for Customer)</option>
                      <option value="hidden">Hide Field Completely</option>
                      <option value="required">Make Field Mandatory *</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Business GST Number (When Registered)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 08AAAAA0000A1Z5"
                      value={settingsForm.gstSettings?.gstNumber || ''}
                      onChange={e =>
                        setSettingsForm(prev => ({
                          ...prev,
                          gstSettings: {
                            ...prev.gstSettings,
                            gstNumber: e.target.value.toUpperCase()
                          }
                        }))
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono uppercase bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Applicable GST Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.gstSettings?.gstPercentage || 18}
                      onChange={e =>
                        setSettingsForm(prev => ({
                          ...prev,
                          gstSettings: {
                            ...prev.gstSettings,
                            gstPercentage: parseFloat(e.target.value) || 18
                          }
                        }))
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Wholesale Rules Default & Security */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  4. Wholesale Default Rules & Admin Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Marble Craft Default Minimum Order Quantity (Pieces)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.craftDefaultMinQty || 100}
                      onChange={e => setSettingsForm({ ...settingsForm, craftDefaultMinQty: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-stone-500">
                      Default is 100 pieces for craft and handicrafts.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Change Admin Password (Leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new admin password"
                      value={newAdminPassword}
                      onChange={e => setNewAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Legal & Policy Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  5. Delivery, Transport & Legal Text
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Delivery Information Text
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.deliveryInformation}
                      onChange={e => setSettingsForm({ ...settingsForm, deliveryInformation: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Transport Charges Information Text
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.transportInformation}
                      onChange={e => setSettingsForm({ ...settingsForm, transportInformation: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Terms & Conditions Text
                    </label>
                    <textarea
                      rows={4}
                      value={settingsForm.termsAndConditions}
                      onChange={e => setSettingsForm({ ...settingsForm, termsAndConditions: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Privacy Policy Text
                    </label>
                    <textarea
                      rows={4}
                      value={settingsForm.privacyPolicy}
                      onChange={e => setSettingsForm({ ...settingsForm, privacyPolicy: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {settingsSaveMsg && (
                <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
                  settingsSaveMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {settingsSaveMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{settingsSaveMsg.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving Changes Permanently...' : 'Save All Settings Permanently'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ADMIN PASSWORD & CREDENTIALS SECURITY            */}
        {/* ======================================================== */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-8 max-w-3xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Access & Security
              </span>
              <h3 className="font-display text-2xl font-bold text-stone-900">
                Change Admin Login Credentials
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Update your administrator username and password securely. Credentials are encrypted and protected.
              </p>
            </div>

            {securityStatus && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  securityStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {securityStatus.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {securityStatus.type === 'success' ? 'Password Updated Successfully' : 'Action Failed'}
                  </div>
                  <div className="mt-0.5 leading-relaxed">{securityStatus.message}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={adminUsernameInput}
                  onChange={e => setAdminUsernameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                  placeholder="e.g. admin"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  You can keep 'admin' or set a custom administrator username.
                </span>
              </div>

              {/* Current Password Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentAdminPassword}
                    onChange={e => setCurrentAdminPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={newAdminPasswordVal}
                      onChange={e => setNewAdminPasswordVal(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmAdminPassword}
                    onChange={e => setConfirmAdminPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Security Guidance Note */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <span>Security Guidance:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  After saving, your new credentials will be active immediately for all future logins. Password is never exposed in plain text.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-6 py-3 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: NETLIFY & CLOUD DATABASE PERSISTENCE              */}
        {/* ======================================================== */}
        {activeTab === 'cloud' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                    Netlify & Multi-Device Permanent Sync
                  </span>
                  <h3 className="font-display text-2xl font-bold text-stone-900">
                    Cloud Firestore & Netlify Configuration
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Connect Firebase Cloud Firestore so that every product, price, MOQ, and company edit persists across all phones, computers, and Netlify deployments without redeploying.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestCloudConnection}
                    disabled={isTestingCloud}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
                    <span>{isTestingCloud ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncAllToCloudNow}
                    disabled={isSyncingCloud}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isSyncingCloud ? 'Syncing...' : 'Sync All to Cloud'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                isCloudActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                {isCloudActive ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {isCloudActive ? 'Cloud Database Active & Connected' : 'Cloud Database Standby (Local Mode)'}
                  </div>
                  <p className="text-xs leading-relaxed">{cloudStatusMsg}</p>
                </div>
              </div>

              {/* In-App Direct Firebase Config */}
              <form onSubmit={handleSaveCloudConfig} className="space-y-4 pt-2">
                <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center justify-between">
                  <span>Direct Firebase Credentials (Works instantly on Netlify)</span>
                  <span className="text-[10px] text-stone-400 font-normal lowercase">saved securely in your browser/app</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Firebase API Key (VITE_FIREBASE_API_KEY)
                    </label>
                    <input
                      type="text"
                      value={cloudConfigForm.apiKey}
                      onChange={e => setCloudConfigForm({ ...cloudConfigForm, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Firebase Project ID (VITE_FIREBASE_PROJECT_ID)
                    </label>
                    <input
                      type="text"
                      value={cloudConfigForm.projectId}
                      onChange={e => setCloudConfigForm({ ...cloudConfigForm, projectId: e.target.value })}
                      placeholder="e.g. ramji-banjara-marble"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Auth Domain (VITE_FIREBASE_AUTH_DOMAIN)
                    </label>
                    <input
                      type="text"
                      value={cloudConfigForm.authDomain}
                      onChange={e => setCloudConfigForm({ ...cloudConfigForm, authDomain: e.target.value })}
                      placeholder="ramji-banjara-marble.firebaseapp.com"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      App ID (VITE_FIREBASE_APP_ID)
                    </label>
                    <input
                      type="text"
                      value={cloudConfigForm.appId}
                      onChange={e => setCloudConfigForm({ ...cloudConfigForm, appId: e.target.value })}
                      placeholder="1:1234567890:web:abcdef"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Connect Cloud Database</span>
                  </button>
                </div>
              </form>

              {/* Netlify Step-by-Step Instructions */}
              <div className="mt-8 pt-6 border-t border-stone-200 space-y-4">
                <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider">
                  How to configure on Netlify (Permanent cross-device setup guide)
                </h4>

                <div className="space-y-3 text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <strong>Firebase Console:</strong> Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-800 font-semibold underline">console.firebase.google.com</a>, create a free project named <em>Ramji Banjara Marble</em>, click <strong>Firestore Database &rarr; Create Database</strong> in test/production mode.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <strong>Get Keys:</strong> Project Settings &rarr; General &rarr; <em>Your apps</em> (Add Web App) &rarr; Copy the <code>firebaseConfig</code> values.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <div>
                      <strong>Netlify Dashboard:</strong> Open Netlify &rarr; Select your site &rarr; <strong>Site configuration</strong> &rarr; <strong>Environment variables</strong> &rarr; Add these variables:
                      <pre className="mt-2 p-3 bg-stone-900 text-amber-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
{`VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    <div>
                      <strong>Trigger Deploy:</strong> Click <strong>Deploys &rarr; Trigger deploy &rarr; Clear cache and deploy site</strong>. Once deployed, any change you make in Admin Panel will instantly write to Cloud Firestore and update on every user's device!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
