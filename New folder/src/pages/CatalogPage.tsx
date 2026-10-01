import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown, PackageOpen } from 'lucide-react';

interface CatalogPageProps {
  initialCategory?: string;
  pageTitle?: string;
  pageDescription?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialCategory,
  pageTitle,
  pageDescription
}) => {
  const { products, categories, setCurrentPage } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [priceSort, setPriceSort] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Available subcategories based on category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') {
      const allSubs = categories.flatMap(c => c.subcategories);
      return Array.from(new Set(allSubs));
    }
    const cat = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    return cat ? cat.subcategories : [];
  }, [selectedCategory, categories]);

  // Unique materials in active products
  const materials = useMemo(() => {
    const list = products.map(p => p.material).filter(Boolean);
    return Array.from(new Set(list));
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product.active) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const catMatch = product.category.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!catMatch) return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
        return false;
      }

      // Material filter
      if (selectedMaterial !== 'all' && product.material !== selectedMaterial) {
        return false;
      }

      // Availability filter
      if (selectedAvailability !== 'all' && product.availability !== selectedAvailability) {
        return false;
      }

      // Featured filter
      if (featuredOnly && !product.featured) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCode = product.code.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesSub = product.subcategory.toLowerCase().includes(query);
        const matchesMat = product.material.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesSub && !matchesMat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (priceSort === 'low-to-high') return a.price - b.price;
      if (priceSort === 'high-to-low') return b.price - a.price;
      return 0;
    });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedMaterial,
    selectedAvailability,
    featuredOnly,
    searchQuery,
    priceSort
  ]);

  const isCraftCategory =
    selectedCategory.toLowerCase().includes('craft') ||
    selectedCategory.toLowerCase().includes('handicraft') ||
    selectedCategory.toLowerCase().includes('brass');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3 border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              Direct Supply Catalog
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              {pageTitle || (selectedCategory !== 'all' ? `${selectedCategory} Collection` : 'All Stone & Craft Products')}
            </h1>
            <p className="text-sm text-stone-600 max-w-2xl mt-1">
              {pageDescription ||
                'Explore our quarry-cut marble, premium granites, and artisanal handicraft articles with live wholesale lot specifications.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden px-3.5 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 flex items-center gap-1.5"
            >
              <Filter className="w-4 h-4 text-stone-600" />
              <span>Filters</span>
            </button>
            <span className="text-xs font-medium text-stone-500 tabular-nums">
              Showing {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Dynamic Category Notice for Craft vs Marble/Granite */}
        {isCraftCategory ? (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="uppercase">Marble Craft / Handicraft Wholesale Policy:</strong> Minimum order is <strong>100 pieces</strong>. Fixed price. All India delivery available. Transport charges extra.
            </div>
            <button
              onClick={() => setCurrentPage('bulk-order')}
              className="px-3 py-1 bg-amber-800 text-white text-[11px] font-semibold uppercase rounded self-start sm:self-auto hover:bg-amber-900 transition-colors"
            >
              Wholesale Order
            </button>
          </div>
        ) : (
          <div className="p-3 bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-700">
            <strong>Natural Stone Policy:</strong> Minimum quantities, pricing (Fixed / Contact for Quote), and units (Sq. Ft., Sq. M., Slabs, Tiles, Blocks) are determined per lot. Transport charges calculated separately by weight and destination.
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* FILTERS SIDEBAR */}
        <aside
          className={`${
            showFiltersMobile ? 'block' : 'hidden'
          } lg:block bg-white p-5 rounded-xl border border-stone-200 space-y-6 lg:sticky lg:top-24 shadow-xs`}
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-800" />
              <span>Filters & Sorting</span>
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSelectedMaterial('all');
                setSelectedAvailability('all');
                setFeaturedOnly(false);
                setSearchQuery('');
                setPriceSort('default');
              }}
              className="text-[11px] text-amber-800 hover:text-amber-900 font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Search Products</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Name, code, finish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Category</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('all');
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          {availableSubcategories.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={e => setSelectedSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white"
              >
                <option value="all">All Subcategories</option>
                {availableSubcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Material Filter */}
          {materials.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Stone Material</label>
              <select
                value={selectedMaterial}
                onChange={e => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white"
              >
                <option value="all">All Materials</option>
                {materials.map(mat => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Availability */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Availability</label>
            <select
              value={selectedAvailability}
              onChange={e => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white"
            >
              <option value="all">All Availabilities</option>
              <option value="In Stock">In Stock (Immediate Dispatch)</option>
              <option value="Made to Order">Made to Order</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Price Sorting */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Price Order</label>
            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none bg-white"
            >
              <option value="default">Default Catalog Order</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="pt-2 border-t border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={e => setFeaturedOnly(e.target.checked)}
                className="rounded border-stone-300 text-amber-800 focus:ring-amber-800"
              />
              <span className="font-medium">Show Featured Lots Only</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {products.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 space-y-4 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-900 shadow-xs">
                <PackageOpen className="w-7 h-7" />
              </div>
              <div className="font-display text-2xl font-bold text-stone-900">
                Products Coming Soon
              </div>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Direct quarry marble and granite inventory is currently being uploaded. Admin can add products anytime directly via the Admin Panel.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Contact For Inquiries
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-stone-200 space-y-4">
              <div className="font-display text-2xl font-semibold text-stone-700">
                No matching stone products found
              </div>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try clearing your search query or adjusting your category/material filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setSelectedMaterial('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium uppercase"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
