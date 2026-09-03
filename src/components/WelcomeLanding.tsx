'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Clock, 
  FileText, 
  Printer, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X,
  MessageCircle,
  QrCode,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ShopLogo } from '@/components/ShopLogo';
import { CloudDoLogo } from '@/components/CloudDoLogo';
import { formatINR } from '@/lib/formatters';

interface WelcomeLandingProps {
  onUnlockSuccess: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({ onUnlockSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Please enter access password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Incorrect password');
      }

      localStorage.setItem('kx_session_auth', 'true');
      setIsModalOpen(false);
      onUnlockSuccess();
    } catch (err: any) {
      // Offline fallback: accept the env-configured password
      const fallbackPassword = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || '';
      if (fallbackPassword && password.trim() === fallbackPassword.trim()) {
        localStorage.setItem('kx_session_auth', 'true');
        setIsModalOpen(false);
        onUnlockSuccess();
      } else {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const servicesList = [
    {
      category: 'Xerox & Printing (ஜெராக்ஸ் & பிரிண்ட்)',
      items: [
        { name: 'Xerox B&W (A4 Single side)', ta: 'ஜெராக்ஸ் ஒரு பக்கம்', price: 2 },
        { name: 'Xerox B&W (A4 Both sides)', ta: 'ஜெராக்ஸ் இரண்டு பக்கம்', price: 3 },
        { name: 'Color Printout (A4 Single)', ta: 'கலர் பிரிண்ட்', price: 10 },
        { name: 'Passport Size Photo (8 Photos)', ta: 'பாஸ்போர்ட் போட்டோ (8)', price: 50 },
      ]
    },
    {
      category: 'E-Sevai & Online Services (இ-சேவை மையம்)',
      items: [
        { name: 'Aadhar Printout (PVC / Glossy)', ta: 'ஆதார் கார்டு பிரிண்ட்', price: 30 },
        { name: 'Patta / Chitta Download', ta: 'பட்டா / சிட்டா நகல்', price: 40 },
        { name: 'Income / Community Certificate', ta: 'வருமானம் / சாதி சான்றிதழ்', price: 60 },
        { name: 'Smart Ration Card Application', ta: 'ஸ்மார்ட் கார்டு விண்ணப்பம்', price: 50 },
      ]
    },
    {
      category: 'Binding & Finishing (லேமினேஷன் & பைண்டிங்)',
      items: [
        { name: 'A4 Lamination (Glossy Film)', ta: 'A4 லேமினேஷன்', price: 20 },
        { name: 'Spiral Binding (Up to 100 pages)', ta: 'ஸ்பைரல் பைண்டிங்', price: 35 },
        { name: 'Document Scanning & Email/WhatsApp', ta: 'ஸ்கேன் & வாட்ஸ்அப்', price: 10 },
        { name: 'Typing & Project Printouts', ta: 'டைப்பிங் & ப்ராஜெக்ட்', price: 25 },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-comic flex flex-col justify-between selection:bg-[#46D8E7]/30 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShopLogo size="md" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Kathir Xerox & E-Service Centre
              </h1>
              <p className="text-xs text-slate-600">
                கதிர் ஜெராக்ஸ் & இ-சேவை மையம்
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 border border-slate-300 text-xs font-bold text-slate-700">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Shop Open (8:30 AM – 9:30 PM)</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 text-xs sm:text-sm font-bold border-2 border-slate-950 flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#46D8E7]" />
              <span>Unlock Daybook</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="flex-1">
        <section className="bg-slate-950 text-white py-12 sm:py-16 px-4 sm:px-6 border-b-2 border-slate-900 relative">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#46D8E7]" />
              <span>Senjeriputhur Leading Xerox & Citizen E-Sevai Center</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
                கதிர் ஜெராக்ஸ் & இ-சேவை மையம்
              </h2>
              <p className="text-lg sm:text-xl font-bold text-[#46D8E7]">
                Kathir Xerox & E-Service Centre
              </p>
              <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed pt-2">
                High-speed photocopying, color printouts, Tamil Nadu e-Sevai citizen services, certificate downloads, Aadhar card printing, instant lamination, and spiral binding.
              </p>
            </div>

            {/* Quick Details Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="p-3 bg-white/5 border border-white/15 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Shop Location:</span>
                  <span className="text-slate-300">Next to SNS complex, Perumal temple street , Senjeriputhur</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/15 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Call & Inquiry:</span>
                  <a href="tel:9842100000" className="text-[#46D8E7] hover:underline font-bold">+91 9842100000</a>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/15 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Working Hours:</span>
                  <span className="text-slate-300">Mon – Sun: 8:30 AM – 9:30 PM</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/15 flex items-start gap-2.5">
                <QrCode className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Digital Payments:</span>
                  <span className="text-slate-300">GPay / PhonePe / Paytm accepted</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 bg-[#46D8E7] hover:bg-[#3bc4d3] text-slate-950 font-bold text-base border-2 border-white flex items-center gap-2.5 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Lock className="w-5 h-5 text-slate-950" />
                <span>Unlock Merchant Daybook (நாள் பதிவேடு)</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <a
                href="#rates"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-[#46D8E7]" />
                <span>View Service Rates (விலை பட்டியல்)</span>
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Service Rate Catalogue Cards */}
        <section id="rates" className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 border border-sky-300">
              Services & Standard Rates
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              சேவைகள் மற்றும் கட்டண விபரம்
            </h3>
            <p className="text-sm text-slate-600">
              Affordable, reliable, and instant Xerox, Printing, and E-Sevai services in Senjeriputhur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesList.map((cat, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-900 shadow-md flex flex-col justify-between">
                <div className="p-4 bg-slate-100 border-b-2 border-slate-900">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    {cat.category}
                  </h4>
                </div>

                <div className="p-4 divide-y divide-slate-200 flex-1">
                  {cat.items.map((item, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.ta}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-300 shrink-0 font-mono">
                        {formatINR(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
                  <span className="text-xs font-bold text-slate-600">Instant Token & Print</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Unlock Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setError(null);
              }}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-900 border border-slate-300 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-300 text-xs font-bold uppercase text-slate-800">
                <Lock className="w-3.5 h-3.5 text-sky-600" />
                <span>Merchant Register Unlock</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Enter Daybook Password
              </h3>
              <p className="text-xs text-slate-600">
                Authorized staff access to daily counter transactions and ledger records.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-600 text-rose-900 text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Access Password (கடவுச்சொல்)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    autoFocus
                    placeholder="Enter access password"
                    className="w-full bg-slate-50 border-2 border-slate-400 focus:border-slate-950 focus:bg-white text-slate-900 rounded-none pl-9 pr-10 py-3 text-base font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-base border-2 border-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Unlock Daybook / திறக்க</span>
                    <ArrowRight className="w-4 h-4 text-[#46D8E7]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Attribution */}
      <footer className="bg-white border-t-2 border-slate-900 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Made by</span>
            <span className="font-bold text-slate-900">Cloud.DO Technologies</span>
            <CloudDoLogo size="inline" showLink={true} />
          </div>

          <div className="text-slate-600 text-center sm:text-right">
            <span>Kathir Xerox & E-Service Centre • Senjeriputhur</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
