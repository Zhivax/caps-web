
import React from 'react';
import { Settings as SettingsIcon, Rocket, Clock, Sparkles } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-soft">
          <SettingsIcon className="text-slate-900" size={48} />
          <div className="absolute -top-1 -right-1 p-2 bg-amber-400 text-white rounded-lg shadow-soft">
            <Sparkles size={16} />
          </div>
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-slate-900">
          Platform Configuration
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center gap-2">
            <Rocket size={14} /> Coming Soon
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-2">
            <Clock size={14} /> In Development
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed px-6">
          We are building a robust preference engine to help you customize your supply chain experience. This feature will be available in the next major update.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl opacity-40">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white border border-slate-200 rounded-lg border-dashed"></div>
        ))}
      </div>
    </div>
  );
};
