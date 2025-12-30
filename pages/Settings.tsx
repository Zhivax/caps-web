
import React from 'react';
import { Settings as SettingsIcon, Rocket, Clock, Sparkles } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="relative p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/50">
          <SettingsIcon className="text-indigo-600 animate-[spin_10s_linear_infinite]" size={64} />
          <div className="absolute -top-2 -right-2 p-3 bg-amber-400 text-white rounded-2xl shadow-lg rotate-12">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Platform Configuration
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100">
            <Rocket size={12} /> Coming Soon
          </span>
          <span className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> In Development
          </span>
        </div>
        <p className="text-xs font-medium text-slate-400 leading-relaxed px-6">
          We are building a robust preference engine to help you customize your supply chain experience. This feature will be available in the next major update.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl opacity-40 grayscale">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-slate-100 rounded-3xl border-dashed"></div>
        ))}
      </div>
    </div>
  );
};
