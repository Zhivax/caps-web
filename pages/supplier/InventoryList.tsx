
import React, { useState, memo, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Fabric } from '../../types';
import { Package, Edit3, Check, X, Search, Package as InvIcon } from 'lucide-react';
import { ViewportAware } from '../../components/ViewportAware';

const InventoryRow = memo(({ 
  f, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}: { 
  f: Fabric; 
  isEditing: boolean;
  onEdit: (f: Fabric) => void;
  onSave: (id: string, stock: number, price: number) => void;
  onCancel: () => void;
}) => {
  const [editStock, setEditStock] = useState(f.stock);
  const [editPrice, setEditPrice] = useState(f.pricePerUnit);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors h-[80px]">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500"><Package size={20} /></div>
          <div>
            <p className="text-sm font-medium text-slate-800">{f.name}</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{f.type}</p>
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
        {isEditing ? (
          <input 
            type="number" 
            className="w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-xs"
            value={editPrice}
            onChange={(e) => setEditPrice(Number(e.target.value))}
          />
        ) : (
          <span className="text-base font-semibold text-slate-800">Rp {f.pricePerUnit.toLocaleString()}</span>
        )}
      </td>
      <td className="px-8 py-5">
        {isEditing ? (
          <input 
            type="number" 
            className="w-20 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-xs"
            value={editStock}
            onChange={(e) => setEditStock(Number(e.target.value))}
          />
        ) : (
          <span className={`text-base font-semibold ${f.stock < 20 ? 'text-red-600' : 'text-slate-900'}`}>{f.stock}m</span>
        )}
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button onClick={() => onSave(f.id, editStock, editPrice)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md active:scale-95"><Check size={16} /></button>
              <button onClick={onCancel} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all active:scale-95"><X size={16} /></button>
            </>
          ) : (
            <button onClick={() => onEdit(f)} className="p-2 text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-all shadow-sm active:scale-95"><Edit3 size={16} /></button>
          )}
        </div>
      </td>
    </tr>
  );
});

export const InventoryList: React.FC = () => {
  const { fabrics, user, updateFabric } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const myFabrics = useMemo(() => 
    fabrics.filter(f => 
      f.supplierId === user?.id && 
      (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.type.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [fabrics, user?.id, searchTerm]);

  const handleSave = useCallback((id: string, stock: number, price: number) => {
    updateFabric(id, { stock, pricePerUnit: price });
    setEditingId(null);
  }, [updateFabric]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <InvIcon className="text-slate-900" size={24} />
            Material Inventory
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-9">Manage your listed materials and warehouse stock</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-lg outline-none w-full focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-xs shadow-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <ViewportAware placeholderHeight="500px" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase tracking-[0.2em] border-b">
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
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs opacity-30">No materials found.</td>
                </tr>
              ) : (
                myFabrics.map((f) => (
                  <InventoryRow 
                    key={f.id} 
                    f={f} 
                    isEditing={editingId === f.id} 
                    onEdit={(fabric) => setEditingId(fabric.id)} 
                    onSave={handleSave} 
                    onCancel={() => setEditingId(null)} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </ViewportAware>
    </div>
  );
};
