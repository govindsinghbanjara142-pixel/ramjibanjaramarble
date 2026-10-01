import React from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin, MessageCircle, Instagram, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setCurrentPage, openWhatsAppOrder } = useApp();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Highlight Banner */}
        <div className="p-6 mb-12 rounded-xl bg-gradient-to-r from-stone-900 to-stone-850 border border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h4 className="font-display text-xl sm:text-2xl text-amber-200 font-semibold mb-1">
              Direct from All India Mines & Artisanal Bulk Orders
            </h4>
            <p className="text-sm text-stone-400">
              Supplying architects, corporate gift houses, temple trusts, and stone contractors across India.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <button
              onClick={() => openWhatsAppOrder()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Inquiry
            </button>
            <button
              onClick={() => setCurrentPage('bulk-order')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Bulk Inquiry Form
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800 text-sm">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              {settings.businessName}
            </span>
            <p className="text-amber-300/90 text-xs font-medium uppercase tracking-wider">
              Marble • Granite • Handicrafts
            </p>
            <p className="text-amber-200/90 text-xs font-serif italic border-l border-amber-500/40 pl-2.5">
              “{settings.tagline}”
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              {settings.description}
            </p>
            
            {/* Rule & Logistics Callouts */}
            <div className="pt-2 space-y-2">
              <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg text-xs">
                <span className="text-amber-400 font-semibold block">Marble Craft & Handicraft Rule:</span>
                <span className="text-stone-300">Bulk / Wholesale Orders Only · Minimum Order: 100 Pieces · Fixed Price</span>
              </div>
              <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg text-xs">
                <span className="text-emerald-400 font-semibold block">Pan-India Freight Policy:</span>
                <span className="text-stone-300">All India Delivery Available · Transport Charges Extra (Calculated Separately)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h5 className="text-white text-xs font-bold uppercase tracking-wider text-stone-200">
              Quick Links
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="hover:text-amber-300 transition-colors"
                >
                  About Us & Quarry
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('all-products')}
                  className="hover:text-amber-300 transition-colors"
                >
                  All Products Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('bulk-order')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Bulk Inquiry Form
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('shipping-transport')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Shipping & Transport
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Contact & Factory Location
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-3">
            <h5 className="text-white text-xs font-bold uppercase tracking-wider text-stone-200">
              Stone Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentPage('marble')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Makrana & Indian Marble
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('granite')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Granite Slabs & Tiles
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('marble-craft')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Marble Craft & Diyas (Bulk)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('handicrafts')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Handcrafted Stone Art
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="space-y-3">
            <h5 className="text-white text-xs font-bold uppercase tracking-wider text-stone-200">
              Factory & Dispatch
            </h5>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white tabular-nums">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </div>
              {settings.instagramId && (
                <div className="flex items-center gap-2 pt-1 text-stone-300">
                  <Instagram className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.instagramId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved across India.
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setCurrentPage('terms')}
              className="hover:text-stone-300 transition-colors"
            >
              Terms & Conditions
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('privacy')}
              className="hover:text-stone-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('admin-login')}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Access</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
