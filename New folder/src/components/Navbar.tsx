import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, ShoppingBag, Menu, X, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { settings, currentPage, setCurrentPage, cartItems, isAdminLoggedIn } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Marble', page: 'marble' },
    { name: 'Granite', page: 'granite' },
    { name: 'Handicrafts', page: 'handicrafts' },
    { name: 'All Products', page: 'all-products' },
    { name: 'Bulk Order', page: 'bulk-order' },
    { name: 'About', page: 'about' },
  ];

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Bar Announcement / Wholesale Kicker */}
      <div className="bg-stone-900 text-stone-200 px-4 py-1 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 tracking-wide">
            <span className="text-amber-400 font-semibold">PAN-INDIA DISPATCH</span>
            <span className="text-stone-500 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-stone-300">Direct Supply from All India Mines (Marble & Granite)</span>
            <span className="text-stone-500 hidden md:inline">·</span>
            <span className="hidden md:inline text-amber-200/90">Crafts: Min 100 Pcs Bulk Orders</span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span className="tabular-nums">{settings.phone}</span>
            </a>
            {isAdminLoggedIn ? (
              <button
                onClick={() => setCurrentPage('admin-dashboard')}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-900/60 text-amber-300 hover:text-amber-200 hover:bg-amber-900 font-medium text-xs transition-colors border border-amber-700/50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('admin-login')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs transition-colors border border-stone-700"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-left group focus:outline-none"
            >
              <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors">
                {settings.businessName}
              </span>
            </button>
          </div>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.slice(0, 7).map(link => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => setCurrentPage(link.page)}
                  className={`text-sm font-medium transition-colors tracking-wide relative py-1 focus:outline-none ${
                    isActive
                      ? 'text-amber-800 font-semibold'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('bulk-order')}
              className="relative p-2.5 text-stone-700 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors focus:outline-none"
              title="View Bulk Inquiry Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {cartItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage('bulk-order')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Bulk Inquiry {cartItems.length > 0 && `(${totalCartCount})`}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF9F5] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => {
                setCurrentPage(link.page);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium ${
                currentPage === link.page
                  ? 'bg-amber-100/60 text-amber-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {link.name}
            </button>
          ))}
          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setCurrentPage('bulk-order');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 rounded-lg"
            >
              Submit Bulk Inquiry
            </button>
            <button
              onClick={() => {
                setCurrentPage(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 text-center text-xs text-stone-600 hover:text-stone-900"
            >
              {isAdminLoggedIn ? 'Open Admin Panel' : 'Admin Login'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
