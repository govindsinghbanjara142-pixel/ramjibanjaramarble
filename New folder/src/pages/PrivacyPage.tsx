import React from 'react';
import { useApp } from '../context/AppContext';

export const PrivacyPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2 border-b border-stone-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Client Confidentiality
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500">
          Last revised: {new Date().getFullYear()} · Corporate & Wholesale Client Data Protection
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
        {settings.privacyPolicy}

        <div className="pt-6 border-t border-stone-200 space-y-3">
          <h4 className="font-display text-base font-bold text-stone-900">
            Data Usage & Security:
          </h4>
          <p className="text-xs text-stone-600">
            • Your full name, mobile number, delivery address, and GST identification details submitted through our bulk inquiry forms are strictly safeguarded and utilized solely for logistics dispatch, billing, and order coordination.
          </p>
          <p className="text-xs text-stone-600">
            • We never sell, lease, or distribute wholesale client databases or procurement records to external marketing entities.
          </p>
        </div>
      </div>
    </div>
  );
};
