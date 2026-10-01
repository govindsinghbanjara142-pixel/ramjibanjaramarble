import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ShieldCheck, Box, Clock, MapPin, AlertCircle } from 'lucide-react';

export const ShippingPage: React.FC = () => {
  const { settings, setCurrentPage } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 border-b border-stone-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Logistics Policy & Coverage
        </span>
        <h1 className="font-display text-4xl font-bold text-stone-900">
          Shipping & Pan-India Transport
        </h1>
        <p className="text-sm text-stone-600 max-w-3xl">
          Comprehensive shipping guidelines for heavy natural stone slabs and delicate handcrafted marble artifacts.
        </p>
      </div>

      {/* Main transport charge notice rule */}
      <div className="p-6 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-950">
        <h3 className="font-bold text-sm uppercase tracking-wider text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
          <span>Transport Charges Are Extra & Paid Separately</span>
        </h3>
        <p className="text-stone-700 leading-relaxed">
          Due to the high weight variance of natural stone (marble and granite slabs) and distance differentials across India, <strong>transport charges are not embedded into product prices</strong>. All product rates are ex-factory Kishangarh/Makrana. Final freight is calculated precisely based on consignment weight, truck type, and destination PIN code.
        </p>
      </div>

      {/* Dynamic text from admin settings */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
        <h3 className="font-display text-xl font-bold text-stone-900">
          Dispatch & Packaging Protocols
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
          {settings.deliveryInformation}
        </p>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line pt-2 border-t border-stone-150">
          {settings.transportInformation}
        </p>
      </div>

      {/* Breakdown by product type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
            <Box className="w-5 h-5 text-amber-800" />
          </div>
          <h4 className="font-display text-lg font-bold text-stone-900">
            Marble Craft & Handicrafts Packaging
          </h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li>• Individual high-density bubble wrap & thermocol cavity cushioning.</li>
            <li>• Master corrugated cartons with wooden edge protection.</li>
            <li>• Palletized and strapped for forklift handling on bulk orders (100+ pcs).</li>
            <li>• Delivery timeline: 4 to 8 working days across tier-1 and tier-2 Indian cities.</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
            <Truck className="w-5 h-5 text-amber-800" />
          </div>
          <h4 className="font-display text-lg font-bold text-stone-900">
            Marble & Granite Slabs Transport
          </h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li>• Loaded onto open-body heavy commercial vehicles (16-ton to 40-ton trailers).</li>
            <li>• Wooden A-frame supports and high-tensile steel strapping.</li>
            <li>• Unloading via mobile crane or gantry is organized at client destination.</li>
            <li>• Toll, e-way bill documentation, and transit insurance included on request.</li>
          </ul>
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={() => setCurrentPage('bulk-order')}
          className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          Proceed to Bulk Order Form
        </button>
      </div>
    </div>
  );
};
