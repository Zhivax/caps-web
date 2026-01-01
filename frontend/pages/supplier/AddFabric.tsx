
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, PlusCircle, ArrowLeft, ShieldCheck, PlusCircle as AddIcon } from 'lucide-react';

export const AddFabric: React.FC = () => {
  const { addFabric } = useApp();
  const [newFabric, setNewFabric] = useState({
    name: '',
    type: 'Voal',
    color: '',
    pricePerUnit: 0,
    stock: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFabric(newFabric);
    setNewFabric({ name: '', type: 'Voal', color: '', pricePerUnit: 0, stock: 0 });
    alert('Fabric added successfully!');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <AddIcon className="text-indigo-600" size={24} />
            New Fabric Listing
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">Add new materials to the B2B marketplace</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 bg-indigo-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <PlusCircle size={24} className="text-indigo-200" />
            <h3 className="text-xl font-black uppercase tracking-widest leading-none">Catalog Registration</h3>
          </div>
          <p className="text-indigo-100 text-xs font-medium opacity-80">List a new material type to the marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Name</label>
              <input 
                type="text"
                placeholder="e.g. Voal Ultrafine High Quality"
                value={newFabric.name}
                onChange={(e) => setNewFabric({...newFabric, name: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 transition-all text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Category</label>
                <select 
                  value={newFabric.type}
                  onChange={(e) => setNewFabric({...newFabric, type: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 transition-all text-sm"
                >
                  <option>Voal</option>
                  <option>Silk</option>
                  <option>Chiffon</option>
                  <option>Jersey</option>
                  <option>Cerruti</option>
                  <option>Katun</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color Spec</label>
                <input 
                  type="text"
                  placeholder="e.g. Sage Green"
                  value={newFabric.color}
                  onChange={(e) => setNewFabric({...newFabric, color: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price per Meter (Rp)</label>
                <input 
                  type="number"
                  value={newFabric.pricePerUnit}
                  onChange={(e) => setNewFabric({...newFabric, pricePerUnit: Number(e.target.value)})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 transition-all text-sm"
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock (m)</label>
                <input 
                  type="number"
                  value={newFabric.stock}
                  onChange={(e) => setNewFabric({...newFabric, stock: Number(e.target.value)})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800 transition-all text-sm"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
            <button 
              type="submit"
              className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Register Material
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <ShieldCheck size={14} /> Certified Secure Listing
          </div>
        </form>
      </div>
    </div>
  );
};
