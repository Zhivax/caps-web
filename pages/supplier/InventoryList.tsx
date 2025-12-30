
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Edit3, Trash2, Check, X, Search, Package as InvIcon } from 'lucide-react';

export const InventoryList: React.FC = () => {
  const { fabrics, user, updateFabric } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  const myFabrics = fabrics.filter(f => 
    f.supplierId === user?.id && 
    (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (id: string, currentStock: number, currentPrice: number) => {
    setEditingId(id);
    setEditStock(currentStock);
    setEditPrice(currentPrice);
  };

  const handleSave = (id: string) => {
    updateFabric(id, { stock: editStock, pricePerUnit: editPrice });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <InvIcon className="text-indigo-600" size={24} />
            Material Inventory
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">Manage your listed materials and warehouse stock</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none w-full focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-xs shadow-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b">
              <th className="px-8 py-5">Fabric Specs</th>
              <th className="px-8 py-5">Color</th>
              <th className="px-8 py-5">Price (Rp)</th>
              <th className="px-8 py-5">Available Stock</th>
              <th className="px-8 py-5 text-right">Quick Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {myFabrics.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic font-medium">No materials found in inventory.</td>
              </tr>
            ) : (
              myFabrics.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors h-[80px]">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><Package size={20} /></div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{f.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: f.color.replace(/\s/g, '').toLowerCase() }}></div>
                      <span className="text-xs font-bold text-slate-600">{f.color}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {editingId === f.id ? (
                      <input 
                        type="number" 
                        className="w-28 px-3 py-2 bg-white border-2 border-indigo-200 rounded-xl outline-none font-bold text-xs"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-800">Rp {f.pricePerUnit.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {editingId === f.id ? (
                      <input 
                        type="number" 
                        className="w-20 px-3 py-2 bg-white border-2 border-indigo-200 rounded-xl outline-none font-bold text-xs"
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                      />
                    ) : (
                      <span className={`text-sm font-black ${f.stock < 20 ? 'text-rose-600' : 'text-slate-900'}`}>{f.stock}m</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === f.id ? (
                        <>
                          <button onClick={() => handleSave(f.id)} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all"><X size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(f.id, f.stock, f.pricePerUnit)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"><Edit3 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
