import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Phone, Mail, MessageCircle, Send, Clock, Building2, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, openWhatsAppOrder } = useApp();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsAppOrder(undefined, undefined, {
      fullName: name,
      mobile,
      city,
      businessName: message ? `Query: ${message}` : undefined
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-3 border-b border-stone-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          All India Mines & Showroom Desk
        </span>
        <h1 className="font-display text-4xl font-bold text-stone-900">
          Contact {settings.businessName}
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Visit our manufacturing yard in Rajasthan or coordinate direct dispatch and wholesale quotations with our All India mines desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-5 text-xs text-stone-700">
            <h3 className="font-display text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
              Factory & Dispatch Yard
            </h3>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block mb-0.5">Address:</strong>
                <span>{settings.address}, {settings.city}, {settings.state} - {settings.pincode}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block mb-0.5">Direct Phone:</strong>
                <a href={`tel:${settings.phone}`} className="hover:text-amber-800 font-mono">
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block mb-0.5">WhatsApp Dispatch Desk:</strong>
                <span className="font-mono">{settings.whatsappNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block mb-0.5">Email:</strong>
                <a href={`mailto:${settings.email}`} className="hover:text-amber-800">
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block mb-0.5">Operational Hours:</strong>
                <span>Monday – Saturday: 9:00 AM – 7:30 PM (IST)</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct card */}
          <div className="p-6 bg-emerald-700 text-white rounded-xl space-y-3 shadow-md">
            <h4 className="font-display text-lg font-bold">Fastest Response on WhatsApp</h4>
            <p className="text-xs text-emerald-100">
              Send your floor plan, slab sizes, or bulk handicraft quantities for instant factory rates.
            </p>
            <button
              onClick={() => openWhatsAppOrder()}
              className="w-full py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Open WhatsApp Chat</span>
            </button>
          </div>
        </div>

        {/* Right: Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-display text-xl font-bold text-stone-900">
              Send an Instant Inquiry
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Fill details below to open a direct WhatsApp and email inquiry with our sales directors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Singhania"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98290 00000"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City / State / Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Inquiry Details / Specific Requirements
                </label>
                <textarea
                  rows={4}
                  placeholder="Mention stone varieties (e.g. Makrana White Slabs, Black Granite, or 500 pcs Marble Diyas)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                />
              </div>
            </div>

            {submitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Redirecting your inquiry to WhatsApp desk...</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Connect with All India Mines Sales Director</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
