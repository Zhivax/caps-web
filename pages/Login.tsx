
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('umkm@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email atau kata sandi tidak valid. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-large overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Branding Section */}
        <div className="md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-8">
              <ShieldCheck size={28} className="text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold mb-3 leading-tight">Hub SupplyChain UMKM</h1>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              Sinkronisasi real-time antara Produsen Hijab dan Supplier Kain. Monitor stok, permintaan bahan, dan berkembang bersama.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center">
                <ShieldCheck size={16} className="mr-2" />
                <span>Autentikasi Token JWT</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck size={16} className="mr-2" />
                <span>Kontrol Akses Berbasis Peran</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck size={16} className="mr-2" />
                <span>Enkripsi End-to-End</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-slate-400 text-xs">© 2024 Platform Integrasi SupplyChain - Aman</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Selamat Datang Kembali</h2>
            <p className="text-slate-500 text-sm mt-1">Masuk ke dashboard aman Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="nama@contoh.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 shadow-soft flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Masuk...' : 'Masuk'}</span>
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-3">Akun demo (kata sandi: password123)</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDemoCredentials('umkm@example.com')}
                className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                disabled={isLoading}
              >
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">UMKM</p>
                <p className="text-xs font-medium text-slate-900">umkm@example.com</p>
              </button>
              <button 
                onClick={() => setDemoCredentials('supplier@example.com')}
                className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                disabled={isLoading}
              >
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Supplier</p>
                <p className="text-xs font-medium text-slate-900">supplier@example.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
