import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, X, Send } from 'lucide-react';

export const WhatsAppFloating: React.FC = () => {
  const { settings, openWhatsAppOrder } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickCity, setQuickCity] = useState('');
  const [quickRequirement, setQuickRequirement] = useState('');

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsAppOrder(undefined, undefined, {
      fullName: quickName || 'Prospective Buyer',
      city: quickCity || 'India',
      businessName: quickRequirement ? `Requirement: ${quickRequirement}` : undefined
    });
    setIsOpen(false);
    setQuickName('');
    setQuickCity('');
    setQuickRequirement('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick popup drawer */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h6 className="font-semibold text-sm leading-tight">{settings.businessName}</h6>
                <p className="text-[11px] text-emerald-100">WhatsApp Dispatch & Wholesale Desk</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 text-xs text-stone-700">
            <p className="leading-relaxed text-stone-600">
              Direct factory chat for Marble slabs, Granite lots, and wholesale Marble Craft bulk orders (min 100 pcs).
            </p>

            <form onSubmit={handleQuickSend} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  City / State *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Telangana"
                  value={quickCity}
                  onChange={e => setQuickCity(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Requirement / Products
                </label>
                <input
                  type="text"
                  placeholder="e.g. Makrana Slabs / 200 Marble Diyas"
                  value={quickRequirement}
                  onChange={e => setQuickRequirement(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start WhatsApp Chat</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="text-xs font-semibold tracking-wide whitespace-nowrap pr-1">
          WhatsApp Us
        </span>
      </button>
    </div>
  );
};
