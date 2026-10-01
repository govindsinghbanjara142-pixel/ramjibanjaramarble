import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const { products, settings, addToCart, setCurrentPage, openWhatsAppOrder } = useApp();

  const product = products.find(p => p.id === productId) || products[0];

  const isCraft =
    product.orderRulesType === 'craft_bulk' ||
    product.category.toLowerCase().includes('craft') ||
    product.category.toLowerCase().includes('handicraft') ||
    product.category.toLowerCase().includes('brass');

  const minQty = product.minQuantity || (isCraft ? (settings.craftDefaultMinQty || 100) : 1);

  const [quantity, setQuantity] = useState<number>(minQty);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900 font-display">Product Not Found</h2>
        <p className="text-sm text-stone-600">The requested product could not be located in our catalog.</p>
        <button
          onClick={() => setCurrentPage('all-products')}
          className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-semibold uppercase"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    if (val < minQty) {
      if (isCraft) {
        setValidationError(`Minimum order quantity is ${minQty} pieces. Bulk/Wholesale orders only.`);
      } else {
        setValidationError(`Minimum order quantity is ${minQty} ${product.unit}.`);
      }
    } else {
      setValidationError(null);
    }
  };

  const handleAddToCart = () => {
    if (quantity < minQty) {
      if (isCraft) {
        setValidationError(`Minimum order quantity is ${minQty} pieces. Bulk/Wholesale orders only.`);
      } else {
        setValidationError(`Minimum order quantity is ${minQty} ${product.unit}.`);
      }
      return;
    }

    const res = addToCart(product, quantity);
    if (res.success) {
      setValidationError(null);
      setSuccessMessage(`Added ${quantity} ${product.unit} to your bulk inquiry.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setValidationError(res.message || 'Validation error');
    }
  };

  const handleWhatsApp = () => {
    openWhatsAppOrder(product, quantity);
  };

  const images = product.images?.length > 0
    ? product.images
    : ['/src/assets/images/makrana_white_marble_1790747884116.jpg'];

  const productTotal = product.pricingType === 'fixed' ? product.price * quantity : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('all-products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>
        <div className="text-xs text-stone-400">
          Product Code: <span className="font-mono text-stone-700 font-bold">{product.code}</span>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 w-full bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded">
                {product.badge}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? 'border-amber-800 ring-2 ring-amber-700/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust badges below images */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 gap-4 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>25% Advance to Confirm Order</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Direct Transport Pan-India</span>
            </div>
          </div>
        </div>

        {/* Right: Product Purchase Module */}
        <div className="space-y-6">
          <div>
            {/* Category / Subcategory unboxed metadata */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">/</span>
              <span>{product.subcategory}</span>
              <span aria-hidden="true">/</span>
              <span className="font-mono text-stone-500">{product.code}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Dynamic Order Rules Notice Block */}
          {isCraft ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 text-xs text-amber-950">
              <div className="font-black uppercase tracking-wider text-[11px] text-amber-900">
                BULK / WHOLESALE ORDERS ONLY
              </div>
              <p className="text-stone-700">
                • Minimum Order: <strong>{minQty} Pieces</strong> (Orders below {minQty} pieces cannot be accepted).
                <br />
                • Fixed Wholesale Price · No Negotiation Feature.
                <br />
                • All India Delivery Available · Transport Charges Extra.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-1.5 text-xs text-stone-800">
              <div className="font-bold uppercase tracking-wider text-[11px] text-stone-900">
                NATURAL STONE SPECIFICATIONS
              </div>
              <p className="text-stone-600">
                Unit of measure: <strong>{product.unit}</strong> · Minimum quantity: <strong>{minQty} {product.unit}</strong>.
                Freight charges arranged as per truckload/crane dispatch.
              </p>
            </div>
          )}

          {/* Specifications Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-stone-50 px-4 py-2 font-semibold text-stone-900 border-b border-stone-200">
              Technical Specifications
            </div>
            <div className="divide-y divide-stone-150">
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Material Composition</span>
                <span className="text-stone-900 font-semibold">{product.material || 'Natural Stone'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5 bg-stone-50/50">
                <span className="text-stone-500 font-medium">Stone Colour / Vein</span>
                <span className="text-stone-900 font-semibold">{product.colour || 'Natural Mineral'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Surface Finish</span>
                <span className="text-stone-900 font-semibold">{product.finish || 'Polished'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5 bg-stone-50/50">
                <span className="text-stone-500 font-medium">Standard Dimensions</span>
                <span className="text-stone-900 font-semibold">{product.size || 'Custom size available'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Approx. Weight</span>
                <span className="text-stone-900 font-semibold">{product.weight || 'As per calibrated slab'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5 bg-stone-50/50">
                <span className="text-stone-500 font-medium">Stock Availability</span>
                <span className="text-emerald-700 font-semibold">{product.availability}</span>
              </div>
            </div>
          </div>

          {/* Price & Quantity Box */}
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-wider block">Price</span>
                {product.pricingType === 'fixed' ? (
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-semibold text-stone-700">₹</span>
                    <span className="font-display text-3xl font-bold text-stone-900 tabular-nums">
                      {product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-stone-600 font-medium">/ {product.unit}</span>
                  </div>
                ) : (
                  <div className="font-display text-2xl font-bold text-amber-900 mt-0.5">
                    Contact / Get Quote
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-500 uppercase tracking-wider block">Minimum Order</span>
                <span className="text-sm font-bold text-stone-900 tabular-nums">
                  {minQty} {product.unit}
                </span>
              </div>
            </div>

            {/* Quantity Stepper & Validation */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Enter Order Quantity ({product.unit}):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={minQty}
                  value={quantity}
                  onChange={e => handleQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-36 px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm font-semibold font-mono text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                />
                <span className="text-xs text-stone-600">{product.unit}</span>
              </div>

              {/* Validation alert message */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>

            {/* Transport Separator Line (Requirement 6) */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1 text-stone-700">
              {product.pricingType === 'fixed' && (
                <div className="flex justify-between items-center font-medium">
                  <span>Product Amount ({quantity} {product.unit}):</span>
                  <span className="font-mono text-stone-900 font-bold tabular-nums">
                    ₹{productTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-amber-900">
                <span>Transport Charges:</span>
                <span className="font-semibold uppercase text-[11px]">Extra</span>
              </div>
              <div className="flex justify-between items-center text-stone-500 text-[11px] pt-1 border-t border-stone-200">
                <span>Final Transport Cost:</span>
                <span>To be confirmed separately based on delivery PIN code</span>
              </div>
            </div>

            {/* 25% Advance Payment Notice */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div>
                  <strong>Order Confirmation:</strong> A 25% advance payment is required to confirm and process your order.
                </div>
                {product.pricingType === 'fixed' && (
                  <div className="font-semibold text-amber-900 text-[11px]">
                    Payable Advance (25%): ₹{Math.round(productTotal * 0.25).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bulk Inquiry</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Delivery & Transport Info from Admin Settings */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-800" />
              <span>Pan-India Delivery & Logistics Policy</span>
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {settings.deliveryInformation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
