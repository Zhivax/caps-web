
import React, { useState, useMemo, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { HijabProduct } from '../../types';
import { CheckCircle, AlertTriangle, Layers, Search } from 'lucide-react';
import { ViewportAware } from '../../components/ViewportAware';

const HijabRow = memo(({ p }: { p: HijabProduct }) => {
  const isLow = p.stock < p.threshold;
  return (
    <tr className="hover:bg-slate-50/50 transition-colors h-[72px]">
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500"><Layers size={20} /></div>
          <span className="font-black text-slate-800 text-sm truncate">{p.name}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: p.color.replace(/\s/g, '').toLowerCase() }}></div>
          <span className="text-xs font-bold text-slate-500">{p.color}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className={`text-base font-semibold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{p.stock} pcs</span>
      </td>
      <td className="px-8 py-5">
        <span className="text-sm font-medium text-slate-300 uppercase">{p.threshold} Threshold</span>
      </td>
      <td className="px-8 py-5">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
          isLow ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
        }`}>
          {isLow ? <AlertTriangle size={12} className="mr-1.5" /> : <CheckCircle size={12} className="mr-1.5" />}
          {isLow ? 'Restock Needed' : 'Healthy'}
        </span>
      </td>
    </tr>
  );
});

export const HijabInventory: React.FC = () => {
  const { hijabProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColor, setFilterColor] = useState('All Colors');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const filteredProducts = useMemo(() => {
    return hijabProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesColor = filterColor === 'All Colors' || p.color === filterColor;
      const isLow = p.stock < p.threshold;
      const matchesStatus = filterStatus === 'All Status' || 
                           (filterStatus === 'Good Stock' && !isLow) || 
                           (filterStatus === 'Low Stock' && isLow);
      
      return matchesSearch && matchesColor && matchesStatus;
    });
  }, [hijabProducts, searchTerm, filterColor, filterStatus]);

  const availableColors = useMemo(() => 
    ['All Colors', ...new Set(hijabProducts.map(p => p.color))]
  , [hijabProducts]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <Layers className="text-slate-900" size={24} />
            Hijab Inventory
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-9">Manage your product stock levels and safety limits</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Product SKU..." 
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none w-full focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Good Stock">Good Stock</option>
            <option value="Low Stock">Low Stock</option>
          </select>
        </div>
      </div>

      <ViewportAware placeholderHeight="400px" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase tracking-[0.2em] border-b">
                <th className="px-8 py-5">Product SKU</th>
                <th className="px-8 py-5">Color Spec</th>
                <th className="px-8 py-5">Current Stock</th>
                <th className="px-8 py-5">Safety Limit</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-40">No matching products found</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <HijabRow key={p.id} p={p} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </ViewportAware>
    </div>
  );
};
