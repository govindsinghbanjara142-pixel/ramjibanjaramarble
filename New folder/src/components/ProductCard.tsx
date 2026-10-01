import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { MessageCircle, ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setCurrentPage, addToCart, openWhatsAppOrder } = useApp();
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const isCraft =
    product.orderRulesType === 'craft_bulk' ||
    product.category.toLowerCase().includes('craft') ||
    product.category.toLowerCase().includes('handicraft') ||
    product.category.toLowerCase().includes('brass');

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qty = product.minQuantity || (isCraft ? 100 : 1);
    const result = addToCart(product, qty);
    if (result.success) {
      setAdded(true);
      setFeedbackMsg(null);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setFeedbackMsg(result.message || 'Check minimum quantity requirements');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWhatsAppOrder(product, product.minQuantity);
  };

  const mainImage = product.images?.[0] || '/src/assets/images/makrana_white_marble_1790747884116.jpg';

  return (
    <div
      onClick={() => setCurrentPage('product-details', { id: product.id })}
      className="group bg-white rounded-xl border border-stone-200 hover:border-stone-400 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        {!imageError ? (
          <img
            src={mainImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-200 text-stone-500 p-4 text-center">
            <span className="font-display text-stone-700 font-semibold text-base mb-1">{product.name}</span>
            <span className="text-xs text-stone-400">{product.material}</span>
          </div>
        )}

        {/* Subtle status tag (Anti-slop: max 1 quiet tag) */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 bg-stone-900/90 text-stone-100 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
            {product.badge}
          </div>
        )}

        {/* Hover Quick actions overlay */}
        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
          <button
            onClick={handleQuickAdd}
            className="p-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 shadow-md transition-colors"
            title={`Add Minimum Order (${product.minQuantity} ${product.unit}) to Inquiry`}
          >
            {added ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="p-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-colors"
            title="Inquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage('product-details', { id: product.id });
            }}
            className="p-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 shadow-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Zero-Pill Metadata Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 uppercase tracking-wider mb-1">
            <span className="font-medium text-stone-700">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.subcategory}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-stone-400">{product.code}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-display text-base font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-900 transition-colors">
            {product.name}
          </h3>

          {/* Material & specs brief */}
          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
            {product.material} · {product.finish}
          </p>
        </div>

        {/* Pricing & Order Rule Box */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          {/* Price line */}
          <div className="flex items-baseline justify-between">
            <div>
              {product.pricingType === 'fixed' ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-stone-700">₹</span>
                  <span className="text-lg font-bold text-stone-900 tabular-nums font-mono">
                    {product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-stone-500">/ {product.unit}</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-amber-900">
                  Contact / Get Quote
                </span>
              )}
            </div>

            {/* Availability */}
            <span className={`text-[11px] font-medium ${product.availability === 'In Stock' ? 'text-emerald-700' : 'text-stone-500'}`}>
              {product.availability}
            </span>
          </div>

          {/* Order Rule Badge & Distinction */}
          {isCraft ? (
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-md p-1.5 text-[11px] text-amber-950">
              <span className="font-bold block">WHOLESALE / BULK ONLY</span>
              <span className="text-stone-600">
                Min Order: {product.minQuantity} Pieces · Fixed Price
              </span>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200/70 rounded-md p-1.5 text-[11px] text-stone-700">
              <span className="font-semibold block text-stone-900">Natural Stone Lot</span>
              <span className="text-stone-600">
                Min Order: {product.minQuantity} {product.unit} · Freight Extra
              </span>
            </div>
          )}

          {feedbackMsg && (
            <div className="p-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded">
              {feedbackMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
