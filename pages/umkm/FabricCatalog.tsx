

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Fabric } from '../../types';
import { 
  Search, 
  Package, 
  ShoppingCart, 
  Building2, 
  X,
  ShoppingCart as CatalogIcon
} from 'lucide-react';

export const FabricCatalog: React.FC = () => {
  const { fabrics, user, submitRequest } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterColor, setFilterColor] = useState('All Colors');
  const [filterSupplier, setFilterSupplier] = useState('All Suppliers');
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [requestQty, setRequestQty] = useState(1);
  const [requestNotes, setRequestNotes] = useState('');

  // Search logic: Strictly for fabric name only
  const filteredFabrics = fabrics.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === 'All Types' || f.type === filterType;
    const matchesColor = filterColor === 'All Colors' || f.color === filterColor;
    const matchesSupplier = filterSupplier === 'All Suppliers' || f.supplierName === filterSupplier;
    
    return matchesSearch && matchesType && matchesColor && matchesSupplier;
  });

  // Smart/Cascading Filters
  const availableTypes = useMemo(() => {
    const filteredForTypes = fabrics.filter(f => 
      (filterColor === 'All Colors' || f.color === filterColor) && 
      (filterSupplier === 'All Suppliers' || f.supplierName === filterSupplier)
    );
    return ['All Types', ...new Set(filteredForTypes.map(f => f.type))];
  }, [fabrics, filterColor, filterSupplier]);

  const availableColors = useMemo(() => {
    const filteredForColors = fabrics.filter(f => 
      (filterType === 'All Types' || f.type === filterType) && 
      (filterSupplier === 'All Suppliers' || f.supplierName === filterSupplier)
    );
    return ['All Colors', ...new Set(filteredForColors.map(f => f.color))];
  }, [fabrics, filterType, filterSupplier]);

  const availableSuppliers = useMemo(() => {
    const filteredForSuppliers = fabrics.filter(f => 
      (filterType === 'All Types' || f.type === filterType) && 
      (filterColor === 'All Colors' || f.color === filterColor)
    );
    return ['All Suppliers', ...new Set(filteredForSuppliers.map(f => f.supplierName))];
  }, [fabrics, filterType, filterColor]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFabric || !user) return;
    if (requestQty > selectedFabric.stock) {
      alert('Request quantity exceeds available stock!');
      return;
    }
    /* Passing supplierName from selectedFabric to satisfy FabricRequest interface requirements */
    submitRequest({
      umkmId: user.id,
      supplierId: selectedFabric.supplierId,
      supplierName: selectedFabric.supplierName,
      fabricId: selectedFabric.id,
      fabricName: selectedFabric.name,
      fabricColor: selectedFabric.color,
      quantity: requestQty,
      notes: requestNotes
    });
    setSelectedFabric(null);
    setRequestQty(1);
    setRequestNotes('');
    alert('Material request submitted to partner.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <CatalogIcon className="text-indigo-600" size={24} />
            Fabric Catalog
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">Browse and order materials from verified partners</p>
        </div>
      </div>

      {/* Top Bar with Search & Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search fabric name..." 
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none w-full focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            {availableSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredFabrics.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-24 text-center">
            <Package size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No fabrics match your search/filters</p>
            <button 
              onClick={() => { setFilterType('All Types'); setFilterColor('All Colors'); setFilterSupplier('All Suppliers'); setSearchTerm(''); }}
              className="mt-4 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              Reset All Filters
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFabrics.map(f => (
            <div key={f.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 flex flex-col group hover:shadow-xl transition-all">
              <div className="mb-4">
                <div className="text-[9px] text-slate-400 font-black flex items-center uppercase tracking-[0.2em] mb-1">
                  <Building2 size={12} className="mr-1.5" />{f.supplierName}
                </div>
                <p className="text-slate-800 font-black text-lg leading-tight">{f.name}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.type}</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: f.color.replace(/\s/g, '').toLowerCase() }}></div>
                  <span className="text-xs font-bold text-slate-500">{f.color}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${f.stock < 50 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {f.stock}m Available
                </span>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">Price / m</p>
                  <p className="font-black text-slate-900 text-xl">Rp {f.pricePerUnit.toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedFabric(f)} className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {selectedFabric && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-black text-[10px] uppercase tracking-widest">Order Material</h4>
              <button onClick={() => setSelectedFabric(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRequestSubmit} className="p-8 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Package size={20} /></div>
                  <div className="min-w-0">
                      <h5 className="font-black text-slate-800 text-xs truncate">{selectedFabric.name}</h5>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{selectedFabric.supplierName}</p>
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (meters)</label>
                  <input 
                      type="number" 
                      min="1" 
                      max={selectedFabric.stock}
                      value={requestQty}
                      onChange={(e) => setRequestQty(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                      required
                  />
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex justify-between items-end">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Grand Total</p>
                  <p className="text-xl font-black text-indigo-600">Rp {(selectedFabric.pricePerUnit * requestQty).toLocaleString()}</p>
              </div>

              <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                  Submit Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};