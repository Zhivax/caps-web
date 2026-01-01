
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Ruler, 
  Plus, 
  Layers, 
  Search, 
  X, 
  Hammer, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

export const RawMaterials: React.FC = () => {
  const { umkmFabrics, hijabProducts, addHijabProduct, produceExistingHijab } = useApp();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Materials');
  const [filterColor, setFilterColor] = useState('All Colors');

  // Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Form States
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQty, setRestockQty] = useState(0);
  const [newName, setNewName] = useState('');
  const [selectedFabricId, setSelectedFabricId] = useState('');
  const [newQty, setNewQty] = useState(0);
  const [threshold, setThreshold] = useState(20);

  const FABRIC_PER_UNIT = 1.5;

  // Search & Filtering Logic (Cascading)
  const filteredMaterials = useMemo(() => {
    return umkmFabrics.filter(uf => {
      const matchesSearch = uf.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All Materials' || uf.name.includes(filterType);
      const matchesColor = filterColor === 'All Colors' || uf.color === filterColor;
      return matchesSearch && matchesType && matchesColor;
    });
  }, [umkmFabrics, searchTerm, filterType, filterColor]);

  const availableTypes = useMemo(() => {
    const relevant = umkmFabrics.filter(uf => filterColor === 'All Colors' || uf.color === filterColor);
    return ['All Materials', ...new Set(relevant.map(uf => uf.name.split(' ')[0]))]; 
  }, [umkmFabrics, filterColor]);

  const availableColors = useMemo(() => {
    const relevant = umkmFabrics.filter(uf => filterType === 'All Materials' || uf.name.includes(filterType));
    return ['All Colors', ...new Set(relevant.map(uf => uf.color))];
  }, [umkmFabrics, filterType]);

  // Production Handlers
  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = hijabProducts.find(p => p.id === selectedProductId);
    if (!product) return;
    try {
      await produceExistingHijab(product.id, restockQty, restockQty * FABRIC_PER_UNIT);
      alert('Production batch processed successfully!');
      setIsRestockModalOpen(false);
      setSelectedProductId('');
      setRestockQty(0);
    } catch (err: any) {
      alert(err.message || 'Production failed.');
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fabric = umkmFabrics.find(f => f.fabricId === selectedFabricId);
    if (!fabric) return;
    try {
      await addHijabProduct({
        name: newName,
        color: fabric.color,
        stock: newQty,
        threshold: threshold,
        fabricId: fabric.fabricId
      }, newQty * FABRIC_PER_UNIT);
      alert('New SKU created and produced successfully!');
      setIsNewProductModalOpen(false);
      setNewName('');
      setSelectedFabricId('');
      setNewQty(0);
    } catch (err: any) {
      alert(err.message || 'Production failed.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <Package className="text-slate-900" size={24} />
            Raw Materials
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-9">Warehouse inventory and production processing center</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Raw Material..." 
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none w-full focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsRestockModalOpen(true)}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg text-xs font-medium uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              <Hammer size={16} /> Restock SKU
            </button>
            <button 
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> New Product
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase tracking-[0.2em] border-b">
              <th className="px-8 py-5">Material Description</th>
              <th className="px-8 py-5">Color Spec</th>
              <th className="px-8 py-5">Stock Length</th>
              <th className="px-8 py-5">Estimated Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-40 italic">
                  {umkmFabrics.length === 0 ? 'Warehouse is empty.' : 'No matching materials found.'}
                </td>
              </tr>
            ) : (
              filteredMaterials.map((uf) => {
                const estCap = Math.floor(uf.quantity / 1.5);
                return (
                  <tr key={uf.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"><Package size={20} /></div>
                        <span className="font-black text-slate-800 text-sm">{uf.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{uf.color}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Ruler size={14} className="text-slate-500" />
                        <span className="text-base font-semibold text-slate-900">{uf.quantity.toFixed(2)} meters</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-slate-500">
                        Approx. <span className="text-slate-800">{estCap} Hijabs</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Restock Batch */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 bg-slate-800 text-white flex justify-between items-center">
              <div>
                <h4 className="text-base font-semibold uppercase tracking-widest">Restock Batch</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Produce existing SKU items</p>
              </div>
              <button onClick={() => setIsRestockModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleExistingSubmit} className="p-10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Select Active SKU</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {hijabProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.color})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Production Amount (pcs)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {selectedProductId && restockQty > 0 && (
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs font-medium text-slate-400 uppercase mb-2">Efficiency Check</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">Material Needed:</span>
                    <span className="text-base font-semibold text-slate-900">{(restockQty * FABRIC_PER_UNIT).toFixed(1)}m</span>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={!selectedProductId || restockQty <= 0}
                className="w-full py-5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40"
              >
                Confirm & Start Production
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Product Lab */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h4 className="text-base font-semibold uppercase tracking-widest">New Product Lab</h4>
                <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80">Design & register new SKU</p>
              </div>
              <button onClick={() => setIsNewProductModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleNewSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Design Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Silk Edition 2.0"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Raw Material Source</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                    value={selectedFabricId}
                    onChange={(e) => setSelectedFabricId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Fabric --</option>
                    {umkmFabrics.map(uf => <option key={uf.fabricId} value={uf.fabricId}>{uf.name} ({uf.color})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Initial Batch (pcs)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Safety Threshold (pcs)</label>
                  <input 
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {selectedFabricId && newQty > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <p className="text-xs font-medium text-slate-500 uppercase">Consumption: <span className="text-slate-900">{(newQty * FABRIC_PER_UNIT).toFixed(1)}m</span></p>
                  < ShieldCheck size={16} className="text-slate-500" />
                </div>
              )}

              <button 
                type="submit"
                disabled={!newName || !selectedFabricId || newQty <= 0}
                className="w-full py-5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40"
              >
                Launch New Product Batch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
