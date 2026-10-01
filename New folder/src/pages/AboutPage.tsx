import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Truck, CheckCircle2, Building2, Sparkles, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, setCurrentPage } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          All India Mines & Processing Infrastructure
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 leading-tight">
          About {settings.businessName}
        </h1>
        <p className="text-base text-amber-900 font-serif italic border-l-2 border-amber-600 pl-3 leading-relaxed">
          “{settings.tagline}”
        </p>
      </div>

      {/* Hero Stone Factory / Craft Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
          <img
            src="/src/assets/images/hero_marble_granite_showroom_1790747852943.jpg"
            alt="Marble & Granite Factory"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4 text-stone-700 text-sm leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-stone-900">
            Pioneering Natural Stone Supply Across India
          </h2>
          <p>
            Established at the stone manufacturing capital of Rajasthan, <strong>{settings.businessName}</strong> operates integrated gangsaw processing, calibrating lines, and dedicated artisan carving workshops. We specialize in supplying world-renowned Makrana white marble, high-strength granites, and intricately carved marble utility crafts.
          </p>
          <p>
            Our stone blocks are harvested directly from authentic geological veins, ensuring uniform crystalline composition, exceptional compressive strength, and mirror polish durability.
          </p>
          <div className="pt-2 flex items-center gap-2 text-stone-800 font-medium">
            <MapPin className="w-4 h-4 text-amber-800" />
            <span>Facility: {settings.address}, {settings.city}, {settings.state} - {settings.pincode}</span>
          </div>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-100/60 flex items-center justify-center text-amber-900">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-stone-900">Direct from All India Mines</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Eliminating intermediate brokers to deliver genuine Makrana marble, granites, and natural stones directly from premier mines across India to project sites with full dimensional accountability.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-100/60 flex items-center justify-center text-amber-900">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-stone-900">Artisanal Handicraft Hub</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Collaborating with over 80+ master chiseleurs in Rajasthan to produce wholesale consignments of hand-carved marble diyas, candle holders, and carved artisan gift sets.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-100/60 flex items-center justify-center text-amber-900">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-stone-900">Robust Pan-India Freight</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            From single-crate handicraft shipments to 25-ton full truckload slab transports, our registered freight networks ensure safe, tracked, and insured delivery to every state in India.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="p-8 rounded-2xl bg-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-bold">Partner with {settings.businessName || 'Ramji Banjara Marble L.U'}</h3>
          <p className="text-stone-300 text-xs">Reach out for architecture samples, test reports, or bulk artisan consignments.</p>
        </div>
        <button
          onClick={() => setCurrentPage('contact')}
          className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap"
        >
          Contact Our All India Mines Desk
        </button>
      </div>
    </div>
  );
};
