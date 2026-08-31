'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  FileSpreadsheet,
  Calculator,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { ShopLogo } from '@/components/ShopLogo';
import { CloudDoLogo } from '@/components/CloudDoLogo';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already authenticated in localStorage or cookie, redirect
  useEffect(() => {
    const isAuth = localStorage.getItem('kx_session_auth');
    if (isAuth === 'true') {
      router.replace('/');
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your access password');
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

      setIsSuccess(true);
      localStorage.setItem('kx_session_auth', 'true');

      setTimeout(() => {
        router.push('/');
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Incorrect password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 font-comic selection:bg-[#46D8E7]/30 selection:text-slate-900">
      {/* Top Header Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b-2 border-slate-300">
        <div className="flex items-center gap-3">
          <ShopLogo size="md" />
          <div>
            <span className="font-bold text-slate-900 text-base sm:text-lg">
              Kathir Xerox & E-Service Centre
            </span>
            <p className="text-xs text-slate-600">
              கதிர் ஜெராக்ஸ் & இ-சேவை மையம்
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700 bg-white px-3 py-1.5 border border-slate-300">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="font-bold">System Online • v2.4</span>
        </div>
      </div>

      {/* Main Square Split Layout Container - Spacious & Uncongested */}
      <div className="max-w-5xl w-full mx-auto my-8">
        <div className="bg-white rounded-none shadow-xl border-2 border-slate-900 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* ========================================================= */}
          {/* Left Hero Panel (Visual Brand Side) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-slate-950 p-8 sm:p-12 flex flex-col justify-between text-white relative">
            {/* Top Brand Emblem & Title */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/25 text-xs text-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#46D8E7]" />
                <span>Encrypted POS & Daybook Register</span>
              </div>

              <div className="flex items-start gap-4 pt-2">
                <ShopLogo size="lg" className="shadow-lg shadow-black ring-1 ring-white/30" />
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    கதிர் ஜெராக்ஸ்
                  </h1>
                  <h2 className="text-lg sm:text-xl font-bold text-[#46D8E7]">
                    e - சேவை மையம்
                  </h2>
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                    Kathir Xerox & E-Service Centre • Daily Register & Counter Billing
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Feature Highlights - Relaxed spacing */}
            <div className="my-8 space-y-4">
              <div className="p-4 bg-white/5 border border-white/15 space-y-3">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cycle-Locked Daybook (12:00 AM – 11:59 PM IST)</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200">
                  <Calculator className="w-4 h-4 text-[#46D8E7] shrink-0" />
                  <span>One-Thumb POS Billing & Instant Token Dispatch</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated 9:00 PM WhatsApp Merchant Closing Digest</span>
                </div>
              </div>
            </div>

            {/* Bottom Left Address Note */}
            <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-300 gap-2">
              <span>Next to SNS complex, Perumal temple street , Senjeriputhur</span>
              <span className="text-emerald-400 font-bold shrink-0">PostgreSQL Connected</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Right Login Form Panel - Spacious & Clean */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 p-8 sm:p-12 md:p-14 flex flex-col justify-between bg-white">
            <div className="max-w-md w-full mx-auto my-auto space-y-8">
              
              {/* Form Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wide border border-slate-300">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  Merchant Security Access
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 pt-1">
                  Sign In to Daybook
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Enter shop password to unlock billing counter, daily cash register, and customer dues ledger.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 bg-rose-50 border-l-4 border-rose-600 text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Access Password (கடவுச்சொல்)
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                      className="w-full bg-slate-50 border-2 border-slate-400 focus:border-slate-950 focus:bg-white text-slate-900 rounded-none pl-10 pr-12 py-3.5 text-base font-bold outline-none transition-all"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-900 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full py-4 px-5 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white rounded-none font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70 cursor-pointer border-2 border-slate-950"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Unlocked! Opening Daybook...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock Daybook / உள்நுழைக</span>
                      <ArrowRight className="w-5 h-5 text-[#46D8E7]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Bottom Footer Attribution: Made by Cloud.DO Technologies */}
      {/* ========================================================= */}
      <div className="max-w-5xl w-full mx-auto pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 font-medium">Made by</span>
          <span className="font-bold text-slate-900">Cloud.DO Technologies</span>
          <CloudDoLogo size="inline" showLink={true} />
        </div>

        <div className="text-xs text-slate-600 text-center sm:text-right">
          <span>Kathir Xerox & E-Service Centre • Senjeriputhur</span>
        </div>
      </div>
    </div>
  );
}
