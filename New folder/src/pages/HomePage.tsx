import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import {
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Layers,
  Sparkles,
  PackageOpen
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, categories, setCurrentPage, openWhatsAppOrder, isAdminLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

  const featuredProducts = products.filter(p => p.active && (p.featured || p.badge));

  const filteredDisplayProducts = activeTab === 'all'
    ? featuredProducts.slice(0, 8)
    : products.filter(p => p.active && p.category.toLowerCase().includes(activeTab.toLowerCase())).slice(0, 8);

  const heroImage = '/src/assets/images/hero_marble_granite_showroom_1790747852943.jpg';

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-stone-950 text-white overflow-hidden">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Marble & Granite Showroom"
            className="w-full h-full object-cover opacity-35 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-400">
              <span>MARBLE</span>
              <span>•</span>
              <span>GRANITE</span>
              <span>•</span>
              <span>HANDICRAFTS</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-[1.12]">
              Premium Marble, Granite & Handcrafted Products
            </h1>

            {/* Brand Promise Tagline */}
            <div className="text-amber-200 text-sm sm:text-base font-serif italic tracking-wide border-l-2 border-amber-400/80 pl-3.5 py-0.5">
              “From Our Mines & Factory to Your Door — Bringing Quality Directly to You.”
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed max-w-2xl">
              Authentic Makrana white marble, high-density Indian granites, and exquisite artisanal stone artifacts supplied direct to architects, contractors, and corporate buyers across India.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setCurrentPage('all-products')}
                className="px-6 py-3.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-2 shadow-lg hover:shadow-amber-900/30"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage('bulk-order')}
                className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>Bulk Enquiry</span>
              </button>

              <button
                onClick={() => openWhatsAppOrder()}
                className="px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </button>
            </div>

            {/* Key trust indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>25% Advance to Confirm Order</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Insured Pan-India Transport</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Calibrated Stone Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPORTANT ORDER RULE NOTICE (SPECIAL HIGHLIGHT AS REQUIRED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded">
                Important Ordering Guidelines
              </div>
              <h3 className="font-display text-2xl font-bold text-amber-950">
                Bulk / Wholesale Rules for Marble Craft & Artisanal Decor
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                For <strong>Marble Craft & Handicraft products</strong> (Marble Diyas, Candle Holders, Bowls, Hand-carved Decor):
                Orders are accepted strictly for bulk/wholesale lots with a <strong>minimum order of 100 pieces</strong>. Fixed pricing applies with no retail haggling. 
                <span className="block mt-1 text-xs text-stone-600">
                  <em>Note:</em> Marble and Granite slabs/tiles operate under standard square footage/meter or block units configured by Admin.
                </span>
              </p>
            </div>

            {/* Dynamic visual notice block */}
            <div className="bg-white p-4 rounded-xl border border-amber-300 text-xs space-y-1.5 shrink-0 min-w-[270px] shadow-xs">
              <div className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                BULK / WHOLESALE ORDERS ONLY
              </div>
              <div className="text-stone-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span><strong>Minimum Order:</strong> 100 Pieces</span>
              </div>
              <div className="text-stone-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span><strong>Pricing:</strong> Fixed Wholesale Price</span>
              </div>
              <div className="text-stone-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span><strong>Dispatch:</strong> All India Delivery Available</span>
              </div>
              <div className="text-stone-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span><strong>Freight:</strong> Transport Charges Extra</span>
              </div>
              <div className="mt-2 pt-2 border-t border-amber-200 text-amber-950 font-medium flex items-start gap-1.5 bg-amber-100/60 p-1.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0 mt-1" />
                <span><strong>Order Confirmation:</strong> A 25% advance deposit is required to confirm the order.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS CATEGORIES CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              Natural Stone & Handcrafted Art
            </span>
            <h2 className="font-display text-3xl font-bold text-stone-900">
              Browse Business Categories
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('all-products')}
            className="text-xs font-semibold text-amber-900 hover:text-amber-700 inline-flex items-center gap-1"
          >
            <span>View All Categories & Subcategories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            let pageTarget = 'all-products';
            const slug = cat.slug.toLowerCase();
            if (slug.includes('marble') && !slug.includes('craft')) pageTarget = 'marble';
            else if (slug.includes('granite')) pageTarget = 'granite';
            else if (slug.includes('craft') || slug.includes('handicraft')) pageTarget = 'handicraft';

            return (
              <div
                key={cat.id}
                onClick={() => setCurrentPage(pageTarget)}
                className="group relative bg-white rounded-xl border border-stone-200 hover:border-amber-700 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-4/3 w-full bg-stone-100 overflow-hidden relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase block">
                      {cat.subcategories.length} Varieties
                    </span>
                    <h3 className="font-display text-lg font-bold leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-amber-900 group-hover:text-amber-700">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SHOWCASE WITH SEGMENTED TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              Selected Catalog
            </span>
            <h2 className="font-display text-3xl font-bold text-stone-900">
              Featured Stone & Handcrafted Lots
            </h2>
          </div>

          {/* Interactive Filter Tabs (Buttons with click handlers per constitution) */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Lots' },
              { id: 'marble', label: 'Marble' },
              { id: 'granite', label: 'Granite' },
              { id: 'handicraft', label: 'Handicrafts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors focus:outline-none ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-950 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid / Empty State */}
        {filteredDisplayProducts.length === 0 ? (
          <div className="py-14 px-6 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/70 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-900 shadow-xs">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-display text-xl font-bold text-stone-900">Products Coming Soon</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Direct quarry marble and granite inventory is currently being prepared. You can upload your products anytime directly via the Admin Panel.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => setCurrentPage('admin-dashboard')}
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors shadow-xs"
                >
                  Upload Products in Admin Panel
                </button>
              ) : (
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors shadow-xs"
                >
                  Contact for Direct Inquiries
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDisplayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentPage('all-products')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <span>View Complete {products.length > 0 ? `${products.length}+ ` : ''}Product Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. WHY BHARAT STONE & CRAFTS / CRAFTSMANSHIP PILLARS */}
      <section className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Direct from All India Mines To Project Site
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              The Gold Standard in Natural Stone & Craft
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              We eliminate intermediaries by directly sourcing and supplying from premier mines across all states of India, providing verified purity and master carving precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-800/80 p-6 rounded-xl border border-stone-700/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-amber-200">
                All India Mines Natural Stone
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Direct extraction and supply from premier marble & granite mines across India. Our natural stone lots feature high mineral density and mirror polish longevity.
              </p>
            </div>

            <div className="bg-stone-800/80 p-6 rounded-xl border border-stone-700/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-amber-200">
                Hereditary Rajasthani Artisans
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Every diya, bowl, and hand-carved article is shaped by traditional master craftsmen. Rigorous bulk production capacity ensures prompt fulfillment of 100+ to 10,000+ piece consignments.
              </p>
            </div>

            <div className="bg-stone-800/80 p-6 rounded-xl border border-stone-700/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-amber-200">
                Reinforced Pan-India Logistics
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Specialized timber framing, gantry crane loading, and transit insurance for heavy slabs. Zero-breakage bubble and foam packaging for craft consignments delivered anywhere in India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PAN-INDIA INQUIRY CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 rounded-2xl p-8 sm:p-12 border border-stone-300 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">
              Instant Pan-India Wholesale Quotes
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Need custom slab measurements or a 500+ piece handicraft consignment?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Connect with our dispatch managers for immediate lot availability, factory rates, and freight estimation to your specific district or state.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => openWhatsAppOrder()}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </button>
            <button
              onClick={() => setCurrentPage('bulk-order')}
              className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Submit Bulk Inquiry</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
