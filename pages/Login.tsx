
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('umkm@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (!success) {
      setError('Invalid email or password. Use demo accounts.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 -top-10 w-64 h-64 bg-indigo-500/30 blur-3xl rounded-full" />
        <div className="absolute right-10 bottom-0 w-72 h-72 bg-sky-400/20 blur-3xl rounded-full" />
      </div>
      <div className="bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[28px] shadow-2xl shadow-indigo-900/40 overflow-hidden w-full max-w-4xl flex flex-col md:flex-row relative z-10">
        {/* Branding Section */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4) 0, transparent 35%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.25) 0, transparent 30%)' }} aria-hidden />
          <div className="relative">
            <div className="w-12 h-12 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center mb-8 ring-2 ring-white/20">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">UMKM SupplyChain Hub</h1>
            <p className="text-indigo-50 text-lg leading-relaxed">
              Real-time synchronization between Hijab Producers and Fabric Suppliers. Monitor stock, request materials, and grow together.
            </p>
          </div>
          <div className="hidden md:block relative">
            <p className="text-indigo-100 text-sm">© 2024 SupplyChain Integration Platform</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white/70 backdrop-blur-xl">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-100">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-sky-600 shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Sign In</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setEmail('umkm@example.com')}
                className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <p className="text-[10px] font-bold text-indigo-600 uppercase">Role: UMKM</p>
                <p className="text-sm font-medium text-slate-800">umkm@example.com</p>
              </button>
              <button 
                onClick={() => setEmail('supplier@example.com')}
                className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <p className="text-[10px] font-bold text-indigo-600 uppercase">Role: Supplier</p>
                <p className="text-sm font-medium text-slate-800">supplier@example.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
