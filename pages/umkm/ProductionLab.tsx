
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Hammer, Layers, Plus, X, AlertTriangle, ShieldCheck, Ruler } from 'lucide-react';

export const ProductionLab: React.FC = () => {
  const { umkmFabrics, hijabProducts, addHijabProduct, produceExistingHijab } = useApp();
  
  const [productionType, setProductionType] = useState<'existing' | 'new'>('existing');
  
  // States for Restock (Existing SKU)
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQty, setRestockQty] = useState(0);

  // States for New Product
  const [newName, setNewName] = useState('');
  const [selectedFabricId, setSelectedFabricId] = useState('');
  const [newQty, setNewQty] = useState(0);
  const [threshold, setThreshold] = useState(20);

  const FABRIC_PER_UNIT = 1.5;

  // Validation Helpers
  const getSelectedExistingProduct = () => hijabProducts.find(p => p.id === selectedProductId);
  const getAvailableFabricForExisting = () => {
    const product = getSelectedExistingProduct();
    return umkmFabrics.find(f => f.fabricId === product?.fabricId);
  };

  const getSelectedFabricForNew = () => umkmFabrics.find(f => f.fabricId === selectedFabricId);

  const isExistingProductionValid = () => {
    const fabric = getAvailableFabricForExisting();
    return fabric && restockQty > 0 && fabric.quantity >= (restockQty * FABRIC_PER_UNIT);
  };

  const isNewProductionValid = () => {
    const fabric = getSelectedFabricForNew();
    return fabric && newQty > 0 && newName && fabric.quantity >= (newQty * FABRIC_PER_UNIT);
  };

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = getSelectedExistingProduct();
    if (!product) return;
    try {
      await produceExistingHijab(product.id, restockQty, restockQty * FABRIC_PER_UNIT);
      alert('Production batch processed successfully!');
      setSelectedProductId('');
      setRestockQty(0);
    } catch (err: any) {
      alert(err.message || 'Production failed.');
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fabric = getSelectedFabricForNew();
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
      setNewName('');
      setSelectedFabricId('');
      setNewQty(0);
    } catch (err: any) {
      alert(err.message || 'Production failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Production Lab</h2>
          <p className="text-indigo-100 text-sm font-medium opacity-80">Transform raw materials into premium hijab SKUs.</p>
        </div>
        <div className="flex bg-white/10 backdrop-blur p-1.5 rounded-2xl border border-white/20">
          <button 
            onClick={() => setProductionType('existing')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${productionType === 'existing' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/5'}`}
          >
            Restock Batch
          </button>
          <button 
            onClick={() => setProductionType('new')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${productionType === 'new' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/5'}`}
          >
            New Product Lab
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
        {productionType === 'existing' ? (
          <form onSubmit={handleExistingSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Active SKU</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">-- Select Product --</option>
                  {hijabProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.color})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Produce Amount (pcs)</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {selectedProductId && (
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Material Efficiency Report</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Ruler size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Available: <span className="text-indigo-600">{getAvailableFabricForExisting()?.quantity || 0}m</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Needed: <span className="text-indigo-600">{(restockQty * FABRIC_PER_UNIT).toFixed(1)}m</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">{(restockQty * FABRIC_PER_UNIT).toFixed(1)}m To Use</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">1.5m per unit standard</p>
                  </div>
                </div>

                {selectedProductId && restockQty > 0 && !isExistingProductionValid() && (
                   <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                     <AlertTriangle size={20} />
                     <div>
                       <p className="text-[10px] font-black uppercase">Insufficient Materials</p>
                       <p className="text-[11px] font-medium">Please order more fabric from suppliers to fulfill this production batch.</p>
                     </div>
                   </div>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={!isExistingProductionValid()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40"
            >
              Start Batch Production
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Design Name / SKU</label>
                  <input 
                    type="text"
                    placeholder="e.g. Summer Edition Pashmina"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Material</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    value={selectedFabricId}
                    onChange={(e) => setSelectedFabricId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Fabric from Warehouse --</option>
                    {umkmFabrics.map(uf => <option key={uf.fabricId} value={uf.fabricId}>{uf.name} ({uf.color}) - {uf.quantity}m available</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Batch Qty (pcs)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Safety Threshold (pcs)</label>
                  <input 
                    type="number"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 text-sm"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {selectedFabricId && newQty > 0 && !isNewProductionValid() && (
                 <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                   <AlertTriangle size={20} />
                   <div>
                     <p className="text-[10px] font-black uppercase">Insufficient Warehouse Stock</p>
                     <p className="text-[11px] font-medium">You need {(newQty * FABRIC_PER_UNIT).toFixed(1)}m of this fabric, but only {getSelectedFabricForNew()?.quantity}m is available.</p>
                   </div>
                 </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={!isNewProductionValid()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40"
            >
              Confirm Design & Launch Production
            </button>
          </form>
        )}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          <ShieldCheck size={14} /> Quality Verified Workspace
        </div>
      </div>
    </div>
  );
};
