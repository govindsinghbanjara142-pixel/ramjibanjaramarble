import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  Building,
  MapPin,
  User,
  Truck,
  ArrowRight
} from 'lucide-react';

export const BulkOrderPage: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    settings,
    submitOrder,
    openWhatsAppOrder,
    setCurrentPage,
    products
  } = useApp();

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [address, setAddress] = useState('');
  const [villageArea, setVillageArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locationType, setLocationType] = useState('Commercial / Project Site');

  const [instagramId, setInstagramId] = useState('');
  const [website, setWebsite] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check GST visibility settings from Admin:
  // 'hidden' | 'optional' | 'required'
  const gstFieldVisibility = settings.gstSettings?.fieldVisibility || 'optional';
  const isGstEnabled = settings.gstSettings?.enabled;

  const totalProductAmount = cartItems.reduce((acc, item) => acc + (item.pricingType === 'fixed' ? item.totalPrice : 0), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cartItems.length === 0) {
      setErrorMsg('Please add at least one product to your bulk inquiry list.');
      return;
    }

    // Verify all cart items satisfy minimum quantities
    for (const item of cartItems) {
      const prod = products.find(p => p.id === item.productId);
      const isCraft =
        item.category.toLowerCase().includes('craft') ||
        item.category.toLowerCase().includes('handicraft') ||
        item.category.toLowerCase().includes('brass') ||
        prod?.orderRulesType === 'craft_bulk';

      const min = prod?.minQuantity || (isCraft ? (settings.craftDefaultMinQty || 100) : 1);

      if (item.quantity < min) {
        if (isCraft) {
          setErrorMsg(`Minimum order quantity for ${item.productName} is ${min} pieces. Bulk/Wholesale orders only.`);
        } else {
          setErrorMsg(`Minimum order quantity for ${item.productName} is ${min} ${item.unit}.`);
        }
        return;
      }
    }

    // GST validation if required by Admin
    if (gstFieldVisibility === 'required' && !gstNumber.trim()) {
      setErrorMsg('GST Number is mandatory as configured by Admin.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          fullName,
          mobile,
          whatsapp: whatsapp || mobile,
          email,
          businessName
        },
        delivery: {
          address,
          villageArea,
          city,
          state,
          pincode,
          landmark,
          locationType
        },
        businessInfo: {
          instagramId,
          website,
          gstNumber
        },
        items: cartItems,
        totalAmount: totalProductAmount,
        transportCharge: 0, // Admin will set this manually
        transportNote: 'Transport Charges Extra - To be confirmed separately as per location & weight',
        adminNotes: notes ? `Customer remark: ${notes}` : ''
      };

      const created = await submitOrder(orderPayload);
      setSubmittedOrder(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    const customerDetails = {
      fullName: fullName || 'Prospective Wholesale Client',
      mobile: mobile || 'N/A',
      businessName: businessName || 'N/A',
      city: city || 'N/A',
      state: state || 'N/A',
      pincode: pincode || 'N/A',
      address: address || 'N/A',
      instagramId: instagramId || 'N/A'
    };
    openWhatsAppOrder(undefined, undefined, customerDetails);
  };

  // If order was successfully placed
  if (submittedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            Order & Inquiry Received
          </span>
          <h1 className="font-display text-3xl font-bold text-stone-900">
            Thank you, {submittedOrder.customer.fullName}!
          </h1>
          <p className="text-sm text-stone-600">
            Your inquiry reference number is{' '}
            <strong className="font-mono text-amber-900 font-bold">{submittedOrder.id}</strong>.
          </p>
        </div>

        {/* Order Summary Receipt Box */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 text-left text-xs space-y-4 shadow-xs">
          <div className="flex justify-between border-b border-stone-200 pb-2 font-semibold text-stone-800">
            <span>Destination: {submittedOrder.delivery.city}, {submittedOrder.delivery.state} ({submittedOrder.delivery.pincode})</span>
            <span className="text-amber-800 font-bold">Status: {submittedOrder.status}</span>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] block">
              Items Ordered:
            </span>
            {submittedOrder.items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-stone-100">
                <span>
                  {it.productName} ({it.productCode}) × {it.quantity} {it.unit}
                </span>
                <span className="font-mono font-medium">
                  {it.pricingType === 'fixed' ? `₹${it.totalPrice.toLocaleString('en-IN')}` : 'Quotation'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 space-y-1 text-stone-700">
            <div className="flex justify-between font-bold text-stone-900 text-sm">
              <span>Product Amount:</span>
              <span className="font-mono tabular-nums">₹{submittedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-amber-900 font-semibold">
              <span>Transport Charges:</span>
              <span>Extra (To be confirmed separately)</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              Our dispatch coordinator will contact you at <strong>{submittedOrder.customer.mobile}</strong> to confirm transport booking, freight bill, and dispatch schedule.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => handleWhatsAppInquiry()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect on WhatsApp for Instant Booking</span>
          </button>
          <button
            onClick={() => {
              setSubmittedOrder(null);
              setCurrentPage('all-products');
            }}
            className="px-6 py-3 bg-stone-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Browse More Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Direct Factory Booking
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Bulk Order & Quotation Form
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Wholesale consignments for Marble Craft (min 100 pcs) and quarry-lot supply for Marble & Granite across India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer & Delivery Details Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-8">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Section 1: Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <User className="w-4 h-4 text-amber-800" />
                <h3 className="font-display text-lg font-bold text-stone-900">
                  1. Customer Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sharma"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as mobile if blank"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. buyer@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business / Company / Temple Trust Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Builders & Contractors"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <MapPin className="w-4 h-4 text-amber-800" />
                <h3 className="font-display text-lg font-bold text-stone-900">
                  2. Delivery & Destination Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Plot / Street / Factory / Warehouse Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Village / Area / Colony
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Industrial Belt / Sector 62"
                    value={villageArea}
                    onChange={e => setVillageArea(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune / Hyderabad / Lucknow"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 411001"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Metro Pillar 120"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Delivery Location Type
                  </label>
                  <select
                    value={locationType}
                    onChange={e => setLocationType(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white"
                  >
                    <option value="Commercial / Project Site">Commercial / Project Site</option>
                    <option value="Warehouse / Godown">Warehouse / Godown</option>
                    <option value="Retail Stone Showroom">Retail Stone Showroom</option>
                    <option value="Residential Construction">Residential Construction</option>
                    <option value="Temple / Ashram Site">Temple / Ashram Site</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Business Information & GST (Admin Controlled) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <Building className="w-4 h-4 text-amber-800" />
                <h3 className="font-display text-lg font-bold text-stone-900">
                  3. Business & Social Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Instagram ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @sharma_interiors"
                    value={instagramId}
                    onChange={e => setInstagramId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. www.sharmainteriors.in"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>

                {/* GST Number Field - Admin Managed (Hidden / Optional / Required) */}
                {gstFieldVisibility !== 'hidden' && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        GST Number {gstFieldVisibility === 'required' ? '*' : '(Optional)'}
                      </label>
                      <span className="text-[11px] text-stone-400">
                        {isGstEnabled ? 'GST Invoicing Available' : 'Currently Optional (Not Required)'}
                      </span>
                    </div>
                    <input
                      type="text"
                      required={gstFieldVisibility === 'required'}
                      placeholder="e.g. 08AAAAA0000A1Z5"
                      value={gstNumber}
                      onChange={e => setGstNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none font-mono uppercase"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Additional Instructions / Custom Specifications
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need crane unloading assistance, specific vein pattern preferences, or delivery target date"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Consignment Details...' : 'Submit Bulk Order / Inquiry'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Cart Items & Transport Charges Calculation Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-800" />
                <h3 className="font-display text-lg font-bold text-stone-900">
                  Consignment Items ({cartItems.length})
                </h3>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-stone-400 hover:text-rose-600"
                >
                  Clear All
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-stone-500">Your bulk inquiry list is empty.</p>
                <button
                  onClick={() => setCurrentPage('all-products')}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold uppercase rounded-lg"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-150 space-y-3">
                {cartItems.map(item => {
                  const prod = products.find(p => p.id === item.productId);
                  const isCraft =
                    item.category.toLowerCase().includes('craft') ||
                    item.category.toLowerCase().includes('handicraft') ||
                    item.category.toLowerCase().includes('brass') ||
                    prod?.orderRulesType === 'craft_bulk';
                  const min = prod?.minQuantity || (isCraft ? (settings.craftDefaultMinQty || 100) : 1);

                  return (
                    <div key={item.productId} className="pt-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-xs text-stone-900">
                            {item.productName}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400">
                            {item.productCode} · {item.category}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity input & item subtotal */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <label className="text-stone-500">Qty:</label>
                          <input
                            type="number"
                            min={min}
                            value={item.quantity}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              const res = updateCartQuantity(item.productId, val);
                              if (!res.success && res.message) {
                                setErrorMsg(res.message);
                              } else {
                                setErrorMsg(null);
                              }
                            }}
                            className="w-20 px-2 py-1 border border-stone-300 rounded text-xs font-mono font-semibold"
                          />
                          <span className="text-stone-500 text-[11px]">{item.unit}</span>
                        </div>

                        <div className="text-right">
                          {item.pricingType === 'fixed' ? (
                            <span className="font-mono font-bold text-stone-900 tabular-nums">
                              ₹{item.totalPrice.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-amber-900 font-medium text-[11px]">
                              Quote Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rule indicator */}
                      {isCraft && (
                        <div className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Wholesale Rule: Minimum {min} Pieces Required
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* SEPARATE TRANSPORT CHARGES BOX (Requirement 6) */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">Product Amount:</span>
                <span className="font-mono font-bold text-stone-900 text-sm tabular-nums">
                  ₹{totalProductAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-amber-900 font-semibold border-t border-stone-200 pt-2">
                <span>Transport Charges:</span>
                <span className="uppercase text-[11px] bg-amber-100/70 px-2 py-0.5 rounded">Extra</span>
              </div>

              <div className="text-[11px] text-stone-500 leading-relaxed pt-1">
                <strong>Final Transport Cost:</strong> To be confirmed separately based on total consignment weight and destination delivery PIN code. Transport charges are added manually by Admin upon route calculation.
              </div>
            </div>

            {/* 25% Advance Payment Notice (Order Confirmation Requirement) */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>25% Advance Payment Requirement</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                A <strong>25% advance deposit is required upfront</strong> to initiate and confirm your order dispatch.
              </p>
              {totalProductAmount > 0 && (
                <div className="flex justify-between items-center pt-1.5 border-t border-amber-200 font-semibold text-amber-950">
                  <span>Payable Advance (25%):</span>
                  <span className="font-mono text-sm tabular-nums text-amber-900 font-bold">
                    ₹{Math.round(totalProductAmount * 0.25).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp Direct Order Button */}
            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire / Order on WhatsApp</span>
            </button>
          </div>

          {/* Logistics highlights */}
          <div className="p-5 bg-stone-100 rounded-xl border border-stone-200 text-xs space-y-2 text-stone-600">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-800" />
              <span>Pan-India Transport Assurance</span>
            </div>
            <p className="leading-relaxed">
              {settings.transportInformation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
