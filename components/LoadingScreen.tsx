
import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] w-full animate-in fade-in duration-500">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <RefreshCw className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={24} />
    </div>
    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
      Optimizing Resources...
    </p>
  </div>
);
