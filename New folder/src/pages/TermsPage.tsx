import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2 border-b border-stone-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Commercial Governance
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">
          Terms & Conditions
        </h1>
        <p className="text-xs text-stone-500">
          Last revised: {new Date().getFullYear()} · Applicable to all wholesale lots and stone orders
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <div className="space-y-3 whitespace-pre-line">
          {settings.termsAndConditions}
        </div>

        <div className="pt-6 border-t border-stone-200 space-y-3">
          <h4 className="font-display text-base font-bold text-stone-900">
            Wholesale Order Specific Clauses:
          </h4>
          <p className="text-xs text-stone-600">
            • <strong>Marble Craft & Handicraft Rule:</strong> A minimum order threshold of 100 units applies strictly to all handcrafted stone and marble+brass utility decor articles. Quantities under 100 units cannot be processed through our wholesale dispatch pipeline.
          </p>
          <p className="text-xs text-stone-600">
            • <strong>Natural Stone Characteristics:</strong> Marble and granite slabs are 100% natural quarried geological materials. Natural crystal clusters, shade variation, and mineral veins are inherent traits of stone authenticity.
          </p>
          <p className="text-xs text-stone-600">
            • <strong>Freight & Transport:</strong> Transport charges are extra and paid separately as per the transporter's consignment note (bilty/LR).
          </p>
        </div>
      </div>
    </div>
  );
};
