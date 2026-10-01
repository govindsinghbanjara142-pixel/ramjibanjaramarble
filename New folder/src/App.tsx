/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BulkOrderPage } from './pages/BulkOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ShippingPage } from './pages/ShippingPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const AppContent: React.FC = () => {
  const { currentPage, pageParams, isAdminLoggedIn } = useApp();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;

      case 'marble':
        return (
          <CatalogPage
            initialCategory="Marble"
            pageTitle="Makrana & Indian Natural Marble"
            pageDescription="Pure Makrana white, Albeta, Dungri, green, black, beige, and onyx marbles quarried and calibrated for flooring, cladding, and temple architecture across India."
          />
        );

      case 'granite':
        return (
          <CatalogPage
            initialCategory="Granite"
            pageTitle="Premium Indian Natural Granite"
            pageDescription="Mirror-polished Telephone Black, Kashmir White, steel grey, and red granites. Custom slab, tile, and block lots for kitchen platforms and commercial facades."
          />
        );

      case 'handicraft':
      case 'handicrafts':
      case 'marble-craft':
        return (
          <CatalogPage
            initialCategory="Handicrafts"
            pageTitle="Handcrafted Stone Art & Decor"
            pageDescription="Hand-carved Makrana marble diyas, candle holders, decorative urns, bowls, and statues. Dedicated bulk supply for retailers, corporate gifts, and festive distributors across India."
          />
        );

      case 'all-products':
        return (
          <CatalogPage
            initialCategory="all"
            pageTitle="All Marble, Granite & Handcrafted Products"
            pageDescription="Browse our complete catalog of natural stone slabs, tiles, and wholesale handcrafted marble decor."
          />
        );

      case 'product-details':
        return <ProductDetailPage productId={pageParams.id} />;

      case 'bulk-order':
        return <BulkOrderPage />;

      case 'about':
        return <AboutPage />;

      case 'shipping-transport':
        return <ShippingPage />;

      case 'terms':
        return <TermsPage />;

      case 'privacy':
        return <PrivacyPage />;

      case 'contact':
        return <ContactPage />;

      case 'admin':
      case 'admin-login':
      case 'admin-dashboard':
        return isAdminLoggedIn ? <AdminDashboardPage /> : <AdminLoginPage />;

      default:
        return <HomePage />;
    }
  };

  const isAdminView = (currentPage === 'admin' || currentPage === 'admin-dashboard') && isAdminLoggedIn;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Hide public navbar on admin dashboard to provide dedicated administrative workspace */}
      {!isAdminView && <Navbar />}

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Hide public footer and floating WhatsApp on admin dashboard */}
      {!isAdminView && (
        <>
          <Footer />
          <WhatsAppFloating />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
